import React, { useState, useEffect, useRef } from 'react'

interface VersionRecord {
  id: string
  version: string
  date: string
  subtitle: string
  summary: string
  changelog: string
  pdfUrl: string
  createdAt?: string
  updatedAt?: string
}

interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  details: string
}

interface VersionManagerProps {
  onBack: () => void
}

export default function VersionManager({ onBack }: VersionManagerProps) {
  const [versions, setVersions] = useState<VersionRecord[]>([])
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list')
  const [target, setTarget] = useState<VersionRecord | null>(null)
  const [toast, setToast] = useState('')
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Storage Keys
  const VERSIONS_KEY = 'pmn-versions'
  const AUDIT_KEY = 'pmn-audit-log'

  // Load Initial Data
  useEffect(() => {
    try {
      const savedVersions = localStorage.getItem(VERSIONS_KEY)
      if (savedVersions) setVersions(JSON.parse(savedVersions))
      
      const savedAudits = localStorage.getItem(AUDIT_KEY)
      if (savedAudits) setAuditEntries(JSON.parse(savedAudits))
    } catch (e) {
      console.error('Gagal memuat data versi lokal:', e)
    }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const appendAudit = (action: string, details: string) => {
    const session = sessionStorage.getItem('pmn-admin-session')
    const actor = session ? JSON.parse(session).user : 'local-admin'
    const entry: AuditEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      at: new Date().toISOString(),
      actor,
      action,
      details,
    }
    const updated = [entry, ...auditEntries].slice(0, 100)
    setAuditEntries(updated)
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated))
  }

  const handleSave = (data: VersionRecord) => {
    let updated: VersionRecord[]
    if (target) {
      updated = versions.map(v => (v.id === target.id ? { ...data, updatedAt: new Date().toISOString() } : v))
    } else {
      updated = [
        {
          ...data,
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...versions,
      ]
    }
    
    // Sort versions helper
    updated.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))
    
    setVersions(updated)
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(updated))
    appendAudit(target ? 'update-version' : 'create-version', `v${data.version} disimpan ke arsip lokal.`)
    setView('list')
    showToast(target ? 'Versi diperbarui.' : 'Versi baru dipublikasikan.')
    setTarget(null)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus versi ini dari penyimpanan lokal?')) return
    const doomed = versions.find(v => v.id === id)
    const updated = versions.filter(v => v.id !== id)
    setVersions(updated)
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(updated))
    appendAudit('delete-version', doomed ? `v${doomed.version} dihapus dari arsip lokal.` : 'Satu versi dihapus.')
    showToast('Versi berhasil dihapus.')
  }

  const handleExport = () => {
    const payload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      versions,
    }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `pmn-versions-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(href)
    appendAudit('export-backup', `${versions.length} versi diexport ke backup JSON.`)
    showToast('Backup JSON berhasil diunduh.')
  }

  const handleImportClick = () => {
    fileRef.current?.click()
  }

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'))
        const importedList = Array.isArray(parsed) ? parsed : parsed.versions
        if (!Array.isArray(importedList)) throw new Error('Format backup tidak dikenali.')
        
        setVersions(importedList)
        localStorage.setItem(VERSIONS_KEY, JSON.stringify(importedList))
        appendAudit('import-backup', `${importedList.length} versi diimpor dari file backup.`)
        showToast(`Backup berhasil diimpor: ${importedList.length} versi.`)
      } catch (e: any) {
        showToast(e.message || 'Gagal mengimpor backup.')
      }
    }
    reader.readAsText(file)
  }

  const handleLogout = () => {
    appendAudit('logout', 'Admin keluar dari panel.')
    sessionStorage.removeItem('pmn-admin-session')
    onBack()
  }

  const fmtDate = (iso: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="relative z-10 min-h-screen bg-[var(--bg)]">
      {/* Top Admin Navigation */}
      <div className="bg-[var(--sb)] border-b border-[var(--rule)] flex justify-between items-center px-8 py-3.5">
        <div className="flex items-center gap-6">
          <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[var(--acc)]">PMN Admin Panel</span>
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setTarget(null) }} className="font-mono text-[0.6rem] text-[var(--mute)] uppercase tracking-wider hover:text-[var(--acc)] cursor-pointer">
              ← Daftar Versi
            </button>
          )}
        </div>
        <button onClick={handleLogout} className="font-mono text-[0.6rem] text-[var(--mute)] uppercase tracking-[0.14em] hover:text-[var(--acc)] cursor-pointer">
          Keluar →
        </button>
      </div>

      <div className="max-w-[720px] mx-auto py-12 px-6">
        {toast && (
          <div className="bg-[#1a2e1a] border border-[#2d6a4f] text-[#6fcf97] font-mono text-[0.68rem] p-3 mb-6">
            {toast}
          </div>
        )}

        {view === 'list' && (
          <>
            <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--mute2)]">Semua Versi ({versions.length})</span>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleImportClick} className="font-mono text-[0.66rem] border border-[var(--rule)] px-3 py-1.5 hover:text-[var(--acc)] cursor-pointer">
                  Import Backup
                </button>
                <button onClick={handleExport} className="font-mono text-[0.66rem] border border-[var(--rule)] px-3 py-1.5 hover:text-[var(--acc)] cursor-pointer">
                  Export JSON
                </button>
                <button onClick={() => { setTarget(null); setView('add') }} className="font-mono text-[0.66rem] bg-[var(--acc)] text-white dark:text-black px-4 py-1.5 tracking-wider hover:opacity-75 cursor-pointer">
                  + Versi Baru
                </button>
                <input ref={fileRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
              </div>
            </div>

            {versions.length === 0 ? (
              <div className="border border-dashed border-[var(--rule)] p-10 text-center font-serif italic text-[var(--mute)]">
                Belum ada versi rilis yang terdaftar. Klik '+ Versi Baru' untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((v, i) => (
                  <div key={v.id} className={`border border-[var(--rule)] bg-[var(--bg2)] p-6 relative ${i === 0 ? 'border-left-2 border-l-[var(--acc)]' : ''}`}>
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-serif text-lg font-bold text-[var(--ink)] dark:text-white">PMN v{v.version}</span>
                          {i === 0 && <span className="bg-[#c9a84c22] text-[#c9a84c] border border-[#c9a84c44] font-mono text-[0.58rem] px-2 py-0.5 uppercase">TERKINI</span>}
                          <span className="font-mono text-[0.63rem] text-[var(--mute)]">{fmtDate(v.date)}</span>
                        </div>
                        {v.subtitle && <p className="font-serif italic text-sm text-[var(--mute)]">{v.subtitle}</p>}
                        <p className="font-serif text-sm text-[var(--mute)] leading-relaxed">{v.summary}</p>
                        {v.pdfUrl && <p className="font-mono text-[0.6rem] text-[var(--mute)] break-all">↗ {v.pdfUrl}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setTarget(v); setView('edit') }} className="font-mono text-[0.66rem] border border-[var(--rule)] px-3 py-1 hover:text-[var(--acc)] cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(v.id)} className="font-mono text-[0.66rem] bg-[#2a0e0e] text-[#e57373] px-3 py-1 cursor-pointer">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Logs */}
            <section className="mt-12 border-t border-[var(--rule)] pt-8">
              <span className="block font-mono text-[0.65rem] uppercase tracking-wider text-[var(--mute2)] mb-4">Aktivitas Lokal Terakhir</span>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {auditEntries.length > 0 ? auditEntries.map(entry => (
                  <div key={entry.id} className="border border-[var(--rule)] bg-[var(--bg2)] p-4 text-xs font-serif leading-relaxed">
                    <div className="flex justify-between gap-4 font-mono text-[0.6rem] uppercase tracking-wider text-[var(--mute2)] mb-1">
                      <strong>{entry.action}</strong>
                      <span>{fmtDate(entry.at)}</span>
                    </div>
                    <p className="text-[var(--ink)] dark:text-gray-300">{entry.details}</p>
                    <span className="block font-mono text-[0.55rem] text-[var(--mute)] mt-1">Oleh: {entry.actor}</span>
                  </div>
                )) : (
                  <div className="border border-dashed border-[var(--rule)] p-4 text-center font-mono text-xs text-[var(--mute)]">
                    Belum ada aktivitas yang tercatat.
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {(view === 'add' || view === 'edit') && (
          <VersionForm 
            initial={target} 
            onSave={handleSave} 
            onCancel={() => { setView('list'); setTarget(null) }} 
          />
        )}
      </div>
    </div>
  )
}

// ─── FORM TAMBAH / EDIT RILIS ───
interface VersionFormProps {
  initial: VersionRecord | null
  onSave: (data: VersionRecord) => void
  onCancel: () => void
}

function VersionForm({ initial, onSave, onCancel }: VersionFormProps) {
  const [ver, setVer] = useState(initial?.version || '')
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10))
  const [sub, setSub] = useState(initial?.subtitle || '')
  const [sum, setSum] = useState(initial?.summary || '')
  const [log, setLog] = useState(initial?.changelog || '')
  const [pdf, setPdf] = useState(initial?.pdfUrl || '')
  const [err, setErr] = useState('')

  const submit = () => {
    if (!ver.trim() || !sum.trim()) {
      setErr('Nomor versi dan Ringkasan wajib diisi.')
      return
    }
    
    const record: VersionRecord = {
      id: initial?.id || '',
      version: ver.trim(),
      date,
      subtitle: sub.trim(),
      summary: sum.trim(),
      changelog: log.trim(),
      pdfUrl: pdf.trim(),
      createdAt: initial?.createdAt,
      updatedAt: new Date().toISOString(),
    }
    onSave(record)
  }

  return (
    <div className="space-y-4">
      <span className="block font-mono text-[0.65rem] uppercase tracking-wider text-[var(--mute2)] mb-2">
        {initial ? `Edit PMN v${initial.version}` : 'Publikasikan Versi Baru'}
      </span>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute)] mb-1">Nomor Versi</label>
          <input className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-2.5 outline-none focus:border-[var(--acc)]" placeholder="contoh: 117.6" value={ver} onChange={e => { setVer(e.target.value); setErr('') }} />
        </div>
        <div>
          <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute)] mb-1">Tanggal Rilis</label>
          <input className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-2.5 outline-none focus:border-[var(--acc)] dark:color-scheme-dark" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute)] mb-1">Subjudul (Opsional)</label>
        <input className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-2.5 outline-none focus:border-[var(--acc)]" placeholder="A Framework for Navigating Material Reality" value={sub} onChange={e => setSub(e.target.value)} />
      </div>

      <div>
        <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute)] mb-1">Ringkasan Singkat</label>
        <textarea className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-2.5 outline-none focus:border-[var(--acc)] min-height-[90px] resize-y" placeholder="Deskripsikan inti perubahan di rilis ini..." value={sum} onChange={e => { setSum(e.target.value); setErr('') }} />
      </div>

      <div>
        <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute)] mb-1">Detail Changelog (Opsional)</label>
        <textarea className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-2.5 outline-none focus:border-[var(--acc)] min-height-[130px] resize-y" placeholder="- Penambahan Subbab X&#10;- Koreksi istilah Y..." value={log} onChange={e => setLog(e.target.value)} />
      </div>

      <div>
        <label className="block font-mono text-[0.58rem] uppercase text-[var(--mute)] mb-1">URL PDF (Download Link)</label>
        <input className="w-full bg-[#0d0d0d] border border-[var(--rule)] text-[var(--ink)] font-serif p-2.5 outline-none focus:border-[var(--acc)]" placeholder="https://drive.google.com/file/d/..." value={pdf} onChange={e => setPdf(e.target.value)} />
      </div>

      {err && <p className="text-[#c0392b] font-mono text-[0.68rem]">{err}</p>}

      <div className="flex gap-2 pt-2">
        <button onClick={submit} className="bg-[var(--acc)] text-white dark:text-black font-mono text-[0.72rem] font-bold uppercase px-4 py-2 tracking-widest hover:opacity-75 cursor-pointer">
          {initial ? 'Simpan Perubahan' : 'Publikasikan'}
        </button>
        <button onClick={onCancel} className="border border-[var(--rule)] text-[var(--mute)] font-mono text-[0.72rem] uppercase px-4 py-2 hover:text-[var(--acc)] cursor-pointer">
          Batal
        </button>
      </div>
    </div>
  )
}
