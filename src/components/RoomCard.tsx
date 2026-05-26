import { Badge } from './ui'
import { Pencil, Trash } from './icons'

type Room = {
  id: number
  roomNumber: string | number
  type: string
  pricePerNight: number | string
  status: string
}

type Props = {
  room: Room
  canManage?: boolean
  onEdit?: (room: Room) => void
  onDelete?: (room: Room) => void
}

const tone = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('dispon')) return 'success' as const
  if (s.includes('ocup')) return 'danger' as const
  if (s.includes('manten') || s.includes('limp')) return 'warning' as const
  return 'neutral' as const
}

export default function RoomCard({ room, canManage, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl shadow-paper p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Habitación</p>
          <p className="font-display text-3xl text-ink-900 leading-none mt-1">{room.roomNumber}</p>
        </div>
        <Badge tone={tone(room.status)}>{room.status}</Badge>
      </div>
      <div>
        <p className="text-sm text-ink-700">{room.type}</p>
        <p className="text-sm text-ink-500 mt-0.5">
          {Number(room.pricePerNight).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} / noche
        </p>
      </div>
      {canManage && (
        <div className="flex gap-2 pt-2 border-t border-sand-200">
          <button onClick={() => onEdit?.(room)} className="inline-flex items-center gap-1 text-xs text-ink-700 hover:text-ink-900">
            <Pencil size={14} /> Editar
          </button>
          <button onClick={() => onDelete?.(room)} className="inline-flex items-center gap-1 text-xs text-danger-500 hover:opacity-80 ml-auto">
            <Trash size={14} /> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
