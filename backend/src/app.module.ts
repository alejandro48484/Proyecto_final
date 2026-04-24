import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { AcademicoModule } from './academico/academico.module';
import { NominaModule } from './nomina/nomina.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmpleadosModule,
    AcademicoModule,
    NominaModule,
    DepartamentosModule,
    ExpedienteModule,
    ReportesModule,
  ],
})
export class AppModule {}