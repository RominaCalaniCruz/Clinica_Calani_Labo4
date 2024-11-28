import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerHomeFill, tablerUserFill} from '@ng-icons/tabler-icons/fill';
import {matAccountCircle, matChecklist, matEditCalendar,matGroups2,matLockClock, matSettingsApplications} from '@ng-icons/material-icons/baseline';
import { tablerFileAnalytics, tablerListDetails, tablerLogin2, tablerMenu4, tablerSquareX, tablerUserPlus, tablerUsersGroup} from '@ng-icons/tabler-icons';
import {jamLogIn} from '@ng-icons/jam-icons';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Perfil } from '../../models/usuario';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,NgIconComponent],
  providers: [provideIcons({tablerFileAnalytics,matChecklist,matGroups2,matSettingsApplications,tablerHomeFill,tablerUserPlus,tablerLogin2,tablerUserFill,matEditCalendar,matLockClock,tablerListDetails,matAccountCircle,tablerSquareX,jamLogIn,tablerMenu4})],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit{
  authSvc = inject(AuthService);
  toastM = inject(ToastrService);
  fireSvc = inject(FirestoreService);
  isDropdownOpen: boolean = false;
  isSubmenuOpen: boolean = false;
  router = inject(Router);
  route = inject(ActivatedRoute);
  estaLogueado = false;
  usuarioInfo : any;
  loading = true;
ngOnInit(): void {
  this.authSvc.sesionActiva$.subscribe(res=>{
    this.estaLogueado = res;
  });
    this.authSvc.userLog$.subscribe(async (res) => {
      if (res?.email) {
        await this.fireSvc.obtenerUsuarioDatos(res.email).then((res)=>{
          this.usuarioInfo = res;
          this.loading = false;
        });
      }
    })
}
  cerrarSesion() {
    this.authSvc.closeSession();
    this.toastM.info("Cerraste sesón");
    this.isDropdownOpen = false;
  }
  get esAdministrador(){
    return this.authSvc.tipoPerfilActual == Perfil.Administrador;
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleSubmenu() {
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }
  goToInforme(nro: number) {
    this.router.navigate([`informes/${nro}`]);
    this.isSubmenuOpen = false;
  }
  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event) {
    const dropdownButtonUser = document.getElementById('user-menu-button');
    const dropdownMenuUser = document.getElementById('user-dropdown');
    const dropdownButtonMega = document.getElementById('mega-menu-button');
    const dropdownMenuMega = document.getElementById('mega-menu-dropdown');
    if (dropdownButtonUser && dropdownMenuUser && !dropdownButtonUser.contains(event.target as Node) && !dropdownMenuUser.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }
    if (dropdownButtonMega && dropdownMenuMega && !dropdownButtonMega.contains(event.target as Node) && !dropdownMenuMega.contains(event.target as Node)) {
      this.isSubmenuOpen = false;
    }
  }
  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
