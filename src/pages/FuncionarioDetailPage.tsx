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
import { FuncionarioForm } from '../components/common/FuncionarioForm'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { PageHeader } from '../components/common/PageHeader'
import { hrApiService } from '../services/hrApiService'
import { estadoBadgeAppearance, findCargoNombre, findDependenciaNombre } from '../utils/hrFormatters'

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

export function FuncionarioDetailPage() {
  const styles = useStyles()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { dispatchToast } = useToastController(toasterId)

  const [activeTab, setActiveTab] = useState<'personal' | 'laboral' | 'contacto' | 'educacion'>('personal')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const { data: funcionario, isLoading } = useQuery({
    queryKey: ['funcionario', id],
    queryFn: () => hrApiService.getFuncionarioById(id ?? ''),
    enabled: Boolean(id),
  })

  const { data: dependencias = [] } = useQuery({
    queryKey: ['dependencias'],
    queryFn: hrApiService.getDependencias,
  })

  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos'],
    queryFn: hrApiService.getCargos,
  })

  const { data: _contratos = [] } = useQuery({
    queryKey: ['contratos-funcionario', id],
    queryFn: () => hrApiService.getContratosByFuncionario(id ?? ''),
    enabled: Boolean(id),
  })

  const { data: _asistencias = [] } = useQuery({
    queryKey: ['asistencias-funcionario', id],
    queryFn: () => hrApiService.getAsistenciasByFuncionario(id ?? ''),
    enabled: Boolean(id),
  })

  const { data: _documentos = [] } = useQuery({
    queryKey: ['documentos-funcionario', id],
    queryFn: () => hrApiService.getDocumentosByFuncionario(id ?? ''),
    enabled: Boolean(id),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof hrApiService.updateFuncionario>[1]) =>
      hrApiService.updateFuncionario(id ?? '', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] })
      queryClient.invalidateQueries({ queryKey: ['funcionario', id] })
      setEditOpen(false)
      dispatchToast(
        <Toast>
          <ToastTitle>Funcionario actualizado</ToastTitle>
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
    mutationFn: () => hrApiService.deleteFuncionario(id ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      dispatchToast(
        <Toast>
          <ToastTitle>Funcionario eliminado</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      )
      navigate('/funcionarios')
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

  const personalInfo = useMemo(
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
            ['Cargo', findCargoNombre(cargos, funcionario.cargoId)],
            ['Fecha ingreso', funcionario.fechaIngreso],
            ['Régimen laboral', funcionario.regimenLaboral],
            ['Estado', funcionario.estado],
            ['Inasistencias', String(funcionario.inasistencias)],
          ]
        : [],
    [cargos, dependencias, funcionario],
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
        onAction={() => navigate('/funcionarios')}
      />
    )
  }

  return (
    <>
      <PageHeader
        title={`${funcionario.nombres} ${funcionario.apellidos}`}
        subtitle="Detalle del funcionario"
        actions={
          <>
            <Button appearance="secondary" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button appearance="secondary" onClick={() => setDeleteOpen(true)}>
              Eliminar
            </Button>
          </>
        }
      />

      <TabList selectedValue={activeTab} onTabSelect={(_, data) => setActiveTab(data.value as typeof activeTab)}>
        <Tab value="personal">Datos personales</Tab>
        <Tab value="laboral">Datos laborales</Tab>
        <Tab value="contacto">Contacto</Tab>
        <Tab value="educacion">Educación</Tab>
      </TabList>

      <div style={{ marginTop: 12 }}>
        {activeTab === 'personal' && (
          <section className={styles.section}>
            <div className={styles.row}>
              {personalInfo.map(([label, value]) => (
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
                  {label === 'Estado' ? (
                    <Badge appearance={estadoBadgeAppearance(funcionario.estado)}>{funcionario.estado}</Badge>
                  ) : (
                    <strong>{value}</strong>
                  )}
                </div>
              ))}
            </div>
            {funcionario.estado === 'Baja' && funcionario.motivoBaja ? (
              <div className={styles.item}>
                <span className={styles.label}>Motivo de baja</span>
                <strong>{funcionario.motivoBaja}</strong>
              </div>
            ) : null}
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
            <DialogTitle>Editar funcionario</DialogTitle>
            <DialogContent>
              <FuncionarioForm
                initialValues={funcionario}
                dependencias={dependencias}
                cargos={cargos}
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
        title="Eliminar funcionario"
        message="Esta acción eliminará permanentemente al funcionario y todos sus datos asociados."
        confirmLabel="Eliminar"
        onConfirm={() => {
          setDeleteOpen(false)
          deleteMutation.mutate()
        }}
      />
    </>
  )
}
