import {ApplicationRef, Component, inject, NgZone, OnDestroy, OnInit} from '@angular/core';
import { ReportService, Report } from '../../services/report.service';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';



@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatButtonModule],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css']
})

export class ReportList implements OnInit, OnDestroy {
  reports: Report[] = [];
  private socket?: Socket;
  private readonly appRef = inject(ApplicationRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);



  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    console.log('ReportList component initialized');
    this.loadReports();

   // Socket verbinden (URL ggf. anpassen)
    if (isPlatformBrowser(this.platformId)) {
      this.appRef.isStable.subscribe((stable) => {
        if (stable) {
          // außerhalb der Angular-Zone verbinden, Events später wieder "reinholen"
          this.ngZone.runOutsideAngular(() => {
            this.socket = io('http://localhost:5000', {
              transports: ['websocket', 'polling'], // robuster als nur 'websocket'
              autoConnect: true,
            });

            this.socket.on('reportHidden', (payload: { _id: string; hideReport: boolean }) => {
              if (payload.hideReport) {
                // UI-Update in Angular-Zone ausführen
                this.ngZone.run(() => {
                  this.reports = this.reports.filter(r => r._id !== payload._id);
                });
              }
            });
          });
        }
      });
    }
  }


  ngOnDestroy(): void {
    this.socket?.off('reportHidden');
    this.socket?.disconnect();
  }


  loadReports() {
    console.log('Starting loadReports...');

    this.reportService.getReports().subscribe(data => {
      this.reports = (data ?? []).filter(r => !r.hideReport);
      console.log('Visible reports:', this.reports.length);
    });
  }



onHideReport(report: Report) {
    if (!report._id) {
      console.error('Cannot hide report: report id is missing');
      return;
    }
    this.reportService.updateHideReport(report._id, true).subscribe({
      next: (updated) => {
        // lokales Modell aktualisieren, damit UI sofort reagiert
        this.reports = this.reports.filter(r => r._id !== updated._id);
        // alternativ: aus Liste entfernen/ausblenden, je nach gewünschtem Verhalten
        // this.reports = this.reports.filter(r => r._id !== report._id);
      },
      error: (err) => {
        console.error('Failed to hide report', err);
        this.reports = [];

      }
    });
  }

  onEditTeam(report: Report) {
    const current = report.team ?? '';
    const team = prompt('Enter team name', current);
    if (team === null) return; // user cancelled
    const trimmed = team.trim();
    if (!trimmed) return;

    if (!report._id) {
      console.error('Cannot update team: report id is missing');
      return;
    }

    this.reportService.updateTeam(report._id, trimmed).subscribe({
      next: (updated) => {
        // Update the local item to reflect the change without full reload
        report.team = updated.team;
      },
      error: (err) => {
        console.error('Failed to update team', err);
        // Optionally show a UI notification/snackbar here
      }
    });
  }
}

