import { useState, useEffect } from 'react'

// ─── Storage (localStorage — works on any browser/hosting) ───────────────────
const VERSIONS_KEY = 'pmn-versions'
const CREDS_KEY    = 'pmn-creds'

function loadVersions() {
  try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) || '[]') } catch { return [] }
}
function saveVersions(v) {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(v))
}
function loadCreds() {
  try { return JSON.parse(localStorage.getItem(CREDS_KEY)) } catch { return null }
}
function saveCreds(c) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(c))
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:      '#0d0d0d',
  surface: '#141414',
  card:    '#1a1a1a',
  border:  '#2a2a2a',
  borderL: '#333',
  text:    '#e8e4db',
  mute:    '#706a60',
  accent:  '#c9a84c',
  accentD: '#a07830',
  serif:   "'EB Garamond', Georgia, serif",
  mono:    "'DM Mono', monospace",
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  topBar: { height: 2, background: T.accent, width: '100%' },
  label: {
    fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.22em',
    textTransform: 'uppercase', color: T.mute, display: 'block', marginBottom: '1rem',
  },
  input: {
    width: '100%', background: '#0d0d0d', border: `1px solid ${T.border}`,
    color: T.text, fontFamily: T.serif, fontSize: '1rem',
    padding: '0.65rem 0.9rem', outline: 'none', marginBottom: '0.9rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', background: '#0d0d0d', border: `1px solid ${T.border}`,
    color: T.text, fontFamily: T.serif, fontSize: '1rem',
    padding: '0.65rem 0.9rem', outline: 'none', marginBottom: '0.9rem',
    resize: 'vertical', minHeight: 90, boxSizing: 'border-box',
  },
  btn: (bg = T.accent, fg = '#0d0d0d') => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: bg, color: fg, fontFamily: T.mono, fontSize: '0.66rem',
    letterSpacing: '0.15em', textTransform: 'uppercase', border: 'none',
    padding: '0.7rem 1.3rem', cursor: 'pointer', transition: 'opacity .18s',
    textDecoration: 'none',
  }),
}

// ─── Micro components ─────────────────────────────────────────────────────────
function Rule() {
  return <div style={{ borderTop: `1px solid ${T.border}`, margin: '2.5rem 0' }} />
}

