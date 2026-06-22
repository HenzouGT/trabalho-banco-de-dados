import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type SupabaseClientInstance = SupabaseClient<any, any, any, any, any>;

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClientInstance;

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.getOrThrow<string>('SUPABASE_URL');
    const supabaseKey = configService.getOrThrow<string>('SUPABASE_KEY');

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClientInstance {
    return this.client;
  }
}
