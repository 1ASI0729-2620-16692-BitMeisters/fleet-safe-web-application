import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class IncidentVehicle implements BaseEntity {
  #id: string;
  #plate: string;
  #brand: string;
  #model: string;

  constructor(props: { id: string; plate: string; brand: string; model: string }) {
    this.#id = props.id;
    this.#plate = props.plate;
    this.#brand = props.brand;
    this.#model = props.model;
  }

  get id(): string {
    return this.#id;
  }

  set id(value: string) {
    this.#id = value;
  }

  get plate(): string {
    return this.#plate;
  }

  get description(): string {
    return `${this.#brand} ${this.#model}`.trim();
  }
}
