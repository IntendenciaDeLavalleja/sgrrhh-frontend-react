import { asistenciasMock } from '../mocks/asistencias.mock'
import { cargosMock } from '../mocks/cargos.mock'
import { contratosMock } from '../mocks/contratos.mock'
import { dependenciasMock } from '../mocks/dependencias.mock'
import { documentosMock } from '../mocks/documentos.mock'
import { funcionariosMock } from '../mocks/funcionarios.mock'
import type {
  Contrato,
  CreateContratoInput,
  CreateFuncionarioInput,
  DashboardResumen,
  Funcionario,
  FuncionarioFilters,
  PaginatedResult,
  UpdateContratoInput,
  UpdateFuncionarioInput,
} from '../types/hr'

const API_DELAY = 280

let funcionariosData: Funcionario[] = structuredClone(funcionariosMock)
let contratosData = structuredClone(contratosMock)

const wait = async <T>(payload: T): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(payload), API_DELAY)
  })

const normalize = (value: string): string => value.trim().toLowerCase()

export const hrMockService = {
  getDependencias: async () => wait(structuredClone(dependenciasMock)),

  getCargos: async () => wait(structuredClone(cargosMock)),

  getDashboardResumen: async (): Promise<DashboardResumen> => {
    const contratosPorVencer = contratosData.filter((c) => c.estado === 'Por vencer').length
    const inasistenciasMes = asistenciasMock.filter((a) => a.estado === 'Falta').length

    return wait({
      totalFuncionarios: funcionariosData.length,
      zafralesActivos: funcionariosData.filter((f) => f.estado === 'Zafral').length,
      contratosPorVencer,
      inasistenciasMes,
    })
  },

  getFuncionarios: async (filters: FuncionarioFilters): Promise<PaginatedResult<Funcionario>> => {
    const search = normalize(filters.search ?? '')

    const filtered = funcionariosData.filter((funcionario) => {
      const matchesSearch =
        !search ||
        normalize(funcionario.nombres).includes(search) ||
        normalize(funcionario.apellidos).includes(search) ||
        normalize(funcionario.ci).includes(search)

      const matchesEstado = !filters.estado || funcionario.estado === filters.estado
      const matchesDependencia =
        !filters.dependenciaId || funcionario.dependenciaId === filters.dependenciaId

      return matchesSearch && matchesEstado && matchesDependencia
    })

    const start = filters.page * filters.pageSize
    const end = start + filters.pageSize

    return wait({ data: structuredClone(filtered.slice(start, end)), total: filtered.length })
  },

  getFuncionarioById: async (id: string): Promise<Funcionario | null> => {
    const funcionario = funcionariosData.find((item) => item.id === id) ?? null
    return wait(funcionario ? structuredClone(funcionario) : null)
  },

  createFuncionario: async (data: CreateFuncionarioInput): Promise<Funcionario> => {
    const nuevo: Funcionario = {
      ...data,
      id: `fun-${Date.now()}`,
      trabajosAnteriores: data.trabajosAnteriores ?? [],
    }
    funcionariosData = [nuevo, ...funcionariosData]
    return wait(structuredClone(nuevo))
  },

  updateFuncionario: async (id: string, data: UpdateFuncionarioInput): Promise<Funcionario> => {
    const index = funcionariosData.findIndex((item) => item.id === id)
    if (index < 0) {
      throw new Error('Funcionario no encontrado')
    }

    const updated: Funcionario = {
      ...funcionariosData[index],
      ...data,
      trabajosAnteriores: data.trabajosAnteriores ?? funcionariosData[index].trabajosAnteriores,
    }

    funcionariosData[index] = updated
    return wait(structuredClone(updated))
  },

  deleteFuncionario: async (id: string): Promise<void> => {
    funcionariosData = funcionariosData.filter((item) => item.id !== id)
    contratosData = contratosData.filter((item) => item.funcionarioId !== id)
    return wait(undefined)
  },

  getContratos: async (): Promise<Contrato[]> => wait(structuredClone(contratosData)),

  getContratosByFuncionario: async (funcionarioId: string): Promise<Contrato[]> =>
    wait(structuredClone(contratosData.filter((item) => item.funcionarioId === funcionarioId))),

  createContrato: async (data: CreateContratoInput): Promise<Contrato> => {
    const nuevo: Contrato = {
      ...data,
      id: `con-${Date.now()}`,
    }
    contratosData = [nuevo, ...contratosData]
    return wait(structuredClone(nuevo))
  },

  updateContrato: async (id: string, data: UpdateContratoInput): Promise<Contrato> => {
    const index = contratosData.findIndex((item) => item.id === id)
    if (index < 0) {
      throw new Error('Contrato no encontrado')
    }

    const updated: Contrato = { ...contratosData[index], ...data }
    contratosData[index] = updated
    return wait(structuredClone(updated))
  },

  getAsistencias: async () => wait(structuredClone(asistenciasMock)),

  getAsistenciasByFuncionario: async (funcionarioId: string) =>
    wait(structuredClone(asistenciasMock.filter((item) => item.funcionarioId === funcionarioId))),

  getDocumentosByFuncionario: async (funcionarioId: string) =>
    wait(structuredClone(documentosMock.filter((item) => item.funcionarioId === funcionarioId))),
}
