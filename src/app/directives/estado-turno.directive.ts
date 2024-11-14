import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { EstadoTurno } from '../models/turno';

@Directive({
  selector: '[appEstadoTurno]',
  standalone: true
})
export class EstadoTurnoDirective {
  @Input('appEstadoTurno') estado!: EstadoTurno;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.removeClass(this.el.nativeElement, 'border-green-400');
    this.renderer.removeClass(this.el.nativeElement, 'border-sky-400');
    this.renderer.removeClass(this.el.nativeElement, 'border-gray-400');
    this.renderer.removeClass(this.el.nativeElement, 'border-red-400');
    this.renderer.removeClass(this.el.nativeElement, 'border-orange-400');
    this.renderer.removeClass(this.el.nativeElement, 'bg-green-100');
    this.renderer.removeClass(this.el.nativeElement, 'bg-sky-100');
    this.renderer.removeClass(this.el.nativeElement, 'bg-gray-200');
    this.renderer.removeClass(this.el.nativeElement, 'bg-red-100');
    this.renderer.removeClass(this.el.nativeElement, 'bg-orange-100');
    this.renderer.removeClass(this.el.nativeElement, 'text-green-700');
    this.renderer.removeClass(this.el.nativeElement, 'text-sky-600');
    this.renderer.removeClass(this.el.nativeElement, 'text-gray-600');
    this.renderer.removeClass(this.el.nativeElement, 'text-red-700');
    this.renderer.removeClass(this.el.nativeElement, 'text-orange-700');

    switch (this.estado) {
      case EstadoTurno.Aceptado:
        this.renderer.addClass(this.el.nativeElement, 'border-green-400');
        this.renderer.addClass(this.el.nativeElement, 'bg-green-100');
        this.renderer.addClass(this.el.nativeElement, 'text-green-700');
        break;
      case EstadoTurno.Finalizado:
        this.renderer.addClass(this.el.nativeElement, 'border-sky-400');
        this.renderer.addClass(this.el.nativeElement, 'bg-sky-100');
        this.renderer.addClass(this.el.nativeElement, 'text-sky-600');
        break;
      case EstadoTurno.Cancelado:
        this.renderer.addClass(this.el.nativeElement, 'border-gray-400');
        this.renderer.addClass(this.el.nativeElement, 'bg-gray-200');
        this.renderer.addClass(this.el.nativeElement, 'text-gray-600');
        break;
      case EstadoTurno.Rechazado:
        this.renderer.addClass(this.el.nativeElement, 'border-red-400');
        this.renderer.addClass(this.el.nativeElement, 'bg-red-100');
        this.renderer.addClass(this.el.nativeElement, 'text-red-700');
        break;
      case EstadoTurno.Pendiente:
        this.renderer.addClass(this.el.nativeElement, 'border-orange-400');
        this.renderer.addClass(this.el.nativeElement, 'bg-orange-100');
        this.renderer.addClass(this.el.nativeElement, 'text-orange-700');
        break;
      default:
        // Si no se encuentra el estado, puedes decidir cómo manejarlo
        break;
    }
  }
}
