import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IamStore } from '../application/iam.store';

/**
 * Adds the IAM bearer token to the requests sent to the platform backend
 * and ends the session when the backend rejects it.
 */
export const iamInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.backendApiBaseUrl)) return next(request);
  const store = inject(IamStore);
  const router = inject(Router);
  const token = store.currentToken();
  const handledRequest = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(handledRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        store.clearSession();
        router.navigate(['/iam/sign-in']).then();
      }
      return throwError(() => error);
    }),
  );
};
