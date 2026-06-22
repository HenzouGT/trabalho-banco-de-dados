import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateGeneroDto, UpdateGeneroDto } from './dto/genero.dto';
import { GeneroService } from './genero.service';

@Controller('genero')
export class GeneroController {
  constructor(private readonly generoService: GeneroService) {}

  @Get()
  findAll() {
    return this.generoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.generoService.findOne(id);
  }

  @Post()
  create(@Body() createGeneroDto: CreateGeneroDto) {
    return this.generoService.create(createGeneroDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGeneroDto: UpdateGeneroDto) {
    return this.generoService.update(id, updateGeneroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.generoService.remove(id);
  }
}
