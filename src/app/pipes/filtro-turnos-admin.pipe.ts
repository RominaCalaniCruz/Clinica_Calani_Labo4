import { Pipe, PipeTransform } from '@angular/core';
import { Turno } from '../models/turno';

@Pipe({
  name: 'filtroTurnosAdmin',
  standalone: true
})
export class FiltroTurnosAdminPipe implements PipeTransform {

  transform(turnos: Turno[], searchTerm: string): Turno[] {
    if (!searchTerm) {
      return turnos;
    }
    
    searchTerm = searchTerm.toLowerCase();

    return turnos.filter(turno =>
      turno.especialidad.nombre.toLowerCase().includes(searchTerm) ||
      turno.especialista.nombre.toLowerCase().includes(searchTerm) ||
      turno.especialista.apellido.toLowerCase().includes(searchTerm)
    );
  }
}
