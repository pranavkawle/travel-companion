import { Injectable, inject, signal } from '@angular/core';
import { AuthService as Auth0AuthService } from '@auth0/auth0-angular';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from './api.service';
import { UserProfile } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth0 = inject(Auth0AuthService);
  private api = inject(ApiService);

  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(true);
  readonly profile = signal<UserProfile | null>(null);
  readonly isAdmin = signal(false);
  readonly accessToken = signal<string | null>(null);

  async initAuth(): Promise<void> {
    try {
      const authed = await this.auth0.isAuthenticated$.pipe(
        // Take first emission
      ).toPromise();
      this.isAuthenticated.set(authed ?? false);

      if (authed) {
        try {
          const token = await this.auth0.getAccessTokenSilently().toPromise();
          this.accessToken.set(token ?? null);

          if (token) {
            const decoded: any = jwtDecode(token);
            const roles = decoded['https://travel-companion.app/roles'] || [];
            this.isAdmin.set(roles.includes('admin'));
          }
        } catch (e) {
          console.error('Token error:', e);
        }

        await this.loadProfile();
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async login(): Promise<void> {
    this.auth0.loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/callback`,
        audience: 'https://api.travel-companion.app',
        scope: 'openid profile email phone',
      },
    });
  }

  async handleCallback(): Promise<void> {
    const target = await this.auth0.handleRedirectCallback().toPromise();
    const token = await this.auth0.getAccessTokenSilently().toPromise();
    this.accessToken.set(token ?? null);

    if (token) {
      const decoded: any = jwtDecode(token);
      const roles = decoded['https://travel-companion.app/roles'] || [];
      this.isAdmin.set(roles.includes('admin'));
    }

    await this.loadProfile();
    this.isAuthenticated.set(true);
  }

  async logout(): Promise<void> {
    this.auth0.logout({
      logoutParams: { returnTo: `${window.location.origin}` },
    });
  }

  async loadProfile(): Promise<void> {
    try {
      const profile = await this.api.getProfile().toPromise();
      this.profile.set(profile ?? null);
    } catch {
      this.profile.set(null);
    }
  }

  async register(firstName: string, languagesSpoken: string[]): Promise<UserProfile> {
    const profile = await this.api.register({
      first_name: firstName,
      languages_spoken: languagesSpoken,
    }).toPromise();
    this.profile.set(profile ?? null);
    return profile!;
  }
}
