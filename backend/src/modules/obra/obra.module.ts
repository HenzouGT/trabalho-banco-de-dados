import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ObraController } from './obra.controller';
import { ObraService } from './obra.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ObraController],
  providers: [ObraService],
})
export class ObraModule {}
