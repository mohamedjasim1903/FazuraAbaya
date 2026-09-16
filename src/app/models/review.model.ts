export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: any;
}
