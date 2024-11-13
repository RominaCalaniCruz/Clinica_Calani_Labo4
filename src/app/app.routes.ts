import { Routes } from '@angular/router';
import { noEstaLogueadoGuard } from './guards/no-esta-logueado.guard';
import { estaLogueadoGuard } from './guards/esta-logueado.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    {
        path: 'inicio',
        loadComponent: () =>
            import('./home/home.component').then((c) => c.HomeComponent),
        data: {animation: "home"}

    },
    {
        path: 'iniciar-sesion',
        loadComponent: () =>
            import('./components/login/login.component').then((c) => c.LoginComponent),
        canActivate:[noEstaLogueadoGuard],
        data: {animation: "login"}
    },
    {
        path: 'registro',
        loadComponent: () =>
            import('./components/register/register.component').then((c) => c.RegisterComponent),
        canActivate:[noEstaLogueadoGuard],
        data: {animation: "registro"}
    },
    {
        path: 'mi-perfil',
        loadComponent: () =>
            import('./components/mi-perfil/mi-perfil.component').then((c) => c.MiPerfilComponent),
        canActivate:[estaLogueadoGuard],
        data: {animation: "mi-perfil"}
    },
    {
        path: 'lista-usuarios',
        loadComponent: () =>
            import('./components/lista-usuarios/lista-usuarios.component').then((c) => c.ListaUsuariosComponent),
        canActivate:[estaLogueadoGuard],
        data: {animation: "usuarios"}
        
    },
    {
        path: 'sacar-turno',
        loadComponent: () =>
            import('./pages/sacar-turno/sacar-turno.component').then((c) => c.SacarTurnoComponent),
        canActivate:[estaLogueadoGuard],
        data: {animation: "sacar-turno"}        
    },
    {
        path: 'turnos',
        loadComponent: () =>
            import('./pages/turnos/turnos.component').then((c) => c.TurnosComponent),
        canActivate:[estaLogueadoGuard],
        data: {animation: "turnos"}        
    },
    {
        path: 'mis-turnos',
        loadComponent: () =>
            import('./pages/mis-turnos/mis-turnos.component').then((c) => c.MisTurnosComponent),
        canActivate:[estaLogueadoGuard],
        data: {animation: "mis-turnos"}        
    },
    {
        path: 'pacientes',
        loadComponent: () =>
            import('./pages/pacientes/pacientes.component').then((c) => c.PacientesComponent),
        canActivate:[estaLogueadoGuard],
        data: {animation: "pacientes"}        
    },
];
