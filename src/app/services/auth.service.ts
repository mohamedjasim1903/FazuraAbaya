import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from '@angular/fire/firestore';

import { UserProfile } from '../models/user.model';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
  isAdmin: boolean;
  adminFlag: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  /** Signed-in user, combining Firebase Auth identity + Firestore profile. */
  currentUser = signal<AuthSession | null>(null);

  /** Flips true once the initial auth state has resolved (used by route guards). */
  ready = signal(false);

  constructor() {
    authState(this.auth).subscribe(firebaseUser => this.onAuthStateChanged(firebaseUser));
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.isAdmin === true || this.currentUser()?.adminFlag === true;
  }

  hasAdminFlag(): boolean {
    return this.isAdmin();
  }

  getUserId(): string | null {
    return this.currentUser()?.userId || null;
  }

  async register(name: string, email: string, password: string, phone?: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth,
        normalizedEmail,
        password
      );

      await updateProfile(credential.user, { displayName: name.trim() });

      const profile: UserProfile = {
        uid: credential.user.uid,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || '',
        adminFlag: false,
        isAdmin: false,
        admin: false,
        role: 'customer',
        wishlist: [],
        addresses: []
      };

      await setDoc(doc(this.firestore, `users/${credential.user.uid}`), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      this.currentUser.set({
        userId: credential.user.uid,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        isAdmin: false,
        adminFlag: false
      });
      this.ready.set(true);

      return { success: true };
    } catch (err) {
      return { success: false, error: this.mapError(err) };
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const credential = await signInWithEmailAndPassword(
        this.auth,
        email.trim().toLowerCase(),
        password
      );

      await this.onAuthStateChanged(credential.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: this.mapError(err) };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(this.auth, email.trim().toLowerCase());
      return { success: true };
    } catch (err) {
      return { success: false, error: this.mapError(err) };
    }
  }

  async updateProfileData(data: { name?: string; phone?: string; photoURL?: string }): Promise<AuthResult> {
    const uid = this.getUserId();
    if (!uid) return { success: false, error: 'Not authenticated' };

    try {
      if (this.auth.currentUser && (data.name || data.photoURL)) {
        await updateProfile(this.auth.currentUser, {
          displayName: data.name ?? this.auth.currentUser.displayName,
          photoURL: data.photoURL ?? this.auth.currentUser.photoURL
        });
      }

      await updateDoc(doc(this.firestore, `users/${uid}`), {
        ...data,
        updatedAt: serverTimestamp()
      });

      const current = this.currentUser();
      if (current) {
        this.currentUser.set({
          ...current,
          name: data.name ?? current.name,
          phone: data.phone ?? current.phone,
          photoURL: data.photoURL ?? current.photoURL
        });
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: this.mapError(err) };
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const uid = this.getUserId();
    if (!uid) return null;

    try {
      const snap = await getDoc(doc(this.firestore, `users/${uid}`));
      if (snap.exists()) {
        return { uid, ...snap.data() } as UserProfile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  private async onAuthStateChanged(firebaseUser: FirebaseUser | null): Promise<void> {
    if (!firebaseUser) {
      this.currentUser.set(null);
      this.ready.set(true);
      return;
    }

    try {
      const profileSnap = await getDoc(doc(this.firestore, `users/${firebaseUser.uid}`));
      const profile = profileSnap.exists()
        ? (profileSnap.data() as Record<string, any>)
        : {};

      let customClaims: Record<string, any> = {};
      try {
        const tokenResult = await firebaseUser.getIdTokenResult();
        customClaims = tokenResult.claims || {};
      } catch (tokenErr) {
        // quiet token check
      }

      const isUserAdmin = Boolean(
        profile['adminFlag'] === true ||
        profile['isAdmin'] === true ||
        profile['admin'] === true ||
        profile['role'] === 'admin' ||
        profile['role'] === 'ADMIN' ||
        customClaims['admin'] === true ||
        customClaims['adminFlag'] === true ||
        customClaims['role'] === 'admin'
      );

      this.currentUser.set({
        userId: firebaseUser.uid,
        email: firebaseUser.email || profile['email'] || '',
        name: profile['name'] || firebaseUser.displayName || '',
        phone: profile['phone'] || '',
        photoURL: profile['photoURL'] || firebaseUser.photoURL || '',
        isAdmin: isUserAdmin,
        adminFlag: isUserAdmin
      });
    } catch (err) {
      console.error('Failed to load user profile:', err);
      this.currentUser.set({
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        isAdmin: false,
        adminFlag: false
      });
    } finally {
      this.ready.set(true);
    }
  }

  private mapError(err: unknown): string {
    const code = (err as { code?: string })?.code;

    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return 'Authentication error. Please try again.';
    }
  }
}
