import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ArteController } from './arte.controller';
import { ArteService } from './arte.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ArteController],
  providers: [ArteService],
})
export class ArteModule {}
