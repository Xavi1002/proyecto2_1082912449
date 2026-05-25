import { Request, Response } from 'express'
import { Op } from 'sequelize'
import Client from '../models/Client'
import Reservation from '../models/Reservation'
import Role, { RoleType } from '../models/Role'
import User from '../models/User'
import { hashPassword } from '../utils/password'

const buildTemporaryPassword = () => {
  const suffix = Math.random().toString(36).slice(-6)
  return `Hotel${suffix}#`
}

const checkUniqueConstraints = async (email: string, identificationNumber: string, excludeId?: string) => {
  const emailWhere: any = { email }
  const documentWhere: any = { identificationNumber }

  if (excludeId) {
    emailWhere.id = { [Op.ne]: excludeId }
    documentWhere.id = { [Op.ne]: excludeId }
  }

  const existingByEmail = await Client.findOne({ where: emailWhere })
  if (existingByEmail) {
    return { field: 'email' as const }
  }

  const existingByDocument = await Client.findOne({ where: documentWhere })
  if (existingByDocument) {
    return { field: 'identificationNumber' as const }
  }

  return null
}

const resolveClientRole = async () => {
  const role = await Role.findOne({ where: { name: RoleType.CLIENTE } })
  if (!role) {
    throw new Error('Rol Cliente no configurado')
  }
  return role
}

export const getClients = async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const where = q
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { identificationNumber: { [Op.iLike]: `%${q}%` } },
          ],
        }
      : undefined

    const clients = await Client.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    })

    res.json({ count: clients.length, clients })
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    res.status(500).json({ error: 'Error al obtener clientes' })
  }
}

export const searchClients = async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    if (!q) {
      return res.json({ count: 0, clients: [] })
    }

    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { identificationNumber: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'name', 'identificationNumber', 'email', 'userId'],
      order: [['name', 'ASC']],
      limit: 8,
    })

    res.json({ count: clients.length, clients })
  } catch (error) {
    console.error('Error en búsqueda de clientes:', error)
    res.status(500).json({ error: 'Error al buscar clientes' })
  }
}

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const currentUser = req.user

    const client = await Client.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    })

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    // RN-07: cliente solo puede ver su propio perfil vinculado
    if (currentUser?.role === RoleType.CLIENTE) {
      const ownClient = await Client.findOne({
        where: {
          id,
          userId: currentUser.id,
        },
      })

      if (!ownClient) {
        return res.status(403).json({ error: 'No tiene permiso para ver este perfil de cliente' })
      }
    }

    const reservations = client.userId
      ? await Reservation.findAll({
          where: { userId: client.userId },
          order: [['checkInDate', 'DESC']],
          limit: 50,
        })
      : []

    res.json({ client, reservations })
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    res.status(500).json({ error: 'Error al obtener cliente' })
  }
}

export const createClient = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      identificationNumber,
      givePortalAccess = false,
      temporaryPassword,
    } = req.body

    if (!name || !email || !identificationNumber) {
      return res.status(400).json({ error: 'name, email e identificationNumber son requeridos' })
    }

    const duplicate = await checkUniqueConstraints(String(email), String(identificationNumber))
    if (duplicate?.field === 'email') {
      return res.status(409).json({ error: 'Ya existe un cliente con ese correo' })
    }

    if (duplicate?.field === 'identificationNumber') {
      return res.status(409).json({ error: 'Ya existe un cliente con ese número de documento.' })
    }

    let linkedUserId: number | null = null
    let generatedTemporaryPassword: string | null = null

    if (givePortalAccess) {
      const role = await resolveClientRole()
      const tempPassword = String(temporaryPassword || '').trim() || buildTemporaryPassword()
      const passwordHash = await hashPassword(tempPassword)

      const existingUser = await User.findOne({ where: { email: String(email) } })
      if (existingUser) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese correo para acceso al portal' })
      }

      const user = await User.create({
        name: String(name),
        email: String(email),
        password: passwordHash,
        roleId: role.id,
        mustChangePassword: true,
      })

      linkedUserId = user.id
      generatedTemporaryPassword = tempPassword
    }

    const client = await Client.create({
      userId: linkedUserId,
      name: String(name),
      email: String(email),
      phone: phone ? String(phone) : null,
      identificationNumber: String(identificationNumber),
    })

    return res.status(201).json({
      message: 'Cliente creado exitosamente',
      client,
      temporaryPassword: generatedTemporaryPassword,
    })
  } catch (error) {
    console.error('Error al crear cliente:', error)
    res.status(500).json({ error: 'Error al crear cliente' })
  }
}

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      name,
      email,
      phone,
      identificationNumber,
      givePortalAccess = false,
      temporaryPassword,
    } = req.body

    const client = await Client.findByPk(id)
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    if (email || identificationNumber) {
      const duplicate = await checkUniqueConstraints(
        String(email || client.email),
        String(identificationNumber || client.identificationNumber),
        id
      )

      if (duplicate?.field === 'email') {
        return res.status(409).json({ error: 'Ya existe un cliente con ese correo' })
      }

      if (duplicate?.field === 'identificationNumber') {
        return res.status(409).json({ error: 'Ya existe un cliente con ese número de documento.' })
      }
    }

    let generatedTemporaryPassword: string | null = null

    if (givePortalAccess && !client.userId) {
      const role = await resolveClientRole()
      const tempPassword = String(temporaryPassword || '').trim() || buildTemporaryPassword()
      const passwordHash = await hashPassword(tempPassword)

      const existingUser = await User.findOne({ where: { email: String(email || client.email) } })
      if (existingUser) {
        return res.status(409).json({ error: 'Ya existe un usuario con ese correo para acceso al portal' })
      }

      const user = await User.create({
        name: String(name || client.name),
        email: String(email || client.email),
        password: passwordHash,
        roleId: role.id,
        mustChangePassword: true,
      })

      client.userId = user.id
      generatedTemporaryPassword = tempPassword
    }

    await client.update({
      name: name ? String(name) : client.name,
      email: email ? String(email) : client.email,
      phone: phone !== undefined ? (phone ? String(phone) : null) : client.phone,
      identificationNumber: identificationNumber ? String(identificationNumber) : client.identificationNumber,
      userId: client.userId,
    })

    return res.json({
      message: 'Cliente actualizado exitosamente',
      client,
      temporaryPassword: generatedTemporaryPassword,
    })
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    res.status(500).json({ error: 'Error al actualizar cliente' })
  }
}

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const client = await Client.findByPk(id)

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    await client.destroy()
    res.json({ message: 'Cliente eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    res.status(500).json({ error: 'Error al eliminar cliente' })
  }
}
