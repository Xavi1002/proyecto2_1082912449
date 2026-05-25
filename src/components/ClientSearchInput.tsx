import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'

export type ClientOption = {
  id: number
  name: string
  identificationNumber: string
  email: string
  userId?: number | null
}

type ClientSearchInputProps = {
  onSelect: (client: ClientOption) => void
  placeholder?: string
}

export default function ClientSearchInput({ onSelect, placeholder = 'Buscar cliente por nombre o documento' }: ClientSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const hasQuery = useMemo(() => query.trim().length > 0, [query])

  useEffect(() => {
    if (!hasQuery) {
      setResults([])
      setOpen(false)
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        const response = await api.get('/clients/search', { params: { q: query.trim() } })
        setResults(response.data.clients || [])
        setOpen(true)
      } catch (_error) {
        setResults([])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query, hasQuery])

  return (
    <div style={styles.wrapper}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setOpen(true)
          }
        }}
        placeholder={placeholder}
        style={styles.input}
      />
      {loading && <div style={styles.hint}>Buscando...</div>}
      {open && (
        <div style={styles.dropdown}>
          {results.length === 0 ? (
            <div style={styles.empty}>Sin resultados</div>
          ) : (
            results.map((client) => (
              <button
                key={client.id}
                type="button"
                style={styles.option}
                onClick={() => {
                  onSelect(client)
                  setQuery(`${client.name} - ${client.identificationNumber}`)
                  setOpen(false)
                }}
              >
                <span style={styles.optionName}>{client.name}</span>
                <span style={styles.optionDoc}>Doc: {client.identificationNumber}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'relative' as const,
  },
  input: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '0.65rem 0.8rem',
    fontSize: '0.95rem',
  },
  hint: {
    marginTop: '0.3rem',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    zIndex: 20,
    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
    maxHeight: '280px',
    overflowY: 'auto' as const,
  },
  empty: {
    padding: '0.75rem',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  option: {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fff',
    textAlign: 'left' as const,
    padding: '0.65rem 0.75rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.15rem',
  },
  optionName: {
    color: '#0f172a',
    fontWeight: 600,
    fontSize: '0.92rem',
  },
  optionDoc: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
} as const
