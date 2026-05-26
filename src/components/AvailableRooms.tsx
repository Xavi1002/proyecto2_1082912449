import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Card, Tabs } from './ui'
import RoomCard from './RoomCard'

interface Room {
  id: number
  roomNumber: string
  type: string
  capacity: number
  pricePerNight: number
  status: string
}

export default function AvailableRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Disponible')

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const response = await api.get('/rooms', {
          params: {
            status: filter,
          },
        })
        setRooms(response.data.rooms || [])
        setError('')
      } catch (err) {
        console.error('Error al cargar habitaciones:', err)
        setError('Error al cargar habitaciones')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [filter])

  const tabs = [
    { value: 'Disponible', label: 'Disponible' },
    { value: 'Ocupada', label: 'Ocupada' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
  ]

  return (
    <Card padding="md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="font-display text-xl text-ink-900">Habitaciones</h2>
        <Tabs items={tabs} active={filter} onChange={setFilter} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-ink-500 py-6">Cargando habitaciones...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center text-ink-500 py-6">No hay habitaciones en este estado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={{
                id: room.id,
                roomNumber: room.roomNumber,
                type: room.type,
                pricePerNight: room.pricePerNight,
                status: room.status,
              }}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
