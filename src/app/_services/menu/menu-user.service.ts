import { Injectable, OnInit } from '@angular/core';

import { AuthHttp, JwtHelper } from 'angular2-jwt';

@Injectable()
export class MenuUserService {

  private nome: string;
  private token: string = localStorage.getItem('token');
  private jwtHelper: JwtHelper;
  private url = 'http://localhost:8080/AgendaWs-Angular/service/user/get/';

  constructor(private authHttp: AuthHttp) {
    this.jwtHelper = new JwtHelper();
  }

  getUser() {
    return this.authHttp.get(this.url + this.getUserName())
      .map(res => res.json());
  }

  getUserName() {
    return this.jwtHelper.decodeToken(this.token).user;
  }
}
