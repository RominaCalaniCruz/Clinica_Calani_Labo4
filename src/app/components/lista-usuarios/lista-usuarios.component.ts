import { AfterContentInit, AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { HabilitadoPipe } from '../../pipes/habilitado.pipe';
import { ColorEstadoDirective } from '../../directives/color-estado.directive';
import Swal from 'sweetalert2';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matAddBoxRound } from '@ng-icons/material-icons/round';
import { ColorPerfilDirective } from '../../directives/color-perfil.directive';
import { FormAdminComponent } from '../form-admin/form-admin.component';
import { Perfil } from '../../models/usuario';
import { FormEspecialistaComponent } from '../form-especialista/form-especialista.component';
import { FormPacienteComponent } from '../form-paciente/form-paciente.component';
import * as ExcelJS from 'exceljs';
import { tablerFileTypeCsv, tablerFileTypeXls } from '@ng-icons/tabler-icons';
import { DescargarInfoDirective } from '../../directives/descargar-info.directive';


@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, DescargarInfoDirective, NgxSpinnerComponent, NgxSpinnerModule, HabilitadoPipe, ColorEstadoDirective, NgIconComponent,ColorPerfilDirective,FormAdminComponent,FormEspecialistaComponent,FormPacienteComponent],
  providers: provideIcons({ matAddBoxRound,tablerFileTypeCsv,tablerFileTypeXls }),
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

  async descargarExcel(){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');
    worksheet.columns = [
      { header: 'Correo electronico', key: 'email', width: 25 },
      { header: 'Nombre', key: 'nombre', width: 15 },
      { header: 'Apellido', key: 'apellido', width: 15 },
      { header: 'Edad', key: 'edad', width: 10 },
      { header: 'DNI', key: 'dni', width: 15 },
      { header: 'Perfil', key: 'perfil', width: 15 },
      { header: 'URL Foto n1', key: 'foto1', width: 15},
      { header: 'URL Foto n2', key: 'foto2', width: 15},
      { header: 'Obra Social', key: 'obraSocial', width: 20 },
      { header: 'Cuenta habilitada', key: 'cuentaHabilitada', width: 20 },

    ];

    this.listaUsuarios.forEach((usuario:any) => {
      worksheet.addRow({
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        edad: usuario.edad,
        dni: usuario.dni,
        perfil: usuario.perfil,
        foto1: usuario.foto1,
        foto2: usuario.foto2,
        obraSocial: usuario.obraSocial || '-',
        cuentaHabilitada: usuario.cuenta_habilitada || '-'
      });
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '006680' },
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'usuarios_datos.xlsx';
    anchor.click();
    window.URL.revokeObjectURL(url);
  
      
  }
}
