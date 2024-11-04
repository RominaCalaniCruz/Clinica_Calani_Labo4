import { inject, Injectable } from '@angular/core';
import { getAuth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, onAuthStateChanged, updateProfile } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { FirestoreService } from './firestore.service';

import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  toastM = inject(ToastrService);
  fireSvc = inject(FirestoreService);
  router = inject(Router);
  usuarioActual?: User;
  sesionActiva: boolean = false;
  constructor() { }

  login(email: string, pass: string) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user.email);
        this.toastM.info(`Hola, ${(user.displayName) ?  user.displayName : user.email}`, 'Bienvenido');
        this.fireSvc.guardarLog(email);
        this.router.navigate(['juegos']);
        return user;
      }).catch((error) => {
        const errorCode = error.code;
        let mensajeTexto: string = this.convertirError(errorCode);
        console.error(errorCode);

        this.toastM.error(`Error: ${mensajeTexto}`, 'Error en el inicio de sesión');
        throw errorCode;
      });
  }


  registerAccount(username: string, email: string, pass: string) {
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          updateProfile(user, { displayName: username });
        }
        console.log(user.email);
        this.toastM.success(`Hola, ${(user.displayName) ?  user.displayName : user.email}`, 'Bienvenido');
        this.fireSvc.guardarLog(email);
        this.router.navigate(['juegos']);
        return user;
      }).catch((error) => {
        const errorCode = error.code;
        let mensajeTexto: string = this.convertirError(errorCode);
        console.error(errorCode);

        this.toastM.error(`Error: ${mensajeTexto}`, 'Error en el inicio de sesión');
        throw errorCode;

      });
  }

  convertirError(code: string) {
    let msg: string = '';
    switch (code) {
      case 'auth/internal-error':
        msg = 'Los campos estan vacios.';
        break;
      case 'auth/invalid-email':
        msg = 'El correo no es valido.';
        break;
      case 'auth/invalid-credential':
        msg = 'El correo o la contraseña es incorrecta';
        break;
      case 'auth/user-not-found':
        msg = 'El usuario no existe.';
        break;
      case 'auth/weak-password':
        msg = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/email-already-exists':
        msg = 'Correo en uso, inicie sesion o use otro.';
        break;
        case 'auth/email-already-in-use':
        msg = 'Correo en uso, inicie sesion o use otro.';
        break;
      default:
        msg = 'Error desconocido con la base de datos.';
        break;
    }
    return msg;
  }

  closeSession() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.toastM.info("adios!");
    }).catch((error) => {
      // An error happened.
      this.toastM.error(error);
    });
  }

  traerUsuarioActual() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log(user.email);
        console.log(user.displayName);

        this.usuarioActual = user;
        this.sesionActiva = true;
        // ...
      } else {
        console.log("no hay usuario");
        this.usuarioActual = undefined;
        this.sesionActiva = false;
        // User is signed out
        // ...
      }
    });

  }
}
