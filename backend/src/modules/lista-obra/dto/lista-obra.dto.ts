export class CreateListaObraDto {
  id_lista: string;
  id_obra: string;
  ordem: number;
}

export class UpdateListaObraDto {
  ordem?: number;
}
