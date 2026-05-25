import { Request, Response } from 'express'
import { Op } from 'sequelize'
import sequelize from '../config/database'
import Room, { RoomStatus, RoomType } from '../models/Room'
import Reservation, { ReservationStatus } from '../models/Reservation'

const isValidRoomType = (value: string): value is RoomType =>
  Object.values(RoomType).includes(value as RoomType)

const isValidRoomStatus = (value: string): value is RoomStatus =>
  Object.values(RoomStatus).includes(value as RoomStatus)

const buildPrice = (value: unknown): number => Number(value)

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const { type, status, search } = req.query
    const where: Record<string, unknown> = {}

    if (typeof type === 'string' && type) {
      where.type = type
    }

    if (typeof status === 'string' && status) {
      where.status = status
    }

    if (typeof search === 'string' && search.trim()) {
      where.roomNumber = {
        [Op.iLike]: `%${search.trim()}%`,
      }
    }

    const rooms = await Room.findAll({
      where,
      order: [['roomNumber', 'ASC']],
    })

    res.json({
      count: rooms.length,
      rooms,
    })
  } catch (error) {
    console.error('Error al obtener habitaciones:', error)
    res.status(500).json({ error: 'Error al obtener habitaciones' })
  }
}

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const room = await Room.findByPk(req.params.id)

    if (!room) {
      return res.status(404).json({ error: 'Habitacion no encontrada' })
    }

    res.json(room)
  } catch (error) {
    console.error('Error al obtener habitacion:', error)
    res.status(500).json({ error: 'Error al obtener habitacion' })
  }
}

export const createRoom = async (req: Request, res: Response) => {
  try {
    const roomNumber = String(req.body.roomNumber || '').trim()
    const type = String(req.body.type || '')
    const status = String(req.body.status || RoomStatus.DISPONIBLE)
    const pricePerNight = buildPrice(req.body.pricePerNight)

    if (!roomNumber || !type || !status || Number.isNaN(pricePerNight)) {
      return res.status(400).json({
        error: 'roomNumber, type, status y pricePerNight son requeridos',
      })
    }

    if (!isValidRoomType(type)) {
      return res.status(400).json({
        error: `Tipo invalido. Valores permitidos: ${Object.values(RoomType).join(', ')}`,
      })
    }

    if (!isValidRoomStatus(status)) {
      return res.status(400).json({
        error: `Estado invalido. Valores permitidos: ${Object.values(RoomStatus).join(', ')}`,
      })
    }

    if (pricePerNight <= 0) {
      return res.status(400).json({
        error: 'El precio por noche debe ser mayor que 0',
      })
    }

    const existingRoom = await Room.findOne({ where: { roomNumber } })
    if (existingRoom) {
      return res.status(409).json({
        error: `Ya existe una habitacion con el numero ${roomNumber}.`,
      })
    }

    const room = await Room.create({
      roomNumber,
      type,
      status,
      pricePerNight,
    })

    res.status(201).json({
      message: 'Habitacion creada exitosamente',
      room,
    })
  } catch (error: any) {
    console.error('Error al crear habitacion:', error)
    
    // Capturar error UNIQUE constraint de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: `Ya existe una habitacion con el numero ${req.body.roomNumber}.`,
      })
    }
    
    res.status(500).json({ error: 'Error al crear habitacion' })
  }
}

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findByPk(req.params.id)

    if (!room) {
      return res.status(404).json({ error: 'Habitacion no encontrada' })
    }

    const updateData: Record<string, string | number> = {}

    if (req.body.roomNumber !== undefined) {
      const roomNumber = String(req.body.roomNumber).trim()

      if (!roomNumber) {
        return res.status(400).json({ error: 'El numero de habitacion no puede estar vacio' })
      }

      if (roomNumber !== room.roomNumber) {
        const existingRoom = await Room.findOne({ where: { roomNumber } })
        if (existingRoom) {
          return res.status(409).json({ error: 'Ya existe una habitacion con ese numero' })
        }
      }

      updateData.roomNumber = roomNumber
    }

    if (req.body.type !== undefined) {
      const type = String(req.body.type)
      if (!isValidRoomType(type)) {
        return res.status(400).json({
          error: `Tipo invalido. Valores permitidos: ${Object.values(RoomType).join(', ')}`,
        })
      }
      updateData.type = type
    }

    if (req.body.status !== undefined) {
      const status = String(req.body.status)
      if (!isValidRoomStatus(status)) {
        return res.status(400).json({
          error: `Estado invalido. Valores permitidos: ${Object.values(RoomStatus).join(', ')}`,
        })
      }
      updateData.status = status
    }

    if (req.body.pricePerNight !== undefined) {
      const pricePerNight = buildPrice(req.body.pricePerNight)

      if (Number.isNaN(pricePerNight) || pricePerNight <= 0) {
        return res.status(400).json({
          error: 'El precio por noche debe ser mayor que 0',
        })
      }

      updateData.pricePerNight = pricePerNight
    }

    await room.update(updateData)

    res.json({
      message: 'Habitacion actualizada exitosamente',
      room,
    })
  } catch (error) {
    console.error('Error al actualizar habitacion:', error)
    res.status(500).json({ error: 'Error al actualizar habitacion' })
  }
}

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findByPk(req.params.id)

    if (!room) {
      return res.status(404).json({ error: 'Habitacion no encontrada' })
    }

    // RN-08: Verificar que no tenga reservas activas (PENDING o CONFIRMED)
    const activeReservationCount = await Reservation.count({
      where: {
        roomId: room.id,
        status: {
          [Op.in]: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    })

    if (activeReservationCount > 0) {
      return res.status(409).json({
        error: `La habitación tiene ${activeReservationCount} reserva(s) activa(s) y no puede eliminarse.`,
      })
    }

    await room.destroy()

    res.json({
      message: 'Habitacion eliminada exitosamente',
      roomId: room.id,
    })
  } catch (error) {
    console.error('Error al eliminar habitacion:', error)
    res.status(500).json({ error: 'Error al eliminar habitacion' })
  }
}

