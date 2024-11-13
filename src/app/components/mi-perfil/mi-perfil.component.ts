import {
  AfterContentInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Especialista, Paciente, Usuario } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import { Especialidad, HorarioAtencion } from '../../models/especialidad.model';
import { HorarioSeleccionadoDirective } from '../../directives/horario-seleccionado.directive';
import { firstValueFrom } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import moment from 'moment';
import { env } from '../../../environmentConfig';
import { EdadPipe } from '../../pipes/edad.pipe';
import { DniPipe } from '../../pipes/dni.pipe';

interface RangoHorario {
  rangoHorario: [number, number];
  especialidadId: string;
  habilitado: boolean;
}
type HorariosPorDia = { [dia: string]: RangoHorario[] };

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
    CommonModule,
    HorarioSeleccionadoDirective,    
    FormsModule, EdadPipe, DniPipe
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss',
})
export class MiPerfilComponent implements OnInit {
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  diaSelec = ' ';
  spinnerSvc = inject(NgxSpinnerService);
  @ViewChild('diasSelect') mySelect!: ElementRef<HTMLSelectElement>; // Referencia al <select> del DOM

  usuarioInfo?: any;
  loading = true;
  especialidades!: Array<any>;
  activeTab!: string;
  horaNuevaInicio: number = env.horaInicio;
  horaNuevaFin: number = env.horaCierre;
  diasLista = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  diasDisponibles: string[] = [];
  diasDisponiblesPorEspecialidad: { [key: string]: string[] } = {};
  selectedDays: { [key: string]: string } = {};
  opcionesDias: any;
  tiemposHorarios: [number, number][] = [
    [9, 10], // Representa de 14:00 a 15:00
    [11, 12], // Representa de 16:00 a 17:00
  ];
  // horariosXDias: { [dia: string]: number[][] } = {};
  horariosXDias: HorariosPorDia = {};
  constructor(private cdRef: ChangeDetectorRef) {
    // this.especialidades =
    // this.opcionesDias = this.diasLista.filter(dia =>
    //   !this.items.some(item => item.day === dia)
    // );
    // console.log(this.opcionesDias);
  }

  ngOnInit() {
    // console.log(this.authSvc.usuarioActual?.email);

    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) {
        this.usuarioInfo = (await this.fireSvc.obtenerUsuarioDatos(
          res.email
        )) as any;
        if (this.usuarioInfo?.especialidades) {
          this.especialidades = this.usuarioInfo.especialidades;

          this.especialidades.forEach((especialidad: Especialidad) => {
            const diasOcupados = especialidad.horariosAtencion
              ? especialidad.horariosAtencion.map((horario) => horario.dia)
              : [];
            const diasDisponibles = this.diasLista.filter(
              (dia) => !diasOcupados.includes(dia)
            );
            this.diasDisponiblesPorEspecialidad[especialidad.nombre] =
              diasDisponibles.sort(
                (a, b) => this.diasLista.indexOf(a) - this.diasLista.indexOf(b)
              );
            // console.log(`Días disponibles para ${especialidad.nombre}:`, diasDisponibles);
            this.selectedDays[especialidad.nombre] = ' ';
            console.log(this.diasDisponiblesPorEspecialidad);
          });
          this.horariosXDias = this.extraerHorarios(this.especialidades);
          // console.log(this.especialidades);
          console.log(this.horariosXDias);

          this.showTab(this.especialidades[0].id);
        } else {
          console.warn('No hay especialidades definidas en usuarioInfo.');
        }
      }

