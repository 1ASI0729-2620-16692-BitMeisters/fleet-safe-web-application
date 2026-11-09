import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'inspectionItemText', pure: false })
export class InspectionItemTextPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(code: string | undefined, field: 'name' | 'description', fallback: string): string {
    if (!code) return fallback;
    const key = `inspection.catalog.${code}.${field}`;
    const text = this.translate.instant(key);
    return text === key ? fallback : text;
  }
}
