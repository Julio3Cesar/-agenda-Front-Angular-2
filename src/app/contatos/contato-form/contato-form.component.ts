import { Contato } from '../../_models/Contato';
import { ContatosService } from '../../_services/contatos/contatos.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { JwtHelper } from 'angular2-jwt';

@Component({
  selector: 'app-contato-form',
  templateUrl: './contato-form.component.html',
  styleUrls: ['./contato-form.component.css']
})
export class ContatoFormComponent implements OnInit {

  public form: FormGroup;
  public title: string;
  public contato: Contato = new Contato();
  private user = new JwtHelper().decodeToken(localStorage.getItem('token')).user;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private contatosService: ContatosService,
    private route: ActivatedRoute) {

    this.form = formBuilder.group({
      nome: [Validators.required],
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
      contatoValue.user = this.user;
      this.contatosService.addContato(contatoValue)
        .subscribe(data => this.router.navigate(['/menu/contatos']),
        err => {
          alert('Algo deu errado...')
          console.log(err)
        });
    });
  }
}
