import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  writeBatch
} from '@angular/fire/firestore';
import { Observable, of, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  getAddresses(): Observable<Address[]> {
    const uid = this.auth.getUserId();
    if (!uid) return of([]);

    const colRef = collection(this.firestore, `users/${uid}/addresses`);
    return (collectionData(colRef, { idField: 'id' }) as Observable<Address[]>).pipe(
      catchError(err => {
        console.warn('Addresses not available or permission denied:', err);
        return of([] as Address[]);
      })
    );
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<string> {
    const uid = this.auth.getUserId();
    if (!uid) throw new Error('User not authenticated');

    const colRef = collection(this.firestore, `users/${uid}/addresses`);

    // If marked default, unset other defaults
    if (address.isDefault) {
      await this.clearDefaults(uid);
    }

    const docRef = await addDoc(colRef, address);
    return docRef.id;
  }

  async updateAddress(addressId: string, data: Partial<Address>): Promise<void> {
    const uid = this.auth.getUserId();
    if (!uid) throw new Error('User not authenticated');

    if (data.isDefault) {
      await this.clearDefaults(uid);
    }

    const docRef = doc(this.firestore, `users/${uid}/addresses/${addressId}`);
    await updateDoc(docRef, data);
  }

  async deleteAddress(addressId: string): Promise<void> {
    const uid = this.auth.getUserId();
    if (!uid) throw new Error('User not authenticated');

    const docRef = doc(this.firestore, `users/${uid}/addresses/${addressId}`);
    await deleteDoc(docRef);
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    const uid = this.auth.getUserId();
    if (!uid) throw new Error('User not authenticated');

    await this.clearDefaults(uid);
    const docRef = doc(this.firestore, `users/${uid}/addresses/${addressId}`);
    await updateDoc(docRef, { isDefault: true });
  }

  private async clearDefaults(uid: string): Promise<void> {
    const colRef = collection(this.firestore, `users/${uid}/addresses`);
    const q = query(colRef, where('isDefault', '==', true));
    const snap = await getDocs(q);

    const batch = writeBatch(this.firestore);
    snap.forEach(docSnap => {
      batch.update(docSnap.ref, { isDefault: false });
    });
    await batch.commit();
  }
}
