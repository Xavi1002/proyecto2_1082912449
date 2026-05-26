import { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  empty?: ReactNode
  onRowClick?: (row: T) => void
}

export default function Table<T extends { id: number | string }>({ columns, data, empty, onRowClick }: Props<T>) {
  if (data.length === 0 && empty) return <>{empty}</>
  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-paper overflow-hidden">
      <table className="w-full">
        <thead className="bg-sand-50 border-b border-sand-200">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`text-left text-xs font-medium uppercase tracking-wide text-ink-500 px-4 py-3 ${c.className || ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-sand-200 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-sand-50' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 text-sm text-ink-900 ${c.className || ''}`}>
                  {c.render ? c.render(row) : (row as any)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
