import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dropdown,
  Field,
  Input,
  Option,
  Textarea,
  Toast,
  ToastBody,
  ToastTitle,
  makeStyles,
  tokens,
  useToastController,
} from '@fluentui/react-components'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import type { Cargo, CreateFuncionarioInput, Dependencia, Funcionario } from '../../types/hr'
import { hrApiService } from '../../services/hrApiService'
import { ConfirmDialog } from './ConfirmDialog'

const useStyles = makeStyles({
  form: {
    display: 'grid',
    gap: '14px',
  },
  section: {
    display: 'grid',
    gap: '10px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: '12px',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '10px',
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'end',
  },
})

const schema = z
  .object({
    ci: z.string().min(1, 'CI es obligatorio'),
    nombres: z.string().min(2, 'Ingresá al menos 2 caracteres'),
    apellidos: z.string().min(2, 'Ingresá al menos 2 caracteres'),
    genero: z.string().min(1, 'Selección requerida'),
    fechaNacimiento: z.string().optional(),
    estadoCivil: z.string().optional(),
    dependenciaId: z.string().min(1, 'Seleccioná una dependencia'),
    cargoId: z.string().min(1, 'Seleccioná un cargo'),
    fechaIngreso: z.string().min(1, 'Ingresá fecha de ingreso'),
    regimenLaboral: z.string().min(1, 'Selección requerida'),
    estado: z.string().min(1, 'Selección requerida'),
    motivoBaja: z.string().optional(),
    telefono: z.string().optional(),
    email: z.union([z.literal(''), z.string().email('Email inválido')]),
    otroContacto: z.string().optional(),
    calle: z.string().optional(),
    entreCalles: z.string().optional(),
    zona: z.string().optional(),
    observaciones: z.string().optional(),
    educacionPrimaria: z.string().optional(),
    educacionSecundaria: z.string().optional(),
    educacionBachillerato: z.string().optional(),
    educacionTerciaria: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.estado === 'Baja' && !values.motivoBaja?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['motivoBaja'],
        message: 'El motivo es obligatorio cuando el estado es Baja',
      })
    }
  })

type FormValues = z.infer<typeof schema>

interface FuncionarioFormProps {
  initialValues?: Funcionario
  dependencias: Dependencia[]
  cargos: Cargo[]
  onSubmit: (values: CreateFuncionarioInput) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
}

const defaultValues: FormValues = {
  ci: '',
  nombres: '',
  apellidos: '',
  genero: '',
  fechaNacimiento: '',
  estadoCivil: undefined,
  dependenciaId: '',
  cargoId: '',
  fechaIngreso: '',
  regimenLaboral: '',
  estado: '',
  motivoBaja: '',
  telefono: '',
  email: '',
  otroContacto: '',
  calle: '',
  entreCalles: '',
  zona: '',
  observaciones: '',
  educacionPrimaria: undefined,
  educacionSecundaria: undefined,
  educacionBachillerato: undefined,
  educacionTerciaria: undefined,
}

const FIELD_LABELS: Record<string, string> = {
  ci: 'CI',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  genero: 'Género',
  fechaNacimiento: 'Fecha de nacimiento',
  estadoCivil: 'Estado civil',
  dependenciaId: 'Dependencia',
  cargoId: 'Cargo',
  fechaIngreso: 'Fecha de ingreso',
  regimenLaboral: 'Régimen',
  estado: 'Estado',
  motivoBaja: 'Motivo de baja',
  telefono: 'Teléfono',
  email: 'Email',
  otroContacto: 'Otro contacto',
  calle: 'Calle',
  entreCalles: 'Entre calles',
  zona: 'Zona',
  observaciones: 'Observaciones',
}

