import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateArteDto, UpdateArteDto } from './dto/arte.dto';

@Injectable()
export class ArteService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('arte', 'data');
  }

  findOne(id: string) {
    return this.findOneFrom('arte', { id }, 'Arte nao encontrada');
  }

  create(createArteDto: CreateArteDto) {
    return this.createIn('arte', {
      id: randomUUID(),
      ...createArteDto,
    });
  }

  update(id: string, updateArteDto: UpdateArteDto) {
    return this.updateIn('arte', { id }, updateArteDto, 'Arte nao encontrada');
  }

  remove(id: string) {
    return this.removeFrom('arte', { id }, 'Arte nao encontrada');
  }
}
