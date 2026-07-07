import type { FuncaoUsuario } from '../../../common/database-types';

export class UpdateUsuarioDto {
  nome?: string;
  email?: string;
  senha?: string;
  bio?: string;
  avatar?: string;
  funcao?: FuncaoUsuario;
}
