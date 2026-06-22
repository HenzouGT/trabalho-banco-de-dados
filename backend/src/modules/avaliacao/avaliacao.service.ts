import { Injectable } from '@nestjs/common';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateAvaliacaoDto, UpdateAvaliacaoDto } from './dto/avaliacao.dto';

@Injectable()
export class AvaliacaoService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('avaliacao', 'data');
  }

  findOne(id_usuario: string, id_obra: string) {
    return this.findOneFrom(
      'avaliacao',
      { id_usuario, id_obra },
      'Avaliacao nao encontrada',
    );
  }

  create(createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.createIn('avaliacao', createAvaliacaoDto);
  }

  update(
    id_usuario: string,
    id_obra: string,
    updateAvaliacaoDto: UpdateAvaliacaoDto,
  ) {
    return this.updateIn(
      'avaliacao',
      { id_usuario, id_obra },
      updateAvaliacaoDto,
      'Avaliacao nao encontrada',
    );
  }

  remove(id_usuario: string, id_obra: string) {
    return this.removeFrom(
      'avaliacao',
      { id_usuario, id_obra },
      'Avaliacao nao encontrada',
    );
  }
}
