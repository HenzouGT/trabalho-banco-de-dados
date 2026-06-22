import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateGeneroDto, UpdateGeneroDto } from './dto/genero.dto';

@Injectable()
export class GeneroService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('genero', 'nome');
  }

  findOne(id: string) {
    return this.findOneFrom('genero', { id }, 'Genero nao encontrado');
  }

  create(createGeneroDto: CreateGeneroDto) {
    return this.createIn('genero', {
      id: randomUUID(),
      ...createGeneroDto,
    });
  }

  update(id: string, updateGeneroDto: UpdateGeneroDto) {
    return this.updateIn(
      'genero',
      { id },
      updateGeneroDto,
      'Genero nao encontrado',
    );
  }

  remove(id: string) {
    return this.removeFrom('genero', { id }, 'Genero nao encontrado');
  }
}
