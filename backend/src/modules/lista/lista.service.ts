import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateListaDto, UpdateListaDto } from './dto/lista.dto';

@Injectable()
export class ListaService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('lista', 'titulo');
  }

  findOne(id: string) {
    return this.findOneFrom('lista', { id }, 'Lista nao encontrada');
  }

  create(createListaDto: CreateListaDto) {
    return this.createIn('lista', {
      id: randomUUID(),
      ...createListaDto,
    });
  }

  update(id: string, updateListaDto: UpdateListaDto) {
    return this.updateIn(
      'lista',
      { id },
      updateListaDto,
      'Lista nao encontrada',
    );
  }

  remove(id: string) {
    return this.removeFrom('lista', { id }, 'Lista nao encontrada');
  }
}
