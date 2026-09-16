import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Notification } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  getUserNotifications(): Observable<Notification[]> {
    const uid = this.auth.getUserId();
    if (!uid) return of([]);

    const colRef = collection(this.firestore, 'notifications');
    const q = query(colRef, where('userId', '==', uid));
    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(this.firestore, `notifications/${notificationId}`);
    await updateDoc(docRef, { isRead: true });
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    linkUrl?: string,
    type: 'order' | 'promo' | 'system' = 'order'
  ): Promise<void> {
    const colRef = collection(this.firestore, 'notifications');
    await addDoc(colRef, {
      userId,
      title,
      message,
      linkUrl: linkUrl || '',
      type,
      isRead: false,
      createdAt: serverTimestamp()
    });
  }
}
