import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArteModule } from './modules/arte/arte.module';
import { ArtistaModule } from './modules/artista/artista.module';
import { AvaliacaoModule } from './modules/avaliacao/avaliacao.module';
import { GeneroModule } from './modules/genero/genero.module';
import { ListaObraModule } from './modules/lista-obra/lista-obra.module';
import { ListaModule } from './modules/lista/lista.module';
import { ObraArtistaModule } from './modules/obra-artista/obra-artista.module';
import { ObraGeneroModule } from './modules/obra-genero/obra-genero.module';
import { ObraModule } from './modules/obra/obra.module';
import { SeguidorModule } from './modules/seguidor/seguidor.module';
import { UsuarioCurteArteModule } from './modules/usuario-curte-arte/usuario-curte-arte.module';
import { UsuarioSalvaListaModule } from './modules/usuario-salva-lista/usuario-salva-lista.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', 'backend/.env'],
      isGlobal: true,
    }),
    SupabaseModule,
    UsuarioModule,
    ObraModule,
    ArtistaModule,
    GeneroModule,
    ListaModule,
    ArteModule,
    SeguidorModule,
    UsuarioSalvaListaModule,
    ListaObraModule,
    AvaliacaoModule,
    WatchlistModule,
    UsuarioCurteArteModule,
    ObraArtistaModule,
    ObraGeneroModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
