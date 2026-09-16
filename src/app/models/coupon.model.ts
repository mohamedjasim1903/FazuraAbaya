export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate?: any;
  usageLimit?: number;
  usageCount?: number;
  isActive: boolean;
  description?: string;
}
