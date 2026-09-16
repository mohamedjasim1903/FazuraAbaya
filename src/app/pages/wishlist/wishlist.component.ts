import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <div class="wishlist-page">
      <!-- HEADER -->
      <div class="page-header">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>›</span>
          <span>My Wishlist</span>
        </nav>
        <h1>Saved <em>Pieces</em></h1>
        <p>{{ wishlistedProducts.length }} {{ wishlistedProducts.length === 1 ? 'Garment' : 'Garments' }} Saved</p>
      </div>

      <!-- EMPTY STATE -->
      <div class="empty-state" *ngIf="wishlistedProducts.length === 0">
        <div class="empty-icon">♥</div>
        <h2>Your Wishlist is Empty</h2>
        <p>Save your favorite bespoke abayas and modesty couture to revisit anytime.</p>
        <a routerLink="/search" class="btn-primary">Explore Catalog</a>
      </div>

      <!-- PRODUCTS GRID -->
      <div class="wishlist-grid" *ngIf="wishlistedProducts.length > 0">
        <app-product-card
          *ngFor="let product of wishlistedProducts"
          [product]="product"
        ></app-product-card>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      max-width: 1240px;
      margin: 0 auto;
      padding: 2rem 1.5rem 5rem;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #8c8277;
      margin-bottom: 1rem;
    }
    .breadcrumb a {
      color: #555;
      text-decoration: none;
    }
    .page-header {
      margin-bottom: 2.5rem;
    }
    .page-header h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.2rem;
      margin: 0 0 0.3rem;
    }
    .page-header p {
      color: #777;
      margin: 0;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #faf8f5;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .empty-icon {
      font-size: 3rem;
      color: #b52c2c;
    }
    .empty-state h2 {
      font-family: 'Playfair Display', serif;
      margin: 0;
    }
    .btn-primary {
      padding: 12px 28px;
      background: #171513;
      color: #fff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 0.5rem;
    }
    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 2rem;
    }
  `]
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private productService = inject(ProductService);

  wishlistedProducts: Product[] = [];

  ngOnInit(): void {
    this.wishlistService.loadWishlist().then(() => {
      const ids = this.wishlistService.wishlistIds();
      this.productService.getProducts().subscribe(all => {
        this.wishlistedProducts = all.filter(p => p.id && ids.includes(p.id));
      });
    });
  }
}
