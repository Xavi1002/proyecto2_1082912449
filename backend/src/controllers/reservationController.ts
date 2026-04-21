import { Request, Response } from 'express'
import { Op, sequelize } from 'sequelize'
import Reservation, { ReservationStatus } from '../models/Reservation'
import Room, { RoomStatus } from '../models/Room'
import User from '../models/User'

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
        status: {
          [Op.notIn]: [ReservationStatus.CANCELLED],
        },
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
    const { roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body
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

    // Verificar que el cuarto existe
    const room = await Room.findByPk(roomId)
    if (!room) {
      return res.status(404).json({ error: 'Habitación no encontrada' })
    }

    // Verificar disponibilidad
    const conflictingReservations = await Reservation.count({
      where: {
        roomId,
        status: {
          [Op.notIn]: [ReservationStatus.CANCELLED],
        },
        [Op.or]: [
          {
            checkInDate: { [Op.lt]: checkOut },
            checkOutDate: { [Op.gt]: checkIn },
          },
        ],
      },
    })

    if (conflictingReservations > 0) {
      return res.status(409).json({
        error: 'La habitación no está disponible en esas fechas',
      })
    }

    // Calcular precio total
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = parseFloat(room.pricePerNight.toString()) * days

    // Validar número de huéspedes
    if (numberOfGuests && numberOfGuests > room.capacity) {
      return res.status(400).json({
        error: `El número de huéspedes excede la capacidad de la habitación (${room.capacity})`,
      })
    }

    const reservation = await Reservation.create({
      userId,
      roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: numberOfGuests || 1,
      totalPrice,
      specialRequests: specialRequests || '',
    })

    // Cargar relaciones
    const reservationWithDetails = await Reservation.findByPk(reservation.id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
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
    const { status, userId, roomId, startDate, endDate } = req.query
    const where: any = {}

    if (status) where.status = status
    if (userId) where.userId = userId
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

    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
      ],
    })

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
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
    const { checkInDate, checkOutDate, numberOfGuests, specialRequests, status } = req.body

    const reservation = await Reservation.findByPk(id)
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
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
      })
    } else {
      await reservation.update({
        numberOfGuests: numberOfGuests || reservation.numberOfGuests,
        specialRequests: specialRequests !== undefined ? specialRequests : reservation.specialRequests,
      })
    }

    // Recargar y devolver
    const updated = await Reservation.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        { model: Room, as: 'room' },
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

    const reservation = await Reservation.findByPk(id)
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      return res.status(400).json({
        error: 'La reserva ya está cancelada',
      })
    }

    await reservation.update({ status: ReservationStatus.CANCELLED })

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
    })

    res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map((s: any) => [s.status, s.count])),
      totalRevenue: parseFloat(totalRevenue?.total || 0),
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
}
