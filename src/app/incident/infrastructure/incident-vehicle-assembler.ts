import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { IncidentVehicle } from '../domain/model/incident-vehicle.entity';
import { IncidentVehicleResource, IncidentVehiclesResponse } from './incident-vehicles-response';

export class IncidentVehicleAssembler implements BaseAssembler<
  IncidentVehicle,
  IncidentVehicleResource,
  IncidentVehiclesResponse
> {
  toEntitiesFromResponse = (response: IncidentVehiclesResponse): IncidentVehicle[] =>
    response.vehicles.map((resource) => this.toEntityFromResource(resource));

  toEntityFromResource = (resource: IncidentVehicleResource): IncidentVehicle =>
    new IncidentVehicle({
      id: resource.id,
      plate: resource.plate,
      brand: resource.brand ?? '',
      model: resource.model ?? '',
    });

  toResourceFromEntity = (entity: IncidentVehicle): IncidentVehicleResource => ({
    id: entity.id,
    plate: entity.plate,
    brand: '',
    model: '',
  });
}
