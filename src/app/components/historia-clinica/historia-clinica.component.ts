import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HistoriaClinica } from '../../models/historia-clinica.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrl: './historia-clinica.component.scss'
})
export class HistoriaClinicaComponent {
  comentarioTexto: string = '';
  historiaPaciente: HistoriaClinica = {
    altura: 0,
    peso: 0,
    temperatura: 0,
    presion: 0,
    datos_dinamicos: []
  };
  datoRange = false;
  datoSwitch = false;
  datoNumber = false;
  historiaForm: FormGroup;
  toastM = inject(ToastrService);
  spinnerSvc = inject(NgxSpinnerService);

  constructor(){
    // this.spinnerSvc.show();
    this.historiaForm = new FormGroup({
      altura: new FormControl('', [Validators.required, Validators.min(10)]),  
      peso: new FormControl('', [Validators.required, Validators.min(0)]), 
      temperatura: new FormControl('', [Validators.required, Validators.min(0)]), 
      presion: new FormControl('', [Validators.required]), 
      datos_dinamicos: new FormControl([]),
      nuevoDatoClave: new FormControl(''), 
      nuevoDatoValor: new FormControl(''),
      nuevoDatoRangeClave: new FormControl(''), 
  nuevoDatoRangeValor: new FormControl(null),
  nuevoDatoNumericoClave: new FormControl(''), 
  nuevoDatoNumericoValor: new FormControl(null),
  nuevoDatoSwitchClave: new FormControl(''),
  nuevoDatoSwitchValor: new FormControl(false),
      resenia: new FormControl('', [Validators.required])

    });
  }
  nuevoDato: { clave: string, valor: string } = { clave: '', valor: '' };

  @Input() titulo: string = 'Historia Clinica';
  @Output() guardar = new EventEmitter<{ historia: HistoriaClinica; resenia: string }>();
  @Output() seCancela = new EventEmitter<void>();
  cancelar() {
    this.historiaForm.reset();
    this.seCancela.emit();
  }
  get datosDinamicos(): FormArray {
    return this.historiaForm.get('datos_dinamicos') as FormArray;
  }
  agregarDatoTexto() {
    this.historiaForm.value.datos_dinamicos.forEach((dato:any) => {
      // Asegúrate de que el valor sea una cadena antes de guardarlo en Firebase
      dato.valor = String(dato.valor);
    });
    const datos = this.historiaForm.get('datos_dinamicos')?.value || [];

    const nuevoDato = {
      clave: this.historiaForm.get('nuevoDatoClave')?.value,
      valor: this.historiaForm.get('nuevoDatoValor')?.value,
    };
  
    if (nuevoDato.clave && nuevoDato.valor && datos.length < 6) {
      datos.push(nuevoDato);
      this.historiaForm.get('datos_dinamicos')?.setValue(datos);
      this.historiaForm.get('nuevoDatoClave')?.reset();
      this.historiaForm.get('nuevoDatoValor')?.reset();
    } else if (datos.length >= 6) {
      this.toastM.error("Has alcanzado el límite de datos dinámicos.");
    } else {
      this.toastM.error("Debes ingresar una clave y valor.");
    }
  }
  agregarDatoRange() {
    const datos = this.historiaForm.get('datos_dinamicos')?.value || [];
    const nuevoDato = {
      clave: this.historiaForm.get('nuevoDatoRangeClave')?.value,
      valor: this.historiaForm.get('nuevoDatoRangeValor')?.value,
    };
  
    if (nuevoDato.clave && nuevoDato.valor && datos.length < 6) {
      datos.push(nuevoDato);
      this.historiaForm.get('datos_dinamicos')?.setValue(datos);
      this.historiaForm.get('nuevoDatoRangeClave')?.reset();
      this.historiaForm.get('nuevoDatoRangeValor')?.reset();
      this.datoRange = true;
    } else if (datos.length >= 6) {
      this.toastM.error("Has alcanzado el límite de datos dinámicos.");
    } else {
      this.toastM.error("Debes ingresar una clave y valor.");
    }
  }
  agregarDatoNumerico() {
    const datos = this.historiaForm.get('datos_dinamicos')?.value || [];
    const nuevoDato = {
      clave: this.historiaForm.get('nuevoDatoNumericoClave')?.value,
      valor: this.historiaForm.get('nuevoDatoNumericoValor')?.value,
    };
  
    if (nuevoDato.clave && nuevoDato.valor && datos.length < 6) {
      datos.push(nuevoDato);
      this.datoNumber = true;
      this.historiaForm.get('datos_dinamicos')?.setValue(datos);
      this.historiaForm.get('nuevoDatoNumericoClave')?.reset();
      this.historiaForm.get('nuevoDatoNumericoValor')?.reset();
    } else if (datos.length >= 6) {
      this.toastM.error("Has alcanzado el límite de datos dinámicos.");
    } else {
      this.toastM.error("Debes ingresar una clave y valor.");
    }
  }

