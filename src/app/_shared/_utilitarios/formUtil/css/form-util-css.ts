import { FormGroup } from '@angular/forms';

import { FormUtilBoolean } from '../boolean/form-util-boolean';

export class FormUtilCss {

  static aplicaCssErro(formulario: FormGroup, campo: string) {
    return {
      'has-error': FormUtilBoolean.verificaValidTouched(formulario, campo),
      'has-feedback': FormUtilBoolean.verificaValidTouched(formulario, campo)
    }
  }

  static aplicaStyleErro(formulario: FormGroup, campo: string) {
    return {'color': 'red'};
  }
}
