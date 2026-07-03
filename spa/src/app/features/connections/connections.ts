import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Connection } from '../../core/models/models';

@Component({
  selector: 'app-connections',
  imports: [CommonModule],
  template: `
    <div class="connections-container">
      <h1>Connections</h1>

      <div class="tabs">
        <button [class.active]="activeTab() === 'pending'" (click)="switchTab('pending')">Pending</button>
        <button [class.active]="activeTab() === 'accepted'" (click)="switchTab('accepted')">Accepted</button>
        <button [class.active]="activeTab() === 'all'" (click)="switchTab('all')">All</button>
      </div>

      <div class="connections-list">
        @if (connections().length === 0) {
          <p class="empty">No connections yet</p>
        }
        @for (conn of connections(); track conn.id) {
          <div class="conn-card">
            <div class="conn-info">
              <span class="conn-status" [class]="'status-' + conn.status">{{ conn.status }}</span>
              <span class="conn-date">{{ conn.created_at | date:'short' }}</span>
            </div>
            <div class="conn-actions">
              @if (conn.status === 'pending') {
                <button class="accept-btn" (click)="update(conn.id, 'accepted')">Accept</button>
                <button class="decline-btn" (click)="update(conn.id, 'declined')">Decline</button>
                <button class="block-btn" (click)="update(conn.id, 'blocked')">Block</button>
              }
              @if (conn.status === 'accepted') {
                <button class="msg-btn" (click)="goToMessages(conn.id)">Message</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .connections-container { max-width: 480px; margin: 0 auto; padding: 1.5rem 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); margin: 0 0 1rem; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tabs button { flex: 1; padding: 0.5rem; border: 1px solid var(--tc-gray-200); background: var(--tc-white); border-radius: var(--tc-radius-sm); font-size: 0.8rem; font-weight: 600; cursor: pointer; color: var(--tc-gray-500); }
    .tabs button.active { border-color: var(--tc-navy); background: var(--tc-navy); color: var(--tc-white); }
    .conn-card { background: var(--tc-white); border-radius: var(--tc-radius-sm); padding: 1rem; margin-bottom: 0.5rem; box-shadow: var(--tc-shadow-sm); }
    .conn-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .conn-status { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; }
    .status-pending { background: var(--tc-amber); color: var(--tc-navy); }
    .status-accepted { background: var(--tc-green); color: var(--tc-white); }
    .status-declined { background: var(--tc-gray-300); color: var(--tc-gray-600); }
    .status-blocked { background: var(--tc-coral); color: var(--tc-white); }
    .conn-date { font-size: 0.75rem; color: var(--tc-gray-400); }
    .conn-actions { display: flex; gap: 0.5rem; }
    .conn-actions button { flex: 1; padding: 0.5rem; border: none; border-radius: var(--tc-radius-sm); font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .accept-btn { background: var(--tc-green); color: var(--tc-white); }
    .decline-btn { background: var(--tc-gray-200); color: var(--tc-gray-600); }
    .block-btn { background: var(--tc-coral); color: var(--tc-white); }
    .msg-btn { background: var(--tc-sky); color: var(--tc-white); }
    .empty { text-align: center; color: var(--tc-gray-400); padding: 2rem; }
  `],
})
export class Connections implements OnInit {
  private api = inject(ApiService);

  activeTab = signal('pending');
  connections = signal<Connection[]>([]);

  ngOnInit(): void {
    this.load();
  }

  async load() {
    const status = this.activeTab() === 'all' ? undefined : this.activeTab();
    const result = await this.api.getConnections(status).toPromise();
    this.connections.set(result ?? []);
  }

  switchTab(tab: string) {
    this.activeTab.set(tab);
    this.load();
  }

  async update(id: string, status: string) {
    await this.api.updateConnection(id, status).toPromise();
    this.load();
  }

  goToMessages(_connectionId: string) {
    // Navigate to messages — the thread list will show the thread
    window.location.href = '/messages';
  }
}
