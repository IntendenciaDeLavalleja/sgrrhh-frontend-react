import type { Contrato } from '../types/hr'

export const contratosMock: Contrato[] = [
  {
    id: 'con-1',
    funcionarioId: 'fun-1',
    tipo: 'Zafral',
    fechaInicio: '2025-01-01',
    fechaFin: '2026-03-31',
    estado: 'Vigente',
    sueldoNominal: 41250,
    observaciones: 'Contrato zafral temporada verano.',
  },
  {
    id: 'con-2',
    funcionarioId: 'fun-2',
    tipo: 'Temporal',
    fechaInicio: '2024-07-01',
    fechaFin: '2026-07-01',
    estado: 'Por vencer',
    sueldoNominal: 56800,
  },
  {
    id: 'con-3',
    funcionarioId: 'fun-3',
    tipo: 'Zafral',
    fechaInicio: '2025-01-10',
    fechaFin: '2025-05-15',
    estado: 'Vencido',
    sueldoNominal: 38500,
  },
  {
    id: 'con-4',
    funcionarioId: 'fun-4',
    tipo: 'Suplencia',
    fechaInicio: '2025-06-01',
    fechaFin: '2026-06-01',
    estado: 'Vigente',
    sueldoNominal: 60150,
  },
]
