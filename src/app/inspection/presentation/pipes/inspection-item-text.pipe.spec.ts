import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { InspectionItemTextPipe } from './inspection-item-text.pipe';

describe('InspectionItemTextPipe', () => {
  let pipe: InspectionItemTextPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideTranslateService(), InspectionItemTextPipe] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es-419', {
      inspection: { catalog: { 'SAF-01': { name: 'Sistema de frenos' } } },
    });
    translate.use('es-419');
    pipe = TestBed.inject(InspectionItemTextPipe);
  });

  it('translates a catalog item by its code', () => {
    expect(pipe.transform('SAF-01', 'name', 'Brake system')).toBe('Sistema de frenos');
  });

  it('keeps the stored text of an item without translation', () => {
    expect(pipe.transform('NEW-01', 'name', 'Cargo straps')).toBe('Cargo straps');
  });
});
