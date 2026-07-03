import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h1>Profile</h1>

      @if (profile()) {
        <div class="profile-card">
          <div class="form-field">
            <label>First Name</label>
            <input type="text" name="firstName" [(ngModel)]="editFirstName" />
          </div>

          <div class="form-field">
            <label>Languages Spoken</label>
            <div class="lang-chips">
              @for (lang of editLanguages(); track lang) {
                <span class="lang-chip">{{ lang }} <button type="button" (click)="removeLang(lang)">×</button></span>
              }
            </div>
            <input type="text" [(ngModel)]="newLang" (keydown.enter)="addLang($event)" placeholder="Add language code (e.g., hi)" class="lang-input" />
          </div>

          <div class="form-field toggle-field">
            <label>Email Notifications</label>
            <button class="toggle" [class.on]="!editOptOut" (click)="toggleNotifications()">
              <span class="toggle-knob"></span>
            </button>
          </div>

          <div class="status-section">
            <div class="status-item">
              <span>Mobile Verified</span>
              <span class="status-value" [class.verified]="profile()?.mobile_verified" [class.unverified]="!profile()?.mobile_verified">
                {{ profile()?.mobile_verified ? '✓ Yes' : 'No' }}
              </span>
            </div>
          </div>

          <button class="save-btn" (click)="save()">Save Changes</button>
          <button class="logout-btn" (click)="logout()">Sign Out</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container { max-width: 480px; margin: 0 auto; padding: 1.5rem 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); margin: 0 0 1.5rem; }
    .profile-card {
      background: var(--tc-white);
      border-radius: var(--tc-radius-md);
      padding: 1.5rem;
      box-shadow: var(--tc-shadow-sm);
    }
    .form-field { margin-bottom: 1.25rem; }
    .form-field label { display: block; font-weight: 600; font-size: 0.85rem; color: var(--tc-gray-700); margin-bottom: 0.5rem; }
    .form-field input[type="text"], .lang-input {
      width: 100%; padding: 0.65rem; border: 1px solid var(--tc-gray-300);
      border-radius: var(--tc-radius-sm); font-size: 0.9rem; outline: none;
      &:focus { border-color: var(--tc-sky); }
    }
    .lang-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
    .lang-chip { background: var(--tc-navy); color: var(--tc-white); padding: 3px 10px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .lang-chip button { background: none; border: none; color: var(--tc-white); cursor: pointer; font-size: 1rem; line-height: 1; }
    .toggle-field { display: flex; justify-content: space-between; align-items: center; }
    .toggle { width: 44px; height: 24px; border-radius: 9999px; background: var(--tc-gray-300); border: none; cursor: pointer; position: relative; transition: background 0.2s; padding: 0; }
    .toggle.on { background: var(--tc-green); }
    .toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: white; transition: transform 0.2s; }
    .toggle.on .toggle-knob { transform: translateX(20px); }
    .status-section { border-top: 1px solid var(--tc-gray-100); padding-top: 1rem; margin-bottom: 1.25rem; }
    .status-item { display: flex; justify-content: space-between; font-size: 0.85rem; }
    .status-value.verified { color: var(--tc-green); font-weight: 600; }
    .status-value.unverified { color: var(--tc-amber); }
    .save-btn { width: 100%; padding: 0.75rem; background: var(--tc-navy); color: white; border: none; border-radius: var(--tc-radius-sm); font-weight: 700; cursor: pointer; margin-bottom: 0.5rem; }
    .logout-btn { width: 100%; padding: 0.75rem; background: transparent; color: var(--tc-coral); border: 1px solid var(--tc-coral); border-radius: var(--tc-radius-sm); font-weight: 600; cursor: pointer; }
  `],
})
export class Profile implements OnInit {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  editFirstName = '';
  editLanguages = signal<string[]>([]);
  editOptOut = false;
  newLang = '';

  get profile() { return this.auth.profile; }

  ngOnInit(): void {
    const p = this.profile();
    if (p) {
      this.editFirstName = p.first_name;
      this.editLanguages.set([...p.languages_spoken]);
      this.editOptOut = p.notification_opt_out;
    }
  }

  addLang(event: Event) {
    event.preventDefault();
    const code = this.newLang.trim().toLowerCase();
    if (code && !this.editLanguages().includes(code)) {
      this.editLanguages.update(l => [...l, code]);
    }
    this.newLang = '';
  }

  removeLang(lang: string) {
    this.editLanguages.update(l => l.filter(x => x !== lang));
  }

  toggleNotifications() {
    this.editOptOut = !this.editOptOut;
  }

  async save() {
    const updated = await this.api.updateProfile({
      first_name: this.editFirstName,
      languages_spoken: this.editLanguages(),
      notification_opt_out: this.editOptOut,
    }).toPromise();
    if (updated) this.auth.profile.set(updated);
  }

  async logout() {
    await this.auth.logout();
  }
}
