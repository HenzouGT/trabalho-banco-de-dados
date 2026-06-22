import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { SeguidorController } from './seguidor.controller';
import { SeguidorService } from './seguidor.service';

@Module({
  imports: [SupabaseModule],
  controllers: [SeguidorController],
  providers: [SeguidorService],
})
export class SeguidorModule {}
