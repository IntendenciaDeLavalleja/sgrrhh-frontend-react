import type { Cargo, Dependencia, EstadoContrato, EstadoFuncionario, Tarea } from '../types/hr'

export const formatNombreCompleto = (nombres: string, apellidos: string): string =>
  `${nombres} ${apellidos}`

export const findDependenciaNombre = (dependencias: Dependencia[], dependenciaId: string): string =>
  dependencias.find((item) => item.id === dependenciaId)?.nombre ?? '-'

export const findCargoNombre = (cargos: Cargo[], cargoId: string): string =>
  cargos.find((item) => item.id === cargoId)?.nombre ?? '-'

export const findTareaNombre = (tareas: Tarea[], tareaId: string): string =>
  tareas.find((item) => item.id === tareaId)?.nombre ?? '-'

export const estadoBadgeAppearance = (
  estado: EstadoFuncionario | EstadoContrato,
): 'outline' | 'filled' | 'tint' => {
  switch (estado) {
    case 'Baja':
    case 'Vencido':
    case 'Rescindido':
      return 'outline'
    case 'Licencia':
    case 'Por vencer':
      return 'tint'
    default:
      return 'filled'
  }
}
