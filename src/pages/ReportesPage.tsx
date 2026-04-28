import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Button,
  Field,
  Select,
  ToggleButton,
  makeStyles,
} from '@fluentui/react-components'
import {
  ArrowDownload24Regular,
  DataBarVerticalAscending24Regular,
  DocumentTable24Regular,
  PeopleTeam24Regular,
  CalendarLtr24Regular,
} from '@fluentui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { hrApiService } from '../services/hrApiService'
import { useThemeStore } from '../store/themeStore'
import {
  findCargoNombre,
  findDependenciaNombre,
  formatNombreCompleto,
} from '../utils/hrFormatters'
import type { Funcionario } from '../types/hr'

// ── Color palette ─────────────────────────────────────────────────────────────
const PALETTE = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

// ── CSV helper ────────────────────────────────────────────────────────────────
function escapeCsv(val: string): string {
  return `"${String(val).replace(/"/g, '""')}"`
}
function downloadCsv(rows: Array<Record<string, string>>, filename: string) {
  if (!rows.length) return
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

// ── PNG export via html2canvas (captures the actual rendered DOM) ─────────────
async function exportChartPng(
  ref: RefObject<HTMLDivElement | null>,
  filename: string,
  isDark: boolean,
) {
  const el = ref.current
  if (!el) return
  const canvas = await html2canvas(el, {
    backgroundColor: isDark ? '#0d1117' : '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
    allowTaint: true,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
  })
  canvas.toBlob((b) => {
    if (!b) return
    const url = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

// ── Tooltip personalizado ────────────────────────────────────────────────────
type ChartPayloadEntry = {
  color?: string
  name?: string | number
  value?: string | number
}
function renderTooltip(
  isDark: boolean,
  active: boolean | undefined,
  payload: ChartPayloadEntry[] | undefined,
  label: string | number | undefined,
) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: isDark ? '#1a1a3e' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(0,212,255,0.22)' : '#e5e7eb'}`,
        borderRadius: 10,
        padding: '10px 14px',
        color: isDark ? '#e2e8f0' : '#374151',
        boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
        fontSize: 13,
      }}
    >
      {label !== undefined && label !== '' && (
        <p style={{ margin: '0 0 5px 0', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 }}>
          {String(label)}
        </p>
      )}
      {payload.map((e, i) => (
        <p key={i} style={{ margin: '2px 0', color: e.color }}>
          {String(e.name ?? '')}: <strong>{String(e.value ?? '')}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const useStyles = makeStyles({
  filters: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  filterField: { minWidth: '180px', flex: '1 1 180px' },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    opacity: '0.65',
    marginBottom: '6px',
  },
  kpiValue: {
    fontSize: '34px',
    fontWeight: '800',
    lineHeight: '1',
  },
  kpiSub: {
    fontSize: '12px',
    marginTop: '6px',
    opacity: '0.55',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  chartTitle: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    opacity: '0.7',
  },
  timelineControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  periodGroup: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  toggleGroup: {
    display: 'flex',
    gap: '6px',
    marginLeft: 'auto',
  },
  customRange: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '8px',
  },
  exportRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
})

// ── Inline card styles (theme-aware) ─────────────────────────────────────────
function kpiCardStyle(isDark: boolean, accent: string): React.CSSProperties {
  return {
    borderRadius: 14,
    padding: '22px 24px',
    background: isDark
      ? 'linear-gradient(135deg, rgba(13,17,23,0.97) 0%, rgba(20,22,46,0.97) 100%)'
      : 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
    border: `1px solid ${isDark ? `${accent}30` : `${accent}50`}`,
    boxShadow: isDark
      ? `0 0 28px ${accent}14, 0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)`
      : `0 2px 14px ${accent}20, 0 1px 4px rgba(0,0,0,0.07)`,
    position: 'relative',
    overflow: 'hidden',
    color: isDark ? '#e2e8f0' : '#1e293b',
  }
}
function chartCardStyle(isDark: boolean): React.CSSProperties {
  return {
    borderRadius: 14,
    padding: '20px',
    background: isDark
      ? 'linear-gradient(135deg, rgba(10,12,20,0.98) 0%, rgba(16,20,38,0.98) 100%)'
      : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(0,212,255,0.09)' : '#e5e7eb'}`,
    boxShadow: isDark
      ? '0 6px 36px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.035)'
      : '0 2px 12px rgba(0,0,0,0.06)',
    color: isDark ? '#e2e8f0' : '#374151',
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ReportesPage() {
  const styles = useStyles()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const axisColor = isDark ? '#64748b' : '#9ca3af'
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'

  // refs para export PNG
  const refEstado = useRef<HTMLDivElement>(null)
  const refDep = useRef<HTMLDivElement>(null)
  const refContratos = useRef<HTMLDivElement>(null)
  const refInasistencias = useRef<HTMLDivElement>(null)
  const refTimeline = useRef<HTMLDivElement>(null)

  // ── Timeline state ──────────────────────────────────────────────────────
  type PeriodPreset = '1M' | '3M' | '6M' | '1A' | '2A' | '5A' | 'TODO' | 'CUSTOM'
  const PERIOD_LABELS: { key: PeriodPreset; label: string }[] = [
    { key: '1M', label: '1 mes' },
    { key: '3M', label: '3 meses' },
    { key: '6M', label: '6 meses' },
    { key: '1A', label: '1 año' },
    { key: '2A', label: '2 años' },
    { key: '5A', label: '5 años' },
    { key: 'TODO', label: 'Todo' },
    { key: 'CUSTOM', label: 'Personalizado' },
  ]
  const [period, setPeriod] = useState<PeriodPreset>('TODO')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showEntradas, setShowEntradas] = useState(true)
  const [showBajas, setShowBajas] = useState(true)

  // ── Datos ──────────────────────────────────────────────────────────────────
  const { data: funcionariosRaw = [] } = useQuery({
    queryKey: ['funcionarios-reportes'],
    queryFn: () => hrApiService.getFuncionarios({ page: 0, pageSize: 9999 }),
    select: (r) => r.data,
  })
  const { data: zafralesRaw = [] } = useQuery({
    queryKey: ['zafrales-reportes'],
    queryFn: () => hrApiService.getFuncionariosZafrales({ page: 0, pageSize: 9999 }),
    select: (r) => r.data,
  })
  const { data: dependencias = [] } = useQuery({
    queryKey: ['dependencias-reportes'],
    queryFn: hrApiService.getDependencias,
  })
  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos-reportes'],
    queryFn: hrApiService.getCargos,
  })
  const { data: contratos = [] } = useQuery({
    queryKey: ['contratos-reportes'],
    queryFn: hrApiService.getContratos,
  })

  // Normalizar zafrales → mismo shape que Funcionario (cargoId = tareaId)
  const funcionarios = useMemo<Funcionario[]>(
    () => [
      ...funcionariosRaw,
      ...zafralesRaw.map((z) => ({
        id: z.id,
        ci: z.ci,
        nombres: z.nombres,
        apellidos: z.apellidos,
        genero: z.genero,
        fechaNacimiento: z.fechaNacimiento,
        paisNacimiento: z.paisNacimiento,
        departamentoNacimiento: z.departamentoNacimiento,
        estadoCivil: z.estadoCivil,
        dependenciaId: z.dependenciaId,
        cargoId: z.tareaId,
        fechaIngreso: z.fechaIngreso,
        regimenLaboral: z.regimenLaboral,
        estado: 'Zafral' as string,
        motivoBaja: z.motivoBaja,
        inasistencias: z.inasistencias,
        telefono: z.telefono,
        email: z.email,
        otroContacto: z.otroContacto,
        calle: z.calle,
        entreCalles: z.entreCalles,
        zona: z.zona,
        observaciones: z.observaciones,
        trabajosAnteriores: [],
      })),
    ],
    [funcionariosRaw, zafralesRaw],
  )

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [selectedDep, setSelectedDep] = useState('')
  const [selectedEstado, setSelectedEstado] = useState('')
  const [excludeBajas, setExcludeBajas] = useState<'activos' | 'bajas' | ''>('activos')

  const filtered = useMemo(
    () =>
      funcionarios.filter((f) => {
        if (selectedDep && f.dependenciaId !== selectedDep) return false
        if (selectedEstado && f.estado !== selectedEstado) return false
        if (excludeBajas === 'activos' && f.estado === 'Baja') return false
        if (excludeBajas === 'bajas' && f.estado !== 'Baja') return false
        return true
      }),
    [funcionarios, selectedDep, selectedEstado, excludeBajas],
  )

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const contratosVigentes = contratos.filter(
      (c) => filtered.some((f) => f.id === c.funcionarioId) && c.estado === 'Vigente',
    )
    const totalInasistencias = filtered.reduce((s, f) => s + f.inasistencias, 0)
    const sueldos = contratosVigentes.map((c) => c.sueldoNominal)
    const sueldoPromedio = sueldos.length
      ? Math.round(sueldos.reduce((s, v) => s + v, 0) / sueldos.length)
      : 0
    return {
      total: filtered.length,
      contratosVigentes: contratosVigentes.length,
      totalInasistencias,
      sueldoPromedio,
    }
  }, [filtered, contratos])

  // ── Datos de gráficos ──────────────────────────────────────────────────────

  // nombre de la dep seleccionada (para títulos dinámicos)
  const depNombre = useMemo(
    () => dependencias.find((d) => d.id === selectedDep)?.nombre ?? '',
    [dependencias, selectedDep],
  )

  // Pie: excluir Baja (solo muestra activos)
  const estadoData = useMemo(() => {
    const count: Record<string, number> = {}
    filtered.filter((f) => f.estado !== 'Baja').forEach((f) => {
      count[f.estado] = (count[f.estado] || 0) + 1
    })
    return Object.entries(count).map(([name, value]) => ({ name, value }))
  }, [filtered])

  // Bar: funcionarios por área  →  si hay dep seleccionada, desglosar por cargo dentro de esa dep
  const filteredByEstadoOnly = useMemo(
    () =>
      funcionarios.filter((f) => {
        if (!selectedEstado || f.estado === selectedEstado) {
          if (excludeBajas === 'activos' && f.estado === 'Baja') return false
          if (excludeBajas === 'bajas' && f.estado !== 'Baja') return false
          return true
        }
        return false
      }),
    [funcionarios, selectedEstado, excludeBajas],
  )
  const depData = useMemo(() => {
    if (selectedDep) {
      const depCargos = cargos.filter((c) => c.dependenciaId === selectedDep)
      return depCargos
        .map((cargo) => ({
          name: cargo.nombre,
          total: filtered.filter((f) => f.cargoId === cargo.id).length,
        }))
        .filter((item) => item.total > 0)
    }
    return dependencias.map((dep) => ({
      name: dep.nombre.replace('Dirección de ', 'Dir. '),
      total: filteredByEstadoOnly.filter((f) => f.dependenciaId === dep.id).length,
    }))
  }, [filtered, filteredByEstadoOnly, dependencias, cargos, selectedDep])

  // Bar: contratos por tipo — solo estados activos/relevantes (sin Vencido)
  const contratosData = useMemo(() => {
    const tipos = ['Zafral', 'Temporal', 'Suplencia']
    const estados = ['Vigente', 'Por vencer', 'Rescindido']
    const filteredIds = new Set(filtered.map((f) => f.id))
    return tipos.map((tipo) => {
      const row: Record<string, string | number> = { tipo }
      estados.forEach((estado) => {
        row[estado] = contratos.filter(
          (c) => filteredIds.has(c.funcionarioId) && c.tipo === tipo && c.estado === estado,
        ).length
      })
      return row
    })
  }, [filtered, contratos])

  // Bar horizontal: inasistencias por área  →  si hay dep, desglosar por cargo
  const inasistenciaDepData = useMemo(() => {
    if (selectedDep) {
      const depCargos = cargos.filter((c) => c.dependenciaId === selectedDep)
      return depCargos
        .map((cargo) => ({
          name: cargo.nombre,
          inasistencias: filtered
            .filter((f) => f.cargoId === cargo.id)
            .reduce((s, f) => s + f.inasistencias, 0),
        }))
        .filter((item) => item.inasistencias > 0)
    }
    return dependencias.map((dep) => ({
      name: dep.nombre.replace('Dirección de ', 'Dir. '),
      inasistencias: filtered
        .filter((f) => f.dependenciaId === dep.id)
        .reduce((s, f) => s + f.inasistencias, 0),
    }))
  }, [filtered, dependencias, cargos, selectedDep])

  // LineChart: serie temporal de contratos — Entradas (fechaInicio) y Bajas (fechaFin donde Vencido/Rescindido)
  const allTimelineData = useMemo(() => {
    const filteredIds = new Set(filtered.map((f) => f.id))
    const filteredContratos = contratos.filter((c) => filteredIds.has(c.funcionarioId))
    const map: Record<string, { mes: string; Entradas: number; Bajas: number }> = {}
    const ensure = (key: string) => {
      if (!map[key]) map[key] = { mes: key, Entradas: 0, Bajas: 0 }
    }
    filteredContratos.forEach((c) => {
      const entrada = c.fechaInicio.slice(0, 7)
      ensure(entrada)
      map[entrada].Entradas += 1
      if (c.estado === 'Vencido' || c.estado === 'Rescindido') {
        const baja = c.fechaFin.slice(0, 7)
        ensure(baja)
        map[baja].Bajas += 1
      }
    })
    return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes))
  }, [filtered, contratos])

  const timelineData = useMemo(() => {
    if (!allTimelineData.length) return allTimelineData
    const today = new Date()
    let fromKey = ''
    let toKey = ''
    if (period === 'CUSTOM') {
      fromKey = customFrom
      toKey = customTo
    } else if (period !== 'TODO') {
      const monthsBack = { '1M': 1, '3M': 3, '6M': 6, '1A': 12, '2A': 24, '5A': 60 }[period] ?? 0
      const from = new Date(today)
      from.setMonth(from.getMonth() - monthsBack)
      fromKey = from.toISOString().slice(0, 7)
      toKey = today.toISOString().slice(0, 7)
    }
    if (!fromKey && !toKey) return allTimelineData
    return allTimelineData.filter(
      (d) => (!fromKey || d.mes >= fromKey) && (!toKey || d.mes <= toKey),
    )
  }, [allTimelineData, period, customFrom, customTo])

  // ── CSV export ─────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const rows = filtered.map((f) => ({
      CI: f.ci,
      Nombre: formatNombreCompleto(f.nombres, f.apellidos),
      Estado: f.estado,
      Dependencia: findDependenciaNombre(dependencias, f.dependenciaId),
      Cargo: findCargoNombre(cargos, f.cargoId),
      'Fecha Ingreso': f.fechaIngreso,
      'Régimen Laboral': f.regimenLaboral,
      Inasistencias: String(f.inasistencias),
      'Contratos Vigentes': String(
        contratos.filter((c) => c.funcionarioId === f.id && c.estado === 'Vigente').length,
      ),
      'Sueldo Nominal': String(
        contratos
          .filter((c) => c.funcionarioId === f.id && c.estado === 'Vigente')
          .reduce((s, c) => s + c.sueldoNominal, 0),
      ),
    }))
    downloadCsv(rows, `reporte-funcionarios-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // ── Animations ─────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: 'Total funcionarios',
      value: kpis.total,
      sub: `de ${funcionarios.length} totales`,
      accent: PALETTE[0],
      Icon: PeopleTeam24Regular,
    },
    {
      label: 'Contratos vigentes',
      value: kpis.contratosVigentes,
      sub: 'de la selección',
      accent: PALETTE[2],
      Icon: DataBarVerticalAscending24Regular,
    },
    {
      label: 'Inasistencias',
      value: kpis.totalInasistencias,
      sub: 'acumuladas',
      accent: PALETTE[4],
      Icon: CalendarLtr24Regular,
    },
    {
      label: 'Sueldo promedio',
      value: kpis.sueldoPromedio > 0 ? `$\u00a0${kpis.sueldoPromedio.toLocaleString('es-UY')}` : '—',
      sub: 'contratos vigentes',
      accent: PALETTE[3],
      Icon: DocumentTable24Regular,
    },
  ]

  return (
    <>
      <PageHeader title="Reportes BI" subtitle="Análisis dinámico del plantel" />

      {/* ── Filtros ── */}
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <Field label="Dirección / Área">
            <Select value={selectedDep} onChange={(e) => setSelectedDep(e.currentTarget.value)}>
              <option value="">Todas</option>
              {dependencias.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className={styles.filterField}>
          <Field label="Estado">
            <Select value={selectedEstado} onChange={(e) => setSelectedEstado(e.currentTarget.value)}>
              <option value="">Todos</option>
              <option value="Zafral">Zafral</option>
              <option value="Contratado">Contratado</option>
              <option value="Presupuestado">Presupuestado</option>
              <option value="Licencia">Licencia</option>
            </Select>
          </Field>
        </div>
        <div className={styles.filterField}>
          <Field label="Personal">
            <Select value={excludeBajas} onChange={(e) => setExcludeBajas(e.currentTarget.value as 'activos' | 'bajas' | '')}>
              <option value="activos">Solo activos</option>
              <option value="">Todos (incluye bajas)</option>
              <option value="bajas">Solo bajas</option>
            </Select>
          </Field>
        </div>
        {(selectedDep || selectedEstado || excludeBajas !== 'activos') && (
          <Button appearance="subtle" onClick={() => { setSelectedDep(''); setSelectedEstado(''); setExcludeBajas('activos') }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* ── KPIs ── */}
      <div className={styles.kpiGrid}>
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            style={kpiCardStyle(isDark, card.accent)}
          >
            {/* glow orb decorativo */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `${card.accent}18`,
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <card.Icon style={{ color: card.accent, width: 18, height: 18 }} />
              <span className={styles.kpiLabel}>{card.label}</span>
            </div>
            <div className={styles.kpiValue} style={{ color: card.accent }}>
              {card.value}
            </div>
            <div className={styles.kpiSub}>{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Exportar ── */}
      <div className={styles.exportRow}>
        <Button appearance="outline" icon={<DocumentTable24Regular />} onClick={handleExportCsv}>
          Exportar CSV ({filtered.length} registros)
        </Button>
      </div>

      {/* ── Gráficos 2×2 ── */}
      <div className={styles.chartGrid}>

        {/* Pie: distribución por estado */}
        <motion.div
          ref={refEstado}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
          style={chartCardStyle(isDark)}
        >
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Distribución por estado</span>
            <span data-html2canvas-ignore style={{ display: 'inline-flex' }}>
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowDownload24Regular />}
                onClick={() => exportChartPng(refEstado, 'chart-estado.png', isDark)}
              >
                PNG
              </Button>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={estadoData}
                cx="50%"
                cy="52%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {estadoData.map((_, idx) => (
                  <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload, label }) => renderTooltip(isDark, active, payload as unknown as ChartPayloadEntry[] | undefined, label)} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => (
                  <span style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}>{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar: funcionarios por dependencia */}
        <motion.div
          ref={refDep}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
          style={chartCardStyle(isDark)}
        >
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>
              {selectedDep ? `Funcionarios por cargo — ${depNombre}` : 'Funcionarios por área'}
            </span>
            <span data-html2canvas-ignore style={{ display: 'inline-flex' }}>
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowDownload24Regular />}
                onClick={() => exportChartPng(refDep, 'chart-dependencias.png', isDark)}
              >
                PNG
              </Button>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={depData} margin={{ left: 0, right: 10, top: 4, bottom: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: axisColor, fontSize: 11 }}
                angle={-28}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) => renderTooltip(isDark, active, payload as unknown as ChartPayloadEntry[] | undefined, label)} />
              <Bar dataKey="total" name="Funcionarios" radius={[5, 5, 0, 0]}>
                {depData.map((_, idx) => (
                  <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar: contratos por tipo y estado */}
        <motion.div
          ref={refContratos}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.19, ease: 'easeOut' }}
          style={chartCardStyle(isDark)}
        >
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Contratos activos por tipo</span>
            <span data-html2canvas-ignore style={{ display: 'inline-flex' }}>
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowDownload24Regular />}
                onClick={() => exportChartPng(refContratos, 'chart-contratos.png', isDark)}
              >
                PNG
              </Button>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={contratosData} margin={{ left: 0, right: 10, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="tipo" tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) => renderTooltip(isDark, active, payload as unknown as ChartPayloadEntry[] | undefined, label)} />
              <Legend
                formatter={(v) => (
                  <span style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}>{v}</span>
                )}
              />
              <Bar dataKey="Vigente" fill={PALETTE[2]} radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="Por vencer" fill={PALETTE[3]} radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="Rescindido" fill={PALETTE[5]} radius={[0, 0, 4, 4]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar: inasistencias por área */}
        <motion.div
          ref={refInasistencias}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.26, ease: 'easeOut' }}
          style={chartCardStyle(isDark)}
        >
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>
              {selectedDep ? `Inasistencias por cargo — ${depNombre}` : 'Inasistencias por área'}
            </span>
            <span data-html2canvas-ignore style={{ display: 'inline-flex' }}>
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowDownload24Regular />}
                onClick={() => exportChartPng(refInasistencias, 'chart-inasistencias.png', isDark)}
              >
                PNG
              </Button>
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={inasistenciaDepData}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: axisColor, fontSize: 11 }}
                width={125}
              />
              <Tooltip content={({ active, payload, label }) => renderTooltip(isDark, active, payload as unknown as ChartPayloadEntry[] | undefined, label)} />
              <Bar dataKey="inasistencias" name="Inasistencias" radius={[0, 5, 5, 0]}>
                {inasistenciaDepData.map((_, idx) => (
                  <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Serie temporal (ancho completo) ── */}
      <motion.div
        ref={refTimeline}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
        style={{ ...chartCardStyle(isDark), marginBottom: '20px' }}
      >
        <div className={styles.chartHeader}>
          <span className={styles.chartTitle}>
            Evolución de contratos en el tiempo
            {selectedDep ? ` — ${depNombre}` : ''}
          </span>
          <span data-html2canvas-ignore style={{ display: 'inline-flex' }}>
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowDownload24Regular />}
              onClick={() => exportChartPng(refTimeline, 'chart-timeline.png', isDark)}
            >
              PNG
            </Button>
          </span>
        </div>

        {/* controles de período + toggles de líneas */}
        <div className={styles.timelineControls} data-html2canvas-ignore>
          <div className={styles.periodGroup}>
            {PERIOD_LABELS.map(({ key, label }) => (
              <ToggleButton
                key={key}
                size="small"
                checked={period === key}
                onClick={() => setPeriod(key)}
                appearance={period === key ? 'primary' : 'subtle'}
              >
                {label}
              </ToggleButton>
            ))}
          </div>
          <div className={styles.toggleGroup}>
            <ToggleButton
              size="small"
              checked={showEntradas}
              onClick={() => setShowEntradas((v) => !v)}
              style={{
                borderColor: PALETTE[2],
                color: showEntradas ? '#fff' : PALETTE[2],
                backgroundColor: showEntradas ? PALETTE[2] : 'transparent',
              }}
            >
              Entradas
            </ToggleButton>
            <ToggleButton
              size="small"
              checked={showBajas}
              onClick={() => setShowBajas((v) => !v)}
              style={{
                borderColor: PALETTE[4],
                color: showBajas ? '#fff' : PALETTE[4],
                backgroundColor: showBajas ? PALETTE[4] : 'transparent',
              }}
            >
              Bajas
            </ToggleButton>
          </div>
        </div>

        {/* rango personalizado */}
        {period === 'CUSTOM' && (
          <div className={styles.customRange} data-html2canvas-ignore>
            <Field label="Desde">
              <input
                type="month"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                style={{
                  background: isDark ? '#1a1a3e' : '#f8faff',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  border: `1px solid ${isDark ? 'rgba(0,212,255,0.25)' : '#d1d5db'}`,
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 13,
                }}
              />
            </Field>
            <Field label="Hasta">
              <input
                type="month"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                style={{
                  background: isDark ? '#1a1a3e' : '#f8faff',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  border: `1px solid ${isDark ? 'rgba(0,212,255,0.25)' : '#d1d5db'}`,
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: 13,
                }}
              />
            </Field>
          </div>
        )}
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData} margin={{ left: 0, right: 24, top: 8, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: axisColor, fontSize: 11 }}
                tickFormatter={(v: string) => {
                  const [y, m] = v.split('-')
                  return `${m}/${y.slice(2)}`
                }}
              />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) => renderTooltip(isDark, active, payload as unknown as ChartPayloadEntry[] | undefined, label)} />
              <Legend
                formatter={(v) => (
                  <span style={{ color: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}>{v}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="Entradas"
                stroke={PALETTE[2]}
                strokeWidth={2.5}
                dot={{ fill: PALETTE[2], r: 4 }}
                activeDot={{ r: 6 }}
                hide={!showEntradas}
              />
              <Line
                type="monotone"
                dataKey="Bajas"
                stroke={PALETTE[4]}
                strokeWidth={2.5}
                dot={{ fill: PALETTE[4], r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 3"
                hide={!showBajas}
              />
            </LineChart>
          </ResponsiveContainer>
      </motion.div>
    </>
  )
}
