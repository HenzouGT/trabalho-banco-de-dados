import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateObraDto, UpdateObraDto } from './dto/obra.dto';

@Injectable()
export class ObraService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('obra', 'titulo');
  }

  findOne(id: string) {
    return this.findOneFrom('obra', { id }, 'Obra nao encontrada');
  }

  create(createObraDto: CreateObraDto) {
    return this.createIn('obra', {
      id: randomUUID(),
      ...createObraDto,
    });
  }

  update(id: string, updateObraDto: UpdateObraDto) {
    return this.updateIn('obra', { id }, updateObraDto, 'Obra nao encontrada');
  }

  remove(id: string) {
    return this.removeFrom('obra', { id }, 'Obra nao encontrada');
  }
}
