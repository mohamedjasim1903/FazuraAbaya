import { Address } from './address.model';

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role?: 'customer' | 'admin' | string;
  adminFlag?: boolean;
  isAdmin?: boolean;
  admin?: boolean;
  wishlist?: string[];
  addresses?: Address[];
  createdAt?: unknown;
  updatedAt?: unknown;
}
