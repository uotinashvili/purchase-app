import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { PillToggleComponent } from '../../shared/components/pill-toggle/pill-toggle.component';
import { RequestService } from '../../core/services/request.service';

@Component({
  selector: 'app-schema-selector',
  standalone: true,
  imports: [
    MatButtonModule,
    PillToggleComponent,
  ],
  templateUrl: './schema-selector.component.html',
  styleUrls: ['./schema-selector.component.scss'],
})
export class SchemaSelectionComponent implements OnInit {
  schema: string | null = null;
  schemaOptions: { value: string; label: string; icon?: string }[] = [];

  constructor(private router: Router, private requestService: RequestService) {}

  ngOnInit(): void {
    this.schemaOptions = this.requestService.getSchemaList();
  }

  onStart() {
    if (!this.schema) return;
    this.router.navigate(['/request', this.schema, 'section', 1]);
  }
}
