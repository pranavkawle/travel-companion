import { Component, inject, signal, OnInit, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Message } from '../../core/models/models';

@Component({
  selector: 'app-conversation',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="conversation-container">
      <div class="messages-area" #messagesArea>
        @for (msg of messages(); track msg.id) {
          <div class="msg-bubble" [class.mine]="msg.sender_id === myId()">
            <p>{{ msg.body }}</p>
            <span class="msg-time">{{ msg.sent_at | date:'shortTime' }}</span>
          </div>
        }
        @if (messages().length === 0) {
          <p class="empty">No messages yet. Say hello!</p>
        }
      </div>

      <div class="input-area">
        <input type="text" [(ngModel)]="draft" (keydown.enter)="send()" placeholder="Type a message…" />
        <button (click)="send()" [disabled]="!draft.trim()">
          <i class="pi pi-send"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .conversation-container { display: flex; flex-direction: column; height: calc(100vh - 64px); max-width: 480px; margin: 0 auto; }
    .messages-area { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .msg-bubble { max-width: 75%; padding: 0.6rem 0.875rem; border-radius: 16px; background: var(--tc-white); box-shadow: var(--tc-shadow-sm); align-self: flex-start; }
    .msg-bubble.mine { background: var(--tc-sky); color: var(--tc-white); align-self: flex-end; }
    .msg-bubble p { margin: 0; font-size: 0.85rem; line-height: 1.4; }
    .msg-time { font-size: 0.65rem; opacity: 0.6; display: block; margin-top: 2px; }
    .empty { text-align: center; color: var(--tc-gray-400); margin: auto; }
    .input-area { display: flex; gap: 0.5rem; padding: 0.75rem; background: var(--tc-white); border-top: 1px solid var(--tc-gray-200); }
    .input-area input { flex: 1; padding: 0.65rem; border: 1px solid var(--tc-gray-300); border-radius: 9999px; font-size: 0.9rem; outline: none; }
    .input-area input:focus { border-color: var(--tc-sky); }
    .input-area button { width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--tc-navy); color: var(--tc-white); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .input-area button:disabled { opacity: 0.4; }
  `],
})
export class Conversation implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  messages = signal<Message[]>([]);
  draft = '';
  threadId = '';
  private pollTimer: any;

  myId = () => this.auth.profile()?.id;

  ngOnInit(): void {
    this.threadId = this.route.snapshot.params['id'];
    this.loadMessages();
    // Poll every 5 seconds
    this.pollTimer = setInterval(() => this.loadMessages(), 5000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  async loadMessages() {
    const result = await this.api.getMessages(this.threadId).toPromise();
    this.messages.set(result ?? []);
  }

  async send() {
    const text = this.draft.trim();
    if (!text) return;
    this.draft = '';
    await this.api.sendMessage(this.threadId, text).toPromise();
    this.loadMessages();
  }
}
