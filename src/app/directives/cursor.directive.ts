import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCursor]',
  standalone: true
})
export class CursorDirective {
  @Input('appCursor') inhabilitado!: boolean;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    if(this.inhabilitado){
      this.renderer.removeClass(this.el.nativeElement, 'cursor-pointer');
      this.renderer.addClass(this.el.nativeElement, 'cursor-not-allowed');
    }
    else{
      this.renderer.removeClass(this.el.nativeElement, 'cursor-not-allowed');
      this.renderer.addClass(this.el.nativeElement, 'cursor-pointer');

    }
  }
}
