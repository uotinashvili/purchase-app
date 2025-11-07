import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestSchema } from '../../../core/models/schema.model';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { RequestService } from '../../../core/services/request.service';
import { AutosaveService } from '../../../core/services/auto-save.service';

@Component({
  selector: 'app-wizard-sidebar',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: 'wizard-sidebar.html',
  styleUrls: ['./wizard-sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardSidebarComponent {
  @Input() schema!: RequestSchema;
  @Input() currentIndex!: number;
  @Input() formValid!: boolean;
  @Input() saveStatus!: 'saving' | 'saved' | 'error';
  @Input() requestId!: string;

  @Output() sectionChange = new EventEmitter<number>();

  constructor(private router: Router, private requestService: RequestService, private autoSaveService: AutosaveService) { }

  canNavigateForward(): boolean {
    return this.formValid && this.saveStatus === 'saved';
  }

  onSelect(step: number) {
    if (step > this.currentIndex) {
      if (!this.canNavigateForward()) return;
    }

    this.sectionChange.emit(step);
  }

  goHome() {
    this.autoSaveService.stop();
    this.requestService.resetRequest(this.requestId);
    this.router.navigate(['/schemas']);
  }

  trackBySection(_: number, section: { id: string }) {
    return section.id;
  }
}
