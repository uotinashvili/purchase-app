import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestSchema } from '../../../core/models/schema.model';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-wizard-sidebar',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: 'wizard-sidebar.html',
  styleUrls: ['./wizard-sidebar.scss']
})
export class WizardSidebarComponent {
  @Input() schema!: RequestSchema;
  @Input() currentIndex!: number;
  @Input() formValid!: boolean;
  @Input() saveStatus!: 'saving' | 'saved' | 'error';
  @Output() sectionChange = new EventEmitter<number>();

  constructor(private router: Router) { }

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
    this.router.navigate(['/schemas']);
  }
}
