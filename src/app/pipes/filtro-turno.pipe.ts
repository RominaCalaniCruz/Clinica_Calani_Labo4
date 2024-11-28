import { Pipe, PipeTransform } from '@angular/core';
import { Turno } from '../models/turno';
import { HistoriaClinica } from '../models/historia-clinica.model';

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
      const matchHistoriaClinica = this.matchHistoriaClinica(turno.historiaClinica, busquedaTexto);
      


      return matchEspecialidad || matchEspecialistaNombre || matchEspecialistaApellido ||
           matchHistoriaClinica || matchPacienteNombre || matchPacienteApellido;
    });
  }

  matchHistoriaClinica(historiaClinica: HistoriaClinica | null, busquedaTexto: string): boolean {
    if (!historiaClinica) return false;
  
    return (
      historiaClinica.altura.toString().includes(busquedaTexto) ||
      historiaClinica.peso.toString().includes(busquedaTexto) ||
      historiaClinica.temperatura.toString().includes(busquedaTexto) ||
      historiaClinica.presion.toString().includes(busquedaTexto) ||
      historiaClinica.datos_dinamicos.some(d =>

        d.clave.toString().toLowerCase().includes(busquedaTexto) || 
        d.valor.toString().toLowerCase().includes(busquedaTexto)
      )
    );
  }
}
