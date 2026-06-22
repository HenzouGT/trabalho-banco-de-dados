import { Injectable } from '@nestjs/common';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUsuarioSalvaListaDto } from './dto/usuario-salva-lista.dto';

@Injectable()
export class UsuarioSalvaListaService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('usuario_salva_lista', 'id_usuario');
  }

  findOne(id_usuario: string, id_lista: string) {
    return this.findOneFrom(
      'usuario_salva_lista',
      { id_usuario, id_lista },
      'Lista salva nao encontrada',
    );
  }

  create(createUsuarioSalvaListaDto: CreateUsuarioSalvaListaDto) {
    return this.createIn('usuario_salva_lista', createUsuarioSalvaListaDto);
  }

  remove(id_usuario: string, id_lista: string) {
    return this.removeFrom(
      'usuario_salva_lista',
      { id_usuario, id_lista },
      'Lista salva nao encontrada',
    );
  }
}
