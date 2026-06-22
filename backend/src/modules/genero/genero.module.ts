import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { GeneroController } from './genero.controller';
import { GeneroService } from './genero.service';

@Module({
  imports: [SupabaseModule],
  controllers: [GeneroController],
  providers: [GeneroService],
})
export class GeneroModule {}
