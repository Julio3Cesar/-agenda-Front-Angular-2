import { Usuario } from '../_models/Usuario';
import { RegisterService } from '../_services/register/register.service';
import { confirmSenhaValidator } from '../_shared/_validadores/confirm-senha/confirm-senha-validator';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  public form: FormGroup;
  public usuario: Usuario = new Usuario();

  constructor(
    private registerService: RegisterService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute) {

    const senha = new FormControl('', Validators.required);

    this.form = formBuilder.group({
      foto: ['', Validators.required],
      nome: ['', Validators.required],
      sobreNome: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        Validators.email
      ])],
      profissao: ['', Validators.required],
      senha: senha,
      confirmSenha: ['', CustomValidators.equalTo(senha)]
    });
  }

  public mostraError(campo: string): boolean {
    const f = this.form.get(campo);
    return f.invalid && f.touched;
  }

  public confirmSenha(): boolean {
    const errors = this.form.get('confirmSenha').errors;
    if (errors === null) {
      return false;
    } else {
      if (errors['equalTo'] === null) {
        return false;
      }
      const confirm = this.form.get('confirmSenha');
      return confirm.touched && errors['equalTo'] && confirm.dirty;
    }
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
