import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service';
import { CreateAvaliacaoDto, UpdateAvaliacaoDto } from './dto/avaliacao.dto';

@Controller('avaliacao')
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Get()
  findAll() {
    return this.avaliacaoService.findAll();
  }

  @Get(':id_usuario/:id_obra')
  findOne(
    @Param('id_usuario') id_usuario: string,
    @Param('id_obra') id_obra: string,
  ) {
    return this.avaliacaoService.findOne(id_usuario, id_obra);
  }

  @Post()
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacaoService.create(createAvaliacaoDto);
  }

  @Patch(':id_usuario/:id_obra')
  update(
    @Param('id_usuario') id_usuario: string,
    @Param('id_obra') id_obra: string,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto,
  ) {
    return this.avaliacaoService.update(
      id_usuario,
      id_obra,
      updateAvaliacaoDto,
    );
  }

  @Delete(':id_usuario/:id_obra')
  remove(
    @Param('id_usuario') id_usuario: string,
    @Param('id_obra') id_obra: string,
  ) {
    return this.avaliacaoService.remove(id_usuario, id_obra);
  }
}
