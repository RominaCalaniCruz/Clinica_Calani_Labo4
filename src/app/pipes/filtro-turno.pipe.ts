import { Pipe, PipeTransform } from '@angular/core';
import { Turno } from '../models/turno';

@Pipe({
  name: 'filtroTurno',
  standalone: true
})
export class FiltroTurnoPipe implements PipeTransform {

  transform(turnos: Turno[], busquedaTexto: string): Turno[] {
    if (!turnos || !busquedaTexto) {
      return turnos;
    }

    busquedaTexto = busquedaTexto.toLowerCase();

    return turnos.filter(turno => {
      
      const matchEspecialidad = turno.especialidad.nombre.toLowerCase().includes(busquedaTexto);

      const matchEspecialistaNombre = turno.especialista.nombre.toLowerCase().includes(busquedaTexto);
      const matchEspecialistaApellido = turno.especialista.apellido.toLowerCase().includes(busquedaTexto);

      const matchPacienteApellido = turno.paciente.apellido.toLowerCase().includes(busquedaTexto);
      const matchPacienteNombre = turno.paciente.nombre.toLowerCase().includes(busquedaTexto);

      const matchHistoriaClinica = turno.historiaClinica && (
        turno.historiaClinica.altura.toString().includes(busquedaTexto) ||
        turno.historiaClinica.peso.toString().includes(busquedaTexto) ||
        turno.historiaClinica.temperatura.toString().includes(busquedaTexto) ||
        turno.historiaClinica.presion.toString().includes(busquedaTexto) ||
        turno.historiaClinica.datos_dinamicos.some(d => 
          d.clave.toLowerCase().includes(busquedaTexto) || 
          d.valor.toLowerCase().includes(busquedaTexto))
      );

      return matchEspecialidad || matchEspecialistaNombre || matchEspecialistaApellido ||
           matchHistoriaClinica || matchPacienteNombre || matchPacienteApellido;
    });
  }

}
