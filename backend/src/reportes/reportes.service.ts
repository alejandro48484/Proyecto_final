/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async reporteNomina(periodoId: number) {
    const periodo = await this.prisma.periodoNomina.findUnique({
      where: { id: periodoId },
      include: {
        detalles: {
          include: {
            empleado: {
              include: { departamento: true },
            },
          },
        },
      },
    });

    if (!periodo) {
      return { error: 'Período no encontrado' };
    }

    const totalBruto = periodo.detalles.reduce(
      (sum: number, d: any) => sum + Number(d.salarioBase) + Number(d.horasExtra) + Number(d.bonificaciones),
      0,
    );
    const totalDeducciones = periodo.detalles.reduce(
      (sum: number, d: any) => sum + Number(d.deducciones) + Number(d.igss) + Number(d.irtra),
      0,
    );
    const totalNeto = periodo.detalles.reduce(
      (sum: number, d: any) => sum + Number(d.salarioNeto),
      0,
    );

    return {
      periodo: {
        id: periodo.id,
        tipo: periodo.tipoPeriodo,
        fechaInicio: periodo.fechaInicio,
        fechaFin: periodo.fechaFin,
        estado: periodo.estado,
      },
      resumen: {
        totalEmpleados: periodo.detalles.length,
        totalBruto: Math.round(totalBruto * 100) / 100,
        totalDeducciones: Math.round(totalDeducciones * 100) / 100,
        totalNeto: Math.round(totalNeto * 100) / 100,
      },
      detalles: periodo.detalles.map((d: any) => ({
        empleado: `${d.empleado.nombres} ${d.empleado.apellidos}`,
        departamento: d.empleado.departamento?.nombre || 'Sin departamento',
        salarioBase: Number(d.salarioBase),
        horasExtra: Number(d.horasExtra),
        bonificaciones: Number(d.bonificaciones),
        deducciones: Number(d.deducciones),
        igss: Number(d.igss),
        irtra: Number(d.irtra),
        salarioNeto: Number(d.salarioNeto),
      })),
    };
  }

  async reporteExpedientes() {
    const departamentos = await this.prisma.departamento.findMany({
      include: {
        empleados: {
          where: { estadoLaboral: 'ACTIVO' },
        },
      },
    });

    const documentosRequeridos = await this.prisma.documentoRequerido.findMany({
      where: { esObligatorio: true },
    });

    const tiposRequeridos = documentosRequeridos.map((d: any) => d.tipoDocumento);
    const resultado: any[] = [];

    for (const depto of departamentos) {
      const empleadosInfo: any[] = [];

      for (const emp of depto.empleados) {
        const docs = await this.prisma.documento.findMany({
          where: { empleadoId: emp.id },
        });

        const tiposSubidos = docs.map((d: any) => d.tipoDocumento);
        const faltantes = tiposRequeridos.filter((t: any) => !tiposSubidos.includes(t));

        let estado: string;
        if (faltantes.length === 0) {
          estado = 'COMPLETO';
        } else if (tiposSubidos.length === 0) {
          estado = 'INCOMPLETO';
        } else {
          estado = 'EN_PROCESO';
        }

        empleadosInfo.push({
          id: emp.id,
          nombre: `${emp.nombres} ${emp.apellidos}`,
          estado,
          documentosFaltantes: faltantes,
          totalSubidos: tiposSubidos.length,
          totalRequeridos: tiposRequeridos.length,
        });
      }

      resultado.push({
        departamento: depto.nombre,
        totalEmpleados: depto.empleados.length,
        completos: empleadosInfo.filter((e: any) => e.estado === 'COMPLETO').length,
        enProceso: empleadosInfo.filter((e: any) => e.estado === 'EN_PROCESO').length,
        incompletos: empleadosInfo.filter((e: any) => e.estado === 'INCOMPLETO').length,
        empleados: empleadosInfo,
      });
    }

    return resultado;
  }

  async reporteAcademico() {
    const empleados = await this.prisma.empleado.findMany({
      where: { estadoLaboral: 'ACTIVO' },
      include: {
        informacionAcademica: true,
        departamento: true,
      },
      orderBy: { apellidos: 'asc' },
    });

    return empleados.map((emp: any) => ({
      id: emp.id,
      nombre: `${emp.nombres} ${emp.apellidos}`,
      departamento: emp.departamento?.nombre || 'Sin departamento',
      cargo: emp.cargo,
      totalTitulos: emp.informacionAcademica.length,
      titulos: emp.informacionAcademica.map((a: any) => ({
        titulo: a.tituloAcademico,
        certificacion: a.certificacion,
        institucion: a.institucionEducativa,
        fechaGraduacion: a.fechaGraduacion,
      })),
    }));
  }

  async reporteCumplimiento() {
    const empleados = await this.prisma.empleado.findMany({
      where: { estadoLaboral: 'ACTIVO' },
      include: {
        departamento: true,
        informacionAcademica: true,
      },
    });

    const documentosRequeridos = await this.prisma.documentoRequerido.findMany({
      where: { esObligatorio: true },
    });

    const tiposRequeridos = documentosRequeridos.map((d: any) => d.tipoDocumento);
    const resultado: any[] = [];

    for (const emp of empleados) {
      const docs = await this.prisma.documento.findMany({
        where: { empleadoId: emp.id },
      });

      const tiposSubidos = docs.map((d: any) => d.tipoDocumento);
      const faltantes = tiposRequeridos.filter((t: any) => !tiposSubidos.includes(t));

      resultado.push({
        id: emp.id,
        nombre: `${emp.nombres} ${emp.apellidos}`,
        departamento: emp.departamento?.nombre || 'Sin departamento',
        cargo: emp.cargo,
        expedienteCompleto: faltantes.length === 0,
        documentosFaltantes: faltantes,
        tieneTituloAcademico: emp.informacionAcademica.length > 0,
        cumpleRequisitos: faltantes.length === 0 && emp.informacionAcademica.length > 0,
      });
    }

    return {
      totalEmpleados: resultado.length,
      cumplen: resultado.filter((r: any) => r.cumpleRequisitos).length,
      noCumplen: resultado.filter((r: any) => !r.cumpleRequisitos).length,
      porcentajeCumplimiento: Math.round(
        (resultado.filter((r: any) => r.cumpleRequisitos).length / resultado.length) * 100,
      ),
      empleados: resultado,
    };
  }
  async reporteNominaPorDepartamento(periodoId: number, departamentoId?: number) {
  const periodo = await this.prisma.periodoNomina.findUnique({
    where: { id: periodoId },
    include: {
      detalles: {
        include: {
          empleado: {
            include: { departamento: true },
          },
        },
      },
    },
  });

  if (!periodo) {
    return { error: 'Período no encontrado' };
  }

  let detalles = periodo.detalles;

  if (departamentoId) {
    detalles = detalles.filter((d: any) => d.empleado.departamentoId === departamentoId);
  }

  const porDepartamento: any = {};

  for (const d of detalles) {
    const nombreDepto = d.empleado.departamento?.nombre || 'Sin departamento';
    if (!porDepartamento[nombreDepto]) {
      porDepartamento[nombreDepto] = {
        departamento: nombreDepto,
        empleados: [],
        totalBruto: 0,
        totalDeducciones: 0,
        totalNeto: 0,
      };
    }

    const bruto = Number(d.salarioBase) + Number(d.horasExtra) + Number(d.bonificaciones);
    const deducciones = Number(d.deducciones) + Number(d.igss) + Number(d.irtra);
    const neto = Number(d.salarioNeto);

    porDepartamento[nombreDepto].empleados.push({
      empleado: `${d.empleado.nombres} ${d.empleado.apellidos}`,
      salarioBase: Number(d.salarioBase),
      horasExtra: Number(d.horasExtra),
      bonificaciones: Number(d.bonificaciones),
      deducciones: Number(d.deducciones),
      igss: Number(d.igss),
      irtra: Number(d.irtra),
      salarioNeto: neto,
    });

    porDepartamento[nombreDepto].totalBruto += bruto;
    porDepartamento[nombreDepto].totalDeducciones += deducciones;
    porDepartamento[nombreDepto].totalNeto += neto;
  }

  const resultado = Object.values(porDepartamento).map((d: any) => ({
    ...d,
    totalBruto: Math.round(d.totalBruto * 100) / 100,
    totalDeducciones: Math.round(d.totalDeducciones * 100) / 100,
    totalNeto: Math.round(d.totalNeto * 100) / 100,
  }));

  return {
    periodo: {
      id: periodo.id,
      tipo: periodo.tipoPeriodo,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      estado: periodo.estado,
    },
    filtradoPorDepartamento: departamentoId ? true : false,
    totalEmpleados: detalles.length,
    reportePorDepartamento: resultado,
  };
}

