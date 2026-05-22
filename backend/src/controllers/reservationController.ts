import { Request, Response } from 'express'
import { Op } from 'sequelize'
import sequelize from '../config/database'
import Client from '../models/Client'
import Reservation, { ReservationStatus } from '../models/Reservation'
import Room, { RoomStatus } from '../models/Room'
import User from '../models/User'
import { canViewReservation, canEditReservation, canDeleteReservation } from '../utils/permissions'
import { RoleType } from '../models/Role'
import { recordAudit } from '../utils/audit'

const ACTIVE_RESERVATION_STATUSES = [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]

const formatDateForMessage = (value: Date) => value.toISOString().split('T')[0]

// Verificar disponibilidad de habitaciones
export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { checkInDate, checkOutDate, roomType } = req.query

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: 'checkInDate y checkOutDate son requeridos',
      })
    }

    const checkIn = new Date(checkInDate as string)
    const checkOut = new Date(checkOutDate as string)

    if (checkIn >= checkOut) {
      return res.status(400).json({
        error: 'La fecha de salida debe ser posterior a la de entrada',
      })
    }

    // Encontrar habitaciones que NO están reservadas en ese período
    const where: any = {}
    if (roomType) where.type = roomType

    const bookedRooms = await Reservation.findAll({
      attributes: ['roomId'],
      where: {
        status: { [Op.in]: ACTIVE_RESERVATION_STATUSES },
        [Op.or]: [
          {
            checkInDate: { [Op.lt]: checkOut },
            checkOutDate: { [Op.gt]: checkIn },
          },
        ],
      },
      raw: true,
    })

    const bookedRoomIds = bookedRooms.map((r) => r.roomId)

    const availableRooms = await Room.findAll({
      where: {
        ...where,
        id: {
          [Op.notIn]: bookedRoomIds,
        },
        status: RoomStatus.DISPONIBLE,
      },
      order: [['roomNumber', 'ASC']],
    })

    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    res.json({
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfDays: days,
      availableRooms: availableRooms.map((room) => ({
        ...room.toJSON(),
        totalPrice: (parseFloat(room.pricePerNight.toString()) * days).toFixed(2),
      })),
    })
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error)
    res.status(500).json({ error: 'Error al verificar disponibilidad' })
  }
}

// Crear reserva
export const createReservation = async (req: Request, res: Response) => {
  try {
    const { roomId, clientId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: 'roomId, checkInDate y checkOutDate son requeridos',
      })
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    // Validaciones
    if (checkIn >= checkOut) {
      return res.status(400).json({
        error: 'La fecha de salida debe ser posterior a la de entrada',
      })
    }

    if (checkIn < new Date()) {
      return res.status(400).json({
        error: 'No se pueden hacer reservas en fechas pasadas',
      })
    }

    // 1. Verificar habitación existe y está disponible
    const room = await Room.findByPk(roomId)
    if (!room) {
      return res.status(404).json({ error: 'Habitación no encontrada' })
    }

    if (room.status !== RoomStatus.DISPONIBLE) {
      return res.status(409).json({ error: 'La habitación no está disponible' })
    }

    let reservationUserId = userId
    let reservationClientId: number | null = null

    if (clientId) {
      const client = await Client.findByPk(clientId)

      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' })
      }

      reservationClientId = client.id
      reservationUserId = client.userId || reservationUserId
    }

    // 2. Verificar solapamiento con la query del plan
    const conflictingReservation = await Reservation.findOne({
      where: {
        roomId,
        status: { [Op.in]: ACTIVE_RESERVATION_STATUSES },
        [Op.or]: [
          {
            checkInDate: { [Op.lt]: checkOut },
            checkOutDate: { [Op.gt]: checkIn },
          },
        ],
      },
    })

    if (conflictingReservation) {
      return res.status(409).json({
        error: `La habitación ${room.roomNumber} ya tiene una reserva del ${formatDateForMessage(conflictingReservation.checkInDate)} al ${formatDateForMessage(conflictingReservation.checkOutDate)}.`,
      })
    }

    // 3. Calcular noches y total con snapshot del precio
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const pricePerNightSnapshot = parseFloat(room.pricePerNight.toString())
    const totalPrice = pricePerNightSnapshot * days

    // Validar número de huéspedes
    if (numberOfGuests && numberOfGuests > room.capacity) {
      return res.status(400).json({
        error: `El número de huéspedes excede la capacidad de la habitación (${room.capacity})`,
      })
    }

    // 4. INSERT en reservations con price_per_night_snapshot
    const reservation = await Reservation.create({
      userId: reservationUserId,
      clientId: reservationClientId,
      roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: numberOfGuests || 1,
      totalPrice,
      pricePerNightSnapshot,
      specialRequests: specialRequests || '',
      status: ReservationStatus.CONFIRMED,
    })

    // 5. UPDATE rooms SET status='ocupada'
    // Riesgo operativo conocido: si este paso falla después del INSERT,
    // la reserva queda creada sin reflejar ocupación en la habitación.
    // En esta arquitectura se ejecuta en secuencia inmediata y se documenta en Fase 5.
    await room.update({ status: RoomStatus.OCUPADA })

    // 6. recordAudit
    await recordAudit({
      action: 'create_reservation',
      entity: 'reservation',
      entityId: reservation.id,
      actorUserId: userId,
      metadata: {
        roomId,
        clientId: reservationClientId,
        checkInDate: formatDateForMessage(checkIn),
        checkOutDate: formatDateForMessage(checkOut),
      },
    })

    // Cargar relaciones
    const reservationWithDetails = await Reservation.findByPk(reservation.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
        { model: Client, as: 'client' },
      ],
    })

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reservation: reservationWithDetails,
    })
  } catch (error) {
    console.error('Error al crear reserva:', error)
    res.status(500).json({ error: 'Error al crear reserva' })
  }
}

