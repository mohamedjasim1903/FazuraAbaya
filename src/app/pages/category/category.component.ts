import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

import { Product } from '../../models/product.model';

const CATEGORY_META: Record<string, { name: string; description: string; tag: string; bg: string }> = {
  dubai: {
    name: 'Dubai Abaya',
    description: 'Elegantly crafted Dubai-inspired designs blending tradition with modern luxury.',
    tag: 'BESTSELLER',
    bg: 'linear-gradient(135deg, #e8d9c8, #b99b7c)'
  },
  kaftan: {
    name: 'Kaftan Abaya',
    description: 'Luxurious kaftan silhouettes draped in premium fabric for every occasion.',
    tag: 'NEW ARRIVAL',
    bg: 'linear-gradient(135deg, #d8c5b5, #8d7160)'
  },
  open: {
    name: 'Open Abaya',
    description: 'Contemporary open styles for the modern woman who values freedom and grace.',
    tag: 'TRENDING',
    bg: 'linear-gradient(135deg, #d7d7d7, #777777)'
  },
  premium: {
    name: 'Premium Abaya',
    description: 'Our finest selection — exquisite craftsmanship in every stitch.',
    tag: 'PREMIUM COLLECTION',
    bg: 'linear-gradient(135deg, #cfc5b8, #4b433c)'
  }
};

@Component({
  selector: 'app-category',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {

  categoryId = '';

  categoryMeta: { name: string; description: string; tag: string; bg: string } | null = null;

  featuredProducts$!: Observable<Product[]>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService
  ) {}

  ngOnInit(): void {

    this.categoryId =
      this.route.snapshot.paramMap.get('id') || '';

    this.categoryMeta = CATEGORY_META[this.categoryId] || null;

    this.featuredProducts$ =
      this.productService
        .getProducts()
        .pipe(
          map(products =>
            products.filter(
              product =>
                product.category === this.categoryId
            )
          )
        );

  }

  addToCart(product: Product): void {
    this.cart.add(product);
  }

}