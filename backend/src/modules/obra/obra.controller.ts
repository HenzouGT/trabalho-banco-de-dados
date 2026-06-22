import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateObraDto, UpdateObraDto } from './dto/obra.dto';
import { ObraService } from './obra.service';

@Controller('obra')
export class ObraController {
  constructor(private readonly obraService: ObraService) {}

  @Get()
  findAll() {
    return this.obraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.obraService.findOne(id);
  }

  @Post()
  create(@Body() createObraDto: CreateObraDto) {
    return this.obraService.create(createObraDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateObraDto: UpdateObraDto) {
    return this.obraService.update(id, updateObraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.obraService.remove(id);
  }
}
