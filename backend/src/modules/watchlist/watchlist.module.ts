import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  imports: [SupabaseModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}
