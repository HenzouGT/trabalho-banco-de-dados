import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { SupabaseCrudService } from '../../common/supabase-crud.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const scryptAsync = promisify(scrypt);
const PASSWORD_HASH_PREFIX = 's1';
const PASSWORD_KEY_LENGTH = 24;

type UsuarioRecord = {
  id: string;
  nome: string;
  email: string;
  hash_senha: string;
  bio?: string | null;
  avatar?: string | null;
};

type UsuarioPublico = Omit<UsuarioRecord, 'hash_senha'>;

@Injectable()
export class UsuarioService extends SupabaseCrudService {
  constructor(supabaseService: SupabaseService) {
    super(supabaseService);
  }

  async findAll() {
    const usuarios = (await this.findAllFrom('usuario', 'nome')) as
      | UsuarioRecord[]
      | null;

    return (usuarios ?? []).map((usuario) => this.toUsuarioPublico(usuario));
  }

  async findOne(id: string) {
    const usuario = (await this.findOneFrom(
      'usuario',
      { id },
      'Usuario nao encontrado',
    )) as UsuarioRecord;

    return this.toUsuarioPublico(usuario);
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { senha, ...usuarioDto } = createUsuarioDto;

    if (!senha) {
      throw new BadRequestException('Senha obrigatoria');
    }

    const usuario = (await this.createIn('usuario', {
      id: randomUUID(),
      ...usuarioDto,
      email: this.normalizarEmail(usuarioDto.email),
      hash_senha: await this.hashSenha(senha),
    })) as UsuarioRecord;

    return this.toUsuarioPublico(usuario);
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const { senha, ...usuarioDto } = updateUsuarioDto;
    const payload: Record<string, unknown> = { ...usuarioDto };

    if (usuarioDto.email !== undefined) {
      payload.email = this.normalizarEmail(usuarioDto.email);
    }

    if (senha !== undefined) {
      if (!senha) {
        throw new BadRequestException('Senha obrigatoria');
      }

      payload.hash_senha = await this.hashSenha(senha);
    }

    const usuario = (await this.updateIn(
      'usuario',
      { id },
      payload,
      'Usuario nao encontrado',
    )) as UsuarioRecord;

    return this.toUsuarioPublico(usuario);
  }

  async remove(id: string) {
    const usuario = (await this.removeFrom(
      'usuario',
      { id },
      'Usuario nao encontrado',
    )) as UsuarioRecord;

    return this.toUsuarioPublico(usuario);
  }

  async login(loginUsuarioDto: LoginUsuarioDto) {
    const { email, senha } = loginUsuarioDto;

    if (!email || !senha) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    const resultadoLogin = (await this.supabaseService
      .getClient()
      .from('usuario')
      .select('*')
      .eq('email', this.normalizarEmail(email))
      .maybeSingle()) as {
      data: UsuarioRecord | null;
      error: { message: string } | null;
    };

    if (resultadoLogin.error) {
      throw new BadRequestException(resultadoLogin.error.message);
    }

    const usuario = resultadoLogin.data;
    const senhaValida =
      usuario && (await this.verificarSenha(senha, usuario.hash_senha));

    if (!usuario || !senhaValida) {
      throw new UnauthorizedException('Email ou senha invalidos');
    }

    return this.toUsuarioPublico(usuario);
  }

  private async hashSenha(senha: string) {
    const salt = randomBytes(16);
    const hash = (await scryptAsync(
      senha,
      salt,
      PASSWORD_KEY_LENGTH,
    )) as Buffer;

    return [
      PASSWORD_HASH_PREFIX,
      salt.toString('base64url'),
      hash.toString('base64url'),
    ].join('$');
  }

  private normalizarEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async verificarSenha(senha: string, hashArmazenado: string) {
    const [prefix, salt, hash] = hashArmazenado.split('$');

    if (prefix !== PASSWORD_HASH_PREFIX || !salt || !hash) {
      return senha === hashArmazenado;
    }

    const hashBuffer = Buffer.from(hash, 'base64url');

    if (hashBuffer.length === 0) {
      return false;
    }

    const hashSenha = (await scryptAsync(
      senha,
      Buffer.from(salt, 'base64url'),
      hashBuffer.length,
    )) as Buffer;

    return (
      hashBuffer.length === hashSenha.length &&
      timingSafeEqual(hashBuffer, hashSenha)
    );
  }

  private toUsuarioPublico(usuario: UsuarioRecord): UsuarioPublico {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      bio: usuario.bio,
      avatar: usuario.avatar,
    };
  }
}
