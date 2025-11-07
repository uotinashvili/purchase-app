import { Injectable } from '@angular/core';
import { Observable, of, delay, map, throwError } from 'rxjs';
import { RequestSchema, SchemaSection, RequestId, QuestionId, SaveResult } from '../models/schema.model';
import { FieldType } from '../models/schema.model';
import schemaData from '../data/data.json';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private answers = new Map<RequestId, Map<string, any>>();
  private schemas: RequestSchema[] = (schemaData as any[]).map(schema => ({
    ...schema,
    sections: schema.sections.map((section: any) => ({
      ...section,
      fields: section.fields.map((field: any) => ({
        ...field,
        type: field.type as FieldType
      }))
    }))
  }));

  getSchemaList() {
    return this.schemas.map(s => ({
      value: s.id,
      label: s.title,
      icon: s.id === 'software-request' ? 'apps' : 'hardware'
    }));
  }

  // Simulate: GET /api/schemas
  getSchemas(): Observable<RequestSchema[]> {
    return of(this.schemas).pipe(delay(200));
  }

  // Simulate: PUT /api/requests/:id/question/:questionId
  saveAnswer(requestId: RequestId, questionId: QuestionId, value: any): Observable<SaveResult> {
    const latency = 600 + Math.floor(Math.random() * 401);
    const shouldFail = Math.random() < 0.15;
    const key = String(questionId);

    if (shouldFail) {
      return throwError(() => new Error('Mock save failed')).pipe(delay(latency));
    }

    return of({ ok: true as true, requestId, questionId, value }).pipe(
      delay(latency),
      map(res => {
        if (!this.answers.has(requestId)) this.answers.set(requestId, new Map());
        this.answers.get(requestId)!.set(key, value);
        return res;
      })
    );
  }

  getSavedForSection(requestId: RequestId, section: SchemaSection): Record<string, any> {
    const stored = this.answers.get(requestId);
    const result: Record<string, any> = {};
    if (!stored) return result;

    section.fields.forEach(f => {
      const key = String(f.id);
      if (stored.has(key)) result[key] = stored.get(key);
    });
    return result;
  }

  getAllAnswers(requestId: RequestId): Record<string, any> {
    const stored = this.answers.get(requestId);
    const result: Record<string, any> = {};

    if (!stored) return result;
    stored.forEach((v, k) => (result[k] = v));
    return result;
  }

  resetRequest(requestId: RequestId) {
    this.answers.delete(requestId);
  }
}
