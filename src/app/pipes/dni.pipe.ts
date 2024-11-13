import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dni',
  standalone: true
})
export class DniPipe implements PipeTransform {

  transform(dni: string | number): string {
    const dniStr = dni.toString();
    return dniStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
