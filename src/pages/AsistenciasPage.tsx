import {
  Badge,
  Button,
  Combobox,
  Field,
  Input,
  Option,
  makeStyles,
} from '@fluentui/react-components'
import { Warning24Regular } from '@fluentui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { hrApiService } from '../services/hrApiService'
import type { Asistencia } from '../types/hr'
import { estadoBadgeAppearance, formatNombreCompleto } from '../utils/hrFormatters'

const useStyles = makeStyles({
  demoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    backgroundColor: '#fff3cd',
    color: '#664d03',
    border: '1px solid #ffecb5',
    fontSize: '14px',
    fontWeight: '500',
  },
  demoBannerDark: {
    backgroundColor: '#3a2e00',
    color: '#ffe69c',
    border: '1px solid #4a3800',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'flex-end',
    marginBottom: '16px',
  },
  filterField: {
    minWidth: '200px',
    flex: '1 1 200px',
  },
  exportRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
})

// ── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function downloadCsv(rows: Array<Record<string, string>>, filename: string) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h] ?? '')).join(',')),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ────────────────────────────────────────────────────────────────────────────

export function AsistenciasPage() {
  const styles = useStyles()

  const { data: asistencias = [] } = useQuery({ queryKey: ['asistencias'], queryFn: hrApiService.getAsistencias })
  const { data: funcionarios = [] } = useQuery({
    queryKey: ['funcionarios-asistencias'],
    queryFn: () => hrApiService.getFuncionarios({ page: 0, pageSize: 500 }),
    select: (response) => response.data,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const filteredFuncionarios = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return funcionarios
    return funcionarios.filter(
      (f) =>
        formatNombreCompleto(f.nombres, f.apellidos).toLowerCase().includes(q) ||
        f.ci.toLowerCase().includes(q),
    )
  }, [funcionarios, searchQuery])

  const filteredAsistencias = useMemo(() => {
    return asistencias.filter((a) => {
      if (selectedFuncionarioId && a.funcionarioId !== selectedFuncionarioId) return false
      if (fechaDesde && a.fecha < fechaDesde) return false
      if (fechaHasta && a.fecha > fechaHasta) return false
      return true
    })
  }, [asistencias, selectedFuncionarioId, fechaDesde, fechaHasta])

  const toExportRows = (rows: Asistencia[]) =>
    rows.map((a) => {
      const f = funcionarios.find((item) => item.id === a.funcionarioId)
      return {
        Funcionario: f ? formatNombreCompleto(f.nombres, f.apellidos) : a.funcionarioId,
        CI: f?.ci ?? '',
        Fecha: a.fecha,
        Estado: a.estado,
        Observaciones: a.observaciones ?? '',
      }
    })

  const handleExportFiltered = () =>
    downloadCsv(toExportRows(filteredAsistencias), 'asistencias_filtrado.csv')

  const handleExportAll = () =>
    downloadCsv(toExportRows(asistencias), 'asistencias_todo.csv')

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedFuncionarioId('')
    setFechaDesde('')
    setFechaHasta('')
  }

  const columns: DataTableColumn<Asistencia>[] = [
    {
      key: 'funcionario',
      title: 'Funcionario',
      render: (row) => {
        const f = funcionarios.find((item) => item.id === row.funcionarioId)
        return f ? formatNombreCompleto(f.nombres, f.apellidos) : '-'
      },
    },
    { key: 'fecha', title: 'Fecha', render: (row) => row.fecha },
    {
      key: 'estado',
      title: 'Estado',
      render: (row) => (
        <Badge appearance={estadoBadgeAppearance(row.estado)}>{row.estado}</Badge>
      ),
    },
    { key: 'obs', title: 'Observaciones', render: (row) => row.observaciones ?? '-' },
  ]

  const hasFilters = selectedFuncionarioId || fechaDesde || fechaHasta

  return (
    <>
      <PageHeader title="Asistencias" subtitle="Control diario de asistencias" />

      {/* ── Demo banner ── */}
      <div className={styles.demoBanner}>
        <Warning24Regular style={{ flexShrink: 0 }} />
        <span>
          <strong>Modo demo:</strong> Esta sección es una vista de ejemplo. La idea es integrar las
          asistencias con el sistema de Recursos Humanos de{' '}
          <strong>Datamatic</strong> (API abierta), reemplazando estos datos por los registros reales
          en tiempo real.
        </span>
      </div>

      {/* ── Filtros ── */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <Field label="Buscar funcionario">
            <Combobox
              placeholder="Nombre o cédula..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedFuncionarioId('')
              }}
              onOptionSelect={(_, data) => {
                setSearchQuery(data.optionText ?? '')
                setSelectedFuncionarioId(data.optionValue ?? '')
              }}
              freeform
              style={{ width: '100%' }}
            >
              {filteredFuncionarios.length === 0 ? (
                <Option value="" disabled text="Sin resultados">Sin resultados</Option>
              ) : (
                filteredFuncionarios.map((f) => {
                  const nombre = formatNombreCompleto(f.nombres, f.apellidos)
                  return (
                    <Option key={f.id} value={f.id} text={nombre}>
                      {nombre} — CI: {f.ci}
                    </Option>
                  )
                })
              )}
            </Combobox>
          </Field>
        </div>

        <div className={styles.filterField}>
          <Field label="Fecha desde">
            <Input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={{ width: '100%' }}
            />
          </Field>
        </div>

        <div className={styles.filterField}>
          <Field label="Fecha hasta">
            <Input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{ width: '100%' }}
            />
          </Field>
        </div>

        {(hasFilters || searchQuery) && (
          <Button appearance="subtle" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* ── Exportar ── */}
      <div className={styles.exportRow}>
        <Button appearance="outline" size="small" onClick={handleExportFiltered}>
          Exportar selección CSV
          {filteredAsistencias.length < asistencias.length
            ? ` (${filteredAsistencias.length})`
            : ''}
        </Button>
        <Button appearance="outline" size="small" onClick={handleExportAll}>
          Exportar todo CSV ({asistencias.length})
        </Button>
      </div>

      {/* ── Tabla ── */}
      {filteredAsistencias.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No hay asistencias que coincidan con los filtros aplicados."
          actionLabel={hasFilters || searchQuery ? 'Limpiar filtros' : undefined}
          onAction={hasFilters || searchQuery ? clearFilters : undefined}
        />
      ) : (
        <DataTable
          rows={filteredAsistencias}
          columns={columns}
          page={0}
          pageSize={filteredAsistencias.length || 1}
          total={filteredAsistencias.length}
          onPageChange={() => {}}
        />
      )}
    </>
  )
}