function Tag({ children, color = T.accent }) {
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      fontFamily: T.mono, fontSize: '0.58rem', letterSpacing: '0.14em',
      textTransform: 'uppercase', padding: '0.15rem 0.5rem',
    }}>{children}</span>
  )
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Public: Home ─────────────────────────────────────────────────────────────
function PublicHome({ versions, onView }) {
  const latest = versions[0]
  const parts = [
    'Epistemologi', 'Ontologi', 'Biologi', 'Etika', 'Metafisika',
    'Kekuasaan', 'Politik', 'Budaya', 'Geopolitik', 'Perubahan Sistem',
    'Ekonomi', 'Metodologi', 'Tegangan', 'Ringkasan', 'Formula',
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 2rem' }}>

      {/* Hero */}
      <section style={{ padding: '5rem 0 3.5rem' }}>
        <p style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.25em',
          textTransform: 'uppercase', color: T.accent, marginBottom: '1.8rem' }}>
          Adaptive Naturalism · Nova Dharma
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 500,
          lineHeight: 1.12, color: T.text, marginBottom: '1rem', fontFamily: T.serif }}>
          Progressive Materialist<br />
          <em style={{ fontStyle: 'italic', color: T.accent }}>Naturalism</em>
        </h1>
        <p style={{ fontFamily: T.serif, fontSize: '1rem', color: T.mute,
          maxWidth: 520, lineHeight: 1.85, marginBottom: '2rem' }}>
          Sebuah framework untuk menavigasi realitas material. Dokumen hidup yang
          terus berkembang — setiap versi mencerminkan kondisi pemikiran saat ini,
          bukan sistem yang sudah selesai.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {parts.map((p, i) => (
            <span key={p} style={{ fontFamily: T.mono, fontSize: '0.58rem',
              letterSpacing: '0.1em', textTransform: 'uppercase', color: T.mute,
              border: `1px solid ${T.border}`, padding: '0.2rem 0.55rem' }}>
              {`${i + 1 < 10 ? '0' : ''}${i + 1} ${p}`}
            </span>
          ))}
        </div>
      </section>

      <Rule />

      {/* Latest */}
      <section style={{ marginBottom: '4rem' }}>
        <span style={S.label}>Versi Terbaru</span>
        {latest ? (
          <div style={{ border: `1px solid ${T.borderL}`, background: T.card,
            padding: '2.2rem 2.4rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0,
              width: 3, background: T.accent }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
              flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: T.serif, fontSize: '1.7rem',
                fontWeight: 500, color: T.text }}>
                PMN v{latest.version}
              </span>
              <Tag>Terkini</Tag>
              <span style={{ fontFamily: T.mono, fontSize: '0.65rem',
                color: T.mute }}>{fmtDate(latest.date)}</span>
            </div>
            {latest.subtitle && (
              <p style={{ fontFamily: T.serif, fontSize: '1rem', fontStyle: 'italic',
                color: T.mute, marginBottom: '1rem' }}>{latest.subtitle}</p>
            )}
            <p style={{ color: T.mute, fontSize: '0.97rem', marginBottom: '1.8rem',
              lineHeight: 1.8, maxWidth: 560 }}>{latest.summary}</p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {latest.pdfUrl && (
                <a href={latest.pdfUrl} target="_blank" rel="noopener noreferrer"
                  style={S.btn()}>
                  <DownloadIcon /> Unduh PDF
                </a>
              )}
              <button style={S.btn(T.surface, T.text)} onClick={() => onView(latest)}>
                Lihat Detail →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.border}`, padding: '2rem',
            color: T.mute, fontStyle: 'italic', textAlign: 'center' }}>
            Belum ada versi yang dipublikasikan.
          </div>
        )}
      </section>

      {/* Archive + Changelog */}
      {versions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '3rem', marginBottom: '5rem' }}>
          <section>
            <span style={S.label}>Arsip Versi</span>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['Versi', 'Tanggal', 'PDF'].map(h => (
                    <th key={h} style={{ ...S.label, paddingBottom: '0.6rem',
                      textAlign: 'left', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '0.7rem 0' }}>
                      <button onClick={() => onView(v)}
                        style={{ background: 'none', border: 'none', color: T.accent,
                          cursor: 'pointer', fontFamily: T.mono, fontSize: '0.75rem' }}>
                        PMN v{v.version}
                        {i === 0 && <span style={{ color: T.mute, fontSize: '0.6rem',
                          marginLeft: '0.4rem' }}>●</span>}
                      </button>
                    </td>
                    <td style={{ padding: '0.7rem 0.5rem', fontFamily: T.mono,
                      fontSize: '0.65rem', color: T.mute }}>{fmtDate(v.date)}</td>
                    <td style={{ padding: '0.7rem 0' }}>
                      {v.pdfUrl
                        ? <a href={v.pdfUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontFamily: T.mono, fontSize: '0.63rem', color: T.mute,
                              textDecoration: 'none', textTransform: 'uppercase',
                              borderBottom: `1px solid ${T.border}` }}>PDF ↓</a>
                        : <span style={{ color: T.border }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <span style={S.label}>Changelog</span>
            {versions.map(v => (
              <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr',
                gap: '0.8rem', padding: '0.8rem 0', borderBottom: `1px solid ${T.border}`,
                alignItems: 'baseline' }}>
                <span style={{ fontFamily: T.mono, fontSize: '0.68rem',
                  color: T.accent }}>v{v.version}</span>
                <span style={{ color: T.mute, fontSize: '0.9rem',
                  lineHeight: 1.7 }}>{v.summary}</span>
              </div>
            ))}
          </section>
        </div>
      )}

      <Rule />

      {/* About */}
      <section id="about" style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontFamily: T.serif, fontSize: '1.4rem', fontWeight: 500,
          fontStyle: 'italic', color: T.text, marginBottom: '1.2rem' }}>
          Tentang Framework Ini
        </h2>
        <p style={{ color: T.mute, marginBottom: '1rem', fontSize: '0.97rem',
          lineHeight: 1.85 }}>
          PMN (Progressive Materialist Naturalism) adalah framework analitis yang
          memulai dari kondisi biologis — bukan dari produksi historis maupun
          kesadaran — sebagai fondasi untuk memahami bagaimana masyarakat, institusi,
          dan sistem kekuasaan terbentuk.
        </p>
        <p style={{ color: T.mute, fontSize: '0.97rem', lineHeight: 1.85,
          marginBottom: '1rem' }}>
          Framework (Adaptive Naturalism) adalah metodologinya.
          Doktrin (Progressive Materialist Naturalism) adalah aplikasinya
          pada kondisi saat ini. Keduanya terbuka untuk revisi.
        </p>
        <p style={{ color: T.mute, fontSize: '0.97rem', lineHeight: 1.85,
          fontStyle: 'italic' }}>
          "Dokumen ini adalah dokumen pertama, bukan sistem yang sudah selesai."
        </p>
      </section>
    </div>
  )
}

// ─── Public: Version Detail ───────────────────────────────────────────────────
function VersionDetail({ version, versions, onBack, onView }) {
  const idx  = versions.findIndex(v => v.id === version.id)
  const prev = versions[idx + 1]
  const next = versions[idx - 1]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem' }}>
      <section style={{ padding: '4rem 0 3rem' }}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: T.mute, marginBottom: '2.5rem',
            display: 'block', padding: 0 }}>
          ← Kembali
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem',
          flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <h1 style={{ fontFamily: T.serif, fontSize: '2.2rem', fontWeight: 500,
            color: T.text, margin: 0 }}>PMN v{version.version}</h1>
          {idx === 0 && <Tag>Terkini</Tag>}
        </div>

        <p style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.mute,
          marginBottom: '0.8rem' }}>{fmtDate(version.date)}</p>

        {version.subtitle && (
          <p style={{ fontFamily: T.serif, fontSize: '1.05rem', fontStyle: 'italic',
            color: T.mute, marginBottom: '1.5rem' }}>{version.subtitle}</p>
        )}

        <p style={{ color: T.mute, fontSize: '1rem', lineHeight: 1.85,
          marginBottom: '2rem', maxWidth: 560 }}>{version.summary}</p>

        {version.pdfUrl && (
          <a href={version.pdfUrl} target="_blank" rel="noopener noreferrer"
            style={{ ...S.btn(), marginBottom: '3rem', display: 'inline-flex' }}>
            <DownloadIcon /> Unduh PDF — v{version.version}
          </a>
        )}

        {version.changelog && (
          <>
            <Rule />
            <span style={S.label}>Perubahan di Versi Ini</span>
            <div style={{ color: T.mute, fontSize: '0.97rem', lineHeight: 1.85,
              whiteSpace: 'pre-wrap' }}>{version.changelog}</div>
          </>
        )}

        <Rule />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {prev && (
              <button onClick={() => onView(prev)}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: T.mono, fontSize: '0.63rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: T.mute, padding: 0 }}>
                ← v{prev.version}
              </button>
            )}
          </div>
          <div>
            {next && (
              <button onClick={() => onView(next)}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: T.mono, fontSize: '0.63rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: T.mute, padding: 0 }}>
                v{next.version} →
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Admin: Login ─────────────────────────────────────────────────────────────
function AdminLogin({ onLogin, onBack }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr]   = useState('')
  const isSetup = !loadCreds()

  function submit() {
    if (!user.trim() || !pass.trim()) { setErr('Username dan password wajib diisi.'); return }
    if (isSetup) {
      saveCreds({ user: user.trim(), pass })
      onLogin()
    } else {
      const c = loadCreds()
      if (c?.user === user.trim() && c?.pass === pass) onLogin()
      else setErr('Username atau password salah.')
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '6rem auto', padding: '0 2rem' }}>
      <button onClick={onBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: T.mute, marginBottom: '2.5rem',
          display: 'block', padding: 0 }}>
        ← Kembali
      </button>

      <span style={S.label}>{isSetup ? 'Buat Akun Admin' : 'Login Admin'}</span>

      {isSetup && (
        <p style={{ color: T.mute, fontSize: '0.88rem', marginBottom: '1.5rem',
          lineHeight: 1.7 }}>
          Buat username dan password. Kredensial tersimpan di browser ini saja
          (localStorage) — jaga kerahasiaannya.
        </p>
      )}

      <input style={S.input} placeholder="Username" value={user}
        onChange={e => { setUser(e.target.value); setErr('') }}
        onKeyDown={e => e.key === 'Enter' && submit()} />
      <input style={S.input} type="password" placeholder="Password" value={pass}
        onChange={e => { setPass(e.target.value); setErr('') }}
        onKeyDown={e => e.key === 'Enter' && submit()} />

      {err && <p style={{ color: '#c0392b', fontFamily: T.mono, fontSize: '0.68rem',
        marginBottom: '1rem' }}>{err}</p>}

      <button style={{ ...S.btn(), width: '100%', justifyContent: 'center' }}
        onClick={submit}>
        {isSetup ? 'Buat & Masuk' : 'Masuk'}
      </button>
    </div>
  )
}

// ─── Admin: Dashboard ─────────────────────────────────────────────────────────
function AdminDashboard({ versions, onSave, onLogout }) {
  const [view, setView]     = useState('list')
  const [target, setTarget] = useState(null)
  const [toast, setToast]   = useState('')

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function handleSave(data) {
    let updated
    if (target) updated = versions.map(v => v.id === target.id ? { ...v, ...data } : v)
    else updated = [{ id: Date.now().toString(), ...data }, ...versions]
    updated.sort((a, b) => parseFloat(b.version) - parseFloat(a.version))
    saveVersions(updated)
    onSave(updated)
    setView('list')
    showToast(target ? 'Versi diperbarui.' : 'Versi baru dipublikasikan.')
    setTarget(null)
  }

  function handleDelete(id) {
    if (!confirm('Hapus versi ini?')) return
    const updated = versions.filter(v => v.id !== id)
    saveVersions(updated)
    onSave(updated)
    showToast('Versi dihapus.')
  }

  return (
    <div>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.85rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: T.accent }}>PMN Admin Panel</span>
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setTarget(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: T.mono, fontSize: '0.6rem', color: T.mute,
                letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ← Daftar Versi
            </button>
          )}
        </div>
        <button onClick={onLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: T.mute }}>
          Keluar →
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '3rem auto', padding: '0 2rem' }}>
        {toast && (
          <div style={{ background: '#1a2e1a', color: '#6fcf97', padding: '0.65rem 1rem',
            fontFamily: T.mono, fontSize: '0.68rem', marginBottom: '1.5rem',
            border: '1px solid #2d6a4f' }}>{toast}</div>
        )}

        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '2rem' }}>
              <span style={S.label}>Semua Versi ({versions.length})</span>
              <button style={S.btn()} onClick={() => { setTarget(null); setView('add') }}>
                + Publikasikan Versi Baru
              </button>
            </div>

            {versions.length === 0 && (
              <div style={{ border: `1px solid ${T.border}`, padding: '2.5rem',
                color: T.mute, textAlign: 'center', fontStyle: 'italic' }}>
                Belum ada versi. Klik tombol di atas untuk memulai.
              </div>
            )}

            {versions.map((v, i) => (
              <div key={v.id} style={{ border: `1px solid ${T.border}`, background: T.card,
                padding: '1.6rem 2rem', marginBottom: '1rem',
                borderLeft: i === 0 ? `2px solid ${T.accent}` : `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem',
                      flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: T.serif, fontSize: '1.2rem',
                        color: T.text }}>PMN v{v.version}</span>
                      {i === 0 && <Tag>Terkini</Tag>}
                      <span style={{ fontFamily: T.mono, fontSize: '0.63rem',
                        color: T.mute }}>{fmtDate(v.date)}</span>
                    </div>
                    {v.subtitle && (
                      <p style={{ fontStyle: 'italic', color: T.mute,
                        fontSize: '0.88rem', marginBottom: '0.4rem' }}>{v.subtitle}</p>
                    )}
                    <p style={{ color: T.mute, fontSize: '0.88rem',
                      lineHeight: 1.65 }}>{v.summary}</p>
                    {v.pdfUrl && (
                      <p style={{ fontFamily: T.mono, fontSize: '0.6rem', color: T.mute,
                        marginTop: '0.5rem', wordBreak: 'break-all' }}>
                        ↗ {v.pdfUrl.length > 60 ? v.pdfUrl.slice(0, 60) + '…' : v.pdfUrl}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button style={S.btn(T.surface, T.text)}
                      onClick={() => { setTarget(v); setView('edit') }}>Edit</button>
                    <button style={{ ...S.btn('#2a0e0e', '#e57373') }}
                      onClick={() => handleDelete(v.id)}>Hapus</button>
                  </div>
                </div>
              </div>
            ))}
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