// Obtener todas las reservas (con filtros)
export const getReservations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const userRole = (req.user?.role || RoleType.CLIENTE) as RoleType
    const { status, userId: filteredUserId, roomId, startDate, endDate } = req.query

    // Validar permisos nuevamente
    if (!canViewReservation(userRole, userId || 0, userId || 0)) {
      return res.status(403).json({
        error: 'No tiene permiso para ver reservas',
      })
    }

    const where: any = {}

    if (status) where.status = status
    if (filteredUserId) where.userId = filteredUserId
    if (roomId) where.roomId = roomId

    if (startDate || endDate) {
      where.checkInDate = {}
      if (startDate) where.checkInDate[Op.gte] = new Date(startDate as string)
      if (endDate) where.checkInDate[Op.lte] = new Date(endDate as string)
    }

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
        { model: Client, as: 'client' },
      ],
      order: [['checkInDate', 'DESC']],
    })

    res.json({
      count: reservations.length,
      reservations,
    })
  } catch (error) {
    console.error('Error al obtener reservas:', error)
    res.status(500).json({ error: 'Error al obtener reservas' })
  }
}

// Obtener reserva por ID
export const getReservationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userRole = (req.user?.role || RoleType.CLIENTE) as RoleType

    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
        { model: Client, as: 'client' },
      ],
    })

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    // Verificar permisos
    if (!canViewReservation(userRole, userId || 0, reservation.userId)) {
      return res.status(403).json({
        error: 'No tiene permiso para ver esta reserva',
      })
    }

    res.json(reservation)
  } catch (error) {
    console.error('Error al obtener reserva:', error)
    res.status(500).json({ error: 'Error al obtener reserva' })
  }
}

