import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private payment: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async onSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;

    const result = await this.auth.login(this.email, this.password);
    this.loading = false;

    if (!result.success) {
      this.error = result.error || 'Login failed.';
      return;
    }

    this.payment.loadForCurrentUser();

    const explicitReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const isAdmin = this.auth.isAdmin();

    let destination = '/account';
    if (isAdmin) {
      destination = explicitReturnUrl && !explicitReturnUrl.includes('login')
        ? explicitReturnUrl
        : '/admin';
    } else {
      destination = explicitReturnUrl && !explicitReturnUrl.startsWith('/admin')
        ? explicitReturnUrl
        : '/account';
    }

    this.router.navigateByUrl(destination);

  }
}
