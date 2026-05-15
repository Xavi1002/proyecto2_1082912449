import { Request, Response } from 'express'
import { Op } from 'sequelize'
import crypto from 'crypto'
import Role, { RoleType } from '../models/Role'
import User from '../models/User'
import { hashPassword } from '../utils/password'

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    })
    res.json({
      count: users.length,
      users,
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
    })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(user)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, roleId } = req.body

    // Validaciones
    if (!name || !email || !roleId) {
      return res.status(400).json({
        error: 'name, email y roleId son requeridos',
      })
    }

    // Verificar que el rol existe
    const role = await Role.findByPk(roleId)
    if (!role) {
      return res.status(400).json({ error: 'Rol no encontrado' })
    }

    // Verificar que el email no existe
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }

    const temporaryPassword = crypto.randomBytes(5).toString('hex')
    const hashedPassword = await hashPassword(temporaryPassword)

    const user = await User.create({
      name,
      email,
      roleId,
      password: hashedPassword,
      mustChangePassword: true,
    })

    const userWithRole = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
    })

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      temporaryPassword,
      user: userWithRole,
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, email, roleId, isActive } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Si se cambia el email, verificar que no exista otro
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' })
      }
    }

    // Si se cambia el rol, verificar que existe
    if (roleId) {
      const role = await Role.findByPk(roleId)
      if (!role) {
        return res.status(400).json({ error: 'Rol no encontrado' })
      }
    }

    await user.update({
      ...(name && { name }),
      ...(email && { email }),
      ...(roleId && { roleId }),
      ...(isActive !== undefined && { isActive }),
    })

    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: { exclude: ['password'] },
    })

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    await user.destroy()
    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
}

export const searchUsersByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.query
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Término de búsqueda requerido' })
    }

    const normalizedName = name.trim()
    if (!normalizedName) {
      return res.status(400).json({ error: 'Término de búsqueda requerido' })
    }

    const clientRole = await Role.findOne({
      where: { name: RoleType.CLIENTE },
      attributes: ['id'],
    })

    if (!clientRole) {
      return res.status(500).json({ error: 'Rol de cliente no configurado' })
    }

    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      where: {
        roleId: clientRole.id,
        isActive: true,
        name: {
          [Op.iLike]: `%${normalizedName}%`,
        },
      },
      order: [['name', 'ASC']],
      limit: 50,
    })

    res.json({ users, count: users.length })
  } catch (error) {
    res.status(500).json({ error: 'Error searching users' })
  }
}
