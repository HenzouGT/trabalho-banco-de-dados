export class CreateArtistaDto {
  nome: string;
  biografia?: string;
  foto?: string;
}

export class UpdateArtistaDto {
  nome?: string;
  biografia?: string;
  foto?: string;
}
