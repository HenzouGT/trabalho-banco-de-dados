import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ObraGeneroController } from './obra-genero.controller';
import { ObraGeneroService } from './obra-genero.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ObraGeneroController],
  providers: [ObraGeneroService],
})
export class ObraGeneroModule {}
