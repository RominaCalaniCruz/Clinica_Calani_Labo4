import { Component, inject, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Especialista, Paciente, Perfil, Usuario } from '../../models/usuario';
import { Especialidad, HorarioAtencion } from '../../models/especialidad.model';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import { Timestamp } from '@angular/fire/firestore';
import { EstadoTurno, Turno } from '../../models/turno';

@Component({
  selector: 'app-sacar-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sacar-turno.component.html',
  styleUrl: './sacar-turno.component.scss'
})
export class SacarTurnoComponent implements OnInit{
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  usuarioInfo:any;
  loading = true;
  esAdmin = false;
  fotoEspecialidad = "/Especialidad.png";
  doctoresLista: Array<Especialista> = [];
  pacientesLista: Array<Paciente> = [];
  turnosLista: Array<Turno> = [];

  doctorSeleccionado: Especialista | null = null;
  especialidadSeleccionada: Especialidad | null = null;
  pacienteSeleccionado: Paciente | null = null;
  turnoSeleccionado :Turno|null = null;

  especialidadesXDoctor: Array<Especialidad>= [];

  mostrarEspecialidades = false;
  mostrarDiasDisponibles = false;
  mostrarHorasDisponibles = false;
  mostrarPacientes = false;

  turnosDeUnDiaAMostrar: any[] = [];

  turnosEncontrados: any[] = [] ;
  areaYdoctorSeleccionado:any;
  horariosDisponibles: any[] = [];

