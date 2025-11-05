import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface PillToggleOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-pill-toggle',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './pill-toggle.component.html',
  styleUrls: ['./pill-toggle.component.scss'],
})
export class PillToggleComponent {
  @Input() options: PillToggleOption[] = [];
  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  select(v: string) {
    this.value = v;
    this.valueChange.emit(v);
  }
}
