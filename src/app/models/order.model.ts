import { Address } from './address.model';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'pending'
  | 'confirmed'
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  imageUrl: string;
  size?: string;
  color?: string;
  quantity?: number;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  userId: string;
  userEmail: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  couponCode?: string;
  total: number;
  paymentLabel: string;
  paymentMethod?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Cash on Delivery' | 'Refunded' | string;
  status: OrderStatus;
  shippingAddress?: string;
  deliveryAddress?: Address;
  notes?: string;
  trackingNumber?: string;
  returnRequested?: boolean;
  returnReason?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
