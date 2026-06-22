export class CreateWatchlistDto {
  id_usuario: string;
  id_obra: string;
  data_adicao?: string;
}

export class UpdateWatchlistDto {
  data_adicao?: string;
}
