import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ArteService } from './arte.service';
import { CreateArteDto, UpdateArteDto } from './dto/arte.dto';

@Controller('arte')
export class ArteController {
  constructor(private readonly arteService: ArteService) {}

  @Get()
  findAll() {
    return this.arteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arteService.findOne(id);
  }

  @Post()
  create(@Body() createArteDto: CreateArteDto) {
    return this.arteService.create(createArteDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArteDto: UpdateArteDto) {
    return this.arteService.update(id, updateArteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.arteService.remove(id);
  }
}
