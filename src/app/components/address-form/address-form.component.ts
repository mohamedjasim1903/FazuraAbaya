import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="address-form-modal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ editMode ? 'Edit Shipping Address' : 'Add New Address' }}</h3>
          <button class="close-btn" (click)="cancel.emit()">✕</button>
        </div>

        <form (ngSubmit)="onSubmit()" class="form-body">
          <div class="form-row">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" [(ngModel)]="formData.fullName" name="fullName" required placeholder="e.g. Fatima Al-Zahra">
            </div>
            <div class="form-group">
              <label>Phone Number *</label>
              <input type="tel" [(ngModel)]="formData.phone" name="phone" required placeholder="+91 98765 43210">
            </div>
          </div>

          <div class="form-group">
            <label>Street Address / Apartment *</label>
            <input type="text" [(ngModel)]="formData.addressLine1" name="addressLine1" required placeholder="House/Flat No., Building, Street Area">
          </div>

          <div class="form-group">
            <label>Landmark / Suite (Optional)</label>
            <input type="text" [(ngModel)]="formData.addressLine2" name="addressLine2" placeholder="Near Grand Mosque, 2nd Floor">
          </div>

          <div class="form-row three-cols">
            <div class="form-group">
              <label>City *</label>
              <input type="text" [(ngModel)]="formData.city" name="city" required placeholder="City">
            </div>
            <div class="form-group">
              <label>State *</label>
              <input type="text" [(ngModel)]="formData.state" name="state" required placeholder="State">
            </div>
            <div class="form-group">
              <label>Postal Code *</label>
              <input type="text" [(ngModel)]="formData.postalCode" name="postalCode" required placeholder="Pincode">
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="check-label">
              <input type="checkbox" [(ngModel)]="formData.isDefault" name="isDefault">
              <span>Make this my default shipping address</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" (click)="cancel.emit()">Cancel</button>
            <button type="submit" class="btn-submit" [disabled]="!isValid()">
              {{ editMode ? 'Save Changes' : 'Deliver to this Address' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .address-form-modal {
      position: fixed;
      inset: 0;
      background: rgba(18, 17, 16, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 580px;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: #171513;
      color: #f6f3ee;
    }
    .modal-header h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.25rem;
      margin: 0;
      font-weight: 500;
    }
    .close-btn {
      background: none;
      border: none;
      color: #d1c7bc;
      font-size: 1.2rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    .close-btn:hover {
      color: #ffffff;
    }
    .form-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-row.three-cols {
      grid-template-columns: 1fr 1fr 1fr;
    }
    @media (max-width: 600px) {
      .form-row, .form-row.three-cols {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      color: #4a453e;
    }
    .form-group input[type="text"],
    .form-group input[type="tel"] {
      padding: 0.75rem 0.9rem;
      border: 1px solid #dfd8cf;
      border-radius: 6px;
      font-size: 0.92rem;
      color: #171513;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus {
      border-color: #9f803c;
    }
    .checkbox-group {
      margin-top: 0.5rem;
    }
    .check-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #333;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f0ebe4;
    }
    .btn-cancel {
      padding: 0.75rem 1.25rem;
      border: 1px solid #d9d0c5;
      background: transparent;
      color: #555;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .btn-submit {
      padding: 0.75rem 1.5rem;
      background: #171513;
      color: #f3efe9;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
      background: #9f803c;
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class AddressFormComponent implements OnInit {
  @Input() initialAddress?: Address | null;
  @Output() save = new EventEmitter<Address>();
  @Output() cancel = new EventEmitter<void>();

  editMode = false;
  formData: Address = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  };

  ngOnInit(): void {
    if (this.initialAddress) {
      this.editMode = true;
      this.formData = { ...this.initialAddress };
    }
  }

  isValid(): boolean {
    return Boolean(
      this.formData.fullName?.trim() &&
      this.formData.phone?.trim() &&
      this.formData.addressLine1?.trim() &&
      this.formData.city?.trim() &&
      this.formData.state?.trim() &&
      this.formData.postalCode?.trim()
    );
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.save.emit(this.formData);
    }
  }
}
