import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';

export interface ProductFilterOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private productsCollection = collection(this.firestore, 'products');

  getProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(this.firestore, `products/${id}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Product;
      }
      return null;
    } catch (err) {
      console.error('Error fetching product by ID:', err);
      return null;
    }
  }

  getFeaturedProducts(count: number = 8): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(p => p.isActive !== false).slice(0, count))
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const q = query(
      this.productsCollection,
      where('category', '==', category)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  async uploadImage(file: File): Promise<string> {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `products/${Date.now()}_${cleanName}`;
    const storageRef = ref(this.storage, fileName);

    await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg'
    });

    return await getDownloadURL(storageRef);
  }

  async compressImageToDataUrl(
    file: File,
    maxWidth = 800,
    maxHeight = 1000,
    quality = 0.76
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  async addProduct(product: Product, imageFile?: File | null): Promise<void> {
    let imageUrl = product.imageUrl || '';
    if (imageFile) {
      try {
        imageUrl = await this.uploadImage(imageFile);
      } catch (storageErr) {
        console.warn('Firebase Storage bucket locked/unavailable. Falling back to direct optimized web image:', storageErr);
        imageUrl = await this.compressImageToDataUrl(imageFile);
      }
    }

    const price = Number(product.price);
    const originalPrice = product.originalPrice ? Number(product.originalPrice) : price;
    const discountPercent = originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : (product.discountPercent || 0);

    await addDoc(this.productsCollection, {
      name: product.name,
      price,
      originalPrice,
      discountPercent,
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description || '',
      imageUrl: imageUrl,
      images: product.images || [imageUrl],
      badge: product.badge || '',
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black'],
      stock: Number(product.stock) || 10,
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      isFeatured: product.isFeatured ?? true,
      isActive: product.isActive ?? true,
      tags: product.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    await updateDoc(productRef, {
      ...product,
      updatedAt: serverTimestamp()
    });
  }

  async deleteProduct(id: string): Promise<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    await deleteDoc(productRef);
  }
}