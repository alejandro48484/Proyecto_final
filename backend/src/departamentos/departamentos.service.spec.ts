import { Test, TestingModule } from '@nestjs/testing';
import { DepartamentosService } from './departamentos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DepartamentosService', () => {
  let service: DepartamentosService;

  const mockPrismaService = {
    departamento: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartamentosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DepartamentosService>(DepartamentosService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería retornar lista de departamentos', async () => {
    const deptosMock = [
      { id: 1, nombre: 'Recursos Humanos', descripcion: 'Depto de RRHH', empleados: [] },
      { id: 2, nombre: 'Tecnología', descripcion: 'Depto de TI', empleados: [] },
    ];
    mockPrismaService.departamento.findMany.mockResolvedValue(deptosMock);
    const resultado = await service.obtenerTodos();
    expect(resultado).toHaveLength(2);
    expect(resultado[0].nombre).toBe('Recursos Humanos');
  });

  it('debería lanzar error si el departamento no existe', async () => {
    mockPrismaService.departamento.findUnique.mockResolvedValue(null);
    await expect(service.obtenerPorId(999)).rejects.toThrow(NotFoundException);
  });

  it('debería lanzar error al eliminar departamento con empleados asignados', async () => {
    mockPrismaService.departamento.findUnique.mockResolvedValue({
      id: 1,
      nombre: 'RRHH',
      empleados: [{ id: 1 }, { id: 2 }],
    });
    await expect(service.eliminar(1)).rejects.toThrow(ConflictException);
  });

  it('debería crear un departamento correctamente', async () => {
    mockPrismaService.departamento.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 3, nombre: 'Contabilidad', descripcion: 'Depto de Contabilidad', empleados: [] });
    mockPrismaService.departamento.create.mockResolvedValue({
      id: 3, nombre: 'Contabilidad', descripcion: 'Depto de Contabilidad',
    });
    const resultado = await service.crear({ nombre: 'Contabilidad', descripcion: 'Depto de Contabilidad' });
    expect(resultado.nombre).toBe('Contabilidad');
  });

  it('debería lanzar error al crear departamento con nombre duplicado', async () => {
    mockPrismaService.departamento.findUnique.mockResolvedValue({
      id: 1, nombre: 'Recursos Humanos',
    });
    await expect(service.crear({ nombre: 'Recursos Humanos', descripcion: '' })).rejects.toThrow(ConflictException);
  });
});