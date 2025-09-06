import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  _id: string;
  machine: string;
  country: string;
  report: string;
  status: string;
  engineHours: string;
  repairDate: string;
  partName: string;
  grossLaborParts: string;
  failure: string;
  remedy: string;
  longTextExtra: string;
  team: string;
}

@Injectable({
  providedIn: 'root'
})

export class ReportService {
  private apiUrl = 'http://localhost:5000/api/reports';

  constructor(private http: HttpClient) {}

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  updateTeam(_id: string, team: string): Observable<Report> {
    console.log(_id, team);
    return this.http.patch<Report>(`${this.apiUrl}/${_id}/team`, { team });
  }
}
