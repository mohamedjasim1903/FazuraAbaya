export type PaymentType = 'card' | 'upi' | 'cod';

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  isDefault: boolean;
  details: {
    last4?: string;
    brand?: string;
    upiId?: string;
  };
}
