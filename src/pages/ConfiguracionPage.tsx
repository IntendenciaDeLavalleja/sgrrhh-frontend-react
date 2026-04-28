import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Divider,
  Field,
  Input,
  Select,
  Switch,
  Tab,
  TabList,
  Text,
  Toast,
  ToastBody,
  ToastTitle,
  makeStyles,
  tokens,
  useToastController,
} from '@fluentui/react-components'
import type { TabValue } from '@fluentui/react-components'
import {
  BuildingRegular,
  CalendarDayRegular,
  DataBarVerticalAscendingRegular,
  DocumentTextRegular,
  PersonCircleRegular,
  SettingsRegular,
  WeatherMoonRegular,
} from '@fluentui/react-icons'
import { AnimatePresence, motion } from 'framer-motion'
import { PageHeader } from '../components/common/PageHeader'

// ─── Storage ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'hr-app-config'
const toasterId = 'app-toaster'

// ─── Config shape ─────────────────────────────────────────────────────────────
interface AppConfig {
  // Organización
  nombreInstitucion: string
  division: string
  direccion: string
  emailInstitucional: string
  telefonoInstitucional: string
  anioFiscal: string
  regimenLaboralDefault: string
  // Contratos
  diasAlertaPorVencer: string
  duracionDefaultDias: string
  sueldoMinimoRef: string
  tipoContratoDefault: string
  // Asistencias / Datamatic
  datomaticHabilitado: boolean
  datomaticApiUrl: string
  datomaticApiKey: string
  datomaticSyncMinutos: string
  umbralInasistencias: string
  syncAlAbrir: boolean
  // Notificaciones
  notificacionesEmail: boolean
  emailDestinatario: string
  emailAsuntoPrefijo: string
  notificarContratosPorVencer: boolean
  diasNotificarAntes: string
  notificarInasistencias: boolean
  notificarBaja: boolean
  // Seguridad
  requerir2FA: boolean
  sessionTimeoutMin: string
  maxIntentosFallidos: string
  bloqueoMinutos: string
  passwordFuerte: boolean
}

const DEFAULT_CONFIG: AppConfig = {
  nombreInstitucion: 'Intendencia de Lavalleja',
  division: 'División de Recursos Humanos',
  direccion: 'Treinta y Tres 801, Minas, Lavalleja',
  emailInstitucional: 'rrhh@lavalleja.gub.uy',
  telefonoInstitucional: '442 23640',
  anioFiscal: String(new Date().getFullYear()),
  regimenLaboralDefault: 'Full Time',
  diasAlertaPorVencer: '30',
  duracionDefaultDias: '90',
  sueldoMinimoRef: '22000',
  tipoContratoDefault: 'Zafral',
  datomaticHabilitado: false,
  datomaticApiUrl: '',
  datomaticApiKey: '',
  datomaticSyncMinutos: '30',
  umbralInasistencias: '3',
  syncAlAbrir: false,
  notificacionesEmail: false,
  emailDestinatario: '',
  emailAsuntoPrefijo: '[RRHH Lavalleja]',
  notificarContratosPorVencer: true,
  diasNotificarAntes: '7',
  notificarInasistencias: true,
  notificarBaja: false,
  requerir2FA: false,
  sessionTimeoutMin: '60',
  maxIntentosFallidos: '5',
  bloqueoMinutos: '15',
  passwordFuerte: true,
}

function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    /* ignore parse errors */
  }
  return { ...DEFAULT_CONFIG }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  layout: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXL,
    alignItems: 'flex-start',
  },
  sidebar: {
    width: '190px',
    flexShrink: '0',
    position: 'sticky',
    top: '16px',
  },
  content: {
    flex: '1',
    minWidth: '0',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalM}`,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  saveBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    borderTopWidth: '2px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorBrandBackground,
  },
  saveBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  saveBarRight: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} 0`,
    gap: tokens.spacingHorizontalM,
  },
  switchLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  hint: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  badgeGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalXS,
  },
  catalogRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  infoBox: {
    background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))',
    borderRadius: tokens.borderRadiusLarge,
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens.colorBrandBackground,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
})