  ngOnInit() {
    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) { 
        this.usuarioInfo = (await this.fireSvc.obtenerUsuarioDatos(res.email)) as any;
        console.log(this.usuarioInfo.perfil);
        this.esAdmin = this.usuarioInfo.perfil == Perfil.Administrador;
        console.log(this.esAdmin);
        
        this.fireSvc.traerEspecialistas().subscribe((data)=>{

          this.doctoresLista = data.filter(esp=>esp.cuenta_habilitada);
          console.log(this.doctoresLista);
          this.spinnerSvc.hide();
          this.loading = false;
          
        });

        if(this.esAdmin){
          this.fireSvc.traerPacientes().subscribe((data)=>{

            this.pacientesLista = data;
            console.log(this.pacientesLista);
            
          });
        }

        this.fireSvc.traerTurnos().subscribe((data)=>{
          this.turnosLista = data;
          console.log(this.turnosLista);
          
        });


        
      }

    });
    
  }

  seleccionarEspecialista(especialista: Especialista) {
    this.doctorSeleccionado = especialista;
    console.log('Especialista seleccionado:', especialista);
    if (especialista && especialista.especialidades) {
      this.especialidadesXDoctor = especialista.especialidades;
      this.mostrarEspecialidades = true;
      this.toastM.success(`Seleccionaste a ${especialista.nombre} ${especialista.apellido}`);
    }

    console.log('Especialidades del especialista:', this.especialidadesXDoctor);
  }

  async seleccionarEspecialidad(especialidad: Especialidad){
    console.log(especialidad);
    this.especialidadSeleccionada = especialidad;
    if(this.esAdmin){
      this.mostrarPacientes = true;
      if(especialidad.horariosAtencion == null || especialidad.horariosAtencion.length == 0){
        this.toastM.error(`${this.doctorSeleccionado?.nombre} no tiene disponibilidad horaria para ${especialidad.nombre}`,"Sin disponibilidad");
      }
    }else{

      if(especialidad.horariosAtencion && this.doctorSeleccionado){
        const turnosReservados = await this.fireSvc.obtenerTurnosReservados(this.doctorSeleccionado.id, especialidad.nombre);
        console.log(turnosReservados);
        
        const diasDisponibles = this.obtenerDiasDisponibles(especialidad.horariosAtencion, especialidad.duracionTurno, turnosReservados);
        console.log(diasDisponibles);
        
  
      }else{
        this.toastM.error(`${this.doctorSeleccionado?.nombre} no tiene disponibilidad horaria para ${especialidad.nombre}`,"Sin disponibilidad");
      }    
    }
    this.mostrarEspecialidades = false;

  }

  seleccionarPaciente(paciente: Paciente){
    this.pacienteSeleccionado = paciente;    
    this.toastM.success(`Seleccionaste a ${paciente.nombre} ${paciente.apellido}`);
    this.mostrarDiasDisponibles = true;
    this.mostrarPacientes = false;

  }

  seleccionarDia(dia: any){
    this.mostrarHorasDisponibles = true;

  }

  // buscarHorarios(){
  //   const currentDate = new Date();
  //   const listaTurnosDelEspecialista = this.turnosLista.filter(
  //     (t) => t.especialista.id == this.doctorSeleccionado?.id
  //   );
  //   const turnosEspecialidad =
  //     // listaTurnosDelEspecialista[0].turnos =
  //     listaTurnosDelEspecialista.filter((t: any) => {
  //       return (
  //         t.especialidad == this.especialidadSeleccionada?.nombre &&
  //         currentDate.getTime() < new Date(t.fecha.seconds * 1000).getTime()
  //       );
  //     });
  //   // console.log(listaTurnosDelEspecialista[0].turnos);
  //   // console.log(turnosEspecialidad);
  //   const turnos15dias: any[] = [];
  //   for (let i = 0; i < turnosEspecialidad.length; i++) {
  //     const turno = { ...turnosEspecialidad[i] };
  //     if (
  //       new Date(turno.fecha.seconds * 1000).getTime() <=
  //         currentDate.getTime() + 84600000 * 15 &&
  //       turno.estado == 'disponible'
  //     ) {
  //       turno.fecha = new Date(turno.fecha.seconds * 1000);
  //       turnos15dias.push(turno);
  //     }
  //     }
  //   }
  //   this.turnosEncontrados = [...turnos15dias];
  //   return false;
  // }

  buscarHorarios() {
    const currentDate = moment(); // Usamos moment para la fecha actual
    const listaTurnosDelEspecialista = this.turnosLista.filter(
      (t) => t.especialista.id == this.doctorSeleccionado?.id
    );
  
    const turnosEspecialidad = listaTurnosDelEspecialista.filter((t: any) => {
      // Comparamos las fechas usando moment
      return (
        t.especialidad == this.especialidadSeleccionada?.nombre &&
        currentDate.isBefore(moment(t.fecha.seconds * 1000)) // Usamos moment para la comparación
      );
    });
  
    const turnos15dias: any[] = [];
    for (let i = 0; i < turnosEspecialidad.length; i++) {
      const turno = { ...turnosEspecialidad[i] };
      
      const turnoFecha = moment(turno.fecha_turno.seconds * 1000); // Convertimos la fecha a un objeto moment
  
      // Comparamos con moment y verificamos si está dentro de los próximos 15 días
      if (turnoFecha.isBefore(currentDate.clone().add(15, 'days')) && turno.estado == EstadoTurno.Libre) {
        // Convertimos la fecha de vuelta a Timestamp
        turno.fecha_turno = Timestamp.fromDate(turnoFecha.toDate()); // Convertimos a Timestamp para Firebase
        turnos15dias.push(turno);
      }
    }
  
    this.turnosEncontrados = [...turnos15dias];
    return false;
  }
  loadFreeHoursOneDay(date: Date) {
    // this.spinner = true;
    this.turnosDeUnDiaAMostrar = [];
    
      const currentDate = Timestamp.fromDate(new Date()); // Convertimos la fecha actual a Timestamp
      const listaTurnosDelEspecialista = this.turnosLista.filter(
        (t) => t.especialista.id == this.doctorSeleccionado?.id
      );
      
      const turnosEspecialidad = listaTurnosDelEspecialista.filter((t: any) => {
        return (
          t.especialidad == this.especialidadSeleccionada?.nombre &&
          currentDate.seconds < t.fecha.seconds // Comparamos los Timestamp
        );
      });
      
      const turnosDeUndia: any[] = [];
      
      for (let i = 0; i < turnosEspecialidad.length; i++) {
        const turno = { ...turnosEspecialidad[i] };
        
        const turnoFecha = turno.fecha_turno; // Esto es un Timestamp
        
        // Comparamos las fechas usando Timestamp y validamos que esté dentro de los próximos 15 días
        if (
          turnoFecha.seconds <= currentDate.seconds + 84600000 * 15 / 1000 && // 84600000 ms = 15 días en segundos
          turnoFecha.toDate().getDate() == date.getDate() && // Comparamos el día específico
          turno.estado == EstadoTurno.Libre
        ) {
          turno.fecha_turno = turnoFecha; // Deja el valor de fecha como Timestamp
          turnosDeUndia.push(turno);
        }
      }
      
      // this.spinner = false;
      this.turnosDeUnDiaAMostrar = [...turnosDeUndia];

  }
  volver(){
    if(this.mostrarHorasDisponibles){
      this.mostrarHorasDisponibles = false;
      this.mostrarEspecialidades = true;
    }
    else if(this.mostrarEspecialidades){
      this.mostrarEspecialidades = false;
      this.mostrarHorasDisponibles = false;
    }

  }

  obtenerDiasDisponibles(
    horariosAtencion: HorarioAtencion[],
    duracionTurno: number,
    turnosReservados: Turno[]
  ) {
    const diasDisponibles: { fecha: string, horarios: string[] }[] = [];
    const hoy = moment(); // Fecha de inicio
    const finPeriodo = moment().add(15, 'days'); // 15 días desde hoy
  
    // Filtrar los horarios de atención de la especialidad
    const horariosEspecialidad = horariosAtencion.filter((horario: HorarioAtencion) =>
      horario.habilitado // Solo considerar horarios habilitados
    );


    while (hoy.isBefore(finPeriodo)) {
      const diaSemana = hoy.format('dddd'); // Obtener el nombre del día (Lunes, Martes, etc.)

      // Filtrar horarios para el día específico
      const horarioDelDia = horariosEspecialidad.find(horario => horario.dia === diaSemana);

      if (horarioDelDia) {
        const fechaActual = hoy.format('YYYY-MM-DD');

        // Generar los horarios disponibles para la fecha
        const horariosDisponibles = this.generarHorariosDisponibles(
          horarioDelDia.rangoHorario.inicio, 
          horarioDelDia.rangoHorario.fin, 
          duracionTurno, 
          fechaActual, 
          turnosReservados
        );

        // Si hay horarios disponibles, los agregamos a la lista
        if (horariosDisponibles.length > 0) {
          diasDisponibles.push({ fecha: fechaActual, horarios: horariosDisponibles });
        }
      }

      hoy.add(1, 'days'); // Pasar al día siguiente
    }

  return diasDisponibles;
}

