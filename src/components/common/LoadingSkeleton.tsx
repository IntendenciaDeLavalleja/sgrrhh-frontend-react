import { Skeleton, SkeletonItem, makeStyles } from '@fluentui/react-components'

const useStyles = makeStyles({
  wrapper: {
    display: 'grid',
    gap: '10px',
  },
})

interface LoadingSkeletonProps {
  rows?: number
}

export function LoadingSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  const styles = useStyles()

  return (
    <Skeleton aria-label="Cargando información" className={styles.wrapper}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonItem key={index} shape="rectangle" size={32} />
      ))}
    </Skeleton>
  )
}
