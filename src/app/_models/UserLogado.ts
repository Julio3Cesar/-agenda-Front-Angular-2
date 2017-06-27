export class UserLogado {
  nome: string;
  profissao: string;
  foto: string;
  constructor(
    nome?: string,
    profissao?: string,
    foto?: string
  ) {

    this.nome = nome;
    this.profissao = profissao;
    this.foto = foto;
  }
}
