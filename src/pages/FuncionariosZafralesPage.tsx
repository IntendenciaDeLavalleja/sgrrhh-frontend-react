import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Select,
  Toast,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { EmptyState } from '../components/common/EmptyState'
import { FiltersBar } from '../components/common/FiltersBar'
import { FuncionarioZafralForm } from '../components/common/FuncionarioZafralForm'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { PageHeader } from '../components/common/PageHeader'
import type { CreateFuncionarioZafralInput, FuncionarioZafral } from '../types/hr'
import {
  findDependenciaNombre,
  findTareaNombre,
  formatNombreCompleto,
} from '../utils/hrFormatters'
import { hrApiService } from '../services/hrApiService'

const toasterId = 'app-toaster'

const tipoZafralBadgeColor = (
  tipo: string,
): 'brand' | 'danger' | 'important' | 'informative' | 'severe' | 'subtle' | 'success' | 'warning' => {
  switch (tipo) {
    case 'Uruguay Impulsa':
      return 'brand'
    case 'Yo estudio y trabajo':
      return 'success'
    case 'Pasantía':
      return 'informative'
    case 'Zafral Municipal':
      return 'subtle'
    default:
      return 'subtle'
  }
}

export function FuncionariosZafralesPage() {
  const navigate = useNavigate()
  const { dispatchToast } = useToastController(toasterId)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [tipoZafral, setTipoZafral] = useState('')
  const [dependenciaId, setDependenciaId] = useState('')
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: dependencias = [] } = useQuery({
    queryKey: ['dependencias'],
    queryFn: hrApiService.getDependencias,
  })

  const { data: tareas = [] } = useQuery({
    queryKey: ['tareas'],
    queryFn: hrApiService.getTareas,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['funcionarios-zafrales', search, estado, tipoZafral, dependenciaId, page],
    queryFn: () =>
      hrApiService.getFuncionariosZafrales({
        search,
        estado: estado as '' | FuncionarioZafral['estado'],
        tipoZafral: tipoZafral as '' | FuncionarioZafral['tipoZafral'],
        dependenciaId,
        page,
        pageSize: 8,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateFuncionarioZafralInput) =>
      hrApiService.createFuncionarioZafral(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios-zafrales'] })
      setDialogOpen(false)
      dispatchToast(
        <Toast>
          <ToastTitle>Funcionario zafral guardado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      )
    },
  })

  const columns = useMemo<DataTableColumn<FuncionarioZafral>[]>(
    () => [
      {
        key: 'ci',
        title: 'CI',
        render: (row) => row.ci,
      },
      {
        key: 'nombre',
        title: 'Nombre',
        render: (row) => formatNombreCompleto(row.nombres, row.apellidos),
      },
      {
        key: 'tipoZafral',
        title: 'Tipo',
        render: (row) => (
          <Badge color={tipoZafralBadgeColor(row.tipoZafral)} appearance="tint">
            {row.tipoZafral}
          </Badge>
        ),
      },
      {
        key: 'estado',
        title: 'Estado',
        render: (row) => (
          <Badge appearance={row.estado === 'Activo' ? 'filled' : 'outline'}>
            {row.estado}
          </Badge>
        ),
      },
      {
        key: 'dependencia',
        title: 'Dependencia',
        render: (row) => findDependenciaNombre(dependencias, row.dependenciaId),
      },
      {
        key: 'tarea',
        title: 'Tarea',
        render: (row) => findTareaNombre(tareas, row.tareaId),
      },
      {
        key: 'inicio',
        title: 'Inicio',
        render: (row) => row.fechaIngreso,
      },
      {
        key: 'acciones',
        title: 'Acciones',
        render: (row) => (
          <Button
            appearance="subtle"
            onClick={() => navigate(`/funcionarios-zafrales/${row.id}`)}
          >
            Ver detalle
          </Button>
        ),
      },
    ],
    [tareas, dependencias, navigate],
  )

  const resetFilters = () => {
    setSearch('')
    setEstado('')
    setTipoZafral('')
    setDependenciaId('')
    setPage(0)
  }

  return (
    <>
      <PageHeader
        title="Funcionarios Zafrales"
        subtitle="Listado con búsqueda incremental y filtros"
        primaryActionLabel="Nuevo funcionario zafral"
        onPrimaryAction={() => setDialogOpen(true)}
      />

      <FiltersBar
        searchLabel="Buscar"
        searchValue={search}
        searchPlaceholder="Nombre, apellido o CI"
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onReset={resetFilters}
      >
        <Field label="Estado">
          <Select
            value={estado}
            onChange={(event) => {
              setEstado(event.currentTarget.value)
              setPage(0)
            }}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Baja">Baja</option>
          </Select>
        </Field>

        <Field label="Tipo de zafral">
          <Select
            value={tipoZafral}
            onChange={(event) => {
              setTipoZafral(event.currentTarget.value)
              setPage(0)
            }}
            aria-label="Filtrar por tipo de zafral"
          >
            <option value="">Todos</option>
            <option value="Uruguay Impulsa">Uruguay Impulsa</option>
            <option value="Yo estudio y trabajo">Yo estudio y trabajo</option>
            <option value="Pasantía">Pasantía</option>
            <option value="Zafral Municipal">Zafral Municipal</option>
          </Select>
        </Field>

        <Field label="Dependencia">
          <Select
            value={dependenciaId}
            onChange={(event) => {
              setDependenciaId(event.currentTarget.value)
              setPage(0)
            }}
            aria-label="Filtrar por dependencia"
          >
            <option value="">Todas</option>
            {dependencias.map((dependencia) => (
              <option key={dependencia.id} value={dependencia.id}>
                {dependencia.nombre}
              </option>
            ))}
          </Select>
        </Field>
      </FiltersBar>

      {isLoading || !data ? (
        <LoadingSkeleton rows={7} />
      ) : data.data.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="No encontramos funcionarios zafrales para los filtros actuales."
          actionLabel="Limpiar filtros"
          onAction={resetFilters}
        />
      ) : (
        <DataTable
          rows={data.data}
          columns={columns}
          page={page}
          pageSize={8}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={(_, details) => setDialogOpen(details.open)}>
        <DialogSurface aria-label="Nuevo funcionario zafral">
          <DialogBody>
            <DialogTitle>Nuevo funcionario zafral</DialogTitle>
            <DialogContent>
              <FuncionarioZafralForm
                dependencias={dependencias}
                tareas={tareas}
                submitting={createMutation.isPending}
                onCancel={() => setDialogOpen(false)}
                onSubmit={async (values) => {
                  await createMutation.mutateAsync(values)
                }}
              />
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}
