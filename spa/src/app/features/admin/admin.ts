import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { FlaggedUser, BlockedUser, ReportDto } from '../../core/models/models';

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h1>Admin Panel</h1>

      <div class="tabs">
        <button [class.active]="tab() === 'flagged'" (click)="switchTab('flagged')">Flagged ({{ flagged().length }})</button>
        <button [class.active]="tab() === 'blocked'" (click)="switchTab('blocked')">Blocked ({{ blocked().length }})</button>
      </div>

      @switch (tab()) {
        @case ('flagged') {
          @if (flagged().length === 0) {
            <p class="empty">No flagged users</p>
          }
          @for (user of flagged(); track user.id) {
            <div class="user-card">
              <div class="user-info">
                <span class="user-name">{{ user.first_name }}</span>
                <span class="report-count">{{ user.report_count }} reports</span>
              </div>
              <div class="actions">
                <button class="view-btn" (click)="viewReports(user.id)">View Reports</button>
                <button class="block-btn" (click)="blockUser(user.id)">Block</button>
                <button class="dismiss-btn" (click)="dismiss(user.id)">Dismiss</button>
              </div>
            </div>
          }
        }
        @case ('blocked') {
          @if (blocked().length === 0) {
            <p class="empty">No blocked users</p>
          }
          @for (user of blocked(); track user.id) {
            <div class="user-card">
              <div class="user-info">
                <span class="user-name">{{ user.first_name }}</span>
                <span class="block-date">Blocked: {{ user.blocked_at | date:'short' }}</span>
              </div>
              <button class="unblock-btn" (click)="unblockUser(user.id)">Unblock</button>
            </div>
          }
        }
      }

      @if (reports().length > 0) {
        <div class="reports-panel">
          <h3>Reports</h3>
          <button class="close-reports" (click)="reports.set([])">Close</button>
          @for (report of reports(); track report.id) {
            <div class="report-item">
              <p>{{ report.reason }}</p>
              <small>{{ report.created_at | date:'short' }}</small>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container { max-width: 480px; margin: 0 auto; padding: 1.5rem 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); margin: 0 0 1rem; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tabs button { flex: 1; padding: 0.5rem; border: 1px solid var(--tc-gray-200); background: var(--tc-white); border-radius: var(--tc-radius-sm); font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .tabs button.active { border-color: var(--tc-navy); background: var(--tc-navy); color: var(--tc-white); }
    .user-card { background: var(--tc-white); border-radius: var(--tc-radius-sm); padding: 1rem; margin-bottom: 0.5rem; box-shadow: var(--tc-shadow-sm); display: flex; justify-content: space-between; align-items: center; }
    .user-name { font-weight: 600; font-size: 0.9rem; }
    .report-count, .block-date { font-size: 0.75rem; color: var(--tc-gray-400); }
    .actions { display: flex; gap: 0.25rem; }
    .actions button, .unblock-btn { padding: 0.35rem 0.6rem; border: none; border-radius: var(--tc-radius-sm); font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .view-btn { background: var(--tc-sky-light); color: var(--tc-navy); }
    .block-btn { background: var(--tc-coral); color: var(--tc-white); }
    .dismiss-btn { background: var(--tc-gray-200); color: var(--tc-gray-600); }
    .unblock-btn { background: var(--tc-green); color: var(--tc-white); }
    .empty { text-align: center; color: var(--tc-gray-400); padding: 2rem; }
    .reports-panel { margin-top: 1.5rem; background: var(--tc-white); border-radius: var(--tc-radius-md); padding: 1rem; box-shadow: var(--tc-shadow-sm); position: relative; }
    .reports-panel h3 { margin: 0 0 0.75rem; font-size: 0.95rem; }
    .close-reports { position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; }
    .report-item { border-bottom: 1px solid var(--tc-gray-100); padding: 0.5rem 0; }
    .report-item p { margin: 0; font-size: 0.85rem; }
    .report-item small { font-size: 0.7rem; color: var(--tc-gray-400); }
  `],
})
export class Admin implements OnInit {
  private api = inject(ApiService);

  tab = signal('flagged');
  flagged = signal<FlaggedUser[]>([]);
  blocked = signal<BlockedUser[]>([]);
  reports = signal<ReportDto[]>([]);

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.flagged.set((await this.api.getFlaggedUsers().toPromise()) ?? []);
    this.blocked.set((await this.api.getBlockedUsersAdmin().toPromise()) ?? []);
  }

  switchTab(t: string) { this.tab.set(t); }

  async viewReports(userId: string) {
    const r = await this.api.getReportsForUser(userId).toPromise();
    this.reports.set(r ?? []);
  }

  async blockUser(userId: string) {
    await this.api.adminBlockUser(userId).toPromise();
    this.load();
  }

  async unblockUser(userId: string) {
    await this.api.adminUnblockUser(userId).toPromise();
    this.load();
  }

  async dismiss(userId: string) {
    await this.api.dismissReports(userId).toPromise();
    this.load();
  }
}
