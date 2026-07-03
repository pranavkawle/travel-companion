import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Post } from '../../core/models/models';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <h1>Search Posts</h1>

      <div class="search-filters">
        <div class="filter-row">
          <input type="text" [(ngModel)]="originIata" placeholder="Origin (e.g., DEL)" class="iata-input" />
          <input type="text" [(ngModel)]="destinationIata" placeholder="Destination (e.g., SYD)" class="iata-input" />
        </div>
        <input type="date" [(ngModel)]="date" class="date-input" />

        <div class="filter-row">
          <select [(ngModel)]="postType" class="type-select">
            <option value="">All Types</option>
            <option value="SEEKING_ASSISTANCE">Seeking Assistance</option>
            <option value="OFFERING_ASSISTANCE">Offering Assistance</option>
          </select>
          <button class="search-btn" (click)="doSearch()">
            <i class="pi pi-search"></i> Search
          </button>
        </div>
      </div>

      <div class="results">
        @if (results().length === 0 && searched()) {
          <p class="no-results">No posts found. Try adjusting your filters.</p>
        }
        @for (post of results(); track post.id) {
          <div class="post-card" (click)="viewPost(post.id)">
            <div class="post-header">
              <span class="post-type" [class.seeking]="post.post_type === 'SeekingAssistance'">
                {{ post.post_type === 'SeekingAssistance' ? 'Seeking' : 'Offering' }}
              </span>
              <span class="post-date">{{ post.travel_date | date:'mediumDate' }}</span>
            </div>
            <div class="post-route">
              <span class="iata">{{ post.origin_iata }}</span>
              <i class="pi pi-arrow-right"></i>
              <span class="iata">{{ post.final_destination_iata }}</span>
            </div>
            <div class="post-langs">
              @for (lang of (post.post_type === 'SeekingAssistance' ? post.languages_needed : post.languages_spoken); track lang) {
                <span class="lang-chip">{{ lang }}</span>
              }
            </div>
            @if (post.notes) {
              <p class="post-notes">{{ post.notes }}</p>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-container { max-width: 480px; margin: 0 auto; padding: 1.5rem 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); margin: 0 0 1.5rem; }
    .search-filters {
      background: var(--tc-white);
      border-radius: var(--tc-radius-md);
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: var(--tc-shadow-sm);
    }
    .filter-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .iata-input, .date-input, .type-select {
      flex: 1; padding: 0.6rem; border: 1px solid var(--tc-gray-300);
      border-radius: var(--tc-radius-sm); font-size: 0.9rem; outline: none;
      &:focus { border-color: var(--tc-sky); }
    }
    .date-input { width: 100%; margin-bottom: 0.5rem; }
    .search-btn {
      padding: 0.6rem 1rem; background: var(--tc-navy); color: white;
      border: none; border-radius: var(--tc-radius-sm); font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 0.25rem; white-space: nowrap;
    }
    .results { display: flex; flex-direction: column; gap: 0.75rem; }
    .post-card {
      background: var(--tc-white);
      border-radius: var(--tc-radius-md);
      padding: 1rem;
      box-shadow: var(--tc-shadow-sm);
      cursor: pointer;
      transition: box-shadow 0.15s ease;
      &:hover { box-shadow: var(--tc-shadow-md); }
    }
    .post-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .post-type {
      padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      background: var(--tc-sky-light); color: var(--tc-navy);
      &.seeking { background: var(--tc-amber); color: var(--tc-navy); }
    }
    .post-date { font-size: 0.75rem; color: var(--tc-gray-400); }
    .post-route { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;
      .iata { font-size: 1.1rem; font-weight: 800; color: var(--tc-navy); }
      i { color: var(--tc-gray-400); font-size: 0.85rem; }
    }
    .post-langs { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.5rem; }
    .lang-chip { background: var(--tc-sand-dark); padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
    .post-notes { font-size: 0.8rem; color: var(--tc-gray-600); margin: 0; }
    .no-results { text-align: center; color: var(--tc-gray-400); padding: 2rem; }
  `],
})
export class Search implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  originIata = '';
  destinationIata = '';
  date = '';
  postType = '';
  results = signal<Post[]>([]);
  searched = signal(false);

  ngOnInit(): void {
    this.doSearch();
  }

  async doSearch() {
    const params: any = {};
    if (this.originIata) params.origin_iata = this.originIata.toUpperCase();
    if (this.destinationIata) params.destination_iata = this.destinationIata.toUpperCase();
    if (this.date) params.date = this.date;
    if (this.postType) params.post_type = this.postType;

    const result = await this.api.searchPosts(params).toPromise();
    this.results.set(result ?? []);
    this.searched.set(true);
  }

  viewPost(id: string) {
    this.router.navigateByUrl(`/posts/${id}`);
  }
}
