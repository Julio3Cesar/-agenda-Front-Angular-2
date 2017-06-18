import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';
import { Contato } from '../../_models/Contato';

@Injectable()
export class ContatosService {


  // private url: string = "http://jsonplaceholder.typicode.com/users";
  // private url: string = "http://localhost:40331/AgendaWs/service/agenda/";
  private url = 'http://localhost:8080/api/agenda/';
  private contato: Contato;
  private contatos: Contato[];
  private token: string = localStorage.getItem('token');

  constructor(private http: Http) { }

  getContatos() {
    return this.http.get(this.url + 'contatos/' + this.token)
      .map(res => res.json());
  }

  getContato(id) {
    return this.http.get(this.url + 'contato/' + id + '/' + this.token)
      .map(res => res.json());
  }

  addContato(contato) {
    return this.http.post(this.url + 'cadastrar', contato)
      .map(res => res.json());
  }

  deleteContato(id) {
    return this.http.delete(this.url + 'deletar/' + id + '/' + this.token)
      .map(res => res.json());
  }
}
