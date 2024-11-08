import { Component, inject, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmarClaveValidator } from '../../validators/match-pass';
import { CommonModule } from '@angular/common';
import { CursorDirective } from '../../directives/cursor.directive';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Perfil, Usuario } from '../../models/usuario';
import { FirestoreService } from '../../services/firestore.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-form-admin',
  standalone: true,
  imports: [CommonModule,CursorDirective,ReactiveFormsModule,NgxSpinnerModule],
  templateUrl: './form-admin.component.html',
  styleUrl: './form-admin.component.scss'
})
export class FormAdminComponent {
  adminForm: FormGroup;
  selectedFile1!: File;
  spinnerSvc = inject(NgxSpinnerService);
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);

  toastM = inject(ToastrService);
   router = inject(Router);

  constructor() {
    this.adminForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      apellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      edad: new FormControl('', [Validators.required, Validators.min(1), Validators.max(99)]),
      dni: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordRep: new FormControl('', [Validators.required]),
      imagen1: new FormControl('', Validators.required)
    }, [confirmarClaveValidator()]);

  }
  get getPasswordRep() {
    return this.adminForm.get('passwordRep');
  }
  onFileSelected(event: Event, imageNumber: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (imageNumber === 1) {
        this.selectedFile1 = file;
      }
    }
  }
  capitalizarPalabra(str:string) {
    return str.replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
  }
  async crearAdmin(){
    if(this.adminForm.valid){
      this.spinnerSvc.show();
      const formValues = this.adminForm.getRawValue();
      let admin : Usuario = {
        id:"",
        nombre: this.capitalizarPalabra(formValues.nombre),
        apellido: this.capitalizarPalabra(formValues.apellido),
        dni: formValues.dni,
        edad: formValues.edad,
        email:formValues.email,
        foto1: "",
        password: formValues.password,
        perfil: Perfil.Administrador  
      };
      const fileExtension = this.selectedFile1.type.split('/')[1];
      const fileName = `Admin_${admin.dni}.${fileExtension}`;
      try {
        await this.fireSvc.subirFotoPerfil(this.selectedFile1,fileName).then(url=>admin.foto1=url).catch(()=>{
          this.toastM.error("Error en la subida de la foto");
        });
        await this.fireSvc.nuevoAdmin(admin);
        await this.authSvc.registerAccount(admin.nombre,admin.email,admin.password, admin.foto1,admin.perfil);
        this.router.navigate(['lista-usuarios']);

        this.adminForm.reset();
      } catch (error) {
        console.log("ERROR"+error);    
        this.toastM.error(error as string,"ERROR");    
      }
      finally{
        this.spinnerSvc.hide();

      }
      
      
    }
  }
}
