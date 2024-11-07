import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { initFlowbite } from 'flowbite';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, NgxSpinnerComponent,NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'tp-clinica';
  authSvc = inject(AuthService);
  spinnerSvc = inject(NgxSpinnerService);
  ngOnInit(): void {
    initFlowbite();
    this.authSvc.traerUsuarioActual();

  }

  showSpinner() {
    this.spinnerSvc.show();
    setTimeout(() => {
      this.spinnerSvc.hide();
    }, 1000);
  }
}
