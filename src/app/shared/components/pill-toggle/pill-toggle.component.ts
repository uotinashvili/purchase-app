import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PillToggleComponent {
  @Input() options: PillToggleOption[] = [];
  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  select(v: string) {
    this.valueChange.emit(v);
  }

  trackByOption(_: number, option: { value: string }) {
    return option.value;
  }
}
