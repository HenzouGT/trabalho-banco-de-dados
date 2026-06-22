import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ArtistaController } from './artista.controller';
import { ArtistaService } from './artista.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ArtistaController],
  providers: [ArtistaService],
})
export class ArtistaModule {}
