import { useEffect, useMemo, useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { api } from '../../lib/api'

type UserRecord = {
	id: number
	name: string
	email: string
	isActive: boolean
	mustChangePassword: boolean
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

const emptyForm: CreateUserForm = { name: '', email: '', roleId: '3' }

export default function AdminUsersPage() {
	const [users, setUsers] = useState<UserRecord[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [form, setForm] = useState<CreateUserForm>(emptyForm)
	const [tempPassword, setTempPassword] = useState('')
	const [createdEmail, setCreatedEmail] = useState('')
	const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

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

	return (
		<ProtectedRoute requiredRoles={['SuperAdmin']}>
			<header className="mb-6">
				<p className="text-sm font-semibold uppercase tracking-wide text-hm-text-secondary">Administración</p>
				<h1 className="mt-2 text-3xl font-bold text-hm-text-main">Usuarios</h1>
				<p className="mt-2 text-sm text-hm-text-secondary">Crea cuentas internas con contraseña temporal y acceso controlado.</p>
			</header>

			{tempPassword ? (
				<div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Contraseña temporal generada</p>
							<h2 className="mt-1 text-xl font-bold text-amber-950">{createdEmail}</h2>
							<p className="mt-1 text-sm text-amber-800">Se muestra una sola vez. El usuario deberá cambiarla al iniciar sesión.</p>
						</div>
						<div className="rounded-xl border border-amber-200 bg-white px-4 py-3 font-mono text-lg text-amber-950 shadow-inner">
							{tempPassword}
						</div>
					</div>
					<div className="mt-4 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={handleCopyPassword}
							className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
						>
							{copyState === 'copied' ? 'Copiado' : 'Copiar'}
						</button>
						<button
							type="button"
							onClick={() => setTempPassword('')}
							className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100"
						>
							Cerrar
						</button>
					</div>
				</div>
			) : null}

			{error ? (
				<div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
			) : null}

			<section className="mb-6 rounded-2xl border border-hm-border bg-white p-6 shadow-sm">
				<h2 className="text-xl font-semibold text-hm-text-main">Nuevo usuario</h2>
				<form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-3">
					<input
						value={form.name}
						onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
						placeholder="Nombre completo"
						className="rounded-lg border border-hm-border px-4 py-3"
						required
					/>
					<input
						type="email"
						value={form.email}
						onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
						placeholder="Correo"
						className="rounded-lg border border-hm-border px-4 py-3"
						required
					/>
					<select
						value={form.roleId}
						onChange={(event) => setForm((current) => ({ ...current, roleId: event.target.value }))}
						className="rounded-lg border border-hm-border px-4 py-3"
					>
						{roleOptions.map((option) => (
							<option key={option.id} value={option.id}>{option.label}</option>
						))}
					</select>
					<div className="md:col-span-3 flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
						<p className="text-sm text-hm-text-secondary">Se generará una contraseña temporal para el rol {createdRoleLabel}.</p>
						<button
							type="submit"
							disabled={saving}
							className="rounded-lg bg-hm-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{saving ? 'Creando...' : 'Crear usuario'}
						</button>
					</div>
				</form>
			</section>

			<section className="rounded-2xl border border-hm-border bg-white p-6 shadow-sm">
				<div className="mb-4 flex items-center justify-between gap-4">
					<h2 className="text-xl font-semibold text-hm-text-main">Usuarios existentes</h2>
					<button type="button" onClick={fetchUsers} className="rounded-lg border border-hm-border px-4 py-2 text-sm font-medium text-hm-text-secondary">
						Actualizar
					</button>
				</div>

				{loading ? (
					<p className="py-8 text-center text-hm-text-secondary">Cargando usuarios...</p>
				) : users.length === 0 ? (
					<div className="rounded-xl border border-dashed border-hm-border px-4 py-10 text-center text-hm-text-secondary">
						No hay usuarios registrados.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b border-hm-border text-hm-text-secondary">
									<th className="py-2">Nombre</th>
									<th className="py-2">Correo</th>
									<th className="py-2">Rol</th>
									<th className="py-2">Estado</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user) => (
									<tr key={user.id} className="border-b border-hm-border/60">
										<td className="py-3 text-hm-text-main">{user.name}</td>
										<td className="py-3 text-hm-text-secondary">{user.email}</td>
										<td className="py-3 text-hm-text-secondary">{user.role?.name || 'N/A'}</td>
										<td className="py-3 text-hm-text-secondary">{user.isActive ? 'Activo' : 'Inactivo'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</ProtectedRoute>
	)
}
