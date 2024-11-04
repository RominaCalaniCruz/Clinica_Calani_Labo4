import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    {
        path: 'inicio',
        loadComponent: () =>
          import('./home/home.component').then((c) => c.HomeComponent),
      },
];
