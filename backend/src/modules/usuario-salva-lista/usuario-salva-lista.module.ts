import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { UsuarioSalvaListaController } from './usuario-salva-lista.controller';
import { UsuarioSalvaListaService } from './usuario-salva-lista.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UsuarioSalvaListaController],
  providers: [UsuarioSalvaListaService],
})
export class UsuarioSalvaListaModule {}
