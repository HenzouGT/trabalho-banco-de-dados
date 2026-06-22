import { Injectable } from '@nestjs/common';
import type { FuncaoArtista } from '../../common/database-types';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  CreateObraArtistaDto,
  UpdateObraArtistaDto,
} from './dto/obra-artista.dto';

@Injectable()
export class ObraArtistaService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('obra_artista', 'id_obra');
  }

  findOne(id_obra: string, id_artista: string, funcao: FuncaoArtista) {
    return this.findOneFrom(
      'obra_artista',
      { id_obra, id_artista, funcao },
      'Artista da obra nao encontrado',
    );
  }

  create(createObraArtistaDto: CreateObraArtistaDto) {
    return this.createIn('obra_artista', createObraArtistaDto);
  }

  update(
    id_obra: string,
    id_artista: string,
    funcao: FuncaoArtista,
    updateObraArtistaDto: UpdateObraArtistaDto,
  ) {
    return this.updateIn(
      'obra_artista',
      { id_obra, id_artista, funcao },
      updateObraArtistaDto,
      'Artista da obra nao encontrado',
    );
  }

  remove(id_obra: string, id_artista: string, funcao: FuncaoArtista) {
    return this.removeFrom(
      'obra_artista',
      { id_obra, id_artista, funcao },
      'Artista da obra nao encontrado',
    );
  }
}
