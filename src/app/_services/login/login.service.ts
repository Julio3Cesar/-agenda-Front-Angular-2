import { User } from './../../_models/User';
import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { AuthConfig, tokenNotExpired } from 'angular2-jwt';


@Injectable()
export class LoginService {

  constructor(private http: Http) { }

  login(user: User) {
    return this.http.post('http://localhost:8080/AgendaWs/service/autentica/loguin', user)
      .map(response => {
        const token = response.text();

        if (token && token !== 'false') {
          localStorage.setItem('token', token);
        } else {
          console.log('Usuario/Senha errados');
        }
      },
      err => console.log('Error ao Logar')
      );
  }

  loggedIn() {
    return tokenNotExpired();
  }
}
