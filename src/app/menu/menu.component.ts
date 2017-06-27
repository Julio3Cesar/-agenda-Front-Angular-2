import { MenuUserService } from '../_services/menu/menu-user.service';
import { Component, OnInit } from '@angular/core';

import { UserLogado } from './../_models/UserLogado';
import { User } from './../_models/User';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  public static nome: string;
  public logado: UserLogado = new UserLogado();

  constructor(private menuUserService: MenuUserService) {
    this.menuUserService.getUser().subscribe(
      data => {
        this.logado = data
        MenuComponent.nome = this.logado.nome
      }
    );
  }

  logout() {
    localStorage.removeItem('token');
  }
}
