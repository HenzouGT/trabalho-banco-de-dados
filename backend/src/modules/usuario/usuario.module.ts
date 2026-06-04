import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
