import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoHabilitado',
  standalone: true
})
export class HabilitadoPipe implements PipeTransform {

  transform(value: boolean): string {
    return value ? 'Habilitado' : 'Deshabilitado';
  }

}
