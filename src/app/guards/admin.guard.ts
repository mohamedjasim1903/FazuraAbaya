import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.ready).pipe(
    filter(ready => ready),
    take(1),
    map(() => {
      const user = auth.currentUser();
      const isAdmin = auth.isAdmin();

      console.log('==============================');
      console.log('🔥 ADMIN GUARD CHECK');
      console.log('Ready:', auth.ready());
      console.log('Current User:', user?.email);
      console.log('Is Admin / AdminFlag:', isAdmin);
      console.log('==============================');

      if (!auth.isLoggedIn()) {
        console.log('🔒 Unauthenticated, redirecting to login with returnUrl:', state.url);
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }

      if (isAdmin) {
        console.log('✅ Admin access granted for:', user?.email);
        return true;
      }

      console.warn('⛔ Non-admin access denied for:', user?.email, 'redirecting to /account');
      return router.createUrlTree(['/account'], { queryParams: { accessDenied: 'admin_only' } });
    })
  );
};