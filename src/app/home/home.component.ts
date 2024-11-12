import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  authSvc = inject(AuthService);
  estaLogueado = false;
  // router = inject(Router);
  ngOnInit(): void {
    this.authSvc.sesionActiva$.subscribe(res => {
      this.estaLogueado = res;
    });
  }

}
