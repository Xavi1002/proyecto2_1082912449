import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Button, Input, Select } from './ui'

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      <Input
        id="roomNumber"
        name="roomNumber"
        type="text"
        label="Número de habitación"
        value={formData.roomNumber}
        onChange={handleChange}
        placeholder="Ej: 101, 202A"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="type"
          name="type"
          label="Tipo"
          value={formData.type}
          onChange={handleChange}
          options={roomTypes.map((t) => ({ value: t, label: t }))}
        />

        <Select
          id="status"
          name="status"
          label="Estado"
          value={formData.status}
          onChange={handleChange}
          options={roomStatuses.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <Input
        id="pricePerNight"
        name="pricePerNight"
        type="number"
        label="Precio por noche"
        value={formData.pricePerNight}
        onChange={handleChange}
        min="0.01"
        step="0.01"
        placeholder="150000"
        required
      />

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button type="submit" variant="primary" loading={isLoading} className="sm:flex-1">
          {room ? 'Actualizar' : 'Crear habitación'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="sm:flex-1">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
