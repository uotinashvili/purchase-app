import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SchemaField } from '../../../core/models/schema.model';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule
  ],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss',
})
export class DynamicFieldComponent {
  @Input() field!: SchemaField;
  @Input() form!: FormGroup;

  get control() {
    return this.form.get(String(this.field.id)) as FormControl;
  }

  get isInvalid() {
    const c = this.control;
    return c.touched && c.invalid
  }

  onRadioChange() {
    this.control.markAsDirty();
  }

  trackByOption(_: number, option: string) {
    return option;
  }
}
