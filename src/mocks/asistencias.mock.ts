import type { Asistencia } from '../types/hr'

export const asistenciasMock: Asistencia[] = [
  { id: 'asi-1', funcionarioId: 'fun-1', fecha: '2026-02-20', estado: 'Presente' },
  { id: 'asi-2', funcionarioId: 'fun-1', fecha: '2026-02-21', estado: 'Falta', observaciones: 'Certificado pendiente' },
  { id: 'asi-3', funcionarioId: 'fun-2', fecha: '2026-02-20', estado: 'Presente' },
  { id: 'asi-4', funcionarioId: 'fun-3', fecha: '2026-02-20', estado: 'Licencia', observaciones: 'Médica' },
  { id: 'asi-5', funcionarioId: 'fun-4', fecha: '2026-02-20', estado: 'Presente' },
]
