import { Injectable, signal } from '@angular/core';
import { PaymentMethod, PaymentType } from '../models/payment-method.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  paymentMethods = signal<PaymentMethod[]>([]);

  constructor(private auth: AuthService) {
    this.loadForCurrentUser();
  }

  loadForCurrentUser(): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) {
      this.paymentMethods.set([]);
      return;
    }

    const raw = localStorage.getItem(this.storageKey(userId));
    if (!raw) {
      this.paymentMethods.set([]);
      return;
    }

    try {
      this.paymentMethods.set(JSON.parse(raw) as PaymentMethod[]);
    } catch {
      this.paymentMethods.set([]);
    }
  }

  addMethod(type: PaymentType, data: { label: string; cardNumber?: string; brand?: string; upiId?: string }): PaymentMethod | null {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return null;

    const methods = [...this.paymentMethods()];
    const isFirst = methods.length === 0;

    const method: PaymentMethod = {
      id: crypto.randomUUID(),
      type,
      label: data.label.trim(),
      isDefault: isFirst,
      details: {}
    };

    if (type === 'card' && data.cardNumber) {
      const digits = data.cardNumber.replace(/\D/g, '');
      method.details.last4 = digits.slice(-4);
      method.details.brand = data.brand || 'Card';
    }

    if (type === 'upi' && data.upiId) {
      method.details.upiId = data.upiId.trim();
    }

    methods.push(method);
    this.persist(userId, methods);
    return method;
  }

  removeMethod(id: string): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;

    let methods = this.paymentMethods().filter(m => m.id !== id);
    if (methods.length && !methods.some(m => m.isDefault)) {
      methods = methods.map((m, i) => ({ ...m, isDefault: i === 0 }));
    }

    this.persist(userId, methods);
  }

  setDefault(id: string): void {
    const userId = this.auth.currentUser()?.userId;
    if (!userId) return;

    const methods = this.paymentMethods().map(m => ({
      ...m,
      isDefault: m.id === id
    }));

    this.persist(userId, methods);
  }

  getDefault(): PaymentMethod | undefined {
    return this.paymentMethods().find(m => m.isDefault);
  }

  private persist(userId: string, methods: PaymentMethod[]): void {
    localStorage.setItem(this.storageKey(userId), JSON.stringify(methods));
    this.paymentMethods.set(methods);
  }

  private storageKey(userId: string): string {
    return `fazura_payment_methods_${userId}`;
  }
}
