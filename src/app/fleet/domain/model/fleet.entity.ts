import { BaseEntity } from '../../../shared/domain/model/base-entity';
import type { Vehicle } from './vehicle.entity';
import { VehicleStatus } from './vehicle-status.enum';

export class Fleet implements BaseEntity {
  #id: string;
  #companyId: string;
  #name: string;
  #description: string;
  #vehicleIds: string[];
  #createdAt?: string;
  #updatedAt?: string;

  constructor(props: {
    id: string;
    companyId: string;
    name: string;
    description: string;
    vehicleIds?: string[];
    createdAt?: string;
    updatedAt?: string;
  }) {
    this.#id = props.id;
    this.#companyId = props.companyId;
    this.#name = props.name;
    this.#description = props.description;
    this.#vehicleIds = props.vehicleIds ?? [];
    this.#createdAt = props.createdAt;
    this.#updatedAt = props.updatedAt;
  }

  get id(): string {
    return this.#id;
  }

  get companyId(): string {
    return this.#companyId;
  }

  get name(): string {
    return this.#name;
  }

  get description(): string {
    return this.#description;
  }

  get createdAt(): string | undefined {
    return this.#createdAt;
  }

  get updatedAt(): string | undefined {
    return this.#updatedAt;
  }

  addVehicle(vehicleId: string): void {
    if (!this.#vehicleIds.includes(vehicleId)) {
      this.#vehicleIds.push(vehicleId);
    }
  }

  getVehicles(): string[] {
    return [...this.#vehicleIds];
  }

  countVehicles(vehicles: readonly Vehicle[]): number {
    return vehicles.filter((vehicle) => vehicle.fleetId === this.#id).length;
  }

  countByStatus(vehicles: readonly Vehicle[], status: VehicleStatus): number {
    return vehicles.filter(
      (vehicle) => vehicle.fleetId === this.#id && vehicle.currentStatus === status,
    ).length;
  }
}
