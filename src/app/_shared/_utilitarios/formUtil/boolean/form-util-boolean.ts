import { FormGroup } from '@angular/forms';

export class FormUtilBoolean {

  public static verificaValidTouched(formulario: FormGroup, campo: string) {

    return !formulario.get(campo).valid && formulario.get(campo).touched;
  }

  public static verificaEmailInvalido(formulario: FormGroup) {

    const campoEmail = formulario.get('email');

    if (campoEmail.errors) {
      return campoEmail.errors['email'] && campoEmail.touched;
    }
  }
}
