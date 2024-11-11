import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '../services/auth.service';
import { getAuth } from '@angular/fire/auth';
import { lastValueFrom } from 'rxjs';

export const estaLogueadoGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authSvc = inject(AuthService);
  const toastM = inject(ToastrService);
  authSvc.traerUsuarioActual();
  
  if(authSvc.usuarioActual){
    return true;
  }

  toastM.error("Debe estar logueado para acceder a esta pagina.","ERROR");
  // router.navigateByUrl('/iniciar-sesion');
  return false;
};
