import { Component, inject, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstadoTurno, Turno } from '../../models/turno';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
})
export class PacientesComponent implements OnInit{
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  verTurnos = false;
  verHistoria = false;
  // router = inject(Router);
  turnosPacienteSeleccionado: Turno[] = [];
  spinnerSvc = inject(NgxSpinnerService);
  pacienteSeleccionado: { id: string; nombre: string; foto: string } | null = null;
  turnoSeleccionado!:Turno;
  usuarioInfo: any;
  turnosLista:any[]=[];
  pacientesId:any[]=[];
  pacientesUnicos:any[]=[];
  // usuariosL
  ngOnInit() {
    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) {
        await this.fireSvc.obtenerUsuarioDatos(res.email).then(async (resp) => {
          this.usuarioInfo = resp;          
          this.turnosLista = await this.fireSvc.traerTurnosxIdEspecialista(this.usuarioInfo.id);
          console.log(this.turnosLista);
          
          // this.pacientesId = Array.from(new Set(this.turnosLista.map(turno=> turno.paciente.id)));

          this.pacientesUnicos = this.getPacientesUnicos(this.turnosLista.filter(turno => turno.estado == EstadoTurno.Finalizado));
          console.log(this.pacientesUnicos);
          
          this.spinnerSvc.hide();

          });
        }
      });
  }
  getPacientesUnicos(turnosFiltrados: Turno[]): { id: string; nombre: string; foto: string }[] {
    const pacientesMap = new Map<string, { id: string; nombre: string; foto: string }>();
  
    turnosFiltrados.forEach(turno => {
      const paciente = turno.paciente;
      if (!pacientesMap.has(paciente.id)) {
        pacientesMap.set(paciente.id, {
          id: paciente.id,
          nombre: `${paciente.nombre} ${paciente.apellido}`,
          foto: paciente.foto
        });
      }
    });
  
    return Array.from(pacientesMap.values());
  }
  mostrarTurnosPaciente( paciente: { id: string; nombre: string; foto: string }): void {
    this.verTurnos = true;
    this.pacienteSeleccionado = paciente;
    console.log(this.pacienteSeleccionado);
    
    this.turnosPacienteSeleccionado = this.turnosLista
      .filter(turno => turno.paciente.id === paciente.id && turno.estado == EstadoTurno.Finalizado)
      .sort((a, b) => b.fecha_turno.toDate().getTime() - a.fecha_turno.toDate().getTime())
      .slice(0, 3);
    // this.modalService.open(content, { size: 'lg', backdrop: 'static' }); // Abre el modal
    console.log(this.turnosPacienteSeleccionado);
    
  }
  cerrar(){
     if(this.verHistoria){
      this.verHistoria = false;
    }
    else if(this.verTurnos){
      this.verTurnos = false;
    }
  }
  verResenia(turno: Turno){
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
  }
  verHistoriaClinica(turno: Turno){
    this.verHistoria = true;
    this.turnoSeleccionado = turno;
  }
}
