import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  template: `
    <div class="product-card">
      <div class="card-media">
        <a [routerLink]="['/product', product.id || '']">
          <img [src]="product.imageUrl" [alt]="product.name" loading="lazy" class="product-img">
        </a>

        <!-- Badge -->
        <span class="badge" *ngIf="product.badge">{{ product.badge }}</span>
        <span class="badge discount" *ngIf="!product.badge && product.discountPercent">
          -{{ product.discountPercent }}%
        </span>

        <!-- Wishlist Button -->
        <button
          class="wishlist-btn"
          [class.active]="isWishlisted()"
          (click)="toggleWishlist($event)"
          title="Save to Wishlist"
          aria-label="Save to Wishlist"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <!-- Quick Add Overlay -->
        <button class="quick-add-btn" (click)="quickAdd($event)">
          + Quick Add
        </button>
      </div>

      <div class="card-content">
        <span class="product-cat">{{ product.category }}</span>
        <h3 class="product-title">
          <a [routerLink]="['/product', product.id || '']">{{ product.name }}</a>
        </h3>

        <div class="rating-row" *ngIf="product.rating">
          <app-star-rating [rating]="product.rating" [showNumber]="true"></app-star-rating>
          <span class="review-count" *ngIf="product.reviewCount">({{ product.reviewCount }})</span>
        </div>

        <div class="price-row">
          <span class="current-price">₹{{ product.price | number }}</span>
          <span class="orig-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
            ₹{{ product.originalPrice | number }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      border: 1px solid #f0eae1;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.08);
    }
    .card-media {
      position: relative;
      width: 100%;
      padding-top: 130%;
      background: #fbf9f6;
      overflow: hidden;
    }
    .product-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .product-card:hover .product-img {
      transform: scale(1.05);
    }
    .badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #171513;
      color: #f7f4ee;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 8px;
      border-radius: 4px;
      z-index: 2;
    }
    .badge.discount {
      background: #b52c2c;
    }
    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      transition: transform 0.2s, background 0.2s;
    }
    .wishlist-btn:hover {
      transform: scale(1.1);
      background: #ffffff;
    }
    .wishlist-btn svg {
      width: 18px;
      height: 18px;
      stroke: #444;
      transition: stroke 0.2s, fill 0.2s;
    }
    .wishlist-btn.active svg {
      stroke: #b52c2c;
      fill: #b52c2c;
    }
    .quick-add-btn {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(23, 21, 19, 0.92);
      backdrop-filter: blur(4px);
      color: #f6f3ee;
      border: none;
      padding: 10px 0;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      cursor: pointer;
      transform: translateY(100%);
      transition: transform 0.25s ease, background 0.2s ease;
      z-index: 2;
    }
    .product-card:hover .quick-add-btn {
      transform: translateY(0);
    }
    .quick-add-btn:hover {
      background: #9f803c;
    }
    .card-content {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-grow: 1;
    }
    .product-cat {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #9f803c;
      font-weight: 600;
    }
    .product-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1rem;
      margin: 0;
      line-height: 1.35;
      font-weight: 500;
    }
    .product-title a {
      color: #1a1815;
      text-decoration: none;
      transition: color 0.2s;
    }
    .product-title a:hover {
      color: #9f803c;
    }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .review-count {
      font-size: 0.75rem;
      color: #7b736a;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: auto;
      padding-top: 4px;
    }
    .current-price {
      font-size: 1.05rem;
      font-weight: 700;
      color: #171513;
    }
    .orig-price {
      font-size: 0.85rem;
      color: #999;
      text-decoration: line-through;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cart = inject(CartService);
  private wishlist = inject(WishlistService);

  isWishlisted(): boolean {
    return this.product.id ? this.wishlist.isWishlisted(this.product.id) : false;
  }

  toggleWishlist(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.wishlist.toggleWishlist(this.product);
  }

  quickAdd(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.cart.add(this.product);
  }
}
