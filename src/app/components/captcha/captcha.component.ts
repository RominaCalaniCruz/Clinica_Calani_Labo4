import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { createApi } from 'unsplash-js';
import { env } from '../../../environmentConfig';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerCheckbox, tablerReload, tablerSquare } from '@ng-icons/tabler-icons';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CursorDirective } from '../../directives/cursor.directive';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [NgIconComponent, CommonModule, ReactiveFormsModule, FormsModule,CursorDirective],
  providers: provideIcons({ tablerReload, tablerSquare,tablerCheckbox}),
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.scss'
})
export class CaptchaComponent implements OnInit {
  @Output() captchaVerificado = new EventEmitter<boolean>();
  imageApi: any;
  imageRandomURL!: string;
  captchaText!: string;
  loading = false;
  otro = "/cats.jpeg";
  habilitarInput = true;
  styledText: Array<{ char: string; style: any }> = [];
  fonts = ["cursive", "sans-serif", "serif", "monospace"];
  captchaForm: FormGroup;
  isCorrect = false;
  verError = false;
  userInput: string = '';

  textoVerificar = "Verificar";
  constructor() {
    this.imageApi = createApi({
      accessKey: env.unsplash.key,
    });
    // this.generarCaptcha();
    this.captchaForm = new FormGroup({
      respuesta: new FormControl('', [Validators.pattern('^[a-zA-Z\\s]+$')]),
    });
  }
  ngOnInit() {
    this.loading = true;
    // this.getCaptcha();
    this.establecerCaptcha();
    
  }
  verificarCaptcha(){
    // this.isCorrect = false;
    console.log(this.captchaForm.get('respuesta')?.value);
    const respuesta = this.captchaForm.get('respuesta')?.value;
    // console.log(this.captchaText);
    if(this.captchaText == this.userInput){
      this.captchaVerificado.emit(true);
      this.isCorrect = true;
      this.textoVerificar = "Verificado";
      this.verError = false;
      this.habilitarInput = false;
    }
    else{
      this.captchaVerificado.emit(false);
      this.verError = true;
    }
    
  }
  onInputChange(event: Event): void {
    this.userInput = (event.target as HTMLInputElement).value;
    // console.log('Texto ingresado:', this.userInput);
  }
  traerImagenAleatoria() {

    this.imageApi.photos.getRandom({
      query: 'cats'
    }).then((res: any) => {
      if (res.type == "success") {
        this.imageRandomURL = res.response.urls.small;
        // console.log(this.imageRandomURL);
        this.loading = false;
      }
    });
  }
  establecerCaptcha() {
    this.captchaText = this.generarCaptchaTexto();
    this.generateStyledText();
    // this.traerImagenAleatoria();
  }
  generarCaptchaTexto() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    while (result.length < 5) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomChar = characters[randomIndex].toLowerCase();
      if (!result.toLowerCase().includes(randomChar)) {
        result += characters[randomIndex];
      }
    }

    return result;
  }
  generateStyledText(): void {
    const fonts = ['Georgia', 'Times New Roman', "cursive", "sans-serif", "serif", "monospace"];

    this.styledText = this.captchaText.split('').map((char) => {
      const rotate = -20 + Math.trunc(Math.random() * 30);
      const font = fonts[Math.floor(Math.random() * fonts.length)];
      const fontSize = `${20 + Math.random() * 10}px`;

      return {
        char,
        style: {
          transform: `rotate(${rotate}deg)`,
          'font-family': font,
          'font-size': fontSize,
          display: 'inline-block',
          'user-select': 'none !important'
        }
      };
    });
  }
}
