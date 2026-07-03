import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, RegisterRequest, UpdateUserRequest, Post, CreatePostRequest, Connection, Thread, Message, Airport, Flight, TravellerDetails, FlaggedUser, BlockedUser, ReportDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000';

  // Auth
  register(data: RegisterRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/auth/register`, data);
  }
  syncProfile(): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/auth/sync`, {});
  }

  // Users
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/me`);
  }
  updateProfile(data: UpdateUserRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.baseUrl}/users/me`, data);
  }
  deleteProfile(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/me`);
  }
  reportUser(userId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/${userId}/report`, { reason });
  }
  blockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/users/${userId}/block`, {});
  }
  getBlockedUsers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/users/blocked`);
  }
  unblockUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/blocked/${userId}`);
  }

  // Posts
  createPost(data: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(`${this.baseUrl}/posts`, data);
  }
  searchPosts(params: {
    origin_iata?: string; destination_iata?: string; date?: string;
    languages?: string[]; post_type?: string; page?: number; page_size?: number;
  }): Observable<Post[]> {
    let q = '';
    const parts: string[] = [];
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        v.forEach(x => parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(x)}`));
      } else {
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      }
    }
    q = parts.length ? '?' + parts.join('&') : '';
    return this.http.get<Post[]>(`${this.baseUrl}/posts/search${q}`);
  }
  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/posts/${id}`);
  }
  updatePost(id: string, data: { notes?: string; is_active?: boolean }): Observable<Post> {
    return this.http.patch<Post>(`${this.baseUrl}/posts/${id}`, data);
  }
  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/posts/${id}`);
  }
  getPostMatches(id: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/posts/${id}/matches`);
  }

  // Connections
  createConnection(postId: string): Observable<Connection> {
    return this.http.post<Connection>(`${this.baseUrl}/posts/${postId}/connections`, {});
  }
  getConnections(status?: string): Observable<Connection[]> {
    const q = status ? `?status=${status}` : '';
    return this.http.get<Connection[]>(`${this.baseUrl}/connections${q}`);
  }
  updateConnection(id: string, status: string): Observable<Connection> {
    return this.http.patch<Connection>(`${this.baseUrl}/connections/${id}`, { status });
  }
  shareTravellerDetails(connectionId: string, data: { traveller_name: string; notes?: string }): Observable<TravellerDetails> {
    return this.http.post<TravellerDetails>(`${this.baseUrl}/connections/${connectionId}/traveller-details`, data);
  }

  // Messages
  getThreads(): Observable<Thread[]> {
    return this.http.get<Thread[]>(`${this.baseUrl}/messages/threads`);
  }
  getMessages(threadId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages/threads/${threadId}`);
  }
  sendMessage(threadId: string, body: string): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/messages/threads/${threadId}`, { body });
  }

  // Flights & Airports
  searchFlights(origin: string, dest: string, date: string): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.baseUrl}/flights/search?origin_iata=${origin}&destination_iata=${dest}&date=${date}`);
  }
  searchAirports(q: string): Observable<Airport[]> {
    return this.http.get<Airport[]>(`${this.baseUrl}/airports/search?q=${q}`);
  }

  // Admin
  getFlaggedUsers(): Observable<FlaggedUser[]> {
    return this.http.get<FlaggedUser[]>(`${this.baseUrl}/admin/users/flagged`);
  }
  getBlockedUsersAdmin(): Observable<BlockedUser[]> {
    return this.http.get<BlockedUser[]>(`${this.baseUrl}/admin/users/blocked`);
  }
  getReportsForUser(userId: string): Observable<ReportDto[]> {
    return this.http.get<ReportDto[]>(`${this.baseUrl}/admin/users/${userId}/reports`);
  }
  adminBlockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/users/${userId}/block`, {});
  }
  adminUnblockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/users/${userId}/unblock`, {});
  }
  dismissReports(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/users/${userId}/reports/dismiss`, {});
  }

  // Logs
  logClientError(data: { message: string; stack?: string; url?: string; userAgent?: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logs/client-error`, data);
  }
}
