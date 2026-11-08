import { SignInCommand } from '../domain/model/sign-in.command';
import { SignInResource, SignInResponse } from './sign-in-response';
import { SignInRequest } from './sign-in.request';

/**
 * Maps IAM sign-in commands and endpoint payloads.
 */
export class SignInAssembler {
  toResourceFromResponse = (response: SignInResponse, now = Date.now()): SignInResource => ({
    token: response.accessToken,
    expiresAt: now + response.expiresIn * 1000,
    user: response.user,
  });

  toRequestFromCommand = (command: SignInCommand): SignInRequest => ({
    email: command.email.trim(),
    password: command.password,
  });
}
