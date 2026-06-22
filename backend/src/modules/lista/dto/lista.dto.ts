export class CreateListaDto {
  titulo: string;
  id_usuario: string;
  descricao?: string;
  publica?: boolean;
}

export class UpdateListaDto {
  titulo?: string;
  id_usuario?: string;
  descricao?: string;
  publica?: boolean;
}
