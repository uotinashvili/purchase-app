import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RequestSchema } from '../../../core/models/schema.model';
import { RequestService } from '../../../core/services/request.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './wizard-summary.html',
  styleUrls: ['./wizard-summary.scss']
})
export class SummaryComponent {
  schema!: RequestSchema;
  answers: Record<string, any> = {};
  schemaName!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
  ) {
    this.schemaName = this.route.snapshot.paramMap.get('schema')!;
    this.requestService.getSchemas().subscribe(all => {
      const s = all.find(x => x.id === this.schemaName);
      if (!s) { this.router.navigate(['/schemas']); return; }
      this.schema = s;
      this.answers = this.requestService.getAllAnswers(this.schemaName);
    });
  }

  getValue(fieldId: number | string) {
  return this.answers[String(fieldId)];
}

  displayAnswer(val: any) {
    if (val === undefined || val === null || val === '') return 'not answered';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  }

  reset() {
    this.requestService.resetRequest(this.schemaName);
    this.router.navigate(['/schemas']);
  }
}
