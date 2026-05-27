import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('token_de_prueba'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería lanzar error si el usuario no existe', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ correo: 'noexiste@test.com', contrasena: '123456' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debería lanzar error si la contraseña es incorrecta', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      id: 1,
      correo: 'admin@empresa.gt',
      contrasena: '$2b$10$hashIncorrecto',
      rol: 'ADMINISTRADOR',
      activo: true,
    });
    await expect(
      service.login({ correo: 'admin@empresa.gt', contrasena: 'wrongpassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});