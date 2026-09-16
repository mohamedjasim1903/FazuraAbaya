import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="order-detail-page" *ngIf="order; else loadingOrError">
      <!-- HEADER -->
      <div class="order-page-header no-print">
        <nav class="breadcrumb">
          <a routerLink="/account">My Account</a>
          <span>›</span>
          <a routerLink="/account">Orders</a>
          <span>›</span>
          <span>Order #{{ order.orderNumber || order.id?.substring(0, 8) }}</span>
        </nav>

        <div class="header-actions">
          <div>
            <h1>Order <em>#{{ order.orderNumber || order.id?.substring(0, 8) }}</em></h1>
            <p class="order-date">Placed on {{ getOrderDate(order) ? (getOrderDate(order) | date:'mediumDate') : 'Recently' }}</p>
          </div>

          <div class="btn-group">
            <button class="btn-secondary" (click)="printInvoice()">
              📄 Print Invoice
            </button>
            <button
              class="btn-return"
              *ngIf="canRequestReturn()"
              (click)="showReturnModal = true"
            >
              Request Return / Refund
            </button>
          </div>
        </div>
      </div>

      <!-- INVOICE SHEET (PRINT & SCREEN) -->
      <div class="invoice-container">
        <!-- BRAND INVOICE HEADER -->
        <div class="invoice-brand">
          <div>
            <div class="brand-logo">FAZURA ABAYA</div>
            <p class="brand-sub">Haute Couture & Modest Elegance</p>
            <p class="brand-contact">concierge&#64;fazura-abaya.com | +91 98765 43210</p>
          </div>
          <div class="invoice-meta">
            <h2>INVOICE</h2>
            <p><strong>Invoice No:</strong> {{ order.orderNumber || order.id }}</p>
            <p><strong>Date:</strong> {{ getOrderDate(order) ? (getOrderDate(order) | date:'dd MMM yyyy') : 'Current' }}</p>
            <p><strong>Payment Method:</strong> {{ order.paymentLabel }}</p>
            <p><strong>Payment Status:</strong> <span class="badge-status">{{ order.paymentStatus || 'Completed' }}</span></p>
          </div>
        </div>

        <!-- TIMELINE (SCREEN ONLY) -->
        <div class="timeline-card no-print">
          <h3>Fulfillment Status</h3>
          <div class="status-steps">
            <div class="step" [class.done]="isStepDone('placed')">
              <div class="step-dot">✓</div>
              <span>Placed</span>
            </div>
            <div class="step-line" [class.done]="isStepDone('confirmed')"></div>
            <div class="step" [class.done]="isStepDone('confirmed')">
              <div class="step-dot">✓</div>
              <span>Confirmed</span>
            </div>
            <div class="step-line" [class.done]="isStepDone('shipped')"></div>
            <div class="step" [class.done]="isStepDone('shipped')">
              <div class="step-dot">✓</div>
              <span>Shipped</span>
            </div>
            <div class="step-line" [class.done]="isStepDone('delivered')"></div>
            <div class="step" [class.done]="isStepDone('delivered')">
              <div class="step-dot">✓</div>
              <span>Delivered</span>
            </div>
          </div>

          <div class="tracking-banner" *ngIf="order.trackingNumber">
            <span>Airway Tracking Number: <strong>{{ order.trackingNumber }}</strong></span>
          </div>

          <div class="return-banner" *ngIf="order.returnRequested">
            <span>⚠️ Return Request Submitted: <em>"{{ order.returnReason || 'Awaiting review' }}"</em></span>
          </div>
        </div>

        <!-- ADDRESSES & CUSTOMER -->
        <div class="invoice-addresses">
          <div class="address-box">
            <h4>Billed & Delivered To:</h4>
            <div *ngIf="order.deliveryAddress; else stringAddress">
              <p><strong>{{ order.deliveryAddress.fullName }}</strong></p>
              <p>{{ order.deliveryAddress.phone }}</p>
              <p>{{ order.deliveryAddress.addressLine1 }}</p>
              <p *ngIf="order.deliveryAddress.addressLine2">{{ order.deliveryAddress.addressLine2 }}</p>
              <p>{{ order.deliveryAddress.city }}, {{ order.deliveryAddress.state }} - {{ order.deliveryAddress.postalCode }}</p>
              <p>{{ order.deliveryAddress.country }}</p>
            </div>
            <ng-template #stringAddress>
              <p><strong>{{ order.customerName || 'Valued Customer' }}</strong></p>
              <p>{{ order.userEmail }}</p>
              <p>{{ order.shippingAddress || 'Standard Delivery' }}</p>
            </ng-template>
          </div>
        </div>

        <!-- ITEMS TABLE -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Piece Details</th>
              <th>Variant / Size</th>
              <th>Price</th>
              <th>Quantity</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of order.items">
              <td class="item-cell">
                <img [src]="item.imageUrl" [alt]="item.name" class="table-thumb no-print">
                <span>{{ item.name }}</span>
              </td>
              <td>
                <span *ngIf="item.size">{{ item.size }}</span>
                <span *ngIf="item.color"> / {{ item.color }}</span>
                <span *ngIf="!item.size && !item.color">—</span>
              </td>
              <td>₹{{ item.price | number }}</td>
              <td>{{ item.quantity || 1 }}</td>
              <td class="text-right">₹{{ (item.price * (item.quantity || 1)) | number }}</td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALS BREAKDOWN -->
        <div class="invoice-totals">
          <div class="totals-table">
            <div class="row">
              <span>Subtotal:</span>
              <span>₹{{ order.subtotal | number }}</span>
            </div>
            <div class="row" *ngIf="order.discount">
              <span>Discount ({{ order.couponCode || 'Promo' }}):</span>
              <span class="text-discount">−₹{{ order.discount | number }}</span>
            </div>
            <div class="row">
              <span>Shipping:</span>
              <span>{{ order.shipping === 0 ? 'Complimentary' : ('₹' + (order.shipping | number)) }}</span>
            </div>
            <div class="row grand-total">
              <span>Total Amount:</span>
              <span>₹{{ order.total | number }}</span>
            </div>
          </div>
        </div>

        <!-- INVOICE FOOTER -->
        <div class="invoice-footer">
          <p>Thank you for choosing Fazura Abaya. We craft each luxury garment with exquisite devotion.</p>
          <p class="footnote">For any queries regarding your shipment, please quote order number {{ order.orderNumber || order.id }}.</p>
        </div>
      </div>

      <!-- RETURN REQUEST MODAL -->
      <div class="modal-backdrop" *ngIf="showReturnModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Request Return / Exchange</h3>
            <button class="close-btn" (click)="showReturnModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Please state the reason for requesting a return or exchange for this order:</p>
            <textarea [(ngModel)]="returnReason" rows="4" placeholder="e.g. Size fit issue, received incorrect color..."></textarea>
            <div class="modal-actions">
              <button class="btn-cancel" (click)="showReturnModal = false">Cancel</button>
              <button class="btn-submit" (click)="submitReturn()" [disabled]="!returnReason.trim()">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingOrError>
      <div class="loading-wrap">
        <div class="spinner"></div>
        <p>Retrieving order details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .order-detail-page {
      max-width: 1040px;
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
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-actions h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2rem;
      margin: 0;
    }
    .order-date {
      color: #777;
      font-size: 0.9rem;
      margin: 4px 0 0;
    }
    .btn-group {
      display: flex;
      gap: 10px;
    }
    .btn-secondary, .btn-return {
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 0.88rem;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-secondary {
      background: #fff;
      border: 1px solid #dcd4ca;
      color: #333;
    }
    .btn-return {
      background: #faf2ee;
      border: 1px solid #e2c0b0;
      color: #9c3c1b;
    }
    .invoice-container {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #eae3da;
      padding: 2.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .invoice-brand {
      display: flex;
      justify-content: space-between;
      padding-bottom: 2rem;
      border-bottom: 2px solid #171513;
      margin-bottom: 2rem;
    }
    .brand-logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      letter-spacing: 2px;
      font-weight: 700;
    }
    .brand-sub {
      color: #9f803c;
      font-size: 0.85rem;
      letter-spacing: 1px;
      margin: 2px 0 6px;
    }
    .brand-contact {
      color: #666;
      font-size: 0.82rem;
      margin: 0;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h2 {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      margin: 0 0 0.5rem;
      color: #171513;
    }
    .invoice-meta p {
      font-size: 0.85rem;
      color: #555;
      margin: 2px 0;
    }
    .badge-status {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.8rem;
    }
    .timeline-card {
      background: #faf8f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border: 1px solid #f0eae1;
    }
    .timeline-card h3 {
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 1.25rem;
    }
    .status-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: #999;
    }
    .step.done {
      color: #171513;
      font-weight: 600;
    }
    .step-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ddd;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }
    .step.done .step-dot {
      background: #171513;
    }
    .step-line {
      flex: 1;
      height: 3px;
      background: #ddd;
      margin: 0 8px 18px;
    }
    .step-line.done {
      background: #171513;
    }
    .tracking-banner {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f0f7f2;
      border-radius: 6px;
      font-size: 0.88rem;
      color: #1e5a2e;
    }
    .return-banner {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #fdf5f0;
      border-radius: 6px;
      font-size: 0.88rem;
      color: #a33f17;
    }
    .invoice-addresses {
      margin-bottom: 2rem;
    }
    .address-box h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 0.5rem;
      color: #888;
    }
    .address-box p {
      margin: 2px 0;
      font-size: 0.9rem;
      color: #333;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
      font-size: 0.9rem;
    }
    .invoice-table th, .invoice-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }
    .invoice-table th {
      background: #faf8f5;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .text-right {
      text-align: right !important;
    }
    .item-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .table-thumb {
      width: 44px;
      height: 56px;
      object-fit: cover;
      border-radius: 4px;
    }
    .invoice-totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 3rem;
    }
    .totals-table {
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 0.92rem;
    }
    .totals-table .row {
      display: flex;
      justify-content: space-between;
    }
    .text-discount {
      color: #b52c2c;
      font-weight: 600;
    }
    .grand-total {
      font-size: 1.15rem;
      font-weight: 700;
      border-top: 2px solid #171513;
      padding-top: 8px;
      color: #171513;
    }
    .invoice-footer {
      text-align: center;
      border-top: 1px solid #eee;
      padding-top: 1.5rem;
      color: #777;
      font-size: 0.85rem;
    }
    .footnote {
      font-size: 0.75rem;
      color: #999;
      margin-top: 4px;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      background: #fff;
      width: 100%;
      max-width: 480px;
      border-radius: 10px;
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: #171513;
      color: #fff;
    }
    .modal-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .modal-body textarea {
      padding: 0.75rem;
      border: 1px solid #dcd4ca;
      border-radius: 6px;
      outline: none;
      font-size: 0.9rem;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn-cancel {
      padding: 8px 16px;
      border: 1px solid #dcd4ca;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-submit {
      padding: 8px 18px;
      background: #171513;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .loading-wrap {
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
    @media print {
      .no-print {
        display: none !important;
      }
      .invoice-container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      body {
        background: #fff !important;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order: Order | null = null;
  showReturnModal = false;
  returnReason = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadOrder(id);
      }
    });
  }

  async loadOrder(id: string): Promise<void> {
    this.order = await this.orderService.getOrderById(id);
    if (!this.order) {
      // Try searching by orderNumber if not by document ID
      this.order = await this.orderService.getOrderByNumber(id);
    }
  }

  isStepDone(step: string): boolean {
    if (!this.order) return false;
    const s = this.order.status?.toLowerCase() || 'pending';
    const sequence = ['placed', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'];

    if (step === 'placed') return true;
    if (step === 'confirmed') return ['confirmed', 'processing', 'shipped', 'delivered'].includes(s);
    if (step === 'shipped') return ['shipped', 'delivered'].includes(s);
    if (step === 'delivered') return s === 'delivered';
    return false;
  }

  canRequestReturn(): boolean {
    if (!this.order) return false;
    return !this.order.returnRequested && this.order.status?.toLowerCase() !== 'cancelled';
  }

  async submitReturn(): Promise<void> {
    if (!this.order?.id || !this.returnReason.trim()) return;

    await this.orderService.requestReturn(this.order.id, this.returnReason.trim());
    this.showReturnModal = false;
    this.order.returnRequested = true;
    this.order.returnReason = this.returnReason.trim();
  }

  printInvoice(): void {
    window.print();
  }

  getOrderDate(order?: Order | null): Date | null {
    if (!order || !order.createdAt) return null;
    const ca: any = order.createdAt;
    if (typeof ca?.toDate === 'function') return ca.toDate();
    if (ca?.seconds) return new Date(ca.seconds * 1000);
    if (ca instanceof Date) return ca;
    if (typeof ca === 'string' || typeof ca === 'number') return new Date(ca);
    return null;
  }
}
