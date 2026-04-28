import { Button, Text, makeStyles, tokens } from '@fluentui/react-components'

const useStyles = makeStyles({
  box: {
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
  },
})

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  const styles = useStyles()

  return (
    <section className={styles.box} aria-live="polite">
      <Text size={500} weight="semibold">
        {title}
      </Text>
      <Text size={300}>{description}</Text>
      {onAction && actionLabel ? (
        <Button appearance="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  )
}
