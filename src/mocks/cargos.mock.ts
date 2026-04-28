import type { Cargo } from '../types/hr'

export const cargosMock: Cargo[] = [
  { id: 'car-1', nombre: 'Administrativo', dependenciaId: 'dep-1' },
  { id: 'car-2', nombre: 'Auxiliar de limpieza', dependenciaId: 'dep-2' },
  { id: 'car-3', nombre: 'Chofer', dependenciaId: 'dep-3' },
  { id: 'car-4', nombre: 'Conductor de maquinaria', dependenciaId: 'dep-1' },
  { id: 'car-5', nombre: 'Asistente de piscina', dependenciaId: 'dep-4' },
  { id: 'car-6', nombre: 'Recepción', dependenciaId: 'dep-5' },
  { id: 'car-7', nombre: 'Cocinero', dependenciaId: 'dep-6' },
  { id: 'car-8', nombre: 'Barrido', dependenciaId: 'dep-2' },
]
