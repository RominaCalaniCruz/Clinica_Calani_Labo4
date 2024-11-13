import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { initFlowbite } from 'flowbite';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from './services/auth.service';
import { slideInAnimation } from './animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, NgxSpinnerComponent,NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    slideInAnimation
  ]
})
export class AppComponent implements OnInit{
  title = 'tp-clinica';
  authSvc = inject(AuthService);
  spinnerSvc = inject(NgxSpinnerService);
  
  constructor(private contexts: ChildrenOutletContexts){

  }
  ngOnInit(): void {
    initFlowbite();
    this.authSvc.traerUsuarioActual();

  }
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
  showSpinner() {
    this.spinnerSvc.show();
    setTimeout(() => {
      this.spinnerSvc.hide();
    }, 1000);
  }
}
