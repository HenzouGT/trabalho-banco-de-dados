import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AvaliacaoController } from './avaliacao.controller';
import { AvaliacaoService } from './avaliacao.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AvaliacaoController],
  providers: [AvaliacaoService],
})
export class AvaliacaoModule {}
