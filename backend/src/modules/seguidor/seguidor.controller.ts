import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSeguidorDto, UpdateSeguidorDto } from './dto/seguidor.dto';
import { SeguidorService } from './seguidor.service';

@Controller('seguidor')
export class SeguidorController {
  constructor(private readonly seguidorService: SeguidorService) {}

  @Get()
  findAll() {
    return this.seguidorService.findAll();
  }

  @Get(':id_seguidor/:id_seguido')
  findOne(
    @Param('id_seguidor') id_seguidor: string,
    @Param('id_seguido') id_seguido: string,
  ) {
    return this.seguidorService.findOne(id_seguidor, id_seguido);
  }

  @Post()
  create(@Body() createSeguidorDto: CreateSeguidorDto) {
    return this.seguidorService.create(createSeguidorDto);
  }

  @Patch(':id_seguidor/:id_seguido')
  update(
    @Param('id_seguidor') id_seguidor: string,
    @Param('id_seguido') id_seguido: string,
    @Body() updateSeguidorDto: UpdateSeguidorDto,
  ) {
    return this.seguidorService.update(
      id_seguidor,
      id_seguido,
      updateSeguidorDto,
    );
  }

  @Delete(':id_seguidor/:id_seguido')
  remove(
    @Param('id_seguidor') id_seguidor: string,
    @Param('id_seguido') id_seguido: string,
  ) {
    return this.seguidorService.remove(id_seguidor, id_seguido);
  }
}
