import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { confirmarClaveValidator } from '../../validators/match-pass';
import { Paciente, Perfil } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import { CursorDirective } from '../../directives/cursor.directive';
import { CaptchaComponent } from '../captcha/captcha.component';

@Component({
  selector: 'app-form-paciente',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,CursorDirective,CaptchaComponent],
  templateUrl: './form-paciente.component.html',
  styleUrl: './form-paciente.component.scss'
})
export class FormPacienteComponent{
  pacienteForm: FormGroup;
  selectedFile1!: File;
    selectedFile2!: File;
    captchaResp = false;
  fireSvc = inject(FirestoreService);
    authSvc = inject(AuthService);
    toastM = inject(ToastrService);
    router = inject(Router);
    spinnerSvc = inject(NgxSpinnerService);

  constructor() {
    this.pacienteForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      apellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      edad: new FormControl('', [Validators.required, Validators.min(1), Validators.max(99)]),
      dni: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
      obraSocial: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordRep: new FormControl('', [Validators.required]),
      imagen1: new FormControl('', Validators.required),
      imagen2: new FormControl('', [Validators.required])
    }, [confirmarClaveValidator(), Validators.required]);


  }


  capitalizarPalabra(str:string) {
    return str.replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
  }
  
  async crearPaciente(){
    if(this.pacienteForm.valid && this.captchaResp){
      this.spinnerSvc.show();
      const formValues = this.pacienteForm.getRawValue();
      let paciente : Paciente = {
        id:"",
        nombre: this.capitalizarPalabra(formValues.nombre),
        apellido: this.capitalizarPalabra(formValues.apellido),
        dni: formValues.dni,
        edad: formValues.edad,
        email:formValues.email,
        foto1: "",
        foto2: "",
        obraSocial: this.capitalizarPalabra(formValues.obraSocial),
        password: formValues.password,
        perfil: Perfil.Paciente
      };
      const fileExtension1 = this.selectedFile1.type.split('/')[1];
      const fileExtension2 = this.selectedFile2.type.split('/')[1];
      const fileName1 = `${paciente.nombre}_${paciente.dni}_Pic1.${fileExtension1}`;
      const fileName2 = `${paciente.nombre}_${paciente.dni}_Pic2.${fileExtension2}`;

      

      try {
        await this.fireSvc.subirFotoPerfil(this.selectedFile1,fileName1).then(url=>paciente.foto1=url).catch(()=>{
          this.toastM.error("Error en la subida de la foto N°1");
        });
  
        await this.fireSvc.subirFotoPerfil(this.selectedFile2,fileName2).then(url=>paciente.foto2=url).catch(()=>{
          this.toastM.error("Error en la subida de la foto N°2");
        });
        await this.fireSvc.nuevoPaciente(paciente);
        await this.authSvc.registerAccount(paciente.nombre,paciente.email,paciente.password, paciente.foto1,paciente.perfil);
        this.pacienteForm.reset();
      } catch (error) {
        console.log("ERROR"+error);    
        this.toastM.error(error as string,"ERROR");    
      }
      finally{
        this.spinnerSvc.hide();
      }
      
    }
  }
  get getPasswordPacienteRep() {
    return this.pacienteForm.get('passwordRep');
  }

  onFileSelected(event: Event, imageNumber: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (imageNumber === 1) {
        this.selectedFile1 = file;
      } else if (imageNumber === 2) {
        this.selectedFile2 = file;
      }
    }
  }
 
}
