import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  /** Set of wishlisted product IDs for fast synchronous lookups */
  wishlistIds = signal<string[]>([]);
  loading = signal<boolean>(false);

  constructor() {
    // Sync wishlist whenever user changes
    if (this.auth.isLoggedIn()) {
      this.loadWishlist();
    }
  }

  async loadWishlist(): Promise<void> {
    const uid = this.auth.getUserId();
    if (!uid) {
      this.wishlistIds.set([]);
      return;
    }

    try {
      this.loading.set(true);
      const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.wishlistIds.set(data['wishlist'] || []);
      }
    } catch (err) {
      console.warn('Could not load wishlist from Firestore', err);
    } finally {
      this.loading.set(false);
    }
  }

  isWishlisted(productId: string): boolean {
    return this.wishlistIds().includes(productId);
  }

  async toggleWishlist(product: Product): Promise<boolean> {
    const uid = this.auth.getUserId();
    if (!uid || !product.id) return false;

    const currentlyWishlisted = this.isWishlisted(product.id);
    const updated = currentlyWishlisted
      ? this.wishlistIds().filter(id => id !== product.id)
      : [...this.wishlistIds(), product.id];

    this.wishlistIds.set(updated);

    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userRef, {
        wishlist: currentlyWishlisted ? arrayRemove(product.id) : arrayUnion(product.id)
      });
      return !currentlyWishlisted;
    } catch (err) {
      console.error('Failed to update wishlist on server:', err);
      // Revert on error
      this.wishlistIds.set(
        currentlyWishlisted
          ? [...this.wishlistIds(), product.id]
          : this.wishlistIds().filter(id => id !== product.id)
      );
      return currentlyWishlisted;
    }
  }

  getWishlistCount(): number {
    return this.wishlistIds().length;
  }
}
