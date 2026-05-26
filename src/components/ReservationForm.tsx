import { useCallback, useEffect, useMemo, useState } from 'react'
import ClientSearchInput, { ClientOption } from './ClientSearchInput'
import { api } from '../lib/api'
import { Button, Input } from './ui'
import { Check } from './icons'

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
  allowClientSelection?: boolean
}

const formatCop = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

export default function ReservationForm({ onSuccess, onCancel, allowClientSelection = false }: ReservationFormProps) {
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [numberOfGuests, setNumberOfGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0]

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) {
      return 0
    }

    const checkIn = new Date(`${checkInDate}T00:00:00`)
    const checkOut = new Date(`${checkOutDate}T00:00:00`)
    return Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
  }, [checkInDate, checkOutDate])

  const selectedRoom = useMemo(
    () => availableRooms.find((room) => room.id === selectedRoomId) || null,
    [availableRooms, selectedRoomId]
  )

  const previewTotal = selectedRoom && nights > 0 ? Number(selectedRoom.pricePerNight) * nights : 0

  const loadAvailableRooms = useCallback(async () => {
    if (!checkInDate || !checkOutDate) {
      setAvailableRooms([])
      setSelectedRoomId(null)
      return
    }

    setError('')
    setSearchLoading(true)

    try {
      const response = await api.get('/rooms/available', {
        params: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
        },
      })

      const rooms = response.data.availableRooms || []
      setAvailableRooms(rooms)

      if (rooms.length === 0) {
        setSelectedRoomId(null)
        setError('No hay habitaciones disponibles en esas fechas')
      } else if (selectedRoomId && !rooms.some((room: Room) => room.id === selectedRoomId)) {
        setSelectedRoomId(null)
      }
    } catch (err: any) {
      setAvailableRooms([])
      setSelectedRoomId(null)
      setError(err.response?.data?.error || 'Error al buscar disponibilidad')
    } finally {
      setSearchLoading(false)
    }
  }, [checkInDate, checkOutDate, selectedRoomId])

  useEffect(() => {
    void loadAvailableRooms()
  }, [loadAvailableRooms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (allowClientSelection && !selectedClient) {
      setError('Por favor selecciona un cliente')
      return
    }

    if (!selectedRoomId) {
      setError('Por favor selecciona una habitación')
      return
    }

    setIsLoading(true)

    try {
      await api.post('/reservations', {
        roomId: selectedRoomId,
        clientId: selectedClient?.id,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {allowClientSelection && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-ink-900">Cliente</h2>
          <ClientSearchInput
            onSelect={(client) => {
              setSelectedClient(client)
              setError('')
            }}
          />
          {selectedClient && (
            <p className="text-sm text-ink-700">
              Seleccionado: <span className="font-medium text-ink-900">{selectedClient.name}</span>
              <span className="text-ink-500"> · {selectedClient.identificationNumber}</span>
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-display text-lg text-ink-900">Fechas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="checkInDate"
            label="Fecha de entrada"
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            min={today}
            required
          />
          <Input
            id="checkOutDate"
            label="Fecha de salida"
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate || today}
            required
          />
        </div>
        <p className="text-xs text-ink-500">
          {searchLoading
            ? 'Actualizando habitaciones disponibles...'
            : 'Las habitaciones se actualizan automáticamente al cambiar las fechas.'}
        </p>
      </div>

      {availableRooms.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-ink-900">Seleccionar habitación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRooms.map((room) => {
              const isSelected = selectedRoomId === room.id
              return (
                <button
                  type="button"
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`text-left p-4 rounded-xl border transition shadow-paper bg-white ${
                    isSelected
                      ? 'border-ink-900 ring-2 ring-ink-900/10'
                      : 'border-sand-200 hover:border-ink-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-500">Habitación</p>
                      <p className="font-display text-xl text-ink-900 mt-1">#{room.roomNumber}</p>
                    </div>
                    {isSelected && (
                      <span className="text-copper-500"><Check size={18} /></span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-ink-700">
                    <p><span className="text-ink-500">Tipo:</span> {room.type}</p>
                    <p><span className="text-ink-500">Capacidad:</span> {room.capacity} personas</p>
                    <p><span className="text-ink-500">Precio/noche:</span> {formatCop(Number(room.pricePerNight))}</p>
                  </div>
                  <p className="mt-3 font-display text-lg text-ink-900">
                    Total: {formatCop(Number(room.totalPrice))}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedRoomId && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-ink-900">Detalles de la reserva</h2>
          <div className="space-y-4">
            <Input
              id="numberOfGuests"
              label="Número de huéspedes"
              type="number"
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              required
            />
            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-ink-700 mb-1.5">
                Solicitudes especiales
              </label>
              <textarea
                id="specialRequests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ej: cuna, piso alto, desayuno adicional, etc."
                rows={4}
                className="w-full px-3 py-2 bg-white border border-sand-200 rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900 transition resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {selectedRoom && nights > 0 && (
        <div className="border-t border-sand-200 pt-4 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Total</p>
            <p className="text-sm text-ink-500 mt-1">
              {nights} {nights === 1 ? 'noche' : 'noches'} × {formatCop(Number(selectedRoom.pricePerNight))}
            </p>
          </div>
          <p className="font-display text-2xl text-ink-900">{formatCop(previewTotal)}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" loading={isLoading} disabled={isLoading || !selectedRoomId}>
          Confirmar reserva
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
