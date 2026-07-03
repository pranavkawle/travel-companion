import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-callback',
  imports: [CommonModule],
  template: `
    <div class="callback-screen">
      <i class="pi pi-spin pi-globe" style="font-size: 3rem; color: var(--tc-sky);"></i>
      <p>Completing sign in…</p>
    </div>
  `,
  styles: [`
    .callback-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 1rem;
      background: var(--tc-sand);
      p { color: var(--tc-navy); opacity: 0.7; }
    }
  `],
})
export class Callback {
  private auth = inject(AuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.handleCallback();
      const redirectUrl = localStorage.getItem('redirect_url') || '/home';
      localStorage.removeItem('redirect_url');
      this.router.navigateByUrl(redirectUrl);
    } catch (err) {
      console.error('Auth callback error:', err);
      this.router.navigateByUrl('/home');
    }
  }
}
