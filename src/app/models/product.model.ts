export interface Product {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  subcategory?: string;
  description: string;
  imageUrl: string;
  images?: string[];
  badge?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  tags?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}