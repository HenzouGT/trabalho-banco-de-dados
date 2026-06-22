import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateArtistaDto, UpdateArtistaDto } from './dto/artista.dto';

@Injectable()
export class ArtistaService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('artista', 'nome');
  }

  findOne(id: string) {
    return this.findOneFrom('artista', { id }, 'Artista nao encontrado');
  }

  create(createArtistaDto: CreateArtistaDto) {
    return this.createIn('artista', {
      id: randomUUID(),
      ...createArtistaDto,
    });
  }

  update(id: string, updateArtistaDto: UpdateArtistaDto) {
    return this.updateIn(
      'artista',
      { id },
      updateArtistaDto,
      'Artista nao encontrado',
    );
  }

  remove(id: string) {
    return this.removeFrom('artista', { id }, 'Artista nao encontrado');
  }
}
