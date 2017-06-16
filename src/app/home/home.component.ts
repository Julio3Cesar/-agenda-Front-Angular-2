import { Component, OnInit, Input } from '@angular/core';

import { MenuComponent } from './../menu/menu.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  nome: string;

  constructor() { 
    this.nome = MenuComponent.exNome;
  }

}
