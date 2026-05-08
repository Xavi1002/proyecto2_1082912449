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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Nueva Reserva</h2>
        <p className="text-slate-400 mt-2">Completa los detalles para crear una nueva reserva</p>
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

      {/* Fechas Section */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">📅 Fechas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="checkInDate" className="block text-sm font-medium text-slate-300 mb-2">
              Fecha de Entrada *
            </label>
            <input
              id="checkInDate"
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={today}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-medium text-slate-300 mb-2">
              Fecha de Salida *
            </label>
            <input
              id="checkOutDate"
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || today}
              required
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearchRooms}
          disabled={searchLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {searchLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Buscando disponibilidad...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
              <span>Buscar Disponibilidad</span>
            </>
          )}
        </button>
      </div>

      {/* Rooms Selection */}
      {availableRooms.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">🛏️ Seleccionar Habitación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                  selectedRoomId === room.id
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }`}
              >
                <p className="text-lg font-bold text-white mb-2">
                  🚪 Habitación {room.roomNumber}
                </p>
                <div className="space-y-1 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-400">Tipo:</span> {room.type}
                  </p>
                  <p>
                    <span className="text-slate-400">Capacidad:</span> {room.capacity} personas
                  </p>
                  <p>
                    <span className="text-slate-400">Precio/noche:</span> ${Number(room.pricePerNight).toFixed(2)}
                  </p>
                </div>
                <p className="text-xl font-bold text-primary-400 mt-3">
                  Total: ${room.totalPrice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservation Details */}
      {selectedRoomId && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">📝 Detalles de la Reserva</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="numberOfGuests" className="block text-sm font-medium text-slate-300 mb-2">
                Número de Huéspedes *
              </label>
              <input
                id="numberOfGuests"
                type="number"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-slate-300 mb-2">
                Solicitudes Especiales
              </label>
              <textarea
                id="specialRequests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ej: cuna, piso alto, desayuno adicional, etc."
                rows={4}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={isLoading || !selectedRoomId}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Confirmando...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span>Confirmar Reserva</span>
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
