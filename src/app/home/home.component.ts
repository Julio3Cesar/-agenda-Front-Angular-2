import { Component, OnInit, Input } from '@angular/core';

import { MenuComponent } from './../menu/menu.component';
import { MenuUserService } from '../_services/menu/menu-user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public nome: string;

  constructor(private menuUserService: MenuUserService) { }

  ngOnInit() {
    this.nome = this.menuUserService.getName();
  }
}
