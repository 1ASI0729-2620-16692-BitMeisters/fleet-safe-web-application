import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { RegisterUserCommand } from '../domain/model/register-user.command';
import { SignInCommand } from '../domain/model/sign-in.command';
import { User } from '../domain/model/user.entity';
import { UsersPage, UsersQuery } from '../domain/model/users.query';
import { SignInApiEndpoint } from './sign-in-api-endpoint';
import { SignInAssembler } from './sign-in-assembler';
import { SignInResource } from './sign-in-response';
import { UpdateUserRequest } from './update-user.request';
import { UserAssembler } from './user-assembler';
import { UsersApiEndpoint } from './users-api-endpoint';

/**
 * Infrastructure facade that exposes the IAM endpoint operations.
 */
@Injectable({ providedIn: 'root' })
export class IamApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly signInEndpoint = new SignInApiEndpoint(this.http, new SignInAssembler());
  private readonly usersEndpoint = new UsersApiEndpoint(this.http, new UserAssembler());

  signIn = (signInCommand: SignInCommand): Observable<SignInResource> =>
    this.signInEndpoint.signIn(signInCommand);

  getUsers = (query: UsersQuery): Observable<UsersPage<User>> => this.usersEndpoint.getPage(query);

  registerUser = (command: RegisterUserCommand): Observable<User> => this.usersEndpoint.create(command);

  updateUser = (id: string, changes: UpdateUserRequest): Observable<User> => this.usersEndpoint.update(id, changes);
}
