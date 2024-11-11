import { AfterContentInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, HorarioSeleccionadoDirective],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss'
})
export class MiPerfilComponent implements OnInit {
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  @ViewChild('diasSelect') mySelect!: ElementRef<HTMLSelectElement>;  // Referencia al <select> del DOM

  usuarioInfo?: any;
  loading = true;
  especialidades!: Array<Especialidad>;
  activeTab!: string;
  tabs = [
    { id: 'tab1', nombre: "Clinico", label: 'Tab 1', content: 'Contenido de la pestaña 1.' },
    { id: 'tab2', nombre: "otorrino", label: 'Tab 2', content: 'Contenido de la pestaña 2.' },
    { id: 'tab3', nombre: "cirugia", label: 'Tab 3', content: 'Contenido de la pestaña 3.' },
    { id: 'tab4', nombre: "otro", label: 'Tab 4', content: 'Holii' },
  ];
  diasLista = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  opcionesDias: any;
  items = [
    { day: 'Lunes', startTime: '', endTime: '' },
    { day: 'Martes', startTime: '', endTime: '' },
    { day: 'Miércoles', startTime: '', endTime: '' },
    { day: 'Jueves', startTime: '', endTime: '' },
    { day: 'Viernes', startTime: '', endTime: '' },
    { day: 'Sábado', startTime: '', endTime: '' }
  ];

  constructor() {
    // this.especialidades = 
    this.opcionesDias = this.diasLista.filter(dia =>
      !this.items.some(item => item.day === dia)
    );

    console.log(this.opcionesDias);
  }


  ngOnInit() {
    console.log(this.authSvc.usuarioActual?.email);

    this.spinnerSvc.show();
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) { // Asegura que `res.email` exista
        this.usuarioInfo = await this.fireSvc.obtenerUsuarioDatos(res.email) as any;
        
        if (this.usuarioInfo?.especialidades) { // Asegura que `especialidades` exista
          this.especialidades = this.usuarioInfo.especialidades;
          this.showTab(this.especialidades[0].id);
        } else {
          console.warn("No hay especialidades definidas en usuarioInfo.");
        }
      } 
  
      this.spinnerSvc.hide();
      this.loading = false;
    });

  }

  getSelectedValue() {
    const selectedValue = this.mySelect.nativeElement.value;
    console.log(selectedValue);  // Imprime el valor seleccionado
  }

  agregarHorario(especialidad: Especialidad) {
    const nuevoHorario: HorarioAtencion = {
      dia: '', // Día inicial vacío o predefinido
      rangoHorario: { inicio: '', fin: '' },
      habilitado: true
    };

    if (this.validarSuperposicion(especialidad, nuevoHorario)) {
      especialidad.horariosAtencion!.push(nuevoHorario);
    } else {
      alert('Este horario se solapa con otra especialidad. Por favor, elija otro.');
    }
  }

  agregarDia() {
    const diaElegido = this.mySelect.nativeElement.value;
    if (diaElegido != " ") {

      this.items.push({ day: diaElegido, startTime: '', endTime: '' });
      this.mySelect.nativeElement.value = " ";
      const diasDisponibles = this.diasLista.filter(dia =>
        !this.items.some(item => item.day === dia)
      );
      this.opcionesDias = diasDisponibles;
    }
    else {
      this.toastM.error("Seleccione un día.")
    }

  }

  eliminarDia(day: string) {
    const index = this.items.findIndex(item => item.day === day);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    const diasDisponibles = this.diasLista.filter(dia =>
      !this.items.some(item => item.day === dia)
    );
    this.opcionesDias = diasDisponibles;
    console.log(this.items);
  }

  validarSuperposicion(especialidad: Especialidad, nuevoHorario: HorarioAtencion): boolean {
    for (let otraEspecialidad of this.especialidades) {
      if (otraEspecialidad.id !== especialidad.id && otraEspecialidad.horariosAtencion) {
        for (let horario of otraEspecialidad.horariosAtencion) {
          if (
            horario.dia === nuevoHorario.dia &&
            ((nuevoHorario.rangoHorario.inicio >= horario.rangoHorario.inicio &&
              nuevoHorario.rangoHorario.inicio < horario.rangoHorario.fin) ||
              (nuevoHorario.rangoHorario.fin > horario.rangoHorario.inicio &&
                nuevoHorario.rangoHorario.fin <= horario.rangoHorario.fin))
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  showTab(tabId: string) {
    this.activeTab = tabId;  // Actualiza la pestaña activa
  }
}

