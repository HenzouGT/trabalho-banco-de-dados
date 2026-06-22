import { Injectable } from '@nestjs/common';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateObraGeneroDto } from './dto/obra-genero.dto';

@Injectable()
export class ObraGeneroService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('obra_genero', 'id_obra');
  }

  findOne(id_obra: string, id_genero: string) {
    return this.findOneFrom(
      'obra_genero',
      { id_obra, id_genero },
      'Genero da obra nao encontrado',
    );
  }

  create(createObraGeneroDto: CreateObraGeneroDto) {
    return this.createIn('obra_genero', createObraGeneroDto);
  }

  remove(id_obra: string, id_genero: string) {
    return this.removeFrom(
      'obra_genero',
      { id_obra, id_genero },
      'Genero da obra nao encontrado',
    );
  }
}
