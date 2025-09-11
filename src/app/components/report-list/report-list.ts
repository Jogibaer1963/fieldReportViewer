import {ApplicationRef, Component, DestroyRef, inject, NgZone, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { ReportService, Report } from '../../services/report.service';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule, DatePipe, DecimalPipe, isPlatformBrowser} from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { PLATFORM_ID } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,     // Required for date pipe
    DecimalPipe,  // Required for number pipe
    MatExpansionModule,
    MatButtonModule
  ],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportList implements OnDestroy {
  reports: Report[] = [];          // <-- Add this explicit declaration

  /** true while the Socket.IO connection is up */
  socketConnected = false;
  private socket?: Socket;

  private readonly cdr = inject(ChangeDetectorRef);   // <-- add

  private readonly appRef = inject(ApplicationRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  constructor(private reportService: ReportService) {
    // Initialize immediately (no dependency on view children)
    if (isPlatformBrowser(this.platformId)) {
      this.loadReports();

      this.appRef.isStable
        .pipe(
          filter(Boolean),
          take(1),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.ngZone.runOutsideAngular(() => {
            if (this.socket && this.socket.connected) {
              return;
            }

            this.socket = io('/', {
              path: '/socket.io',
              transports: ['websocket', 'polling'],
              autoConnect: true,
              timeout: 10000,
              reconnection: true,
              reconnectionAttempts: Infinity,
              reconnectionDelay: 1000,
              reconnectionDelayMax: 5000,
            });

            this.socket.on('connect', () => {
              console.log('[socket] connected', this.socket?.id);
              this.socketConnected = true;
            });

            this.socket.on('connect_error', (err) => {
              console.error('[socket] connect_error', err);
            });

            this.socket.on('reconnect_attempt', (attempt) => {
              console.log('[socket] reconnect_attempt', attempt);
            });

            this.socket.on('disconnect', () => {
              this.socketConnected = false;
            });

            this.socket.on?.('reportHidden', (payload: { _id: string; hideReport: boolean }) => {
              if (payload.hideReport) {
                this.ngZone.run(() => {
                  this.reports = this.reports.filter(r => r._id !== payload._id);
                                  this.cdr.markForCheck();
                });
              }
            });


            // Listen for report updates (e.g., team changes, un-hide, etc.)
            this.socket.on?.('reportUpdated', (payload: Report) => {
              this.ngZone.run(() => {
                const idx = this.reports.findIndex(r => r._id === payload._id);
                if (idx >= 0) {
                  // If the updated report is hidden, remove it; otherwise immutably update
                  if ((payload as any).hideReport) {
                    this.reports = this.reports.filter(r => r._id !== payload._id);
                                      this.cdr.markForCheck();
                  } else {
                    this.reports = this.reports.map(r => r._id === payload._id ? { ...r, ...payload } : r);
                                      this.cdr.markForCheck();
                  }
                }
              });
            });

            // Generic "something changed" event (fallback: refresh)
            this.socket.on?.('reportsChanged', () => {
              this.ngZone.run(() => {
                this.loadReports();
              });
            });
          });
        });
    }
  }

  loadReports() {
    this.reportService.getReports().subscribe({
      next: (data) => {
        this.reports = (data ?? []).filter(r => !r.hideReport);
        this.cdr.markForCheck();                       // <-- notify view
      },
      error: (err) => console.error('Failed to load reports', err)
    });
  }

  // every other place you change `reports`
  onHideReport(report: Report) {
    // ... existing code ...
    this.reportService.updateHideReport(report._id, true).subscribe({
      next: (updated) => {
        this.reports = this.reports.filter(r => r._id !== updated._id);
        this.cdr.markForCheck();                       // <-- notify view
      },
      error: (err) => {
        console.error('Failed to hide report', err);
        // Do not clear the entire list; keep current state
      }
    });
  }

  onEditTeam(report: Report) {
    const current = report.team ?? '';          // <-- restore
    const team = prompt('Enter team name', current);
    if (team === null) { return; }
    const trimmed = team.trim();                // <-- restore
    if (!trimmed) { return; }

    if (!report._id) {
      console.error('Cannot update team: report id is missing');
      return;
    }

    this.reportService.updateTeam(report._id, trimmed).subscribe({
      next: (updated) => {
        this.reports = this.reports.map(r =>
          r._id === updated._id ? { ...r, team: updated.team } : r);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to update team', err)
    });
  }

  ngOnDestroy(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
        // Safely remove listeners and disconnect if socket exists
        this.socket?.off?.('reportHidden');
        this.socket?.off?.('reportCreated');
        this.socket?.off?.('reportUpdated');
        this.socket?.off?.('reportsChanged');
        this.socket?.off?.('connect');
        this.socket?.off?.('connect_error');
        this.socket?.off?.('reconnect_attempt');

        this.socket?.disconnect?.();
      }
    } catch (e) {
      console.error('Error during ReportList destroy:', e);
    } finally {
      this.socket = undefined;
    }
  }
}

