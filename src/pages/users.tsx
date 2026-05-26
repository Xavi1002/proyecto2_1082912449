import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useHasRole } from '../components/RoleBasedAccess'
import { Avatar, Badge, Button, EmptyState, Input, Select, Table, type Column } from '../components/ui'
import { Pencil, Trash, Users as UsersIcon } from '../components/icons'
import { api } from '../lib/api'

interface User {
  id: number
  name: string
  email: string
  role?: {
    name: string
    description: string
  }
  isActive: boolean
  createdAt: string
}

const roleOptions = [
  { value: 'SuperAdmin', label: 'SuperAdmin' },
  { value: 'Recepción', label: 'Recepción' },
  { value: 'Cliente', label: 'Cliente' },
]

const statusOptions = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
]

const roleTone = (role?: string): 'danger' | 'info' | 'success' | 'neutral' => {
  switch (role) {
    case 'SuperAdmin':
      return 'danger'
    case 'Recepción':
      return 'info'
    case 'Cliente':
      return 'success'
    default:
      return 'neutral'
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    isActive: true,
  })

  const isSuperAdmin = useHasRole('SuperAdmin')

  useEffect(() => {
    if (!isSuperAdmin) {
      setError('No tienes permiso para acceder a esta página')
      return
    }
    fetchUsers()
  }, [isSuperAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users')
      setUsers(response.data.users || [])
      setError('')
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error al cargar usuarios'
      setError(message)
      console.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      roleId: user.role?.name || '',
      isActive: user.isActive,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: '', email: '', roleId: '', isActive: true })
  }

  const handleUpdate = async (userId: number) => {
    try {
      const roleMap: Record<string, number> = {
        SuperAdmin: 1,
        'Recepción': 2,
        Cliente: 3,
      }

      const payload = {
        ...formData,
        roleId: roleMap[formData.roleId as keyof typeof roleMap] || 1,
      }

      const response = await api.put(`/users/${userId}`, payload)
      setUsers(
        users.map((u) => (u.id === userId ? response.data.user : u))
      )
      handleCancel()
      setError('')
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error al actualizar usuario'
      setError(message)
      console.error(message)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return

    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter((u) => u.id !== userId))
      setError('')
    } catch (err: any) {
      const message = err.response?.data?.error || 'Error al eliminar usuario'
      setError(message)
      console.error(message)
    }
  }

  if (!isSuperAdmin) {
    return (
      <ProtectedRoute>
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Administración</p>
          <h1 className="mt-2 font-display text-4xl text-ink-900">Usuarios</h1>
        </header>
        <EmptyState
          icon={<UsersIcon size={20} />}
          title="Acceso denegado"
          description="Solo los SuperAdmin pueden acceder a la gestión de usuarios."
        />
      </ProtectedRoute>
    )
  }

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      header: '',
      className: 'w-12',
      render: (user) => <Avatar name={user.name} size="sm" />,
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (user) =>
        editingId === user.id ? (
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        ) : (
          <span className="font-medium text-ink-900">{user.name}</span>
        ),
    },
    {
      key: 'email',
      header: 'Correo',
      render: (user) =>
        editingId === user.id ? (
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        ) : (
          <span className="text-ink-500">{user.email}</span>
        ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user) =>
        editingId === user.id ? (
          <Select
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            options={roleOptions}
          />
        ) : (
          <Badge tone={roleTone(user.role?.name)}>{user.role?.name || 'N/A'}</Badge>
        ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (user) =>
        editingId === user.id ? (
          <Select
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            options={statusOptions}
          />
        ) : user.isActive ? (
          <Badge tone="success">Activo</Badge>
        ) : (
          <Badge tone="neutral">Inactivo</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-56',
      render: (user) =>
        editingId === user.id ? (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => handleUpdate(user.id)}>
              Guardar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => handleEdit(user)}>
              Editar
            </Button>
            <Button size="sm" variant="danger" icon={<Trash size={14} />} onClick={() => handleDelete(user.id)}>
              Eliminar
            </Button>
          </div>
        ),
    },
  ]

  return (
    <ProtectedRoute>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-copper-500">Administración</p>
          <h1 className="mt-2 font-display text-4xl text-ink-900">Gestión de usuarios</h1>
          <p className="mt-2 text-ink-500 max-w-2xl">
            Edita roles, estados y mantén actualizadas las cuentas internas del hotel.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchUsers}>
          Actualizar
        </Button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-ink-500 py-12">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<UsersIcon size={20} />}
          title="Sin usuarios"
          description="Aún no hay usuarios registrados en el sistema."
        />
      ) : (
        <Table columns={columns} data={users} />
      )}
    </ProtectedRoute>
  )
}
