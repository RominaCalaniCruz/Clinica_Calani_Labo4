import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '../services/auth.service';

export const noEstaLogueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authSvc = inject(AuthService);
  const toastM = inject(ToastrService);
  authSvc.traerUsuarioActual();
  if(!authSvc.sesionActiva){
    return true;
  }

  // mnsjSvc.ErrorToast("Debe estar logueado para acceder a esta pagina.");
  toastM.error("Debe cerrar sesión antes de ingresar a esta página.","ERROR")
  return false;
};
