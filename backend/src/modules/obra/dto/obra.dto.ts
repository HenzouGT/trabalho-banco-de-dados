import type { TipoObra } from '../../../common/database-types';

export class CreateObraDto {
  titulo: string;
  tipo_obra: TipoObra;
  ano?: number;
  duracao?: number;
  poster?: string;
}

export class UpdateObraDto {
  titulo?: string;
  tipo_obra?: TipoObra;
  ano?: number;
  duracao?: number;
  poster?: string;
}
