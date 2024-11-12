import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHorarioSeleccionado]',
  standalone: true
})
export class HorarioSeleccionadoDirective implements OnInit{
  @Input('appHorarioSeleccionado') habilitadoCheck!: boolean;
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    if(this.habilitadoCheck){
      this.renderer.removeClass(this.el.nativeElement, 'bg-red-100');
      this.renderer.removeClass(this.el.nativeElement, 'text-red-800');
      this.renderer.removeClass(this.el.nativeElement, 'border-red-400');


      this.renderer.addClass(this.el.nativeElement, 'bg-green-100');
      this.renderer.addClass(this.el.nativeElement, 'text-green-800');
      this.renderer.addClass(this.el.nativeElement, 'border-green-400');
    }else{
      this.renderer.removeClass(this.el.nativeElement, 'border-green-400');
      this.renderer.removeClass(this.el.nativeElement, 'bg-green-100');
      this.renderer.removeClass(this.el.nativeElement, 'text-green-800');

      this.renderer.addClass(this.el.nativeElement, 'bg-red-100');
      this.renderer.addClass(this.el.nativeElement, 'text-red-800');
      this.renderer.addClass(this.el.nativeElement, 'border-red-400');
    }
  }
  // Listener para el cambio de estado del checkbox
  @HostListener('change', ['$event.target'])
  onInputChange(target: HTMLInputElement): void {
    // const checkbox = event.target as HTMLInputElement;
    // console.log(checkbox);
    
    if (target.type === 'checkbox' && target.checked) {
      this.renderer.removeClass(this.el.nativeElement, 'bg-red-100');
      this.renderer.removeClass(this.el.nativeElement, 'text-red-800');
      this.renderer.removeClass(this.el.nativeElement, 'border-red-400');


      this.renderer.addClass(this.el.nativeElement, 'bg-green-100');
      this.renderer.addClass(this.el.nativeElement, 'text-green-800');
      this.renderer.addClass(this.el.nativeElement, 'border-green-400');

    } else if (target.type === 'checkbox' && !target.checked){
      this.renderer.removeClass(this.el.nativeElement, 'border-green-400');
      this.renderer.removeClass(this.el.nativeElement, 'bg-green-100');
      this.renderer.removeClass(this.el.nativeElement, 'text-green-800');

      this.renderer.addClass(this.el.nativeElement, 'bg-red-100');
      this.renderer.addClass(this.el.nativeElement, 'text-red-800');
      this.renderer.addClass(this.el.nativeElement, 'border-red-400');


    }
  }
}
