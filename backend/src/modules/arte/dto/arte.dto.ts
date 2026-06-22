import type { TipoArte } from '../../../common/database-types';

export class CreateArteDto {
  tipo_arte: TipoArte;
  link: string;
  id_usuario: string;
  id_obra: string;
  data?: string;
}

export class UpdateArteDto {
  tipo_arte?: TipoArte;
  link?: string;
  id_usuario?: string;
  id_obra?: string;
  data?: string;
}
