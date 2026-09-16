import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      <span
        *ngFor="let star of [1, 2, 3, 4, 5]"
        class="star"
        [class.filled]="star <= (hoverRating || rating)"
        (mouseenter)="onHover(star)"
        (mouseleave)="onLeave()"
        (click)="onClick(star)"
      >
        ★
      </span>
      <span class="rating-number" *ngIf="showNumber && rating > 0">
        {{ rating | number:'1.1-1' }}
      </span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 1rem;
      user-select: none;
    }
    .star {
      color: #d1c7bc;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .star.filled {
      color: #d4af37;
    }
    .interactive .star {
      cursor: pointer;
    }
    .interactive .star:hover {
      transform: scale(1.2);
      color: #b89628;
    }
    .rating-number {
      font-size: 0.85rem;
      font-weight: 600;
      color: #5c554e;
      margin-left: 6px;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating = 5;
  @Input() interactive = false;
  @Input() showNumber = false;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating = 0;

  onHover(star: number): void {
    if (this.interactive) {
      this.hoverRating = star;
    }
  }

  onLeave(): void {
    if (this.interactive) {
      this.hoverRating = 0;
    }
  }

  onClick(star: number): void {
    if (this.interactive) {
      this.rating = star;
      this.ratingChange.emit(this.rating);
    }
  }
}
