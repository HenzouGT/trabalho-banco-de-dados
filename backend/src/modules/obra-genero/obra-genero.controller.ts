import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateObraGeneroDto } from './dto/obra-genero.dto';
import { ObraGeneroService } from './obra-genero.service';

@Controller('obra_genero')
export class ObraGeneroController {
  constructor(private readonly obraGeneroService: ObraGeneroService) {}

  @Get()
  findAll() {
    return this.obraGeneroService.findAll();
  }

  @Get(':id_obra/:id_genero')
  findOne(
    @Param('id_obra') id_obra: string,
    @Param('id_genero') id_genero: string,
  ) {
    return this.obraGeneroService.findOne(id_obra, id_genero);
  }

  @Post()
  create(@Body() createObraGeneroDto: CreateObraGeneroDto) {
    return this.obraGeneroService.create(createObraGeneroDto);
  }

  @Delete(':id_obra/:id_genero')
  remove(
    @Param('id_obra') id_obra: string,
    @Param('id_genero') id_genero: string,
  ) {
    return this.obraGeneroService.remove(id_obra, id_genero);
  }
}
