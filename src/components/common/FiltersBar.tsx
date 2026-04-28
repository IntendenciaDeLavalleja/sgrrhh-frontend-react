import { Button, Field, Input, makeStyles, tokens } from '@fluentui/react-components'
import type { ReactNode } from 'react'

const useStyles = makeStyles({
  wrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '12px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  actions: {
    display: 'flex',
    alignItems: 'end',
    gap: '8px',
  },
})

interface FiltersBarProps {
  searchLabel: string
  searchValue: string
  searchPlaceholder?: string
  onSearchChange: (value: string) => void
  children?: ReactNode
  onReset?: () => void
}

export function FiltersBar({
  searchLabel,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  children,
  onReset,
}: FiltersBarProps) {
  const styles = useStyles()

  return (
    <section className={styles.wrapper} aria-label="Barra de filtros">
      <Field label={searchLabel}>
        <Input
          value={searchValue}
          onChange={(_, data) => onSearchChange(data.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
        />
      </Field>

      {children}

      <div className={styles.actions}>
        {onReset ? (
          <Button appearance="secondary" onClick={onReset}>
            Resetear filtros
          </Button>
        ) : null}
      </div>
    </section>
  )
}
