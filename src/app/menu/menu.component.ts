import { MenuUserService } from '../_services/menu/menu-user.service';
import { Component, OnInit } from '@angular/core';

import { UserLogado } from './../_models/UserLogado';
import { User } from './../_models/User';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public static exNome: string;
  logado: UserLogado;

  constructor(private menuUserService: MenuUserService) {
    this.logado = new UserLogado('Jackson', 'Jogador de Basquete',
      'http://www.caixa.gov.br/PublishingImages/Paginas/LT_T026/bannerheader_conta_corrente_pf.png');
    MenuComponent.exNome = this.logado.nome;
  }

  ngOnInit() {
    this.menuUserService.getUser().subscribe(
      data => this.logado = data
    );
  }
}
