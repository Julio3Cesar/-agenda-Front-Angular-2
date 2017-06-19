import { Injectable } from '@angular/core';

import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class MenuUserService {

  private token: string = localStorage.getItem('token');
  private username: string = this.getUsername();

  constructor(private authHttp: AuthHttp) { }

  getUser() {
    return this.authHttp.get('url' + this.username)
      .map(res => res.json());
  }

  getUsername() {
    // implementar...
    return '';
  }

}
