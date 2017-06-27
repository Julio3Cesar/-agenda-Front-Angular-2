import { Component, DoCheck } from '@angular/core';

import { MenuComponent } from './../menu/menu.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements DoCheck {

  public nome: string;

  ngDoCheck() {
    this.nome = MenuComponent.nome;
  }
}
