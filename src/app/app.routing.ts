import { ContatosComponent } from './contatos/contatos.component';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { AuthGuard } from './_guards/auth/auth.guard';
import { LoginGuard } from './_guards/login/login.guard';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    {
        path: 'menu', component: MenuComponent, children: [
            { path: 'home', component: HomeComponent },
            { path: 'contatos', component: ContatosComponent }
        ]
    },
    { path: '', redirectTo: 'menu/home', pathMatch: "full" },
    { path: '**', redirectTo: 'menu/home ' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
