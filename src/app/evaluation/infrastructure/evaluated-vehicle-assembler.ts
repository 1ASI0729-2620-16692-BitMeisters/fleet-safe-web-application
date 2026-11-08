import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { EvaluatedVehicle } from '../domain/model/evaluated-vehicle.entity';
import { EvaluatedVehicleResource, EvaluatedVehiclesResponse } from './evaluated-vehicles-response';

export class EvaluatedVehicleAssembler implements BaseAssembler<
  EvaluatedVehicle,
  EvaluatedVehicleResource,
  EvaluatedVehiclesResponse
> {
  toEntitiesFromResponse = (response: EvaluatedVehiclesResponse): EvaluatedVehicle[] =>
    response.vehicles.map((resource) => this.toEntityFromResource(resource));

  toEntityFromResource = (resource: EvaluatedVehicleResource): EvaluatedVehicle =>
    new EvaluatedVehicle({
      id: resource.id,
      plate: resource.plate,
      brand: resource.brand ?? '',
      model: resource.model ?? '',
    });

  toResourceFromEntity = (entity: EvaluatedVehicle): EvaluatedVehicleResource => ({
    id: entity.id,
    plate: entity.plate,
    brand: '',
    model: '',
  });
}
