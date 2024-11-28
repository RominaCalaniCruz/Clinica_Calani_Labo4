import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Turno } from '../../models/turno';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Perfil } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { jsPDF } from 'jspdf'; 

@Component({
  selector: 'app-historia-clinica-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historia-clinica-turnos.component.html',
  styleUrl: './historia-clinica-turnos.component.scss'
})
export class HistoriaClinicaTurnosComponent {
  pacienteId!: string;
  @Output() cerrarModal = new EventEmitter<void>();
  logoUrl: string | null = null;

  turnos: Turno[] = []; // Lista completa de turnos
  turnosFiltrados!: Turno[]; // Turnos del paciente específico
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  usuarioInfo:any;
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  ngOnInit(): void {
    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) {
        await this.fireSvc.obtenerUsuarioDatos(res.email).then((resp) => {
          this.usuarioInfo = resp;

          this.fireSvc.traerTurnos().subscribe((data) => {
            this.turnos = data;
            this.spinnerSvc.hide();
            if (this.usuarioInfo?.perfil == Perfil.Paciente) {
              this.turnosFiltrados = this.filtrarTurnosPorPaciente(data, this.usuarioInfo.id);
            }

          });
        })
      }


    });
  }
  filtrarTurnosPorPaciente(turnos: Turno[], pacienteId: string): Turno[] {
    return turnos.filter(turno => turno.paciente.id === pacienteId && turno.historiaClinica !== null);
  }
  cerrar() {
    this.cerrarModal.emit();
  }

  async descargarPDF(){
    const element = document.getElementById('historiaClinica'); // ID del div a convertir
    if (!element) {
      console.error('Elemento no encontrado');
      return;
    }
    const pdf = new jsPDF();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const fecha = new Date();

    const fechaFormateada = new Intl.DateTimeFormat('es-AR', options).format(fecha);

    // const fecha = new Date().toLocaleDateString('es-ES', {
    //   year: 'numeric',
    //   month: 'long',
    //   day: 'numeric',
    //   weekday: 'long'
    // });
    
    pdf.addImage("/logo.png", 'PNG', 10, 10, 40, 40); 
    pdf.setFontSize(15);
    pdf.text(`Historia clinica de: ${this.turnosFiltrados[0]?.paciente?.nombre } ${this.turnosFiltrados[0]?.paciente?.apellido }`, 50, 20);
    pdf.text(`Fecha de emisión: ${fechaFormateada}`, 50, 30);
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 160; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 50, imgWidth, imgHeight);
      pdf.save(`HistoriaClinica_${fecha}.pdf`);
    });

  }
}
