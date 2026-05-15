import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async subirArchivo(
    bucket: string,
    ruta: string,
    archivo: Buffer,
    tipoMime: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(ruta, archivo, {
        contentType: tipoMime,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error al subir archivo: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(ruta);

    return data.publicUrl;
  }

  async eliminarArchivo(bucket: string, ruta: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([ruta]);

    if (error) {
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }
}