import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.auth.initAuth().then(() => {
      // Handle redirect after auth callback
      const redirectUrl = localStorage.getItem('redirect_url');
      if (redirectUrl) {
        localStorage.removeItem('redirect_url');
        this.router.navigateByUrl(redirectUrl);
      }
    });
  }

  get isLoading() { return this.auth.isLoading; }
  get isAuthenticated() { return this.auth.isAuthenticated; }
  get isAdmin() { return this.auth.isAdmin; }
}
