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
              Platform Governance &amp; Web Standards
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
              PMN Transparency &amp; Policy Center
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
            [ESC] &times;
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
            🛡️ Privacy &amp; Data
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
            📜 Terms &amp; Citation
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
                    Zero-Cookies &amp; Zero-Tracking Architecture
                  </strong>
                  <span style={{ fontSize: '.82rem', color: 'var(--ink2)' }}>
                    This platform deploys zero HTTP cookies, embeds zero third-party trackers, and transmits zero reader telemetry to any remote server.
                  </span>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1rem 0 .4rem' }}>
                1. Why Is There No Cookie Consent Banner?
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Under the <strong>ePrivacy Directive (Article 5(3))</strong>, the <strong>GDPR</strong>, and international data protection standards, 
                cookie consent banners are <em>only mandatory</em> when a website deploys non-essential trackers (such as third-party analytics, cross-site beacons, or advertising telemetry). 
                Because the PMN Framework is <strong>100% free of cookies and tracking scripts</strong>, displaying a consent popup would constitute empty compliance theater.
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Client-Side Local Storage Transparency
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.6rem' }}>
                All reader personalization features operate strictly client-side within your browser (strictly necessary local storage). The keys used include:
              </p>

              <div style={{ overflowX: 'auto', marginBottom: '1.2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', fontFamily: 'var(--f-mono)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--rule)', textAlign: 'left' }}>
                      <th style={{ padding: '.5rem .6rem' }}>Storage Key</th>
                      <th style={{ padding: '.5rem .6rem' }}>Functional Purpose</th>
                      <th style={{ padding: '.5rem .6rem' }}>Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-theme</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Visual presentation preference (Dark / Light mode)</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Local browser</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-read, pmn-pos</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Checklist of completed sections and last reading position</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Local browser</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-desk-notes, pmn-an-*</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Personal analytical notes and section margin commentary</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Local browser</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-hl-v3</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Text highlights and color markers across manuscript sections</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Local browser</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--acc-text)' }}>pmn-reader-scale</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--ink2)' }}>Custom typographic scale and measure setting</td>
                      <td style={{ padding: '.45rem .6rem', color: 'var(--mute)' }}>Local browser</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Reader Data Sovereignty
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Currently storing <strong>{storageStats.count} local records</strong> (~{storageStats.sizeKb} KB) in your browser. 
                You maintain complete, unmediated control over your data:
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
                1. Open Access &amp; Scholarship License
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                The manuscript of <em>Progressive Materialist Naturalism (PMN)</em> is provided openly for personal study, 
                critical review, scholarly research, and non-commercial education. Readers are encouraged to cite, reference, 
                and critically analyze concepts from the text, provided proper attribution is maintained to <strong>Nova Dharma</strong>.
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Canonical Integrity &amp; Distortion Prevention
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                To preserve the analytical coherence and falsifiability of the framework:
              </p>
              <ul style={{ color: 'var(--ink2)', paddingLeft: '1.2rem', marginBottom: '1.2rem' }}>
                <li style={{ marginBottom: '.3rem' }}>
                  Modifying the manuscript, altering formula definitions, or recirculating derivative versions under the false representation that they represent <em>"official PMN positions"</em> or <em>"the doctrine of Nova Dharma"</em> is strictly prohibited.
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  Derivative commentaries and critical extensions must clearly state their independent status and avoid presenting interpretive speculation as canonical doctrine.
                </li>
              </ul>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Standard Academic Citation Format
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.6rem' }}>
                Use the official citation formats below for research papers, dissertations, peer-reviewed articles, or public commentary:
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
                  Epistemic Constitution of PMN (§15.0 &amp; §15.13)
                </strong>
                <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--ink2)', fontStyle: 'italic' }}>
                  &ldquo;Before the formulas: what they cannot do. These limits are part of the theory, not caveats appended to protect it.&rdquo;
                </p>
              </div>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1rem 0 .4rem' }}>
                1. Heuristic Status of Formulas (Not Deterministic Calculators)
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                The mathematical expressions in Part XV (such as $T = S \times D \times P \times G$ and $Tr = T / (C \times L) - CP$) are 
                <strong> qualitative heuristic instruments</strong> designed to isolate critical institutional variables, their direction of influence, 
                and systemic threshold proximity. These variables <strong>do not confer arithmetic license</strong>. Treating them as predictive 
                numerical calculators or chronological event forecasters is a form of <em>formula fetishism</em> explicitly repudiated by the framework.
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Non-Professional Advisory Boundary
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                PMN is an apparatus for macro-structural analysis of institutions, historical trajectories, and material power distributions. 
                It <strong>is not intended as, and cannot substitute for, legal counsel, medical guidance, financial advisory, or personal psychological clinical treatment</strong>. 
                Applying the framework to real-world arrangements demands rigorous empirical contextualization and individual ethical accountability.
              </p>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Openness to Empirical Falsification (§14.4b)
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Consistent with materialist naturalism, PMN rejects dogmatic immunity. If rigorous empirical findings or historical developments 
                refute the postulates presented in this manuscript, the only valid methodological response is 
                <strong> framework revision</strong>, never apriori special pleading.
              </p>
            </div>
          )}

          {/* TAB 4: AI ETHICS POLICY */}
          {activeTab === 'ai' && (
            <div>
              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '.2rem 0 .4rem' }}>
                1. AI Ingestion &amp; Canonical Endpoints
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                This platform provides dedicated structured endpoints for reasoning agents and language models to minimize hallucinations and preserve citation fidelity:
              </p>
              <ul style={{ color: 'var(--ink2)', paddingLeft: '1.2rem', marginBottom: '1.2rem', fontFamily: 'var(--f-mono)', fontSize: '.8rem' }}>
                <li style={{ marginBottom: '.3rem' }}>
                  <a href="/llms.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--acc-text)' }}>/llms.txt</a> &mdash; Rapid structural index and core axiom inventory.
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  <a href="/llms-full.txt" target="_blank" rel="noreferrer" style={{ color: 'var(--acc-text)' }}>/llms-full.txt</a> &mdash; Comprehensive section-by-section analytical digest.
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  <a href="/pmn_corpus_for_ai.md" target="_blank" rel="noreferrer" style={{ color: 'var(--acc-text)' }}>/pmn_corpus_for_ai.md</a> &mdash; Unabridged Markdown corpus for long-context RAG pipelines.
                </li>
              </ul>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                2. Ethical Processing Constraints
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.8rem' }}>
                Developers, researchers, and agent architectures utilizing the PMN corpus are expected to honor the framework's ethical commitments:
              </p>
              <ul style={{ color: 'var(--ink2)', paddingLeft: '1.2rem', marginBottom: '1.2rem' }}>
                <li style={{ marginBottom: '.3rem' }}>
                  <strong>Prohibition of Human Rights Instrumentalization:</strong> PMN structural terminology (such as systemic stability, coercive capacity, or institutional persistence) must never be mobilized to justify oppression, structural violence, or the suppression of human dignity. All structural analyses remain subordinated to the <em>Minimal Somatic Anchor</em> (minimizing gratuitous biological suffering, §3.4) and the <em>Anti-Foreclosure Criterion</em> (protecting the open-ended capacity for genuine becoming, §4.2).
                </li>
                <li style={{ marginBottom: '.3rem' }}>
                  <strong>Anti-Cherry-Picking Requirement:</strong> AI evaluations must faithfully preserve the explicit scope conditions and defeater criteria (§12.1) that accompany PMN claims, rather than isolating theoretical conclusions from their material preconditions.
                </li>
              </ul>

              <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1.05rem', margin: '1.2rem 0 .4rem' }}>
                3. Errata Reporting &amp; Dialectical Engagement
              </h3>
              <p style={{ color: 'var(--ink2)', marginBottom: '.4rem' }}>
                To submit identified manuscript inconsistencies, cross-reference errors, or proposed apparatus improvements, please open an Issue on the public repository:
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
