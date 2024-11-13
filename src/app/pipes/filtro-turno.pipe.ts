import { Pipe, PipeTransform } from '@angular/core';
import { Turno } from '../models/turno';

@Pipe({
  name: 'filtroTurno',
  standalone: true
})
export class FiltroTurnoPipe implements PipeTransform {

  transform(turnos: Turno[], searchText: string): Turno[] {
    if (!turnos || !searchText) {
      return turnos;
    }

    searchText = searchText.toLowerCase();

    return turnos.filter(turno => {
      
      const matchEspecialidad = turno.especialidad.nombre.toLowerCase().includes(searchText);
      const matchEspecialistaNombre = turno.especialista.nombre.toLowerCase().includes(searchText);
      const matchEspecialistaApellido = turno.especialista.apellido.toLowerCase().includes(searchText);
      const matchComentario = turno.comentario?.toLowerCase().includes(searchText) || false;
      const matchResenia = turno.resenia?.toLowerCase().includes(searchText) || false;

      const matchHistoriaClinica = turno.historiaClinica && (
        turno.historiaClinica.altura.toString().includes(searchText) ||
        turno.historiaClinica.peso.toString().includes(searchText) ||
        turno.historiaClinica.temperatura.toString().includes(searchText) ||
        turno.historiaClinica.presion.toString().includes(searchText) ||
        turno.historiaClinica.datos_dinamicos.some(d => 
          d.clave.toLowerCase().includes(searchText) || 
          d.valor.toLowerCase().includes(searchText))
      );

      return matchEspecialidad || matchEspecialistaNombre || matchEspecialistaApellido ||
             matchComentario || matchResenia || matchHistoriaClinica;
    });
  }

}
