import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  getReviewsByProduct(productId: string): Observable<Review[]> {
    const colRef = collection(this.firestore, 'reviews');
    const q = query(colRef, where('productId', '==', productId));
    return collectionData(q, { idField: 'id' }) as Observable<Review[]>;
  }

  async addReview(productId: string, rating: number, comment: string, title?: string): Promise<string> {
    const uid = this.auth.getUserId();
    const current = this.auth.currentUser();
    if (!uid) throw new Error('Please login to write a review');

    const colRef = collection(this.firestore, 'reviews');
    const reviewDoc = await addDoc(colRef, {
      productId,
      userId: uid,
      userName: current?.name || 'Fazura Customer',
      rating,
      title: title || '',
      comment,
      verifiedPurchase: true,
      createdAt: serverTimestamp()
    });

    // Recalculate average rating on product
    await this.updateProductAggregate(productId);

    return reviewDoc.id;
  }

  private async updateProductAggregate(productId: string): Promise<void> {
    try {
      const colRef = collection(this.firestore, 'reviews');
      const q = query(colRef, where('productId', '==', productId));
      const snap = await getDocs(q);

      if (snap.empty) return;

      let totalRating = 0;
      snap.forEach(d => {
        totalRating += d.data()['rating'] || 5;
      });

      const avgRating = Number((totalRating / snap.size).toFixed(1));
      const productRef = doc(this.firestore, `products/${productId}`);
      await updateDoc(productRef, {
        rating: avgRating,
        reviewCount: snap.size
      });
    } catch (err) {
      console.warn('Could not update product rating aggregate:', err);
    }
  }
}
