import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { initFlowbite } from 'flowbite';
import { NgxSpinnerComponent, NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, NgxSpinnerComponent,NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'tp-clinica';
  spinnerSvc = inject(NgxSpinnerService);
  ngOnInit(): void {
    initFlowbite();
  }

  showSpinner() {
    this.spinnerSvc.show();
    setTimeout(() => {
      this.spinnerSvc.hide();
    }, 1000);
  }
}
