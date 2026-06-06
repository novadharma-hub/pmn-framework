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
    <div className="relative z-10 min-h-screen bg-pmn-bg font-pmn-body">
      {/* Top Admin Navigation */}
      <div className="bg-pmn-bg2 border-b border-pmn-rule flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-6">
          <span className="font-pmn-mono text-[0.65rem] tracking-[0.2em] uppercase text-pmn-acc font-bold">PMN Admin Panel</span>
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setTarget(null) }} className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-wider hover:text-pmn-acc cursor-pointer">
              ← Daftar Versi
            </button>
          )}
        </div>
        <button onClick={handleLogout} className="font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-[0.14em] hover:text-pmn-acc cursor-pointer">
          Keluar →
        </button>
      </div>

      <div className="max-w-[720px] mx-auto py-16 px-6">
        {toast && (
          <div className="bg-green-950/20 border border-green-900/50 text-green-400 font-pmn-mono text-[0.68rem] p-4 mb-8 shadow-sm">
            {toast}
          </div>
        )}

        {view === 'list' && (
          <>
            <div className="flex justify-between items-center flex-wrap gap-4 mb-10">
              <span className="font-pmn-mono text-xs uppercase tracking-widest text-pmn-mute font-bold">Semua Versi ({versions.length})</span>
              <div className="flex gap-2.5 flex-wrap">
                <button onClick={handleImportClick} className="font-pmn-mono text-[0.66rem] border border-pmn-rule px-3 py-2 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all bg-pmn-bg2">
                  Import Backup
                </button>
                <button onClick={handleExport} className="font-pmn-mono text-[0.66rem] border border-pmn-rule px-3 py-2 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all bg-pmn-bg2">
                  Export JSON
                </button>
                <button onClick={() => { setTarget(null); setView('add') }} className="font-pmn-mono text-[0.66rem] bg-pmn-acc text-white dark:text-black px-5 py-2 tracking-widest font-bold hover:opacity-85 shadow-lg cursor-pointer transition-all">
                  + Versi Baru
                </button>
                <input ref={fileRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
              </div>
            </div>

            {versions.length === 0 ? (
              <div className="border border-dashed border-pmn-rule p-16 text-center font-pmn-body italic text-pmn-mute bg-pmn-bg2/30 rounded-sm">
                Belum ada versi rilis yang terdaftar. Klik '+ Versi Baru' untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-6">
                {versions.map((v, i) => (
                  <div key={v.id} className={`border border-pmn-rule bg-pmn-bg2 p-8 relative shadow-sm transition-all hover:border-pmn-mute ${i === 0 ? 'border-l-4 border-l-pmn-acc' : ''}`}>
                    <div className="flex justify-between items-start gap-6 flex-wrap">
                      <div className="space-y-3 flex-1 min-w-[280px]">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-pmn-head text-xl font-bold text-pmn-ink">PMN v{v.version}</span>
                          {i === 0 && <span className="bg-pmn-acc/10 text-pmn-acc border border-pmn-acc/30 font-pmn-mono text-[0.58rem] px-2 py-0.5 uppercase tracking-widest font-bold">TERKINI</span>}
                          <span className="font-pmn-mono text-[0.63rem] text-pmn-mute opacity-60 font-bold">{fmtDate(v.date)}</span>
                        </div>
                        {v.subtitle && <p className="font-pmn-body italic text-[0.92rem] text-pmn-mute/80">{v.subtitle}</p>}
                        <p className="font-pmn-body text-[0.88rem] text-pmn-ink opacity-80 leading-relaxed line-clamp-3">{v.summary}</p>
                        {v.pdfUrl && <p className="font-pmn-mono text-[0.6rem] text-pmn-acc opacity-70 break-all border border-pmn-acc/20 inline-block px-2 py-1 bg-pmn-acc/5">↗ {v.pdfUrl}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setTarget(v); setView('edit') }} className="font-pmn-mono text-[0.62rem] border border-pmn-rule px-3 py-1.5 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-colors bg-pmn-bg font-bold uppercase tracking-wider">Edit</button>
                        <button onClick={() => handleDelete(v.id)} className="font-pmn-mono text-[0.62rem] bg-red-950/20 text-red-400 border border-red-900/50 px-3 py-1.5 cursor-pointer hover:bg-red-900/40 transition-colors font-bold uppercase tracking-wider">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Audit Logs */}
            <section className="mt-20 border-t border-pmn-rule pt-10">
              <span className="block font-pmn-mono text-[0.65rem] uppercase tracking-[0.2em] text-pmn-mute font-bold mb-6">Aktivitas Lokal Terakhir</span>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                {auditEntries.length > 0 ? auditEntries.map(entry => (
                  <div key={entry.id} className="border border-pmn-rule bg-pmn-bg2/50 p-5 text-xs font-pmn-body leading-relaxed shadow-xs">
                    <div className="flex justify-between gap-4 font-pmn-mono text-[0.58rem] uppercase tracking-widest text-pmn-mute font-bold mb-2">
                      <strong className="text-pmn-acc">{entry.action}</strong>
                      <span className="opacity-50">{fmtDate(entry.at)}</span>
                    </div>
                    <p className="text-pmn-ink opacity-90">{entry.details}</p>
                    <span className="block font-pmn-mono text-[0.52rem] text-pmn-mute mt-2 uppercase tracking-tighter opacity-40">Oleh: {entry.actor}</span>
                  </div>
                )) : (
                  <div className="border border-dashed border-pmn-rule p-6 text-center font-pmn-mono text-[0.65rem] text-pmn-mute/50 uppercase tracking-widest">
                    Belum ada aktivitas yang tercatat dalam log audit.
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
    <div className="space-y-6 animate-fade-in">
      <span className="block font-pmn-mono text-[0.7rem] uppercase tracking-[0.2em] text-pmn-acc font-bold mb-4">
        {initial ? `⚙️ Edit Manuskrip v${initial.version}` : '📡 Publikasikan Versi Baru'}
      </span>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute font-bold tracking-widest">Nomor Versi</label>
          <input className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-body p-3 outline-none focus:border-pmn-acc shadow-xs transition-colors" placeholder="contoh: 117.6" value={ver} onChange={e => { setVer(e.target.value); setErr('') }} />
        </div>
        <div className="space-y-2">
          <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute font-bold tracking-widest">Tanggal Rilis</label>
          <input className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-body p-3 outline-none focus:border-pmn-acc shadow-xs transition-colors color-scheme-dark" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute font-bold tracking-widest">Subjudul (Opsional)</label>
        <input className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-body p-3 outline-none focus:border-pmn-acc shadow-xs transition-colors" placeholder="A Framework for Navigating Material Reality" value={sub} onChange={e => setSub(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute font-bold tracking-widest">Ringkasan Singkat</label>
        <textarea className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-body p-4 outline-none focus:border-pmn-acc shadow-xs transition-colors min-h-[100px] resize-y" placeholder="Deskripsikan inti perubahan di rilis ini..." value={sum} onChange={e => { setSum(e.target.value); setErr('') }} />
      </div>

      <div className="space-y-2">
        <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute font-bold tracking-widest">Detail Changelog (Opsional)</label>
        <textarea className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-body p-4 outline-none focus:border-pmn-acc shadow-xs transition-colors min-h-[140px] resize-y" placeholder="- Penambahan Subbab X&#10;- Koreksi istilah Y..." value={log} onChange={e => setLog(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="block font-pmn-mono text-[0.6rem] uppercase text-pmn-mute font-bold tracking-widest">URL PDF (Download Link)</label>
        <input className="w-full bg-pmn-bg border border-pmn-rule text-pmn-ink font-pmn-mono text-[0.8rem] p-3 outline-none focus:border-pmn-acc shadow-xs transition-colors" placeholder="https://drive.google.com/file/d/..." value={pdf} onChange={e => setPdf(e.target.value)} />
      </div>

      {err && <p className="text-pmn-acc font-pmn-mono text-[0.68rem] animate-pulse">⚠️ {err}</p>}

      <div className="flex gap-4 pt-6">
        <button onClick={submit} className="bg-pmn-acc text-white dark:text-black font-pmn-mono text-[0.72rem] font-bold uppercase px-8 py-3 tracking-[0.15em] shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer transition-all">
          {initial ? 'Simpan Perubahan' : 'Publikasikan'}
        </button>
        <button onClick={onCancel} className="border border-pmn-rule text-pmn-mute font-pmn-mono text-[0.72rem] font-bold uppercase px-6 py-3 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all">
          Batal
        </button>
      </div>
    </div>
  )
}
