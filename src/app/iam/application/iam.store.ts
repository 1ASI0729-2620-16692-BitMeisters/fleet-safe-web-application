import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterUserCommand } from '../domain/model/register-user.command';
import { SignInCommand } from '../domain/model/sign-in.command';
import { User } from '../domain/model/user.entity';
import { UsersQuery } from '../domain/model/users.query';
import { IamApi } from '../infrastructure/iam-api';
import { UpdateUserRequest } from '../infrastructure/update-user.request';
import { SignInResource } from '../infrastructure/sign-in-response';
import { UserAssembler } from '../infrastructure/user-assembler';

const SESSION_KEY = 'fleetsafe-session';

/**
 * Holds the IAM session state and orchestrates the authentication flows.
 */
@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly iamApi = inject(IamApi);
  private readonly userAssembler = new UserAssembler();

  private readonly sessionSignal = signal<SignInResource | null>(this.restoreSession());

  private readonly signingInSignal = signal<boolean>(false);
  readonly signingIn = this.signingInSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly usersSignal = signal<User[]>([]);
  readonly users = this.usersSignal.asReadonly();

  private readonly totalUsersSignal = signal<number>(0);
  readonly totalUsers = this.totalUsersSignal.asReadonly();

  private readonly usersQuerySignal = signal<UsersQuery>({ role: null, isActive: null, page: 0, size: 20 });
  readonly usersQuery = this.usersQuerySignal.asReadonly();

  private readonly loadingUsersSignal = signal<boolean>(false);
  readonly loadingUsers = this.loadingUsersSignal.asReadonly();

  private readonly usersErrorSignal = signal<string | null>(null);
  readonly usersError = this.usersErrorSignal.asReadonly();

  private readonly savingUserSignal = signal<boolean>(false);
  readonly savingUser = this.savingUserSignal.asReadonly();

  private readonly saveUserErrorSignal = signal<string | null>(null);
  readonly saveUserError = this.saveUserErrorSignal.asReadonly();

  private readonly updatingUserIdSignal = signal<string | null>(null);
  readonly updatingUserId = this.updatingUserIdSignal.asReadonly();

  readonly isSignedIn = computed(() => this.sessionSignal() !== null);

  readonly currentToken = computed(() => this.sessionSignal()?.token ?? null);

  readonly currentUser = computed(() => {
    const session = this.sessionSignal();
    return session ? this.userAssembler.toEntityFromResource(session.user) : null;
  });

  signIn(signInCommand: SignInCommand, router: Router, returnUrl = '/home'): void {
    if (this.signingInSignal()) return;
    this.signingInSignal.set(true);
    this.errorSignal.set(null);
    this.iamApi.signIn(signInCommand).subscribe({
      next: (session) => {
        this.saveSession(session);
        this.signingInSignal.set(false);
        router.navigateByUrl(returnUrl).then();
      },
      error: (error: HttpErrorResponse) => {
        this.errorSignal.set(
          error.status === 401 ? 'iam.signIn.invalidCredentials' : error.status === 0 ? 'errors.network' : 'errors.server',
        );
        this.signingInSignal.set(false);
      },
    });
  }

  signOut(router: Router): void {
    this.clearSession();
    router.navigate(['/iam/sign-in']).then();
  }

  loadUsers(query: Partial<UsersQuery> = {}): void {
    const nextQuery = { ...this.usersQuerySignal(), ...query };
    this.usersQuerySignal.set(nextQuery);
    this.loadingUsersSignal.set(true);
    this.usersErrorSignal.set(null);
    this.iamApi.getUsers(nextQuery).subscribe({
      next: ({ users, totalUsers }) => {
        this.usersSignal.set(users);
        this.totalUsersSignal.set(totalUsers);
        this.loadingUsersSignal.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.usersErrorSignal.set(this.errorKeyFor(error));
        this.loadingUsersSignal.set(false);
      },
    });
  }

  clearSaveUserError(): void {
    this.saveUserErrorSignal.set(null);
  }

  registerUser(command: RegisterUserCommand, done: () => void): void {
    if (this.savingUserSignal()) return;
    this.savingUserSignal.set(true);
    this.saveUserErrorSignal.set(null);
    this.iamApi.registerUser(command).subscribe({
      next: () => {
        this.savingUserSignal.set(false);
        this.loadUsers();
        done();
      },
      error: (error: HttpErrorResponse) => {
        this.saveUserErrorSignal.set(this.saveErrorFor(error));
        this.savingUserSignal.set(false);
      },
    });
  }

  updateUser(id: string, changes: UpdateUserRequest, done: (error: string | null) => void): void {
    if (this.updatingUserIdSignal()) return;
    this.updatingUserIdSignal.set(id);
    this.iamApi.updateUser(id, changes).subscribe({
      next: (updated) => {
        this.usersSignal.update((users) => users.map((user) => (user.id === updated.id ? updated : user)));
        this.updatingUserIdSignal.set(null);
        done(null);
      },
      error: (error: HttpErrorResponse) => {
        this.updatingUserIdSignal.set(null);
        done(this.saveErrorFor(error));
      },
    });
  }

  hasRole(...roles: User['role'][]): boolean {
    return this.currentUser()?.hasRole(...roles) ?? false;
  }

  clearSession(): void {
    this.sessionSignal.set(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      return;
    }
  }

  private errorKeyFor(error: HttpErrorResponse): string {
    if (error.status === 0) return 'errors.network';
    if (error.status === 401) return 'errors.unauthorized';
    if (error.status === 403) return 'errors.forbidden';
    return 'errors.server';
  }

  private saveErrorFor(error: HttpErrorResponse): string {
    if (error.status === 409) return 'iam.userForm.duplicateEmail';
    if (error.status === 400 && typeof error.error?.detail === 'string') return error.error.detail;
    return this.errorKeyFor(error);
  }

  private saveSession(session: SignInResource): void {
    this.sessionSignal.set(session);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      return;
    }
  }

  private restoreSession(): SignInResource | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored) as SignInResource;
      if (!session.token || !session.user || session.expiresAt <= Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }
}