export function FuncionarioForm({
  initialValues,
  dependencias,
  cargos,
  onSubmit,
  onCancel,
  submitting,
}: FuncionarioFormProps) {
  const styles = useStyles()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { dispatchToast } = useToastController('app-toaster')

  const { data: opciones } = useQuery({
    queryKey: ['hr-opciones'],
    queryFn: hrApiService.getOpciones,
    staleTime: 5 * 60 * 1000,
  })

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
      ? {
          ci: initialValues.ci ?? '',
          nombres: initialValues.nombres ?? '',
          apellidos: initialValues.apellidos ?? '',
          genero: initialValues.genero ?? '',
          fechaNacimiento: initialValues.fechaNacimiento ?? '',
          estadoCivil: initialValues.estadoCivil ?? undefined,
          dependenciaId: initialValues.dependenciaId ?? '',
          cargoId: initialValues.cargoId ?? '',
          fechaIngreso: initialValues.fechaIngreso ?? '',
          regimenLaboral: initialValues.regimenLaboral ?? '',
          estado: initialValues.estado ?? '',
          motivoBaja: initialValues.motivoBaja ?? '',
          telefono: initialValues.telefono ?? '',
          email: initialValues.email ?? '',
          otroContacto: initialValues.otroContacto ?? '',
          calle: initialValues.calle ?? '',
          entreCalles: initialValues.entreCalles ?? '',
          zona: initialValues.zona ?? '',
          observaciones: initialValues.observaciones ?? '',
          educacionPrimaria: initialValues.educacionPrimaria ?? undefined,
          educacionSecundaria: initialValues.educacionSecundaria ?? undefined,
          educacionBachillerato: initialValues.educacionBachillerato ?? undefined,
          educacionTerciaria: initialValues.educacionTerciaria ?? undefined,
        }
      : defaultValues,
  })

  const estadoActual = watch('estado')
  const dependenciaSeleccionada = watch('dependenciaId')

  const cargosFiltrados = useMemo(
    () => cargos.filter((item) => item.dependenciaId === dependenciaSeleccionada),
    [cargos, dependenciaSeleccionada],
  )

  const submit = handleSubmit(
    async (values) => {
      await onSubmit({
        ...values,
        email: values.email || undefined,
        trabajosAnteriores: initialValues?.trabajosAnteriores ?? [],
        inasistencias: initialValues?.inasistencias ?? 0,
        paisNacimiento: initialValues?.paisNacimiento,
        departamentoNacimiento: initialValues?.departamentoNacimiento,
        otrasCapacitaciones: initialValues?.otrasCapacitaciones,
      })
    },
    (fieldErrors) => {
      const lines = Object.entries(fieldErrors)
        .map(([key, err]) => `• ${FIELD_LABELS[key] ?? key}: ${
          (err as { message?: string })?.message ?? 'valor inválido'
        }`)
        .join('\n')
      dispatchToast(
        <Toast>
          <ToastTitle>Formulario incompleto — no se guardó</ToastTitle>
          <ToastBody style={{ whiteSpace: 'pre-line' }}>{lines}</ToastBody>
        </Toast>,
        { intent: 'error', timeout: 10000 },
      )
    },
  )

  const handleCancel = () => {
    if (isDirty) {
      setConfirmOpen(true)
      return
    }
    onCancel()
  }

  return (
    <>
      <form className={styles.form} onSubmit={submit} aria-label="Formulario de funcionario">
        <section className={styles.section}>
          <strong>Datos personales</strong>
          <div className={styles.row3}>
            <Controller
              control={control}
              name="nombres"
              render={({ field }) => (
                <Field label="Nombres" validationMessage={errors.nombres?.message} required>
                  <Input value={field.value} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="apellidos"
              render={({ field }) => (
                <Field label="Apellidos" validationMessage={errors.apellidos?.message} required>
                  <Input value={field.value} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="ci"
              render={({ field }) => (
                <Field label="CI" validationMessage={errors.ci?.message} required>
                  <Input value={field.value} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} placeholder="1234567-8" />
                </Field>
              )}
            />
          </div>

          <div className={styles.row3}>
            <Controller
              control={control}
              name="genero"
              render={({ field }) => (
                <Field label="Género" validationMessage={errors.genero?.message} required>
                  <Dropdown
                    selectedOptions={[field.value]}
                    value={field.value}
                    onOptionSelect={(_, data) => field.onChange(data.optionValue)}
                  >
                    {(opciones?.generos ?? []).map((genero) => (
                      <Option key={genero} value={genero}>
                        {genero}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              )}
            />
            <Controller
              control={control}
              name="fechaNacimiento"
              render={({ field }) => (
                <Field label="Fecha de nacimiento">
                  <Input type="date" value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="estadoCivil"
              render={({ field }) => (
                <Field label="Estado civil" validationMessage={errors.estadoCivil?.message}>
                  <Dropdown
                    selectedOptions={field.value ? [field.value] : []}
                    value={field.value ?? ''}
                    onOptionSelect={(_, data) => field.onChange(data.optionValue)}
                  >
                    {(opciones?.estadosCiviles ?? []).map((estadoCivil) => (
                      <Option key={estadoCivil} value={estadoCivil}>
                        {estadoCivil}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              )}
            />
          </div>
        </section>

        <section className={styles.section}>
          <strong>Datos laborales</strong>
          <div className={styles.row3}>
            <Controller
              control={control}
              name="dependenciaId"
              render={({ field }) => (
                <Field label="Dependencia" validationMessage={errors.dependenciaId?.message} required>
                  <Dropdown
                    selectedOptions={field.value ? [field.value] : []}
                    value={dependencias.find((d) => d.id === field.value)?.nombre ?? ''}
                    onOptionSelect={(_, data) => field.onChange(data.optionValue ?? '')}
                  >
                    {dependencias.map((dependencia) => (
                      <Option key={dependencia.id} value={dependencia.id}>
                        {dependencia.nombre}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="cargoId"
              render={({ field }) => (
                <Field label="Cargo" validationMessage={errors.cargoId?.message} required>
                  <Dropdown
                    selectedOptions={field.value ? [field.value] : []}
                    value={cargosFiltrados.find((c) => c.id === field.value)?.nombre ?? cargos.find((c) => c.id === field.value)?.nombre ?? ''}
                    onOptionSelect={(_, data) => field.onChange(data.optionValue ?? '')}
                  >
                    {cargosFiltrados.map((cargo) => (
                      <Option key={cargo.id} value={cargo.id}>
                        {cargo.nombre}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="fechaIngreso"
              render={({ field }) => (
                <Field label="Fecha de ingreso" validationMessage={errors.fechaIngreso?.message} required>
                  <Input type="date" value={field.value} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
          </div>

          <div className={styles.row3}>
            <Controller
              control={control}
              name="regimenLaboral"
              render={({ field }) => (
                <Field label="Régimen" validationMessage={errors.regimenLaboral?.message} required>
                  <Dropdown
                    selectedOptions={[field.value]}
                    value={field.value}
                    onOptionSelect={(_, data) => field.onChange(data.optionValue)}
                  >
                    {(opciones?.regimenesLaborales ?? []).map((regimen) => (
                      <Option key={regimen} value={regimen}>
                        {regimen}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="estado"
              render={({ field }) => (
                <Field label="Estado" validationMessage={errors.estado?.message} required>
                  <Dropdown
                    selectedOptions={[field.value]}
                    value={field.value}
                    onOptionSelect={(_, data) => field.onChange(data.optionValue)}
                  >
                    {(opciones?.estadosFuncionario ?? []).map((estado) => (
                      <Option key={estado} value={estado}>
                        {estado}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              )}
            />
          </div>

          {estadoActual === 'Baja' ? (
            <Controller
              control={control}
              name="motivoBaja"
              render={({ field }) => (
                <Field label="Motivo de baja" validationMessage={errors.motivoBaja?.message} required>
                  <Textarea value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
          ) : null}
        </section>

        <section className={styles.section}>
          <strong>Contacto y observaciones</strong>
          <div className={styles.row3}>
            <Controller
              control={control}
              name="telefono"
              render={({ field }) => (
                <Field label="Teléfono" validationMessage={errors.telefono?.message}>
                  <Input value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field label="Email" validationMessage={errors.email?.message}>
                  <Input type="email" value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="otroContacto"
              render={({ field }) => (
                <Field label="Otro contacto" validationMessage={errors.otroContacto?.message}>
                  <Input value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
          </div>

          <div className={styles.row2}>
            <Controller
              control={control}
              name="calle"
              render={({ field }) => (
                <Field label="Calle">
                  <Input value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="entreCalles"
              render={({ field }) => (
                <Field label="Entre calles">
                  <Input value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
                </Field>
              )}
            />
          </div>

          <Controller
            control={control}
            name="zona"
            render={({ field }) => (
              <Field label="Zona">
                <Input value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="observaciones"
            render={({ field }) => (
              <Field label="Observaciones">
                <Textarea value={field.value ?? ''} onChange={(_, d) => field.onChange(d.value)} onBlur={field.onBlur} />
              </Field>
            )}
          />
        </section>

        <div className={styles.actions}>
          <Button appearance="secondary" onClick={handleCancel} type="button">
            Cancelar
          </Button>
          <Button appearance="primary" type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Descartar cambios"
        message="Tenés cambios sin guardar. ¿Querés salir igual?"
        confirmLabel="Salir sin guardar"
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          setConfirmOpen(false)
          onCancel()
        }}
      />
    </>
  )
}
