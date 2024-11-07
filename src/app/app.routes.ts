import { Routes } from '@angular/router';
import { noEstaLogueadoGuard } from './guards/no-esta-logueado.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    {
        path: 'inicio',
        loadComponent: () =>
            import('./home/home.component').then((c) => c.HomeComponent),
    },
    {
        path: 'iniciar-sesion',
        loadComponent: () =>
            import('./components/login/login.component').then((c) => c.LoginComponent),
        canActivate:[noEstaLogueadoGuard]
    },
    {
        path: 'registro',
        loadComponent: () =>
            import('./components/register/register.component').then((c) => c.RegisterComponent),
        canActivate:[noEstaLogueadoGuard]
    },
    {
        path: 'mi-perfil',
        loadComponent: () =>
            import('./components/mi-perfil/mi-perfil.component').then((c) => c.MiPerfilComponent),
    },
];
