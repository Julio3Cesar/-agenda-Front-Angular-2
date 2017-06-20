import { Injectable, OnInit } from '@angular/core';

import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class MenuUserService {

  private token: string = localStorage.getItem('token');
  private nome: string;

  constructor(private authHttp: AuthHttp) { }

  getUser() {
    return this.authHttp.get('url' + this.getUsername())
      .map(res => res.json());
  }

  getUsername() {
    // implementar...
    // pega username do token
    return '';
  }

  getName() {
    return 'jackson';
//    return this.nome;
  }
}
