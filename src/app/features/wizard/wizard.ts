import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestSchema, SchemaField, SchemaSection } from '../../core/models/schema.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { WizardFooterComponent } from './footer/wizard-footer';
import { WizardSidebarComponent } from './sidebar/wizard-sidebar';
import { RequestService } from '../../core/services/request.service';
import { AutosaveService } from '../../core/services/auto-save.service';
import { DynamicFieldComponent } from '../../shared/components/dynamic-field/dynamic-field.component';

@Component({
  selector: 'app-request-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    WizardSidebarComponent,
    WizardFooterComponent,
    DynamicFieldComponent
  ],
  templateUrl: './wizard.html',
  styleUrls: ['./wizard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestWizardComponent implements OnInit, OnDestroy {
  schema!: RequestSchema;
  currentSection!: SchemaSection;
  index = 1;
  isLastSection = false;
  requestId!: string;
  form = new FormGroup({});
  saveStatus: 'saving' | 'saved' | 'error' = 'saved';
  sidebarOpen = false;
  destroy$ = new Subject<void>();

  private cleanupAutosave: (() => void) | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private autosave: AutosaveService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const schema = params.get('schema')!;
          const section = Number(params.get('section') ?? '1');
          this.requestId = schema;
          this.index = Math.max(1, section);
          return this.requestService.getSchemas();
        })
      )
      .subscribe(all => {
        const schema = all.find(x => x.id === this.requestId);
        if (!schema) {
          this.router.navigate(['/schemas']);
          return;
        }

        this.schema = schema;
        const sections = this.schema.sections;

        if (this.index > sections.length) this.index = sections.length;
        this.isLastSection = this.index === sections.length;
        this.currentSection = sections[this.index - 1];

        this.buildForm(this.currentSection);

        this.cleanupAutosave = this.autosave.setup(
          this.form,
          this.requestId,
          this.currentSection,
          s => {
            this.saveStatus = s;
            this.cdr.markForCheck();
          }
        );
      });
  }

  navigateToSection(step: number) {
    this.sidebarOpen = false;

    this.forceSave(() => {
      this.router.navigate(['/request', this.requestId, 'section', step]);
    });
  }

  fcName(field: SchemaField): string {
    return String(field.id);
  }

  isInvalid(field: SchemaField): boolean {
    const ctrl = this.form.get(this.fcName(field));
    return !!ctrl && ctrl.touched && ctrl.invalid;
  }

  prev() {
    if (this.index === 1) return;

    this.forceSave(() => {
      this.router.navigate(['/request', this.requestId, 'section', this.index - 1]);
    });
  }

  next() {
    if (this.form.invalid) {
      this.markAndFocusFirstInvalid();
      return;
    }

    this.forceSave(() => {
      this.router.navigate(['/request', this.requestId, 'section', this.index + 1]);
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markAndFocusFirstInvalid();
      return;
    }

    if (this.cleanupAutosave) this.cleanupAutosave();

    this.autosave.forceSave(this.form, this.requestId, this.currentSection, s => {
      this.saveStatus = s;
      this.cdr.markForCheck();
    }).subscribe(() => {
      this.router.navigate(['/request', this.requestId, 'summary']);
    });
  }


  trackByField(_: number, field: SchemaField) {
    return field.id;
  }

  ngOnDestroy(): void {
    if (this.cleanupAutosave) this.cleanupAutosave();

    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(section: SchemaSection) {
    if (!section || !section.fields) return;

    Object.keys(this.form.controls).forEach(key => {
      this.form.removeControl(key);
    });

    section.fields.forEach(f => {
      const validators = f.required ? [Validators.required] : [];
      const initial = f.type === 'toggle' ? (f.default ?? false) : null;
      this.form.addControl(String(f.id), new FormControl(initial, validators));
    });

    const saved = this.requestService.getSavedForSection(this.requestId, section);
    Object.entries(saved).forEach(([key, value]) => {
      if (this.form.contains(key)) {
        this.form.get(key)!.setValue(value, { emitEvent: false });
      }
    });

    this.cdr.markForCheck();
  }

  private markAndFocusFirstInvalid() {
    Object.values(this.form.controls).forEach(c => (c as import('@angular/forms').AbstractControl).markAsTouched());
  }

  private forceSave(callBack: () => void) {
    if (this.cleanupAutosave) this.cleanupAutosave();

    this.autosave.forceSave(this.form, this.requestId, this.currentSection, s => {
      this.saveStatus = s;
      this.cdr.markForCheck();
    }).subscribe(() => {
      callBack();
      this.cdr.markForCheck();

      this.cleanupAutosave = this.autosave.setup(
        this.form,
        this.requestId,
        this.currentSection,
        s => {
          this.saveStatus = s;
          this.cdr.markForCheck();
        }
      );
    });
  }
}
