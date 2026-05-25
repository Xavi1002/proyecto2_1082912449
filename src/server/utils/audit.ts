import { appendFile, readFile } from 'fs/promises'
import path from 'path'

type AuditEntry = {
  action: string
  entity: string
  entityId: number | string
  actorUserId: number
  metadata?: Record<string, unknown>
}

export type AuditRecord = AuditEntry & {
  recordedAt: string
}

const auditLogPath = path.resolve(process.cwd(), 'audit-log.jsonl')

const serializeAudit = (entry: AuditRecord) => `${JSON.stringify(entry)}\n`

export const recordAudit = async (entry: AuditEntry): Promise<void> => {
  const record: AuditRecord = {
    ...entry,
    recordedAt: new Date().toISOString(),
  }

  console.log('[AUDIT]', JSON.stringify(record))

  try {
    await appendFile(auditLogPath, serializeAudit(record), 'utf8')
  } catch (error) {
    console.error('No fue posible persistir el evento de auditoría:', error)
  }
}

export const getAuditRecords = async (limit = 100): Promise<AuditRecord[]> => {
  try {
    const content = await readFile(auditLogPath, 'utf8')
    return content
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuditRecord)
      .slice(-limit)
      .reverse()
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return []
    }

    throw error
  }
}
