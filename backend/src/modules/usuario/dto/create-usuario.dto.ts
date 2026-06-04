export class CreateUsuarioDto {
  nome: string;
  email: string;
  hash_senha: string;
  bio?: string;
  avatar?: string;
}
