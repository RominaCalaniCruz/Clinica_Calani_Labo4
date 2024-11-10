import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { FormControl, FormsModule } from '@angular/forms';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { jamGamepadRetroF, jamEyeCloseF, jamEyeF, jamCloseRectangleF, jamArrowSquareRightF, jamAndroid, jamGhostF, jamPadlockF } from '@ng-icons/jam-icons';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';
import { tablerAt } from '@ng-icons/tabler-icons';
import { tablerLockFill } from '@ng-icons/tabler-icons/fill';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CaptchaComponent } from '../captcha/captcha.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NgIconComponent, FormsModule, ReactiveFormsModule,NgxSpinnerComponent,NgxSpinnerModule,CaptchaComponent],
  providers: [provideIcons({ tablerLockFill,jamGamepadRetroF,tablerAt, jamEyeF, jamEyeCloseF, jamCloseRectangleF, jamArrowSquareRightF, jamAndroid, jamGhostF, jamPadlockF })],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isPasswordVisible = false;
  isLoading: boolean = false;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  }, Validators.required);
  fireSvc = inject(FirestoreService);
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);


  constructor(){
    // this.loginForm = new FormGroup({
    //   email: new FormControl('', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
    //   password: new FormControl('', [Validators.required])
    // }, Validators.required);
  }
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  guardarLog(email: string) {
    const currentDate = Timestamp.fromDate(new Date());
    const log = {
      user: email,
      date: currentDate,
    };
    this.fireSvc.guardarDato('logs_users', log);
  }
  iniciarSesion() {
    if (this.loginForm.valid) {
      this.spinnerSvc.show();
      this.isLoading = true;
      const formValues = this.loginForm.getRawValue();
      this.authSvc.login(formValues.email as string, formValues.password as string)
      .then(()=>{
        // this.cerrar();
        // this.spinnerSvc.hide();
        this.loginForm.reset();
        // this.router.navigate(['mi-perfil']);


      }).finally(()=>{
        this.spinnerSvc.hide();
        this.isLoading=false;
      });

    } else {
      this.toastM.info("Debes ingresar el corrreo y la contraseña");

    }
  }
  autocompletar(correo: string, pass: string) {
    this.loginForm.setValue({
      email: correo,
      password: pass
    });
  }
}
