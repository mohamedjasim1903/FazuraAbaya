import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { CouponService } from '../../services/coupon.service';
import { PaymentMethod } from '../../models/payment-method.model';
import { Address } from '../../models/address.model';
import { AddressFormComponent } from '../../components/address-form/address-form.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AddressFormComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  public cart = inject(CartService);
  public payment = inject(PaymentService);
  public auth = inject(AuthService);
  private orders = inject(OrderService);
  private addressService = inject(AddressService);
  private couponService = inject(CouponService);
  private router = inject(Router);

  // Address
  addresses: Address[] = [];
  selectedAddressId: string = '';
  showAddressModal = false;

  // Coupon
  couponInput = '';
  appliedCouponCode = '';
  discountAmount = 0;
  couponMessage = '';
  couponError = '';
  validatingCoupon = false;

  // Payment
  selectedMethodId = '';
  orderPlaced = false;
  createdOrderId = '';
  placing = false;
  error = '';

  ngOnInit(): void {
    this.payment.loadForCurrentUser();

    // Default payment method
    const defaultMethod = this.payment.getDefault();
    if (defaultMethod) {
      this.selectedMethodId = defaultMethod.id;
    } else if (this.payment.paymentMethods().length > 0) {
      this.selectedMethodId = this.payment.paymentMethods()[0].id;
    }

    // Load user addresses
    this.addressService.getAddresses().subscribe(addrs => {
      this.addresses = addrs;
      if (!this.selectedAddressId && addrs.length > 0) {
        const def = addrs.find(a => a.isDefault);
        this.selectedAddressId = def?.id || addrs[0].id || '';
      }
    });
  }

  get selectedAddress(): Address | undefined {
    return this.addresses.find(a => a.id === this.selectedAddressId);
  }

  get shipping(): number {
    return this.cart.getTotal() >= 5000 ? 0 : 299;
  }

  get subtotal(): number {
    return this.cart.getTotal();
  }

  get total(): number {
    const amount = this.subtotal - this.discountAmount + this.shipping;
    return Math.max(0, amount);
  }

  async applyCoupon(): Promise<void> {
    if (!this.couponInput.trim()) return;

    this.validatingCoupon = true;
    this.couponError = '';
    this.couponMessage = '';

    const res = await this.couponService.validateCoupon(this.couponInput.trim(), this.subtotal);
    if (res.valid) {
      this.discountAmount = res.discountAmount;
      this.appliedCouponCode = res.coupon?.code || this.couponInput.trim().toUpperCase();
      this.couponMessage = res.message || 'Discount applied!';
    } else {
      this.discountAmount = 0;
      this.appliedCouponCode = '';
      this.couponError = res.message || 'Invalid coupon.';
    }
    this.validatingCoupon = false;
  }

  removeCoupon(): void {
    this.discountAmount = 0;
    this.appliedCouponCode = '';
    this.couponInput = '';
    this.couponMessage = '';
    this.couponError = '';
  }

  getMethodDisplay(method: PaymentMethod): string {
    if (method.type === 'card') {
      return `${method.details.brand || 'Card'} •••• ${method.details.last4}`;
    }
    if (method.type === 'upi') {
      return method.details.upiId || 'UPI';
    }
    return 'Cash on Delivery';
  }

  async onSaveNewAddress(addr: Address): Promise<void> {
    const newId = await this.addressService.addAddress(addr);
    this.selectedAddressId = newId;
    this.showAddressModal = false;
  }

  async placeOrder(): Promise<void> {
    this.error = '';

    if (this.cart.getCart().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    if (!this.selectedAddress) {
      this.error = 'Please select or add a delivery address.';
      return;
    }

    if (!this.selectedMethodId) {
      this.error = 'Please select a payment method.';
      return;
    }

    const user = this.auth.currentUser();
    if (!user) {
      this.error = 'Please sign in to place an order.';
      return;
    }

    const method = this.payment.paymentMethods().find(m => m.id === this.selectedMethodId);

    this.placing = true;

    try {
      const orderId = await this.orders.placeOrder({
        userId: user.userId,
        userEmail: user.email,
        customerName: this.selectedAddress.fullName,
        customerPhone: this.selectedAddress.phone,
        items: this.cart.getCart().map(p => ({
          productId: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          size: p.selectedSize || 'Free Size',
          color: p.selectedColor || 'Standard',
          quantity: p.quantity || 1
        })),
        subtotal: this.subtotal,
        discount: this.discountAmount,
        couponCode: this.appliedCouponCode || '',
        shipping: this.shipping,
        total: this.total,
        deliveryAddress: this.selectedAddress,
        shippingAddress: `${this.selectedAddress.addressLine1}, ${this.selectedAddress.city}, ${this.selectedAddress.state} - ${this.selectedAddress.postalCode}`,
        paymentLabel: method ? this.getMethodDisplay(method) : 'Cash on Delivery'
      });

      this.createdOrderId = orderId;
      this.orderPlaced = true;
      this.cart.clear();
    } catch (err) {
      console.error('Failed to place order:', err);
      this.error = 'Something went wrong placing your order. Please try again.';
    } finally {
      this.placing = false;
    }
  }
}
