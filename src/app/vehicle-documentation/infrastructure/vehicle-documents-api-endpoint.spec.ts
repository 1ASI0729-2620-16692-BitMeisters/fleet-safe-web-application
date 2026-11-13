import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { VehicleDocument } from '../domain/model/vehicle-document.entity';
import { VehicleDocumentResource } from './vehicle-documents-response';
import { VehicleDocumentsApiEndpoint } from './vehicle-documents-api-endpoint';

const vehicleId = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

const resource: VehicleDocumentResource = {
  id: '2b4d6f8a-1c3e-4a5b-9d7f-0e2c4a6b8d1f',
  vehicleId,
  documentTypeId: '7c1e2d3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
  number: 'SOAT-2026-004512',
  issueDate: '2026-01-15',
  expirationDate: '2027-01-14',
  fileUrl: '',
  createdAt: '2026-11-07T14:00:00Z',
  updatedAt: '2026-11-07T14:00:00Z',
};

describe('VehicleDocumentsApiEndpoint', () => {
  let endpoint: VehicleDocumentsApiEndpoint;
  let http: HttpTestingController;
  const document = new VehicleDocument({ ...resource, fileUrl: 'https://fleetsafe.blob.core.windows.net/evidences/soat.pdf?sig=read' });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    endpoint = new VehicleDocumentsApiEndpoint(TestBed.inject(HttpClient));
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the documents of every vehicle from the backend', () => {
    endpoint.getAll().subscribe((documents) => expect(documents[0].number).toBe('SOAT-2026-004512'));

    const request = http.expectOne(`${environment.backendApiBaseUrl}/documents`);
    expect(request.request.method).toBe('GET');
    request.flush([resource]);
  });

  it('registers a document under its vehicle', () => {
    endpoint.createForVehicle(document).subscribe((created) => expect(created.id).toBe(resource.id));

    const request = http.expectOne(`${environment.backendApiBaseUrl}/vehicles/${vehicleId}/documents`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.number).toBe('SOAT-2026-004512');
    request.flush(resource);
  });

  it('updates a document under its vehicle', () => {
    endpoint.updateForVehicle(document).subscribe();

    const request = http.expectOne(`${environment.backendApiBaseUrl}/vehicles/${vehicleId}/documents/${resource.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.fileUrl).toBeNull();
    request.flush(resource);
  });

  it('attaches the scanned file of a document', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'soat.pdf', { type: 'application/pdf' });
    endpoint.attachFile(document, file).subscribe();

    const request = http.expectOne(`${environment.backendApiBaseUrl}/documents/${resource.id}/files`);
    expect(request.request.method).toBe('POST');
    expect((request.request.body as FormData).get('file')).toBe(file);
    request.flush(resource);
  });
});
