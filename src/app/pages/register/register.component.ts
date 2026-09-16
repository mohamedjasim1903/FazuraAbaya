import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private payment: PaymentService,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    this.error = '';

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    const result = await this.auth.register(this.name, this.email, this.password);
    this.loading = false;

    if (!result.success) {
      this.error = result.error || 'Registration failed.';
      return;
    }

    this.payment.loadForCurrentUser();
    this.router.navigate(['/account']);
  }
}
