import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        // Redireciona a raiz (http://localhost:4200/) para /register
        path: '',
        redirectTo: 'register',
        pathMatch: 'full'
    },

    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').
        then(m => m.RegisterComponent)
    }
];
