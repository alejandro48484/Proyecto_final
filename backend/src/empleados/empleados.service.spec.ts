import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosService } from './empleados.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EmpleadosService', () => {
  let service: EmpleadosService;

  const mockPrismaService = {
    empleado: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    registroAuditoria: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpleadosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmpleadosService>(EmpleadosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería retornar lista de empleados', async () => {
    const empleadosMock = [
      { id: 1, nombres: 'Juan', apellidos: 'Pérez', numeroDpi: '1234567890123' },
      { id: 2, nombres: 'María', apellidos: 'González', numeroDpi: '9876543210987' },
    ];
    mockPrismaService.empleado.findMany.mockResolvedValue(empleadosMock);
    const resultado = await service.obtenerTodos();
    expect(resultado).toHaveLength(2);
    expect(resultado[0].nombres).toBe('Juan');
  });

  it('debería lanzar error si el empleado no existe', async () => {
    mockPrismaService.empleado.findUnique.mockResolvedValue(null);
    await expect(service.obtenerPorId(999)).rejects.toThrow(NotFoundException);
  });

  it('debería retornar un empleado por ID', async () => {
    const empleadoMock = {
      id: 1, nombres: 'Juan', apellidos: 'Pérez', numeroDpi: '1234567890123',
    };
    mockPrismaService.empleado.findUnique.mockResolvedValue(empleadoMock);
    const resultado = await service.obtenerPorId(1);
    expect(resultado.id).toBe(1);
    expect(resultado.nombres).toBe('Juan');
  });
});