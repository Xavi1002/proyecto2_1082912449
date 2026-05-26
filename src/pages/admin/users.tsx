import { useEffect, useMemo, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { Avatar, Badge, Button, Input, Modal, Select, Table, type Column } from '../../components/ui'
import { Copy, Plus } from '../../components/icons'
import { api } from '../../lib/api'

type UserRecord = {
	id: number
	name: string
	email: string
	isActive: boolean
	mustChangePassword: boolean
	createdAt?: string
	role?: { name: string }
}

type CreateUserForm = {
	name: string
	email: string
	roleId: string
}

const roleOptions = [
	{ id: '1', label: 'SuperAdmin' },
	{ id: '2', label: 'Recepción' },
	{ id: '3', label: 'Cliente' },
]

const roleSelectOptions = roleOptions.map((option) => ({ value: option.id, label: option.label }))

const emptyForm: CreateUserForm = { name: '', email: '', roleId: '3' }

const formatDate = (value?: string) => {
	if (!value) return '—'
	try {
		return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
	} catch {
		return '—'
	}
}

export default function AdminUsersPage() {
	const [users, setUsers] = useState<UserRecord[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [form, setForm] = useState<CreateUserForm>(emptyForm)
	const [tempPassword, setTempPassword] = useState('')
	const [createdEmail, setCreatedEmail] = useState('')
	const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
	const [modalOpen, setModalOpen] = useState(false)

	const fetchUsers = async () => {
		try {
			setLoading(true)
			const response = await api.get('/users')
			setUsers(response.data.users || [])
			setError('')
		} catch (err: any) {
			setError(err.response?.data?.error || 'No fue posible cargar usuarios')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const createdRoleLabel = useMemo(
		() => roleOptions.find((option) => option.id === form.roleId)?.label || 'Cliente',
		[form.roleId]
	)

	const openCreateModal = () => {
		setForm(emptyForm)
		setTempPassword('')
		setCreatedEmail('')
		setCopyState('idle')
		setError('')
		setModalOpen(true)
	}

	const closeModal = () => {
		setModalOpen(false)
		setTempPassword('')
		setCreatedEmail('')
		setCopyState('idle')
		setForm(emptyForm)
	}

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault()
		setError('')
		setCopyState('idle')

		try {
			setSaving(true)
			const response = await api.post('/users', {
				name: form.name,
				email: form.email,
				roleId: Number(form.roleId),
			})

			setTempPassword(response.data.temporaryPassword || '')
			setCreatedEmail(response.data.user?.email || form.email)
			setForm(emptyForm)
			await fetchUsers()
		} catch (err: any) {
			setError(err.response?.data?.error || 'No fue posible crear el usuario')
		} finally {
			setSaving(false)
		}
	}

	const handleCopyPassword = async () => {
		if (!tempPassword) {
			return
		}

		await navigator.clipboard.writeText(tempPassword)
		setCopyState('copied')
		window.setTimeout(() => setCopyState('idle'), 1800)
	}

	const columns: Column<UserRecord>[] = [
		{
			key: 'avatar',
			header: '',
			className: 'w-12',
			render: (user) => <Avatar name={user.name} size="sm" />,
		},
		{
			key: 'name',
			header: 'Nombre',
			render: (user) => <span className="font-medium text-ink-900">{user.name}</span>,
		},
		{
			key: 'email',
			header: 'Correo',
			render: (user) => <span className="text-ink-500">{user.email}</span>,
		},
		{
			key: 'role',
			header: 'Rol',
			render: (user) => <Badge tone="info">{user.role?.name || 'N/A'}</Badge>,
		},
		{
			key: 'isActive',
			header: 'Estado',
			render: (user) =>
				user.isActive ? (
					<Badge tone="success">Activo</Badge>
				) : (
					<Badge tone="neutral">Inactivo</Badge>
				),
		},
		{
			key: 'mustChangePassword',
			header: 'Contraseña',
			render: (user) =>
				user.mustChangePassword ? (
					<Badge tone="warning">Pendiente</Badge>
				) : (
					<span className="text-xs text-ink-400">—</span>
				),
		},
		{
			key: 'createdAt',
			header: 'Creado',
			render: (user) => <span className="text-xs text-ink-500">{formatDate(user.createdAt)}</span>,
		},
	]

	return (
		<ProtectedRoute requiredRoles={['SuperAdmin']}>
			<header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-xs font-medium uppercase tracking-widest text-copper-500">Administración</p>
					<h1 className="mt-2 font-display text-4xl text-ink-900">Usuarios</h1>
					<p className="mt-2 text-ink-500 max-w-2xl">
						Crea cuentas internas con contraseña temporal y acceso controlado.
					</p>
				</div>
				<Button variant="primary" icon={<Plus size={16} />} onClick={openCreateModal}>
					Nuevo usuario
				</Button>
			</header>

			{error && !modalOpen && (
				<div className="mb-6 p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
					{error}
				</div>
			)}

			{loading ? (
				<div className="text-center text-ink-500 py-12">Cargando usuarios...</div>
			) : (
				<Table
					columns={columns}
					data={users}
					empty={
						<div className="bg-white border border-sand-200 rounded-xl shadow-paper px-6 py-16 text-center">
							<p className="text-sm text-ink-500">No hay usuarios registrados.</p>
						</div>
					}
				/>
			)}

			<Modal
				open={modalOpen}
				onClose={closeModal}
				title={tempPassword ? 'Contraseña temporal generada' : 'Nuevo usuario'}
				footer={
					tempPassword ? (
						<>
							<Button variant="ghost" onClick={closeModal}>Cerrar</Button>
							<Button variant="secondary" icon={<Copy size={16} />} onClick={handleCopyPassword}>
								{copyState === 'copied' ? 'Copiado' : 'Copiar'}
							</Button>
						</>
					) : (
						<>
							<Button variant="ghost" type="button" onClick={closeModal}>Cancelar</Button>
							<Button
								variant="primary"
								type="submit"
								form="create-user-form"
								loading={saving}
							>
								Crear usuario
							</Button>
						</>
					)
				}
			>
				{tempPassword ? (
					<div className="space-y-4">
						<div>
							<p className="text-xs font-medium uppercase tracking-widest text-copper-500">Cuenta creada</p>
							<p className="mt-1 font-display text-xl text-ink-900">{createdEmail}</p>
							<p className="mt-2 text-sm text-ink-500">
								Esta contraseña se muestra una sola vez. El usuario deberá cambiarla al iniciar sesión.
							</p>
						</div>
						<Input
							label="Contraseña temporal"
							readOnly
							value={tempPassword}
							className="font-mono tracking-wide"
						/>
					</div>
				) : (
					<form id="create-user-form" onSubmit={handleCreate} className="space-y-4">
						{error && (
							<div className="p-3 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
								{error}
							</div>
						)}
						<Input
							label="Nombre completo"
							value={form.name}
							onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
							placeholder="Nombre y apellido"
							required
						/>
						<Input
							label="Correo electrónico"
							type="email"
							value={form.email}
							onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
							placeholder="usuario@hotel.com"
							required
						/>
						<Select
							label="Rol"
							value={form.roleId}
							onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}
							options={roleSelectOptions}
						/>
						<p className="text-xs text-ink-500">
							Se generará una contraseña temporal para el rol {createdRoleLabel}.
						</p>
					</form>
				)}
			</Modal>
		</ProtectedRoute>
	)
}
