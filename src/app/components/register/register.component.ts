import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroFadeDirective } from '../../directives/registro-fade.directive';
import { confirmarClaveValidator } from '../../validators/match-pass';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CursorDirective } from '../../directives/cursor.directive';
import { Especialidad } from '../../models/especialidad.model';
import { Especialista, Paciente, Perfil } from '../../models/usuario';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,RegistroFadeDirective,CursorDirective,NgxSpinnerComponent,NgxSpinnerModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  pacienteForm!: FormGroup;
  mostrarFormularioPaciente = false;
  mostrarFormularioEspecialista = false;
  especialistaForm: FormGroup;
  opcionesSelec : Especialidad[] = [];
  selectedFile1!: File;
  selectedFile2!: File;
  especialidades : Especialidad[] = [];
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
      dni: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
      especialidad: new FormControl([], [Validators.required]),
      otraEsp: new FormControl('',Validators.pattern('^[a-zA-Z\\s]+$')),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordRep: new FormControl('', [Validators.required]),
      imagen1: new FormControl('', Validators.required)
    }, [confirmarClaveValidator()]);

  }

  mostrarFormulario(tipo: 'paciente' | 'especialista') {
      if (tipo === 'paciente') {
        this.mostrarFormularioPaciente = true;
      } 
      else {
        this.spinnerSvc.show();
        this.loadEsp=true;
        this.mostrarFormularioEspecialista = true;
        this.fireSvc.traerEspecialidades().subscribe((data:Especialidad[])=>{
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

  async crearPaciente(){
    if(this.pacienteForm.valid){
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
        
      } catch (error) {
        console.log("ERROR"+error);    
        this.toastM.error(error as string,"ERROR");    
      }
      finally{
        this.spinnerSvc.hide();
      }
      
    }
  }

  async agregarEspecialidad(){
    this.spinnerSvc.show();
    try {
      let nuevaEspecialidad : Especialidad = {
        id:"",
        nombre: this.capitalizarPalabra(this.especialistaForm.get('otraEsp')?.getRawValue()),
        duracionTurno: 30,
        horariosAtencion: null
      };
      this.especialistaForm.get('otraEsp')?.setValue('');
      await this.fireSvc.nuevaEsp(nuevaEspecialidad);
      this.toastM.success("Especialidad agregada a la lista","¡Lista actualizada!");
    } catch (error) {
      this.toastM.error("Error al cargar la especialidad","ERROR");
    } finally{
      this.spinnerSvc.hide();
    }
  }
  capitalizarPalabra(str:string) {
    return str.replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
  }
ver(){
  console.log(this.especialistaForm.get('especialidad')?.value);
  const especialidadesSeleccionadas = this.especialistaForm.get('especialidad')?.value;

  this.opcionesSelec = this.especialidades.filter((x:Especialidad)=>especialidadesSeleccionadas.includes(x.nombre));
console.log(this.opcionesSelec);

}
  async crearEspecialista(){
    if(this.especialistaForm.valid){
      this.spinnerSvc.show();
      const especialidadesSeleccionadas = this.especialistaForm.get('especialidad')?.value;
      this.opcionesSelec = this.especialidades.filter((x:Especialidad)=>especialidadesSeleccionadas.includes(x.nombre));
      const formValues = this.especialistaForm.getRawValue();
      let especialista : Especialista = {
        id:"",
        nombre: this.capitalizarPalabra(formValues.nombre),
        apellido: this.capitalizarPalabra(formValues.apellido),
        dni: formValues.dni,
        edad: formValues.edad,
        email:formValues.email,
        foto1: "",
        especialidades: this.opcionesSelec,
        password: formValues.password,
        cuenta_habilitada: false,
        perfil: Perfil.Especialista  
      };
      const fileExtension = this.selectedFile1.type.split('/')[1];
      const fileName = `Doc_${especialista.dni}.${fileExtension}`;
      try {
        await this.fireSvc.subirFotoPerfil(this.selectedFile1,fileName).then(url=>especialista.foto1=url).catch(()=>{
          this.toastM.error("Error en la subida de la foto N°1");
        });
        await this.fireSvc.nuevoEspecialista(especialista);
        await this.authSvc.registerAccount(especialista.nombre,especialista.email,especialista.password, especialista.foto1,especialista.perfil);
        this.especialistaForm.reset();
      } catch (error) {
        
      }
      finally{
        this.spinnerSvc.hide();

      }
      
      
    }
  }
}
