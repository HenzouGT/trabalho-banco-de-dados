import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateUsuarioCurteArteDto } from './dto/usuario-curte-arte.dto';
import { UsuarioCurteArteService } from './usuario-curte-arte.service';

@Controller('usuario_curte_arte')
export class UsuarioCurteArteController {
  constructor(
    private readonly usuarioCurteArteService: UsuarioCurteArteService,
  ) {}

  @Get()
  findAll() {
    return this.usuarioCurteArteService.findAll();
  }

  @Get(':id_usuario/:id_arte')
  findOne(
    @Param('id_usuario') id_usuario: string,
    @Param('id_arte') id_arte: string,
  ) {
    return this.usuarioCurteArteService.findOne(id_usuario, id_arte);
  }

  @Post()
  create(@Body() createUsuarioCurteArteDto: CreateUsuarioCurteArteDto) {
    return this.usuarioCurteArteService.create(createUsuarioCurteArteDto);
  }

  @Delete(':id_usuario/:id_arte')
  remove(
    @Param('id_usuario') id_usuario: string,
    @Param('id_arte') id_arte: string,
  ) {
    return this.usuarioCurteArteService.remove(id_usuario, id_arte);
  }
}
