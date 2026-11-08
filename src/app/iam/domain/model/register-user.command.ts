import { Role } from './role.enum';

/**
 * Captures the data an administrator gives to open an account in the company.
 */
export class RegisterUserCommand {
  #email: string;
  #password: string;
  #firstName: string;
  #lastName: string;
  #role: Role;

  constructor(props: { email: string; password: string; firstName: string; lastName: string; role: Role }) {
    this.#email = props.email;
    this.#password = props.password;
    this.#firstName = props.firstName;
    this.#lastName = props.lastName;
    this.#role = props.role;
  }

  get email(): string {
    return this.#email;
  }

  set email(value: string) {
    this.#email = value;
  }

  get password(): string {
    return this.#password;
  }

  set password(value: string) {
    this.#password = value;
  }

  get firstName(): string {
    return this.#firstName;
  }

  set firstName(value: string) {
    this.#firstName = value;
  }

  get lastName(): string {
    return this.#lastName;
  }

  set lastName(value: string) {
    this.#lastName = value;
  }

  get role(): Role {
    return this.#role;
  }

  set role(value: Role) {
    this.#role = value;
  }
}
