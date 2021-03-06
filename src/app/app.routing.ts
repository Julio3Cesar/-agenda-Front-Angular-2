import { ContatosComponent } from './contatos/contatos.component';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { AuthGuard } from './_guards/auth/auth.guard';
import { LoginGuard } from './_guards/login/login.guard';
import { AboutComponent } from './about/about.component';
import { ContatoFormComponent } from './contatos/contato-form/contato-form.component';
import { OptionsComponent } from './options/options.component';
import { RegisterComponent } from './register/register.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: RegisterComponent},
  {
    path: 'menu', component: MenuComponent, canActivate: [AuthGuard], children: [
      { path: 'home', component: HomeComponent },
      { path: 'contatos', component: ContatosComponent },
      { path: 'contatos/new', component: ContatoFormComponent },
      { path: 'contatos/:id', component: ContatoFormComponent },
      { path: 'about', component: AboutComponent },
      { path: 'options', component: OptionsComponent }
    ]
  },
  { path: '', redirectTo: 'menu/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/menu/home' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
