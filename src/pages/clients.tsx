import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import ClientSearchInput, { ClientOption } from '../components/ClientSearchInput'
import { api } from '../lib/api'
import { Users } from '../components/icons'
import { Avatar, Badge, Button, Card, EmptyState, Input, Table } from '../components/ui'
import type { Column } from '../components/ui'

type ClientRecord = {
	id: number
	name: string
	email: string
	phone?: string | null
	identificationNumber: string
	userId?: number | null
}

type CreateClientForm = {
	name: string
	email: string
	phone: string
	identificationNumber: string
	givePortalAccess: boolean
}

const emptyForm: CreateClientForm = {
	name: '',
	email: '',
	phone: '',
	identificationNumber: '',
	givePortalAccess: false,
}

export default function ClientsPage() {
	const [clients, setClients] = useState<ClientRecord[]>([])
	const [form, setForm] = useState<CreateClientForm>(emptyForm)
	const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
	const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const loadClients = async () => {
		try {
			const response = await api.get('/clients')
			setClients(response.data.clients || [])
		} catch (_error) {
			setClients([])
		}
	}

	useEffect(() => {
		loadClients()
	}, [])

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault()
		setError('')
		setTemporaryPassword(null)

		try {
			setLoading(true)
			const response = await api.post('/clients', form)
			if (response.data.temporaryPassword) {
				setTemporaryPassword(response.data.temporaryPassword)
			}
			setForm(emptyForm)
			await loadClients()
		} catch (err: any) {
			setError(err.response?.data?.error || 'Error al crear cliente')
		} finally {
			setLoading(false)
		}
	}

	const columns: Column<ClientRecord>[] = [
		{
			key: 'avatar',
			header: '',
			render: (c) => <Avatar name={c.name} size="sm" />,
			className: 'w-12',
		},
		{
			key: 'name',
			header: 'Nombre',
			render: (c) => <span className="font-medium text-ink-900">{c.name}</span>,
		},
		{
			key: 'identificationNumber',
			header: 'Documento',
			render: (c) => <span className="text-ink-700">{c.identificationNumber || '—'}</span>,
		},
		{
			key: 'email',
			header: 'Correo',
			render: (c) => <span className="text-ink-500">{c.email}</span>,
		},
		{
			key: 'phone',
			header: 'Teléfono',
			render: (c) => <span className="text-ink-500">{c.phone || '—'}</span>,
		},
		{
			key: 'portal',
			header: 'Portal',
			render: (c) => (
				<Badge tone={c.userId ? 'success' : 'neutral'}>
					{c.userId ? 'Con acceso' : 'Sin acceso'}
				</Badge>
			),
		},
	]

	return (
		<ProtectedRoute requiredRoles={['SuperAdmin', 'Recepción']}>
			<header className="mb-8">
				<p className="text-xs font-medium uppercase tracking-widest text-copper-500">Huéspedes</p>
				<h1 className="mt-2 font-display text-4xl text-ink-900">Clientes</h1>
				<p className="mt-2 text-ink-500 max-w-2xl">
					Registro y portal de huéspedes. Busca por nombre o documento y administra los accesos.
				</p>
			</header>

			{temporaryPassword && (
				<div className="mb-6 p-4 bg-[#F5E9D9] text-warning-500 text-sm rounded-md border border-warning-500/20">
					Contraseña temporal (se muestra una sola vez): <strong className="ml-1">{temporaryPassword}</strong>
				</div>
			)}

			{error && (
				<div className="mb-6 p-4 bg-[#F5DDDB] text-danger-500 text-sm rounded-md border border-danger-500/20">
					{error}
				</div>
			)}

			<section className="mb-6">
				<h2 className="font-display text-2xl text-ink-900 mb-3">Buscar cliente</h2>
				<div className="max-w-md">
					<ClientSearchInput onSelect={setSelectedClient} />
				</div>
				{selectedClient && (
					<p className="mt-3 text-sm text-ink-700">
						Seleccionado: <span className="font-medium text-ink-900">{selectedClient.name}</span>
						<span className="text-ink-500"> · {selectedClient.identificationNumber}</span>
					</p>
				)}
			</section>

			<section className="mb-8">
				<h2 className="font-display text-2xl text-ink-900 mb-3">Crear cliente</h2>
				<Card>
					<form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
						<Input
							label="Nombre"
							placeholder="Nombre completo"
							value={form.name}
							onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
							required
						/>
						<Input
							label="Correo"
							type="email"
							placeholder="correo@ejemplo.com"
							value={form.email}
							onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
							required
						/>
						<Input
							label="Teléfono"
							placeholder="Opcional"
							value={form.phone}
							onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
						/>
						<Input
							label="Documento"
							placeholder="Número de identificación"
							value={form.identificationNumber}
							onChange={(e) => setForm((prev) => ({ ...prev, identificationNumber: e.target.value }))}
							required
						/>
						<label className="flex items-center gap-2 text-sm text-ink-700 sm:col-span-2">
							<input
								type="checkbox"
								checked={form.givePortalAccess}
								onChange={(e) => setForm((prev) => ({ ...prev, givePortalAccess: e.target.checked }))}
								className="h-4 w-4 rounded border-sand-200 text-ink-900 focus:ring-ink-900/10"
							/>
							Dar acceso al portal
						</label>
						<div className="sm:col-span-2 flex justify-end">
							<Button type="submit" loading={loading}>
								Crear cliente
							</Button>
						</div>
					</form>
				</Card>
			</section>

			<section>
				<h2 className="font-display text-2xl text-ink-900 mb-3">Listado de clientes</h2>
				{clients.length === 0 ? (
					<EmptyState
						icon={<Users size={20} />}
						title="Sin clientes"
						description="Cuando registres un cliente aparecerá aquí."
					/>
				) : (
					<Table columns={columns} data={clients} />
				)}
			</section>
		</ProtectedRoute>
	)
}
