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
import { FuncionarioForm } from '../components/common/FuncionarioForm'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { PageHeader } from '../components/common/PageHeader'
import type { CreateFuncionarioInput, Funcionario } from '../types/hr'
import {
  estadoBadgeAppearance,
  findCargoNombre,
  findDependenciaNombre,
  formatNombreCompleto,
} from '../utils/hrFormatters'
import { hrApiService } from '../services/hrApiService'

const toasterId = 'app-toaster'

export function FuncionariosPage() {
  const navigate = useNavigate()
  const { dispatchToast } = useToastController(toasterId)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [dependenciaId, setDependenciaId] = useState('')
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: dependencias = [] } = useQuery({
    queryKey: ['dependencias'],
    queryFn: hrApiService.getDependencias,
  })

  const { data: cargos = [] } = useQuery({ queryKey: ['cargos'], queryFn: hrApiService.getCargos })

  const { data, isLoading } = useQuery({
    queryKey: ['funcionarios', search, estado, dependenciaId, page],
    queryFn: () =>
      hrApiService.getFuncionarios({
        search,
        estado: estado as '' | Funcionario['estado'],
        dependenciaId,
        page,
        pageSize: 8,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateFuncionarioInput) => hrApiService.createFuncionario(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setDialogOpen(false)
      dispatchToast(
        <Toast>
          <ToastTitle>Funcionario guardado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      )
    },
  })

  const columns = useMemo<DataTableColumn<Funcionario>[]>(
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
        key: 'estado',
        title: 'Estado',
        render: (row) => <Badge appearance={estadoBadgeAppearance(row.estado)}>{row.estado}</Badge>,
      },
      {
        key: 'dependencia',
        title: 'Dependencia',
        render: (row) => findDependenciaNombre(dependencias, row.dependenciaId),
      },
      {
        key: 'cargo',
        title: 'Cargo',
        render: (row) => findCargoNombre(cargos, row.cargoId),
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
          <Button appearance="subtle" onClick={() => navigate(`/funcionarios/${row.id}`)}>
            Ver detalle
          </Button>
        ),
      },
    ],
    [cargos, dependencias, navigate],
  )

  const resetFilters = () => {
    setSearch('')
    setEstado('')
    setDependenciaId('')
    setPage(0)
  }

  return (
    <>
      <PageHeader
        title="Funcionarios"
        subtitle="Listado de funcionarios presupuestados, contratados y en licencia"
        primaryActionLabel="Nuevo funcionario"
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
            <option value="Presupuestado">Presupuestado</option>
            <option value="Contratado">Contratado</option>
            <option value="Licencia">Licencia</option>
            <option value="Baja">Baja</option>
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
          description="No encontramos funcionarios para los filtros actuales."
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
        <DialogSurface aria-label="Nuevo funcionario">
          <DialogBody>
            <DialogTitle>Nuevo funcionario</DialogTitle>
            <DialogContent>
              <FuncionarioForm
                dependencias={dependencias}
                cargos={cargos}
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
