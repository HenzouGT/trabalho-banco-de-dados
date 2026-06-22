import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ListaObraController } from './lista-obra.controller';
import { ListaObraService } from './lista-obra.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ListaObraController],
  providers: [ListaObraService],
})
export class ListaObraModule {}
