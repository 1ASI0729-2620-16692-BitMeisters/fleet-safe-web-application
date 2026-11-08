import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Role } from './role.enum';

/**
 * Represents an account of the platform in the IAM domain model.
 */
export class User implements BaseEntity {
  #id: string;
  #companyId: string;
  #email: string;
  #firstName: string;
  #lastName: string;
  #role: Role;
  #isActive: boolean;

  constructor(props: {
    id: string;
    companyId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
  }) {
    this.#id = props.id;
    this.#companyId = props.companyId;
    this.#email = props.email;
    this.#firstName = props.firstName;
    this.#lastName = props.lastName;
    this.#role = props.role;
    this.#isActive = props.isActive;
  }

  get id(): string {
    return this.#id;
  }

  set id(value: string) {
    this.#id = value;
  }

  get companyId(): string {
    return this.#companyId;
  }

  set companyId(value: string) {
    this.#companyId = value;
  }

  get email(): string {
    return this.#email;
  }

  set email(value: string) {
    this.#email = value;
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

  get isActive(): boolean {
    return this.#isActive;
  }

  set isActive(value: boolean) {
    this.#isActive = value;
  }

  get fullName(): string {
    return `${this.#firstName} ${this.#lastName}`;
  }

  hasRole(...roles: Role[]): boolean {
    return roles.includes(this.#role);
  }
}
