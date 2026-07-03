import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <header class="home-header">
        <h1>Travel Companion</h1>
        <p class="subtitle">Find language assistance on your flight</p>
      </header>

      <section class="quick-actions">
        <button class="action-card" (click)="createPost()">
          <i class="pi pi-plus-circle"></i>
          <span>Create Post</span>
        </button>
        <button class="action-card" (click)="search()">
          <i class="pi pi-search"></i>
          <span>Search Flights</span>
        </button>
      </section>

      @if (profile()) {
        <section class="profile-summary">
          <h2>Hello, {{ profile()?.first_name }}</h2>
          @if (!profile()?.mobile_verified) {
            <p class="warning">
              <i class="pi pi-exclamation-triangle"></i>
              Mobile not verified — some features may be limited
            </p>
          }
          @if (profile()?.languages_spoken?.length) {
            <div class="languages">
              <span>Languages:</span>
              @for (lang of profile()?.languages_spoken || []; track lang) {
                <span class="lang-chip">{{ lang }}</span>
              }
            </div>
          }
        </section>
      }

      <section class="info-section">
        <h2>How it works</h2>
        <div class="info-card">
          <div class="info-step">
            <span class="step-number">1</span>
            <p>Create a post seeking or offering language assistance</p>
          </div>
          <div class="info-step">
            <span class="step-number">2</span>
            <p>Find matching travelers on your flight</p>
          </div>
          <div class="info-step">
            <span class="step-number">3</span>
            <p>Connect and coordinate safely</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 480px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    .home-header {
      text-align: center;
      margin-bottom: 2rem;
      h1 {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--tc-navy);
        margin: 0;
      }
      .subtitle {
        color: var(--tc-gray-500);
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }
    }
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      background: var(--tc-white);
      border: 1px solid var(--tc-gray-200);
      border-radius: var(--tc-radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
      i { font-size: 1.5rem; color: var(--tc-sky); }
      span { font-weight: 600; color: var(--tc-navy); font-size: 0.85rem; }
      &:hover {
        border-color: var(--tc-sky);
        box-shadow: var(--tc-shadow-md);
      }
    }
    .profile-summary {
      background: var(--tc-white);
      border-radius: var(--tc-radius-md);
      padding: 1.25rem;
      margin-bottom: 2rem;
      box-shadow: var(--tc-shadow-sm);
      h2 {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 0.75rem;
      }
      .warning {
        color: var(--tc-amber);
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .languages {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        span:first-child { color: var(--tc-gray-500); }
      }
      .lang-chip {
        background: var(--tc-sand-dark);
        padding: 2px 8px;
        border-radius: var(--tc-radius-full);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--tc-navy);
      }
    }
    .info-section {
      h2 {
        font-size: 0.95rem;
        font-weight: 700;
        margin: 0 0 0.75rem;
        color: var(--tc-gray-700);
      }
    }
    .info-card {
      background: var(--tc-white);
      border-radius: var(--tc-radius-md);
      padding: 1rem;
      box-shadow: var(--tc-shadow-sm);
    }
    .info-step {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      &:not(:last-child) {
        border-bottom: 1px solid var(--tc-gray-100);
      }
      .step-number {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--tc-navy);
        color: var(--tc-white);
        font-size: 0.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      p { margin: 0; font-size: 0.85rem; color: var(--tc-gray-600); }
    }
  `],
})
export class Home {
  private auth = inject(AuthService);
  private router = inject(Router);

  get profile() { return this.auth.profile; }

  createPost() { this.router.navigateByUrl('/posts/create'); }
  search() { this.router.navigateByUrl('/search'); }
}
