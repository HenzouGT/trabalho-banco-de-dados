export class CreateSeguidorDto {
  id_seguidor: string;
  id_seguido: string;
  data_follow?: string;
}

export class UpdateSeguidorDto {
  data_follow?: string;
}
