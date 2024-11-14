import { Component, inject, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Especialista, Paciente, Perfil, Usuario } from '../../models/usuario';
import { Especialidad, HorarioAtencion } from '../../models/especialidad.model';
import { CommonModule, DatePipe } from '@angular/common';

import Swal from 'sweetalert2';

import { EstadoTurno, Turno } from '../../models/turno';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-sacar-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sacar-turno.component.html',
  styleUrl: './sacar-turno.component.scss'
})
export class SacarTurnoComponent implements OnInit {
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  usuarioInfo: any;
  loading = true;
  esAdmin = false;
  fotoEspecialidad = "/Especialidad.png";
  doctoresLista: Array<Especialista> = [];
  pacientesLista: Array<Paciente> = [];
  turnosLista: Array<Turno> = [];

  doctorSeleccionado: Especialista | null = null;
  especialidadSeleccionada: Especialidad | null = null;
  pacienteSeleccionado: Paciente | null = null;
  turnoSeleccionado: Turno | null = null;

  especialidadesXDoctor: Array<Especialidad> = [];

  mostrarEspecialidades = false;
  mostrarDiasDisponibles = false;
  mostrarHorasDisponibles = false;
  mostrarPacientes = false;
  mostrarDoctores = false;

  horasAMostrarXDia: any[] = [];

  diasAMostrar: any[] = [];
  horaSeleccionada: any ;
  diaSeleccionado: any;

