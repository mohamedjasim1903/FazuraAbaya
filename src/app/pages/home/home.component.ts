import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  categories = [
    {
      id: 'dubai',
      name: 'Dubai Abaya',
      description: 'Elegant Dubai-inspired designs',
      tag: 'BESTSELLER',
      emoji: '✦',
      bg: 'linear-gradient(135deg, #e8d9c8, #b99b7c)'
    },
    {
      id: 'kaftan',
      name: 'Kaftan Abaya',
      description: 'Luxury kaftan collection',
      tag: 'NEW',
      emoji: '✧',
      bg: 'linear-gradient(135deg, #d8c5b5, #8d7160)'
    },
    {
      id: 'open',
      name: 'Open Abaya',
      description: 'Modern open abaya styles',
      tag: 'TRENDING',
      emoji: '♡',
      bg: 'linear-gradient(135deg, #d7d7d7, #777777)'
    },
    {
      id: 'premium',
      name: 'Premium Abaya',
      description: 'Our premium collection',
      tag: 'PREMIUM',
      emoji: '♢',
      bg: 'linear-gradient(135deg, #cfc5b8, #4b433c)'
    }
  ];

  featuredProducts: Product[] = [];

  currentYear = new Date().getFullYear();

  constructor(
    private productService: ProductService,
    private cart: CartService
  ) {}

  ngOnInit(): void {

    this.productService
      .getProducts()
      .pipe(
        catchError(err => {
          console.error('Failed to load products:', err);
          return of([] as Product[]);
        })
      )
      .subscribe(products => {
        this.featuredProducts = products.slice(0, 3);
      });

  }

  addToCart(product: Product): void {
    this.cart.add(product);
  }
}
