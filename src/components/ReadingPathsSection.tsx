import React, { useState } from 'react'
import readingPaths from '../data/reading-paths.json'

interface ReadingPathStep {
  id: string
  label: string
  desc: string
}

interface ReadingPath {
  num: string
  title: string
  persona: string
  badge: string
  /** Perkiraan waktu saja; jumlah seksi dihitung dari steps (dulu ditulis
   *  tangan "4 Modules" di keenam jalur, padahal Path 04 berisi 3). */
  estTime: string
  summary: string
  steps: ReadingPathStep[]
  leadPart?: string
}

interface ReadingPathsSectionProps {
  data: any
  readMap: Record<string, boolean>
  onJump: (pIdx: number, sIdx: number) => void
  onStartReading: () => void
  version?: string
}

// Data jalur ada di src/data/reading-paths.json: dipakai juga oleh
// scripts/build_skill.py (skill pmn-learn), yang menggagalkan build bila ada
// ID seksi yang tak dikenal. Label langkah = judul seksi sebenarnya (sebelum
// titik dua), 2026-09-24.
const READING_PATHS: ReadingPath[] = readingPaths

export default function ReadingPathsSection({ data, readMap, onJump, onStartReading, version = '120' }: ReadingPathsSectionProps) {
  const [selectedPath, setSelectedPath] = useState<ReadingPath | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const jumpToSectionId = (secId: string) => {
    if (!data) {
      onStartReading()
      return
    }
    const cleanId = secId.trim()
    const lookHit = data.look?.[cleanId] || data.look?.[cleanId.replace('.', ',')]
    if (lookHit && typeof lookHit.pi === 'number') {
      onJump(lookHit.pi, lookHit.si)
      return
    }
    for (let pi = 0; pi < data.parts.length; pi++) {
      const p = data.parts[pi]
      const si = p.subs?.findIndex((s: any) => s.id === cleanId || s.id.replace(',', '.') === cleanId)
      if (si !== undefined && si >= 0) {
        onJump(pi, si)
        return
      }
    }
    onStartReading()
  }

  const handleCopySyllabus = (path: ReadingPath, idx: number) => {
    const text = [
      `# PMN Reading Syllabus: ${path.title} (${path.badge})`,
      `Target Persona: ${path.persona} | Estimated Time: ${path.estTime} · ${path.steps.length} sections`,
      `Overview: ${path.summary}`,
      '',
      '## Curated Module Sequence:',
      ...path.steps.map((s, i) => `${i + 1}. **${s.label}**: ${s.desc} [https://novadharma-hub.github.io/pmn-framework/#/s/${encodeURIComponent(s.id)}]`),
      '',
      '---',
      `Progressive Materialist Naturalism (PMN v${version}) — https://novadharma-hub.github.io/pmn-framework/`
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx)
      setTimeout(() => setCopiedIndex(null), 2500)
    }).catch(() => {
      window.prompt('Copy Syllabus Manually:', text)
    })
  }

  const computePathProgress = (path: ReadingPath) => {
    if (!data?.look) return 0
    let completed = 0
    for (const step of path.steps) {
      const lookHit = data.look[step.id] || data.look[step.id.replace('.', ',')]
      if (lookHit && readMap[`${lookHit.pi}-${lookHit.si}`]) {
        completed++
      }
    }
    return Math.round((completed / path.steps.length) * 100)
  }

  return (
    <div className="reading-paths">
      {/* HEADER */}
      <div className="reading-paths-hdr">
        <div>
          <span style={{display:'block', fontFamily:'var(--f-mono)', fontSize:'.75rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--acc-text)', marginBottom:'.35rem'}}>
            ● GUIDED ONBOARDING &amp; PATHWAYS
          </span>
          <h2>Reading Paths</h2>
        </div>
        <p>
          Six short routes into the text, by what you came looking for. In a hurry? Path 03 gives the compressed core (§15.15) in about 25 minutes. Progress fills in as you mark sections read.
        </p>
      </div>

      {/* GRID OF PATH CARDS */}
      <div className="reading-paths-grid">
        {READING_PATHS.map((path, idx) => {
          const progress = computePathProgress(path)
          return (
            <div 
              key={path.num} 
              className="path-card"
            >
              {/* TOP ROW: Kicker + Badge + Est Time */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.8rem', flexWrap:'wrap', gap:'.5rem'}}>
                <span style={{fontFamily:'var(--f-mono)', fontSize:'.75rem', letterSpacing:'.16em', textTransform:'uppercase', color:'var(--acc-text)', fontWeight:700}}>
                  PATH {path.num} · {path.badge}
                </span>
                <span style={{fontFamily:'var(--f-mono)', fontSize:'.75rem', color:'var(--mute)', background:'var(--bg)', border:'1px solid var(--rule)', padding:'.2rem .5rem'}}>
                  {path.estTime} &middot; {path.steps.length} {path.steps.length === 1 ? 'section' : 'sections'}
                </span>
              </div>

              {/* TITLE & PERSONA */}
              <h3 style={{fontFamily:'var(--f-head)', fontSize:'1.22rem', color:'var(--ink)', margin:'0 0 .3rem 0', lineHeight:1.25}}>
                {path.title}
              </h3>
              <div style={{fontFamily:'var(--f-mono)', fontSize:'.75rem', color:'var(--mute)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.8rem'}}>
                Target: {path.persona}
              </div>

              {/* SUMMARY */}
              <p style={{fontFamily:'var(--f-body)', fontSize:'.88rem', lineHeight:1.6, color:'var(--ink2)', margin:'0 0 1.2rem 0', flex:1}}>
                {path.summary}
              </p>

              {/* LANGKAH: dulu chip berisi nomor seksi saja ("2.1", "1.9"), yang
                  tak berarti apa-apa tanpa judul. Kini daftar berjudul, dilipat. */}
              <div className="path-progress" aria-hidden="true">
                <div style={{width:`${progress}%`}} />
              </div>
              <details className="path-steps">
                <summary>
                  {path.steps.length} sections &middot; {progress}% read
                </summary>
                <ol>
                  {path.steps.map(step => (
                    <li key={step.id}>
                      <button type="button" onClick={() => jumpToSectionId(step.id)}>
                        {step.label}
                      </button>
                    </li>
                  ))}
                </ol>
              </details>

              {/* BOTTOM ACTIONS */}
              <div style={{display:'flex', gap:'.6rem', marginTop:'auto', paddingTop:'.8rem', borderTop:'1px solid var(--rule)'}}>
                <button 
                  onClick={() => jumpToSectionId(path.steps[0].id)}
                  style={{
                    flex:2,
                    background:'var(--acc)',
                    color:'#fff',
                    border:'none',
                    fontFamily:'var(--f-mono)',
                    fontSize:'.75rem',
                    letterSpacing:'.12em',
                    textTransform:'uppercase',
                    padding:'.65rem .8rem',
                    cursor:'pointer',
                    fontWeight:700
                  }}
                >
                  Start Step 1 ({path.steps[0].id}) &rarr;
                </button>

                <button
                  onClick={() => handleCopySyllabus(path, idx)}
                  title="Copy this reading syllabus as Markdown"
                  style={{
                    flex:1,
                    background:'transparent',
                    color:'var(--ink2)',
                    border:'1px solid var(--rule)',
                    fontFamily:'var(--f-mono)',
                    fontSize:'.75rem',
                    letterSpacing:'.08em',
                    textTransform:'uppercase',
                    padding:'.65rem .5rem',
                    cursor:'pointer'
                  }}
                >
                  {copiedIndex === idx ? '✓ Copied!' : 'Syllabus 📋'}
                </button>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
