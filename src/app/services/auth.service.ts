import { inject, Injectable } from '@angular/core';
import { getAuth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, onAuthStateChanged, updateProfile, sendEmailVerification } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { FirestoreService } from './firestore.service';

import { Router } from '@angular/router';
import { Especialista, Paciente, Perfil, Usuario } from '../models/usuario';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private sesionActivaSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<User|null>(null);

  sesionActiva$ = this.sesionActivaSubject.asObservable();
  userLog$ = this.userSubject.asObservable();

  toastM = inject(ToastrService);
  fireSvc = inject(FirestoreService);
  router = inject(Router);
  usuarioActual?: User;
  tipoPerfilActual!: Perfil | null;
  sesionActiva: boolean = false;
  constructor() { }

  async login(email: string, pass: string) {
    const auth = getAuth();
    const personaLogueada = await this.fireSvc.obtenerUsuarioDatos(email) as any;

    return signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        const user = userCredential.user;
        let mensaje = '';
        if (!user.emailVerified && personaLogueada.perfil != Perfil.Administrador) {
          this.toastM.error("Debes verificar tu cuenta, revisa tu correo.", "Acceso denegado!", { timeOut: 4000 });
          this.sesionActiva=false;
          this.closeSession();
          // this.traerUsuarioActual();
          return;
        }
        if (!personaLogueada.cuenta_habilitada && personaLogueada.perfil == Perfil.Especialista) {
          this.toastM.error(`Tu cuenta ${user.email} no ha sido habilitada, comunicate con un administrador.`, "Acceso denegado!", { timeOut: 4000 });
          this.closeSession();
          return;
        }
        console.log(user.email);
        this.toastM.info(`Hola, ${(user.displayName) ? user.displayName : user.email}`, 'Bienvenido');
        this.fireSvc.guardarLog(email);
        this.router.navigate(['mi-perfil']);
        return user;
      }).catch((error) => {
        const errorCode = error.code;
        let mensajeTexto: string = this.convertirError(errorCode);
        console.error(errorCode);

        this.toastM.error(`Error: ${mensajeTexto}`, 'Error en el inicio de sesión');
        throw errorCode;
      });
  }


  async registerAccount(username: string, email: string, pass: string, photoProfileURL: string, perfil: Perfil) {
    const auth = getAuth();
    const emailActual = this.usuarioActual?.email;
    // const passActual = this.fireSvc.obtenerAdminLogueado(emailActual as string);
    const personaLogueada = await this.fireSvc.obtenerUsuarioDatos(emailActual as string) as any;

    return createUserWithEmailAndPassword(auth, email, pass)
      .then(async (userCredential) => {
        const user = userCredential.user;
        let mensaje = "";

        if (user) {
          updateProfile(user, { displayName: username, photoURL: photoProfileURL });
        }
        if (personaLogueada.perfil == Perfil.Administrador) {
          switch (perfil) {
            case Perfil.Paciente:
              mensaje = `Creaste un nuevo Paciente.\nEl usuario ${email} debe verificar su cuenta.`;
              await sendEmailVerification(user);
              break;
            case Perfil.Especialista:
              mensaje = `Creaste un nuevo Especialista.\nEl usuario ${email} debe verificar su cuenta.`;
              await sendEmailVerification(user);
              break;
            case Perfil.Administrador:
              mensaje = `Un nuevo Administrador fue registrado.\nEl usuario ${email} puede comenzar a usar su cuenta.`;
              break;
          }

          if (personaLogueada.email && personaLogueada.password) {
            await signOut(auth);
            await signInWithEmailAndPassword(auth, personaLogueada.email, personaLogueada.password);

            this.toastM.success(mensaje, `¡Registro exitoso!`, { timeOut: 10000 })
          }
          else {
            this.toastM.error('Error al loguearse');
          }
        }
        else {
          switch (perfil) {
            case Perfil.Paciente:
              mensaje = `Tu cuenta como Paciente fue creada.\nRevisa tu correo ${user.email} para verificar tu cuenta.`;
              await sendEmailVerification(user).then(() => {
                this.toastM.success(mensaje, `¡Registro exitoso!`, { timeOut: 4000 })
              });
              this.closeSession();
              break;
            case Perfil.Especialista:
              mensaje = `Tu cuenta como Especialista fue creada.\nUn Administrador pronto aprobara tu registro, mientras tanto revisa tu correo ${user.email} para verificar tu usuario.`;
              await sendEmailVerification(user).then(() => {
                this.toastM.success(mensaje, `¡Registro exitoso!`, { timeOut: 10000 })
              });
              this.closeSession();
              break;
          }

        }

        console.log(user.email);
        // this.toastM.success(`Hola, ${(user.displayName) ?  user.displayName : user.email}`, 'Bienvenido');
        // this.closeSession();
        // this.fireSvc.guardarLog(email);
        // return user;
      }).catch((error) => {
        const errorCode = error.code;
        let mensajeTexto: string = this.convertirError(errorCode);
        console.error(errorCode);

        this.toastM.error(`Error: ${mensajeTexto}`, 'Error en el registro');
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
      // this.toastM.info("adios!");
      this.router.navigate(['iniciar-sesion']);
      this.sesionActivaSubject.next(false); // Notificar que la sesión está inactiva
      this.userSubject.next(null);
    }).catch((error) => {
      // An error happened.
      this.toastM.error(error);
    });
  }

  traerUsuarioActual() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        this.sesionActivaSubject.next(true); // Notificar que la sesión está activa
        this.userSubject.next(user);
        this.usuarioActual = user;
        const usuarioDatos = await this.fireSvc.obtenerUsuarioDatos(user.email as string) as any;
        this.tipoPerfilActual = usuarioDatos.perfil;
        this.sesionActiva = true;
        // ...
      } else {
        console.log("no hay usuario");
        this.usuarioActual = undefined;
        this.sesionActiva = false;
        this.tipoPerfilActual = null;
        this.sesionActivaSubject.next(false); // Notificar que la sesión está inactiva
        this.userSubject.next(null);

        // User is signed out
        // ...
      }
    });

  }
}
