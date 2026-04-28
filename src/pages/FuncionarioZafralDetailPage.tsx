import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Tab,
  TabList,
  Toast,
  ToastTitle,
  makeStyles,
  tokens,
  useToastController,
} from '@fluentui/react-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { FuncionarioZafralForm } from '../components/common/FuncionarioZafralForm'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { PageHeader } from '../components/common/PageHeader'
import { hrApiService } from '../services/hrApiService'
import type { UpdateFuncionarioZafralInput } from '../types/hr'
import { findDependenciaNombre, findTareaNombre } from '../utils/hrFormatters'

const toasterId = 'app-toaster'

const useStyles = makeStyles({
  section: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: '14px',
    display: 'grid',
    gap: '10px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '8px',
  },
  item: {
    display: 'grid',
    gap: '3px',
  },
  label: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
})

export function FuncionarioZafralDetailPage() {
  const styles = useStyles()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { dispatchToast } = useToastController(toasterId)

  const [activeTab, setActiveTab] = useState<'general' | 'laboral' | 'contacto' | 'educacion'>('general')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const { data: funcionario, isLoading } = useQuery({
    queryKey: ['funcionario-zafral', id],
    queryFn: () => hrApiService.getFuncionarioZafralById(id ?? ''),
    enabled: Boolean(id),
  })

  const { data: dependencias = [] } = useQuery({
    queryKey: ['dependencias'],
    queryFn: hrApiService.getDependencias,
  })

  const { data: tareas = [] } = useQuery({
    queryKey: ['tareas'],
    queryFn: hrApiService.getTareas,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateFuncionarioZafralInput) =>
      hrApiService.updateFuncionarioZafral(id ?? '', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios-zafrales'] })
      queryClient.invalidateQueries({ queryKey: ['funcionario-zafral', id] })
      setEditOpen(false)
      dispatchToast(
        <Toast>
          <ToastTitle>Funcionario zafral actualizado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      )
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Error al guardar los cambios'
      dispatchToast(
        <Toast>
          <ToastTitle>Error al guardar</ToastTitle>
          <span>{msg}</span>
        </Toast>,
        { intent: 'error' },
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => hrApiService.deleteFuncionarioZafral(id ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios-zafrales'] })
      dispatchToast(
        <Toast>
          <ToastTitle>Funcionario zafral eliminado</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      )
      navigate('/funcionarios-zafrales')
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Error al eliminar el funcionario'
      dispatchToast(
        <Toast>
          <ToastTitle>Error al eliminar</ToastTitle>
          <span>{msg}</span>
        </Toast>,
        { intent: 'error' },
      )
    },
  })

  const tipoZafralBadgeColor = (
    tipo: string,
  ): 'brand' | 'danger' | 'important' | 'informative' | 'severe' | 'subtle' | 'success' | 'warning' => {
    switch (tipo) {
      case 'Uruguay Impulsa': return 'brand'
      case 'Yo estudio y trabajo': return 'success'
      case 'Pasantía': return 'informative'
      default: return 'subtle'
    }
  }

  const generalInfo = useMemo(
    () =>
      funcionario
        ? [
            ['CI', funcionario.ci],
            ['Nombres', funcionario.nombres],
            ['Apellidos', funcionario.apellidos],
            ['Género', funcionario.genero],
            ['Fecha de nacimiento', funcionario.fechaNacimiento ?? '-'],
            ['País de nacimiento', funcionario.paisNacimiento ?? '-'],
            ['Departamento de nacimiento', funcionario.departamentoNacimiento ?? '-'],
            ['Estado civil', funcionario.estadoCivil ?? '-'],
          ]
        : [],
    [funcionario],
  )

  const laboralInfo = useMemo(
    () =>
      funcionario
        ? [
            ['Dependencia', findDependenciaNombre(dependencias, funcionario.dependenciaId)],
            ['Tarea', findTareaNombre(tareas, funcionario.tareaId)],
            ['Tipo de zafral', funcionario.tipoZafral],
            ['Fecha de ingreso', funcionario.fechaIngreso],
            ['Régimen laboral', funcionario.regimenLaboral],
            ['Inasistencias', String(funcionario.inasistencias)],
          ]
        : [],
    [dependencias, funcionario, tareas],
  )

  const contactoInfo = useMemo(
    () =>
      funcionario
        ? [
            ['Teléfono', funcionario.telefono ?? '-'],
            ['Email', funcionario.email ?? '-'],
            ['Otro contacto', funcionario.otroContacto ?? '-'],
            ['Calle', funcionario.calle ?? '-'],
            ['Entre calles', funcionario.entreCalles ?? '-'],
            ['Zona', funcionario.zona ?? '-'],
          ]
        : [],
    [funcionario],
  )

  const educacionInfo = useMemo(
    () =>
      funcionario
        ? [
            ['Primaria', funcionario.educacionPrimaria ?? '-'],
            ['Secundaria', funcionario.educacionSecundaria ?? '-'],
            ['Bachillerato', funcionario.educacionBachillerato ?? '-'],
            ['Terciaria', funcionario.educacionTerciaria ?? '-'],
            ['Otras capacitaciones', funcionario.otrasCapacitaciones ?? '-'],
          ]
        : [],
    [funcionario],
  )

  if (isLoading) {
    return <LoadingSkeleton rows={8} />
  }

  if (!funcionario) {
    return (
      <EmptyState
        title="Funcionario no encontrado"
        description="El registro no existe o fue eliminado."
        actionLabel="Volver al listado"
        onAction={() => navigate('/funcionarios-zafrales')}
      />
    )
  }

  return (
    <>
      <PageHeader
        title={`${funcionario.nombres} ${funcionario.apellidos}`}
        subtitle="Detalle del funcionario zafral"
        actions={
          <>
            <Button appearance="secondary" onClick={() => navigate('/funcionarios-zafrales')}>
              Volver
            </Button>
            <Button appearance="secondary" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button appearance="secondary" onClick={() => setDeleteOpen(true)}>
              Eliminar
            </Button>
          </>
        }
      />

      <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge
          color={tipoZafralBadgeColor(funcionario.tipoZafral)}
          appearance="tint"
        >
          {funcionario.tipoZafral}
        </Badge>
        <Badge appearance={funcionario.estado === 'Activo' ? 'filled' : 'outline'}>
          {funcionario.estado}
        </Badge>
        {funcionario.estado === 'Baja' && funcionario.motivoBaja ? (
          <span style={{ color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 }}>
            Motivo: {funcionario.motivoBaja}
          </span>
        ) : null}
      </div>

      <TabList
        selectedValue={activeTab}
        onTabSelect={(_, data) => setActiveTab(data.value as typeof activeTab)}
      >
        <Tab value="general">Datos personales</Tab>
        <Tab value="laboral">Datos laborales</Tab>
        <Tab value="contacto">Contacto</Tab>
        <Tab value="educacion">Educación</Tab>
      </TabList>

      <div style={{ marginTop: 12 }}>
        {activeTab === 'general' && (
          <section className={styles.section}>
            <div className={styles.row}>
              {generalInfo.map(([label, value]) => (
                <div key={label} className={styles.item}>
                  <span className={styles.label}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'laboral' && (
          <section className={styles.section}>
            <div className={styles.row}>
              {laboralInfo.map(([label, value]) => (
                <div key={label} className={styles.item}>
                  <span className={styles.label}>{label}</span>
                  {label === 'Tipo de zafral' ? (
                    <Badge
                      color={tipoZafralBadgeColor(value)}
                      appearance="tint"
                    >
                      {value}
                    </Badge>
                  ) : (
                    <strong>{value}</strong>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.item}>
              <span className={styles.label}>Observaciones</span>
              <strong>{funcionario.observaciones || 'Sin observaciones'}</strong>
            </div>
          </section>
        )}

        {activeTab === 'contacto' && (
          <section className={styles.section}>
            <div className={styles.row}>
              {contactoInfo.map(([label, value]) => (
                <div key={label} className={styles.item}>
                  <span className={styles.label}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'educacion' && (
          <section className={styles.section}>
            <div className={styles.row}>
              {educacionInfo.map(([label, value]) => (
                <div key={label} className={styles.item}>
                  <span className={styles.label}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={(_, data) => setEditOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Editar funcionario zafral</DialogTitle>
            <DialogContent>
              <FuncionarioZafralForm
                initialValues={funcionario}
                dependencias={dependencias}
                tareas={tareas}
                submitting={updateMutation.isPending}
                onCancel={() => setEditOpen(false)}
                onSubmit={async (values) => {
                  try {
                    await updateMutation.mutateAsync(values)
                  } catch {
                    // error is handled by onError in the mutation
                  }
                }}
              />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar funcionario zafral"
        message="Esta acción eliminará permanentemente al funcionario zafral y todos sus datos asociados."
        confirmLabel="Eliminar"
        onConfirm={() => {
          setDeleteOpen(false)
          deleteMutation.mutate()
        }}
      />
    </>
  )
}
