import { Contato } from './../../_models/Contato';
import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ContatosService {

  constructor(private http: Http) { }

  contato: Contato = new Contato();
  contatos: Contato[] = [];
  // private url: string = "http://jsonplaceholder.typicode.com/users";
  // private url: string = "http://localhost:40331/AgendaWs/service/agenda/";
  private url: string = "http://localhost:8080/api/agenda/";

  getContatos() {
    return this.http.get(this.url+"contatos")
      .map(res => res.json());
  }

  getContato(id) {
    return this.http.get(this.url + "contato/" + id)
      .map(res => res.json());
  }

  addContato(contato) {
    return this.http.post(this.url+"cadastrar", contato)
      .map(res => res.json());
  }

  deleteContato(id) {
    return this.http.delete(this.url+"deletar/"+id)
      .map(res => res.json());
  }
}
