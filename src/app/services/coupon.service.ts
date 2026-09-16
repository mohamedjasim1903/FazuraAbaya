import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, of, catchError } from 'rxjs';
import { Coupon } from '../models/coupon.model';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private firestore = inject(Firestore);

  /** Validate a coupon code against Firestore */
  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmount: 0, message: 'Please enter a coupon code.' };
    }

    try {
      const colRef = collection(this.firestore, 'coupons');
      const q = query(colRef, where('code', '==', cleanCode), where('isActive', '==', true));
      const snap = await getDocs(q);

      if (snap.empty) {
        // Fallback check: hardcoded promo codes for instant preview if firestore empty
        if (cleanCode === 'WELCOME10') {
          const discount = Math.round(subtotal * 0.10);
          return {
            valid: true,
            discountAmount: discount,
            message: '10% Welcome Discount applied!',
            coupon: {
              code: 'WELCOME10',
              discountType: 'percentage',
              discountValue: 10,
              minOrderAmount: 1000,
              isActive: true,
              description: '10% off your order'
            }
          };
        }
        if (cleanCode === 'FAZURA500') {
          if (subtotal < 3000) {
            return { valid: false, discountAmount: 0, message: 'Code FAZURA500 requires a minimum order of ₹3,000.' };
          }
          return {
            valid: true,
            discountAmount: 500,
            message: '₹500 Flat discount applied!',
            coupon: {
              code: 'FAZURA500',
              discountType: 'fixed',
              discountValue: 500,
              minOrderAmount: 3000,
              isActive: true,
              description: '₹500 off on ₹3,000+'
            }
          };
        }
        return { valid: false, discountAmount: 0, message: 'Invalid or expired coupon code.' };
      }

      const docData = snap.docs[0].data() as Coupon;
      const coupon: Coupon = { ...docData, id: snap.docs[0].id };

      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon.`
        };
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.discountValue;
      }

      // Discount cannot exceed subtotal
      discount = Math.min(discount, subtotal);

      return {
        valid: true,
        coupon,
        discountAmount: discount,
        message: `Coupon ${coupon.code} applied successfully!`
      };
    } catch (err) {
      console.error('Coupon validation error:', err);
      return { valid: false, discountAmount: 0, message: 'Failed to validate coupon. Try again.' };
    }
  }

  /** Admin: Get all coupons */
  getAllCoupons(): Observable<Coupon[]> {
    const colRef = collection(this.firestore, 'coupons');
    return (collectionData(colRef, { idField: 'id' }) as Observable<Coupon[]>).pipe(
      catchError(err => {
        console.warn('Could not load coupons list:', err);
        return of([] as Coupon[]);
      })
    );
  }

  /** Admin: Create or update coupon */
  async saveCoupon(coupon: Partial<Coupon>): Promise<void> {
    const cleanCode = coupon.code?.trim().toUpperCase() || 'PROMO';
    const docRef = doc(this.firestore, `coupons/${cleanCode}`);
    await setDoc(docRef, {
      ...coupon,
      code: cleanCode,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  /** Admin: Delete coupon */
  async deleteCoupon(code: string): Promise<void> {
    const docRef = doc(this.firestore, `coupons/${code}`);
    await deleteDoc(docRef);
  }
}
