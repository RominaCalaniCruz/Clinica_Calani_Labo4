import { Component, EventEmitter, Output } from '@angular/core';
import { Encuesta } from '../../models/encuesta.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIconComponent, NgIconsModule, provideIcons } from '@ng-icons/core';
import { jamStarF } from '@ng-icons/jam-icons';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [FormsModule,CommonModule,NgIconComponent],
  providers: provideIcons({jamStarF}),
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.scss'
})
export class EncuestaComponent {
  encuesta!: Encuesta;
  comentarios: string = "";
  nivelSatisfaccion: number = 0;
  recomendarias: boolean = true;
  atencionPuntual: boolean = true;

  @Output() guardar = new EventEmitter<any>();
  @Output() seCancela = new EventEmitter<void>();

  enviar() {
    this.encuesta = {
      esPuntual: this.atencionPuntual,
      satisfaccion: this.nivelSatisfaccion,
       recomendar: this.recomendarias
    }
    this.guardar.emit(this.encuesta);
  }

  cancelar() {
    this.seCancela.emit();
  }

  calificar(estrellas: number) {
    this.nivelSatisfaccion = estrellas;
  }
}
