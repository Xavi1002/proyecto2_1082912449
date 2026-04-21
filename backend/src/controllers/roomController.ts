import { Request, Response } from 'express'
import { Op } from 'sequelize'
import sequelize from '../config/database'
import Room, { RoomStatus, RoomType } from '../models/Room'

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
        error: 'Ya existe una habitacion con ese numero',
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
  } catch (error) {
    console.error('Error al crear habitacion:', error)
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
