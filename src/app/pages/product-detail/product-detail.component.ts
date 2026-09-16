import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { Review } from '../../models/review.model';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StarRatingComponent, ProductCardComponent],
  template: `
    <div class="product-detail-page" *ngIf="product; else loadingOrNotFound">
      <!-- BREADCRUMBS -->
      <nav class="breadcrumb">
        <a routerLink="/">Home</a>
        <span>›</span>
        <a [routerLink]="['/category', product.category]">{{ product.category }}</a>
        <span>›</span>
        <span>{{ product.name }}</span>
      </nav>

      <div class="product-main-grid">
        <!-- GALLERY -->
        <div class="gallery-col">
          <div class="main-image-wrap">
            <img [src]="selectedImage || product.imageUrl" [alt]="product.name" class="main-img">
            <span class="badge" *ngIf="product.badge">{{ product.badge }}</span>
          </div>

          <div class="thumb-strip" *ngIf="product.images && product.images.length > 1">
            <div
              *ngFor="let img of product.images"
              class="thumb"
              [class.active]="selectedImage === img"
              (click)="selectedImage = img"
            >
              <img [src]="img" [alt]="product.name">
            </div>
          </div>
        </div>

        <!-- PRODUCT INFO & ACTIONS -->
        <div class="info-col">
          <span class="cat-tag">{{ product.category }}</span>
          <h1 class="product-title">{{ product.name }}</h1>

          <!-- RATING & REVIEWS SUMMARY -->
          <div class="rating-header">
            <app-star-rating [rating]="product.rating || 5" [showNumber]="true"></app-star-rating>
            <span class="review-link">({{ product.reviewCount || 0 }} reviews)</span>
            <span class="sku">SKU: FAZ-{{ product.id?.substring(0, 6)?.toUpperCase() }}</span>
          </div>

          <!-- PRICE -->
          <div class="price-box">
            <span class="price">₹{{ product.price | number }}</span>
            <span class="orig-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
              ₹{{ product.originalPrice | number }}
            </span>
            <span class="discount-badge" *ngIf="product.discountPercent">
              Save {{ product.discountPercent }}%
            </span>
          </div>

          <p class="desc">{{ product.description }}</p>

          <div class="divider"></div>

          <!-- SIZE SELECTION -->
          <div class="selector-group" *ngIf="product.sizes && product.sizes.length">
            <div class="selector-label">
              <span>Select Size</span>
              <a href="javascript:void(0)" class="size-guide" (click)="showSizeGuide = true">Size Chart</a>
            </div>
            <div class="size-options">
              <button
                *ngFor="let sz of product.sizes"
                type="button"
                class="size-btn"
                [class.active]="selectedSize === sz"
                (click)="selectedSize = sz"
              >
                {{ sz }}
              </button>
            </div>
          </div>

          <!-- COLOR SELECTION -->
          <div class="selector-group" *ngIf="product.colors && product.colors.length">
            <div class="selector-label">
              <span>Color: <strong>{{ selectedColor }}</strong></span>
            </div>
            <div class="color-options">
              <button
                *ngFor="let clr of product.colors"
                type="button"
                class="color-btn"
                [class.active]="selectedColor === clr"
                (click)="selectedColor = clr"
              >
                {{ clr }}
              </button>
            </div>
          </div>

          <!-- QUANTITY & ADD TO BAG -->
          <div class="purchase-row">
            <div class="quantity-stepper">
              <button (click)="decreaseQuantity()" [disabled]="quantity <= 1">−</button>
              <span>{{ quantity }}</span>
              <button (click)="increaseQuantity()">+</button>
            </div>

            <button class="add-bag-btn" (click)="addToBag()">
              Add to Shopping Bag
            </button>

            <button
              class="wishlist-action-btn"
              [class.active]="isWishlisted()"
              (click)="toggleWishlist()"
              title="Save to Wishlist"
            >
              ♥
            </button>
          </div>

          <!-- BENEFIT BADGES -->
          <div class="perks-grid">
            <div class="perk-item">
              <span class="perk-icon">✨</span>
              <div>
                <strong>Boutique Craftsmanship</strong>
                <p>Premium Korean Nida & Crepe fabric</p>
              </div>
            </div>
            <div class="perk-item">
              <span class="perk-icon">🚚</span>
              <div>
                <strong>Free Express Shipping</strong>
                <p>On all domestic orders above ₹5,000</p>
              </div>
            </div>
            <div class="perk-item">
              <span class="perk-icon">🔄</span>
              <div>
                <strong>Hassle-Free Returns</strong>
                <p>7-day return & exchange window</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- REVIEWS SECTION -->
      <section class="reviews-section">
        <div class="reviews-header">
          <div>
            <h2>Customer Reviews</h2>
            <p>Verified feedback from Fazura clients worldwide</p>
          </div>
          <button class="btn-write-review" (click)="openReviewModal()">
            Write a Review
          </button>
        </div>

        <div class="reviews-list" *ngIf="(reviews$ | async) as reviews">
          <div class="no-reviews" *ngIf="reviews.length === 0">
            Be the first to review this elegant piece.
          </div>

          <div class="review-card" *ngFor="let r of reviews">
            <div class="r-top">
              <app-star-rating [rating]="r.rating"></app-star-rating>
              <span class="r-author">{{ r.userName }}</span>
              <span class="verified-tag">✓ Verified Buyer</span>
            </div>
            <h4 class="r-title" *ngIf="r.title">{{ r.title }}</h4>
            <p class="r-comment">{{ r.comment }}</p>
          </div>
        </div>
      </section>

      <!-- RELATED PRODUCTS -->
      <section class="related-section" *ngIf="relatedProducts.length">
        <h2 class="section-title">Complete The Look</h2>
        <div class="related-grid">
          <app-product-card *ngFor="let p of relatedProducts" [product]="p"></app-product-card>
        </div>
      </section>

      <!-- SIZE GUIDE MODAL -->
      <div class="size-modal" *ngIf="showSizeGuide">
        <div class="size-card">
          <div class="modal-top">
            <h3>Abaya Size Guide</h3>
            <button class="close-x" (click)="showSizeGuide = false">✕</button>
          </div>
          <p>Abaya lengths are typically chosen according to your height in feet/inches:</p>
          <table class="size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Recommended Height</th>
                <th>Bust (Inches)</th>
                <th>Length (Inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>52 (S)</td><td>5'0" – 5'2"</td><td>40"</td><td>52"</td></tr>
              <tr><td>54 (M)</td><td>5'3" – 5'4"</td><td>42"</td><td>54"</td></tr>
              <tr><td>56 (L)</td><td>5'5" – 5'6"</td><td>44"</td><td>56"</td></tr>
              <tr><td>58 (XL)</td><td>5'7" – 5'8"</td><td>46"</td><td>58"</td></tr>
              <tr><td>60 (XXL)</td><td>5'9" & above</td><td>48"</td><td>60"</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- WRITE REVIEW MODAL -->
      <div class="size-modal" *ngIf="showReviewModal">
        <div class="size-card">
          <div class="modal-top">
            <h3>Review {{ product.name }}</h3>
            <button class="close-x" (click)="showReviewModal = false">✕</button>
          </div>
          <div class="review-modal-body">
            <label>Your Rating *</label>
            <app-star-rating [interactive]="true" [rating]="newReviewRating" (ratingChange)="newReviewRating = $event"></app-star-rating>

            <label>Headline (Optional)</label>
            <input type="text" [(ngModel)]="newReviewTitle" placeholder="e.g. Stunning fabric and perfect length">

            <label>Review Details *</label>
            <textarea [(ngModel)]="newReviewComment" rows="4" placeholder="How did the fit, drape, and material feel?"></textarea>

            <button class="submit-review-btn" (click)="submitReview()" [disabled]="!newReviewComment.trim()">
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingOrNotFound>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Curating piece details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .product-detail-page {
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
      margin-bottom: 2rem;
    }
    .breadcrumb a {
      color: #635b52;
      text-decoration: none;
      transition: color 0.2s;
    }
    .breadcrumb a:hover {
      color: #9f803c;
    }
    .product-main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5rem;
      align-items: start;
    }
    @media (max-width: 860px) {
      .product-main-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
    .gallery-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .main-image-wrap {
      position: relative;
      background: #faf8f5;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 3 / 4;
    }
    .main-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: #171513;
      color: #f7f4ee;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 1px;
      padding: 6px 12px;
      border-radius: 4px;
    }
    .thumb-strip {
      display: flex;
      gap: 10px;
      overflow-x: auto;
    }
    .thumb {
      width: 76px;
      height: 96px;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      opacity: 0.7;
      transition: opacity 0.2s, border-color 0.2s;
    }
    .thumb.active, .thumb:hover {
      opacity: 1;
      border-color: #9f803c;
    }
    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .info-col {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .cat-tag {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #9f803c;
      font-weight: 600;
    }
    .product-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.2rem;
      font-weight: 500;
      color: #171513;
      margin: 0;
      line-height: 1.2;
    }
    .rating-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.9rem;
    }
    .review-link {
      color: #7b736a;
    }
    .sku {
      margin-left: auto;
      font-size: 0.8rem;
      color: #a39b90;
      letter-spacing: 1px;
    }
    .price-box {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .price {
      font-size: 1.8rem;
      font-weight: 700;
      color: #171513;
    }
    .orig-price {
      font-size: 1.15rem;
      color: #999;
      text-decoration: line-through;
    }
    .discount-badge {
      background: #fbf0f0;
      color: #b52c2c;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .desc {
      font-size: 0.98rem;
      line-height: 1.65;
      color: #4f4942;
    }
    .divider {
      height: 1px;
      background: #eae3da;
    }
    .selector-group {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .selector-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      color: #333;
    }
    .size-guide {
      color: #9f803c;
      text-decoration: underline;
      cursor: pointer;
    }
    .size-options, .color-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .size-btn, .color-btn {
      padding: 8px 18px;
      border: 1px solid #dcd4ca;
      background: #ffffff;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #2b2824;
      cursor: pointer;
      transition: all 0.2s;
    }
    .size-btn.active, .color-btn.active {
      border-color: #171513;
      background: #171513;
      color: #ffffff;
    }
    .purchase-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 0.5rem;
    }
    .quantity-stepper {
      display: flex;
      align-items: center;
      border: 1px solid #dcd4ca;
      border-radius: 6px;
      overflow: hidden;
    }
    .quantity-stepper button {
      background: #f6f3ee;
      border: none;
      width: 40px;
      height: 48px;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .quantity-stepper span {
      width: 40px;
      text-align: center;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .add-bag-btn {
      flex: 1;
      height: 48px;
      background: #171513;
      color: #f7f4ee;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .add-bag-btn:hover {
      background: #9f803c;
    }
    .wishlist-action-btn {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      border: 1px solid #dcd4ca;
      background: #fff;
      font-size: 1.3rem;
      color: #8c8277;
      cursor: pointer;
      transition: all 0.2s;
    }
    .wishlist-action-btn.active {
      color: #b52c2c;
      border-color: #b52c2c;
    }
    .perks-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      background: #faf8f5;
      padding: 1.25rem;
      border-radius: 8px;
      margin-top: 1rem;
    }
    .perk-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .perk-icon {
      font-size: 1.4rem;
    }
    .perk-item strong {
      font-size: 0.88rem;
      color: #171513;
    }
    .perk-item p {
      font-size: 0.8rem;
      color: #6d655c;
      margin: 2px 0 0;
    }
    .reviews-section {
      margin-top: 4rem;
      padding-top: 3rem;
      border-top: 1px solid #eae3da;
    }
    .reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .reviews-header h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.8rem;
      margin: 0 0 0.3rem;
    }
    .btn-write-review {
      padding: 10px 20px;
      border: 1px solid #171513;
      background: transparent;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-write-review:hover {
      background: #171513;
      color: #fff;
    }
    .reviews-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 768px) {
      .reviews-list {
        grid-template-columns: 1fr;
      }
    }
    .review-card {
      background: #faf8f5;
      padding: 1.25rem;
      border-radius: 8px;
    }
    .r-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0.5rem;
    }
    .r-author {
      font-weight: 600;
      font-size: 0.88rem;
      color: #171513;
    }
    .verified-tag {
      font-size: 0.72rem;
      color: #2b7a44;
      font-weight: 500;
    }
    .r-title {
      font-size: 0.95rem;
      margin: 0 0 0.4rem;
      font-weight: 600;
    }
    .r-comment {
      font-size: 0.88rem;
      color: #524c44;
      line-height: 1.5;
      margin: 0;
    }
    .related-section {
      margin-top: 4rem;
    }
    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .size-modal {
      position: fixed;
      inset: 0;
      background: rgba(18, 17, 16, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .size-card {
      background: #fff;
      padding: 2rem;
      border-radius: 12px;
      max-width: 540px;
      width: 100%;
    }
    .modal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .modal-top h3 {
      font-family: 'Playfair Display', serif;
      margin: 0;
    }
    .close-x {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .size-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.88rem;
    }
    .size-table th, .size-table td {
      border: 1px solid #eae3da;
      padding: 8px 12px;
      text-align: left;
    }
    .size-table th {
      background: #fbf9f6;
    }
    .review-modal-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .review-modal-body label {
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 600;
    }
    .review-modal-body input, .review-modal-body textarea {
      padding: 0.75rem;
      border: 1px solid #dcd4ca;
      border-radius: 6px;
      font-size: 0.9rem;
      outline: none;
    }
    .submit-review-btn {
      margin-top: 0.5rem;
      padding: 10px;
      background: #171513;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .loading-state {
      min-height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #eee;
      border-top-color: #9f803c;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private reviewService = inject(ReviewService);
  public auth = inject(AuthService);

  product: Product | null = null;
  selectedImage: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1;

  relatedProducts: Product[] = [];
  reviews$!: Observable<Review[]>;

  showSizeGuide = false;
  showReviewModal = false;

  newReviewRating = 5;
  newReviewTitle = '';
  newReviewComment = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  async loadProduct(id: string): Promise<void> {
    this.product = await this.productService.getProductById(id);
    if (this.product) {
      this.selectedImage = this.product.imageUrl;
      this.selectedSize = (this.product.sizes && this.product.sizes[0]) || 'Free Size';
      this.selectedColor = (this.product.colors && this.product.colors[0]) || 'Standard';

      this.reviews$ = this.reviewService.getReviewsByProduct(id);

      // Load related products
      this.productService.getProductsByCategory(this.product.category).subscribe(prods => {
        this.relatedProducts = prods.filter(p => p.id !== this.product?.id).slice(0, 4);
      });
    }
  }

  increaseQuantity(): void {
    this.quantity += 1;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  isWishlisted(): boolean {
    return this.product?.id ? this.wishlistService.isWishlisted(this.product.id) : false;
  }

  toggleWishlist(): void {
    if (this.product) {
      this.wishlistService.toggleWishlist(this.product);
    }
  }

  addToBag(): void {
    if (this.product) {
      this.cartService.add(
        this.product,
        this.selectedSize,
        this.selectedColor,
        this.quantity
      );
      this.router.navigate(['/cart']);
    }
  }

  openReviewModal(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showReviewModal = true;
  }

  async submitReview(): Promise<void> {
    if (!this.product?.id || !this.newReviewComment.trim()) return;

    await this.reviewService.addReview(
      this.product.id,
      this.newReviewRating,
      this.newReviewComment.trim(),
      this.newReviewTitle.trim()
    );

    this.showReviewModal = false;
    this.newReviewComment = '';
    this.newReviewTitle = '';
    // Reload reviews & product rating
    this.reviews$ = this.reviewService.getReviewsByProduct(this.product.id);
  }
}
