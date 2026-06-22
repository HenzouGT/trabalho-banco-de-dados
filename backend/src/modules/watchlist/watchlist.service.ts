import { Injectable } from '@nestjs/common';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateWatchlistDto, UpdateWatchlistDto } from './dto/watchlist.dto';

@Injectable()
export class WatchlistService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('watchlist', 'data_adicao');
  }

  findOne(id_usuario: string, id_obra: string) {
    return this.findOneFrom(
      'watchlist',
      { id_usuario, id_obra },
      'Watchlist nao encontrada',
    );
  }

  create(createWatchlistDto: CreateWatchlistDto) {
    return this.createIn('watchlist', createWatchlistDto);
  }

  update(
    id_usuario: string,
    id_obra: string,
    updateWatchlistDto: UpdateWatchlistDto,
  ) {
    return this.updateIn(
      'watchlist',
      { id_usuario, id_obra },
      updateWatchlistDto,
      'Watchlist nao encontrada',
    );
  }

  remove(id_usuario: string, id_obra: string) {
    return this.removeFrom(
      'watchlist',
      { id_usuario, id_obra },
      'Watchlist nao encontrada',
    );
  }
}
