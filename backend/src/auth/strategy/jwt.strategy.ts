import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
secretOrKey: process.env.JWT_SECRET!,    });
  }

  async validate(payload: { sub: number; correo: string; rol: string }) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { empleado: true },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      empleadoId: usuario.empleadoId,
    };
  }
}