import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comentario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './comentario.component.html',
  styleUrl: './comentario.component.scss'
})
export class ComentarioComponent {
  comentarioTexto: string = '';
  @Input() titulo: string = 'Comentario sobre la cancelación';
  // @Input() place: string = 'Comentario sobre la cancelación';

  @Output() guardar = new EventEmitter<string>();
  @Output() seCancela = new EventEmitter<void>();

  aceptar() {
    this.guardar.emit(this.comentarioTexto);
  }

  cancelar() {
    this.seCancela.emit();
  }

}
