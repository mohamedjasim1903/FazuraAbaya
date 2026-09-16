import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-kicker">Account Recovery</span>
          <h1>Reset <em>Password</em></h1>
          <p>Enter the email address tied to your Fazura account to receive reset instructions.</p>
        </div>

        <div class="success-alert" *ngIf="successMessage">
          <span>✓</span>
          <p>{{ successMessage }}</p>
        </div>

        <div class="error-alert" *ngIf="errorMessage">
          <span>✕</span>
          <p>{{ errorMessage }}</p>
        </div>

        <form (ngSubmit)="onReset()" *ngIf="!successMessage">
          <div class="form-group">
            <label>Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="you@domain.com"
              [disabled]="loading"
            >
          </div>

          <button type="submit" class="submit-btn" [disabled]="loading || !email.trim()">
            {{ loading ? 'Sending Instructions...' : 'Send Password Reset Link' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Remembered your password? <a routerLink="/login">Sign in</a></p>
          <p>Don't have an account? <a routerLink="/register">Register now</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      background: #faf8f5;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #fff;
      border: 1px solid #eae3da;
      border-radius: 12px;
      padding: 2.5rem;
      box-shadow: 0 12px 32px rgba(0,0,0,0.04);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-kicker {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #9f803c;
      font-weight: 600;
    }
    .auth-header h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2rem;
      margin: 6px 0 8px;
    }
    .auth-header p {
      color: #666;
      font-size: 0.88rem;
      line-height: 1.5;
      margin: 0;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 1.5rem;
    }
    .form-group label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      color: #444;
    }
    .form-group input {
      padding: 0.8rem 1rem;
      border: 1px solid #dcd4ca;
      border-radius: 6px;
      font-size: 0.95rem;
      outline: none;
    }
    .form-group input:focus {
      border-color: #9f803c;
    }
    .submit-btn {
      width: 100%;
      padding: 0.9rem;
      background: #171513;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .submit-btn:hover:not(:disabled) {
      background: #9f803c;
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .success-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f0f8f2;
      border: 1px solid #c8e6ce;
      color: #1e6b35;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .error-alert {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fdf2f2;
      border: 1px solid #fad2d2;
      color: #b52c2c;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .auth-footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eae3da;
      text-align: center;
      font-size: 0.88rem;
      color: #666;
    }
    .auth-footer a {
      color: #9f803c;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  async onReset(): Promise<void> {
    if (!this.email.trim()) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const res = await this.authService.resetPassword(this.email);
    if (res.success) {
      this.successMessage = `Password reset instructions have been emailed to ${this.email}. Please check your inbox and spam folders.`;
    } else {
      this.errorMessage = res.error || 'Failed to send reset email.';
    }

    this.loading = false;
  }
}
