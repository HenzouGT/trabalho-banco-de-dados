import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateUsuarioSalvaListaDto } from './dto/usuario-salva-lista.dto';
import { UsuarioSalvaListaService } from './usuario-salva-lista.service';

@Controller('usuario_salva_lista')
export class UsuarioSalvaListaController {
  constructor(
    private readonly usuarioSalvaListaService: UsuarioSalvaListaService,
  ) {}

  @Get()
  findAll() {
    return this.usuarioSalvaListaService.findAll();
  }

  @Get(':id_usuario/:id_lista')
  findOne(
    @Param('id_usuario') id_usuario: string,
    @Param('id_lista') id_lista: string,
  ) {
    return this.usuarioSalvaListaService.findOne(id_usuario, id_lista);
  }

  @Post()
  create(@Body() createUsuarioSalvaListaDto: CreateUsuarioSalvaListaDto) {
    return this.usuarioSalvaListaService.create(createUsuarioSalvaListaDto);
  }

  @Delete(':id_usuario/:id_lista')
  remove(
    @Param('id_usuario') id_usuario: string,
    @Param('id_lista') id_lista: string,
  ) {
    return this.usuarioSalvaListaService.remove(id_usuario, id_lista);
  }
}
