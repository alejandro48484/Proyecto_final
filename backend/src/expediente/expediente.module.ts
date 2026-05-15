import { Module } from '@nestjs/common';
import { ExpedienteController } from './expediente.controller';
import { ExpedienteService } from './expediente.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
})
export class ExpedienteModule {}