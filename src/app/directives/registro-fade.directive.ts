import { Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRegistroFade]',
  standalone: true
})
export class RegistroFadeDirective {

  @Output() fadeComplete = new EventEmitter<void>();

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    this.renderer.addClass(this.el.nativeElement, 'animate-fadeOut');
    this.el.nativeElement.addEventListener('animationend', () => {
      this.fadeComplete.emit();
    }, { once: true });
  }

}
