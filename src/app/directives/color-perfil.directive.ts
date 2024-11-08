import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { Perfil } from '../models/usuario';

@Directive({
  selector: '[appColorPerfil]',
  standalone: true
})
export class ColorPerfilDirective implements OnInit{
  @Input('appColorPerfil') perfil!: Perfil;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.perfil == Perfil.Administrador) {
      this.renderer.removeClass(this.el.nativeElement,'text-purple-700');
      this.renderer.removeClass(this.el.nativeElement,'text-pink-500');

      this.renderer.addClass(this.el.nativeElement, 'text-black');

    } 
    else if (this.perfil == Perfil.Paciente){
      this.renderer.removeClass(this.el.nativeElement,'text-black');
      this.renderer.removeClass(this.el.nativeElement, 'text-pink-500');

      this.renderer.addClass(this.el.nativeElement,'text-purple-700');
    }
    else{
      this.renderer.removeClass(this.el.nativeElement,'text-purple-700');
      this.renderer.removeClass(this.el.nativeElement,'text-black');

      this.renderer.addClass(this.el.nativeElement,'text-pink-500');
    }
  }

}