// ─── Admin: Form ──────────────────────────────────────────────────────────────
function VersionForm({ initial, onSave, onCancel }) {
  const [ver,  setVer]  = useState(initial?.version  || '')
  const [date, setDate] = useState(initial?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10))
  const [sub,  setSub]  = useState(initial?.subtitle  || '')
  const [sum,  setSum]  = useState(initial?.summary   || '')
  const [log,  setLog]  = useState(initial?.changelog || '')
  const [pdf,  setPdf]  = useState(initial?.pdfUrl    || '')
  const [err,  setErr]  = useState('')

  function submit() {
    if (!ver.trim()) { setErr('Nomor versi wajib diisi.'); return }
    if (!sum.trim()) { setErr('Ringkasan wajib diisi.'); return }
    onSave({ version: ver.trim(), date, subtitle: sub.trim(),
             summary: sum.trim(), changelog: log.trim(), pdfUrl: pdf.trim() })
  }

  const lbl = { ...S.label, marginBottom: '0.35rem', display: 'block' }

  return (
    <div>
      <span style={S.label}>{initial ? `Edit PMN v${initial.version}` : 'Publikasikan Versi Baru'}</span>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={lbl}>Nomor Versi</label>
          <input style={S.input} placeholder="contoh: 35" value={ver}
            onChange={e => { setVer(e.target.value); setErr('') }} />
        </div>
        <div>
          <label style={lbl}>Tanggal Rilis</label>
          <input style={{ ...S.input, colorScheme: 'dark' }} type="date"
            value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <label style={lbl}>Subjudul (opsional)</label>
      <input style={S.input} placeholder="A Framework for Navigating Material Reality"
        value={sub} onChange={e => setSub(e.target.value)} />

      <label style={lbl}>Ringkasan Singkat</label>
      <textarea style={S.textarea}
        placeholder="Apa yang berubah di versi ini secara keseluruhan?"
        value={sum} onChange={e => { setSum(e.target.value); setErr('') }} />

      <label style={lbl}>Detail Changelog (opsional)</label>
      <textarea style={{ ...S.textarea, minHeight: 130 }}
        placeholder={"Contoh:\n- Tambah Part XV: Formula Architecture\n- Revisi Part VI tentang kekuasaan\n- Koreksi bibliografi"}
        value={log} onChange={e => setLog(e.target.value)} />

      <label style={lbl}>URL PDF</label>
      <input style={S.input}
        placeholder="https://drive.google.com/file/d/... atau link publik lainnya"
        value={pdf} onChange={e => setPdf(e.target.value)} />

      <p style={{ color: T.mute, fontSize: '0.82rem', marginBottom: '1.5rem',
        lineHeight: 1.7 }}>
        <strong style={{ color: T.text }}>Cara upload PDF:</strong> Upload ke Google Drive,
        klik kanan → "Bagikan" → set ke "Siapa saja dengan link", lalu copy link-nya ke sini.
      </p>

      {err && <p style={{ color: '#c0392b', fontFamily: T.mono, fontSize: '0.68rem',
        marginBottom: '1rem' }}>{err}</p>}

      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button style={S.btn()} onClick={submit}>
          {initial ? 'Simpan Perubahan' : 'Publikasikan'}
        </button>
        <button style={S.btn(T.surface, T.text)} onClick={onCancel}>Batal</button>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [versions, setVersions] = useState(() => loadVersions())
  const [page, setPage]         = useState('public')
  const [detail, setDetail]     = useState(null)

  const isPublic = page === 'public' || page === 'login'

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: T.serif, fontSize: 18, lineHeight: 1.75 }}>
      <style>{`
        button:hover { opacity: 0.78; }
        input:focus, textarea:focus { border-color: ${T.accent} !important; outline: none; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        @media (max-width: 600px) {
          table { font-size: 0.85rem; }
        }
      `}</style>

      <div style={S.topBar} />

      {/* Header */}
      {isPublic && (
        <header style={{ maxWidth: 800, margin: '0 auto', padding: '1.8rem 2rem 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { setPage('public'); setDetail(null) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: T.mono, fontSize: '0.68rem', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: T.mute }}>
            PMN Framework
          </button>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="#about"
              style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: T.mute, textDecoration: 'none' }}>
              Tentang
            </a>
            <button onClick={() => setPage('login')}
              style={{ ...S.btn(T.surface, T.mute), border: `1px solid ${T.border}`,
                fontSize: '0.62rem' }}>
              Admin ↗
            </button>
          </div>
        </header>
      )}

      {/* Pages */}
      {page === 'public' && !detail &&
        <PublicHome versions={versions} onView={v => setDetail(v)} />}
      {page === 'public' && detail &&
        <VersionDetail version={detail} versions={versions}
          onBack={() => setDetail(null)} onView={v => setDetail(v)} />}
      {page === 'login' &&
        <AdminLogin onLogin={() => setPage('admin')} onBack={() => setPage('public')} />}
      {page === 'admin' &&
        <AdminDashboard versions={versions} onSave={setVersions}
          onLogout={() => setPage('public')} />}

      {/* Footer */}
      {isPublic && (
        <footer style={{ maxWidth: 800, margin: '0 auto',
          padding: '2rem 2rem 3rem', borderTop: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '0.5rem' }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.58rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: T.mute }}>
            Progressive Materialist Naturalism · Nova Dharma · Semua Versi Diarsipkan
          </span>
          <span style={{ fontFamily: T.mono, fontSize: '0.58rem',
            color: T.mute }}>{new Date().getFullYear()}</span>
        </footer>
      )}
    </div>
  )
}
