import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { AcademicoModule } from './academico/academico.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { NominaModule } from './nomina/nomina.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [PrismaModule, AuthModule, EmpleadosModule, AcademicoModule, ExpedienteModule, NominaModule, ReportesModule],
})
export class AppModule {}