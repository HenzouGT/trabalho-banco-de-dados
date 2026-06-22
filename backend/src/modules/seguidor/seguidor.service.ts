import { Injectable } from '@nestjs/common';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateSeguidorDto, UpdateSeguidorDto } from './dto/seguidor.dto';

@Injectable()
export class SeguidorService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('seguidor', 'data_follow');
  }

  findOne(id_seguidor: string, id_seguido: string) {
    return this.findOneFrom(
      'seguidor',
      { id_seguidor, id_seguido },
      'Seguidor nao encontrado',
    );
  }

  create(createSeguidorDto: CreateSeguidorDto) {
    return this.createIn('seguidor', createSeguidorDto);
  }

  update(
    id_seguidor: string,
    id_seguido: string,
    updateSeguidorDto: UpdateSeguidorDto,
  ) {
    return this.updateIn(
      'seguidor',
      { id_seguidor, id_seguido },
      updateSeguidorDto,
      'Seguidor nao encontrado',
    );
  }

  remove(id_seguidor: string, id_seguido: string) {
    return this.removeFrom(
      'seguidor',
      { id_seguidor, id_seguido },
      'Seguidor nao encontrado',
    );
  }
}
