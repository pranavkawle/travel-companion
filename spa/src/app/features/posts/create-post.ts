import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PostSegment } from '../../core/models/models';

@Component({
  selector: 'app-create-post',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-container">
      <h1>Create Post</h1>

      <div class="step-indicator">
        <span [class.active]="step() === 1">1. Type</span>
        <span [class.active]="step() === 2">2. Route</span>
        <span [class.active]="step() === 3">3. Details</span>
        <span [class.active]="step() === 4">4. Flights</span>
      </div>

      @switch (step()) {
        @case (1) {
          <div class="form-card">
            <h2>What do you need?</h2>
            <button class="type-btn" [class.active]="postType() === 'SEEKING_ASSISTANCE'" (click)="postType.set('SEEKING_ASSISTANCE')">
              <i class="pi pi-question-circle"></i>
              <span>Seeking Assistance</span>
              <small>I need language help on my flight</small>
            </button>
            <button class="type-btn" [class.active]="postType() === 'OFFERING_ASSISTANCE'" (click)="postType.set('OFFERING_ASSISTANCE')">
              <i class="pi pi-check-circle"></i>
              <span>Offering Assistance</span>
              <small>I can help travelers with language</small>
            </button>

            @if (postType()) {
              <label class="checkbox-label">
                <input type="checkbox" [ngModel]="!posterIsTraveller" (ngModelChange)="posterIsTraveller = !$event" />
                Posting on behalf of someone else
              </label>
              @if (!posterIsTraveller) {
                <input type="text" [(ngModel)]="travellerRelationship" placeholder="Relationship (e.g., parent)" class="text-input" />
              }
            }
            <button class="next-btn" [disabled]="!postType()" (click)="next()">Next</button>
          </div>
        }
        @case (2) {
          <div class="form-card">
            <h2>Route Details</h2>
            <div class="form-field">
              <label>Origin Airport</label>
              <input type="text" [(ngModel)]="originIata" placeholder="e.g., DEL" class="text-input upper" maxlength="3" />
            </div>
            <div class="form-field">
              <label>Final Destination</label>
              <input type="text" [(ngModel)]="finalDestinationIata" placeholder="e.g., SYD" class="text-input upper" maxlength="3" />
            </div>
            <div class="form-field">
              <label>Travel Date</label>
              <input type="date" [(ngModel)]="travelDate" class="text-input" />
            </div>
            <div class="btn-row">
              <button class="back-btn" (click)="prev()">Back</button>
              <button class="next-btn" [disabled]="!originIata || !finalDestinationIata || !travelDate" (click)="next()">Next</button>
            </div>
          </div>
        }
        @case (3) {
          <div class="form-card">
            <h2>Language Details</h2>
            @if (postType() === 'SEEKING_ASSISTANCE') {
              <div class="form-field">
                <label>Languages Needed</label>
                <input type="text" [(ngModel)]="newLang" (keydown.enter)="addLang('needed', $event)" placeholder="Add language code" class="text-input" />
                <div class="lang-chips">
                  @for (lang of languagesNeeded(); track lang) {
                    <span class="lang-chip">{{ lang }} <button (click)="removeLang('needed', lang)">×</button></span>
                  }
                </div>
              </div>
            } @else {
              <div class="form-field">
                <label>Languages You Speak</label>
                <input type="text" [(ngModel)]="newLang" (keydown.enter)="addLang('spoken', $event)" placeholder="Add language code" class="text-input" />
                <div class="lang-chips">
                  @for (lang of languagesSpoken(); track lang) {
                    <span class="lang-chip">{{ lang }} <button (click)="removeLang('spoken', lang)">×</button></span>
                  }
                </div>
              </div>
            }
            <div class="form-field">
              <label>Notes (max 280 chars, publicly visible)</label>
              <textarea [(ngModel)]="notes" maxlength="280" rows="3" class="text-input" placeholder="Any additional info..."></textarea>
              <small>{{ notes.length }}/280</small>
            </div>
            <div class="btn-row">
              <button class="back-btn" (click)="prev()">Back</button>
              <button class="next-btn" (click)="next()">Next</button>
            </div>
          </div>
        }
        @case (4) {
          <div class="form-card">
            <h2>Flight Segments</h2>
            <p class="hint">Add at least one flight segment</p>

            @for (seg of segments(); track $index) {
              <div class="segment-card">
                <div class="seg-header">
                  <span>Segment {{ $index + 1 }}</span>
                  <button (click)="removeSegment($index)" class="remove-btn"><i class="pi pi-times"></i></button>
                </div>
                <div class="seg-row">
                  <input type="text" [(ngModel)]="seg.flight_number" placeholder="Flight #" class="text-input" />
                  <input type="text" [(ngModel)]="seg.airline" placeholder="Airline" class="text-input" />
                </div>
                <div class="seg-row">
                  <input type="text" [(ngModel)]="seg.origin_iata" placeholder="From" class="text-input upper" maxlength="3" />
                  <input type="text" [(ngModel)]="seg.destination_iata" placeholder="To" class="text-input upper" maxlength="3" />
                </div>
                <div class="seg-row">
                  <input type="datetime-local" [(ngModel)]="seg.departure_time" class="text-input" placeholder="Departure" />
                  <input type="datetime-local" [(ngModel)]="seg.arrival_time" class="text-input" placeholder="Arrival" />
                </div>
              </div>
            }

            <button class="add-seg-btn" (click)="addSegment()">
              <i class="pi pi-plus"></i> Add Segment
            </button>

            <div class="btn-row">
              <button class="back-btn" (click)="prev()">Back</button>
              <button class="next-btn" [disabled]="segments().length === 0" (click)="submit()">Create Post</button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .create-container { max-width: 480px; margin: 0 auto; padding: 1.5rem 1rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: var(--tc-navy); margin: 0 0 1rem; }
    .step-indicator { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.75rem; }
    .step-indicator span { padding: 4px 8px; border-radius: 9999px; background: var(--tc-gray-200); color: var(--tc-gray-500); }
    .step-indicator span.active { background: var(--tc-navy); color: var(--tc-white); }
    .form-card { background: var(--tc-white); border-radius: var(--tc-radius-md); padding: 1.5rem; box-shadow: var(--tc-shadow-sm); }
    h2 { font-size: 1.1rem; font-weight: 700; margin: 0 0 1rem; color: var(--tc-navy); }
    .type-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; width: 100%; padding: 1rem; margin-bottom: 0.5rem; border: 2px solid var(--tc-gray-200); border-radius: var(--tc-radius-sm); background: var(--tc-white); cursor: pointer; text-align: left; }
    .type-btn.active { border-color: var(--tc-sky); background: var(--tc-sand); }
    .type-btn i { font-size: 1.25rem; color: var(--tc-sky); }
    .type-btn span { font-weight: 700; font-size: 0.95rem; }
    .type-btn small { font-size: 0.75rem; color: var(--tc-gray-500); }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; margin-top: 1rem; cursor: pointer; }
    .form-field { margin-bottom: 1rem; }
    .form-field label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.25rem; }
    .text-input { width: 100%; padding: 0.65rem; border: 1px solid var(--tc-gray-300); border-radius: var(--tc-radius-sm); font-size: 0.9rem; outline: none; }
    .text-input.upper { text-transform: uppercase; }
    .text-input:focus { border-color: var(--tc-sky); }
    textarea.text-input { resize: vertical; }
    .lang-chips { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem; }
    .lang-chip { background: var(--tc-navy); color: white; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .lang-chip button { background: none; border: none; color: white; cursor: pointer; }
    .btn-row { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .back-btn { flex: 1; padding: 0.65rem; background: transparent; border: 1px solid var(--tc-gray-300); border-radius: var(--tc-radius-sm); font-weight: 600; cursor: pointer; color: var(--tc-gray-600); }
    .next-btn { flex: 1; padding: 0.65rem; background: var(--tc-navy); color: white; border: none; border-radius: var(--tc-radius-sm); font-weight: 700; cursor: pointer; }
    .next-btn:disabled { opacity: 0.4; }
    .hint { font-size: 0.8rem; color: var(--tc-gray-500); margin: 0 0 1rem; }
    .segment-card { border: 1px solid var(--tc-gray-200); border-radius: var(--tc-radius-sm); padding: 0.75rem; margin-bottom: 0.5rem; }
    .seg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.85rem; }
    .remove-btn { background: none; border: none; color: var(--tc-coral); cursor: pointer; }
    .seg-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .seg-row .text-input { flex: 1; }
    .add-seg-btn { width: 100%; padding: 0.65rem; background: transparent; border: 1px dashed var(--tc-gray-300); border-radius: var(--tc-radius-sm); color: var(--tc-gray-500); cursor: pointer; font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.25rem; }
  `],
})
export class CreatePost {
  private api = inject(ApiService);
  private router = inject(Router);

  step = signal(1);
  postType = signal('');
  posterIsTraveller = true;
  travellerRelationship = '';
  originIata = '';
  finalDestinationIata = '';
  travelDate = '';
  languagesNeeded = signal<string[]>([]);
  languagesSpoken = signal<string[]>([]);
  notes = '';
  newLang = '';
  segments = signal<PostSegment[]>([]);

  next() { this.step.update(s => Math.min(s + 1, 4)); }
  prev() { this.step.update(s => Math.max(s - 1, 1)); }

  addLang(list: 'needed' | 'spoken', event: Event) {
    event.preventDefault();
    const code = this.newLang.trim().toLowerCase();
    if (!code) return;
    if (list === 'needed') {
      this.languagesNeeded.update(l => l.includes(code) ? l : [...l, code]);
    } else {
      this.languagesSpoken.update(l => l.includes(code) ? l : [...l, code]);
    }
    this.newLang = '';
  }

  removeLang(list: 'needed' | 'spoken', lang: string) {
    if (list === 'needed') {
      this.languagesNeeded.update(l => l.filter(x => x !== lang));
    } else {
      this.languagesSpoken.update(l => l.filter(x => x !== lang));
    }
  }

  addSegment() {
    this.segments.update(s => [...s, {
      segment_order: s.length + 1,
      flight_number: '', airline: '',
      origin_iata: '', destination_iata: '',
      departure_time: '', arrival_time: ''
    }]);
  }

  removeSegment(index: number) {
    this.segments.update(s => s.filter((_, i) => i !== index));
  }

  async submit() {
    const segs = this.segments().map((s, i) => ({
      ...s,
      segment_order: i + 1,
      departure_time: s.departure_time ? new Date(s.departure_time).toISOString() : new Date().toISOString(),
      arrival_time: s.arrival_time ? new Date(s.arrival_time).toISOString() : new Date().toISOString(),
    }));

    const post = await this.api.createPost({
      post_type: this.postType(),
      poster_is_traveller: this.posterIsTraveller,
      traveller_relationship: this.travellerRelationship || undefined,
      origin_iata: this.originIata.toUpperCase(),
      final_destination_iata: this.finalDestinationIata.toUpperCase(),
      travel_date: this.travelDate,
      languages_needed: this.languagesNeeded(),
      languages_spoken: this.languagesSpoken(),
      notes: this.notes,
      segments: segs,
    }).toPromise();

    if (post) {
      this.router.navigateByUrl(`/posts/${post.id}`);
    }
  }
}
