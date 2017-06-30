export class Usuario {
  foto: string;
  nome: string;
  sobreNome: string;
  username: string;
  email: string;
  profissao: string;
  senha: string;
  confirmSenha: string;
  constructor(
    foto?: string,
    sobreNome?: string,
    nome?: string,
    username?: string,
    email?: string,
    profissao?: string,
    senha?: string,
    confirmSenha?: string
  ) { }
}
