import { AfterContentInit, AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { HabilitadoPipe } from '../../pipes/habilitado.pipe';
import { ColorEstadoDirective } from '../../directives/color-estado.directive';
import { InstanceOptions, Modal, ModalInterface, ModalOptions } from 'flowbite';
import Swal from 'sweetalert2';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matAddBoxRound } from '@ng-icons/material-icons/round';
import { ColorPerfilDirective } from '../../directives/color-perfil.directive';
import { FormAdminComponent } from '../form-admin/form-admin.component';
import { Perfil } from '../../models/usuario';
import { FormEspecialistaComponent } from '../form-especialista/form-especialista.component';
import { FormPacienteComponent } from '../form-paciente/form-paciente.component';


@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, NgxSpinnerComponent, NgxSpinnerModule, HabilitadoPipe, ColorEstadoDirective, NgIconComponent,ColorPerfilDirective,FormAdminComponent,FormEspecialistaComponent,FormPacienteComponent],
  providers: provideIcons({ matAddBoxRound }),
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss'
})
export class ListaUsuariosComponent implements OnInit {
  fireSvc = inject(FirestoreService);
  opcionActual = "Todos";
  agregarUsuario = false;
  agregarPaciente = false;
  agregarDoctor = false;
  agregarAdmin = false;
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  listaUsuarios: any = [];
  listaFiltrada: any = [];

  async ngOnInit() {
    this.spinnerSvc.show();
    this.listaUsuarios = await this.fireSvc.traerListass("usuarios");
    this.listaFiltrada = this.listaUsuarios;
    this.spinnerSvc.hide();
  }

  cambiarEstado(item: any) {
    const accion = item.cuenta_habilitada ? "deshabilitar" : " habilitar";
    Swal.fire({
      text: `Quieres ${accion} la cuenta de ${item.nombre}?`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0abf31",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        item.cuenta_habilitada = !item.cuenta_habilitada;
        const texto = item.cuenta_habilitada ? "habilitada" : "deshabilitada";
        this.fireSvc.cambiarEstado(item.cuenta_habilitada, item.id);
        this.listaUsuarios = await this.fireSvc.traerListass("usuarios");
        if (this.opcionActual == "Todos") {
          this.listaFiltrada = this.listaUsuarios;
        } else {
          this.listaFiltrada = this.listaUsuarios.filter((user: any) => user.perfil == this.opcionActual);

        }

        this.toastM.success(`La cuenta de ${item.nombre} ha sido  ${texto}`);
      }
    });
  }
  verOpciones(){
    this.agregarUsuario = true;

  }
  nuevoUsuario(perfil:string){
    if(perfil == Perfil.Administrador){
      this.agregarAdmin = true;
    }
    else if(perfil == Perfil.Paciente){
      this.agregarPaciente = true;
    }else{
      this.agregarDoctor = true;
    }
  }

  filtrarLista(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.opcionActual = selectedValue;
    console.log("Opción seleccionada:", selectedValue);
    if (selectedValue != 'Todos') {
      this.listaFiltrada = this.listaUsuarios.filter((user: any) => user.perfil == selectedValue);
    } else {
      this.listaFiltrada = this.listaUsuarios;
    }
  }
}
