export class CreateAvaliacaoDto {
  id_usuario: string;
  id_obra: string;
  nota: number;
  data?: string;
  resenha?: string;
  reassistido?: boolean;
}

export class UpdateAvaliacaoDto {
  nota?: number;
  data?: string;
  resenha?: string;
  reassistido?: boolean;
}
