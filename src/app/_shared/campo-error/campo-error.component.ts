import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-campo-error',
  templateUrl: './campo-error.component.html',
  styleUrls: ['./campo-error.component.css']
})
export class CampoErrorComponent implements OnInit {

  @Input() msgErro: string;
  @Input() mostrarErro: boolean;

  constructor() { }

  ngOnInit() {
  }

}
