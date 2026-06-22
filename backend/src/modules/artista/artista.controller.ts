import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ArtistaService } from './artista.service';
import { CreateArtistaDto, UpdateArtistaDto } from './dto/artista.dto';

@Controller('artista')
export class ArtistaController {
  constructor(private readonly artistaService: ArtistaService) {}

  @Get()
  findAll() {
    return this.artistaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artistaService.findOne(id);
  }

  @Post()
  create(@Body() createArtistaDto: CreateArtistaDto) {
    return this.artistaService.create(createArtistaDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArtistaDto: UpdateArtistaDto) {
    return this.artistaService.update(id, updateArtistaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.artistaService.remove(id);
  }
}
