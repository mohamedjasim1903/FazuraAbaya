import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { UserService, UserRecord } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

import { Product } from '../../models/product.model';
import { Order, OrderStatus } from '../../models/order.model';

export type AdminTab = 'dashboard' | 'products' | 'add' | 'orders' | 'users' | 'coupons';

export interface CategoryOption {
  id: string;
  name: string;
}

import { CouponService } from '../../services/coupon.service';
import { Coupon } from '../../models/coupon.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  activeTab: AdminTab = 'dashboard';

  // Available options
  readonly availableSizes: string[] = ['50', '52', '54', '56', '58', '60'];
  readonly availableColors: string[] = ['Black', 'Midnight Blue', 'Olive Green', 'Deep Maroon', 'Champagne Gold', 'Dusty Rose', 'Pure White'];
  
  categories: CategoryOption[] = [
    { id: 'dubai', name: 'Dubai Abaya' },
    { id: 'kaftan', name: 'Kaftan Abaya' },
    { id: 'open', name: 'Open Abaya' },
    { id: 'premium', name: 'Premium Abaya' },
    { id: 'bridal', name: 'Bridal Collection' },
    { id: 'casual', name: 'Casual Wear' }
  ];

  readonly statusOptions: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

  readonly paymentStatusOptions: string[] = [
    'Paid',
    'Pending',
    'Cash on Delivery',
    'Refunded'
  ];

  // --- Coupons state ---
  coupons: Coupon[] = [];
  newCoupon: Partial<Coupon> = {
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    isActive: true,
    description: ''
  };

  // --- Add Product form state ---
  product: Product = {
    name: '',
    price: 0,
    category: 'dubai',
    description: '',
    imageUrl: '',
    badge: '',
    sizes: ['52', '54', '56'],
    colors: ['Black'],
    stock: 25
  };
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  uploading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  // --- Products management state ---
  products: Product[] = [];
  productSearch = '';
  productCategoryFilter = 'all';
  editingId: string | null = null;
  editDraft: Partial<Product> = {};

  // --- Orders state ---
  orders: Order[] = [];
  orderSearch = '';
  orderStatusFilter = 'all';
  selectedOrder: Order | null = null;
  trackingNumberInput = '';

  // --- Users state ---
  users: UserRecord[] = [];
  userSearch = '';

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private userService: UserService,
    private couponService: CouponService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.currentUser();

    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products;
      },
      error: err => console.error('Failed to load products in admin:', err)
    });

    this.orderService.getAllOrders().subscribe({
      next: orders => {
        this.orders = orders;
      },
      error: err => console.error('Failed to load orders in admin:', err)
    });

    this.userService.getAllUsers().subscribe({
      next: users => {
        this.users = users;
      },
      error: err => console.error('Failed to load users in admin:', err)
    });

    this.couponService.getAllCoupons().subscribe({
      next: coupons => {
        this.coupons = coupons;
      },
      error: err => console.error('Failed to load coupons in admin:', err)
    });
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.message = '';
    if (tab !== 'products') {
      this.cancelEdit();
    }
  }

  // ---------- Analytics & Computed Stats ----------

  get totalProducts(): number {
    return this.products.length;
  }

  get totalOrders(): number {
    return this.orders.length;
  }

  get totalSales(): number {
    return this.orders.reduce((sum, o) => {
      const isCancelled = o.status?.toLowerCase() === 'cancelled';
      return isCancelled ? sum : sum + (Number(o.total) || 0);
    }, 0);
  }

  get pendingOrdersCount(): number {
    return this.orders.filter(o => {
      const s = o.status?.toLowerCase();
      return s === 'pending' || s === 'placed';
    }).length;
  }

  get lowStockProducts(): Product[] {
    return this.products.filter(p => (p.stock !== undefined && p.stock <= 5));
  }

  get recentOrders(): Order[] {
    return this.orders.slice(0, 6);
  }

  // ---------- Filtered lists ----------

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchesSearch = !this.productSearch.trim() ||
        p.name.toLowerCase().includes(this.productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(this.productSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(this.productSearch.toLowerCase()));

      const matchesCat = this.productCategoryFilter === 'all' || p.category === this.productCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }

  get filteredOrders(): Order[] {
    return this.orders.filter(o => {
      const matchesSearch = !this.orderSearch.trim() ||
        o.userEmail?.toLowerCase().includes(this.orderSearch.toLowerCase()) ||
        o.id?.toLowerCase().includes(this.orderSearch.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(this.orderSearch.toLowerCase());

      const matchesStatus = this.orderStatusFilter === 'all' ||
        o.status?.toLowerCase() === this.orderStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  get filteredUsers(): UserRecord[] {
    return this.users.filter(u => {
      const term = this.userSearch.toLowerCase().trim();
      if (!term) return true;
      return (u.email && u.email.toLowerCase().includes(term)) ||
        (u.name && u.name.toLowerCase().includes(term));
    });
  }

  // ---------- Helpers ----------

  getCategoryName(id: string): string {
    const found = this.categories.find(c => c.id === id);
    return found ? found.name : id;
  }

  getOrderDate(order: Order): Date | null {
    if (!order.createdAt) return null;
    const ca: any = order.createdAt;
    if (typeof ca?.toDate === 'function') {
      return ca.toDate();
    }
    if (ca?.seconds) {
      return new Date(ca.seconds * 1000);
    }
    if (ca instanceof Date) {
      return ca;
    }
    if (typeof ca === 'string' || typeof ca === 'number') {
      return new Date(ca);
    }
    return null;
  }

  normalizeStatus(status?: string): string {
    if (!status) return 'Pending';
    const s = status.toLowerCase();
    if (s === 'placed' || s === 'pending') return 'Pending';
    if (s === 'confirmed') return 'Confirmed';
    if (s === 'processing') return 'Processing';
    if (s === 'shipped') return 'Shipped';
    if (s === 'delivered') return 'Delivered';
    if (s === 'cancelled') return 'Cancelled';
    return status;
  }

  // ---------- Add Product ----------

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleSize(size: string, targetArray: string[]): void {
    const idx = targetArray.indexOf(size);
    if (idx > -1) {
      targetArray.splice(idx, 1);
    } else {
      targetArray.push(size);
    }
  }

  toggleColor(color: string, targetArray: string[]): void {
    const idx = targetArray.indexOf(color);
    if (idx > -1) {
      targetArray.splice(idx, 1);
    } else {
      targetArray.push(color);
    }
  }

  storageError = false;

  async addProduct(): Promise<void> {
    this.storageError = false;

    if (!this.product.name.trim() || !this.product.category || !this.product.price) {
      this.message = 'Please fill in product name, category, and price.';
      this.messageType = 'error';
      return;
    }

    if (!this.selectedFile && !this.product.imageUrl) {
      this.message = 'Please select an image file or provide an image URL.';
      this.messageType = 'error';
      return;
    }

    try {
      this.uploading = true;
      this.message = 'Saving product to Firebase...';
      this.messageType = 'success';

      await this.productService.addProduct(this.product, this.selectedFile);

      this.message = `Product "${this.product.name}" added successfully!`;
      this.messageType = 'success';
      this.storageError = false;

      // Reset form
      this.product = {
        name: '',
        price: 0,
        category: 'dubai',
        description: '',
        imageUrl: '',
        badge: '',
        sizes: ['52', '54', '56'],
        colors: ['Black'],
        stock: 25
      };
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    } catch (error: any) {
      console.error('Failed to add product:', error);
      const isStorageUnauthorized =
        error?.code === 'storage/unauthorized' ||
        error?.message?.includes('storage/unauthorized') ||
        error?.message?.includes('403') ||
        error?.message?.includes('permission');

      if (isStorageUnauthorized) {
        this.storageError = true;
        this.message = 'Firebase Storage permission denied (storage/unauthorized). Please update your Storage Rules in the Firebase Console to allow uploads, or use a direct image URL below.';
      } else {
        this.message = error?.message || 'Failed to add product. Please check connection and permissions.';
      }
      this.messageType = 'error';
    } finally {
      this.uploading = false;
    }
  }


  // ---------- Manage Products ----------

  startEdit(product: Product): void {
    this.editingId = product.id || null;
    this.editDraft = {
      ...product,
      sizes: product.sizes ? [...product.sizes] : ['52', '54', '56'],
      colors: product.colors ? [...product.colors] : ['Black']
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDraft = {};
  }

  async saveEdit(id: string): Promise<void> {
    try {
      await this.productService.updateProduct(id, {
        name: this.editDraft.name,
        price: Number(this.editDraft.price),
        category: this.editDraft.category,
        description: this.editDraft.description,
        badge: this.editDraft.badge || '',
        imageUrl: this.editDraft.imageUrl,
        sizes: this.editDraft.sizes || [],
        colors: this.editDraft.colors || [],
        stock: Number(this.editDraft.stock) || 0
      });
      this.cancelEdit();
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Failed to update product.');
    }
  }

  async removeProduct(id: string | undefined): Promise<void> {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await this.productService.deleteProduct(id);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product.');
    }
  }

  // ---------- Orders ----------

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  async updateOrderStatus(orderId: string | undefined, status: OrderStatus): Promise<void> {
    if (!orderId) return;

    try {
      await this.orderService.updateStatus(orderId, status);
      if (this.selectedOrder && this.selectedOrder.id === orderId) {
        this.selectedOrder.status = status;
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status.');
    }
  }

  async updateOrderPaymentStatus(orderId: string | undefined, paymentStatus: string): Promise<void> {
    if (!orderId) return;

    try {
      await this.orderService.updatePaymentStatus(orderId, paymentStatus);
      if (this.selectedOrder && this.selectedOrder.id === orderId) {
        this.selectedOrder.paymentStatus = paymentStatus;
      }
    } catch (err) {
      console.error('Failed to update payment status:', err);
      alert('Failed to update payment status.');
    }
  }

  // ---------- Users ----------

  isUserAdmin(user: UserRecord): boolean {
    return user.adminFlag === true || user.isAdmin === true || user.admin === true || user.role === 'admin';
  }

  async toggleAdmin(user: UserRecord): Promise<void> {
    if (user.id === this.auth.currentUser()?.userId) {
      alert("You cannot change your own admin status.");
      return;
    }

    const currentAdminState = this.isUserAdmin(user);
    const nextState = !currentAdminState;

    const actionText = nextState ? 'grant admin privileges to' : 'revoke admin privileges from';
    if (!confirm(`Are you sure you want to ${actionText} ${user.email}?`)) {
      return;
    }

    try {
      await this.userService.setAdmin(user.id, nextState);
      user.admin = nextState;
      user.adminFlag = nextState;
      user.isAdmin = nextState;
      user.role = nextState ? 'admin' : 'user';
    } catch (err) {
      console.error('Failed to update user role:', err);
      alert('Failed to update user role. Please verify permissions.');
    }
  }

  // ---------- Coupons & Tracking ----------

  async saveNewCoupon(): Promise<void> {
    if (!this.newCoupon.code?.trim()) {
      alert('Please enter a coupon code.');
      return;
    }

    try {
      await this.couponService.saveCoupon(this.newCoupon);
      alert(`Coupon ${this.newCoupon.code?.toUpperCase()} saved successfully!`);
      this.newCoupon = {
        code: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 1000,
        isActive: true,
        description: ''
      };
    } catch (err) {
      console.error('Failed to save coupon:', err);
      alert('Failed to save coupon.');
    }
  }

  async deleteCoupon(code: string): Promise<void> {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      try {
        await this.couponService.deleteCoupon(code);
      } catch (err) {
        console.error('Failed to delete coupon:', err);
        alert('Failed to delete coupon.');
      }
    }
  }

  async setOrderTracking(orderId: string | undefined): Promise<void> {
    if (!orderId || !this.trackingNumberInput.trim()) return;

    try {
      await this.orderService.updateTrackingNumber(orderId, this.trackingNumberInput.trim());
      if (this.selectedOrder && this.selectedOrder.id === orderId) {
        this.selectedOrder.trackingNumber = this.trackingNumberInput.trim();
      }
      alert('Tracking number updated successfully!');
      this.trackingNumberInput = '';
    } catch (err) {
      console.error('Failed to update tracking number:', err);
      alert('Failed to update tracking number.');
    }
  }
}
