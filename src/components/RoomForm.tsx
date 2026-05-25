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
      setError('El número de habitación es obligatorio')
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
      setError(err.response?.data?.error || 'No fue posible guardar la habitación')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">
          {room ? '✏️ Editar Habitación' : '➕ Nueva Habitación'}
        </h2>
        <p className="text-slate-400">Completa los detalles de la habitación</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start space-x-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Room Number */}
      <div>
        <label htmlFor="roomNumber" className="block text-sm font-medium text-white mb-2">
          Número de Habitación *
        </label>
        <input
          id="roomNumber"
          name="roomNumber"
          type="text"
          value={formData.roomNumber}
          onChange={handleChange}
          placeholder="Ej: 101, 202A"
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Type and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
            Tipo de Habitación *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            {roomTypes.map((type) => (
              <option key={type} value={type} className="bg-slate-900">
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
            Estado *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            {roomStatuses.map((status) => (
              <option key={status} value={status} className="bg-slate-900">
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label htmlFor="pricePerNight" className="block text-sm font-medium text-white mb-2">
          Precio por Noche ($) *
        </label>
        <input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          placeholder="150000"
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
              </svg>
              <span>{room ? 'Actualizar' : 'Crear Habitación'}</span>
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-600/50 hover:bg-slate-600 text-white font-bold rounded-lg transition-all duration-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
