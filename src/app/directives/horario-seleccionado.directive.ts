import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHorarioSeleccionado]',
  standalone: true
})
export class HorarioSeleccionadoDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  // Listener para el cambio de estado del checkbox
  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      this.renderer.removeClass(this.el.nativeElement, 'bg-red-100');
      this.renderer.removeClass(this.el.nativeElement, 'text-red-800');
      this.renderer.removeClass(this.el.nativeElement, 'border-red-400');


      this.renderer.addClass(this.el.nativeElement, 'bg-green-100');
      this.renderer.addClass(this.el.nativeElement, 'text-green-800');
      this.renderer.addClass(this.el.nativeElement, 'border-green-400');

    } else {
      this.renderer.removeClass(this.el.nativeElement, 'border-green-400');
      this.renderer.removeClass(this.el.nativeElement, 'bg-green-100');
      this.renderer.removeClass(this.el.nativeElement, 'text-green-800');

      this.renderer.addClass(this.el.nativeElement, 'bg-red-100');
      this.renderer.addClass(this.el.nativeElement, 'text-red-800');
      this.renderer.addClass(this.el.nativeElement, 'border-red-400');


    }
  }
}
