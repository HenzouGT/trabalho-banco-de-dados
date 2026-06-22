import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateWatchlistDto, UpdateWatchlistDto } from './dto/watchlist.dto';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  findAll() {
    return this.watchlistService.findAll();
  }

  @Get(':id_usuario/:id_obra')
  findOne(
    @Param('id_usuario') id_usuario: string,
    @Param('id_obra') id_obra: string,
  ) {
    return this.watchlistService.findOne(id_usuario, id_obra);
  }

  @Post()
  create(@Body() createWatchlistDto: CreateWatchlistDto) {
    return this.watchlistService.create(createWatchlistDto);
  }

  @Patch(':id_usuario/:id_obra')
  update(
    @Param('id_usuario') id_usuario: string,
    @Param('id_obra') id_obra: string,
    @Body() updateWatchlistDto: UpdateWatchlistDto,
  ) {
    return this.watchlistService.update(
      id_usuario,
      id_obra,
      updateWatchlistDto,
    );
  }

  @Delete(':id_usuario/:id_obra')
  remove(
    @Param('id_usuario') id_usuario: string,
    @Param('id_obra') id_obra: string,
  ) {
    return this.watchlistService.remove(id_usuario, id_obra);
  }
}