async reporteNominaVoucherEmpleado(periodoId: number, empleadoId: number) {
  const detalle = await this.prisma.detalleNomina.findUnique({
    where: {
      periodoNominaId_empleadoId: {
        periodoNominaId: periodoId,
        empleadoId: empleadoId,
      },
    },
    include: {
      empleado: {
        include: { departamento: true },
      },
      periodoNomina: true,
      ajustes: {
        include: {
          ajustadoPorUsuario: { select: { correo: true } },
        },
        orderBy: { fechaAjuste: 'desc' },
      },
    },
  });

  if (!detalle) {
    return { error: 'No se encontró un detalle de nómina para ese empleado en ese período' };
  }

  const bruto = Number(detalle.salarioBase) + Number(detalle.horasExtra) + Number(detalle.bonificaciones);
  const deducciones = Number(detalle.deducciones) + Number(detalle.igss) + Number(detalle.irtra);

  return {
    voucher: {
      periodo: {
        id: detalle.periodoNomina.id,
        tipo: detalle.periodoNomina.tipoPeriodo,
        fechaInicio: detalle.periodoNomina.fechaInicio,
        fechaFin: detalle.periodoNomina.fechaFin,
        estado: detalle.periodoNomina.estado,
      },
      empleado: {
        id: detalle.empleado.id,
        nombre: `${detalle.empleado.nombres} ${detalle.empleado.apellidos}`,
        cargo: detalle.empleado.cargo,
        departamento: detalle.empleado.departamento?.nombre || 'Sin departamento',
        dpi: detalle.empleado.numeroDpi,
      },
      desglose: {
        salarioBase: Number(detalle.salarioBase),
        horasExtra: Number(detalle.horasExtra),
        bonificaciones: Number(detalle.bonificaciones),
        totalBruto: Math.round(bruto * 100) / 100,
        deducciones: Number(detalle.deducciones),
        igss: Number(detalle.igss),
        irtra: Number(detalle.irtra),
        totalDeducciones: Math.round(deducciones * 100) / 100,
        salarioNeto: Number(detalle.salarioNeto),
      },
      ajustes: detalle.ajustes.map((a: any) => ({
        campo: a.campo,
        valorAnterior: Number(a.valorAnterior),
        valorNuevo: Number(a.valorNuevo),
        motivo: a.motivo,
        fecha: a.fechaAjuste,
        realizadoPor: a.ajustadoPorUsuario.correo,
      })),
    },
  };
}
}