import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from '@angular/fire/firestore';
import { Observable, of, catchError } from 'rxjs';

import { Order, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private ordersCollection = collection(this.firestore, 'orders');

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `FAZ-${timestamp}-${random}`;
  }

  /** Remove keys whose value is `undefined` — Firestore rejects them. */
  private stripUndefined(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined)
    );
  }

  async placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'> & { status?: OrderStatus }): Promise<string> {
    const defaultPaymentStatus = order.paymentStatus ||
      (order.paymentLabel?.toLowerCase().includes('cash') ? 'Cash on Delivery' : 'Paid');

    const orderNumber = order.orderNumber || this.generateOrderNumber();

    const payload = this.stripUndefined({
      ...order,
      orderNumber,
      status: order.status || ('Pending' as OrderStatus),
      paymentStatus: defaultPaymentStatus,
      returnRequested: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const docRef = await addDoc(this.ordersCollection, payload);

    // Best-effort inventory decrement
    this.decrementStock(order.items);

    return docRef.id;
  }

  private async decrementStock(items: any[]): Promise<void> {
    for (const item of items) {
      if (item.productId || item.id) {
        const prodId = item.productId || item.id;
        const qty = item.quantity || 1;
        try {
          const prodRef = doc(this.firestore, `products/${prodId}`);
          await updateDoc(prodRef, {
            stock: increment(-qty)
          });
        } catch (err) {
          console.warn(`Could not decrement stock for product ${prodId}:`, err);
        }
      }
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(this.firestore, `orders/${orderId}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Order;
      }
      return null;
    } catch (err) {
      console.error('Error fetching order by ID:', err);
      return null;
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const q = query(this.ordersCollection, where('orderNumber', '==', orderNumber.trim()));
      const { getDocs } = await import('@angular/fire/firestore');
      const docsSnap = await getDocs(q);
      if (!docsSnap.empty) {
        const docSnap = docsSnap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Order;
      }
      return null;
    } catch (err) {
      console.error('Error fetching order by orderNumber:', err);
      return null;
    }
  }

  getMyOrders(userId: string): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return (collectionData(q, { idField: 'id' }) as Observable<Order[]>).pipe(
      catchError(err => {
        console.warn('Could not fetch user orders:', err);
        return of([] as Order[]);
      })
    );
  }

  getAllOrders(): Observable<Order[]> {
    const q = query(this.ordersCollection, orderBy('createdAt', 'desc'));
    return (collectionData(q, { idField: 'id' }) as Observable<Order[]>).pipe(
      catchError(err => {
        console.warn('Could not fetch all orders in admin:', err);
        return of([] as Order[]);
      })
    );
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await updateDoc(doc(this.firestore, `orders/${orderId}`), {
      status,
      updatedAt: serverTimestamp()
    });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<void> {
    await updateDoc(doc(this.firestore, `orders/${orderId}`), {
      paymentStatus,
      updatedAt: serverTimestamp()
    });
  }

  async updateTrackingNumber(orderId: string, trackingNumber: string): Promise<void> {
    await updateDoc(doc(this.firestore, `orders/${orderId}`), {
      trackingNumber,
      updatedAt: serverTimestamp()
    });
  }

  async requestReturn(orderId: string, reason: string): Promise<void> {
    await updateDoc(doc(this.firestore, `orders/${orderId}`), {
      returnRequested: true,
      returnReason: reason,
      updatedAt: serverTimestamp()
    });
  }
}
