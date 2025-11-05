import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, timer, switchMap, of, catchError, finalize, takeUntil, debounceTime } from 'rxjs';
import { RequestService } from './request.service';
import { SchemaSection } from '../models/schema.model';

@Injectable({ providedIn: 'root' })
export class AutosaveService {
  private stop$ = new Subject<void>();

  constructor(private requestService: RequestService) {}

  setup(form: FormGroup, requestId: string, section: SchemaSection, setStatus: (s: any) => void) {
    this.stop$.next();
    this.stop$ = new Subject<void>();

    return form.valueChanges.pipe(
      debounceTime(500),
      switchMap(() => {
        setStatus('saving');
        return this.requestService.saveSection(requestId, section, form.getRawValue()).pipe(
          catchError(() => {
            console.log('Autosave failed — retrying...');
            setStatus('error');
            return timer(1000).pipe(
              switchMap(() => {
                  console.log('Retry autosave...');
                  return this.requestService.saveSection(requestId, section, form.getRawValue())
                }
              ),
              catchError(() => {
                console.log('Retry also failed. Please change inputs value manually');
                return of(null)
              })
            );
          }),
          finalize(() => setStatus('saved'))
        );
      }),
      takeUntil(this.stop$)
    ).subscribe();
  }

  forceSave(form: FormGroup, requestId: string, section: SchemaSection, setStatus:(s:any)=>void): Observable<any> {
    this.stop$.next();
    setStatus('saving');

    return this.requestService.saveSection(requestId, section, form.getRawValue()).pipe(
      catchError(() => {
        console.log('Force save failed');
        return of(null);
      }),
      finalize(() => setStatus('saved'))
    );
  }
}
