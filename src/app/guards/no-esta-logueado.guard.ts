import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';
import { getAuth } from '@angular/fire/auth';

export const noEstaLogueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authSvc = inject(AuthService);
  const toastM = inject(ToastrService);
  authSvc.traerUsuarioActual();

  const user = getAuth().currentUser;
  
  if(user == null){
    console.log("no esta logueado");
    
    return true;
  }
  toastM.error("Debe cerrar sesión antes de ingresar a esta página.","ERROR")
  return false;
  
};
