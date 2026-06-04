import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase
      .from('usuario')
      .select('*')
      .order('nome');

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('usuario')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return data;
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = {
      id: randomUUID(),
      ...createUsuarioDto,
    };

    const { data, error } = await this.supabase
      .from('usuario')
      .insert(usuario)
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const { data, error } = await this.supabase
      .from('usuario')
      .update(updateUsuarioDto)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return data;
  }

  async remove(id: string) {
    const { data, error } = await this.supabase
      .from('usuario')
      .delete()
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return data;
  }

  private get supabase() {
    return this.supabaseService.getClient();
  }
}
