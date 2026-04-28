export type EstadoFuncionario = string

export type EstadoContrato = 'Vigente' | 'Por vencer' | 'Vencido' | 'Rescindido'

export type EstadoAsistencia = 'Presente' | 'Falta' | 'Licencia'

export interface Dependencia {
  id: string
  nombre: string
}

export interface Cargo {
  id: string
  nombre: string
  dependenciaId: string
}

export interface TrabajoAnterior {
  id: string
  empresa: string
  periodo: string
  seccion: string
  cargo: string
}

export interface Funcionario {
  id: string
  ci: string
  nombres: string
  apellidos: string
  genero: string
  fechaNacimiento?: string
  paisNacimiento?: string
  departamentoNacimiento?: string
  estadoCivil?: string
  dependenciaId: string
  cargoId: string
  fechaIngreso: string
  regimenLaboral: string
  estado: EstadoFuncionario
  motivoBaja?: string
  inasistencias: number
  telefono?: string
  email?: string
  otroContacto?: string
  calle?: string
  entreCalles?: string
  zona?: string
  observaciones?: string
  educacionPrimaria?: string
  educacionSecundaria?: string
  educacionBachillerato?: string
  educacionTerciaria?: string
  otrasCapacitaciones?: string
  trabajosAnteriores: TrabajoAnterior[]
}

export interface Contrato {
  id: string
  funcionarioId: string
  tipo: 'Zafral' | 'Temporal' | 'Suplencia'
  fechaInicio: string
  fechaFin: string
  estado: EstadoContrato
  sueldoNominal: number
  observaciones?: string
  tienePdf?: boolean
  documentoBase64?: string
}

export interface Asistencia {
  id: string
  funcionarioId: string
  fecha: string
  estado: EstadoAsistencia
  observaciones?: string
}

export interface DocumentoFuncionario {
  id: string
  funcionarioId: string
  tipo: 'CI' | 'Contrato' | 'Certificado Médico' | 'Otro'
  nombreArchivo: string
  fechaCarga: string
}

export interface DashboardResumen {
  totalFuncionarios: number
  zafralesActivos: number
  contratosPorVencer: number
  inasistenciasMes: number
}

export interface FuncionarioFilters {
  search?: string
  estado?: string
  dependenciaId?: string
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
}

export interface CreateFuncionarioInput extends Omit<Funcionario, 'id' | 'trabajosAnteriores'> {
  trabajosAnteriores?: TrabajoAnterior[]
}

export type UpdateFuncionarioInput = Partial<CreateFuncionarioInput>

export type CreateContratoInput = Omit<Contrato, 'id'>

export type UpdateContratoInput = Partial<CreateContratoInput>

// ---------------------------------------------------------------------------
// Funcionarios Zafrales
// ---------------------------------------------------------------------------

export type TipoZafral = string

export type EstadoFuncionarioZafral = string

export interface Tarea {
  id: string
  nombre: string
  dependenciaId: string
}

export interface FuncionarioZafral {
  id: string
  ci: string
  nombres: string
  apellidos: string
  genero: string
  fechaNacimiento?: string
  paisNacimiento?: string
  departamentoNacimiento?: string
  estadoCivil?: string
  dependenciaId: string
  tareaId: string
  tipoZafral: string
  fechaIngreso: string
  regimenLaboral: string
  estado: string
  motivoBaja?: string
  inasistencias: number
  telefono?: string
  email?: string
  otroContacto?: string
  calle?: string
  entreCalles?: string
  zona?: string
  observaciones?: string
  educacionPrimaria?: string
  educacionSecundaria?: string
  educacionBachillerato?: string
  educacionTerciaria?: string
  otrasCapacitaciones?: string
}

export interface FuncionarioZafralFilters {
  search?: string
  estado?: string
  tipoZafral?: string
  dependenciaId?: string
  page: number
  pageSize: number
}

export type CreateFuncionarioZafralInput = Omit<FuncionarioZafral, 'id'>

export type UpdateFuncionarioZafralInput = Partial<CreateFuncionarioZafralInput>

// ---------------------------------------------------------------------------
// Opciones dinámicas de catálogos
// ---------------------------------------------------------------------------

export interface HrOpciones {
  regimenesLaborales: string[]
  tiposZafral: string[]
  generos: string[]
  estadosCiviles: string[]
  estadosEducacion: string[]
  estadosFuncionario: string[]
  estadosZafral: string[]
}
