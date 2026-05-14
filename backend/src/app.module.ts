import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 200,
      },
    ]),
    PrismaModule,
    AuthModule,
    EmpleadosModule,
    AcademicoModule,
    NominaModule,
    DepartamentosModule,
    ExpedienteModule,
    ReportesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}