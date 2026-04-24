export enum RolUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GESTOR_RRHH = 'GESTOR_RRHH',
  EMPLEADO = 'EMPLEADO',
}

export enum EstadoLaboral {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  RETIRADO = 'RETIRADO',
}

export enum TipoDocumento {
  CONTRATO = 'CONTRATO',
  CERTIFICADO_ESTUDIO = 'CERTIFICADO_ESTUDIO',
  DPI = 'DPI',
  ANTECEDENTES_PENALES = 'ANTECEDENTES_PENALES',
  ANTECEDENTES_POLICIALES = 'ANTECEDENTES_POLICIALES',
  CONSTANCIA = 'CONSTANCIA',
  CARTA_RECOMENDACION = 'CARTA_RECOMENDACION',
}

export interface Departamento {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Empleado {
  id: number;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  numeroDpi: string;
  salarioBase: number;
  cargo: string;
  departamentoId: number;
  departamento?: Departamento;
  estadoLaboral: EstadoLaboral;
}

export interface Usuario {
  id: number;
  correo: string;
  rol: RolUsuario;
  empleadoId: number | null;
  empleado: Empleado | null;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
}

export interface InformacionAcademica {
  id: number;
  empleadoId: number;
  tituloAcademico: string;
  certificacion: string | null;
  institucionEducativa: string;
  fechaGraduacion: string | null;
}

export interface Documento {
  id: number;
  empleadoId: number;
  tipoDocumento: TipoDocumento;
  nombreOriginal: string;
  rutaArchivo: string;
  fechaCarga: string;
  subidoPorUsuarioId: number;
}

export interface PeriodoNomina {
  id: number;
  tipoPeriodo: 'MENSUAL' | 'QUINCENAL';
  fechaInicio: string;
  fechaFin: string;
  estado: 'ABIERTO' | 'CERRADO';
}

export interface DetalleNomina {
  id: number;
  periodoNominaId: number;
  empleadoId: number;
  empleado?: Empleado;
  salarioBase: number;
  horasExtra: number;
  bonificaciones: number;
  deducciones: number;
  igss: number;
  irtra: number;
  salarioNeto: number;
}