generarHorariosDisponibles(
  inicio: number, // Hora de inicio en formato de 24 horas (por ejemplo, 10 para 10AM)
  fin: number,    // Hora de fin en formato de 24 horas (por ejemplo, 18 para 6PM)
  duracionTurno: number, // Duración del turno en minutos
  fecha: string,  // Fecha del día en formato 'YYYY-MM-DD'
  turnosReservados: Turno[] // Lista de turnos ya reservados
) {
  const horariosDisponibles: string[] = [];
  const startTime = moment(`${fecha} ${inicio}:00`, 'YYYY-MM-DD HH:mm');
  const endTime = moment(`${fecha} ${fin}:00`, 'YYYY-MM-DD HH:mm');

  // Iterar sobre el rango de horas, generando intervalos
  while (startTime.isBefore(endTime)) {
    const horaFin = moment(startTime).add(duracionTurno, 'minutes');
    
    // Verificar si ya existe un turno en el intervalo
    const turnoSuperpuesto = turnosReservados.find(turno => {
      const turnoInicio = moment(turno.fecha_turno.toDate());
      const turnoFin = moment(turno.fecha_turno_fin?.toDate());
      
      return (
        (startTime.isBefore(turnoFin) && horaFin.isAfter(turnoInicio)) ||
        (turnoInicio.isBefore(horaFin) && turnoFin.isAfter(startTime))
      );
    });

    // Si no hay superposición, agregar el horario a la lista
    if (!turnoSuperpuesto) {
      horariosDisponibles.push(startTime.format('hh:mmA')); // Formato de 12 horas (AM/PM)
    }

    // Avanzar al siguiente intervalo
    startTime.add(duracionTurno, 'minutes');
  }

  return horariosDisponibles;
}

}
