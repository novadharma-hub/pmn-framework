import { isSupabaseConfigured, supabase } from './supabase'

export const BACKEND_TABLES = {
  versions: 'pmn_versions',
  auditLogs: 'pmn_audit_logs',
  notes: 'pmn_notes',
  bookmarks: 'pmn_bookmarks',
  progress: 'pmn_reading_progress',
  sections: 'pmn_sections',
  glossary: 'pmn_glossary_terms',
  relations: 'pmn_section_relations',
}

function ensureConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dulu.')
  }
}

function isoOrNow(value) {
  return value || new Date().toISOString()
}

export function mapVersionRecordToRow(record, actorId = null) {
  return {
    id: record.id || undefined,
    version_label: record.version,
    release_date: record.date,
    subtitle: record.subtitle || '',
    summary: record.summary || '',
    changelog: record.changelog || '',
    pdf_url: record.pdfUrl || '',
    is_published: record.isPublished ?? true,
    created_by: actorId,
    created_at: isoOrNow(record.createdAt),
    updated_at: isoOrNow(record.updatedAt),
  }
}

export function mapVersionRowToRecord(row) {
  return {
    id: row.id,
    version: row.version_label,
    date: row.release_date,
    subtitle: row.subtitle || '',
    summary: row.summary || '',
    changelog: row.changelog || '',
    pdfUrl: row.pdf_url || '',
    isPublished: row.is_published !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listPublishedVersions() {
  ensureConfigured()
  const { data, error } = await supabase
    .from(BACKEND_TABLES.versions)
    .select('*')
    .eq('is_published', true)
    .order('release_date', { ascending: false })

  if (error) throw error
  return (data || []).map(mapVersionRowToRecord)
}

export async function upsertVersion(record, actorId = null) {
  ensureConfigured()
  const payload = mapVersionRecordToRow(record, actorId)
  const { data, error } = await supabase
    .from(BACKEND_TABLES.versions)
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return mapVersionRowToRecord(data)
}

export async function deleteVersion(id) {
  ensureConfigured()
  const { error } = await supabase
    .from(BACKEND_TABLES.versions)
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function recordAuditLog(entry) {
  ensureConfigured()
  const payload = {
    actor_id: entry.actorId || null,
    actor_label: entry.actorLabel || 'unknown',
    action: entry.action,
    entity_type: entry.entityType || 'system',
    entity_id: entry.entityId || null,
    details: entry.details || {},
  }

  const { data, error } = await supabase
    .from(BACKEND_TABLES.auditLogs)
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function saveReaderNote(note) {
  ensureConfigured()
  const payload = {
    section_id: note.sectionId,
    note_text: note.noteText,
    manuscript_version: note.manuscriptVersion || 'v97',
  }

  const { data, error } = await supabase
    .from(BACKEND_TABLES.notes)
    .upsert(payload, { onConflict: 'user_id,section_id,manuscript_version' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function saveReadingProgress(progress) {
  ensureConfigured()
  const payload = {
    manuscript_version: progress.manuscriptVersion || 'v97',
    part_code: progress.partCode,
    section_id: progress.sectionId,
    completion_percent: progress.completionPercent ?? null,
    last_read_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(BACKEND_TABLES.progress)
    .upsert(payload, { onConflict: 'user_id,manuscript_version' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function buildContextPack(query, activeSectionId = null) {
  ensureConfigured()

  let request = supabase
    .from(BACKEND_TABLES.sections)
    .select('section_id,title,part_code,body_text,summary')
    .limit(8)

  if (activeSectionId) {
    request = request.or(`section_id.eq.${activeSectionId},title.ilike.%${query || ''}%`)
  } else if (query) {
    request = request.ilike('body_text', `%${query}%`)
  }

  const { data, error } = await request
  if (error) throw error

  return (data || []).map(row => ({
    id: row.section_id,
    title: row.title,
    part: row.part_code,
    excerpt: row.summary || String(row.body_text || '').slice(0, 600),
  }))
}
