import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class RegisterService {

  private url = 'http://localhost:8080/AgendaWs-Angular/service/registrar/';

  constructor(private http: Http) { }

  registrar(usuario) {
    return this.http.post(this.url, usuario);
  }
}
