import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import ClientSearchInput, { ClientOption } from '../components/ClientSearchInput'
import { api } from '../lib/api'

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

	return (
		<ProtectedRoute requiredRoles={['SuperAdmin', 'Recepción']}>
			<header style={styles.header}>
				<p style={styles.kicker}>Gestión de clientes</p>
				<h1 style={styles.title}>Registro y Portal de Huéspedes</h1>
			</header>

			{temporaryPassword && (
				<div style={styles.tempPasswordBox}>
					<div style={styles.tempPasswordHeader}>
						<span>Contraseña temporal (se muestra una sola vez): <strong>{temporaryPassword}</strong></span>
						<button
							type="button"
							onClick={() => setTemporaryPassword(null)}
							style={styles.dismissButton}
						>
							Cerrar
						</button>
					</div>
				</div>
			)}

			{error && <div style={styles.error}>{error}</div>}

			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>Buscar cliente</h2>
				<ClientSearchInput onSelect={setSelectedClient} />
				{selectedClient && (
					<p style={styles.selectedClient}>
						Seleccionado: {selectedClient.name} - {selectedClient.identificationNumber}
					</p>
				)}
			</section>

			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>Crear cliente</h2>
				<form onSubmit={handleCreate} style={styles.formGrid}>
					<input
						placeholder="Nombre"
						value={form.name}
						onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
						required
						style={styles.input}
					/>
					<input
						placeholder="Correo"
						type="email"
						value={form.email}
						onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
						required
						style={styles.input}
					/>
					<input
						placeholder="Teléfono"
						value={form.phone}
						onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
						style={styles.input}
					/>
					<input
						placeholder="Documento"
						value={form.identificationNumber}
						onChange={(e) => setForm((prev) => ({ ...prev, identificationNumber: e.target.value }))}
						required
						style={styles.input}
					/>
					<label style={styles.checkboxLabel}>
						<input
							type="checkbox"
							checked={form.givePortalAccess}
							onChange={(e) => setForm((prev) => ({ ...prev, givePortalAccess: e.target.checked }))}
						/>
						Dar acceso al portal
					</label>
					<button type="submit" disabled={loading} style={styles.button}>
						{loading ? 'Guardando...' : 'Crear cliente'}
					</button>
				</form>
			</section>

			<section style={styles.section}>
				<h2 style={styles.sectionTitle}>Listado de clientes</h2>
				<div style={styles.tableWrap}>
					<table style={styles.table}>
						<thead>
							<tr>
								<th style={styles.th}>Nombre</th>
								<th style={styles.th}>Documento</th>
								<th style={styles.th}>Correo</th>
								<th style={styles.th}>Portal</th>
							</tr>
						</thead>
						<tbody>
							{clients.length === 0 ? (
								<tr>
									<td colSpan={4} style={styles.emptyCell}>
										No hay clientes registrados.
									</td>
								</tr>
							) : (
								clients.map((client) => (
									<tr key={client.id}>
										<td style={styles.td}>{client.name}</td>
										<td style={styles.td}>{client.identificationNumber}</td>
										<td style={styles.td}>{client.email}</td>
										<td style={styles.td}>{client.userId ? 'Con acceso' : 'Sin acceso'}</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>
		</ProtectedRoute>
	)
}

const styles = {
	header: { marginBottom: '1rem' },
	kicker: {
		margin: 0,
		color: '#64748b',
		textTransform: 'uppercase' as const,
		fontSize: '0.8rem',
		letterSpacing: '0.08em',
		fontWeight: 700,
	},
	title: { margin: '0.45rem 0 0 0', color: '#0f172a' },
	tempPasswordBox: {
		marginBottom: '1rem',
		border: '1px solid #f59e0b',
		backgroundColor: '#fffbeb',
		borderRadius: '8px',
		padding: '0.8rem',
		color: '#92400e',
	},
	tempPasswordHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '0.75rem',
	},
	dismissButton: {
		border: '1px solid #f59e0b',
		borderRadius: '8px',
		padding: '0.35rem 0.6rem',
		backgroundColor: '#fff',
		color: '#92400e',
		fontWeight: 700,
		cursor: 'pointer',
	},
	error: {
		marginBottom: '1rem',
		border: '1px solid #fecaca',
		backgroundColor: '#fef2f2',
		borderRadius: '8px',
		padding: '0.8rem',
		color: '#b91c1c',
	},
	section: {
		border: '1px solid #e2e8f0',
		backgroundColor: '#fff',
		borderRadius: '10px',
		padding: '1rem',
		marginBottom: '1rem',
	},
	sectionTitle: { marginTop: 0, color: '#0f172a', fontSize: '1rem' },
	selectedClient: { color: '#1d4ed8', fontSize: '0.9rem', marginTop: '0.6rem' },
	formGrid: {
		display: 'grid',
		gap: '0.6rem',
	},
	input: {
		border: '1px solid #d1d5db',
		borderRadius: '8px',
		padding: '0.6rem 0.8rem',
	},
	checkboxLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: '0.5rem',
		color: '#334155',
		fontSize: '0.92rem',
	},
	button: {
		border: 'none',
		borderRadius: '8px',
		padding: '0.65rem 0.9rem',
		backgroundColor: '#1d4ed8',
		color: '#fff',
		fontWeight: 700,
		cursor: 'pointer',
	},
	tableWrap: { overflowX: 'auto' as const },
	table: { width: '100%', borderCollapse: 'collapse' as const },
	th: { textAlign: 'left' as const, borderBottom: '1px solid #e2e8f0', padding: '0.5rem' },
	td: { borderBottom: '1px solid #f1f5f9', padding: '0.5rem' },
	emptyCell: { padding: '1rem', textAlign: 'center' as const, color: '#64748b' },
} as const
