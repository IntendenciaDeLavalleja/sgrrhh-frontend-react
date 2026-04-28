import { Card, CardHeader, makeStyles, tokens } from '@fluentui/react-components'
import { useQuery } from '@tanstack/react-query'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { PageHeader } from '../components/common/PageHeader'
import { hrApiService } from '../services/hrApiService'

const useStyles = makeStyles({
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  value: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightSemibold,
  },
})

export function DashboardPage() {
  const styles = useStyles()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: hrApiService.getDashboardResumen,
  })

  return (
    <>
      <PageHeader
        title="Inicio / Dashboard"
        subtitle="Resumen operativo de RRHH"
      />

      {isLoading || !data ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <section className={styles.cards} aria-label="Resumen del dashboard">
          <Card>
            <CardHeader header={<span>Total de funcionarios</span>} description={<span className={styles.value}>{data.totalFuncionarios}</span>} />
          </Card>
          <Card>
            <CardHeader header={<span>Zafrales activos</span>} description={<span className={styles.value}>{data.zafralesActivos}</span>} />
          </Card>
          <Card>
            <CardHeader
              header={<span>Contratos por vencer</span>}
              description={<span className={styles.value}>{data.contratosPorVencer}</span>}
            />
          </Card>
          <Card>
            <CardHeader
              header={<span>Inasistencias del mes</span>}
              description={<span className={styles.value}>{data.inasistenciasMes}</span>}
            />
          </Card>
        </section>
      )}
    </>
  )
}
