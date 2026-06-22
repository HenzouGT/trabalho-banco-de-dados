import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ObraArtistaController } from './obra-artista.controller';
import { ObraArtistaService } from './obra-artista.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ObraArtistaController],
  providers: [ObraArtistaService],
})
export class ObraArtistaModule {}
