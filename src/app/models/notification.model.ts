export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  type?: 'order' | 'promo' | 'system';
  createdAt: any;
}
