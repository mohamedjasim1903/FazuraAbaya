import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnDestroy {
  public cart = inject(CartService);
  public auth = inject(AuthService);
  public wishlist = inject(WishlistService);
  private router = inject(Router);

  showNotif = false;
  notifMsg = '';
  mobileMenuOpen = false;
  searchOpen = false;
  searchQuery = '';

  private subscription?: Subscription;

  constructor() {
    this.subscription = this.cart.lastAdded.subscribe(name => {
      if (!name) return;

      this.notifMsg = `${name} added to cart`;
      this.showNotif = true;

      setTimeout(() => {
        this.showNotif = false;
      }, 2500);
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery.trim() }
      });
      this.searchOpen = false;
      this.mobileMenuOpen = false;
      this.searchQuery = '';
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}