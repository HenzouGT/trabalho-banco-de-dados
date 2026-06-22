import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateListaObraDto, UpdateListaObraDto } from './dto/lista-obra.dto';
import { ListaObraService } from './lista-obra.service';

@Controller('lista_obra')
export class ListaObraController {
  constructor(private readonly listaObraService: ListaObraService) {}

  @Get()
  findAll() {
    return this.listaObraService.findAll();
  }

  @Get(':id_lista/:id_obra')
  findOne(
    @Param('id_lista') id_lista: string,
    @Param('id_obra') id_obra: string,
  ) {
    return this.listaObraService.findOne(id_lista, id_obra);
  }

  @Post()
  create(@Body() createListaObraDto: CreateListaObraDto) {
    return this.listaObraService.create(createListaObraDto);
  }

  @Patch(':id_lista/:id_obra')
  update(
    @Param('id_lista') id_lista: string,
    @Param('id_obra') id_obra: string,
    @Body() updateListaObraDto: UpdateListaObraDto,
  ) {
    return this.listaObraService.update(id_lista, id_obra, updateListaObraDto);
  }

  @Delete(':id_lista/:id_obra')
  remove(
    @Param('id_lista') id_lista: string,
    @Param('id_obra') id_obra: string,
  ) {
    return this.listaObraService.remove(id_lista, id_obra);
  }
}