export const updateRoomStatus = async (req: Request, res: Response) => {
  try {
    const status = String(req.body.status || '')

    if (!isValidRoomStatus(status)) {
      return res.status(400).json({
        error: `Estado invalido. Valores permitidos: ${Object.values(RoomStatus).join(', ')}`,
      })
    }

    const room = await Room.findByPk(req.params.id)
    if (!room) {
      return res.status(404).json({ error: 'Habitacion no encontrada' })
    }

    await room.update({ status })

    res.json({
      message: 'Estado de habitacion actualizado',
      room,
    })
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    res.status(500).json({ error: 'Error al actualizar estado' })
  }
}

export const getRoomAvailability = async (_req: Request, res: Response) => {
  try {
    const availableRooms = await Room.findAll({
      attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      where: { status: RoomStatus.DISPONIBLE },
      group: ['type'],
      raw: true,
    })

    res.json({ availableRooms })
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error)
    res.status(500).json({ error: 'Error al obtener disponibilidad' })
  }
}

/**
 * GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
 * Retorna habitaciones disponibles sin reservas solapadas (RN-02)
 */
export const getAvailableRoomsForDates = async (req: Request, res: Response) => {
  try {
    const { checkIn, checkOut } = req.query

    // Validar parámetros
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        error: 'checkIn y checkOut son requeridos. Formato: YYYY-MM-DD',
      })
    }

    const checkInDate = new Date(String(checkIn))
    const checkOutDate = new Date(String(checkOut))

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        error: 'Fechas inválidas. Formato esperado: YYYY-MM-DD',
      })
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        error: 'La fecha de salida debe ser posterior a la de entrada',
      })
    }

    // Obtener habitaciones disponibles que NO tengan reservas activas solapadas
    // SELECT * FROM rooms r WHERE r.status = 'Disponible'
    // AND r.id NOT IN (
    //   SELECT res.roomId FROM reservations res
    //   WHERE res.status IN ('Pendiente', 'Confirmada')
    //   AND res.checkInDate < $checkOut AND res.checkOutDate > $checkIn
    // )
    const reservedRoomIds = await Reservation.findAll({
      attributes: ['roomId'],
      where: {
        status: {
          [Op.in]: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
        checkInDate: {
          [Op.lt]: checkOutDate, // check_in < checkOut
        },
        checkOutDate: {
          [Op.gt]: checkInDate, // check_out > checkIn
        },
      },
      raw: true,
    })

    const reservedIds = reservedRoomIds.map((r: any) => r.roomId)

    const availableRooms = await Room.findAll({
      where: {
        status: RoomStatus.DISPONIBLE,
        id: {
          [Op.notIn]: reservedIds.length > 0 ? reservedIds : [0], // Evitar query vacía
        },
      },
      order: [['roomNumber', 'ASC']],
    })

    res.json({
      checkIn: String(checkIn),
      checkOut: String(checkOut),
      count: availableRooms.length,
      availableRooms,
    })
  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error)
    res.status(500).json({ error: 'Error al obtener habitaciones disponibles' })
  }
}

export const getRoomStatistics = async (_req: Request, res: Response) => {
  try {
    const total = await Room.count()

    const byStatus = await Room.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    })

    const byType = await Room.findAll({
      attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['type'],
      raw: true,
    })

    const avgPrice = (await Room.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('pricePerNight')), 'avgPrice']],
      raw: true,
    })) as { avgPrice: string | null } | null

    res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map((item: any) => [item.status, Number(item.count)])),
      byType: Object.fromEntries(byType.map((item: any) => [item.type, Number(item.count)])),
      averagePrice: Number(avgPrice?.avgPrice || 0),
    })
  } catch (error) {
    console.error('Error al obtener estadisticas:', error)
    res.status(500).json({ error: 'Error al obtener estadisticas' })
  }
}
