import { Contato } from './../_models/Contato';
import { Router } from '@angular/router';
import { ContatosService } from './../_services/contatos/contatos.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contatos',
  templateUrl: './contatos.component.html',
  styleUrls: ['./contatos.component.css']
})
export class ContatosComponent implements OnInit {

  public contatos: Contato[];


  constructor(
    private contatosService: ContatosService,
    private router: Router) {
  }

  ngOnInit() {
    this.contatosService.getContatos()
      .subscribe(data => this.contatos = data);
  }

  deleteContato(contato) {
    if (confirm('Deseja deletar o contato ' + contato.nome + '?')) {
      const index = this.contatos.indexOf(contato);
      this.contatos.splice(index, 1);

      this.contatosService.deleteContato(contato.id)
        .subscribe(null,
        err => {
          alert('não foi possivel remover o contato!');
          // Reverte remoção
          this.contatos.splice(index, 0, contato);
        });
    }
  }

}
