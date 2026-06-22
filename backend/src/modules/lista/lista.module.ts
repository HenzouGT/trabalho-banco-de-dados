import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ListaController } from './lista.controller';
import { ListaService } from './lista.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ListaController],
  providers: [ListaService],
})
export class ListaModule {}
