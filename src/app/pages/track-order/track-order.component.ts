import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="track-page">
      <div class="track-hero">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>›</span>
          <span>Order Tracking</span>
        </nav>
        <h1>Track Your <em>Shipment</em></h1>
        <p>Enter your Fazura order number or consignment ID to view real-time transit status.</p>

        <form (ngSubmit)="searchOrder()" class="track-form">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            name="searchQuery"
            required
            placeholder="e.g. FAZ-849201-1029 or Order ID"
          >
          <button type="submit" [disabled]="loading || !searchQuery.trim()">
            {{ loading ? 'Searching...' : 'Track Package' }}
          </button>
        </form>

        <p class="error-msg" *ngIf="errorMessage">{{ errorMessage }}</p>
      </div>

      <!-- RESULTS CARD -->
      <div class="order-result-card" *ngIf="order">
        <div class="result-header">
          <div>
            <h3>Order #{{ order.orderNumber || order.id?.substring(0, 8) }}</h3>
            <span class="status-pill">{{ order.status }}</span>
          </div>
          <a [routerLink]="['/order', order.id]" class="view-invoice-link">
            View Full Invoice & Receipt →
          </a>
        </div>

        <div class="timeline-wrap">
          <div class="point" [class.active]="isReached('placed')">
            <div class="circle">●</div>
            <span>Order Placed</span>
          </div>
          <div class="bar" [class.active]="isReached('confirmed')"></div>
          <div class="point" [class.active]="isReached('confirmed')">
            <div class="circle">●</div>
            <span>Confirmed</span>
          </div>
          <div class="bar" [class.active]="isReached('shipped')"></div>
          <div class="point" [class.active]="isReached('shipped')">
            <div class="circle">●</div>
            <span>In Transit</span>
          </div>
          <div class="bar" [class.active]="isReached('delivered')"></div>
          <div class="point" [class.active]="isReached('delivered')">
            <div class="circle">●</div>
            <span>Delivered</span>
          </div>
        </div>

        <div class="details-row">
          <div class="detail-box">
            <label>Payment</label>
            <p>{{ order.paymentLabel }} ({{ order.paymentStatus }})</p>
          </div>
          <div class="detail-box" *ngIf="order.trackingNumber">
            <label>AWB Tracking Number</label>
            <p><strong>{{ order.trackingNumber }}</strong></p>
          </div>
          <div class="detail-box">
            <label>Package Contents</label>
            <p>{{ order.items.length }} {{ order.items.length === 1 ? 'Garment' : 'Garments' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-page {
      max-width: 860px;
      margin: 0 auto;
      padding: 3rem 1.5rem 6rem;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #8c8277;
      margin-bottom: 1.5rem;
    }
    .breadcrumb a {
      color: #555;
      text-decoration: none;
    }
    .track-hero {
      text-align: center;
      margin-bottom: 3rem;
    }
    .track-hero h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.6rem;
      margin: 0 0 0.5rem;
    }
    .track-hero p {
      color: #666;
      font-size: 1rem;
      max-width: 540px;
      margin: 0 auto 2rem;
    }
    .track-form {
      display: flex;
      max-width: 520px;
      margin: 0 auto;
      gap: 10px;
    }
    .track-form input {
      flex: 1;
      padding: 0.85rem 1.1rem;
      border: 1px solid #dcd4ca;
      border-radius: 6px;
      font-size: 0.95rem;
      outline: none;
    }
    .track-form input:focus {
      border-color: #9f803c;
    }
    .track-form button {
      padding: 0.85rem 1.5rem;
      background: #171513;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .track-form button:hover:not(:disabled) {
      background: #9f803c;
    }
    .error-msg {
      color: #b52c2c;
      margin-top: 1rem;
      font-size: 0.9rem;
    }
    .order-result-card {
      background: #fff;
      border: 1px solid #eae3da;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.05);
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0eae1;
    }
    .result-header h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      margin: 0 0 4px;
    }
    .status-pill {
      background: #fbf0f0;
      color: #9f803c;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .view-invoice-link {
      color: #9f803c;
      font-weight: 600;
      font-size: 0.88rem;
      text-decoration: none;
    }
    .timeline-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
    }
    .point {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: #aaa;
      font-size: 0.82rem;
    }
    .point.active {
      color: #171513;
      font-weight: 600;
    }
    .circle {
      font-size: 1.2rem;
    }
    .point.active .circle {
      color: #9f803c;
    }
    .bar {
      flex: 1;
      height: 3px;
      background: #e5dfd7;
      margin: 0 8px 22px;
    }
    .bar.active {
      background: #9f803c;
    }
    .details-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      background: #faf8f5;
      padding: 1.25rem;
      border-radius: 8px;
    }
    .detail-box label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
    }
    .detail-box p {
      margin: 4px 0 0;
      font-size: 0.95rem;
      color: #222;
    }
  `]
})
export class TrackOrderComponent {
  private orderService = inject(OrderService);

  searchQuery = '';
  loading = false;
  order: Order | null = null;
  errorMessage = '';

  async searchOrder(): Promise<void> {
    if (!this.searchQuery.trim()) return;

    this.loading = true;
    this.errorMessage = '';
    this.order = null;

    const term = this.searchQuery.trim();
    let found = await this.orderService.getOrderByNumber(term);
    if (!found) {
      found = await this.orderService.getOrderById(term);
    }

    if (found) {
      this.order = found;
    } else {
      this.errorMessage = `Could not find order with reference "${term}". Please verify and try again.`;
    }

    this.loading = false;
  }

  isReached(step: string): boolean {
    if (!this.order) return false;
    const s = this.order.status?.toLowerCase() || 'pending';
    if (step === 'placed') return true;
    if (step === 'confirmed') return ['confirmed', 'processing', 'shipped', 'delivered'].includes(s);
    if (step === 'shipped') return ['shipped', 'delivered'].includes(s);
    if (step === 'delivered') return s === 'delivered';
    return false;
  }
}
