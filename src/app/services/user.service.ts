import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { Observable, of, catchError } from 'rxjs';

import { UserProfile } from '../models/user.model';

export interface UserRecord extends UserProfile {
  id: string;
  admin?: boolean;
  isAdmin?: boolean;
  adminFlag?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private firestore = inject(Firestore);

  private usersCollection = collection(this.firestore, 'users');

  /**
   * Get all registered users
   */
  getAllUsers(): Observable<UserRecord[]> {
    return (collectionData(
      this.usersCollection,
      { idField: 'id' }
    ) as Observable<UserRecord[]>).pipe(
      catchError(err => {
        console.warn('Could not load users list:', err);
        return of([] as UserRecord[]);
      })
    );
  }

  /**
   * Change admin status across all flag conventions
   */
  async setAdmin(userId: string, admin: boolean): Promise<void> {
    await updateDoc(
      doc(this.firestore, `users/${userId}`),
      {
        admin,
        adminFlag: admin,
        isAdmin: admin,
        role: admin ? 'admin' : 'user'
      }
    );
  }
}

