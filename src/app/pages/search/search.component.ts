import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  template: `
    <div class="search-page">
      <!-- HEADER -->
      <div class="search-header">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>›</span>
          <span>Catalog Search</span>
        </nav>
        <h1>Explore Our <em>Collection</em></h1>
        <p *ngIf="searchTerm">Showing results for "<strong>{{ searchTerm }}</strong>"</p>
      </div>

      <div class="search-layout">
        <!-- FILTER SIDEBAR -->
        <aside class="filter-sidebar">
          <div class="filter-group">
            <label class="filter-title">Search Keywords</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              placeholder="e.g. Nida, Silk, Black..."
              class="search-input"
            >
          </div>

          <div class="filter-group">
            <label class="filter-title">Category</label>
            <div class="filter-options">
              <label class="radio-label">
                <input type="radio" name="cat" value="All" [(ngModel)]="selectedCategory" (change)="applyFilters()">
                <span>All Collections</span>
              </label>
              <label class="radio-label" *ngFor="let cat of categories">
                <input type="radio" name="cat" [value]="cat" [(ngModel)]="selectedCategory" (change)="applyFilters()">
                <span>{{ cat }}</span>
              </label>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-title">Price Range</label>
            <div class="filter-options">
              <label class="radio-label">
                <input type="radio" name="price" value="all" [(ngModel)]="selectedPriceRange" (change)="applyFilters()">
                <span>All Prices</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="price" value="under-3000" [(ngModel)]="selectedPriceRange" (change)="applyFilters()">
                <span>Under ₹3,000</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="price" value="3000-5000" [(ngModel)]="selectedPriceRange" (change)="applyFilters()">
                <span>₹3,000 – ₹5,000</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="price" value="above-5000" [(ngModel)]="selectedPriceRange" (change)="applyFilters()">
                <span>Above ₹5,000</span>
              </label>
            </div>
          </div>

          <button class="reset-btn" (click)="resetFilters()">
            Clear All Filters
          </button>
        </aside>

        <!-- MAIN RESULTS -->
        <main class="results-main">
          <div class="results-bar">
            <span class="results-count">
              Found <strong>{{ filteredProducts.length }}</strong> {{ filteredProducts.length === 1 ? 'piece' : 'pieces' }}
            </span>

            <div class="sort-wrap">
              <label>Sort By:</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="featured">Featured / Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <div class="no-results" *ngIf="filteredProducts.length === 0">
            <div class="empty-icon">🔍</div>
            <h3>No pieces found</h3>
            <p>Try adjusting your search criteria or explore our newest collections.</p>
            <button class="reset-btn" (click)="resetFilters()">Reset Filters</button>
          </div>

          <!-- GRID -->
          <div class="products-grid" *ngIf="filteredProducts.length > 0">
            <app-product-card
              *ngFor="let product of filteredProducts"
              [product]="product"
            ></app-product-card>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .search-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem 1.5rem 5rem;
    }
    .search-header {
      margin-bottom: 2rem;
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
      color: #635b52;
      text-decoration: none;
    }
    .search-header h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.2rem;
      font-weight: 500;
      margin: 0 0 0.4rem;
    }
    .search-header p {
      color: #6c645b;
      margin: 0;
    }
    .search-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 2.5rem;
      align-items: start;
    }
    @media (max-width: 860px) {
      .search-layout {
        grid-template-columns: 1fr;
      }
    }
    .filter-sidebar {
      background: #faf8f5;
      padding: 1.5rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      border: 1px solid #f0eae1;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .filter-title {
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      color: #2b2824;
    }
    .search-input {
      padding: 0.75rem 0.9rem;
      border: 1px solid #dfd8cf;
      border-radius: 6px;
      font-size: 0.9rem;
      background: #fff;
      outline: none;
    }
    .search-input:focus {
      border-color: #9f803c;
    }
    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .radio-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: #4b443c;
      cursor: pointer;
    }
    .reset-btn {
      padding: 0.75rem;
      border: 1px solid #dcd4ca;
      background: #fff;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #444;
      cursor: pointer;
      transition: background 0.2s;
    }
    .reset-btn:hover {
      background: #f0eae1;
    }
    .results-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .results-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eae3da;
    }
    .results-count {
      font-size: 0.95rem;
      color: #555;
    }
    .sort-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
    }
    .sort-wrap select {
      padding: 0.5rem 0.8rem;
      border: 1px solid #dfd8cf;
      border-radius: 6px;
      background: #fff;
      font-size: 0.88rem;
      outline: none;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .no-results {
      padding: 4rem 2rem;
      text-align: center;
      background: #faf8f5;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .empty-icon {
      font-size: 2.5rem;
    }
  `]
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm = '';
  selectedCategory = 'All';
  selectedPriceRange = 'all';
  sortBy = 'featured';

  categories = [
    'Everyday Essentials',
    'Luxury Occasion',
    'Modern Open Front',
    'Embroidered Heritage',
    'Minimalist Modern'
  ];

  ngOnInit(): void {
    this.productService.getProducts().subscribe(prods => {
      this.allProducts = prods;
      this.route.queryParams.subscribe(params => {
        if (params['q']) {
          this.searchTerm = params['q'];
        }
        if (params['category']) {
          this.selectedCategory = params['category'];
        }
        this.applyFilters();
      });
    });
  }

  applyFilters(): void {
    let list = [...this.allProducts];

    // Filter by keyword search
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'All') {
      list = list.filter(p => p.category === this.selectedCategory);
    }

    // Filter by price range
    if (this.selectedPriceRange === 'under-3000') {
      list = list.filter(p => p.price < 3000);
    } else if (this.selectedPriceRange === '3000-5000') {
      list = list.filter(p => p.price >= 3000 && p.price <= 5000);
    } else if (this.selectedPriceRange === 'above-5000') {
      list = list.filter(p => p.price > 5000);
    }

    // Sort
    if (this.sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    this.filteredProducts = list;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'All';
    this.selectedPriceRange = 'all';
    this.sortBy = 'featured';
    this.applyFilters();
  }
}
