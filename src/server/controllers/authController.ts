import { Request, Response } from 'express'
import User from '../models/User'
import Role, { RoleType } from '../models/Role'
import { hashPassword, comparePasswords } from '../utils/password'
import { generateToken } from '../utils/jwt'

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = RoleType.CLIENTE } = req.body

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'nombre, email y contraseña son requeridos',
      })
    }

    // Verificar que el email no exista
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }

    // Obtener el rol
    const roleRecord = await Role.findOne({ where: { name: role } })
    if (!roleRecord) {
      return res.status(400).json({ error: 'Rol no válido' })
    }

    // Hash de contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: roleRecord.id,
      mustChangePassword: false,
    })

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      role: roleRecord.name,
    })

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleRecord.name,
        mustChangePassword: user.mustChangePassword,
      },
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos',
      })
    }

    // Buscar usuario con su rol
    const user = await User.findOne({
      where: { email },
      include: { model: Role, as: 'role' },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Verificar contraseña
    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Generar token
    const roleRecord = await Role.findByPk(user.roleId)
    const token = generateToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      role: roleRecord?.name || RoleType.CLIENTE,
    })

    res.json({
      message: 'Sesión iniciada exitosamente',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleRecord?.name,
        mustChangePassword: user.mustChangePassword,
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const user = await User.findByPk(req.user.id, {
      include: { model: Role, as: 'role' },
      attributes: { exclude: ['password'] },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const currentUser = user.toJSON() as {
      id: number
      name: string
      email: string
      role?: {
        name?: string
      }
    }

    res.json({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role?.name || req.user.role,
      mustChangePassword: (user as any).mustChangePassword || false,
    })
  } catch (error) {
    console.error('Error al obtener usuario actual:', error)
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
}

export const logout = (req: Request, res: Response) => {
  // En aplicaciones SPA, el logout se maneja en el cliente eliminando el token
  res.json({ message: 'Sesión cerrada. Por favor, elimine el token del cliente.' })
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword y newPassword son requeridos' })
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const matches = await comparePasswords(String(currentPassword), user.password)
    if (!matches) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' })
    }

    const hashedPassword = await hashPassword(String(newPassword))
    await user.update({ password: hashedPassword, mustChangePassword: false })

    return res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    return res.status(500).json({ error: 'Error al cambiar contraseña' })
  }
}
