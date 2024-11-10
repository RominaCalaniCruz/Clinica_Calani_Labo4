import { Component, inject, Input, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Especialidad } from '../../models/especialidad.model';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmarClaveValidator } from '../../validators/match-pass';
import { Especialista, Perfil } from '../../models/usuario';
import { CommonModule } from '@angular/common';
import { CursorDirective } from '../../directives/cursor.directive';
import { CaptchaComponent } from '../captcha/captcha.component';

@Component({
  selector: 'app-form-especialista',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,CursorDirective,NgxSpinnerModule,CaptchaComponent],
  templateUrl: './form-especialista.component.html',
  styleUrl: './form-especialista.component.scss'
})
export class FormEspecialistaComponent implements OnInit {
  especialistaForm: FormGroup;
 opcionesSelec : Especialidad[] = [];
selectedFile1!: File;
  selectedFile2: File | null = null;
  captchaResp: boolean = false;
especialidades : Especialidad[] = [];
listaOriginal:Especialidad[] = [];
otraEspecialidad:string ="";
nuevaOpcion = false;
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);

  constructor() {
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
      imagen1: new FormControl('', Validators.required),
      imagenEsp: new FormControl('')
    }, [confirmarClaveValidator()]);

  }
  async ngOnInit() {
    this.especialidades =  await this.fireSvc.traerListass("especialidades") as Especialidad[];
    this.listaOriginal = this.especialidades;
    this.selectedFile2 = null;
  }
  async crearEspecialista(){
    if(this.especialistaForm.valid){
      this.spinnerSvc.show();
      const especialidadesSeleccionadas = this.especialistaForm.get('especialidad')?.value;

      this.opcionesSelec = this.especialidades.filter((x:Especialidad)=>especialidadesSeleccionadas.includes(x.nombre));
      for(const elem of this.opcionesSelec){
        if(elem.id == ""){
          if(elem.foto instanceof File){
            const fileExtension = elem.foto.type.split('/')[1];
            const fileName = `Esp_${elem.nombre}.${fileExtension}`;
            await this.fireSvc.subirFotoEspecialidad(elem.foto,fileName).then(url=>elem.foto=url).catch(()=>{
              this.toastM.error(`Error en la subida de la foto de la especialidad ${elem.nombre}`);
            });
          }
          await this.fireSvc.nuevaEsp(elem).then(doc=>elem.id = doc.id);

        }
      }
      console.log("resultado:");
      console.log(this.opcionesSelec);
      
      
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
        console.log("ERROR"+error);    
        this.toastM.error(error as string,"ERROR");    
      }
      finally{
        this.spinnerSvc.hide();

      }
      
      
    }
  }
  get getPasswordEspRep() {
    return this.especialistaForm.get('passwordRep');
  }

  cambiarEstado(estado : boolean){
    this.nuevaOpcion = estado;
    this.selectedFile2 = null;
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
  capitalizarPalabra(str:string) {
    return str.replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
  }
  ver(){
    // console.log(this.especialistaForm.get('especialidad')?.value);
    const especialidadesSeleccionadas = this.especialistaForm.get('especialidad')?.value;
    
    this.opcionesSelec = this.especialidades.filter((x:Especialidad)=>especialidadesSeleccionadas.includes(x.nombre));
  // console.log(this.opcionesSelec);
  const areasXAgregar = this.opcionesSelec.filter(obj=>obj.id == "");
console.log(areasXAgregar);

  }

  async agregarEspecialidad(){
    this.spinnerSvc.show();
    try {
      const nuevo = this.capitalizarPalabra(this.especialistaForm.get('otraEsp')?.getRawValue());
      if(!this.especialidades.some(obj=> obj.nombre == nuevo)){
        let nuevaEspecialidad : Especialidad = {
          id:"",
          nombre: nuevo,
          duracionTurno: 30,
          horariosAtencion: null,
          foto: this.selectedFile2
        };
        this.especialidades.push(nuevaEspecialidad);
        this.especialistaForm.get('otraEsp')?.setValue('');
        this.especialistaForm.get('imagenEsp')?.setValue('');

        this.selectedFile2 = null;
        // await this.fireSvc.nuevaEsp(nuevaEspecialidad);
        this.toastM.success("Especialidad agregada a la lista","¡Lista actualizada!");
        this.nuevaOpcion = false;
      }
      else{
        this.toastM.error("Esa especialidad existe en la lista.");
      }
    } catch (error) {
      this.toastM.error("Error al cargar la especialidad","ERROR");
    } finally{
      this.spinnerSvc.hide();
    }
  }
}

