import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: keyof T | string
  label: string
  width?: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends object>({
  columns,
  rows,
  keyExtractor,
  emptyMessage = 'Aucune donnée',
  className,
}: DataTableProps<T>) {
  const gridTemplate = columns.map(c => c.width ?? '1fr').join(' ')

  return (
    <div
      className={cn('rounded-[14px] overflow-hidden', className)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* En-têtes */}
      <div
        className="grid px-3.5 py-2"
        style={{
          gridTemplateColumns: gridTemplate,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {columns.map(col => (
          <div
            key={String(col.key)}
            className="text-[8px] uppercase tracking-[1.5px]"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Lignes */}
      {rows.length === 0 ? (
        <div className="px-3.5 py-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
          {emptyMessage}
        </div>
      ) : (
        rows.map((row, i) => (
          <div
            key={keyExtractor(row)}
            className="grid px-3.5 py-2.5 items-center"
            style={{
              gridTemplateColumns: gridTemplate,
              borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}
          >
            {columns.map(col => (
              <div key={String(col.key)} className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
