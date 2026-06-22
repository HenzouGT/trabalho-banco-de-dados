import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { UsuarioCurteArteController } from './usuario-curte-arte.controller';
import { UsuarioCurteArteService } from './usuario-curte-arte.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UsuarioCurteArteController],
  providers: [UsuarioCurteArteService],
})
export class UsuarioCurteArteModule {}
