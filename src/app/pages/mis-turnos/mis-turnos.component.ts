import { Component, inject, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { AccionesTurno, EstadoTurno, Turno } from '../../models/turno';
import { Perfil } from '../../models/usuario';
import { EstadoTurnoDirective } from '../../directives/estado-turno.directive';
import { FiltroTurnoPipe } from '../../pipes/filtro-turno.pipe';
import { FormsModule } from '@angular/forms';
import { ComentarioComponent } from '../../components/comentario/comentario.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule,EstadoTurnoDirective,FiltroTurnoPipe,FormsModule, ComentarioComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent implements OnInit {
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  turnosLista: Array<Turno> = [];
  esEspecialista = false;
  esPaciente = false;
  esAdmin = false;
  filtroBusqueda : string = "";
  usuarioInfo : any ;
  loading = true;
  posiblesAcciones : string[] = [];
  dejarComentario = false;
  ocultarAcciones = false;
  mostrarModal = false;
  turnoSeleccionado!: Turno;
  ngOnInit() {
    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) {
        await this.fireSvc.obtenerUsuarioDatos(res.email).then((resp)=>{
          this.usuarioInfo = resp;

          this.fireSvc.traerTurnos().subscribe((data) => {
            this.turnosLista = data;
            // console.log(this.turnosLista);
            if(this.usuarioInfo?.perfil == Perfil.Paciente){
              this.esPaciente = true;
              this.turnosLista = this.filtrarTurnosPorPaciente(data, this.usuarioInfo.id);
            }
            else if(this.usuarioInfo?.perfil == Perfil.Especialista){
              this.esEspecialista = true;
              this.turnosLista = this.filtrarTurnosPorEspecialista(data, this.usuarioInfo.id);
              console.log(this.turnosLista);            
            }
            else if(this.usuarioInfo?.perfil == Perfil.Administrador){
              this.esAdmin = true;
  
            }
            this.spinnerSvc.hide();
            this.loading = false;
          });
        })
      }

      
    });
  }

  filtrarTurnosPorEspecialista(turnos: Turno[], especialistaId: string): Turno[] {
    return turnos.filter(turno => turno.especialista.id === especialistaId);
  }

  filtrarTurnosPorPaciente(turnos: Turno[], pacienteId: string): Turno[] {
    return turnos.filter(turno => turno.paciente.id === pacienteId);
  }

  realizarUnaAccion(turno: Turno){
    switch (this.usuarioInfo.perfil){
      case Perfil.Paciente:
        break;
      case Perfil.Administrador:
        break;
      case Perfil.Especialista:
        break;
      default: 
        this.toastM.error("No se reconocio al usuario");
        break;
    }
  }
  async cancelarTurno(turno: Turno){
    // this.dejarComentario = true;
    // turno.comentario = ;
    turno.estado = EstadoTurno.Cancelado;
    this.spinnerSvc.show();
    await this.fireSvc.actualizarTurno(turno).then(()=>{
      this.toastM.success("Turno cancelado");
    }).catch(()=>{
      this.toastM.error("Ocurrio un error al actualizar el turno");
    })
    this.spinnerSvc.hide();
    console.log(turno);
    
  }
  ejecutarAccion(turno: Turno, accion: AccionesTurno) {
    this.turnoSeleccionado = turno;
    switch (accion) {
      case AccionesTurno.Cancelar:
        this.dejarComentario = true;
        this.ocultarAcciones = true;
        // this.cancelarTurno(turno);

        // this.cancelarTurno(turno);
        break;
      case AccionesTurno.VerResenia:
        Swal.fire({
          title: "Comentario/Reseña",
          text: `${turno.comentario ? turno.comentario : turno.resenia}`,
          confirmButtonText: "Cerrar",
          confirmButtonColor:"#f05252"
        });
        break;
      case AccionesTurno.Encuesta:
        // this.completarEncuesta(turno);
        break;
      case AccionesTurno.Calificar:
        // this.calificarAtencion(turno);
        break;
      // Agrega otros casos según sea necesario
    }
  }


  abrirModal() {
    this.dejarComentario = true;
  }

  cerrarModal() {
    this.dejarComentario = false;
  }

  guardarComentario(motivo: string) {
    this.turnoSeleccionado.comentario = motivo;
    this.cancelarTurno(this.turnoSeleccionado);
    this.cerrarModal();
  }

  getAccionesPermitidas(turno: Turno): AccionesTurno[] {
    const acciones: AccionesTurno[] = [];

    // Acciones específicas para el perfil "Paciente"
    if((this.esEspecialista || this.esAdmin) && turno.estado == EstadoTurno.Pendiente)
     {
      acciones.push(AccionesTurno.Cancelar);
      // return acciones;
    }

    if(this.esEspecialista && !this.esAdmin && turno.estado == EstadoTurno.Pendiente )
     {
      acciones.push(AccionesTurno.Rechazar);
      // return acciones;
    }
    if(this.esEspecialista && turno.estado == EstadoTurno.Pendiente){
      acciones.push(AccionesTurno.Aceptar);

    }
    if(this.esEspecialista && turno.estado == EstadoTurno.Aceptado){
      acciones.push(AccionesTurno.Finalizar);

    }

    if (this.esPaciente && turno.estado !== EstadoTurno.Finalizado && turno.estado !== EstadoTurno.Cancelado && turno.estado !== EstadoTurno.Rechazado) {
      
      acciones.push(AccionesTurno.Cancelar);
    }
    if ((turno.comentario || turno.resenia) && !this.esAdmin) {
      acciones.push(AccionesTurno.VerResenia);
    }
    if (this.esPaciente && turno.estado === EstadoTurno.Finalizado && turno.resenia) {
      acciones.push(AccionesTurno.Encuesta);
    }
    if (this.esPaciente && turno.estado === EstadoTurno.Finalizado) {
      acciones.push(AccionesTurno.Calificar);
    }

    return acciones;
  }

}
