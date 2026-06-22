import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateListaDto, UpdateListaDto } from './dto/lista.dto';
import { ListaService } from './lista.service';

@Controller('lista')
export class ListaController {
  constructor(private readonly listaService: ListaService) {}

  @Get()
  findAll() {
    return this.listaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listaService.findOne(id);
  }

  @Post()
  create(@Body() createListaDto: CreateListaDto) {
    return this.listaService.create(createListaDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListaDto: UpdateListaDto) {
    return this.listaService.update(id, updateListaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listaService.remove(id);
  }
}
