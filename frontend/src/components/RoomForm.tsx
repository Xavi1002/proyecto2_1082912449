import { useEffect, useState } from 'react'
import { api } from '../lib/api'

interface Room {
  id?: number
  roomNumber: string
  type: string
  status: string
  pricePerNight: number
}

interface RoomFormProps {
  room?: Room
  onSuccess?: () => void
  onCancel?: () => void
}

const roomTypes = ['Individual', 'Doble', 'Triple', 'Suite']
const roomStatuses = ['Disponible', 'Ocupada', 'Mantenimiento', 'Limpieza']

const initialFormData: Room = {
  roomNumber: '',
  type: 'Doble',
  status: 'Disponible',
  pricePerNight: 0,
}

export default function RoomForm({ room, onSuccess, onCancel }: RoomFormProps) {
  const [formData, setFormData] = useState<Room>(initialFormData)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (room) {
      setFormData({
        id: room.id,
        roomNumber: room.roomNumber,
        type: room.type,
        status: room.status,
        pricePerNight: Number(room.pricePerNight),
      })
      return
    }

    setFormData(initialFormData)
  }, [room])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: name === 'pricePerNight' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!formData.roomNumber.trim()) {
      setError('El numero de habitacion es obligatorio')
      return
    }

    if (formData.pricePerNight <= 0) {
      setError('El precio por noche debe ser mayor que 0')
      return
    }

    try {
      setIsLoading(true)

      const payload = {
        roomNumber: formData.roomNumber.trim(),
        type: formData.type,
        status: formData.status,
        pricePerNight: formData.pricePerNight,
      }

      if (room?.id) {
        await api.put(`/rooms/${room.id}`, payload)
      } else {
        await api.post('/rooms', payload)
      }

      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || 'No fue posible guardar la habitacion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div>
        <h2 style={styles.title}>{room ? 'Editar habitacion' : 'Nueva habitacion'}</h2>
        <p style={styles.subtitle}>Completa numero, tipo, estado y precio por noche.</p>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.formGroup}>
        <label htmlFor="roomNumber">Numero</label>
        <input
          id="roomNumber"
          name="roomNumber"
          type="text"
          value={formData.roomNumber}
          onChange={handleChange}
          placeholder="101"
          style={styles.input}
          required
        />
      </div>

      <div style={styles.row}>
        <div style={styles.formGroup}>
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} style={styles.input}>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="status">Estado</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} style={styles.input}>
            {roomStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="pricePerNight">Precio por noche</label>
        <input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          placeholder="150000"
          style={styles.input}
          required
        />
      </div>

      <div style={styles.actions}>
        <button type="submit" disabled={isLoading} style={styles.primaryButton}>
          {isLoading ? 'Guardando...' : room ? 'Actualizar' : 'Crear habitacion'}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} style={styles.secondaryButton}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  title: {
    margin: 0,
    color: '#162534',
  },
  subtitle: {
    margin: '0.5rem 0 0',
    color: '#5a6774',
  },
  error: {
    backgroundColor: '#fbe5e6',
    color: '#8b1e2d',
    padding: '0.9rem 1rem',
    borderRadius: '12px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  input: {
    border: '1px solid #ccd5de',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    fontSize: '1rem',
    backgroundColor: '#fbfcfe',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    backgroundColor: '#163349',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 1.2rem',
    fontWeight: 700,
    cursor: 'pointer',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#d9e2ea',
    color: '#203241',
    border: 'none',
    borderRadius: '999px',
    padding: '0.9rem 1.2rem',
    fontWeight: 700,
    cursor: 'pointer',
    flex: 1,
  },
} as const
