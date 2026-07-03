import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'callback',
    loadComponent: () => import('./features/auth/callback').then(m => m.Callback),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home').then(m => m.Home),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/onboarding').then(m => m.Onboarding),
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/search').then(m => m.Search),
  },
  {
    path: 'posts/create',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/create-post').then(m => m.CreatePost),
  },
  {
    path: 'posts/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/post-detail').then(m => m.PostDetail),
  },
  {
    path: 'connections',
    canActivate: [authGuard],
    loadComponent: () => import('./features/connections/connections').then(m => m.Connections),
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./features/messaging/threads').then(m => m.Threads),
  },
  {
    path: 'messages/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/messaging/conversation').then(m => m.Conversation),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
  },
];
