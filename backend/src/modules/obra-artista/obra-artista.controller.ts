import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { FuncaoArtista } from '../../common/database-types';
import {
  CreateObraArtistaDto,
  UpdateObraArtistaDto,
} from './dto/obra-artista.dto';
import { ObraArtistaService } from './obra-artista.service';

@Controller('obra_artista')
export class ObraArtistaController {
  constructor(private readonly obraArtistaService: ObraArtistaService) {}

  @Get()
  findAll() {
    return this.obraArtistaService.findAll();
  }

  @Get(':id_obra/:id_artista/:funcao')
  findOne(
    @Param('id_obra') id_obra: string,
    @Param('id_artista') id_artista: string,
    @Param('funcao') funcao: FuncaoArtista,
  ) {
    return this.obraArtistaService.findOne(id_obra, id_artista, funcao);
  }

  @Post()
  create(@Body() createObraArtistaDto: CreateObraArtistaDto) {
    return this.obraArtistaService.create(createObraArtistaDto);
  }

  @Patch(':id_obra/:id_artista/:funcao')
  update(
    @Param('id_obra') id_obra: string,
    @Param('id_artista') id_artista: string,
    @Param('funcao') funcao: FuncaoArtista,
    @Body() updateObraArtistaDto: UpdateObraArtistaDto,
  ) {
    return this.obraArtistaService.update(
      id_obra,
      id_artista,
      funcao,
      updateObraArtistaDto,
    );
  }

  @Delete(':id_obra/:id_artista/:funcao')
  remove(
    @Param('id_obra') id_obra: string,
    @Param('id_artista') id_artista: string,
    @Param('funcao') funcao: FuncaoArtista,
  ) {
    return this.obraArtistaService.remove(id_obra, id_artista, funcao);
  }
}
