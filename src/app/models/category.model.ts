export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  subcategories?: string[];
  displayOrder?: number;
  isActive?: boolean;
}