// ─── Shared sub-components ────────────────────────────────────────────────────
interface SwitchRowProps {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}
function SwitchRow({ label, hint, checked, onChange, disabled }: SwitchRowProps) {
  const styles = useStyles()
  return (
    <div className={styles.switchRow}>
      <div className={styles.switchLabel}>
        <Text weight="semibold" size={300}>{label}</Text>
        {hint && <Text className={styles.hint}>{hint}</Text>}
      </div>
      <Switch checked={checked} onChange={(_, d) => onChange(d.checked)} disabled={disabled} />
    </div>
  )
}

// ─── Section: Organización ────────────────────────────────────────────────────
interface SectionProps {
  config: AppConfig
  update: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void
}

function OrgSection({ config, update }: SectionProps) {
  const styles = useStyles()
  return (
    <div className={styles.section}>
      <Card>
        <CardHeader header={<Text weight="semibold">Datos institucionales</Text>} />
        <div className={styles.cardBody}>
          <div className={styles.grid2}>
            <Field label="Nombre de la institución">
              <Input
                value={config.nombreInstitucion}
                onChange={(_, d) => update('nombreInstitucion', d.value)}
              />
            </Field>
            <Field label="División / Secretaría">
              <Input
                value={config.division}
                onChange={(_, d) => update('division', d.value)}
              />
            </Field>
          </div>
          <Field label="Dirección física">
            <Input
              value={config.direccion}
              onChange={(_, d) => update('direccion', d.value)}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="Email institucional">
              <Input
                type="email"
                value={config.emailInstitucional}
                onChange={(_, d) => update('emailInstitucional', d.value)}
              />
            </Field>
            <Field label="Teléfono">
              <Input
                type="tel"
                value={config.telefonoInstitucional}
                onChange={(_, d) => update('telefonoInstitucional', d.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader header={<Text weight="semibold">Parámetros operativos</Text>} />
        <div className={styles.cardBody}>
          <div className={styles.grid3}>
            <Field label="Año fiscal activo">
              <Input
                type="number"
                value={config.anioFiscal}
                onChange={(_, d) => update('anioFiscal', d.value)}
              />
            </Field>
            <Field label="Régimen laboral predeterminado">
              <Select
                value={config.regimenLaboralDefault}
                onChange={(e) => update('regimenLaboralDefault', e.currentTarget.value)}
              >
                <option>Full Time</option>
                <option>20h</option>
                <option>30h</option>
              </Select>
            </Field>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Section: Contratos ───────────────────────────────────────────────────────
function ContratosSection({ config, update }: SectionProps) {
  const styles = useStyles()
  return (
    <div className={styles.section}>
      <Card>
        <CardHeader header={<Text weight="semibold">Alertas de vencimiento</Text>} />
        <div className={styles.cardBody}>
          <div className={styles.grid2}>
            <Field
              label='Días para marcar contrato como "Por vencer"'
              hint="Los contratos que venzan dentro de este período se marcarán con alerta."
            >
              <Input
                type="number"
                min="1"
                max="365"
                value={config.diasAlertaPorVencer}
                onChange={(_, d) => update('diasAlertaPorVencer', d.value)}
                contentAfter={<Text size={200}>días</Text>}
              />
            </Field>
            <Field
              label="Días de anticipación para notificar"
              hint="Con cuántos días de anticipación se envía el aviso por email."
            >
              <Input
                type="number"
                min="1"
                max="90"
                value={config.diasNotificarAntes}
                onChange={(_, d) => update('diasNotificarAntes', d.value)}
                contentAfter={<Text size={200}>días</Text>}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader header={<Text weight="semibold">Valores predeterminados</Text>} />
        <div className={styles.cardBody}>
          <div className={styles.grid3}>
            <Field label="Tipo de contrato por defecto">
              <Select
                value={config.tipoContratoDefault}
                onChange={(e) => update('tipoContratoDefault', e.currentTarget.value)}
              >
                <option>Zafral</option>
                <option>Temporal</option>
                <option>Suplencia</option>
              </Select>
            </Field>
            <Field
              label="Duración predeterminada"
              hint="Al abrir el formulario de nuevo contrato."
            >
              <Input
                type="number"
                min="1"
                value={config.duracionDefaultDias}
                onChange={(_, d) => update('duracionDefaultDias', d.value)}
                contentAfter={<Text size={200}>días</Text>}
              />
            </Field>
            <Field
              label="Sueldo mínimo referencia (UYU)"
              hint="Referencia para validar sueldos al crear contratos."
            >
              <Input
                type="number"
                min="0"
                value={config.sueldoMinimoRef}
                onChange={(_, d) => update('sueldoMinimoRef', d.value)}
                contentBefore={<Text size={200}>$</Text>}
              />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Section: Asistencias / Datamatic ────────────────────────────────────────
function AsistenciasSection({ config, update }: SectionProps) {
  const styles = useStyles()
  const dis = !config.datomaticHabilitado
  return (
    <div className={styles.section}>
      <div className={styles.infoBox}>
        <Text size={300}>
          <strong>Integración Datamatic</strong> — cuando está habilitada, el sistema
          consulta el endpoint configurado para sincronizar automáticamente las marcas
          de asistencia de los funcionarios.
        </Text>
      </div>

      <Card>
        <CardHeader header={<Text weight="semibold">Conexión con Datamatic</Text>} />
        <div className={styles.cardBody}>
          <Divider />
          <SwitchRow
            label="Habilitar integración Datamatic"
            hint="Activa la sincronización con el sistema externo de control horario."
            checked={config.datomaticHabilitado}
            onChange={(v) => update('datomaticHabilitado', v)}
          />
          <Divider />
          <Field label="URL del endpoint de API" hint="Ej: https://api.datamatic.uy/v2/asistencias">
            <Input
              type="url"
              disabled={dis}
              value={config.datomaticApiUrl}
              onChange={(_, d) => update('datomaticApiUrl', d.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="API Key / Token de autenticación">
            <Input
              type="password"
              disabled={dis}
              value={config.datomaticApiKey}
              onChange={(_, d) => update('datomaticApiKey', d.value)}
              placeholder={dis ? '(integración desactivada)' : 'Bearer token o API key...'}
            />
          </Field>
          <div className={styles.grid2}>
            <Field label="Intervalo de sincronización">
              <Select
                disabled={dis}
                value={config.datomaticSyncMinutos}
                onChange={(e) => update('datomaticSyncMinutos', e.currentTarget.value)}
              >
                <option value="15">Cada 15 minutos</option>
                <option value="30">Cada 30 minutos</option>
                <option value="60">Cada hora</option>
                <option value="120">Cada 2 horas</option>
              </Select>
            </Field>
            <Field
              label="Umbral de inasistencias para alerta"
              hint="Se genera alerta cuando un funcionario supera este límite."
            >
              <Input
                type="number"
                min="1"
                max="30"
                disabled={dis}
                value={config.umbralInasistencias}
                onChange={(_, d) => update('umbralInasistencias', d.value)}
                contentAfter={<Text size={200}>faltas</Text>}
              />
            </Field>
          </div>
          <Divider />
          <SwitchRow
            label="Sincronizar automáticamente al abrir el módulo"
            hint="Solicita datos actualizados cada vez que se navega al módulo de Asistencias."
            checked={config.syncAlAbrir}
            onChange={(v) => update('syncAlAbrir', v)}
            disabled={dis}
          />
        </div>
      </Card>
    </div>
  )
}

// ─── Section: Notificaciones ──────────────────────────────────────────────────
function NotifSection({ config, update }: SectionProps) {
  const styles = useStyles()
  const dis = !config.notificacionesEmail
  return (
    <div className={styles.section}>
      <Card>
        <CardHeader header={<Text weight="semibold">Configuración de correo</Text>} />
        <div className={styles.cardBody}>
          <Divider />
          <SwitchRow
            label="Habilitar notificaciones por email"
            hint="Envía alertas automáticas a la dirección configurada."
            checked={config.notificacionesEmail}
            onChange={(v) => update('notificacionesEmail', v)}
          />
          <Divider />
          <div className={styles.grid2}>
            <Field label="Destinatario de alertas" hint="Email que recibirá todas las notificaciones del sistema.">
              <Input
                type="email"
                disabled={dis}
                value={config.emailDestinatario}
                onChange={(_, d) => update('emailDestinatario', d.value)}
                placeholder="responsable@lavalleja.gub.uy"
              />
            </Field>
            <Field label="Prefijo de asunto" hint="Texto que precede el asunto de cada email enviado.">
              <Input
                disabled={dis}
                value={config.emailAsuntoPrefijo}
                onChange={(_, d) => update('emailAsuntoPrefijo', d.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader header={<Text weight="semibold">Eventos que generan notificación</Text>} />
        <div className={styles.cardBody}>
          <Divider />
          <SwitchRow
            label="Contratos por vencer"
            hint="Notifica cuando un contrato está próximo a vencer según los días configurados."
            checked={config.notificarContratosPorVencer}
            onChange={(v) => update('notificarContratosPorVencer', v)}
            disabled={dis}
          />
          <Divider />
          <SwitchRow
            label="Inasistencias excesivas"
            hint={`Notifica cuando un funcionario supera el umbral de ${config.umbralInasistencias} inasistencias.`}
            checked={config.notificarInasistencias}
            onChange={(v) => update('notificarInasistencias', v)}
            disabled={dis}
          />
          <Divider />
          <SwitchRow
            label="Baja de funcionario"
            hint="Notifica cuando se registra la baja de un funcionario en el sistema."
            checked={config.notificarBaja}
            onChange={(v) => update('notificarBaja', v)}
            disabled={dis}
          />
        </div>
      </Card>
    </div>
  )
}

// ─── Section: Seguridad ───────────────────────────────────────────────────────
function SeguridadSection({ config, update }: SectionProps) {
  const styles = useStyles()
  return (
    <div className={styles.section}>
      <Card>
        <CardHeader header={<Text weight="semibold">Autenticación</Text>} />
        <div className={styles.cardBody}>
          <Divider />
          <SwitchRow
            label="Requerir autenticación de dos factores (2FA)"
            hint="Obliga a todos los administradores a verificar su identidad por email al iniciar sesión."
            checked={config.requerir2FA}
            onChange={(v) => update('requerir2FA', v)}
          />
          <Divider />
          <SwitchRow
            label="Aplicar política de contraseñas seguras"
            hint="Mínimo 8 caracteres, mayúsculas, números y símbolos especiales."
            checked={config.passwordFuerte}
            onChange={(v) => update('passwordFuerte', v)}
          />
          <Divider />
          <Field label="Tiempo máximo de sesión inactiva">
            <Select
              value={config.sessionTimeoutMin}
              onChange={(e) => update('sessionTimeoutMin', e.currentTarget.value)}
            >
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
              <option value="240">4 horas</option>
              <option value="480">8 horas (jornada completa)</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader header={<Text weight="semibold">Protección contra accesos no autorizados</Text>} />
        <div className={styles.cardBody}>
          <div className={styles.grid2}>
            <Field
              label="Máximo de intentos de login fallidos"
              hint="Tras este número de intentos, la cuenta queda bloqueada temporalmente."
            >
              <Input
                type="number"
                min="3"
                max="10"
                value={config.maxIntentosFallidos}
                onChange={(_, d) => update('maxIntentosFallidos', d.value)}
                contentAfter={<Text size={200}>intentos</Text>}
              />
            </Field>
            <Field label="Duración del bloqueo por intentos fallidos">
              <Select
                value={config.bloqueoMinutos}
                onChange={(e) => update('bloqueoMinutos', e.currentTarget.value)}
              >
                <option value="5">5 minutos</option>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
              </Select>
            </Field>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Section: Catálogos ───────────────────────────────────────────────────────
const CATALOGS: Array<{ label: string; items: Array<{ label: string; color: 'brand' | 'success' | 'warning' | 'danger' | 'informative' | 'important' | 'subtle' }> }> = [
  {
    label: 'Estado de funcionario',
    items: [
      { label: 'Presupuestado', color: 'success' },
      { label: 'Zafral', color: 'informative' },
      { label: 'Contratado', color: 'brand' },
      { label: 'Baja', color: 'danger' },
    ],
  },
  {
    label: 'Régimen laboral',
    items: [
      { label: 'Full Time', color: 'success' },
      { label: '30h', color: 'informative' },
      { label: '20h', color: 'subtle' },
    ],
  },
  {
    label: 'Tipo de contrato',
    items: [
      { label: 'Zafral', color: 'informative' },
      { label: 'Temporal', color: 'brand' },
      { label: 'Suplencia', color: 'warning' },
    ],
  },
  {
    label: 'Estado de contrato',
    items: [
      { label: 'Vigente', color: 'success' },
      { label: 'Por vencer', color: 'warning' },
      { label: 'Vencido', color: 'danger' },
      { label: 'Rescindido', color: 'subtle' },
    ],
  },
  {
    label: 'Género',
    items: [
      { label: 'Masculino', color: 'informative' },
      { label: 'Femenino', color: 'informative' },
      { label: 'No binario', color: 'informative' },
      { label: 'Prefiero no decir', color: 'subtle' },
    ],
  },
  {
    label: 'Estado de asistencia',
    items: [
      { label: 'Presente', color: 'success' },
      { label: 'Falta', color: 'danger' },
      { label: 'Licencia', color: 'warning' },
    ],
  },
]

function CatalogosSection() {
  const styles = useStyles()
  return (
    <div className={styles.section}>
      <div className={styles.infoBox}>
        <Text size={300}>
          Los catálogos son los valores predefinidos que maneja el sistema.
          Son de solo lectura y están definidos en el modelo de datos del backend.
        </Text>
      </div>
      <div className={styles.grid2}>
        {CATALOGS.map((cat) => (
          <Card key={cat.label}>
            <CardHeader header={<Text weight="semibold">{cat.label}</Text>} />
            <div className={styles.cardBody}>
              <div className={styles.badgeGroup}>
                {cat.items.map((item) => (
                  <Badge key={item.label} appearance="filled" color={item.color}>
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const CONFIG_TABS = [
  { value: 'org', label: 'Organización', Icon: BuildingRegular },
  { value: 'contratos', label: 'Contratos', Icon: DocumentTextRegular },
  { value: 'asistencias', label: 'Asistencias', Icon: CalendarDayRegular },
  { value: 'notif', label: 'Notificaciones', Icon: WeatherMoonRegular },
  { value: 'seguridad', label: 'Seguridad', Icon: PersonCircleRegular },
  { value: 'catalogos', label: 'Catálogos', Icon: DataBarVerticalAscendingRegular },
] as const

// ─── Main page ────────────────────────────────────────────────────────────────
export function ConfiguracionPage() {
  const styles = useStyles()
  const [activeTab, setActiveTab] = useState<TabValue>('org')
  const [config, setConfig] = useState<AppConfig>(loadConfig)
  const [hasChanges, setHasChanges] = useState(false)
  const { dispatchToast } = useToastController(toasterId)

  function update<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setHasChanges(false)
    dispatchToast(
      <Toast>
        <ToastTitle>Configuración guardada</ToastTitle>
        <ToastBody>Los cambios se han aplicado y almacenado correctamente.</ToastBody>
      </Toast>,
      { intent: 'success' },
    )
  }

  function handleReset() {
    setConfig({ ...DEFAULT_CONFIG })
    setHasChanges(true)
    dispatchToast(
      <Toast>
        <ToastTitle>Valores restaurados</ToastTitle>
        <ToastBody>Se cargaron los valores predeterminados. No olvides guardar.</ToastBody>
      </Toast>,
      { intent: 'warning' },
    )
  }

  return (
    <div className={styles.root}>
      <PageHeader
        title="Configuración"
        subtitle="Parámetros generales del sistema de gestión de recursos humanos"
      />

      <div className={styles.layout}>
        {/* ── Sidebar nav ── */}
        <aside className={styles.sidebar}>
          <TabList
            vertical
            selectedValue={activeTab}
            onTabSelect={(_, data) => setActiveTab(data.value)}
          >
            {CONFIG_TABS.map(({ value, label, Icon }) => (
              <Tab key={value} value={value} icon={<Icon />}>
                {label}
              </Tab>
            ))}
          </TabList>
        </aside>

        {/* ── Content area ── */}
        <main className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={String(activeTab)}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {activeTab === 'org' && (
                <OrgSection config={config} update={update} />
              )}
              {activeTab === 'contratos' && (
                <ContratosSection config={config} update={update} />
              )}
              {activeTab === 'asistencias' && (
                <AsistenciasSection config={config} update={update} />
              )}
              {activeTab === 'notif' && (
                <NotifSection config={config} update={update} />
              )}
              {activeTab === 'seguridad' && (
                <SeguridadSection config={config} update={update} />
              )}
              {activeTab === 'catalogos' && <CatalogosSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Save bar ── */}
      <div className={styles.saveBar}>
        <div className={styles.saveBarLeft}>
          {hasChanges ? (
            <Badge appearance="filled" color="warning">Cambios sin guardar</Badge>
          ) : (
            <Badge appearance="filled" color="success">Al día</Badge>
          )}
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            La configuración se almacena localmente en el navegador.
          </Text>
        </div>
        <div className={styles.saveBarRight}>
          <Button
            icon={<SettingsRegular />}
            appearance="outline"
            onClick={handleReset}
          >
            Restaurar predeterminados
          </Button>
          <Button
            appearance="primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