  ngOnInit() {
    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) {
        this.usuarioInfo = (await this.fireSvc.obtenerUsuarioDatos(res.email)) as any;
        // console.log(this.usuarioInfo);
        this.esAdmin = this.usuarioInfo.perfil == Perfil.Administrador;
        // console.log(this.esAdmin);

        this.fireSvc.traerEspecialistas().subscribe((data) => {

          this.doctoresLista = data.filter(esp => esp.cuenta_habilitada);
          // console.log(this.doctoresLista);
          this.spinnerSvc.hide();
          this.loading = false;
          this.mostrarDoctores = true;
        });

        if (this.esAdmin) {
          this.fireSvc.traerPacientes().subscribe((data) => {

            this.pacientesLista = data;
            // console.log(this.pacientesLista);

          });
        }

        this.fireSvc.traerTurnos().subscribe((data) => {
          this.turnosLista = data;
          // console.log(this.turnosLista);

        });



      }

    });

  }

  seleccionarEspecialista(especialista: Especialista) {
    this.doctorSeleccionado = especialista;
    // console.log('Especialista seleccionado:', especialista);
    if (especialista && especialista.especialidades) {
      this.especialidadesXDoctor = especialista.especialidades;
      this.mostrarEspecialidades = true;
      this.mostrarDoctores = false;
      this.toastM.success(`Seleccionaste a ${especialista.nombre} ${especialista.apellido}`);
    }

    // console.log('Especialidades del especialista:', this.especialidadesXDoctor);
  }

  async seleccionarEspecialidad(especialidad: Especialidad) {
    // console.log(especialidad);
    this.especialidadSeleccionada = especialidad;

    if (this.esAdmin) {
      if (especialidad.horariosAtencion == null || especialidad.horariosAtencion.length == 0) {
        this.toastM.error(`${this.doctorSeleccionado?.nombre} no tiene disponibilidad horaria para ${especialidad.nombre}`, "Sin disponibilidad");
      } else {
        this.mostrarEspecialidades = false;
        this.mostrarPacientes = true;
      }
    } else {

      if (especialidad.horariosAtencion == null || especialidad.horariosAtencion.length == 0) {
        this.toastM.error(`${this.doctorSeleccionado?.nombre} no tiene disponibilidad horaria para ${especialidad.nombre}`, "Sin disponibilidad");
      } else {

        this.diasAMostrar = this.generarDiasDisponibles(especialidad);
        // console.log(this.diasAMostrar);  
        this.mostrarEspecialidades = false;
        this.mostrarDiasDisponibles = true;
      }
    }
  }
  seleccionarHora(hora:any){
    this.horaSeleccionada = hora;
    // console.log(this.horaSeleccionada);
    const horaConvertida = this.convertirADateTimestamp(this.diaSeleccionado,this.horaSeleccionada);
        // console.log(horaConvertida);
        let htmlPaciente = "";
        if(this.pacienteSeleccionado == null){
          this.pacienteSeleccionado = this.usuarioInfo;
        }else{
          htmlPaciente = `<tr>
          <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Paciente:</td>
          <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${this.pacienteSeleccionado?.nombre} ${this.pacienteSeleccionado?.apellido}</td>
          </tr>`;
        }
        Swal.fire({
          title: "<strong>Quieres confirmar el turno?</strong>",
          text: `Fecha: ${this.diaSeleccionado} \nHora:${this.horaSeleccionada}\nEspecialidad: ${this.especialidadSeleccionada?.nombre} \nEspecialista:${this.doctorSeleccionado?.nombre}`,
          icon: "warning",
          html: `
       <div style="background-color: rgba(0, 255, 0, 0.1); padding: 20px; border-radius: 8px;">
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Fecha:</td>
          <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${this.diaSeleccionado}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Hora:</td>
          <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${this.horaSeleccionada}</td>
        </tr>
         ${htmlPaciente}
        <tr>
          <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Especialidad:</td>
          <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${this.especialidadSeleccionada?.nombre}</td>
        </tr>

        <tr>
          <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Especialista:</td>
          <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${this.doctorSeleccionado?.nombre} ${this.doctorSeleccionado?.apellido}</td>
        </tr>
       
      </table>
    </div>
  `,
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#0abf31",
          cancelButtonColor: "#d33",
          confirmButtonText: "Confirmar"
        }).then(async (result) => {
          if(this.pacienteSeleccionado == null){
            this.pacienteSeleccionado = this.usuarioInfo;
          }
          if (result.isConfirmed) {
            this.spinnerSvc.show();
            let nuevoTurno : Turno = {
              id: "",
              calificacion: null,
              comentario: "",
              especialidad: {
                nombre: this.especialidadSeleccionada!.nombre,
                duracion: this.especialidadSeleccionada!.duracionTurno
              },
              especialista: {
                id: this.doctorSeleccionado!.id,
                apellido: this.doctorSeleccionado!.apellido,
                nombre: this.doctorSeleccionado!.nombre
              },
              estado: EstadoTurno.Pendiente,
              fecha_turno: horaConvertida as Timestamp,
              fecha_turno_fin: null,
              historiaClinica: null,
              paciente: {
                id: this.pacienteSeleccionado!.id,
                apellido: this.pacienteSeleccionado!.apellido,
                nombre:this.pacienteSeleccionado!.nombre
              },
              resenia: ""
            }
            await this.fireSvc.nuevoTurno(nuevoTurno);
            this.spinnerSvc.hide();
            this.toastM.success("Nuevo Turno agendado!");
            this.mostrarDiasDisponibles = false;
            this.mostrarHorasDisponibles = false;
            this.mostrarEspecialidades = false;
            this.mostrarDoctores = true;

          }
        });
    
  }

  convertirADateTimestamp(dia: string, hora: string): Timestamp |null {
    const [year, month, day] = dia.split('-');
    const hora24 = this.convertirHora24(hora);
    const fechaHora = `${year}-${month}-${day}T${hora24}:00`;
    const fecha = new Date(fechaHora);
    if (isNaN(fecha.getTime())) {
      console.error("Fecha no válida:", fechaHora);
      return null;
    }
    return Timestamp.fromDate(fecha);
  }

  filtrarHorasOcupadas(
    horas: string[],
    turnos: Turno[],
    especialidadNombre: string, 
    especialistaId: string,
    diaSeleccionado: string 
  ): string[] {
    const [anio, mes, dia] = diaSeleccionado.split("-").map(Number);
    const fechaSeleccionada = new Date(anio, mes - 1, dia, 0, 0, 0);
  
    return horas.filter((hora) => {
      const hora24Format = this.convertirHora24(hora);
      const [hora24, minutos24] = hora24Format.split(":").map(Number);
  
      return !turnos.some((turno) => {
        const fechaTurno = turno.fecha_turno.toDate();
  
        return (
          fechaTurno.getDate() === fechaSeleccionada.getDate() &&
          fechaTurno.getMonth() === fechaSeleccionada.getMonth() &&
          fechaTurno.getFullYear() === fechaSeleccionada.getFullYear() &&
          fechaTurno.getHours() === hora24 &&
          fechaTurno.getMinutes() === minutos24 &&
          turno.especialidad.nombre === especialidadNombre &&
          turno.especialista.id === especialistaId &&
          (turno.estado === "Pendiente" || turno.estado === "Aceptado")
        );
      });
    });
  }
  convertirHora24(hora: string): string {
    const [time, modifier] = hora.trim().split(/(AM|PM)/);
    let [hours, minutes] = time.split(':').map(Number); 
  
    if (modifier === 'PM' && hours !== 12) {
      hours += 12; 
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0; 
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  obtenerHorarioPorDia(diaSemana: string, especialidad: Especialidad): HorarioAtencion | null {
    if (!especialidad.horariosAtencion) {
      // console.log("No hay horarios de atención disponibles.");
      return null;
    }
    const horario = especialidad.horariosAtencion.find(h => {
      const diaCoincide = h.dia.toLowerCase() === diaSemana.toLowerCase();
      const habilitado = h.habilitado;
      return diaCoincide && habilitado;
    });
    // console.log("Horario encontrado:", horario);
    return horario || null;
  }

  seleccionarPaciente(paciente: Paciente) {
    this.pacienteSeleccionado = paciente;
    this.toastM.success(`Seleccionaste a ${paciente.nombre} ${paciente.apellido}`);
    this.diasAMostrar = this.generarDiasDisponibles(this.especialidadSeleccionada as Especialidad);
    this.mostrarPacientes = false;
    this.mostrarDiasDisponibles = true;
    // console.log(this.diasAMostrar);  
  }


  obtenerDiaSemana(fecha: string): string {
    const partesFecha = fecha.split('-');
    const anio = parseInt(partesFecha[0], 10);
    const mes = parseInt(partesFecha[1], 10) - 1;  
    const dia = parseInt(partesFecha[2], 10);
    const fechaObj = new Date(Date.UTC(anio, mes, dia));    
    const diasDeLaSemana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const diaSemana = fechaObj.getUTCDay(); 
    return diasDeLaSemana[diaSemana];
  }

generarDiasDisponibles(especialidad: Especialidad) {
  let dias: string[] = [];
  const fechaHoy = new Date();
  const fechas: string[] = [];
  const diasDeLaSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  if (!especialidad.horariosAtencion) {
    return [];
  }
  dias = especialidad.horariosAtencion
    .filter(horario => horario.habilitado)
    .map(horario => horario.dia);

  for (let i = 0; i < 15; i++) {
    const fecha = new Date(fechaHoy);
    fecha.setDate(fechaHoy.getDate() + i);
    const diaSemana = diasDeLaSemana[fecha.getDay()];
    if (dias.includes(diaSemana)) {
      const anio = fecha.getFullYear();
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); 
      const dia = fecha.getDate().toString().padStart(2, '0'); 
      const fechaFormateada = `${anio}-${mes}-${dia}`; 
      fechas.push(fechaFormateada);
    }
  }
  return fechas;
}

  generarHoras(horaInicio: number, horaFin: number, duracionTurno: number) {
    const horasGeneradas: string[] = [];
    let tiempoInicio = horaInicio * 60;
    let tiempoFin = horaFin * 60;
    while (tiempoInicio <= tiempoFin) {
      const hora = Math.floor(tiempoInicio / 60); 
      const minutos = tiempoInicio % 60; 
      const horaFormateada = this.formatoAMPM(hora, minutos);
      horasGeneradas.push(horaFormateada);
      tiempoInicio += duracionTurno;
    }
    return horasGeneradas;
  }

  formatoAMPM(hora: number, minutos: number): string {
    const ampm = hora >= 12 ? 'PM' : 'AM';
    let horaFormateada = hora % 12;
    if (horaFormateada === 0) {
      horaFormateada = 12;
    }
    const minutosFormateados = minutos < 10 ? `0${minutos}` : minutos;
    return `${horaFormateada}:${minutosFormateados} ${ampm}`;
  }

  seleccionarDia(dia: any) {
    this.diaSeleccionado = dia;
    // console.log(this.diaSeleccionado);
    const diaConvertido = this.obtenerDiaSemana(this.diaSeleccionado);
    // console.log(diaConvertido);
    // console.log(this.especialidadSeleccionada);
    
    
        const horario = this.obtenerHorarioPorDia(diaConvertido, this.especialidadSeleccionada!);
        if(horario){
          const horaSinFiltro = this.generarHoras(horario?.rangoHorario.inicio, horario?.rangoHorario.fin, this.especialidadSeleccionada!.duracionTurno);
          // console.log(horaSinFiltro);
          // console.log(this.turnosLista);
          // console.log( this.especialidadSeleccionada!.nombre);
          // console.log(this.doctorSeleccionado!.id);
          
          
          
          this.horasAMostrarXDia = this.filtrarHorasOcupadas(horaSinFiltro,this.turnosLista,this.especialidadSeleccionada!.nombre,this.doctorSeleccionado!.id,this.diaSeleccionado);
          
          this.mostrarHorasDisponibles = true;
          // console.log(this.horasAMostrarXDia);
          
        }
        
        
  }  
  volver() {
    if (this.mostrarDiasDisponibles) {
      this.mostrarDiasDisponibles = false;
      this.horasAMostrarXDia = [];
      this.mostrarHorasDisponibles = false;
      this.diasAMostrar = [];
      if (this.esAdmin) {
        this.mostrarPacientes = true;
      } else {
        this.mostrarEspecialidades = true;
      }
      // this.mostrarHorasDisponibles = false;
    }
    else if (this.mostrarEspecialidades) {
      this.mostrarEspecialidades = false;
      // this.mostrarHorasDisponibles = false;
      this.mostrarDoctores = true;
    }
    else if (this.mostrarPacientes) {
      this.mostrarPacientes = false;
      this.mostrarEspecialidades = true;
    }
    

  }

}
