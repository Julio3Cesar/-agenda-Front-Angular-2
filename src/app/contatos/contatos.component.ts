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

  private contatos: Contato[] = [];


  constructor(
    private contatosService: ContatosService,
    private router: Router) {
  }

  ngOnInit() {
    // $('#example').DataTable();
    //teste
    // this.contatos = this.contatosService.getContatos();
    this.contatosService.getContatos()
      .subscribe(data => this.contatos = data);
  }

  deleteContato(contato) {
    if (confirm("Deseja deletar o contato " + contato.nome + "?")) {
      var index = this.contatos.indexOf(contato);
      this.contatos.splice(index, 1);

      this.contatosService.deleteContato(contato.id)
        .subscribe(null,
        err => {
          alert("Could not delete user.");
          // Reverte remoção
          this.contatos.splice(index, 0, contato);
        });
    }
  }

}
