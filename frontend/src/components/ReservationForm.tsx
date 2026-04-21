import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface Room {
  id: number
  roomNumber: string
  type: string
  pricePerNight: number
  capacity: number
  totalPrice?: string
}

interface ReservationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReservationForm({ onSuccess, onCancel }: ReservationFormProps) {
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0]

  const handleSearchRooms = async () => {
    if (!checkInDate || !checkOutDate) {
      setError('Por favor ingresa fechas de entrada y salida')
      return
    }

    setError('')
    setSearchLoading(true)

    try {
      const response = await api.get('/reservations/availability', {
        params: {
          checkInDate,
          checkOutDate,
        },
      })
      setAvailableRooms(
        response.data.availableRooms.map((room: any) => ({
          ...room,
          totalPrice: room.totalPrice,
        }))
      )
      if (response.data.availableRooms.length === 0) {
        setError('No hay habitaciones disponibles en esas fechas')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al buscar disponibilidad')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedRoomId) {
      setError('Por favor selecciona una habitación')
      return
    }

    setIsLoading(true)

    try {
      await api.post('/reservations', {
        roomId: selectedRoomId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        specialRequests,
      })

      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear reserva')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Nueva Reserva</h2>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.section}>
        <h3>Fechas</h3>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label htmlFor="checkInDate">Entrada *</label>
            <input
              id="checkInDate"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={today}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="checkOutDate">Salida *</label>
            <input
              id="checkOutDate"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || today}
              required
              style={styles.input}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearchRooms}
          disabled={searchLoading}
          style={styles.searchButton}
        >
          {searchLoading ? 'Buscando...' : 'Buscar Disponibilidad'}
        </button>
      </div>

      {availableRooms.length > 0 && (
        <div style={styles.section}>
          <h3>Seleccionar Habitación</h3>
          <div style={styles.roomsGrid}>
            {availableRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                style={{
                  ...styles.roomCard,
                  ...(selectedRoomId === room.id ? styles.roomCardSelected : {}),
                }}
              >
                <p style={styles.roomNumber}>Habitación {room.roomNumber}</p>
                <p>{room.type}</p>
                <p>Capacidad: {room.capacity} personas</p>
                <p style={styles.price}>Total: ${room.totalPrice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRoomId && (
        <div style={styles.section}>
          <h3>Detalles de la Reserva</h3>

          <div style={styles.formGroup}>
            <label htmlFor="numberOfGuests">Número de Huéspedes *</label>
            <input
              id="numberOfGuests"
              type="number"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="specialRequests">Solicitudes Especiales</label>
            <textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Ej: cuna, piso alto, etc."
              style={{ ...styles.input, minHeight: '80px' }}
            />
          </div>
        </div>
      )}

      <div style={styles.buttons}>
        <button type="submit" disabled={isLoading || !selectedRoomId} style={styles.submitButton}>
          {isLoading ? 'Creando...' : 'Confirmar Reserva'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '1rem',
    borderRadius: '4px',
    borderLeft: '4px solid #721c24',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  searchButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  roomCard: {
    padding: '1rem',
    border: '2px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  roomCardSelected: {
    borderColor: '#28a745',
    backgroundColor: '#f0fff4',
  },
  roomNumber: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0',
  },
  price: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#28a745',
    margin: '0.5rem 0 0 0',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  submitButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
} as const
