import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import RoleBasedAccess, { useHasRole } from '../components/RoleBasedAccess'
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
        Recepción: 2,
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
        <div style={styles.container}>
          <div style={styles.errorBox}>
            <h2>Acceso Denegado</h2>
            <p>Solo los SuperAdmin pueden acceder a la gestión de usuarios.</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1>Gestión de Usuarios</h1>
            <p style={styles.subtitle}>SuperAdmin - Gestión de cuentas de usuario</p>
          </div>
          <button onClick={fetchUsers} style={styles.refreshButton}>
            Actualizar
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingBox}>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyCell}>
                      No hay usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} style={styles.bodyRow}>
                      {editingId === user.id ? (
                        <>
                          <td style={styles.td}>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              style={styles.input}
                            />
                          </td>
                          <td style={styles.td}>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              style={styles.input}
                            />
                          </td>
                          <td style={styles.td}>
                            <select
                              value={formData.roleId}
                              onChange={(e) =>
                                setFormData({ ...formData, roleId: e.target.value })
                              }
                              style={styles.input}
                            >
                              <option value="SuperAdmin">SuperAdmin</option>
                              <option value="Recepción">Recepción</option>
                              <option value="Cliente">Cliente</option>
                            </select>
                          </td>
                          <td style={styles.td}>
                            <select
                              value={formData.isActive ? 'true' : 'false'}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  isActive: e.target.value === 'true',
                                })
                              }
                              style={styles.input}
                            >
                              <option value="true">Activo</option>
                              <option value="false">Inactivo</option>
                            </select>
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => handleUpdate(user.id)}
                              style={styles.saveButton}
                            >
                              Guardar
                            </button>
                            <button
                              onClick={handleCancel}
                              style={styles.cancelButton}
                            >
                              Cancelar
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={styles.td}>{user.name}</td>
                          <td style={styles.td}>{user.email}</td>
                          <td style={styles.td}>
                            <span style={getRoleBadgeStyle(user.role?.name)}>
                              {user.role?.name || 'N/A'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(user.isActive
                                  ? styles.activeBadge
                                  : styles.inactiveBadge),
                              }}
                            >
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => handleEdit(user)}
                              style={styles.editButton}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              style={styles.deleteButton}
                            >
                              Eliminar
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

function getRoleBadgeStyle(role?: string) {
  const colors: Record<string, React.CSSProperties> = {
    SuperAdmin: {
      backgroundColor: '#7f1d1d',
      color: '#fca5a5',
      padding: '0.25rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    Recepción: {
      backgroundColor: '#1e3a8a',
      color: '#bfdbfe',
      padding: '0.25rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    Cliente: {
      backgroundColor: '#15803d',
      color: '#86efac',
      padding: '0.25rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
  }
  return colors[role || 'Cliente'] || colors.Cliente
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginTop: '0.5rem',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  errorBox: {
    padding: '1rem',
    marginBottom: '2rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.375rem',
    border: '1px solid #fca5a5',
  },
  loadingBox: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#64748b',
  },
  tableContainer: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  headerRow: {
    backgroundColor: '#1e293b',
    color: 'white',
  },
  th: {
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: 'bold',
    borderBottom: '2px solid #e2e8f0',
  },
  bodyRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  },
  editButton: {
    padding: '0.5rem 1rem',
    marginRight: '0.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    marginRight: '0.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  emptyCell: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#64748b',
  },
}
