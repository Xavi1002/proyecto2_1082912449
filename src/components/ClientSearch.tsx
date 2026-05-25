import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Confirmada: '#28a745',
      Pendiente: '#ffc107',
      Cancelada: '#dc3545',
      Completada: '#17a2b8',
    }

    return colors[status] || '#6c757d'
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <div style={styles.inputGroup}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              disabled={searchLoading}
            />
            {searchLoading && <span style={styles.searchingIndicator}>🔍 Buscando...</span>}
          </div>
          <button type="submit" style={styles.searchButton} disabled={searchLoading}>
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </button>
          {(searchResults.length > 0 || selectedUser) && (
            <button type="button" onClick={handleClear} style={styles.clearButton}>
              Limpiar
            </button>
          )}
        </div>
        {searchTerm.trim() && (
          <p style={styles.searchHint}>
            💡 La búsqueda se realiza automáticamente mientras escribes
          </p>
        )}
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {noResults && !searchLoading && (
        <div style={styles.noResults}>
          No se encontraron clientes con el nombre "{searchedTerm}"
        </div>
      )}

      <div style={styles.mainContent}>
        {searchResults.length > 0 && !selectedUser && (
          <div style={styles.resultsSection}>
            <h2 style={styles.sectionTitle}>
              Clientes encontrados ({searchResults.length})
            </h2>
            <div style={styles.resultsList}>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  style={styles.userCard}
                  onClick={() => handleSelectUser(user)}
                >
                  <div style={styles.userCardContent}>
                    <h3 style={styles.userName}>{user.name}</h3>
                    <p style={styles.userEmail}>{user.email}</p>
                    <p style={styles.userHint}>Ver reservas</p>
                  </div>
                  <div style={styles.userCardArrow}>Ver detalle</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedUser && (
          <div style={styles.detailsSection}>
            <div style={styles.userHeader}>
              <div style={styles.userHeaderContent}>
                <h2 style={styles.selectedUserName}>{selectedUser.name}</h2>
                <p style={styles.selectedUserEmail}>{selectedUser.email}</p>
                <p style={styles.userId}>ID: {selectedUser.id}</p>
              </div>
              <button onClick={handleBack} style={styles.backButton}>
                Volver
              </button>
            </div>

            <div style={styles.reservationsContainer}>
              <h3 style={styles.reservationsTitle}>
                Reservas de {selectedUser.name} ({reservationCount})
              </h3>

              {reservationsLoading ? (
                <div style={styles.loading}>Cargando reservas...</div>
              ) : userReservations.length === 0 ? (
                <div style={styles.noReservations}>
                  Este cliente no tiene reservas registradas.
                </div>
              ) : (
                <div style={styles.reservationsList}>
                  {userReservations.map((reservation) => (
                    <div key={reservation.id} style={styles.reservationCard}>
                      <div style={styles.reservationHeader}>
                        <div style={styles.reservationDates}>
                          <span style={styles.checkInDate}>
                            {formatDate(reservation.checkInDate)}
                          </span>
                          <span style={styles.dateArrow}>a</span>
                          <span style={styles.checkOutDate}>
                            {formatDate(reservation.checkOutDate)}
                          </span>
                          <span style={styles.nightsBadge}>
                            {calculateNights(
                              reservation.checkInDate,
                              reservation.checkOutDate
                            )}{' '}
                            noches
                          </span>
                        </div>
                        <div
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(reservation.status),
                          }}
                        >
                          {reservation.status}
                        </div>
                      </div>

                      <div style={styles.reservationDetails}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Habitacion</span>
                          <span style={styles.detailValue}>
                            {reservation.room?.roomNumber} ({reservation.room?.type})
                          </span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Huespedes</span>
                          <span style={styles.detailValue}>
                            {reservation.numberOfGuests} personas
                          </span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Total</span>
                          <span style={styles.detailValue}>
                            ${parseFloat(reservation.totalPrice.toString()).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
  } as React.CSSProperties,
  searchForm: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  inputGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  inputWrapper: {
    flex: 1,
    minWidth: '250px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  searchingIndicator: {
    position: 'absolute' as const,
    right: '1rem',
    fontSize: '0.9rem',
    color: '#3b82f6',
    fontWeight: 600,
    animation: 'pulse 1s infinite',
  } as React.CSSProperties,
  searchHint: {
    marginTop: '0.75rem',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic' as const,
  } as React.CSSProperties,
  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  searchButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s',
  } as React.CSSProperties,
  clearButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s',
  } as React.CSSProperties,
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
  } as React.CSSProperties,
  noResults: {
    backgroundColor: '#f0f9ff',
    color: '#0369a1',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #bae6fd',
  } as React.CSSProperties,
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  } as React.CSSProperties,
  resultsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1f2937',
  } as React.CSSProperties,
  resultsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,
  userCard: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left' as const,
    width: '100%',
  } as React.CSSProperties,
  userCardContent: {
    flex: 1,
  } as React.CSSProperties,
  userName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1f2937',
  } as React.CSSProperties,
  userEmail: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#666',
  } as React.CSSProperties,
  userHint: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.85rem',
    color: '#2563eb',
    fontWeight: 600,
  } as React.CSSProperties,
  userCardArrow: {
    fontSize: '0.9rem',
    color: '#4b5563',
    fontWeight: 700,
  } as React.CSSProperties,
  detailsSection: {
    display: 'grid',
    gap: '2rem',
  } as React.CSSProperties,
  userHeader: {
    backgroundColor: '#f0f9ff',
    border: '2px solid #0ea5e9',
    borderRadius: '12px',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
  } as React.CSSProperties,
  userHeaderContent: {
    flex: 1,
  } as React.CSSProperties,
  selectedUserName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#0c4a6e',
  } as React.CSSProperties,
  selectedUserEmail: {
    margin: '0.25rem 0',
    fontSize: '1rem',
    color: '#0c4a6e',
  } as React.CSSProperties,
  userId: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.9rem',
    color: '#0369a1',
  } as React.CSSProperties,
  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  reservationsContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  } as React.CSSProperties,
  reservationsTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1f2937',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  } as React.CSSProperties,
  noReservations: {
    textAlign: 'center' as const,
    padding: '2rem',
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    color: '#92400e',
  } as React.CSSProperties,
  reservationsList: {
    display: 'grid',
    gap: '1rem',
  } as React.CSSProperties,
  reservationCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.25rem',
  } as React.CSSProperties,
  reservationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  reservationDates: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  checkInDate: {
    fontWeight: 700,
    color: '#10b981',
    fontSize: '1rem',
  } as React.CSSProperties,
  checkOutDate: {
    fontWeight: 700,
    color: '#ef4444',
    fontSize: '1rem',
  } as React.CSSProperties,
  dateArrow: {
    color: '#9ca3af',
  } as React.CSSProperties,
  nightsBadge: {
    backgroundColor: '#f3f4f6',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#666',
  } as React.CSSProperties,
  statusBadge: {
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
  } as React.CSSProperties,
  reservationDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,
  detailItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  } as React.CSSProperties,
  detailLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 600,
  } as React.CSSProperties,
  detailValue: {
    fontSize: '1rem',
    color: '#1f2937',
    fontWeight: 500,
  } as React.CSSProperties,
}
