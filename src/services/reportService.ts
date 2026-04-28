import type { Contrato, Funcionario } from '../types/hr'

const buildCsv = (rows: string[][]): string => rows.map((row) => row.join(',')).join('\n')

export const reportService = {
  exportFuncionariosCsv: (funcionarios: Funcionario[], contratos: Contrato[]): void => {
    const rows: string[][] = [
      ['CI', 'Nombres', 'Apellidos', 'Estado', 'Fecha Ingreso', 'Contratos activos'],
      ...funcionarios.map((funcionario) => {
        const contratosActivos = contratos.filter(
          (contrato) => contrato.funcionarioId === funcionario.id && contrato.estado !== 'Vencido',
        ).length

        return [
          funcionario.ci,
          funcionario.nombres,
          funcionario.apellidos,
          funcionario.estado,
          funcionario.fechaIngreso,
          String(contratosActivos),
        ]
      }),
    ]

    const csv = buildCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `reporte-funcionarios-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()

    URL.revokeObjectURL(url)
  },
}
