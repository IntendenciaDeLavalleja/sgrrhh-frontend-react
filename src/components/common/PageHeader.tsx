import { Button, Text, makeStyles, tokens } from '@fluentui/react-components'
import type { ReactNode } from 'react'

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    paddingBottom: '20px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  accent: {
    width: '32px',
    height: '3px',
    borderRadius: '999px',
    backgroundColor: tokens.colorBrandBackground,
    marginBottom: '2px',
  },
  title: {
    color: tokens.colorNeutralForeground1,
    lineHeight: '1.2',
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: '4px',
  },
})

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  onPrimaryAction?: () => void
  primaryActionLabel?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  onPrimaryAction,
  primaryActionLabel,
}: PageHeaderProps) {
  const styles = useStyles()

  return (
    <header className={styles.wrapper}>
      <div className={styles.titleBlock}>
        <div className={styles.accent} aria-hidden="true" />
        <Text as="h1" size={700} weight="semibold" className={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text size={300} className={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </div>

      <div className={styles.actions}>
        {actions}
        {onPrimaryAction && primaryActionLabel ? (
          <Button appearance="primary" onClick={onPrimaryAction}>
            {primaryActionLabel}
          </Button>
        ) : null}
      </div>
    </header>
  )
}

