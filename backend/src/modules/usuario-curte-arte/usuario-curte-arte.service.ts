import { Injectable } from '@nestjs/common';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUsuarioCurteArteDto } from './dto/usuario-curte-arte.dto';

@Injectable()
export class UsuarioCurteArteService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  findAll() {
    return this.findAllFrom('usuario_curte_arte', 'id_usuario');
  }

  findOne(id_usuario: string, id_arte: string) {
    return this.findOneFrom(
      'usuario_curte_arte',
      { id_usuario, id_arte },
      'Curtida de arte nao encontrada',
    );
  }

  create(createUsuarioCurteArteDto: CreateUsuarioCurteArteDto) {
    return this.createIn('usuario_curte_arte', createUsuarioCurteArteDto);
  }

  remove(id_usuario: string, id_arte: string) {
    return this.removeFrom(
      'usuario_curte_arte',
      { id_usuario, id_arte },
      'Curtida de arte nao encontrada',
    );
  }
}
