import type { FuncaoArtista } from '../../../common/database-types';

export class CreateObraArtistaDto {
  id_obra: string;
  id_artista: string;
  funcao: FuncaoArtista;
}

export class UpdateObraArtistaDto {
  funcao?: FuncaoArtista;
}
