import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroFadeDirective } from '../../directives/registro-fade.directive';
import { confirmarClaveValidator } from '../../validators/match-pass';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CursorDirective } from '../../directives/cursor.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,RegistroFadeDirective,CursorDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  pacienteForm!: FormGroup;
  mostrarFormularioPaciente = false;
  mostrarFormularioEspecialista = false;
  especialistaForm: FormGroup;
  selectedFile1!: File;
  selectedFile2!: File;
  especialidades : any = [];
  otraEspecialidad:string ="";
  loadEsp = false;
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);

  constructor(private fb: FormBuilder) {
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
      imagen2: new FormControl('', [Validators.required]),
    }, [confirmarClaveValidator(), Validators.required]);

    this.especialistaForm = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      apellido: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]),
      edad: new FormControl('', [Validators.required, Validators.min(1), Validators.max(99)]),
      dni: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{9}$')]),
      especialidad: new FormControl([], [Validators.required]),
      otraEsp: new FormControl('',Validators.pattern('^[a-zA-Z\\s]+$')),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordRep: new FormControl('', [Validators.required]),
      imagen1: new FormControl('', Validators.required)
    }, [confirmarClaveValidator()]);

  }
  // agregarEspecialidad(especialidad: string) {
  //   if (especialidad && !this.especialidades.includes(especialidad)) {
  //     this.especialidades.push(especialidad);
  //   }
  // }

  mostrarFormulario(tipo: 'paciente' | 'especialista') {
    // if(tipo == 'especialista'){
    //   this.spinnerSvc.show();
    // }

      if (tipo === 'paciente') {
        this.mostrarFormularioPaciente = true;
      } 
      else {
        this.spinnerSvc.show();
        this.loadEsp=true;
        this.mostrarFormularioEspecialista = true;
        this.fireSvc.traerEspecialidades().subscribe((data:any)=>{
          this.especialidades = data;
          this.loadEsp = false;
          this.spinnerSvc.hide();
          console.log(this.especialidades);
        });
        
      }
      
  }
  get getPasswordRep() {
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

  crearPaciente(){
    if(this.pacienteForm.valid){
      this.spinnerSvc.show();
      const formValues = this.pacienteForm.getRawValue();
      let photoURL = '';
      const fileExtension = this.selectedFile1.type.split('/')[1];
      const fileName = `${formValues.nombre}_${formValues.dni}.${fileExtension}`;
      this.fireSvc.subirFotoPerfil(this.selectedFile1,fileName).then((url)=>{
        
        photoURL = url;
        this.authSvc.registerAccount(formValues.nombre,formValues.email,formValues.password, photoURL).then(()=>{
          // this.router.navigate(['mi-perfil']);
          this.pacienteForm.reset();
          this.spinnerSvc.hide();
        });
      }).catch(()=>{
        this.toastM.error("Error en la subida de la foto");
        this.spinnerSvc.hide();
      });
      
    }
  }
  agregarEspecialidad(){
    this.spinnerSvc.show();
    const nombre = this.especialistaForm.get('otraEsp')?.getRawValue();
    console.log(nombre);
    this.especialistaForm.get('otraEsp')?.setValue('');
    this.fireSvc.nuevaEsp(nombre).then(()=>{
      
      this.toastM.success("Especialidad agregada a la lista","¡Lista actualizada!");
      this.spinnerSvc.hide();
    });
  }
  
  crearEspecialista(){
    if(this.especialistaForm.valid){
      this.spinnerSvc.show();
      const especialidadesSeleccionadas = this.especialistaForm.get('especialidad')?.value;
      const formValues = this.pacienteForm.getRawValue();
      let photoURL = '';
      const fileExtension = this.selectedFile1.type.split('/')[1];
      const fileName = `Doctor_${formValues.dni}.${fileExtension}`;
      this.fireSvc.subirFotoPerfil(this.selectedFile1,fileName).then((url)=>{
        
        photoURL = url;
        this.authSvc.registerAccount(formValues.nombre,formValues.email,formValues.password, photoURL).then(()=>{
          // this.router.navigate(['mi-perfil']);
          this.especialidades.reset();
          this.spinnerSvc.hide();
        });
      }).catch(()=>{
        this.toastM.error("Error en la subida de la foto");
        this.spinnerSvc.hide();
      });
      
    }
  }
}