  agregarDatoSwitch() {
    const datos = this.historiaForm.get('datos_dinamicos')?.value || [];
    const nuevoDato = {
      clave: this.historiaForm.get('nuevoDatoSwitchClave')?.value,
      valor: this.historiaForm.get('nuevoDatoSwitchValor')?.value ? 'Sí' : 'No',
    };
  
    if (nuevoDato.clave && nuevoDato.valor && datos.length < 6) {
      datos.push(nuevoDato);
      this.datoSwitch = true;
      this.historiaForm.get('datos_dinamicos')?.setValue(datos);
      this.historiaForm.get('nuevoDatoSwitchClave')?.reset();
      this.historiaForm.get('nuevoDatoSwitchValor')?.reset();
    } else if (datos.length >= 6) {
      this.toastM.error("Has alcanzado el límite de datos dinámicos.");
    } else {
      this.toastM.error("Debes ingresar una clave y valor.");
    }
  }
  agregarDatoDinamico2() {
    const datos = this.historiaForm.get('datos_dinamicos')?.value || [];
    // const nuevoDato = {
    //   clave: this.historiaForm.get('nuevoDatoClave')?.value,
    //   valor: this.historiaForm.get('nuevoDatoValor')?.value,
    // };
    const nuevoDato = {
      clave: this.historiaForm.get('nuevoDatoClave')?.value,
      valor: this.historiaForm.get('nuevoDatoValor')?.value,
      range: this.historiaForm.get('nuevoDatoRange')?.value,
      inputNumerico: this.historiaForm.get('nuevoDatoInputNumerico')?.value,
      switch: this.historiaForm.get('nuevoDatoSwitch')?.value
    };

    if (nuevoDato.clave && nuevoDato.valor) {
      datos.push(nuevoDato);
      this.historiaForm.get('datos_dinamicos')?.setValue(datos);
      this.historiaForm.get('nuevoDatoClave')?.reset();
      this.historiaForm.get('nuevoDatoValor')?.reset();
    }
    else{
      this.toastM.error("Debe ingresar la clave y valor para agregar un nuevo dato.")
    }

  }

  guardarHistoriaClinica() {
    console.log('Historia clínica guardada:', this.historiaPaciente);
    console.log(this.historiaForm.errors);
    if (this.historiaForm.valid) {
      this.spinnerSvc.show();
      const formValues = this.historiaForm.value;
      this.historiaPaciente = {
        altura: formValues.altura,
        peso: formValues.peso,
        temperatura: formValues.temperatura,
        presion: formValues.presion,
        datos_dinamicos: formValues.datos_dinamicos
      };
      this.guardar.emit({historia:this.historiaPaciente,resenia:this.historiaForm.get("resenia")?.value});
      this.historiaForm.reset();
    } else {
      this.toastM.error("Faltan algunos campos de la historia clinica.")
    }
  }
}
