import { ControlContainer, FormGroup, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';

export function confirmSenhaValidator(): ValidatorFn {

  return (control: AbstractControl): { [key: string]: any } => {
    //    const senha = control.root.value[campoSenha];
    //    const confirm = control.value;

    //    const no = confirm === senha;
    console.log('aqui ');
    console.log(control);

    return { 'campoSenha': true };
    //    return confirm === senha ? { 'campoSenha': false } : { 'campoSenha': true };
  };
}
