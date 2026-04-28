import type { DocumentoFuncionario } from '../types/hr'

export const documentosMock: DocumentoFuncionario[] = [
  {
    id: 'doc-1',
    funcionarioId: 'fun-1',
    tipo: 'CI',
    nombreArchivo: 'ci-lucia-fernandez.pdf',
    fechaCarga: '2025-01-03',
  },
  {
    id: 'doc-2',
    funcionarioId: 'fun-1',
    tipo: 'Contrato',
    nombreArchivo: 'contrato-zafral-lucia.pdf',
    fechaCarga: '2025-01-04',
  },
  {
    id: 'doc-3',
    funcionarioId: 'fun-2',
    tipo: 'Contrato',
    nombreArchivo: 'contrato-temporal-martin.pdf',
    fechaCarga: '2024-07-01',
  },
  {
    id: 'doc-4',
    funcionarioId: 'fun-3',
    tipo: 'Certificado Médico',
    nombreArchivo: 'certificado-paola-febrero.pdf',
    fechaCarga: '2026-02-22',
  },
]
