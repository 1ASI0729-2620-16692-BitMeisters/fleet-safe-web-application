import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from '../application/iam.store';
import { Role } from '../domain/model/role.enum';

/**
 * Lets only administrators into the routes that manage the company accounts.
 */
export const administratorGuard: CanActivateFn = () =>
  inject(IamStore).hasRole(Role.ADMINISTRATOR) || inject(Router).createUrlTree(['/home']);
