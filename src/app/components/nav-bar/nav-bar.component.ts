import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerHomeFill, tablerUserFill} from '@ng-icons/tabler-icons/fill';
import {matAccountCircle, matEditCalendar,matLockClock} from '@ng-icons/material-icons/baseline';
import { tablerListDetails, tablerLogin2, tablerMenu4, tablerSquareX, tablerUserPlus} from '@ng-icons/tabler-icons';
import {jamLogIn} from '@ng-icons/jam-icons';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Perfil } from '../../models/usuario';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,NgIconComponent],
  providers: [provideIcons({tablerHomeFill,tablerUserPlus,tablerLogin2,tablerUserFill,matEditCalendar,matLockClock,tablerListDetails,matAccountCircle,tablerSquareX,jamLogIn,tablerMenu4})],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit{
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  isDropdownOpen: boolean = false;
  router = inject(Router);
  estaLogueado = false;
ngOnInit(): void {
  this.authSvc.sesionActiva$.subscribe(res=>{
    this.estaLogueado = res;
  });
}
  cerrarSesion() {
    this.authSvc.closeSession();
    this.toastM.info("Cerraste sesón");
    this.isDropdownOpen = false;
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event) {
    const dropdownButton = document.getElementById('user-menu-button');
    const dropdownMenu = document.getElementById('user-dropdown');
    if (dropdownButton && dropdownMenu && !dropdownButton.contains(event.target as Node) && !dropdownMenu.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }
  }
}
