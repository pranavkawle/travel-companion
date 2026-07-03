import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Post } from '../../core/models/models';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule],
  template: `
    <div class="detail-container">
      <button class="back-btn" (click)="goBack()">← Back</button>

      @if (post()) {
        <div class="post-detail">
          <div class="post-header">
            <span class="post-type" [class.seeking]="post()?.post_type === 'SeekingAssistance'">
              {{ post()?.post_type === 'SeekingAssistance' ? 'Seeking Assistance' : 'Offering Assistance' }}
            </span>
            <span class="post-date">{{ post()?.travel_date | date:'mediumDate' }}</span>
          </div>

          <div class="route-display">
            <div class="route-endpoint">
              <span class="iata-code">{{ post()?.origin_iata }}</span>
              <span class="label">From</span>
            </div>
            <i class="pi pi-plane route-arrow"></i>
            <div class="route-endpoint">
              <span class="iata-code">{{ post()?.final_destination_iata }}</span>
              <span class="label">To</span>
            </div>
          </div>

          <div class="section">
            <h3>Language Information</h3>
            @if (post()?.post_type === 'SeekingAssistance') {
              <p class="lang-label">Languages needed:</p>
              <div class="lang-chips">
                @for (lang of post()?.languages_needed || []; track lang) {
                  <span class="lang-chip">{{ lang }}</span>
                }
              </div>
            } @else {
              <p class="lang-label">Languages spoken:</p>
              <div class="lang-chips">
                @for (lang of post()?.languages_spoken || []; track lang) {
                  <span class="lang-chip">{{ lang }}</span>
                }
              </div>
            }
          </div>

          @if (post()?.notes) {
            <div class="section">
              <h3>Notes</h3>
              <p class="post-notes">{{ post()?.notes }}</p>
            </div>
          }

          <div class="section">
            <h3>Flight Segments</h3>
            @for (seg of post()?.segments || []; track seg.id) {
              <div class="segment-card">
                <div class="seg-header">
                  <span class="seg-num">Segment {{ seg.segment_order }}</span>
                  <span class="seg-flight">{{ seg.flight_number }} · {{ seg.airline }}</span>
                </div>
                <div class="seg-route">
                  <span class="seg-iata">{{ seg.origin_iata }}</span>
                  <i class="pi pi-arrow-right"></i>
                  <span class="seg-iata">{{ seg.destination_iata }}</span>
                </div>
                <div class="seg-times">
                  <span>Dep: {{ seg.departure_time | date:'short' }}</span>
                  <span>Arr: {{ seg.arrival_time | date:'short' }}</span>
                </div>
              </div>
            }
          </div>

          <button class="connect-btn" (click)="connect()">
            <i class="pi pi-user-plus"></i> Request Connection
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 480px; margin: 0 auto; padding: 1rem 1rem 2rem; }
    .back-btn { background: none; border: none; color: var(--tc-gray-500); font-size: 0.85rem; cursor: pointer; margin-bottom: 0.75rem; }
    .post-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .post-type { padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: var(--tc-sky-light); color: var(--tc-navy); }
    .post-type.seeking { background: var(--tc-amber); }
    .post-date { font-size: 0.75rem; color: var(--tc-gray-400); }
    .route-display { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; background: var(--tc-white); border-radius: var(--tc-radius-md); padding: 1.5rem; box-shadow: var(--tc-shadow-sm); }
    .route-endpoint { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
    .iata-code { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); }
    .label { font-size: 0.7rem; color: var(--tc-gray-400); text-transform: uppercase; }
    .route-arrow { font-size: 1.25rem; color: var(--tc-sky); }
    .section { margin-bottom: 1.25rem; }
    .section h3 { font-size: 0.85rem; font-weight: 700; color: var(--tc-gray-700); margin: 0 0 0.5rem; }
    .lang-chips { display: flex; flex-wrap: wrap; gap: 0.25rem; }
    .lang-chip { background: var(--tc-sand-dark); padding: 3px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .post-notes { font-size: 0.85rem; color: var(--tc-gray-600); margin: 0; line-height: 1.5; }
    .segment-card { border: 1px solid var(--tc-gray-200); border-radius: var(--tc-radius-sm); padding: 0.75rem; margin-bottom: 0.5rem; }
    .seg-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .seg-num { font-weight: 600; font-size: 0.85rem; }
    .seg-flight { font-size: 0.8rem; color: var(--tc-gray-500); }
    .seg-route { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
    .seg-iata { font-weight: 700; font-size: 0.95rem; }
    .seg-times { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--tc-gray-500); }
    .connect-btn { width: 100%; padding: 0.85rem; background: var(--tc-navy); color: white; border: none; border-radius: var(--tc-radius-sm); font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.5rem; }
  `],
})
export class PostDetail implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  post = signal<Post | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadPost(id);
  }

  async loadPost(id: string) {
    const p = await this.api.getPost(id).toPromise();
    this.post.set(p ?? null);
  }

  async connect() {
    try {
      await this.api.createConnection(this.post()!.id).toPromise();
      this.router.navigateByUrl('/connections');
    } catch (err) {
      console.error('Connection failed:', err);
    }
  }

  goBack() {
    this.router.navigateByUrl('/search');
  }
}