// Actualizar reserva
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userRole = (req.user?.role || RoleType.CLIENTE) as RoleType
    const { checkInDate, checkOutDate, numberOfGuests, specialRequests, status } = req.body

    const reservation = await Reservation.findByPk(id)
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    // Verificar permisos - Solo Recepción y SuperAdmin pueden actualizar
    if (!canEditReservation(userRole, userId || 0, reservation.userId)) {
      return res.status(403).json({
        error: 'No tiene permiso para actualizar esta reserva',
      })
    }

    // Si está cancelada, no se puede actualizar
    if (reservation.status === ReservationStatus.CANCELLED) {
      return res.status(400).json({
        error: 'No se pueden actualizar reservas canceladas',
      })
    }

    const newCheckIn = checkInDate ? new Date(checkInDate) : reservation.checkInDate
    const newCheckOut = checkOutDate ? new Date(checkOutDate) : reservation.checkOutDate

    if (newCheckIn >= newCheckOut) {
      return res.status(400).json({
        error: 'La fecha de salida debe ser posterior a la de entrada',
      })
    }

    // Si las fechas cambian, verificar disponibilidad nuevamente
    if (checkInDate || checkOutDate) {
      const conflictingReservations = await Reservation.count({
        where: {
          id: { [Op.ne]: id },
          roomId: reservation.roomId,
          status: {
            [Op.notIn]: [ReservationStatus.CANCELLED],
          },
          [Op.or]: [
            {
              checkInDate: { [Op.lt]: newCheckOut },
              checkOutDate: { [Op.gt]: newCheckIn },
            },
          ],
        },
      })

      if (conflictingReservations > 0) {
        return res.status(409).json({
          error: 'La habitación no está disponible en esas fechas',
        })
      }
    }

    // Calcular nuevo precio si las fechas cambian
    if (checkInDate || checkOutDate) {
      const room = await Room.findByPk(reservation.roomId)
      const days = Math.ceil((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24))
      const totalPrice = parseFloat(room!.pricePerNight.toString()) * days

      await reservation.update({
        checkInDate: newCheckIn,
        checkOutDate: newCheckOut,
        numberOfGuests: numberOfGuests || reservation.numberOfGuests,
        specialRequests: specialRequests !== undefined ? specialRequests : reservation.specialRequests,
        totalPrice,
        ...(status && { status }),
      })
    } else {
      await reservation.update({
        numberOfGuests: numberOfGuests || reservation.numberOfGuests,
        specialRequests: specialRequests !== undefined ? specialRequests : reservation.specialRequests,
        ...(status && { status }),
      })
    }

    // Recargar y devolver
    const updated = await Reservation.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
        { model: Client, as: 'client' },
      ],
    })

    res.json({
      message: 'Reserva actualizada exitosamente',
      reservation: updated,
    })
  } catch (error) {
    console.error('Error al actualizar reserva:', error)
    res.status(500).json({ error: 'Error al actualizar reserva' })
  }
}

// Cancelar reserva
export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userRole = (req.user?.role || RoleType.CLIENTE) as RoleType

    const reservation = await Reservation.findByPk(id)
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    // Verificar permisos
    if (!canDeleteReservation(userRole, userId || 0, reservation.userId)) {
      return res.status(403).json({
        error: 'No tiene permiso para cancelar esta reserva',
      })
    }

    if (!ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) {
      return res.status(409).json({
        error: 'Solo se pueden cancelar reservas activas',
      })
    }

    await reservation.update({ status: ReservationStatus.CANCELLED })

    const room = await Room.findByPk(reservation.roomId)
    if (room) {
      await room.update({ status: RoomStatus.DISPONIBLE })
    }

    await recordAudit({
      action: 'cancel_reservation',
      entity: 'reservation',
      entityId: reservation.id,
      actorUserId: userId || 0,
      metadata: {
        roomId: reservation.roomId,
        userId: reservation.userId,
      },
    })

    res.json({
      message: 'Reserva cancelada exitosamente',
      reservation,
    })
  } catch (error) {
    console.error('Error al cancelar reserva:', error)
    res.status(500).json({ error: 'Error al cancelar reserva' })
  }
}

// Obtener reservas del usuario actual
export const getMyReservations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const reservations = await Reservation.findAll({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
        { model: Client, as: 'client' },
      ],
      order: [['checkInDate', 'DESC']],
    })

    res.json({
      count: reservations.length,
      reservations,
    })
  } catch (error) {
    console.error('Error al obtener reservas:', error)
    res.status(500).json({ error: 'Error al obtener reservas' })
  }
}

// Estadísticas de reservas
export const getReservationStatistics = async (req: Request, res: Response) => {
  try {
    const total = await Reservation.count()
    const byStatus = await Reservation.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    })

    const totalRevenue = await Reservation.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('totalPrice')), 'total']],
      where: {
        status: { [Op.ne]: ReservationStatus.CANCELLED },
      },
      raw: true,
    }) as { total: string | null } | null

    res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map((s: any) => [s.status, s.count])),
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
}
