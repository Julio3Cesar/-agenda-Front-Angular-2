import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LoginService } from './../_services/login/login.service';
import { User } from './../_models/User';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public user: User = new User();
  formLogin: FormGroup;

  constructor(private formBuilder: FormBuilder, private loginService: LoginService, private router: Router) {
    this.formLogin = formBuilder.group({
      user: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      pass: ['']
    });
  }

  autentica() {
    this.loginService.login(this.user)
      .subscribe(
      data => {
        this.router.navigate(['menu/home']);
      },
      error => {
        console.log('ERRO AO LOGAR!');
      });
  }

}
