import { Contato } from '../../_models/Contato';
import { ContatosService } from '../../_services/contatos/contatos.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contato-form',
  templateUrl: './contato-form.component.html',
  styleUrls: ['./contato-form.component.css']
})
export class ContatoFormComponent implements OnInit {

  private form: FormGroup;
  private title: string;
  //  private contato: Contato;
  private contato: Contato = new Contato();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private contatosService: ContatosService,
    private route: ActivatedRoute) {

    this.form = formBuilder.group({
      nome: [''],
      email: [''],
      telefone: [''],
      celular: [''],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];

      if (id) {
        this.title = 'Editar Contato';
        this.contatosService.getContato(id)
          .subscribe(contato => this.contato = contato);
      } else {
        this.title = 'Novo Contato';
      }
    });
  }

  salvar() {
    const contatoValue = this.form.value;
    const id = this.route.params.subscribe(params => {
      contatoValue.id = params['id'];
      this.contatosService.addContato(contatoValue)
        .subscribe(data => this.router.navigate(['contatos']));
    });
  }
}
