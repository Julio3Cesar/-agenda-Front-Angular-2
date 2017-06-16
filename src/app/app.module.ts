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
import { ContatosService } from './_services/contatos/contatos.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    MenuComponent,
    ContatosComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AuthModule,
    routing
  ],
  providers: [
    AuthGuard,
    LoginGuard,
    ContatosService,
    LoginService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