      this.spinnerSvc.hide();
      this.loading = false;
    });
  }

  getSelectedValue() {
    const selectedValue = this.mySelect.nativeElement.value;
    console.log(selectedValue); // Imprime el valor seleccionado
  }

  hayDiasDisponibles(espId: string): boolean {
    return Object.keys(this.diasDisponiblesPorEspecialidad[espId]).length != 0;
  }

  agregarDia(espNombre: string, horaInicio: number, horaFin: number) {
    console.log('Hora inicio:' + horaInicio + 'HoraFin:' + horaFin);

    const especialidad = this.especialidades.find(
      (e) => e.nombre === espNombre
    );
    const dia = this.selectedDays[espNombre];
    console.log(especialidad);

    if (dia == ' ') {
      this.toastM.error('Seleccione un día.');
      return;
    }
    if (!especialidad) return;
    if (!this.validarHora(horaInicio, horaFin, dia)) {
      return;
    }
    const nuevoHorario: [number, number] = [horaInicio, horaFin];

    if (!this.verificarSolapamiento2(nuevoHorario, dia)) {
      this.toastM.error('Ese horario esta ocupado o se superpone con otro');
      return;
    }

    const diaIndex =
      this.diasDisponiblesPorEspecialidad[espNombre].indexOf(dia);
    if (!this.horariosXDias[dia]) {
      this.horariosXDias[dia] = [];
    }
    this.horariosXDias[dia].push({
      rangoHorario: nuevoHorario,
      especialidadId: especialidad.nombre,
      habilitado: true,
    });
    this.toastM.success(
      `Nuevo horario agregado para el día ${dia} agregado. Recuerde GUARDAR CAMBIOS.`
    );
    console.log('Horario agregado:', nuevoHorario);
    console.log(this.horariosXDias);
    if (diaIndex > -1) {
      this.diasDisponiblesPorEspecialidad[espNombre].splice(diaIndex, 1);
      if (especialidad.horariosAtencion == null) {
        especialidad.horariosAtencion = [];
      }
      especialidad.horariosAtencion.push({
        dia,
        habilitado: true,
        rangoHorario: { inicio: horaInicio, fin: horaFin },
      });
      especialidad.horariosAtencion.sort(
        (a: any, b: any) =>
          this.diasLista.indexOf(a.dia) - this.diasLista.indexOf(b.dia)
      );

      this.diasDisponiblesPorEspecialidad[espNombre].sort(
        (a, b) => this.diasLista.indexOf(a) - this.diasLista.indexOf(b)
      );
      this.selectedDays[espNombre] = ' ';
      console.log(this.especialidades);
      // this.mySelect.nativeElement.value = " ";
    }

    console.log(this.horariosXDias);
  }

  eliminarDia(espNombre: string, dia: string, horaI: number, horaEnd: number) {
    const especialidad = this.especialidades.find(
      (e) => e.nombre === espNombre
    );
    if (!especialidad) {
      this.toastM.error('Error al leer id de especialidad');
      return;
    }
    const diaIndex = especialidad.horariosAtencion.findIndex(
      (horario: HorarioAtencion) => horario.dia === dia
    );
    if (diaIndex > -1) {
      // Eliminar el día de horariosAtencion
      especialidad.horariosAtencion.splice(diaIndex, 1);
      const horarioEliminar: [number, number] = [horaI, horaEnd];

      // Agregar el día de vuelta a diasDisponibles
      this.diasDisponiblesPorEspecialidad[espNombre].push(dia);

      this.eliminarHorario(dia, horarioEliminar, espNombre);

      especialidad.horariosAtencion.sort(
        (a: any, b: any) =>
          this.diasLista.indexOf(a.dia) - this.diasLista.indexOf(b.dia)
      );
      this.diasDisponiblesPorEspecialidad[espNombre].sort(
        (a, b) => this.diasLista.indexOf(a) - this.diasLista.indexOf(b)
      );
    }
    console.log(this.horariosXDias);
  }

  eliminarHorario(
    dia: string,
    rangoHorario: [number, number],
    especialidadId: string
  ): boolean {
    const horariosDelDia = this.horariosXDias[dia];
    // Verifica si el día y los horarios existen
    if (!horariosDelDia) {
      console.log(`No hay horarios registrados para el día ${dia}.`);
      return false;
    }

    // Filtra los horarios eliminando el que coincide con especialidadId y rangoHorario
    const horariosActualizados = horariosDelDia.filter(
      (horario) =>
        !(
          horario.especialidadId === especialidadId &&
          horario.rangoHorario[0] === rangoHorario[0] &&
          horario.rangoHorario[1] === rangoHorario[1]
        )
    );

    // Actualiza los horarios del día
    if (horariosActualizados.length === horariosDelDia.length) {
      console.log('No se encontró el horario especificado para eliminar.');
      return false; // No se eliminó nada porque no coincidió
    }

    // Si no queda ningún horario para ese día, se puede opcionalmente eliminar la clave del día
    if (horariosActualizados.length === 0) {
      delete this.horariosXDias[dia];
    } else {
      this.horariosXDias[dia] = horariosActualizados;
    }
    this.toastM.success(`Horario eliminado. Recuerde GUARDAR CAMBIOS.`);
    console.log(`Horario eliminado exitosamente para el día ${dia}.`);
    return true;
  }

  async guardarHorarios() {
    if (this.verificarDuracionTurnos()) {
      this.spinnerSvc.show();
      const personaLogueada = (await this.fireSvc.obtenerUsuarioDatos(
        this.authSvc.usuarioActual?.email as string
      )) as any;
      console.log(this.especialidades);

      await this.fireSvc
        .actualizarEspecialidadesUsuario(
          personaLogueada.id,
          this.especialidades
        )
        .then(() => {
          this.toastM.success('Horarios actualizados.');
        })
        .catch(() => {
          this.toastM.error('ERROR al guardar horarios');
        });
      this.spinnerSvc.hide();
    }
  }

  verificarDuracionTurnos() {
    for (let i = 0; i < this.especialidades.length; i++) {
      const { nombre, duracionTurno } = this.especialidades[i];

      console.log(nombre + '-' + duracionTurno);

      // Verificar si la duración está fuera del rango permitido
      if (duracionTurno < 30 || duracionTurno > 60) {
        this.toastM.error(
          `La especialidad ${nombre} debe tener una duración entre 30 y 60 minutos.`
        );
        return false; // Si encontramos un error, devolvemos false y salimos de la función
      }
    }

    return true; // Si todos los elementos son válidos, devolvemos true
  }

  verificarSolapamiento2(nuevoHorario: [number, number], dia: string): boolean {
    const [nuevoInicio, nuevoFin] = nuevoHorario;

    // Verificar que el nuevo horario sea válido
    if (!this.validarHora(nuevoInicio, nuevoFin, dia)) {
      return false; // Si la validación falla, no agregar el horario
    }

    // Obtener los horarios para el día especificado
    const horariosDelDia = this.horariosXDias[dia];

    // Si no hay horarios en ese día, no hay solapamiento
    if (!horariosDelDia) {
      return true;
    }

    // Comparamos el nuevo horario con los horarios existentes en ese día
    for (let item of horariosDelDia) {
      console.log(item.habilitado);

      if (!item.habilitado) continue;
      const [inicioExistente, finExistente] = item.rangoHorario;

      // Usamos Moment.js para comparar las horas representadas como números
      const inicioNuevo = moment().hour(nuevoInicio).minute(0); // Nueva hora de inicio
      const finNuevo = moment().hour(nuevoFin).minute(0); // Nueva hora de fin
      const inicioExistenteMoment = moment().hour(inicioExistente).minute(0); // Existente inicio
      const finExistenteMoment = moment().hour(finExistente).minute(0); // Existente fin

      // Verificar si hay solapamiento
      if (
        (inicioNuevo.isBefore(finExistenteMoment) &&
          finNuevo.isAfter(inicioExistenteMoment)) || // Se solapan
        (inicioNuevo.isBetween(
          inicioExistenteMoment,
          finExistenteMoment,
          null,
          '[)'
        ) &&
          !inicioNuevo.isSame(finExistenteMoment)) || // Inicio cae dentro del rango, excluyendo coincidencia con el fin
        (finNuevo.isBetween(
          inicioExistenteMoment,
          finExistenteMoment,
          null,
          '(]'
        ) &&
          !finNuevo.isSame(inicioExistenteMoment)) // Fin cae dentro del rango, excluyendo coincidencia con el inicio
      ) {
        return false; // El nuevo horario se solapa con un horario existente en ese día
      }
    }

    return true; // No hay solapamiento en ese día
  }

  validarHora(horaInicio: number, horaFin: number, dia: string) {
    if (horaInicio >= horaFin) {
      this.toastM.error('La hora de inicio debe ser menor que la hora de fin.');
      return false;
    }

    if (dia == 'Sabado') {
      if (horaInicio < env.sabadoInicio || horaInicio > env.sabadoCierre) {
        this.toastM.error(
          `La hora de inicio debe estar entre ${env.sabadoInicio}:00 y ${env.sabadoCierre}:00.`
        );
        return false;
      }
      if (horaFin < env.sabadoInicio || horaFin > env.sabadoCierre) {
        this.toastM.error(
          `La hora de fin debe estar entre ${env.sabadoInicio}:00 y ${env.sabadoCierre}:00.`
        );
        return false;
      }
    } else {
      if (horaInicio < env.horaInicio || horaInicio > env.horaCierre) {
        this.toastM.error(
          `La hora de inicio debe estar entre ${env.horaInicio}:00 y ${env.horaCierre}:00.`
        );
        return false;
      }
      if (horaFin < env.horaInicio || horaFin > env.horaCierre) {
        this.toastM.error(
          `La hora de fin debe estar entre ${env.horaInicio}:00 y ${env.horaCierre}:00.`
        );
        return false;
      }
    }

    return true;
  }

  validarHorarios(
    values: any,
    especialidad: any,
    horarioProp: any,
    horaI: number,
    horaEnd: number
  ) {
    const nuevoHorario: [number, number] = [horaI, horaEnd];
    // const especialidad = this.especialidades.find(e => e.id === especialidadId);
    console.log(horarioProp.habilitado);
    console.log(this.horariosXDias);

    console.log(values.currentTarget.checked);

    if (
      this.verificarHorarioExistente(
        nuevoHorario,
        especialidad.nombre,
        horarioProp.dia
      )
    ) {
      console.log('ya existe');
      const horario = this.horariosXDias[horarioProp.dia].find(
        (h) =>
          h.especialidadId === especialidad.nombre &&
          h.rangoHorario[0] === horaI &&
          h.rangoHorario[1] === horaEnd
      );
      if (horario) {
        if (values.currentTarget.checked) {
          if (this.verificarSolapamiento2(nuevoHorario, horarioProp.dia)) {
            horarioProp.habilitado = true;
            horario.habilitado = horarioProp.habilitado;
            this.toastM.success(
              `Dia ${horarioProp.dia} habilitado. Recuerde GUARDAR CAMBIOS.`
            );
            console.log(
              `Habilitado modificado para ${especialidad.nombre} en ${horarioProp.dia} a ${horarioProp.habilitado}.`
            );
          } else {
            horarioProp.habilitado = false;
            horario.habilitado = horarioProp.habilitado;
            values.currentTarget.checked = false;
            this.toastM.error(
              `El horario para el día ${horarioProp.dia} se superpone con otra Especialidad.`,
              'Conflicto de horarios',
              { timeOut: 3500 }
            );
            console.log(
              `No se pudo habilitar ${especialidad.nombre} en ${horarioProp.dia} debido a solapamiento.`
            );
          }
          console.log(horarioProp.habilitado);
        } else {
          horarioProp.habilitado = false;
          horario.habilitado = horarioProp.habilitado;

          console.log(
            `Habilitado modificado para ${especialidad.nombre} en ${horarioProp.dia} a ${horarioProp.habilitado}.`
          );
        }
      }
      console.log(horarioProp);
    } else {
      if (values.currentTarget.checked) {
        console.log('primera vez');

        if (this.verificarSolapamiento2(nuevoHorario, horarioProp.dia)) {
          this.tiemposHorarios.push(nuevoHorario);
          if (!this.horariosXDias[horarioProp.dia]) {
            this.horariosXDias[horarioProp.dia] = [];
          }
          this.horariosXDias[horarioProp.dia].push({
            rangoHorario: nuevoHorario,
            especialidadId: especialidad.nombre,
            habilitado: true,
          });
          this.toastM.success(
            `Nuevo horario para el día ${horarioProp.dia} agregado. Recuerde GUARDAR CAMBIOS.`
          );
          console.log('Horario agregado:', nuevoHorario);
          console.log(this.horariosXDias);
          horarioProp.habilitado = true;
          values.currentTarget.checked = horarioProp.habilitado;
          this.cdRef.detectChanges();
        } else {
          this.toastM.error(
            `El horario para el día ${horarioProp.dia} se superpone con otra Especialidad.`,
            'Conflicto de horarios',
            { timeOut: 3500 }
          );

          console.log('El horario se solapa con otro existente');
          horarioProp.habilitado = false;
          values.currentTarget.checked = horarioProp.habilitado;
          this.cdRef.detectChanges();
        }
        console.log(horarioProp);
      } else {
        console.log(horarioProp);
      }
      console.log('no existe');
    }

    console.log(this.especialidades);
  }

  extraerHorarios(especialidades: Especialidad[]) {
    // const horarios: { [dia: string]: number[][] } = {};  // Mapa donde la clave es el día y el valor es un array de intervalos
    const horarios: HorariosPorDia = especialidades.reduce(
      (acc: HorariosPorDia, especialidad) => {
        if (especialidad.horariosAtencion) {
          especialidad.horariosAtencion.forEach(
            ({ dia, rangoHorario, habilitado }) => {
              // Si el día aún no está en el objeto de acumulación, lo inicializamos
              if (!acc[dia]) {
                acc[dia] = [];
              }

              // Añadimos el rango horario con el id de la especialidad
              acc[dia].push({
                rangoHorario: [rangoHorario.inicio, rangoHorario.fin],
                especialidadId: especialidad.nombre,
                habilitado: habilitado,
              });
            }
          );
        }
        return acc;
      },
      {}
    );
    console.log(horarios);
    return horarios;
  }

  verificarHorarioExistente(
    nuevoHorario: [number, number],
    especialidadId: string,
    dia: string
  ): boolean {
    const [nuevoInicio, nuevoFin] = nuevoHorario;

    // Verificamos si el día tiene horarios registrados
    const horariosDelDia = this.horariosXDias[dia];

    console.log(horariosDelDia);

    if (!horariosDelDia) {
      return false; // No hay horarios registrados para ese día
    }

    // Buscamos en los horarios del día si ya existe un horario con el mismo rango y especialidad
    for (let item of horariosDelDia) {
      const [inicioExistente, finExistente] = item.rangoHorario;
      console.log(item.rangoHorario);

      const idExistente = item.especialidadId;

      console.log(idExistente);

      // Compara tanto el rango horario como el ID de la especialidad
      if (
        nuevoInicio === inicioExistente &&
        nuevoFin === finExistente &&
        especialidadId === idExistente
      ) {
        console.log('Se encontro');

        return true; // El horario ya existe con el mismo rango y especialidad
      }
    }
    console.log('no se encontro');

    return false; // No se encuentra el horario
  }

  showTab(tabId: string) {
    this.activeTab = tabId; // Actualiza la pestaña activa
  }
}
