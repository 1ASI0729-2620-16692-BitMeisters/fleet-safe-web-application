import { Routes } from '@angular/router';
import { administratorGuard } from '../infrastructure/administrator.guard';
import { iamGuard } from '../infrastructure/iam.guard';

const signInForm = () => import('./views/sign-in-form/sign-in-form').then((m) => m.SignInForm);
const userForm = () => import('./views/user-form/user-form').then((m) => m.UserForm);
const userList = () => import('./views/user-list/user-list').then((m) => m.UserList);

/**
 * Route tree for the IAM presentation views.
 */
export const iamRoutes: Routes = [
  { path: 'sign-in', loadComponent: signInForm, title: 'titles.signIn' },
  { path: 'new', loadComponent: userForm, title: 'titles.newUser', canActivate: [iamGuard, administratorGuard] },
  { path: '', loadComponent: userList, title: 'titles.users', canActivate: [iamGuard, administratorGuard] },
];
