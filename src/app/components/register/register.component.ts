import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistroFadeDirective } from '../../directives/registro-fade.directive';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FormEspecialistaComponent } from '../form-especialista/form-especialista.component';
import { FormPacienteComponent } from '../form-paciente/form-paciente.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RegistroFadeDirective, FormsModule,FormEspecialistaComponent,FormPacienteComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  mostrarFormularioPaciente = false;
  mostrarFormularioEspecialista = false;
  spinnerSvc = inject(NgxSpinnerService);

  constructor() {
  }
  
    async mostrarFormulario(tipo: 'paciente' | 'especialista') {
        if (tipo === 'paciente') {
          this.mostrarFormularioPaciente = true;
        } 
        else {
          this.mostrarFormularioEspecialista = true;
        }
        
    }
  
  
}
