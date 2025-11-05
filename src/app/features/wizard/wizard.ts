import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestSchema, SchemaField, SchemaSection } from '../../core/models/schema.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { WizardFooterComponent } from './footer/wizard-footer';
import { WizardSidebarComponent } from './sidebar/wizard-sidebar';
import { RequestService } from '../../core/services/request.service';
import { AutosaveService } from '../../core/services/auto-save.service';

@Component({
  selector: 'app-request-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
    WizardSidebarComponent,
    WizardFooterComponent
  ],
  templateUrl: './wizard.html',
  styleUrls: ['./wizard.scss']
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private autosave: AutosaveService
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

        this.forceSave(() => {
          this.autosave.setup(this.form, this.requestId, this.currentSection, s => this.saveStatus = s);
        });
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

    this.forceSave(() => {
      this.router.navigate(['/request', this.requestId, 'summary']);
    });
  }

  ngOnDestroy(): void {
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
  }

  private markAndFocusFirstInvalid() {
    Object.values(this.form.controls).forEach(c => (c as import('@angular/forms').AbstractControl).markAsTouched());
  }

  private forceSave(callBack: () => void) {
    this.autosave.forceSave(this.form, this.requestId, this.currentSection, s => this.saveStatus = s)
      .subscribe(() => {
        callBack();
      });
  }
}
