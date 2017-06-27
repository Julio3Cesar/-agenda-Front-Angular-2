import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';
import { Contato } from '../../_models/Contato';
import { AuthHttp, JwtHelper } from 'angular2-jwt';

@Injectable()
export class ContatosService {


  // private url: string = "http://jsonplaceholder.typicode.com/users";
  // private url: string = "http://localhost:40331/AgendaWs/service/agenda/";
  private url = 'http://localhost:8080/AgendaWs-Angular/service/agenda/';
  private jwtHelper: JwtHelper;


  constructor(private http: Http, private authHttp: AuthHttp) {
    this.jwtHelper = new JwtHelper();
  }

  private getUser() {
    return '/' + this.jwtHelper.decodeToken(localStorage.getItem('token')).user;
  }

  getContatos() {
    return this.authHttp.get(this.url + 'contatos' + this.getUser())
      .map(res => res.json());
  }
  getContato(id) {
    return this.authHttp.get(this.url + 'contato/' + id)
      .map(res => res.json());
  }
  addContato(contato) {
    return this.authHttp.post(this.url + 'cadastrar', contato);
  }
  deleteContato(id) {
    return this.authHttp.delete(this.url + 'deletar/' + id);
  }
}
