import { Usuario } from '../_models/Usuario';
import { RegisterService } from '../_services/register/register.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public form: FormGroup;
  public usuario: Usuario = new Usuario();

  constructor(
    private registerService: RegisterService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute) {

    this.form = formBuilder.group({
      foto: [''],
      nome: [''],
      sobreNome: [''],
      username: [''],
      email: [''],
      profissao: [''],
      senha: [''],
      confirmSenha: ['']
    });
  }

  ngOnInit() {
  }

  registrar() {
    this.registerService.registrar(this.usuario)
      .subscribe(
        data => {
          this.router.navigate(['/login'])
          alert('Novo Usuario Registrado com sucesso!')
        },
        err => alert('Error ao Registrar')
    );
  }

}
