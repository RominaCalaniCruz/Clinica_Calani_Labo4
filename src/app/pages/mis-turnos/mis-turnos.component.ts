import { ChangeDetectorRef, Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { AccionesTurno, EstadoTurno, Turno } from '../../models/turno';
import { Perfil } from '../../models/usuario';
import { EstadoTurnoDirective } from '../../directives/estado-turno.directive';
import { FiltroTurnoPipe } from '../../pipes/filtro-turno.pipe';
import { FormsModule } from '@angular/forms';
import { ComentarioComponent } from '../../components/comentario/comentario.component';
import Swal from 'sweetalert2'
import { EncuestaComponent } from '../../components/encuesta/encuesta.component';
import { Encuesta } from '../../models/encuesta.model';
import { HistoriaClinicaComponent } from '../../components/historia-clinica/historia-clinica.component';
import { HistoriaClinica } from '../../models/historia-clinica.model';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, EstadoTurnoDirective, FiltroTurnoPipe, FormsModule, ComentarioComponent, EncuestaComponent,HistoriaClinicaComponent],
  providers: [DatePipe],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent implements OnInit {
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  tituloComp = "";
  turnosLista: Array<Turno> = [];
  esEspecialista = false;
  esPaciente = false;
  esAdmin = false;
  filtroBusqueda: string = "";
  usuarioInfo: any;
  loading = true;
  accionElegida!: AccionesTurno;
  dejarComentario = false;
  ocultarAcciones = false;
  llenarHistoria = false;
  mostrarModal = false;
  turnoSeleccionado!: Turno;
  completarEncuesta = false;
  constructor(private cdr: ChangeDetectorRef, private datePipe: DatePipe) {

  }
  ngOnInit() {
    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) {
        await this.fireSvc.obtenerUsuarioDatos(res.email).then((resp) => {
          this.usuarioInfo = resp;

          this.fireSvc.traerTurnos().subscribe((data) => {
            this.turnosLista = data;
            // console.log(this.turnosLista);
            if (this.usuarioInfo?.perfil == Perfil.Paciente) {
              this.esPaciente = true;
              this.turnosLista = this.filtrarTurnosPorPaciente(data, this.usuarioInfo.id);
            }
            else if (this.usuarioInfo?.perfil == Perfil.Especialista) {
              this.esEspecialista = true;
              this.turnosLista = this.filtrarTurnosPorEspecialista(data, this.usuarioInfo.id);
              // console.log(this.turnosLista);            
            }
            else if (this.usuarioInfo?.perfil == Perfil.Administrador) {
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

  realizarUnaAccion(turno: Turno) {
    switch (this.usuarioInfo.perfil) {
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
  async cancelarTurno(turno: Turno) {
    // this.dejarComentario = true;
    // turno.comentario = ;
    this.spinnerSvc.show();
    await this.fireSvc.actualizarTurno(turno).then(() => {
      this.toastM.success("Turno cancelado");
    }).catch(() => {
      this.toastM.error("Ocurrio un error al actualizar el turno");
    }).finally(() => {

      this.spinnerSvc.hide();
    })
    console.log(turno);

  }
  ejecutarAccion(turno: Turno, accion: AccionesTurno) {
    this.turnoSeleccionado = turno;
    this.accionElegida = accion;

    switch (accion) {
      case AccionesTurno.Cancelar:
        this.dejarComentario = true;
        this.tituloComp = "Comentario sobre la cancelación:"

        // this.ocultarAcciones = true;
        // this.cancelarTurno(turno);

        // this.cancelarTurno(turno);
        break;
      case AccionesTurno.Rechazar:
        this.dejarComentario = true;
        this.tituloComp = "Motivo del rechazo de turno:"

        // this.ocultarAcciones = true;
        // this.cancelarTurno(turno);

        // this.cancelarTurno(turno);
        break;
      case AccionesTurno.VerResenia:
        const separacion = turno.comentario.split(":");
        if(turno.resenia && turno.comentario) {
          Swal.fire({
            html: `<div style="background-color: rgba(0, 255, 0, 0.1); padding: 20px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">${separacion[0]}:</td>
                  <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${separacion[1]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Reseña del doctor:</td>
                  <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${turno.resenia}</td>
                </tr>
              </table>
            </div>`,
            confirmButtonText: "Cerrar",
            confirmButtonColor: "#f05252"
          })
        }
        else{
          if(turno.resenia){
            Swal.fire({
              title: "Reseña del doctor:",
              text: turno.resenia,
              confirmButtonText: "Cerrar",
              confirmButtonColor: "#f05252"
            });
          }else{
            Swal.fire({
              title: `${separacion[0]}:`,
              text: `${separacion[1]}`,
              confirmButtonText: "Cerrar",
              confirmButtonColor: "#f05252"
            });
          }
          
        }
        break;
      case AccionesTurno.Aceptar:
        const fechaConvertida = this.datePipe.transform(this.turnoSeleccionado.fecha_turno.toDate(), 'HH:mm EEE dd MMM', undefined, 'es-AR');

        Swal.fire({
          title: `Deseas aceptar el turno?`,
          html: `
                <div style="background-color: rgba(0, 255, 0, 0.1); padding: 20px; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Fecha:</td>
                  <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${fechaConvertida}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Especialidad:</td>
                  <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${this.turnoSeleccionado.especialidad.nombre}</td>
                </tr>

                <tr>
                  <td style="padding: 8px; border: 1px solid #bee8f4; font-weight: bold; background-color: #f4fdf4;">Paciente:</td>
                  <td style="padding: 8px; border: 1px solid #bee8f4; background-color: #f4fdf4;">${this.turnoSeleccionado.paciente.nombre} ${this.turnoSeleccionado.paciente.apellido}</td>
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
          if (result.isConfirmed) {
            this.turnoSeleccionado.estado = EstadoTurno.Aceptado;
            this.fireSvc.actualizarTurno(this.turnoSeleccionado).then(() => {
              this.toastM.success("Turno Aceptado");
            }).catch(() => {
              this.toastM.error("Ocurrio un error al aceptar el turno");
            });
          }
        });
        break;
      case AccionesTurno.Encuesta:
        this.completarEncuesta = true;
        // this.completarEncuesta(turno);
        break;
      case AccionesTurno.Calificar:
        this.tituloComp = "Calificar atención (observaciones):"
        this.dejarComentario = true;
        // this.calificarAtencion(turno);
        break;
      case AccionesTurno.Finalizar:
        this.llenarHistoria = true;
        
        break;

      // Agrega otros casos según sea necesario
    }
  }
  guardarEncuesta(encuesta: Encuesta) {
    this.spinnerSvc.show();
    this.cdr.detectChanges();

    this.turnoSeleccionado.encuesta = encuesta;
    this.fireSvc.guardarEncuestaTurno(this.turnoSeleccionado)
      .then(() => {
        this.toastM.success("Encuesta Enviada!");
      })
      .catch(error => {
        console.error("Error al guardar la encuesta:", error);
        this.toastM.error("Error al enviar la encuesta.");
      })
      .finally(() => {
        this.spinnerSvc.hide();
        this.cerrarModal();
        this.cdr.detectChanges();

      });
  }

  cerrarModal() {

    if (this.dejarComentario) {
      this.dejarComentario = false;
    }
    else if (this.completarEncuesta) {
      this.completarEncuesta = false;
    }
    else if(this.llenarHistoria){
      this.llenarHistoria = false;
    }
  }



  guardarComentario(motivo: string) {

    this.turnoSeleccionado.comentario = motivo;
    if (this.turnoSeleccionado.estado == EstadoTurno.Finalizado) {
      const accion = "Comentario final de la atención:";
      this.turnoSeleccionado.comentario = accion + motivo;
      this.fireSvc.actualizarTurno(this.turnoSeleccionado).then(() => {
        this.toastM.success("Calificacion realizada!");
      }).catch(() => {
        this.toastM.error("se produjo un error al guardar la calificacion");
      });

    }
    else if (this.accionElegida == AccionesTurno.Rechazar) {
      const realizar = "Motivo del rechazo de turno:";
      this.turnoSeleccionado.comentario = realizar + motivo;
      this.turnoSeleccionado.estado = EstadoTurno.Rechazado;

      this.cancelarTurno(this.turnoSeleccionado);
    }
    else if (this.accionElegida == AccionesTurno.Cancelar) {
      const accion = "Motivo de cancelacion:";
      this.turnoSeleccionado.comentario = accion + motivo;
      this.turnoSeleccionado.estado = EstadoTurno.Cancelado;

      this.cancelarTurno(this.turnoSeleccionado);
    }
    this.cerrarModal();
  }

  guardarHistoriaClinica(event: { historia: HistoriaClinica; resenia: string }){
    // console.log(event.historia);
    // console.log(event.resenia);
    
    this.turnoSeleccionado.historiaClinica = event.historia;
    this.turnoSeleccionado.resenia = event.resenia;
    this.fireSvc.guardarHistoriaClinica(this.turnoSeleccionado).then(()=>{
      this.toastM.success("Se cargo exitosamente la historia clinica y el turno esta finalizado.","Turno Finalizado",{timeOut:4000});

    }).finally(()=>{
      this.spinnerSvc.hide();
      this.cerrarModal();
    });
  }
  
  getAccionesPermitidas(turno: Turno): AccionesTurno[] {
    const acciones: AccionesTurno[] = [];

    // Acciones específicas para el perfil "Paciente"
    if ((this.esEspecialista || this.esAdmin) && turno.estado == EstadoTurno.Pendiente) {
      acciones.push(AccionesTurno.Cancelar);
      // return acciones;
    }

    if (this.esEspecialista && !this.esAdmin && turno.estado == EstadoTurno.Pendiente) {
      acciones.push(AccionesTurno.Rechazar);
      // return acciones;
    }
    if (this.esEspecialista && turno.estado == EstadoTurno.Pendiente) {
      acciones.push(AccionesTurno.Aceptar);

    }
    if (this.esEspecialista && turno.estado == EstadoTurno.Aceptado) {
      acciones.push(AccionesTurno.Finalizar);

    }

    if (this.esPaciente && turno.estado !== EstadoTurno.Finalizado && turno.estado !== EstadoTurno.Cancelado && turno.estado !== EstadoTurno.Rechazado) {

      acciones.push(AccionesTurno.Cancelar);
    }
    if ((turno.comentario || turno.resenia) && !this.esAdmin) {
      acciones.push(AccionesTurno.VerResenia);
    }
    if (this.esPaciente && turno.estado === EstadoTurno.Finalizado && turno.resenia && turno.encuesta == null) {
      acciones.push(AccionesTurno.Encuesta);
    }
    if (this.esPaciente && turno.estado === EstadoTurno.Finalizado && !turno.comentario) {
      acciones.push(AccionesTurno.Calificar);
    }

    return acciones;
  }

}
