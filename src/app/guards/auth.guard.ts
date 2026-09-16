import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.ready).pipe(
    filter(ready => ready),
    take(1),
    map(() => {
      if (auth.isLoggedIn()) {
        return true;
      }

      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    })
  );
};
