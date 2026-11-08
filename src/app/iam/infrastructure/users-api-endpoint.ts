import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegisterUserCommand } from '../domain/model/register-user.command';
import { User } from '../domain/model/user.entity';
import { UsersPage, UsersQuery } from '../domain/model/users.query';
import { UpdateUserRequest } from './update-user.request';
import { UserAssembler } from './user-assembler';
import { UserResource, UsersResponse } from './users-response';

const usersApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendUsersEndpointPath}`;

/**
 * Encapsulates the HTTP operations on the users of the company.
 */
export class UsersApiEndpoint {
  constructor(
    private http: HttpClient,
    private assembler: UserAssembler,
  ) {}

  getPage = (query: UsersQuery): Observable<UsersPage<User>> => {
    let params = new HttpParams().set('page', query.page).set('size', query.size).set('sort', 'lastName,asc');
    if (query.role) params = params.set('role', query.role);
    if (query.isActive !== null) params = params.set('isActive', query.isActive);
    return this.http.get<UsersResponse>(usersApiEndpointUrl, { params }).pipe(
      map((response) => ({
        users: response.content.map((resource) => this.assembler.toEntityFromResource(resource)),
        totalUsers: response.page.totalElements,
      })),
    );
  };

  create = (command: RegisterUserCommand): Observable<User> =>
    this.http
      .post<UserResource>(usersApiEndpointUrl, this.assembler.toRequestFromCommand(command))
      .pipe(map((resource) => this.assembler.toEntityFromResource(resource)));

  update = (id: string, changes: UpdateUserRequest): Observable<User> =>
    this.http
      .patch<UserResource>(`${usersApiEndpointUrl}/${id}`, changes)
      .pipe(map((resource) => this.assembler.toEntityFromResource(resource)));
}
