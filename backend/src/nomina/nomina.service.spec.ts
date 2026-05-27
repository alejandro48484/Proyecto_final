import { Test, TestingModule } from '@nestjs/testing';
import { NominaService } from './nomina.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('NominaService', () => {
  let service: NominaService;

  const mockPrismaService = {
    periodoNomina: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    detalleNomina: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    empleado: {
      findUnique: jest.fn(),
    },
    ajusteNomina: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NominaService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NominaService>(NominaService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería crear un período mensual correctamente', async () => {
    mockPrismaService.periodoNomina.findFirst.mockResolvedValue(null);
    mockPrismaService.periodoNomina.create.mockResolvedValue({
      id: 1, tipoPeriodo: 'MENSUAL', estado: 'ABIERTO',
      fechaInicio: new Date('2026-05-01'),
      fechaFin: new Date('2026-05-31'),
    });
    const resultado = await service.crearPeriodo({
      tipoPeriodo: 'MENSUAL', mes: 5, anio: 2026,
    });
    expect(resultado.tipoPeriodo).toBe('MENSUAL');
    expect(resultado.estado).toBe('ABIERTO');
  });

  it('debería lanzar error si el período ya existe', async () => {
    mockPrismaService.periodoNomina.findFirst.mockResolvedValue({
      id: 1, tipoPeriodo: 'MENSUAL', estado: 'ABIERTO',
    });
    await expect(
      service.crearPeriodo({ tipoPeriodo: 'MENSUAL', mes: 5, anio: 2026 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debería lanzar error si el período no existe', async () => {
    mockPrismaService.periodoNomina.findUnique.mockResolvedValue(null);
    await expect(service.obtenerPeriodoPorId(999)).rejects.toThrow(NotFoundException);
  });

  it('debería lanzar error al agregar quincena sin especificar número', async () => {
    await expect(
      service.crearPeriodo({ tipoPeriodo: 'QUINCENAL', mes: 5, anio: 2026 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debería cerrar un período abierto', async () => {
    mockPrismaService.periodoNomina.findUnique.mockResolvedValue({
      id: 1, tipoPeriodo: 'MENSUAL', estado: 'ABIERTO', detalles: [],
    });
    mockPrismaService.periodoNomina.update.mockResolvedValue({
      id: 1, estado: 'CERRADO',
    });
    const resultado = await service.cerrarPeriodo(1);
    expect(resultado.estado).toBe('CERRADO');
  });
});