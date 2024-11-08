import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appColorEstado]',
  standalone: true
})
export class ColorEstadoDirective implements OnInit{
  @Input('appColorEstado') estado!: boolean;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.estado) {
      // this.renderer.setStyle(this.el.nativeElement, 'background-color', '#ADD8E6'); 
      this.renderer.removeClass(this.el.nativeElement,'text-red-900');
      this.renderer.removeClass(this.el.nativeElement, 'bg-red-500/20');

      this.renderer.addClass(this.el.nativeElement,'text-green-900');
      this.renderer.addClass(this.el.nativeElement, 'bg-green-500/20');

    } 
    else {
      this.renderer.removeClass(this.el.nativeElement,'text-green-900');
      this.renderer.removeClass(this.el.nativeElement, 'bg-green-500/20');

      this.renderer.addClass(this.el.nativeElement,'text-red-900');
      this.renderer.addClass(this.el.nativeElement, 'bg-red-500/20');



    }
  }

}
