import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Thread } from '../../core/models/models';

@Component({
  selector: 'app-threads',
  imports: [CommonModule],
  template: `
    <div class="threads-container">
      <h1>Messages</h1>
      @if (threads().length === 0) {
        <p class="empty">No conversations yet</p>
      }
      @for (thread of threads(); track thread.id) {
        <div class="thread-card" (click)="openThread(thread.id)">
          <i class="pi pi-comment"></i>
          <div class="thread-info">
            <span class="thread-participant">{{ getOtherParticipant(thread) }}</span>
            <span class="thread-date">{{ thread.created_at | date:'short' }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .threads-container { max-width: 480px; margin: 0 auto; padding: 1.5rem 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); margin: 0 0 1rem; }
    .thread-card { display: flex; align-items: center; gap: 0.75rem; background: var(--tc-white); border-radius: var(--tc-radius-sm); padding: 1rem; margin-bottom: 0.5rem; cursor: pointer; box-shadow: var(--tc-shadow-sm); }
    .thread-card i { font-size: 1.25rem; color: var(--tc-sky); }
    .thread-info { display: flex; flex-direction: column; }
    .thread-participant { font-weight: 600; font-size: 0.9rem; }
    .thread-date { font-size: 0.75rem; color: var(--tc-gray-400); }
    .empty { text-align: center; color: var(--tc-gray-400); padding: 2rem; }
  `],
})
export class Threads implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  threads = signal<Thread[]>([]);

  ngOnInit(): void {
    this.load();
  }

  async load() {
    const result = await this.api.getThreads().toPromise();
    this.threads.set(result ?? []);
  }

  getOtherParticipant(thread: Thread): string {
    const myId = this.auth.profile()?.id;
    return thread.participant_a_id === myId ? thread.participant_b_id : thread.participant_a_id;
  }

  openThread(id: string) {
    this.router.navigateByUrl(`/messages/${id}`);
  }
}
