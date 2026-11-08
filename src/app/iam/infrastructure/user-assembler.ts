import { RegisterUserCommand } from '../domain/model/register-user.command';
import { Role } from '../domain/model/role.enum';
import { User } from '../domain/model/user.entity';
import { CreateUserRequest } from './create-user.request';
import { UserResource } from './users-response';

/**
 * Maps IAM user resources to domain entities.
 */
export class UserAssembler {
  toEntityFromResource = (resource: UserResource): User =>
    new User({
      id: resource.id,
      companyId: resource.companyId,
      email: resource.email,
      firstName: resource.firstName,
      lastName: resource.lastName,
      role: resource.role as Role,
      isActive: resource.isActive,
    });

  toRequestFromCommand = (command: RegisterUserCommand): CreateUserRequest => ({
    email: command.email.trim(),
    password: command.password,
    firstName: command.firstName.trim(),
    lastName: command.lastName.trim(),
    role: command.role,
  });
}
