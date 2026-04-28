import {
  Badge,
  Button,
  Combobox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Option,
  Select,
  Spinner,
  Toast,
  ToastTitle,
  Tooltip,
  makeStyles,
  tokens,
  useToastController,
} from '@fluentui/react-components'
import { Delete24Regular, DocumentPdf24Regular, Eye24Regular } from '@fluentui/react-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { hrApiService } from '../services/hrApiService'
import type { Contrato, CreateContratoInput } from '../types/hr'
import { estadoBadgeAppearance, formatNombreCompleto } from '../utils/hrFormatters'

const toasterId = 'app-toaster'

const MAX_PDF_BYTES = 1 * 1024 * 1024 // 1 MB

const useStyles = makeStyles({
  form: {
    display: 'grid',
    gap: '10px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '10px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'end',
    gap: '8px',
  },
  uploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  fileName: {
    fontSize: '13px',
    opacity: 0.8,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '260px',
  },
  fileError: {
    fontSize: '12px',
    color: '#f25022',
  },
  // PDF Viewer styles
  pdfDialogSurface: {
    width: '90vw',
    maxWidth: '1100px',
    height: '92vh',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusXLarge,
  },
  pdfDialogBody: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  pdfHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
    gap: '12px',
  },
  pdfHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  pdfHeaderTitle: {
    fontSize: '16px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pdfHeaderSubtitle: {
    fontSize: '12px',
    opacity: 0.65,
    whiteSpace: 'nowrap',
  },
  pdfHeaderActions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  pdfIframeWrapper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
    position: 'relative',
  },
  pdfIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  pdfSpinnerOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '12px',
  },
  pdfNoPdfWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '12px',
    opacity: 0.55,
  },
})

