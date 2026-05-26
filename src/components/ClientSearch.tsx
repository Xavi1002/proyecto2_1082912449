import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { Avatar, Badge, Button, Card, EmptyState, Input } from './ui'
import { ArrowRight, Search, Users } from './icons'

interface User {
  id: number
  name: string
  email: string
}

interface Reservation {
  id: number
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number
  totalPrice: number
  status: string
  room?: {
    roomNumber: string
    type: string
  }
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const STATUS_TONES: Record<string, BadgeTone> = {
  Confirmada: 'success',
  Pendiente: 'warning',
  Cancelada: 'danger',
  Completada: 'info',
}

export default function ClientSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchedTerm, setSearchedTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userReservations, setUserReservations] = useState<Reservation[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [reservationsLoading, setReservationsLoading] = useState(false)
  const [reservationCount, setReservationCount] = useState(0)
  const [error, setError] = useState('')
  const [noResults, setNoResults] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Auto-search con debounce al cambiar el término
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setNoResults(false)
      setError('')
      return
    }

    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Configurar nuevo timer para búsqueda automática
    debounceTimer.current = setTimeout(async () => {
      try {
        setSearchLoading(true)
        setError('')
        setSelectedUser(null)
        setUserReservations([])
        setReservationCount(0)
        const normalizedSearchTerm = searchTerm.trim()
        setSearchedTerm(normalizedSearchTerm)

        const response = await api.get('/users/search', {
          params: { name: normalizedSearchTerm },
        })

        if (response.data.count === 0) {
          setNoResults(true)
          setSearchResults([])
          return
        }

        setSearchResults(response.data.users)
      } catch (err) {
        console.error('Error en busqueda:', err)
        setError('Error al buscar clientes. Intenta de nuevo.')
      } finally {
        setSearchLoading(false)
      }
    }, 500) // Espera 500ms después de dejar de escribir

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchTerm])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    const normalizedSearchTerm = searchTerm.trim()
    if (!normalizedSearchTerm) {
      setError('Por favor ingresa un nombre para buscar')
      return
    }

    try {
      setSearchLoading(true)
      setError('')
      setNoResults(false)
      setSelectedUser(null)
      setUserReservations([])
      setReservationCount(0)
      setSearchedTerm(normalizedSearchTerm)

      const response = await api.get('/users/search', {
        params: { name: normalizedSearchTerm },
      })

      if (response.data.count === 0) {
        setNoResults(true)
        setSearchResults([])
        return
      }

      setSearchResults(response.data.users)
    } catch (err) {
      console.error('Error en busqueda:', err)
      setError('Error al buscar clientes. Intenta de nuevo.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectUser = async (user: User) => {
    try {
      setSelectedUser(user)
      setReservationsLoading(true)
      setError('')

      const response = await api.get('/reservations', {
        params: { userId: user.id },
      })

      const reservations = response.data.reservations || []
      setUserReservations(reservations)
      setReservationCount(response.data.count ?? reservations.length)
    } catch (err) {
      console.error('Error al cargar reservas:', err)
      setError('Error al cargar las reservas del cliente.')
      setUserReservations([])
      setReservationCount(0)
    } finally {
      setReservationsLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedUser(null)
    setUserReservations([])
    setReservationCount(0)
  }

  const handleClear = () => {
    setSearchTerm('')
    setSearchedTerm('')
    setSearchResults([])
    setSelectedUser(null)
    setUserReservations([])
    setReservationCount(0)
    setError('')
    setNoResults(false)
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getStatusTone = (status: string): BadgeTone => STATUS_TONES[status] || 'neutral'

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1 min-w-[240px]">
            <Input
              type="text"
              placeholder="Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={searchLoading}
              leftIcon={<Search size={16} />}
              hint={searchLoading ? 'Buscando...' : undefined}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={searchLoading} disabled={searchLoading}>
              Buscar
            </Button>
            {(searchResults.length > 0 || selectedUser) && (
              <Button type="button" variant="ghost" onClick={handleClear}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
        {searchTerm.trim() && (
          <p className="mt-2 text-xs text-ink-500 italic">
            La búsqueda se realiza automáticamente mientras escribes.
          </p>
        )}
      </form>

      {error && (
        <div className="mb-6 p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      {noResults && !searchLoading && (
        <EmptyState
          icon={<Search size={20} />}
          title="Sin coincidencias"
          description={`No se encontraron clientes con el nombre "${searchedTerm}".`}
        />
      )}

      <div className="grid gap-6">
        {searchResults.length > 0 && !selectedUser && (
          <section>
            <h2 className="font-display text-2xl text-ink-900 mb-4">
              Clientes encontrados <span className="text-ink-500 text-base font-normal">({searchResults.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="text-left bg-white border border-sand-200 rounded-xl shadow-paper p-4 hover:border-ink-900/30 hover:shadow-md transition flex items-center gap-4 group"
                >
                  <Avatar name={user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink-900 truncate">{user.name}</h3>
                    <p className="text-sm text-ink-500 truncate">{user.email}</p>
                  </div>
                  <ArrowRight size={18} className="text-ink-400 group-hover:text-ink-900 transition shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedUser && (
          <section className="grid gap-6">
            <Card className="bg-sand-50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedUser.name} size="lg" />
                  <div>
                    <h2 className="font-display text-2xl text-ink-900">{selectedUser.name}</h2>
                    <p className="text-sm text-ink-500">{selectedUser.email}</p>
                    <p className="mt-1 text-xs text-ink-500">ID: {selectedUser.id}</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={handleBack}>
                  Volver
                </Button>
              </div>
            </Card>

            <div>
              <h3 className="font-display text-xl text-ink-900 mb-4">
                Reservas <span className="text-ink-500 text-base font-normal">({reservationCount})</span>
              </h3>

              {reservationsLoading ? (
                <div className="text-center text-ink-500 py-12">Cargando reservas...</div>
              ) : userReservations.length === 0 ? (
                <EmptyState
                  icon={<Users size={20} />}
                  title="Sin reservas"
                  description="Este cliente no tiene reservas registradas."
                />
              ) : (
                <div className="grid gap-3">
                  {userReservations.map((reservation) => (
                    <Card key={reservation.id} padding="md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-ink-900">
                            {formatDate(reservation.checkInDate)}
                          </span>
                          <span className="text-ink-400 text-sm">→</span>
                          <span className="text-sm font-medium text-ink-900">
                            {formatDate(reservation.checkOutDate)}
                          </span>
                          <Badge tone="neutral">
                            {calculateNights(reservation.checkInDate, reservation.checkOutDate)} noches
                          </Badge>
                        </div>
                        <Badge tone={getStatusTone(reservation.status)}>{reservation.status}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-sand-200">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-ink-500">Habitación</p>
                          <p className="mt-1 text-sm text-ink-900">
                            {reservation.room?.roomNumber}
                            {reservation.room?.type && (
                              <span className="text-ink-500"> · {reservation.room.type}</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-ink-500">Huéspedes</p>
                          <p className="mt-1 text-sm text-ink-900">{reservation.numberOfGuests} personas</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-ink-500">Total</p>
                          <p className="mt-1 font-display text-lg text-ink-900">
                            ${parseFloat(reservation.totalPrice.toString()).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
