/**
 * Captures the data required to register the driving license of a user account.
 */
export class RegisterDriverCommand {
  readonly #userId: string;
  readonly #licenseNumber: string;
  readonly #licenseExpirationDate: string;

  constructor(props: { userId: string; licenseNumber: string; licenseExpirationDate: string }) {
    this.#userId = props.userId.trim();
    this.#licenseNumber = props.licenseNumber.trim().toUpperCase();
    this.#licenseExpirationDate = props.licenseExpirationDate;
  }

  get userId(): string {
    return this.#userId;
  }

  get licenseNumber(): string {
    return this.#licenseNumber;
  }

  /** Day the license expires as `yyyy-MM-dd`. */
  get licenseExpirationDate(): string {
    return this.#licenseExpirationDate;
  }
}
