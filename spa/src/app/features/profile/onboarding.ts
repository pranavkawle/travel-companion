import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="onboarding-container">
      <h1>Welcome to Travel Companion</h1>
      <p>Tell us about yourself to get started</p>

      <form (ngSubmit)="submit()">
        <div class="form-field">
          <label>First Name</label>
          <input type="text" name="firstName" [(ngModel)]="firstName" placeholder="Your first name" required />
        </div>

        <div class="form-field">
          <label>Languages you speak</label>
          <div class="lang-input">
            <input #langInput type="text" [ngModel]="langInputText" (ngModelChange)="onLangInput($event)" (keydown.enter)="addLang($event)" placeholder="Type a language code (e.g., hi, en, ta)" name="langInput" />
          </div>
          <div class="lang-chips">
            @for (lang of selectedLanguages(); track lang) {
              <span class="lang-chip">
                {{ lang }}
                <button type="button" (click)="removeLang(lang)">×</button>
              </span>
            }
          </div>
        </div>

        <button type="submit" class="submit-btn" [disabled]="!firstName.trim() || selectedLanguages().length === 0">
          Complete Registration
        </button>
      </form>
    </div>
  `,
  styles: [`
    .onboarding-container {
      max-width: 480px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); margin: 0 0 0.5rem; }
      p { color: var(--tc-gray-500); font-size: 0.9rem; margin: 0 0 2rem; }
    }
    .form-field {
      margin-bottom: 1.5rem;
      label { display: block; font-weight: 600; font-size: 0.85rem; color: var(--tc-gray-700); margin-bottom: 0.5rem; }
      input[type="text"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--tc-gray-300);
        border-radius: var(--tc-radius-sm);
        font-size: 0.95rem;
        outline: none;
        &:focus { border-color: var(--tc-sky); }
      }
    }
    .lang-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .lang-chip {
      background: var(--tc-navy);
      color: var(--tc-white);
      padding: 4px 12px;
      border-radius: var(--tc-radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      button { background: none; border: none; color: var(--tc-white); cursor: pointer; font-size: 1rem; line-height: 1; }
    }
    .submit-btn {
      width: 100%;
      padding: 0.875rem;
      background: var(--tc-navy);
      color: var(--tc-white);
      border: none;
      border-radius: var(--tc-radius-sm);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
      &:hover:not(:disabled) { background: var(--tc-navy-light); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
  `],
})
export class Onboarding {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  firstName = '';
  langInputText = '';
  selectedLanguages = signal<string[]>([]);

  onLangInput(value: string) {
    this.langInputText = value;
  }

  addLang(event: Event) {
    event.preventDefault();
    const code = this.langInputText.trim().toLowerCase();
    if (code && !this.selectedLanguages().includes(code)) {
      this.selectedLanguages.update(langs => [...langs, code]);
    }
    this.langInputText = '';
  }

  removeLang(lang: string) {
    this.selectedLanguages.update(langs => langs.filter(l => l !== lang));
  }

  async submit() {
    try {
      await this.auth.register(this.firstName.trim(), this.selectedLanguages());
      this.router.navigateByUrl('/home');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  }
}
