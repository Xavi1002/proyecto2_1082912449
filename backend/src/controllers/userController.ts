import { Request, Response } from 'express'
import User from '../models/User'

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' })
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body
    const user = await User.create({ name, email })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, email } = req.body
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    await user.update({ name, email })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: 'Error updating user' })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    await user.destroy()
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' })
  }
}
