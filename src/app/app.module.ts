import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './_guards/auth/auth.guard';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { LoginGuard } from './_guards/login/login.guard';
import { LoginComponent } from './login/login.component';
import { LoginService } from './_services/login/login.service';
import { ContatosComponent } from './contatos/contatos.component';
import { MenuUserService } from './_services/menu/menu-user.service';
import { ContatosService } from './_services/contatos/contatos.service';
import { RegisterService } from './_services/register/register.service';
import { confirmSenhaValidator } from './_shared/_validadores/confirm-senha/confirm-senha-validator';
import { ContatoFormComponent } from './contatos/contato-form/contato-form.component';
import { AboutComponent } from './about/about.component';
import { OptionsComponent } from './options/options.component';
import { RegisterComponent } from './register/register.component';
import { CampoErrorComponent } from './_shared/campo-error/campo-error.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    MenuComponent,
    ContatosComponent,
    ContatoFormComponent,
    AboutComponent,
    OptionsComponent,
    RegisterComponent,
    CampoErrorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AuthModule,
    routing
  ],
//  exports: [confirmSenhaValidator],
  providers: [
    AuthGuard,
    LoginGuard,
    ContatosService,
    LoginService,
    RegisterService,
    MenuUserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
