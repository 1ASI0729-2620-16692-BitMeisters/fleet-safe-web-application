import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignInCommand } from '../domain/model/sign-in.command';
import { SignInAssembler } from './sign-in-assembler';
import { SignInResource, SignInResponse } from './sign-in-response';

const signInApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendSignInEndpointPath}`;

/**
 * Encapsulates the IAM sign-in HTTP operation.
 */
export class SignInApiEndpoint {
  constructor(
    private http: HttpClient,
    private assembler: SignInAssembler,
  ) {}

  signIn = (signInCommand: SignInCommand): Observable<SignInResource> =>
    this.http
      .post<SignInResponse>(signInApiEndpointUrl, this.assembler.toRequestFromCommand(signInCommand))
      .pipe(map((response) => this.assembler.toResourceFromResponse(response)));
}
