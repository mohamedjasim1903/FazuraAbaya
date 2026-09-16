import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { PaymentType } from '../../models/payment-method.model';
import { Order } from '../../models/order.model';
import { Address } from '../../models/address.model';
import { AddressFormComponent } from '../../components/address-form/address-form.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddressFormComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  public auth = inject(AuthService);
  public payment = inject(PaymentService);
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private router = inject(Router);

  activeTab: 'profile' | 'addresses' | 'orders' | 'payments' = 'orders';

  // Profile Form
  profileName = '';
  profilePhone = '';
  profileUpdating = false;
  profileSuccess = '';
  profileError = '';

  // Addresses
  addresses: Address[] = [];
  showAddressModal = false;
  editingAddress: Address | null = null;

  // Orders
  orders: Order[] = [];

  // Payment Form
  showAddPaymentForm = false;
  newType: PaymentType = 'card';
  newLabel = '';
  newCardNumber = '';
  newBrand = 'Visa';
  newUpiId = '';
  formError = '';

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.profileName = user.name || '';
      this.profilePhone = user.phone || '';

      this.orderService.getMyOrders(user.userId).subscribe(orders => {
        this.orders = orders;
      });

      this.addressService.getAddresses().subscribe(addrs => {
        this.addresses = addrs;
      });
    }

    this.payment.loadForCurrentUser();
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/']);
  }

  async updateProfile(): Promise<void> {
    this.profileUpdating = true;
    this.profileSuccess = '';
    this.profileError = '';

    const res = await this.auth.updateProfileData({
      name: this.profileName.trim(),
      phone: this.profilePhone.trim()
    });

    if (res.success) {
      this.profileSuccess = 'Profile details updated successfully.';
    } else {
      this.profileError = res.error || 'Failed to update profile.';
    }
    this.profileUpdating = false;
  }

  // Address Handlers
  openAddAddress(): void {
    this.editingAddress = null;
    this.showAddressModal = true;
  }

  openEditAddress(addr: Address): void {
    this.editingAddress = addr;
    this.showAddressModal = true;
  }

  async onSaveAddress(addr: Address): Promise<void> {
    if (this.editingAddress?.id) {
      await this.addressService.updateAddress(this.editingAddress.id, addr);
    } else {
      await this.addressService.addAddress(addr);
    }
    this.showAddressModal = false;
    this.editingAddress = null;
  }

  async deleteAddress(id?: string): Promise<void> {
    if (id && confirm('Are you sure you want to remove this address?')) {
      await this.addressService.deleteAddress(id);
    }
  }

  async setDefaultAddress(id?: string): Promise<void> {
    if (id) {
      await this.addressService.setDefaultAddress(id);
    }
  }

  // Payment Handlers
  toggleAddPayment(): void {
    this.showAddPaymentForm = !this.showAddPaymentForm;
    this.formError = '';
  }

  addPaymentMethod(): void {
    this.formError = '';

    if (!this.newLabel.trim()) {
      this.formError = 'Please enter a label for this payment method.';
      return;
    }

    if (this.newType === 'card') {
      const digits = this.newCardNumber.replace(/\D/g, '');
      if (digits.length < 4) {
        this.formError = 'Please enter a valid card number.';
        return;
      }
      this.payment.addMethod('card', {
        label: this.newLabel,
        cardNumber: digits,
        brand: this.newBrand
      });
    } else if (this.newType === 'upi') {
      if (!this.newUpiId.includes('@')) {
        this.formError = 'Please enter a valid UPI ID (e.g. name@upi).';
        return;
      }
      this.payment.addMethod('upi', {
        label: this.newLabel,
        upiId: this.newUpiId
      });
    } else {
      this.payment.addMethod('cod', { label: this.newLabel || 'Cash on Delivery' });
    }

    this.showAddPaymentForm = false;
    this.newLabel = '';
    this.newCardNumber = '';
    this.newUpiId = '';
    this.newType = 'card';
  }

  getMethodDisplay(method: { type: PaymentType; details: { last4?: string; brand?: string; upiId?: string } }): string {
    if (method.type === 'card') {
      return `${method.details.brand || 'Card'} •••• ${method.details.last4}`;
    }
    if (method.type === 'upi') {
      return method.details.upiId || 'UPI';
    }
    return 'Pay when your order arrives';
  }

  getOrderDate(order: Order): Date | null {
    if (!order.createdAt) return null;
    const ca: any = order.createdAt;
    if (typeof ca?.toDate === 'function') return ca.toDate();
    if (ca?.seconds) return new Date(ca.seconds * 1000);
    if (ca instanceof Date) return ca;
    if (typeof ca === 'string' || typeof ca === 'number') return new Date(ca);
    return null;
  }
}
