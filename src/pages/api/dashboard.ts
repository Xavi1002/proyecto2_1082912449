import type { NextApiRequest, NextApiResponse } from 'next'

type DashboardPayload = {
  kpis: {
    availableRooms: number
    occupiedRooms: number
    maintenanceRooms: number
    activeReservationsToday: number
  }
  reservationsToday: Array<{
    id: number
    clientName?: string
    roomNumber?: string
    checkInDate: string
    status: string
  }>
  mode: 'live' | 'seed'
}

const resolveBaseUrl = (req: NextApiRequest) => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || 'http'
  const host = req.headers.host
  return `${proto}://${host}/api`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<DashboardPayload>) {
  const baseUrl = resolveBaseUrl(req)
  try {
    const [roomsRes, reservationsRes] = await Promise.all([
      fetch(`${baseUrl}/rooms/statistics`),
      fetch(`${baseUrl}/reservations`),
    ])

    const rooms = await roomsRes.json()
    const reservationsBody = await reservationsRes.json()
    const reservations = Array.isArray(reservationsBody?.reservations)
      ? reservationsBody.reservations
      : []

    const today = new Date().toISOString().slice(0, 10)

    const reservationsToday = reservations.filter((reservation: any) => {
      const checkInRaw = reservation.checkInDate || reservation.check_in || ''
      const checkIn = String(checkInRaw).slice(0, 10)
      const status = (reservation.status || '').toLowerCase()
      return checkIn === today && status !== 'cancelada'
    })

    return res.status(200).json({
      kpis: {
        availableRooms: Number(rooms.byStatus?.Disponible || 0),
        occupiedRooms: Number(rooms.byStatus?.Ocupada || 0),
        maintenanceRooms: Number(rooms.byStatus?.Mantenimiento || 0) + Number(rooms.byStatus?.Limpieza || 0),
        activeReservationsToday: reservationsToday.length,
      },
      reservationsToday: reservationsToday.map((reservation: any) => ({
        id: reservation.id,
        clientName: reservation.user?.name,
        roomNumber: reservation.room?.roomNumber,
        checkInDate: reservation.checkInDate || reservation.check_in,
        status: reservation.status,
      })),
      mode: 'live',
    })
  } catch (_error) {
    return res.status(200).json({
      kpis: {
        availableRooms: 4,
        occupiedRooms: 0,
        maintenanceRooms: 0,
        activeReservationsToday: 0,
      },
      reservationsToday: [],
      mode: 'seed',
    })
  }
}