export function ContratosPage() {
  const styles = useStyles()
  const queryClient = useQueryClient()
  const { dispatchToast } = useToastController(toasterId)
  const [open, setOpen] = useState(false)
  const [funcionarioQuery, setFuncionarioQuery] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfError, setPdfError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // PDF viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerContrato, setViewerContrato] = useState<Contrato | null>(null)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerLoading, setViewerLoading] = useState(false)
  const [deletePdfConfirmOpen, setDeletePdfConfirmOpen] = useState(false)

  const openPdfViewer = useCallback(async (contrato: Contrato) => {
    setViewerContrato(contrato)
    setViewerUrl(null)
    setViewerLoading(true)
    setViewerOpen(true)
    try {
      const presignedUrl = await hrApiService.getContratoPdf(contrato.id)
      setViewerUrl(presignedUrl)
    } catch {
      // will show "sin documento" state
    } finally {
      setViewerLoading(false)
    }
  }, [])

  const deletePdfMutation = useMutation({
    mutationFn: (id: string) => hrApiService.deleteContratoPdf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      setDeletePdfConfirmOpen(false)
      setViewerOpen(false)
      dispatchToast(
        <Toast><ToastTitle>Documento eliminado de MinIO</ToastTitle></Toast>,
        { intent: 'success' },
      )
    },
    onError: () => {
      dispatchToast(
        <Toast><ToastTitle>Error al eliminar el documento</ToastTitle></Toast>,
        { intent: 'error' },
      )
    },
  })

  const { register, handleSubmit, reset, setValue } = useForm<CreateContratoInput>({
    defaultValues: {
      funcionarioId: '',
      tipo: 'Zafral',
      fechaInicio: '',
      fechaFin: '',
      estado: 'Vigente',
      sueldoNominal: 0,
      observaciones: '',
    },
  })

  const { data: contratos = [] } = useQuery({ queryKey: ['contratos'], queryFn: hrApiService.getContratos })
  const { data: funcionarios = [] } = useQuery({
    queryKey: ['funcionarios-contratos'],
    queryFn: () => hrApiService.getFuncionarios({ page: 0, pageSize: 500 }),
    select: (response) => response.data,
  })

  const filteredFuncionarios = useMemo(() => {
    const q = funcionarioQuery.toLowerCase().trim()
    if (!q) return funcionarios
    return funcionarios.filter(
      (f) =>
        formatNombreCompleto(f.nombres, f.apellidos).toLowerCase().includes(q) ||
        f.ci.toLowerCase().includes(q),
    )
  }, [funcionarios, funcionarioQuery])

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPdfFile(null)
    setPdfError('')
    if (!file) return
    if (file.type !== 'application/pdf') {
      setPdfError('Solo se admite formato PDF.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      setPdfError('El archivo supera el límite de 1 MB.')
      e.target.value = ''
      return
    }
    setPdfFile(file)
  }

  const resetForm = () => {
    reset()
    setFuncionarioQuery('')
    setPdfFile(null)
    setPdfError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateContratoInput) => hrApiService.createContrato(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      resetForm()
      setOpen(false)
      dispatchToast(
        <Toast>
          <ToastTitle>Contrato guardado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      )
    },
  })

  const columns = useMemo<DataTableColumn<Contrato>[]>(
    () => [
      {
        key: 'funcionario',
        title: 'Funcionario',
        render: (row) => {
          const funcionario = funcionarios.find((item) => item.id === row.funcionarioId)
          return funcionario
            ? formatNombreCompleto(funcionario.nombres, funcionario.apellidos)
            : 'Sin vínculo'
        },
      },
      { key: 'tipo', title: 'Tipo', render: (row) => row.tipo },
      { key: 'inicio', title: 'Inicio', render: (row) => row.fechaInicio },
      { key: 'fin', title: 'Fin', render: (row) => row.fechaFin },
      {
        key: 'estado',
        title: 'Estado',
        render: (row) => <Badge appearance={estadoBadgeAppearance(row.estado)}>{row.estado}</Badge>,
      },
      { key: 'sueldo', title: 'Sueldo', render: (row) => `$ ${row.sueldoNominal.toLocaleString('es-UY')}` },
      {
        key: 'pdf',
        title: 'PDF',
        render: (row) =>
          row.tienePdf ? (
            <Tooltip content="Ver contrato PDF" relationship="label">
              <Button
                appearance="subtle"
                size="small"
                icon={<Eye24Regular />}
                onClick={() => openPdfViewer(row)}
              />
            </Tooltip>
          ) : (
            <span style={{ opacity: 0.3, fontSize: '12px' }}>—</span>
          ),
      },
    ],
    [funcionarios, openPdfViewer],
  )

  return (
    <>
      <PageHeader
        title="Contratos"
        subtitle="Listado y registro de contratos"
        primaryActionLabel="Nuevo contrato"
        onPrimaryAction={() => setOpen(true)}
      />

      {contratos.length === 0 ? (
        <EmptyState
          title="Sin contratos"
          description="Todavía no hay contratos cargados en la maqueta."
          actionLabel="Crear contrato"
          onAction={() => setOpen(true)}
        />
      ) : (
        <DataTable rows={contratos} columns={columns} page={0} pageSize={contratos.length || 1} total={contratos.length} onPageChange={() => {}} />
      )}

      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Nuevo contrato</DialogTitle>
            <DialogContent>
              <form
                className={styles.form}
                onSubmit={handleSubmit(async (values) => {
                  let documentoBase64: string | undefined
                  if (pdfFile) {
                    documentoBase64 = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = reader.result as string
                        // strip "data:application/pdf;base64," prefix
                        resolve(result.split(',')[1])
                      }
                      reader.onerror = reject
                      reader.readAsDataURL(pdfFile)
                    })
                  }
                  await createMutation.mutateAsync({
                    ...values,
                    sueldoNominal: Number(values.sueldoNominal),
                    documentoBase64,
                  })
                })}
              >
                <div className={styles.row}>
                  <Field label="Funcionario" required>
                    <input type="hidden" {...register('funcionarioId', { required: true })} />
                    <Combobox
                      placeholder="Buscar por nombre o cédula..."
                      value={funcionarioQuery}
                      onChange={(e) => {
                        setFuncionarioQuery(e.target.value)
                        setValue('funcionarioId', '')
                      }}
                      onOptionSelect={(_, data) => {
                        setFuncionarioQuery(data.optionText ?? '')
                        setValue('funcionarioId', data.optionValue ?? '', { shouldValidate: true })
                      }}
                      freeform
                      style={{ width: '100%' }}
                    >
                      {filteredFuncionarios.length === 0 ? (
                        <Option value="" disabled text="Sin resultados">
                          Sin resultados
                        </Option>
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

                  <Field label="Tipo" required>
                    <Select {...register('tipo', { required: true })}>
                      <option value="Zafral">Zafral</option>
                      <option value="Temporal">Temporal</option>
                      <option value="Suplencia">Suplencia</option>
                    </Select>
                  </Field>
                </div>

                <div className={styles.row}>
                  <Field label="Fecha inicio" required>
                    <Input type="date" {...register('fechaInicio', { required: true })} />
                  </Field>
                  <Field label="Fecha fin" required>
                    <Input type="date" {...register('fechaFin', { required: true })} />
                  </Field>
                </div>

                <div className={styles.row}>
                  <Field label="Estado" required>
                    <Select {...register('estado', { required: true })}>
                      <option value="Vigente">Vigente</option>
                      <option value="Por vencer">Por vencer</option>
                      <option value="Vencido">Vencido</option>
                      <option value="Rescindido">Rescindido</option>
                    </Select>
                  </Field>
                  <Field label="Sueldo nominal" required>
                    <Input type="number" min={0} {...register('sueldoNominal', { required: true, valueAsNumber: true })} />
                  </Field>
                </div>

                <Field label="Observaciones">
                  <Input {...register('observaciones')} />
                </Field>

                <Field label="Documento de contrato (PDF, máx. 1 MB)">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={handlePdfChange}
                  />
                  <div className={styles.uploadRow}>
                    <Button
                      appearance="outline"
                      size="small"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {pdfFile ? 'Cambiar archivo' : 'Seleccionar PDF'}
                    </Button>
                    {pdfFile && (
                      <span className={styles.fileName} title={pdfFile.name}>
                        {pdfFile.name}
                      </span>
                    )}
                    {pdfFile && (
                      <Button
                        appearance="subtle"
                        size="small"
                        type="button"
                        onClick={() => {
                          setPdfFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        Quitar
                      </Button>
                    )}
                  </div>
                  {pdfError && <span className={styles.fileError}>{pdfError}</span>}
                </Field>

                <div className={styles.actions}>
                  <Button appearance="secondary" onClick={() => { setOpen(false); resetForm() }} type="button">
                    Cancelar
                  </Button>
                  <Button appearance="primary" type="submit" disabled={createMutation.isPending}>
                    Guardar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* ── PDF Viewer Dialog ── */}
      <Dialog
        open={viewerOpen}
        onOpenChange={(_, d) => {
          if (!d.open) setViewerOpen(false)
        }}
      >
        <DialogSurface className={styles.pdfDialogSurface}>
          <DialogBody className={styles.pdfDialogBody}>
            {/* Custom header */}
            <div className={styles.pdfHeader}>
              <div className={styles.pdfHeaderLeft}>
                <DocumentPdf24Regular style={{ color: '#e84040', flexShrink: 0 }} />
                <div>
                  <div className={styles.pdfHeaderTitle}>
                    Contrato —{' '}
                    {viewerContrato
                      ? (() => {
                          const f = funcionarios.find((x) => x.id === viewerContrato.funcionarioId)
                          return f ? formatNombreCompleto(f.nombres, f.apellidos) : 'Funcionario'
                        })()
                      : ''}
                  </div>
                  {viewerContrato && (
                    <div className={styles.pdfHeaderSubtitle}>
                      {viewerContrato.tipo} · {viewerContrato.fechaInicio} → {viewerContrato.fechaFin}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.pdfHeaderActions}>
                {viewerUrl && (
                  <>
                    <Button
                      as="a"
                      href={viewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      appearance="outline"
                      size="small"
                      icon={<DocumentPdf24Regular />}
                    >
                      Descargar
                    </Button>
                    <Tooltip content="Eliminar documento de MinIO" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete24Regular />}
                        style={{ color: tokens.colorPaletteRedForeground1 }}
                        onClick={() => setDeletePdfConfirmOpen(true)}
                      />
                    </Tooltip>
                  </>
                )}
                <Button appearance="secondary" size="small" onClick={() => setViewerOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>

            {/* PDF area */}
            <div className={styles.pdfIframeWrapper}>
              {viewerLoading && (
                <div className={styles.pdfSpinnerOverlay}>
                  <Spinner size="large" label="Cargando documento…" />
                </div>
              )}

              {!viewerLoading && !viewerUrl && (
                <div className={styles.pdfNoPdfWrapper}>
                  <DocumentPdf24Regular style={{ width: 48, height: 48 }} />
                  <span>Este contrato no tiene documento adjunto.</span>
                </div>
              )}

              {!viewerLoading && viewerUrl && (
                <iframe
                  className={styles.pdfIframe}
                  src={viewerUrl}
                  title="Visor de contrato PDF"
                />
              )}
            </div>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* ── Delete PDF confirmation dialog ── */}
      <Dialog open={deletePdfConfirmOpen} onOpenChange={(_, d) => setDeletePdfConfirmOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>¿Eliminar documento PDF?</DialogTitle>
            <DialogContent>
              Esta acción eliminará el archivo PDF del almacenamiento (MinIO) de forma permanente.
              El contrato permanecerá en el sistema pero sin documento adjunto.
              <br /><br />
              <strong>¿Confirmar eliminación?</strong>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => setDeletePdfConfirmOpen(false)}>
                  Cancelar
                </Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                icon={<Delete24Regular />}
                disabled={deletePdfMutation.isPending}
                onClick={() => viewerContrato && deletePdfMutation.mutate(viewerContrato.id)}
              >
                Eliminar definitivamente
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}
