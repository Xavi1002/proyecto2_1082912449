import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Input } from './ui'
import { Search } from './icons'

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
    <div className="relative">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setOpen(true)
          }
        }}
        placeholder={placeholder}
        leftIcon={<Search size={16} />}
      />
      {loading && <p className="mt-1.5 text-xs text-ink-500">Buscando...</p>}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-72 overflow-y-auto bg-white border border-sand-200 rounded-xl shadow-paper">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-ink-500">Sin resultados</div>
          ) : (
            results.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  onSelect(client)
                  setQuery(`${client.name} - ${client.identificationNumber}`)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2.5 border-b border-sand-100 last:border-0 hover:bg-sand-50 transition flex flex-col gap-0.5"
              >
                <span className="text-sm font-medium text-ink-900">{client.name}</span>
                <span className="text-xs text-ink-500">Doc: {client.identificationNumber}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
