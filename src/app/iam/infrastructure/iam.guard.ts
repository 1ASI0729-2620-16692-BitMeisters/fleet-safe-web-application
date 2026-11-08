import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from '../application/iam.store';

/**
 * Blocks protected routes when there is no authenticated IAM session.
 */
export const iamGuard: CanActivateFn = (_route, state) => {
  const store = inject(IamStore);
  if (store.isSignedIn()) return true;
  return inject(Router).createUrlTree(['/iam/sign-in'], { queryParams: { returnUrl: state.url } });
};
