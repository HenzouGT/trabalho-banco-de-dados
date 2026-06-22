import { Injectable } from '@nestjs/common';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateListaObraDto, UpdateListaObraDto } from './dto/lista-obra.dto';

@Injectable()
export class ListaObraService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('lista_obra', 'ordem');
  }

  findOne(id_lista: string, id_obra: string) {
    return this.findOneFrom(
      'lista_obra',
      { id_lista, id_obra },
      'Obra da lista nao encontrada',
    );
  }

  create(createListaObraDto: CreateListaObraDto) {
    return this.createIn('lista_obra', createListaObraDto);
  }

  update(
    id_lista: string,
    id_obra: string,
    updateListaObraDto: UpdateListaObraDto,
  ) {
    return this.updateIn(
      'lista_obra',
      { id_lista, id_obra },
      updateListaObraDto,
      'Obra da lista nao encontrada',
    );
  }

  remove(id_lista: string, id_obra: string) {
    return this.removeFrom(
      'lista_obra',
      { id_lista, id_obra },
      'Obra da lista nao encontrada',
    );
  }
}
