import React, { useState, useEffect } from 'react'

export type PolicyTab = 'privacy' | 'terms' | 'disclaimer' | 'ai'

interface PolicyModalProps {
  isOpen: boolean
  initialTab?: PolicyTab
  onClose: () => void
  version?: string
}

export default function PolicyModal({
  isOpen,
  initialTab = 'privacy',
  onClose,
  version = '120',
}: PolicyModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [storageStats, setStorageStats] = useState<{ count: number; sizeKb: string }>({ count: 0, sizeKb: '0' })

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      calcStorageStats()
    }
  }, [isOpen, initialTab])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const calcStorageStats = () => {
    let totalChars = 0
    let count = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('pmn-')) {
        count++
        const val = localStorage.getItem(key) || ''
        totalChars += key.length + val.length
      }
    }
    setStorageStats({
      count,
      sizeKb: (totalChars / 1024).toFixed(2),
    })
  }

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text)
      setCopiedKey(id)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      window.prompt('Copy text:', text)
    }
  }

  const handleExportData = () => {
    const backup: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      frameworkVersion: version,
      data: {},
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('pmn-')) {
        try {
          const val = localStorage.getItem(key)
          backup.data[key] = val ? JSON.parse(val) : val
        } catch {
          backup.data[key] = localStorage.getItem(key)
        }
      }
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pmn_user_data_backup_v${version}_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (window.confirm('Clear all PMN local reading data (notes, progress, highlights, and history) from this browser? This action cannot be undone.')) {
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('pmn-')) {
          toRemove.push(key)
        }
      }
      toRemove.forEach(k => localStorage.removeItem(k))
      calcStorageStats()
      alert('Local storage cleared. Reloading page to apply clean state...')
      window.location.reload()
    }
  }

  if (!isOpen) return null

  const apaCitation = `Dharma, N. (2026). Progressive Materialist Naturalism: A Structural Analytic Framework for Non-Ideal Realities (Version ${version}). PMN Collective. https://novadharma-hub.github.io/pmn-framework/`
  const bibtexCitation = `@misc{dharma2026pmn,
  author = {Dharma, Nova},
  title = {Progressive Materialist Naturalism: A Structural Analytic Framework for Non-Ideal Realities},
  year = {2026},
  edition = {v${version}},
  publisher = {PMN Collective},
  url = {https://novadharma-hub.github.io/pmn-framework/}
}`

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9990,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(3px)',
          animation: 'pmn-fade-in .15s ease',
        }}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Platform Policies & Web Standards"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9991,
          width: 'min(780px, 94vw)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          border: '1px solid var(--rule)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'pmn-slide-up .18s ease',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '.9rem 1.4rem',
            borderBottom: '1px solid var(--rule)',
            background: 'var(--bg2)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '.62rem',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                color: 'var(--acc-text)',
                fontWeight: 700,
                display: 'block',
              }}
            >
              Platform Governance & Web Standards
            </span>
            <h2
              style={{
                fontFamily: 'var(--f-head)',
                fontSize: '1.15rem',
                color: 'var(--ink)',
                margin: '.2rem 0 0',
                fontWeight: 700,
              }}
            >
              PMN Transparency & Policy Center
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--rule)',
              color: 'var(--mute)',
              cursor: 'pointer',
              fontFamily: 'var(--f-mono)',
              fontSize: '.72rem',
              padding: '.3rem .6rem',
            }}
            title="Close [Esc]"
          >
            [ESC] ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--rule)',
            background: 'var(--bg)',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '.75rem .9rem',
              fontFamily: 'var(--f-mono)',
              fontSize: '.7rem',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: activeTab === 'privacy' ? 'var(--bg2)' : 'transparent',
              color: activeTab === 'privacy' ? 'var(--acc-text)' : 'var(--mute)',
              border: 'none',
              borderBottom: activeTab === 'privacy' ? '2px solid var(--acc)' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            🛡️ Privacy & Data
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '.75rem .9rem',
              fontFamily: 'var(--f-mono)',
              fontSize: '.7rem',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: activeTab === 'terms' ? 'var(--bg2)' : 'transparent',
              color: activeTab === 'terms' ? 'var(--acc-text)' : 'var(--mute)',
              border: 'none',
              borderBottom: activeTab === 'terms' ? '2px solid var(--acc)' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            📜 Terms & Citation
          </button>
          <button
            onClick={() => setActiveTab('disclaimer')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '.75rem .9rem',
              fontFamily: 'var(--f-mono)',
              fontSize: '.7rem',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: activeTab === 'disclaimer' ? 'var(--bg2)' : 'transparent',
              color: activeTab === 'disclaimer' ? 'var(--acc-text)' : 'var(--mute)',
              border: 'none',
              borderBottom: activeTab === 'disclaimer' ? '2px solid var(--acc)' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            ⚖️ Epistemic Limits
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '.75rem .9rem',
              fontFamily: 'var(--f-mono)',
              fontSize: '.7rem',
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              background: activeTab === 'ai' ? 'var(--bg2)' : 'transparent',
              color: activeTab === 'ai' ? 'var(--acc-text)' : 'var(--mute)',
              border: 'none',
              borderBottom: activeTab === 'ai' ? '2px solid var(--acc)' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            🤖 AI Ethics Policy
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.4rem 1.6rem',
            overflowY: 'auto',
            fontFamily: 'var(--f-body)',
            fontSize: '.88rem',
            lineHeight: 1.65,
            color: 'var(--ink)',
          }}
        >
          {/* TAB 1: PRIVACY & LOCAL DATA */}
          {activeTab === 'privacy' && (
            <div>
              <div
                style={{
                  padding: '.8rem 1rem',
                  background: 'var(--bg2)',
                  border: '1px solid var(--rule)',
                  marginBottom: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.8rem',
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>🛡️</div>
                <div>
                  <strong style={{ color: 'var(--acc-text)', display: 'block', fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Zero-Cookies & Zero-Tracking Architecture
                  </strong>
                  <span style={{ fontSize: '.82rem', color: 'var(--ink2)' }}>
                    Platform ini tidak menggunakan HTTP cookies, tidak menyetel pelacak pihak ketiga, dan tidak mengirim data pembaca ke server mana pun.
                  </span>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1rem 0 .4rem' }}>
                1. Mengapa Tidak Ada Popup Persetujuan Cookies?
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Sesuai <strong>ePrivacy Directive (Pasal 5(3))</strong>, <strong>GDPR</strong>, serta <strong>UU Perlindungan Data Pribadi (UU PDP No. 27/2022)</strong>, 
                banner persetujuan cookies <em>hanya wajib</em> jika situs menempatkan pelacak non-esensial (seperti Google Analytics, Meta Pixel, atau cookies periklanan). 
                Karena PMN <strong>100% bebas dari cookies dan pelacak analitik</strong>, menampilkan banner persetujuan justru merupakan kepatuhan semu (<em>compliance theater</em>).
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Transparansi Penyimpanan Lokal (Local Storage)
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.6rem' }}>
                Seluruh fitur personalisasi pembaca beroperasi secara lokal di peramban Anda (<em>client-side strictly necessary storage</em>). 
                Kunci yang digunakan meliputi:
              </p>

              <div style={{ overflowX: 'auto', marginBottom: '1.2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', fontFamily: 'var(--f-mono)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--rule)', textAlign: 'left' }}>
                      <th style={{ padding: '.5rem .6rem' }}>Kunci Penyimpanan</th>
                      <th style={{ padding: '.5rem .6rem' }}>Tujuan / Fungsi</th>
                      <th style={{ padding: '.5rem .6rem' }}>Cakupan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-theme</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Preferensi mode visual pembaca (Dark / Light)</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Peramban lokal</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-read, pmn-pos</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Daftar seksi yang telah dibaca dan posisi baca terakhir</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Peramban lokal</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-desk-notes, pmn-an-*</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Catatan analitis dan catatan margin per seksi Anda</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Peramban lokal</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-hl-v3</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Highlight dan stabilo teks pada bagian naskah</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Peramban lokal</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-reader-scale</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Pengaturan ukuran tipografi pembacaan</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Peramban lokal</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Kedaulatan Data Pembaca (User Sovereignty)
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Saat ini tersimpan <strong>{storageStats.count} rekaman data lokal</strong> (~{storageStats.sizeKb} KB) pada peramban Anda. 
                Anda memegang kendali penuh atas data ini:
              </p>

              <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', marginTop: '.8rem' }}>
                <button
                  onClick={handleExportData}
                  style={{
                    padding: '.55rem 1rem',
                    background: 'var(--bg2)',
                    border: '1px solid var(--rule)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--f-mono)',
                    fontSize: '.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                  }}
                >
                  📥 Export / Backup Data (JSON)
                </button>
                <button
                  onClick={handleClearData}
                  style={{
                    padding: '.55rem 1rem',
                    background: 'transparent',
                    border: '1px solid #e05252',
                    color: '#e05252',
                    fontFamily: 'var(--f-mono)',
                    fontSize: '.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                  }}
                >
                  🗑️ Clear All Local Storage
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS & CITATION */}
          {activeTab === 'terms' && (
            <div>
              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '.2rem 0 .4rem' }}>
                1. Lisensi & Akses Terbuka (Open Access)
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Naskah <em>Progressive Materialist Naturalism (PMN)</em> disediakan secara bebas untuk keperluan membaca, telaah kritis, 
                riset akademis, dan pendidikan non-komersial. Seluruh pembaca diizinkan menyitir, merujuk, dan menganalisis konsep-konsep 
                dalam naskah dengan tetap mencantumkan atribusi kepengarangan yang sah kepada <strong>Nova Dharma</strong>.
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Integritas Kanon & Pencegahan Distorsi
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Demi melindungi integritas kerangka kerja teoritis:
              </p>
              <ul style={{ color: 'var(--ink2)', paddingLeft: '1.2rem', marginBottom: '1.2rem' }}>
                <li style={{ marginBottom: '.3rem' }}>
                  Dilarang memodifikasi naskah, mengubah definisi formula, atau menyunting teks lalu mengedarkannya dengan mengklaim bahwa itu adalah <em>"dokumen resmi PMN"</em> atau <em>"posisi Nova Dharma"</em>.
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  Turunan tafsir atau perdebatan kritis wajib mencantumkan status yang jelas sebagai interpretasi independen dan tidak menyamarkannya sebagai kanon naskah asli.
                </li>
              </ul>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Standar Sitasi Akademis Baku
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.6rem' }}>
                Gunakan format sitasi resmi di bawah ini untuk makalah, tesis, artikel ilmiah, atau rujukan publikasi:
              </p>

              {/* APA 7th Block */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--rule)', padding: '.8rem 1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--acc-text)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    APA 7th Edition
                  </span>
                  <button
                    onClick={() => handleCopy(apaCitation, 'apa')}
                    style={{
                      background: 'none',
                      border: '1px solid var(--rule)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--f-mono)',
                      fontSize: '.65rem',
                      padding: '.15rem .45rem',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedKey === 'apa' ? '✓ Copied' : 'Copy APA'}
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.78rem', color: 'var(--ink)' }}>
                  {apaCitation}
                </div>
              </div>

              {/* BibTeX Block */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--rule)', padding: '.8rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--acc-text)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    BibTeX
                  </span>
                  <button
                    onClick={() => handleCopy(bibtexCitation, 'bibtex')}
                    style={{
                      background: 'none',
                      border: '1px solid var(--rule)',
                      color: 'var(--ink)',
                      fontFamily: 'var(--f-mono)',
                      fontSize: '.65rem',
                      padding: '.15rem .45rem',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedKey === 'bibtex' ? '✓ Copied' : 'Copy BibTeX'}
                  </button>
                </div>
                <pre style={{ fontFamily: 'var(--f-mono)', fontSize: '.72rem', color: 'var(--ink)', margin: 0, overflowX: 'auto' }}>
                  {bibtexCitation}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: EPISTEMIC DISCLAIMERS */}
          {activeTab === 'disclaimer' && (
            <div>
              <div
                style={{
                  padding: '.8rem 1rem',
                  background: 'var(--bg2)',
                  border: '1px solid var(--rule)',
                  marginBottom: '1.2rem',
                }}
              >
                <strong style={{ color: 'var(--acc-text)', display: 'block', fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' }}>
                  Konstitusi Epistemik PMN (§15.0 & §15.13)
                </strong>
                <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--ink2)', fontStyle: 'italic' }}>
                  "Before the formulas: what they cannot do. These limits are part of the theory, not caveats appended to protect it."
                </p>
              </div>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1rem 0 .4rem' }}>
                1. Status Instrumen Formula (Bukan Kalkulator Prediksi Deterministik)
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Formula-formula dalam Bagian XV (seperti $T = S \times D \times P \times G$ dan $Tr = T / (C \times L) - CP$) adalah 
                <strong> instrumen heuristik kualitatif</strong> untuk mengidentifikasi variabel-variabel kritis, arah pengaruhnya, 
                dan kedekatan sistem dengan ambang batas (<em>threshold proximity</em>). 
                Variabel-variabel tersebut <strong>tidak memberikan lisensi aritmetika numerik</strong>. Menggunakan rumus-rumus ini seolah-olah 
                sebagai mesin hitung angka atau peramal waktu pasti peristiwa adalah bentuk <em>formula fetishism</em> yang ditolak secara sadar oleh PMN.
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Bukan Nasihat Profesional
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                PMN adalah instrumen analisis makro-struktural terhadap institusi, sejarah, dan kondisi material. Kerangka ini 
                <strong> tidak dimaksudkan sebagai dan tidak dapat menggantikan nasihat hukum, saran medis, rekomendasi finansial, atau konseling psikologis personal</strong>. 
                Penerapan kerangka terhadap situasi nyata menuntut pertimbangan kontekstual mendalam dan tanggung jawab etis analis sendiri.
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Keterbukaan terhadap Falsifikasi (§14.4b)
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Sesuai prinsip naturalisme materialis, PMN menolak kekebalan dogmatis. Jika bukti empiris baru atau dinamika sejarah 
                membantah postulasi yang diajukan dalam naskah ini, respons metodologis yang benar adalah 
                <strong> revisi kerangka</strong>, bukan pembelaan apriori (<em>special pleading</em>).
              </p>
            </div>
          )}

          {/* TAB 4: AI ETHICS POLICY */}
          {activeTab === 'ai' && (
            <div>
              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '.2rem 0 .4rem' }}>
                1. Akses Ingesti AI & Sumber Kanonik
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Platform ini menyediakan spesifikasi terstruktur bagi agen penalaran kecerdasan buatan (LLMs) untuk meminimalkan 
                halusinasi dan menjaga ketepatan sitasi:
              </p>
              <ul style={{ color: 'var(--ink2)', paddingLeft: '1.2rem', marginBottom: '1.2rem', fontFamily: 'var(--f-mono)', fontSize: '.8rem' }}>
                <li style={{ marginBottom: '.3rem' }}>
                  <a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--acc-text)' }}>/llms.txt</a> — Indeks cepat dan struktur ringkas naskah.
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  <a href="/llms-full.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--acc-text)' }}>/llms-full.txt</a> — Ringkasan analitis lengkap per seksi.
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  <a href="/pmn_corpus_for_ai.md" target="_blank" rel="noreferrer" style={{ color: 'var(--acc-text)' }}>/pmn_corpus_for_ai.md</a> — Korpus utuh Markdown untuk pemrosesan RAG & konteks panjang.
                </li>
              </ul>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Batasan Etika Pemrosesan AI
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Pengembang sistem agen atau model AI yang mengonsumsi korpus PMN wajib memperhatikan batas etika kerangka:
              </p>
              <ul style={{ color: 'var(--ink2)', paddingLeft: '1.2rem', marginBottom: '1.2rem' }}>
                <li style={{ marginBottom: '.3rem' }}>
                  <strong>Larangan Instrumentalisasi Hak Dasar:</strong> Dilarang mengutip terminologi PMN (seperti stabilitas sistem, kapabilitas koersif, atau kelangsungan institusi) untuk membenarkan penindasan, kekerasan struktural, atau pengabaian martabat manusia. 
                  Seluruh analisis struktural PMN berada di bawah subordinasi <em>Minimal Anchor</em> (mengurangi penderitaan yang tak perlu) dan <em>Anti-Foreclosure Criterion</em> (menjaga potensi keterbukaan perkembangan/<em>becoming</em>).
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  <strong>Anti-Cherry-Picking:</strong> Analisis AI wajib menyajikan syarat batas (<em>scope conditions</em>) dan indikator kegagalan yang menyertai setiap klaim PMN, bukan memotong kesimpulan tanpa premis materialnya.
                </li>
              </ul>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Pelaporan Errata & Dialog Kritis
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.4rem' }}>
                Untuk menyampaikan temuan inkonsistensi naskah, kesalahan rujukan, atau saran perbaikan aparatus, silakan buka Issue di repositori publik:
              </p>
              <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.8rem' }}>
                <a
                  href="https://github.com/novadharma-hub/pmn-framework/issues"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--acc-text)', textDecoration: 'underline' }}
                >
                  github.com/novadharma-hub/pmn-framework/issues &rarr;
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div
          style={{
            padding: '.75rem 1.4rem',
            borderTop: '1px solid var(--rule)',
            background: 'var(--bg2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '.72rem',
            fontFamily: 'var(--f-mono)',
            color: 'var(--mute)',
          }}
        >
          <span>Progressive Materialist Naturalism &mdash; Release v{version}</span>
          <button
            onClick={onClose}
            style={{
              background: 'var(--acc)',
              color: '#fff',
              border: 'none',
              padding: '.35rem .8rem',
              fontFamily: 'var(--f-mono)',
              fontSize: '.68rem',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Close Dialog
          </button>
        </div>
      </div>
    </>
  )
}
