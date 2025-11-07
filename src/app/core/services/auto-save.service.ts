import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  Observable,
  Subject,
  timer,
  of,
  catchError,
  finalize,
  takeUntil,
  debounceTime,
  concatMap,
  retryWhen,
  tap,
  EMPTY,
  mergeMap,
  throwError,
  map,
  switchMap,
} from 'rxjs';
import { RequestService } from './request.service';
import { SchemaSection } from '../models/schema.model';

@Injectable({ providedIn: 'root' })
export class AutosaveService {
  private stop$ = new Subject<void>();

  constructor(private requestService: RequestService) { }

  setup(
    form: FormGroup,
    requestId: string,
    section: SchemaSection,
    setStatus: (s: 'saving' | 'saved' | 'error') => void
  ) {
    this.stop$.next();
    this.stop$ = new Subject<void>();

    let lastSnapshot: Record<string, any> = { ...form.getRawValue() }; // ✅

    const sub = form.valueChanges.pipe(
      debounceTime(500),
      switchMap(() => {
        const now = { ...form.getRawValue() };
        const prev = lastSnapshot;

        const changedEntries = section.fields
          .map(f => String(f.id))
          .filter(key => String(prev[key]) !== String(now[key]))
          .map(key => [key, now[key]] as [string, any]);

        if (changedEntries.length === 0) return EMPTY;

        setStatus('saving');

        return this.saveFields(
          requestId,
          changedEntries,
          setStatus,
          'Autosave',
          lastSnapshot
        );
      }),

      takeUntil(this.stop$)
    ).subscribe();

    return () => {
      this.stop$.next();
      sub.unsubscribe();
    };
  }

  forceSave(
    form: FormGroup,
    requestId: string,
    section: SchemaSection,
    setStatus: (s: 'saving' | 'saved' | 'error') => void
  ): Observable<void> {
    this.stop$.next();
    setStatus('saving');

    const values = form.getRawValue() as Record<string, any>;
    const entries = section.fields
      .map(f => String(f.id))
      .map(key => [key, values[key]] as [string, any]);
    const localSnapshot: Record<string, any> = {};

    return this.saveFields(
      requestId,
      entries,
      setStatus,
      'ForceSave',
      localSnapshot
    );
  }

  private saveFields(
    requestId: string,
    entries: [string, any][],
    setStatus: (s: 'saving' | 'saved' | 'error') => void,
    context: string,
    snapshot: Record<string, any>
  ): Observable<void> {

    let hadError = false;
    let didSave = false;

    return of(...entries).pipe(
      concatMap(([key, val]) => {
        const qid = Number(key);

        return this.requestService.saveAnswer(requestId, qid, val).pipe(
          tap(() => {
            didSave = true;
            snapshot[key] = val;
          }),
          retryWhen(err$ =>
            err$.pipe(
              tap(() => this.logRetry()),
              mergeMap((err, attempt) => {
                if (attempt >= 2) return throwError(() => err);
                return timer(attempt === 0 ? 600 : 900);
              })
            )
          ),
          catchError(() => {
            hadError = true;
            console.error(`[${context}] Could not save. Will retry when next change happens.`);
            return of(null);
          })
        );
      }),
      finalize(() => {
        if (hadError && !didSave) setStatus('error');
        else setStatus('saved');
      }),
      map(() => void 0)
    );
  }

  stop() {
    this.stop$.next();
  }

  private logRetry() {
    console.warn('[Autosave] Saving retry...');
  }
}
