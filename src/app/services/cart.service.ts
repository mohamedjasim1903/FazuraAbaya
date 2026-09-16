import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private storageKey = 'fazura_cart_v1';
  private items: CartItem[] = [];

  private countSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.countSubject.asObservable();

  lastAdded = new Subject<string>();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.items = parsed.map(item => ({
              ...item,
              quantity: item.quantity && item.quantity > 0 ? item.quantity : 1
            }));
            this.updateState();
          }
        }
      } catch (err) {
        console.warn('Error reading cart from localStorage', err);
      }
    }
  }

  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch (err) {
        console.warn('Error saving cart to localStorage', err);
      }
    }
    this.updateState();
  }

  private updateState(): void {
    const totalQty = this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    this.countSubject.next(totalQty);
  }

  add(product: Product, size?: string, color?: string, quantity: number = 1): void {
    const itemSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size');
    const itemColor = color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard');

    const existingIndex = this.items.findIndex(
      i => i.id === product.id && i.selectedSize === itemSize && i.selectedColor === itemColor
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        ...product,
        quantity,
        selectedSize: itemSize,
        selectedColor: itemColor
      });
    }

    this.saveToStorage();
    this.lastAdded.next(product.name);
  }

  getCart(): CartItem[] {
    return this.items;
  }

  getTotal(): number {
    return this.items.reduce(
      (sum, item) => sum + (item.price * (item.quantity || 1)),
      0
    );
  }

  increaseQty(index: number): void {
    if (this.items[index]) {
      this.items[index].quantity = (this.items[index].quantity || 1) + 1;
      this.saveToStorage();
    }
  }

  decreaseQty(index: number): void {
    if (this.items[index]) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity -= 1;
        this.saveToStorage();
      } else {
        this.remove(index);
      }
    }
  }

  remove(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.saveToStorage();
    }
  }

  clear(): void {
    this.items = [];
    this.saveToStorage();
  }

  cartCount(): number {
    return this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }
}