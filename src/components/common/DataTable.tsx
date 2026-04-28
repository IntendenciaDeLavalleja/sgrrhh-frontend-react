import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import type { ReactNode } from 'react'

const useStyles = makeStyles({
  wrapper: {
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    borderRadius: tokens.borderRadiusLarge,
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: `0 1px 4px ${tokens.colorNeutralShadowAmbient}`,
  },
  table: {
    width: '100%',
  },
  headerRow: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
  headerCell: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  bodyRow: {
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    transition: 'background-color 0.1s ease',
  },
  pager: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    backgroundColor: tokens.colorNeutralBackground2,
    gap: '8px',
    flexWrap: 'wrap',
  },
  pagerActions: {
    display: 'flex',
    gap: '8px',
  },
})

export interface DataTableColumn<T> {
  key: string
  title: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T extends { id: string }> {
  rows: T[]
  columns: DataTableColumn<T>[]
  page: number
  pageSize: number
  total: number
  onPageChange: (nextPage: number) => void
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  page,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<T>) {
  const styles = useStyles()
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className={styles.wrapper} aria-label="Tabla de resultados">
      <Table aria-label="Tabla de entidades" className={styles.table}>
        <TableHeader>
          <TableRow className={styles.headerRow}>
            {columns.map((column) => (
              <TableHeaderCell key={column.key} className={styles.headerCell}>
                {column.title}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className={styles.bodyRow}>
              {columns.map((column) => (
                <TableCell key={`${row.id}-${column.key}`}>
                  <TableCellLayout>{column.render(row)}</TableCellLayout>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className={styles.pager}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          Página {page + 1} de {pageCount} &mdash; {total} registros
        </Text>
        <div className={styles.pagerActions}>
          <Button
            appearance="secondary"
            size="small"
            disabled={page <= 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
          >
            ← Anterior
          </Button>
          <Button
            appearance="secondary"
            size="small"
            disabled={page + 1 >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente →
          </Button>
        </div>
      </div>
    </section>
  )
}
