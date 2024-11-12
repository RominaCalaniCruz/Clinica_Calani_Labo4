import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';

export const noEstaLogueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const toastM = inject(ToastrService);
  return new Promise((resolve)=>{
    onAuthStateChanged(getAuth(),auth=>{
      if(!auth){
        resolve(true)
      }else{
        // toastM.error("Debe cerrar sesión antes de ingresar a esta página.","ERROR")
        resolve(router.navigateByUrl('/mi-perfil'))
      }
    })
  })
  
};
