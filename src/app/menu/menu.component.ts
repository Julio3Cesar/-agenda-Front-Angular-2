import { UserLogado } from './../_models/UserLogado';
import { User } from './../_models/User';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  logado: UserLogado = new UserLogado();
  // user: User = new User();
  static exNome: string;
  
  constructor() {
    // this.logado = JSON.parse(localStorage.getItem('currentUser')).object;
    this.logado.nome = "Jackson";
    this.logado.profissao = "Jogador de Basquete";
    this.logado.foto = "http://www.caixa.gov.br/PublishingImages/Paginas/LT_T026/bannerheader_conta_corrente_pf.png";
    UserLogado
    MenuComponent.exNome = this.logado.nome;
  }

}
