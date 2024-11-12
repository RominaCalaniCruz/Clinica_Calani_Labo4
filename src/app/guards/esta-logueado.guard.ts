import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';

export const estaLogueadoGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const toastM = inject(ToastrService);
  return new Promise((resolve)=>{
    onAuthStateChanged(getAuth(),auth=>{
    
      if(auth){
        resolve(true)
      }else{
        // toastM.error("Debe estar logueado para acceder a esta pagina.","ERROR");
        resolve(router.navigateByUrl('/iniciar-sesion'))
      }
    })
  });
};
