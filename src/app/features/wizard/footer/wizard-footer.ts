import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-wizard-footer',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './wizard-footer.html',
  styleUrls: ['./wizard-footer.scss']
})
export class WizardFooterComponent {
  @Input() index!: number;
  @Input() isLastSection!: boolean;
  @Input() saveStatus!: 'saving' | 'saved' | 'error';
  @Input() formInvalid!: boolean;

  @Output() prevClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();
  @Output() submitClick = new EventEmitter<void>();

  onPrev() { this.prevClick.emit(); }

  onNext() { this.nextClick.emit(); }

  onSubmit() { this.submitClick.emit(); }
}
