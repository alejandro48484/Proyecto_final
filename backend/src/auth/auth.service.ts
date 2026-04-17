import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: loginDto.correo },
      include: { empleado: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const contrasenaValida = await bcrypt.compare(loginDto.contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    return {
      mensaje: 'Inicio de sesión exitoso',
      token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        empleadoId: usuario.empleadoId,
        empleado: usuario.empleado
          ? { nombres: usuario.empleado.nombres, apellidos: usuario.empleado.apellidos }
          : null,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { correo: registerDto.correo },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const contrasenaHash = await bcrypt.hash(registerDto.contrasena, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        correo: registerDto.correo,
        contrasena: contrasenaHash,
        rol: registerDto.rol || 'EMPLEADO',
        empleadoId: registerDto.empleadoId || null,
      },
    });

    return {
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }

  async obtenerPerfil(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        empleado: {
          include: { departamento: true },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      activo: usuario.activo,
      empleado: usuario.empleado,
    };
  }
}