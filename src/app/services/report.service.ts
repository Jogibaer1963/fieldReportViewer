import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { retry } from 'rxjs/operators';

export interface Report {
  _id: string;
  machine: string;
  report: string;
  engineHours: string;
  country?: string;
  status?: string;
  repairDate?: string | Date | null;
  partName?: string;
  grossLaborParts?: number | string;
  team?: string;
  failure?: string;
  remedy?: string;
  longTextExtra?: string;
  hideReport?: boolean; // wichtig: kein "hidden"
}

@Injectable({ providedIn: 'root' })

export class ReportService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/reports';  // Nur '/api' ohne '/reports'


  getReports(): Observable<Report[]> {
    console.log("getReports");
    return this.http.get<Report[]>(this.baseUrl).pipe(
      retry(2),
      map(list => Array.isArray(list) ? list : []),
      catchError(err => {
        console.error('getReports failed', err);
        return throwError(() => new Error('Failed to fetch reports: ' + (err?.message ?? err)));
      })
    );
  }



  // Fix: echte Aktualisierung am Server; nutze "hideReport" (nicht "hidden")
  updateHideReport(id: string, hideReport: boolean): Observable<Report> {
    return this.http
      .patch<Report>(`${this.baseUrl}/${encodeURIComponent(id)}/hide`, { hideReport })
      .pipe(
        catchError(err => {
          console.error('updateHideReport failed', err);
          // Detaillierte Fehlerinformationen für Debugging
          const statusInfo = err?.status ? `(${err.status} ${err.statusText})` : '';
          return throwError(() => new Error(`Failed to update report ${id} ${statusInfo}: ${err?.error?.message || err?.message || 'Unknown error'}`));
        })
      );
  }

  updateTeam(id: string, team: string): Observable<Report> {
    return this.http
      .patch<Report>(`${this.baseUrl}/${encodeURIComponent(id)}`, { team })
      .pipe(
        catchError(err => {
          console.error('updateTeam failed', err);
          const statusInfo = err?.status ? `(${err.status} ${err.statusText})` : '';
          return throwError(() => new Error(`Failed to update team ${statusInfo}: ${err?.error?.message || err?.message || 'Unknown error'}`));
        })
      );
  }
}
