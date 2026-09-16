import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <footer class="boutique-footer">
      <div class="footer-container">
        <!-- BRAND & NEWSLETTER -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <span class="symbol">✦</span>
            <span class="name">FAZURA ABAYA</span>
          </div>
          <p class="brand-desc">
            Redefining modest haute couture with impeccable tailoring, flowing drapery, and artisanal craftsmanship inspired by timeless Emirati luxury.
          </p>

          <div class="newsletter-wrap">
            <h4>Join The Fazura Privé Club</h4>
            <p>Receive exclusive private access to limited-edition runway collections.</p>
            <form (ngSubmit)="subscribeNewsletter()" class="newsletter-form" *ngIf="!subscribed">
              <input
                type="email"
                [(ngModel)]="newsletterEmail"
                name="newsletterEmail"
                required
                placeholder="Enter your email address"
              >
              <button type="submit">Join</button>
            </form>
            <p class="sub-success" *ngIf="subscribed">✓ Welcome to the Privé Club. Check your inbox for your 10% welcome invitation.</p>
          </div>
        </div>

        <!-- QUICK LINKS -->
        <div class="footer-col">
          <h4>Haute Collections</h4>
          <ul>
            <li><a [routerLink]="['/category', 'dubai']">Dubai Classic Abayas</a></li>
            <li><a [routerLink]="['/category', 'kaftan']">Artisanal Kaftans</a></li>
            <li><a [routerLink]="['/category', 'open']">Modern Open Front</a></li>
            <li><a [routerLink]="['/category', 'bridal']">Bridal &amp; Occasion</a></li>
            <li><a routerLink="/search">All Collections</a></li>
          </ul>
        </div>

        <!-- CLIENT CARE -->
        <div class="footer-col">
          <h4>Client Concierge</h4>
          <ul>
            <li><a routerLink="/track-order">Track My Shipment</a></li>
            <li><a routerLink="/account">Account &amp; Orders</a></li>
            <li><a routerLink="/wishlist">Saved Wishlist</a></li>
            <li><a routerLink="/cart">Shopping Bag</a></li>
            <li><a href="mailto:concierge@fazura-abaya.com">Bespoke Inquiries</a></li>
          </ul>
        </div>

        <!-- TRUST & POLICIES -->
        <div class="footer-col">
          <h4>The Boutique</h4>
          <p class="service-detail">📍 Flagship Atelier &bull; Dubai &amp; Mumbai</p>
          <p class="service-detail">📞 Concierge: +91 98765 43210</p>
          <p class="service-detail">🕒 Mon – Sat: 10:00 AM – 8:00 PM GST</p>
          <div class="payment-badges">
            <span>VISA</span>
            <span>Mastercard</span>
            <span>UPI</span>
            <span>COD</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} FAZURA ABAYA. All Rights Reserved. Crafted for Modest Elegance.</p>
      </div>
    </footer>
  `,
  styles: [`
    .boutique-footer {
      background: #12100e;
      color: #e5dec9;
      padding: 60px 8% 24px;
      border-top: 1px solid rgba(201, 169, 110, 0.2);
    }
    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.2fr;
      gap: 40px;
      margin-bottom: 48px;
    }
    @media (max-width: 900px) {
      .footer-container {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 600px) {
      .footer-container {
        grid-template-columns: 1fr;
      }
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .symbol {
      color: #d4af37;
      font-size: 1.2rem;
    }
    .name {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      letter-spacing: 3px;
      color: #fff;
    }
    .brand-desc {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
      margin-bottom: 24px;
      max-width: 380px;
    }
    .newsletter-wrap h4 {
      font-size: 0.95rem;
      color: #d4af37;
      margin: 0 0 6px;
      font-weight: 500;
    }
    .newsletter-wrap p {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.5);
      margin: 0 0 12px;
    }
    .newsletter-form {
      display: flex;
      gap: 8px;
      max-width: 360px;
    }
    .newsletter-form input {
      flex: 1;
      padding: 8px 14px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 0.85rem;
      outline: none;
    }
    .newsletter-form button {
      padding: 8px 18px;
      background: #d4af37;
      color: #12100e;
      border: none;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .sub-success {
      color: #2e7d32;
      font-size: 0.82rem;
    }
    .footer-col h4 {
      font-family: 'Playfair Display', serif;
      font-size: 1.05rem;
      color: #fff;
      margin: 0 0 16px;
      font-weight: 500;
    }
    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-col a {
      color: rgba(255, 255, 255, 0.65);
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.2s;
    }
    .footer-col a:hover {
      color: #d4af37;
    }
    .service-detail {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.6);
      margin: 6px 0;
    }
    .payment-badges {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    .payment-badges span {
      background: rgba(255,255,255,0.08);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.7);
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .footer-bottom {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 0.8rem;
      color: rgba(255,255,255,0.4);
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';
  subscribed = false;

  subscribeNewsletter(): void {
    if (this.newsletterEmail.trim()) {
      this.subscribed = true;
    }
  }
}
