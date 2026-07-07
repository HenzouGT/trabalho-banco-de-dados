import type { FuncaoUsuario } from '../../../common/database-types';

export class CreateUsuarioDto {
  nome: string;
  email: string;
  senha: string;
  bio?: string;
  avatar?: string;
  funcao?: FuncaoUsuario;
}
