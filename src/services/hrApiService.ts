import axios from 'axios'
import type {
  Asistencia,
  Cargo,
  Contrato,
  CreateContratoInput,
  CreateFuncionarioInput,
  CreateFuncionarioZafralInput,
  DashboardResumen,
  Dependencia,
  DocumentoFuncionario,
  Funcionario,
  FuncionarioFilters,
  FuncionarioZafral,
  FuncionarioZafralFilters,
  HrOpciones,
  PaginatedResult,
  Tarea,
  UpdateContratoInput,
  UpdateFuncionarioInput,
  UpdateFuncionarioZafralInput,
} from '../types/hr'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const api = axios.create({ baseURL: `${API_BASE}/hr` })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_token_expiry')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const hrApiService = {
  getDependencias: async (): Promise<Dependencia[]> => {
    const { data } = await api.get<Dependencia[]>('/dependencias')
    return data
  },

  getOpciones: async (): Promise<HrOpciones> => {
    const { data } = await api.get<HrOpciones>('/opciones')
    return data
  },

  getCargos: async (): Promise<Cargo[]> => {
    const { data } = await api.get<Cargo[]>('/cargos')
    return data
  },

  getDashboardResumen: async (): Promise<DashboardResumen> => {
    const { data } = await api.get<DashboardResumen>('/dashboard')
    return data
  },

  getFuncionarios: async (filters: FuncionarioFilters): Promise<PaginatedResult<Funcionario>> => {
    const params: Record<string, string | number> = {
      page: filters.page,
      pageSize: filters.pageSize,
    }
    if (filters.search) params.search = filters.search
    if (filters.estado) params.estado = filters.estado
    if (filters.dependenciaId) params.dependenciaId = filters.dependenciaId

    const { data } = await api.get<PaginatedResult<Funcionario>>('/funcionarios', { params })
    return data
  },

  getFuncionarioById: async (id: string): Promise<Funcionario | null> => {
    try {
      const { data } = await api.get<Funcionario>(`/funcionarios/${id}`)
      return data
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null
      throw err
    }
  },

  createFuncionario: async (payload: CreateFuncionarioInput): Promise<Funcionario> => {
    const { data } = await api.post<Funcionario>('/funcionarios', payload)
    return data
  },

  updateFuncionario: async (id: string, payload: UpdateFuncionarioInput): Promise<Funcionario> => {
    const { data } = await api.put<Funcionario>(`/funcionarios/${id}`, payload)
    return data
  },

  deleteFuncionario: async (id: string): Promise<void> => {
    await api.delete(`/funcionarios/${id}`)
  },

  getContratos: async (): Promise<Contrato[]> => {
    const { data } = await api.get<Contrato[]>('/contratos')
    return data
  },

  getContratosByFuncionario: async (funcionarioId: string): Promise<Contrato[]> => {
    const { data } = await api.get<Contrato[]>(`/contratos/funcionario/${funcionarioId}`)
    return data
  },

  getContratoPdf: async (id: string): Promise<string> => {
    const { data } = await api.get<{ url: string }>(`/contratos/${id}/pdf`)
    return data.url
  },

  deleteContratoPdf: async (id: string): Promise<void> => {
    await api.delete(`/contratos/${id}/pdf`)
  },

  createContrato: async (payload: CreateContratoInput): Promise<Contrato> => {
    const { data } = await api.post<Contrato>('/contratos', payload)
    return data
  },

  updateContrato: async (id: string, payload: UpdateContratoInput): Promise<Contrato> => {
    const { data } = await api.put<Contrato>(`/contratos/${id}`, payload)
    return data
  },

  deleteContrato: async (id: string): Promise<void> => {
    await api.delete(`/contratos/${id}`)
  },

  getAsistencias: async (): Promise<Asistencia[]> => {
    const { data } = await api.get<Asistencia[]>('/asistencias')
    return data
  },

  getAsistenciasByFuncionario: async (funcionarioId: string): Promise<Asistencia[]> => {
    const { data } = await api.get<Asistencia[]>(`/asistencias/funcionario/${funcionarioId}`)
    return data
  },

  // Documents are not yet persisted in the backend — return empty for now
  getDocumentosByFuncionario: async (_funcionarioId: string): Promise<DocumentoFuncionario[]> => {
    return []
  },

  // ---------------------------------------------------------------------------
  // Tareas
  // ---------------------------------------------------------------------------

  getTareas: async (): Promise<Tarea[]> => {
    const { data } = await api.get<Tarea[]>('/tareas')
    return data
  },

  // ---------------------------------------------------------------------------
  // Funcionarios Zafrales
  // ---------------------------------------------------------------------------

  getFuncionariosZafrales: async (
    filters: FuncionarioZafralFilters,
  ): Promise<PaginatedResult<FuncionarioZafral>> => {
    const params: Record<string, string | number> = {
      page: filters.page,
      pageSize: filters.pageSize,
    }
    if (filters.search) params.search = filters.search
    if (filters.estado) params.estado = filters.estado
    if (filters.tipoZafral) params.tipoZafral = filters.tipoZafral
    if (filters.dependenciaId) params.dependenciaId = filters.dependenciaId

    const { data } = await api.get<PaginatedResult<FuncionarioZafral>>('/funcionarios-zafrales', {
      params,
    })
    return data
  },

  getFuncionarioZafralById: async (id: string): Promise<FuncionarioZafral | null> => {
    try {
      const { data } = await api.get<FuncionarioZafral>(`/funcionarios-zafrales/${id}`)
      return data
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null
      throw err
    }
  },

  createFuncionarioZafral: async (
    payload: CreateFuncionarioZafralInput,
  ): Promise<FuncionarioZafral> => {
    const { data } = await api.post<FuncionarioZafral>('/funcionarios-zafrales', payload)
    return data
  },

  updateFuncionarioZafral: async (
    id: string,
    payload: UpdateFuncionarioZafralInput,
  ): Promise<FuncionarioZafral> => {
    const { data } = await api.put<FuncionarioZafral>(`/funcionarios-zafrales/${id}`, payload)
    return data
  },

  deleteFuncionarioZafral: async (id: string): Promise<void> => {
    await api.delete(`/funcionarios-zafrales/${id}`)
  },
}
