import React, { useState, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import AITerminal from './AITerminal'
import CommandPalette from './CommandPalette'

interface SubSection {
  id: string
  title: string
  html?: string
  text?: string
  is_intro: boolean
}

interface Part {
  part: string
  title: string
  subs: SubSection[]
}

interface ReaderViewProps {
  data: {
    parts: Part[]
    gl: Record<string, string>
    glg: Record<string, any>
    rel: Record<string, any>
    look: Record<string, any>
    quotes: string[]
    ci: Record<string, any>
  }
  readMap: Record<string, boolean>
  curPos: [number, number]
  onMarkRead: (partIdx: number, secIdx: number) => void
  onSavePosition: (partIdx: number, secIdx: number) => void
  onBackHome: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

interface Highlight {
  id: string
  text: string
  color: string
  note: string
}

const LEGACY_XREF_IDS: Record<string, string> = {
  'how-to-read': 'how-to-read-this-document',
  '17.5a': '17.7b',
  '17.5b': '17.7c',
  '17.5c': '17.7d',
  '17.5d': '17.7e'
}

export default function ReaderView({
  data,
  readMap,
  curPos,
  onMarkRead,
  onSavePosition,
  onBackHome,
  theme,
  onToggleTheme
}: ReaderViewProps) {
  const [partIdx, secIdx] = curPos
  const p = data.parts[partIdx]
  const s = p?.subs[secIdx]

  // Layout & Styling States
  const [sbOpen, setSbOpen] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [readerScale, setReaderScale] = useState(1)
  const [contentsScale, setContentsScale] = useState(1)
  const [sidebarScale, setSidebarScale] = useState(1)
  const [readerMeasure, setReaderMeasure] = useState('68ch')

  // Modals & Panels
  const [kbdModalOpen, setKbdModalOpen] = useState(false)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Highlights State
  const [highlights, setHighlights] = useState<Record<string, Highlight[]>>({})
  const [toolbarState, setToolbarState] = useState<{
    visible: boolean
    x: number
    y: number
    note: string
    color: string
    activeHlId: string | null
    selectedText: string
    range: Range | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    note: '',
    color: 'red',
    activeHlId: null,
    selectedText: '',
    range: null
  })

  // Cross-reference Previews
  const [xrefPreview, setXrefPreview] = useState<{
    visible: boolean
    x: number
    y: number
    kicker: string
    title: string
    excerpt: string
  }>({
    visible: false,
    x: 0,
    y: 0,
    kicker: '',
    title: '',
    excerpt: ''
  })

  // Notes/Annotation State for Active Section
  const [noteText, setNoteText] = useState('')
  const [noteSavedStatus, setNoteSavedStatus] = useState('')

  // Reading Session History (Recent Sections)
  const [sessHist, setSessHist] = useState<Array<{ pi: number; si: number; id: string; title: string }>>([])

  // References
  const proseRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const xrefCardRef = useRef<HTMLDivElement>(null)

  let hideXrefTimeout = useRef<number | null>(null)

  const SPECIAL: Record<string, number> = { Preface: 1, Coda: 1, 'Intellectual Debts': 1, Bibliography: 1 }
  const SECTION_LABELS: Record<string, string> = {
    'how-to-read-this-document': 'Guide',
    'preface': 'Preface',
    'coda': 'Coda',
    'intellectual-debts': 'Debts',
    'bibliography': 'Sources'
  }

  const displaySectionId = (id: string) => {
    const sid = String(id || '')
    if (SECTION_LABELS[sid]) return SECTION_LABELS[sid]
    return sid
  }

  const pshort = (partObj: Part) => {
    if (!partObj) return ''
    return SPECIAL[partObj.part] ? partObj.title : 'Part ' + partObj.part
  }

  // Load configuration and highlights on mount
  useEffect(() => {
    // Scales and Measure
    try {
      const scale = parseFloat(localStorage.getItem('pmn-reader-scale') || '1')
      if ([0.92, 1, 1.08].includes(scale)) setReaderScale(scale)

      const cScale = parseFloat(localStorage.getItem('pmn-contents-scale') || '1')
      if ([0.94, 1, 1.1].includes(cScale)) setContentsScale(cScale)

      const sScale = parseFloat(localStorage.getItem('pmn-sidebar-scale') || '1')
      if ([0.92, 1, 1.1].includes(sScale)) setSidebarScale(sScale)

      const measure = localStorage.getItem('pmn-reader-measure') || '68ch'
      if (['62ch', '68ch', '76ch'].includes(measure)) setReaderMeasure(measure)
    } catch (e) {}

    // Highlights
    try {
      const savedHls = localStorage.getItem('pmn-hl-v3')
      if (savedHls) setHighlights(JSON.parse(savedHls))
    } catch (e) {}
  }, [])

  // Sync scale CSS variables to documentElement
  useEffect(() => {
    document.documentElement.style.setProperty('--reader-scale', String(readerScale))
  }, [readerScale])

  useEffect(() => {
    document.documentElement.style.setProperty('--contents-scale', String(contentsScale))
  }, [contentsScale])

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-scale', String(sidebarScale))
  }, [sidebarScale])

  useEffect(() => {
    document.documentElement.style.setProperty('--reader-measure', readerMeasure)
  }, [readerMeasure])

  // Sync focus mode class on document.body to reuse legacy stylesheet
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode-active')
    } else {
      document.body.classList.remove('focus-mode-active')
    }
    return () => {
      document.body.classList.remove('focus-mode-active')
    }
  }, [focusMode])

  // Load and sync Section notes text
  useEffect(() => {
    if (s) {
      try {
        const key = `pmn-an-${s.id}`
        const savedText = localStorage.getItem(key) || ''
        setNoteText(savedText)
      } catch (e) {
        setNoteText('')
      }
    }
  }, [s])

  // Track session history and section change resets
  useEffect(() => {
    if (s && p) {
      // Add to session history
      setSessHist(prev => {
        const key = `${partIdx}-${secIdx}`
        const filtered = prev.filter(item => `${item.pi}-${item.si}` !== key)
        const newHist = [{ pi: partIdx, si: secIdx, id: s.id, title: s.title }, ...filtered]
        return newHist.slice(0, 12)
      })

      // Mark section as read
      onMarkRead(partIdx, secIdx)
      // Save reading position
      onSavePosition(partIdx, secIdx)
      
      // Auto-hide toolbar on section change
      setToolbarState(prev => ({ ...prev, visible: false }))
    }
  }, [partIdx, secIdx, s, p])

  // Helper to strip HTML tags
  const stripHtml = (str: string) => {
    return (str || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&mdash;/g, '—')
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .trim()
  }

  // Related cited-in / cross-references list
  const XREF_IDS = Object.keys(data.look)
    .concat(Object.keys(LEGACY_XREF_IDS).filter(id => data.look[LEGACY_XREF_IDS[id]]))
    .sort((a, b) => b.length - a.length || a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  const handleXrefClick = (sid: string) => {
    const resolvedId = LEGACY_XREF_IDS[sid] || sid
    const info = data.look[resolvedId]
    if (info) {
      // Find jump origin for breadcrumbs tracking
      const origin = { pi: partIdx, si: secIdx, id: s.id, title: s.title }
      sessionStorage.setItem('pmn-xref-back', JSON.stringify(origin))
      onSavePosition(info.pi, info.si)
    }
  }

  const handleJumpBack = () => {
    try {
      const saved = sessionStorage.getItem('pmn-xref-back')
      if (saved) {
        const origin = JSON.parse(saved)
        onSavePosition(origin.pi, origin.si)
        sessionStorage.removeItem('pmn-xref-back')
      }
    } catch (e) {}
  }

  const hasJumpback = (() => {
    try {
      const saved = sessionStorage.getItem('pmn-xref-back')
      if (!saved) return false
      const origin = JSON.parse(saved)
      // Make sure we are not already at the origin
      return !(origin.pi === partIdx && origin.si === secIdx)
    } catch (e) {
      return false
    }
  })()

  // Get jump origin title/id for breadcrumb display
  const jumpbackMeta = (() => {
    try {
      const saved = sessionStorage.getItem('pmn-xref-back')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  })()

  // Keyboard Shortcuts Key listener
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Skip if inside inputs or textareas
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      const key = e.key.toLowerCase()

      if (key === 'c') {
        e.preventDefault()
        onBackHome()
      } else if (key === 'a') {
        e.preventDefault()
        window.location.href = 'pmn-agent-guide.html'
      } else if (key === 'n') {
        e.preventDefault()
        setNotesModalOpen(prev => !prev)
      } else if (key === 'k') {
        e.preventDefault()
        setKbdModalOpen(prev => !prev)
      } else if (e.key === '/') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      } else if (e.key === 'Escape') {
        setKbdModalOpen(false)
        setNotesModalOpen(false)
        setCommandPaletteOpen(false)
        setToolbarState(prev => ({ ...prev, visible: false }))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        handleNextSection()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        handlePrevSection()
      }
    }

    window.addEventListener('keydown', handleGlobalKeys)
    return () => window.removeEventListener('keydown', handleGlobalKeys)
  }, [partIdx, secIdx, onBackHome])

  // Save notes locally (including support for Ctrl+S inside textarea)
  const saveSectionNotes = () => {
    if (!s) return
    try {
      const key = `pmn-an-${s.id}`
      if (noteText.trim()) {
        localStorage.setItem(key, noteText)
      } else {
        localStorage.removeItem(key)
      }
      setNoteSavedStatus('Tersimpan')
      setTimeout(() => setNoteSavedStatus(''), 1600)
    } catch (e) {}
  }

  // Handle Ctrl+S key combination inside textarea
  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveSectionNotes()
    }
  }

  // Next and Previous Navigation
  const handleNextSection = () => {
    let nextS = secIdx + 1
    let nextP = partIdx
    if (nextS >= p.subs.length) {
      nextP++
      nextS = 0
    }
    if (nextP >= data.parts.length) return // End of manuscript

    // Skip intro section if necessary
    if (data.parts[nextP]?.subs[nextS]?.is_intro) {
      nextS++
      if (nextS >= data.parts[nextP].subs.length) {
        nextP++
        nextS = 0
      }
    }

    if (nextP < data.parts.length) {
      onSavePosition(nextP, nextS)
      proseRef.current?.parentElement?.scrollTo(0, 0)
    }
  }

  const handlePrevSection = () => {
    let prevS = secIdx - 1
    let prevP = partIdx
    if (prevS < 0) {
      prevP--
      if (prevP < 0) return // Start of manuscript
      prevS = data.parts[prevP].subs.length - 1
    }

    // Skip intro section
    if (data.parts[prevP]?.subs[prevS]?.is_intro) {
      prevS--
      if (prevS < 0) {
        prevP--
        if (prevP < 0) return
        prevS = data.parts[prevP].subs.length - 1
      }
    }

    onSavePosition(prevP, prevS)
    proseRef.current?.parentElement?.scrollTo(0, 0)
  }

  // HTML content generator with dynamic highlights embedded
  const getProcessedHtml = () => {
    if (!s) return ''
    let html = s.html || (s.text ? `<p>${s.text}</p>` : '')
    const sHls = highlights[s.id] || []
    if (sHls.length === 0) return html

    // Sort highlights by length descending to prevent substring overlap issues
    const sortedHls = [...sHls].sort((a, b) => b.text.length - a.text.length)

    sortedHls.forEach(hl => {
      const escText = hl.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const cls = 'pmn-hl' + (hl.color && hl.color !== 'red' ? ' hl-' + hl.color : '')
      const titleAttr = hl.note ? `title="📝 ${hl.note.replace(/"/g, '&quot;')}"` : ''
      
      const regex = new RegExp('(?<![\'"=>])(' + escText + ')(?![^<]*>)')
      html = html.replace(regex, `<span class="${cls}" data-hl-id="${hl.id}" ${titleAttr}>$1</span>`)
    })

    return html
  }

  // Mouse Selection handling for text highlighting
  const handleMouseUp = (e: MouseEvent) => {
    if (toolbarRef.current?.contains(e.target as Node)) return

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // Hide toolbar if selection cleared
      setTimeout(() => {
        const nextSel = window.getSelection()
        if (!nextSel || nextSel.isCollapsed) {
          setToolbarState(prev => ({ ...prev, visible: false }))
        }
      }, 100)
      return
    }

    const text = sel.toString().trim()
    if (text.length < 3 || text.length > 600) return

    const range = sel.getRangeAt(0)
    if (!proseRef.current?.contains(range.commonAncestorContainer)) return

    const rect = range.getBoundingClientRect()
    
    // Position toolbar above coordinates
    setToolbarState({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 50,
      note: '',
      color: 'red',
      activeHlId: null,
      selectedText: text,
      range: range.cloneRange()
    })
  }

  // Clicking on an existing highlight to edit
  const handleHlClick = (spanEl: HTMLElement, hlId: string) => {
    if (!s) return
    const sHls = highlights[s.id] || []
    const hl = sHls.find(h => h.id === hlId)
    if (!hl) return

    const rect = spanEl.getBoundingClientRect()
    setToolbarState({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 50,
      note: hl.note,
      color: hl.color,
      activeHlId: hlId,
      selectedText: hl.text,
      range: null
    })
  }

  // Event listener hook on prose node rendering
  useEffect(() => {
    const proseNode = proseRef.current
    if (!proseNode || !s) return

    // 1. MouseUp listener for selecting text
    proseNode.addEventListener('mouseup', handleMouseUp)

    // 2. Attach click events for highlight spans
    const hlSpans = proseNode.querySelectorAll('[data-hl-id]')
    hlSpans.forEach(span => {
      const hlId = span.getAttribute('data-hl-id')
      if (hlId) {
        span.addEventListener('click', (e) => {
          e.stopPropagation()
          handleHlClick(span as HTMLElement, hlId)
        })
      }
    })

    // 3. Post-process cross references and glossary tooltips
    linkXrefs(proseNode)
    injectGlossaryTooltips(proseNode)
    injectCopyAnchors(proseNode)

    return () => {
      proseNode.removeEventListener('mouseup', handleMouseUp)
    }
  }, [s, highlights])

  // Custom regex mapping of cross-references inside prose container
  const linkXrefs = (container: HTMLElement) => {
    const pat = XREF_IDS.map(id => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const re = new RegExp('(?<![\\w.])(' + pat + ')(?![\\w.])', 'g')

    const walk = (node: Node) => {
      if (node.nodeType === 3) {
        const txt = node.nodeValue || ''
        if (!re.test(txt)) return
        re.lastIndex = 0
        const frag = document.createDocumentFragment()
        let last = 0
        let m

        while ((m = re.exec(txt)) !== null) {
          const sid = m[1]
          const resolvedId = LEGACY_XREF_IDS[sid] || sid
          if (!data.look[resolvedId]) continue

          if (last < m.index) {
            frag.appendChild(document.createTextNode(txt.slice(last, m.index)))
          }

          const a = document.createElement('a')
          a.className = 'xref'
          a.textContent = sid
          a.href = `#${resolvedId}`
          a.title = (data.look[resolvedId].title || resolvedId).slice(0, 60)
          a.setAttribute('data-sid', resolvedId)

          a.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            handleXrefClick(resolvedId)
          })

          a.addEventListener('mouseover', () => {
            showXrefPreview(a, resolvedId)
          })

          a.addEventListener('mouseout', () => {
            hideXrefPreview()
          })

          frag.appendChild(a)
          last = m.index + m[0].length
        }

        if (last < txt.length) {
          frag.appendChild(document.createTextNode(txt.slice(last)))
        }

        node.parentNode?.replaceChild(frag, node)
        return
      }

      if (node.nodeType !== 1) return
      const tag = (node as HTMLElement).tagName
      if (['SCRIPT', 'STYLE', 'A', 'MARK'].includes(tag)) return
      if ((node as HTMLElement).classList?.contains('xref')) return

      Array.from(node.childNodes).forEach(walk)
    }

    walk(container)
  }

  // Glossary tooltips walker
  const injectGlossaryTooltips = (container: HTMLElement) => {
    const glData = data.gl
    const terms = Object.keys(glData).sort((a, b) => b.length - a.length)
    if (!terms.length) return

    const escapedTerms = terms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
    const termRegex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi')

    container.querySelectorAll('p').forEach(p => {
      if (p.hasAttribute('data-glossary-processed')) return
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null)
      const nodesToReplace: Node[] = []
      
      while (walker.nextNode()) {
        const node = walker.currentNode
        let parent = node.parentElement
        let skip = false
        while (parent && parent !== p) {
          if (parent.tagName === 'A' || parent.classList.contains('glossary-term') || parent.classList.contains('xref')) {
            skip = true
            break
          }
          parent = parent.parentElement
        }
        if (!skip && node.nodeValue?.match(termRegex)) {
          nodesToReplace.push(node)
        }
      }

      nodesToReplace.forEach(node => {
        const fragment = document.createDocumentFragment()
        const text = node.nodeValue || ''
        let lastIndex = 0
        
        text.replace(termRegex, (match, p1, offset) => {
          if (offset > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)))
          }
          const termKey = terms.find(t => t.toLowerCase() === match.toLowerCase())
          if (termKey && glData[termKey]) {
            const termSpan = document.createElement('span')
            termSpan.className = 'glossary-term'
            termSpan.textContent = match
            
            const tooltipSpan = document.createElement('span')
            tooltipSpan.className = 'glossary-tooltip'
            tooltipSpan.textContent = glData[termKey]
            
            termSpan.appendChild(tooltipSpan)
            fragment.appendChild(termSpan)
          } else {
            fragment.appendChild(document.createTextNode(match))
          }
          lastIndex = offset + match.length
          return match
        })

        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)))
        }
        node.parentNode?.replaceChild(fragment, node)
      })

      p.setAttribute('data-glossary-processed', 'true')
    })
  }

  // Heading copy anchors
  const injectCopyAnchors = (container: HTMLElement) => {
    container.querySelectorAll('h2[id], h3[id], h4[id]').forEach(heading => {
      if (heading.querySelector('.copy-anchor')) return
      const anchor = document.createElement('span')
      anchor.className = 'copy-anchor'
      anchor.innerHTML = '&#128279;'
      anchor.title = 'Copy link to this section'
      anchor.addEventListener('click', (e) => {
        e.preventDefault()
        const url = window.location.href.split('#')[0] + '#' + heading.id
        navigator.clipboard.writeText(url).then(() => {
          anchor.innerHTML = '&#10003;'
          anchor.classList.add('copied')
          setTimeout(() => {
            anchor.innerHTML = '&#128279;'
            anchor.classList.remove('copied')
          }, 2000)
        })
      })
      heading.appendChild(anchor)
    })
  }

  // Show Wiki-style xref preview hover card
  const showXrefPreview = (linkEl: HTMLAnchorElement, resolvedId: string) => {
    if (hideXrefTimeout.current) {
      window.clearTimeout(hideXrefTimeout.current)
      hideXrefTimeout.current = null
    }

    const info = data.look[resolvedId]
    if (!info) return

    const targetPart = data.parts[info.pi]
    const targetSec = targetPart?.subs[info.si]
    if (!targetSec) return

    const plainText = stripHtml(targetSec.html || targetSec.text || '')
    const excerpt = plainText.slice(0, 180) + (plainText.length > 180 ? '...' : '')

    const rect = linkEl.getBoundingClientRect()
    const cardWidth = 320
    const cardHeight = 160

    let left = rect.left + window.scrollX + (rect.width / 2) - (cardWidth / 2)
    let top = rect.top + window.scrollY - cardHeight - 10

    if (left < 10) left = 10
    if (left + cardWidth > window.innerWidth - 10) {
      left = window.innerWidth - cardWidth - 10
    }
    if (rect.top < cardHeight + 40) {
      top = rect.bottom + window.scrollY + 10
    }

    setXrefPreview({
      visible: true,
      x: left,
      y: top,
      kicker: `Part ${targetPart.part} — Section ${resolvedId}`,
      title: targetSec.title,
      excerpt
    })
  }

  const hideXrefPreview = () => {
    hideXrefTimeout.current = window.setTimeout(() => {
      setXrefPreview(prev => ({ ...prev, visible: false }))
    }, 300)
  }

  const handlePreviewMouseOver = () => {
    if (hideXrefTimeout.current) {
      window.clearTimeout(hideXrefTimeout.current)
      hideXrefTimeout.current = null
    }
  }

  // Highlight actions
  const handleSaveHlNote = () => {
    if (!s) return
    const note = toolbarState.note.trim()

    if (toolbarState.activeHlId) {
      // Update existing note
      const updated = (highlights[s.id] || []).map(h => 
        h.id === toolbarState.activeHlId ? { ...h, note } : h
      )
      const newHls = { ...highlights, [s.id]: updated }
      setHighlights(newHls)
      localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))
      setToolbarState(prev => ({ ...prev, visible: false }))
    } else if (toolbarState.range && toolbarState.selectedText) {
      // Save new highlight with default color red
      handleColorClick('red')
    }
  }

  const handleRemoveHl = () => {
    if (!s || !toolbarState.activeHlId) return
    const updated = (highlights[s.id] || []).filter(h => h.id !== toolbarState.activeHlId)
    const newHls = { ...highlights, [s.id]: updated }
    setHighlights(newHls)
    localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))
    setToolbarState(prev => ({ ...prev, visible: false }))
  }

  const handleColorClick = (color: string) => {
    if (!s) return
    const note = toolbarState.note.trim()

    if (toolbarState.activeHlId) {
      // Change color on existing highlight
      const updated = (highlights[s.id] || []).map(h => 
        h.id === toolbarState.activeHlId ? { ...h, color } : h
      )
      const newHls = { ...highlights, [s.id]: updated }
      setHighlights(newHls)
      localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))
      setToolbarState(prev => ({ ...prev, visible: false }))
    } else if (toolbarState.range && toolbarState.selectedText) {
      // Add new highlight
      const hlId = 'hl-' + Date.now() + '-' + Math.random().toString(16).slice(2, 6)
      const newHl: Highlight = {
        id: hlId,
        text: toolbarState.selectedText,
        color,
        note
      }
      const updated = [...(highlights[s.id] || []), newHl]
      const newHls = { ...highlights, [s.id]: updated }
      setHighlights(newHls)
      localStorage.setItem('pmn-hl-v3', JSON.stringify(newHls))

      window.getSelection()?.removeAllRanges()
      setToolbarState(prev => ({ ...prev, visible: false }))
    }
  }

  // Copying link and citation info
  const copySectionLink = () => {
    if (!s) return
    const url = window.location.href.split('#')[0] + '#' + s.id
    navigator.clipboard.writeText(url).then(() => {
      setNoteSavedStatus('Link Disalin')
      setTimeout(() => setNoteSavedStatus(''), 1800)
    })
  }

  const copySectionCitation = () => {
    if (!s || !p) return
    const partLabel = SPECIAL[p.part] ? p.title : `Part ${p.part} — ${p.title}`
    const citation = `V117.6 — Progressive Materialist Naturalism\n${s.id} — ${s.title}\n${partLabel}\n${window.location.href.split('#')[0]}#${s.id}`
    navigator.clipboard.writeText(citation).then(() => {
      setNoteSavedStatus('Kutipan Disalin')
      setTimeout(() => setNoteSavedStatus(''), 1800)
    })
  }

  // Export current section text along with notes
  const handleExportSection = () => {
    if (!s) return
    const plainText = stripHtml(s.html || s.text || '')
    const exportText = `# ${s.id} - ${s.title}\n\n${plainText}\n\n---\nNotes:\n${noteText}`
    navigator.clipboard.writeText(exportText).then(() => {
      setNoteSavedStatus('Konten Diexport')
      setTimeout(() => setNoteSavedStatus(''), 1800)
    })
  }

  const countActiveHls = s ? (highlights[s.id] || []).length : 0

  return (
    <div className="flex h-screen overflow-hidden bg-pmn-bg text-pmn-ink font-pmn-body select-text">
      {/* SIDEBAR PANEL */}
      {!focusMode && sbOpen && (
        <Sidebar 
          parts={data.parts}
          readMap={readMap}
          curPos={curPos}
          onSelectSection={(pIdx, sIdx) => onSavePosition(pIdx, sIdx)}
          onClose={() => setSbOpen(false)}
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <main id="reader-main" className="flex-1 flex flex-col min-w-0 bg-pmn-bg overflow-y-auto relative z-10 scroll-smooth">
        {/* Floating Sidebar Toggle Button */}
        <button 
          id="sb-tog"
          onClick={() => setSbOpen(!sbOpen)}
          className="fixed left-4 bottom-4 w-10 h-10 rounded-full bg-pmn-bg2 border border-pmn-rule text-pmn-ink hover:text-pmn-acc flex items-center justify-center font-bold z-50 shadow-2xl cursor-pointer transition-all"
          title={sbOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
        >
          {sbOpen ? '‹' : '›'}
        </button>

        {/* Top Header Bar */}
        <header className="sticky top-0 bg-pmn-bg border-b border-pmn-rule h-[52px] px-6 flex items-center justify-between z-[100] select-none">
          <div className="flex items-center gap-4">
            <button onClick={onBackHome} className="font-pmn-head font-bold text-[1.05rem] text-pmn-acc tracking-[0.04em] hover:opacity-75 cursor-pointer">
              PMN
            </button>
            <nav className="hidden md:flex items-center gap-2 font-pmn-mono text-[0.68rem] text-pmn-mute">
              <span>&rsaquo;</span>
              <button onClick={onBackHome} className="hover:text-pmn-acc cursor-pointer">Daftar Isi</button>
              <span>&rsaquo;</span>
              <span className="text-pmn-mute truncate max-w-[150px]">{pshort(p)}</span>
              <span>&rsaquo;</span>
              <span className="text-pmn-acc font-bold">{s?.id}</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setFocusMode(!focusMode)} 
              className={`hidden md:block font-pmn-mono text-[0.65rem] border border-pmn-rule px-3 py-1 cursor-pointer transition-all ${focusMode ? 'bg-pmn-acc text-white dark:text-black border-pmn-acc' : 'text-pmn-mute hover:text-pmn-acc'}`}
            >
              {focusMode ? 'EXIT FOCUS' : 'FOCUS'}
            </button>
            <button onClick={onToggleTheme} className="font-pmn-mono text-[0.65rem] border border-pmn-rule2 px-2.5 py-1 text-pmn-mute hover:text-pmn-acc cursor-pointer">
              {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
            </button>
            <button onClick={() => setKbdModalOpen(true)} className="font-pmn-mono text-[0.62rem] text-pmn-mute border border-pmn-rule bg-pmn-bg2 px-2.5 py-1 hover:opacity-80 cursor-pointer">
              SHORTCUTS [K]
            </button>
          </div>
        </header>

        {/* READING CONTAINER */}
        <div id="reader-col" className="flex-1 max-w-(--reader-measure) w-full mx-auto px-6 py-12 md:px-12 flex flex-col gap-8" style={{ '--reader-measure': readerMeasure } as React.CSSProperties}>
          
          {/* Breadcrumb Jumpback alert */}
          {hasJumpback && jumpbackMeta && (
            <div id="reader-jumpbar" className="reader-jumpbar flex items-center justify-between p-3.5 bg-[var(--bg2)] border border-[var(--acc)] font-serif text-xs leading-relaxed">
              <div>
                <span className="block font-mono text-[0.58rem] text-[var(--mute)] uppercase tracking-wider">Navigasi Silang</span>
                <span>Anda melompat kemari dari <strong>{jumpbackMeta.id} &mdash; {jumpbackMeta.title}</strong></span>
              </div>
              <button onClick={handleJumpBack} className="font-mono text-[0.68rem] bg-[var(--acc)] text-white dark:text-black px-3 py-1 uppercase tracking-wider font-bold cursor-pointer hover:opacity-85">
                KEMBALI KE {jumpbackMeta.id}
              </button>
            </div>
          )}

          {/* Section Titles */}
          <div className="space-y-4">
            <span className="block font-pmn-mono text-[0.65rem] text-pmn-mute tracking-[0.25em] uppercase">
              {SPECIAL[p?.part] ? '' : `Part ${p?.part} — ${p?.title}`}
            </span>
            <div className="flex justify-between items-baseline gap-6 flex-wrap">
              <h1 className={`font-pmn-head text-[clamp(1.8rem,4vw,2.4rem)] font-bold text-pmn-ink leading-tight ${SPECIAL[p?.part] ? 'italic' : ''}`}>
                {!SPECIAL[p?.part] && <span className="font-pmn-head font-light text-pmn-acc mr-4 select-none opacity-80">{s?.id}</span>}
                {s?.title}
              </h1>
              <button onClick={copySectionLink} className="share-btn text-pmn-mute hover:text-pmn-acc cursor-pointer transition-colors p-1" title="Salin link bab">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="13" cy="3" r="1.8"/>
                  <circle cx="3" cy="8" r="1.8"/>
                  <circle cx="13" cy="13" r="1.8"/>
                  <line x1="4.7" y1="7" x2="11.3" y2="4"/>
                  <line x1="4.7" y1="9" x2="11.3" y2="12"/>
                </svg>
              </button>
            </div>
            <div className="h-px bg-pmn-rule/50" />
          </div>

          {/* Prose body content */}
          <div 
            ref={proseRef} 
            id="prose" 
            className={`pmn-prose font-pmn-body text-[1.12rem] leading-[1.85] text-pmn-ink space-y-8 prose-p:mb-8 ${SPECIAL[p?.part] ? 'back-matter' : ''}`}
            style={{ fontSize: `${readerScale}rem` }}
            dangerouslySetInnerHTML={{ __html: getProcessedHtml() }}
          />

          {/* Next & Previous Section Bottom Navigation */}
          <nav className="flex items-center justify-between border-t border-pmn-rule pt-8 mt-12 font-pmn-mono text-xs text-pmn-mute select-none">
            <button 
              onClick={handlePrevSection}
              disabled={partIdx === 0 && secIdx === 0}
              className="py-2 px-4 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer disabled:opacity-30 disabled:hover:text-pmn-mute transition-all shadow-sm"
            >
              &larr; SEBELUMNYA
            </button>
            <span className="text-[0.65rem] tracking-[0.2em] text-pmn-mute/60">
              {secIdx + 1} / {p?.subs.length}
            </span>
            <button 
              onClick={handleNextSection}
              disabled={partIdx === data.parts.length - 1 && secIdx === p?.subs.length - 1}
              className="py-2 px-4 border border-pmn-rule bg-pmn-bg2 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer disabled:opacity-30 disabled:hover:text-pmn-mute transition-all shadow-sm"
            >
              SELANJUTNYA &rarr;
            </button>
          </nav>

          {/* Section Tools & Handoff Grid */}
          <div className="border-t border-pmn-rule pt-12 mt-12 space-y-12">
            <div className="flex justify-between items-center flex-wrap gap-4 select-none">
              <span className="font-pmn-mono text-[0.62rem] text-pmn-mute uppercase tracking-widest font-bold">Infrastruktur Bacaan</span>
              <div className="flex gap-2.5 flex-wrap">
                <button onClick={copySectionLink} className="font-pmn-mono text-[0.66rem] border border-pmn-rule px-3 py-1.5 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all bg-pmn-bg2">Salin Link</button>
                <button onClick={copySectionCitation} className="font-pmn-mono text-[0.66rem] border border-pmn-rule px-3 py-1.5 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all bg-pmn-bg2">Salin Kutipan</button>
                <button onClick={onBackHome} className="font-pmn-mono text-[0.66rem] border border-pmn-rule px-3 py-1.5 hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all bg-pmn-bg2">Daftar Isi</button>
                <button 
                  onClick={() => setNotesModalOpen(true)} 
                  className="font-pmn-mono text-[0.66rem] border border-pmn-acc/40 px-3 py-1.5 text-pmn-acc hover:bg-pmn-acc/5 cursor-pointer transition-all bg-pmn-bg2"
                >
                  {countActiveHls ? `${countActiveHls} Sorotan` : 'Daftar Sorotan'}
                </button>
              </div>
            </div>

            {/* Related section links */}
            {(data.rel[s?.id]?.length > 0 || data.ci[s?.id]?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-pmn-bg2 border border-pmn-rule p-8 shadow-inner select-none">
                {data.rel[s?.id]?.length > 0 && (
                  <div className="space-y-4">
                    <span className="block font-pmn-mono text-[0.6rem] text-pmn-acc uppercase tracking-widest font-bold">Lihat Juga</span>
                    <div className="flex flex-col gap-3">
                      {data.rel[s.id].map((relId: string) => {
                        const info = data.look[relId]
                        if (!info) return null
                        return (
                          <button
                            key={relId}
                            onClick={() => handleXrefClick(relId)}
                            className="text-left font-pmn-body text-[0.85rem] text-pmn-ink hover:text-pmn-acc transition-colors flex items-baseline gap-2 cursor-pointer group"
                          >
                            <span className="font-pmn-mono text-[0.68rem] text-pmn-mute group-hover:text-pmn-acc transition-colors">{relId}</span>
                            <span className="group-hover:underline underline-offset-4 decoration-pmn-acc/30">{data.parts[info.pi]?.subs[info.si]?.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {data.ci[s?.id]?.length > 0 && (
                  <div className="space-y-4">
                    <span className="block font-pmn-mono text-[0.6rem] text-pmn-acc uppercase tracking-widest font-bold">Dirujuk Di Bab</span>
                    <div className="flex flex-col gap-3">
                      {data.ci[s.id].map((citId: string) => {
                        const info = data.look[citId]
                        if (!info) return null
                        return (
                          <button
                            key={citId}
                            onClick={() => handleXrefClick(citId)}
                            className="text-left font-pmn-body text-[0.85rem] text-pmn-ink hover:text-pmn-acc transition-colors flex items-baseline gap-2 cursor-pointer group"
                          >
                            <span className="font-pmn-mono text-[0.68rem] text-pmn-mute group-hover:text-pmn-acc transition-colors">{citId}</span>
                            <span className="group-hover:underline underline-offset-4 decoration-pmn-acc/30">{data.parts[info.pi]?.subs[info.si]?.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Markdown notes area and AI Terminal Handoff */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Margin notes */}
              <div className="bg-pmn-bg2 border border-pmn-rule p-8 flex flex-col gap-5 shadow-sm">
                <div className="flex justify-between items-baseline select-none">
                  <span className="block font-pmn-mono text-[0.6rem] text-pmn-mute uppercase tracking-widest font-bold">Catatan Pinggir</span>
                  <div className="flex items-center gap-4">
                    {noteSavedStatus && (
                      <span className="font-pmn-mono text-[0.58rem] text-pmn-acc uppercase animate-pulse">{noteSavedStatus}</span>
                    )}
                    <button 
                      onClick={saveSectionNotes}
                      className="font-pmn-mono text-[0.66rem] border border-pmn-rule2 px-3 py-1.5 text-pmn-ink hover:text-pmn-acc hover:border-pmn-acc cursor-pointer transition-all bg-pmn-bg"
                    >
                      Simpan [Ctrl+S]
                    </button>
                  </div>
                </div>
                <textarea 
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={handleNotesKeyDown}
                  placeholder="Ketik catatan analisis Anda tentang bab ini di sini. Disimpan otomatis ke browser Anda..."
                  className="w-full h-56 bg-pmn-bg border border-pmn-rule p-4 font-pmn-body text-[0.9rem] leading-relaxed outline-none resize-none focus:border-pmn-acc transition-colors text-pmn-ink placeholder:text-pmn-mute/40"
                />
              </div>

              {/* AI Handoff */}
              <AITerminal parts={data.parts} gl={data.gl} activeSec={s} />
            </div>

            {/* Suggestions & Recent History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-pmn-rule pt-8 select-none text-[0.8rem]">
              <div className="space-y-3">
                <span className="block font-pmn-mono text-[0.65rem] text-pmn-mute uppercase tracking-widest font-bold">Saran Jalur Alternatif</span>
                <div className="flex flex-col gap-2.5 text-pmn-mute/80 font-pmn-body">
                  <button onClick={() => handleXrefClick('how-to-read-this-document')} className="text-left hover:text-pmn-acc cursor-pointer transition-colors">🧭 Panduan Membaca Awal &rarr;</button>
                  <button onClick={() => handleXrefClick('15.15')} className="text-left hover:text-pmn-acc cursor-pointer transition-colors">⚡ Ringkasan Inti Kompresi 15.15 &rarr;</button>
                  <button onClick={() => handleXrefClick('3.0')} className="text-left hover:text-pmn-acc cursor-pointer transition-colors">🧬 Landasan Biologis (Bab 3.0) &rarr;</button>
                </div>
              </div>
              <div className="space-y-3">
                <span className="block font-pmn-mono text-[0.65rem] text-pmn-mute uppercase tracking-widest font-bold">Riwayat Terakhir</span>
                <div className="flex flex-col gap-2.5 text-pmn-mute/80 font-pmn-body">
                  {sessHist.slice(1, 5).map(hist => (
                    <button 
                      key={`${hist.pi}-${hist.si}`}
                      onClick={() => onSavePosition(hist.pi, hist.si)}
                      className="text-left hover:text-pmn-acc cursor-pointer truncate transition-colors"
                    >
                      <span className="font-pmn-mono text-[0.62rem] text-pmn-mute mr-2 font-bold">{hist.id}</span>
                      {hist.title}
                    </button>
                  ))}
                  {sessHist.length < 2 && <span className="italic text-pmn-mute/50">Belum ada riwayat bacaan.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-pmn-rule text-center text-xs font-pmn-mono text-pmn-mute uppercase tracking-[0.25em] mt-auto select-none bg-pmn-bg">
          Progressive Materialist Naturalism &mdash; V117.6
        </footer>
      </main>

      {/* FLOATING TEXT SELECTION HIGHLIGHT TOOLBAR */}
      {toolbarState.visible && (
        <div 
          ref={toolbarRef}
          id="hl-toolbar"
          className="visible flex items-center gap-2 p-2 bg-pmn-bg border border-pmn-rule shadow-2xl z-[8000] rounded-xs"
          style={{ 
            left: `${Math.min(toolbarState.x, window.innerWidth - 290)}px`, 
            top: `${toolbarState.y}px`,
            position: 'absolute'
          }}
        >
          <button className="w-5 h-5 rounded-full bg-pmn-acc hover:scale-110 transition-transform cursor-pointer" onClick={() => handleColorClick('red')} title="Red"></button>
          <button className="w-5 h-5 rounded-full bg-blue-500 hover:scale-110 transition-transform cursor-pointer" onClick={() => handleColorClick('blue')} title="Blue"></button>
          <button className="w-5 h-5 rounded-full bg-green-500 hover:scale-110 transition-transform cursor-pointer" onClick={() => handleColorClick('green')} title="Green"></button>
          <button className="w-5 h-5 rounded-full bg-yellow-500 hover:scale-110 transition-transform cursor-pointer" onClick={() => handleColorClick('yellow')} title="Yellow"></button>
          <input 
            id="hl-toolbar-note-in" 
            placeholder="Catatan..." 
            value={toolbarState.note}
            onChange={e => setToolbarState(prev => ({ ...prev, note: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSaveHlNote()}
            autoComplete="off"
            className="bg-pmn-bg2 border border-pmn-rule text-pmn-ink font-pmn-mono text-[0.68rem] px-2 py-1 outline-none max-w-[120px] ml-1"
          />
          <button className="font-pmn-mono text-[0.62rem] font-bold bg-pmn-acc text-white dark:text-black px-2.5 py-1.5 uppercase cursor-pointer hover:opacity-85" onClick={handleSaveHlNote}>Simpan</button>
          {toolbarState.activeHlId && (
            <span className="cursor-pointer text-xs font-bold text-pmn-mute px-2 hover:text-red-600 transition-colors" onClick={handleRemoveHl} title="Hapus Sorotan">✕</span>
          )}
        </div>
      )}

      {/* WIKIPEDIA CROSS REFERENCE PREVIEW CARD */}
      {xrefPreview.visible && (
        <div 
          ref={xrefCardRef}
          className="visible bg-pmn-bg border border-pmn-rule p-5 shadow-2xl select-none rounded-xs border-l-4 border-l-pmn-acc"
          style={{
            left: `${xrefPreview.x}px`,
            top: `${xrefPreview.y}px`,
            position: 'absolute',
            zIndex: 1000,
            width: '340px',
            pointerEvents: 'auto'
          }}
          onMouseOver={handlePreviewMouseOver}
          onMouseOut={hideXrefPreview}
        >
          <span className="block font-pmn-mono text-[0.55rem] text-pmn-acc uppercase tracking-widest mb-2 font-bold">
            {xrefPreview.kicker}
          </span>
          <h4 className="font-pmn-head text-[1rem] font-bold text-pmn-ink mb-3 leading-snug">
            {xrefPreview.title}
          </h4>
          <p className="font-pmn-body text-[0.8rem] leading-relaxed text-pmn-mute mb-4 line-clamp-4">
            {xrefPreview.excerpt}
          </p>
          <span className="block font-pmn-mono text-[0.58rem] text-pmn-mute pt-3 border-t border-pmn-rule">
            &#128279; Klik untuk lompat ke bab
          </span>
        </div>
      )}

      {/* MODAL: ALL NOTES & HIGHLIGHTS OF ACTIVE SECTION */}
      {notesModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[620px] bg-pmn-bg border border-pmn-rule p-6 flex flex-col gap-6 max-h-[85vh] shadow-2xl">
            <div className="flex justify-between items-baseline border-b border-pmn-rule pb-3">
              <span className="font-pmn-head text-lg font-bold text-pmn-ink">Daftar Sorotan Bab {s?.id}</span>
              <button onClick={() => setNotesModalOpen(false)} className="text-xl font-pmn-mono text-pmn-mute hover:text-pmn-acc cursor-pointer">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-pmn-rule pr-2">
              {s && (highlights[s.id] || []).length > 0 ? (
                (highlights[s.id] || []).map(hl => (
                  <div key={hl.id} className="py-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: hl.color === 'red' ? 'var(--color-pmn-acc)' : hl.color === 'blue' ? '#60a5fa' : hl.color === 'green' ? '#4ade80' : '#facc15' }} />
                      <span className="font-pmn-mono text-[0.62rem] text-pmn-mute uppercase tracking-wider">{hl.color}</span>
                    </div>
                    <p className="font-pmn-body text-[0.88rem] italic leading-relaxed text-pmn-ink2">&ldquo;{hl.text}&rdquo;</p>
                    {hl.note && (
                      <div className="pl-3 border-l-2 border-pmn-rule2 font-pmn-body text-xs text-pmn-mute">
                        📝 {hl.note}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center font-pmn-body italic text-pmn-mute">
                  Belum ada kalimat yang disorot di bab ini. Seleksi teks di atas untuk menyorot.
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-pmn-rule pt-4">
              <button 
                onClick={() => {
                  if (s && (highlights[s.id] || []).length > 0) {
                    const text = (highlights[s.id] || []).map(h => `[${h.color.toUpperCase()}] "${h.text}" ${h.note ? `\n📝 Catatan: ${h.note}` : ''}`).join('\n\n')
                    navigator.clipboard.writeText(text).then(() => {
                      alert('Seluruh sorotan disalin ke clipboard!')
                    })
                  }
                }}
                disabled={!s || !(highlights[s.id] || []).length}
                className="font-pmn-mono text-[0.66rem] bg-pmn-acc text-white dark:text-black font-bold px-4 py-2 uppercase tracking-wider cursor-pointer hover:opacity-85 disabled:opacity-40"
              >
                Salin Semua Sorotan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KEYBOARD SHORTCUTS HELP */}
      {kbdModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-[480px] bg-pmn-bg border border-pmn-rule p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-baseline border-b border-pmn-rule pb-3">
              <span className="font-pmn-head text-lg font-bold text-pmn-ink">Shortcut Keyboard</span>
              <button onClick={() => setKbdModalOpen(false)} className="text-xl font-pmn-mono text-pmn-mute hover:text-pmn-acc cursor-pointer">&times;</button>
            </div>
            
            <div className="space-y-4 font-pmn-mono text-[0.72rem] text-pmn-ink2">
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Kembali ke Beranda</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">C</span>
              </div>
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Buka Panduan Agen AI</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">A</span>
              </div>
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Daftar Sorotan & Catatan</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">N</span>
              </div>
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Pencarian / Command Palette</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">/</span>
              </div>
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Menu Bantuan Shortcuts</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">K</span>
              </div>
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Bab Selanjutnya</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">&rarr; / &darr;</span>
              </div>
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Bab Sebelumnya</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">&larr; / &uarr;</span>
              </div>
              <div className="flex justify-between border-b border-pmn-rule pb-2">
                <span>Simpan Catatan Bab</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">Ctrl + S</span>
              </div>
              <div className="flex justify-between">
                <span>Tutup Jendela Modal</span>
                <span className="bg-pmn-bg2 px-2 py-0.5 border border-pmn-rule2 rounded-xs">Esc</span>
              </div>
            </div>

            <div className="text-center font-pmn-body italic text-xs text-pmn-mute leading-relaxed">
              * Tips: Anda juga dapat menyeleksi kata apa saja di dalam tulisan untuk memunculkan kartu kamus istilah (glossary).
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ORIENTATION TOAST WELCOME BANNER */}
      {(() => {
        try {
          if (localStorage.getItem('pmn-welcome-dismissed') === 'true') return null
        } catch(e) {}
        
        return (
          <div className="fixed bottom-6 right-6 max-w-[340px] bg-pmn-bg2 border border-pmn-acc p-5 shadow-2xl z-[400] flex flex-col gap-3 font-pmn-body">
            <div className="flex justify-between items-baseline select-none">
              <span className="font-pmn-mono text-[0.58rem] text-pmn-acc tracking-widest uppercase">🧭 Petunjuk Orientasi</span>
              <button 
                onClick={() => {
                  try { localStorage.setItem('pmn-welcome-dismissed', 'true') } catch (e) {}
                  // Trigger simple local state updates to re-evaluate
                  onSavePosition(partIdx, secIdx)
                }} 
                className="font-pmn-mono text-xs text-pmn-mute hover:text-pmn-acc cursor-pointer"
              >
                &times;
              </button>
            </div>
            <h4 className="font-pmn-head font-bold text-sm text-pmn-ink leading-snug">Selamat datang di Pembaca Interaktif PMN</h4>
            <p className="text-xs leading-relaxed text-pmn-mute">
              Gunakan pintasan keyboard <span className="font-pmn-mono bg-pmn-bg border border-pmn-rule px-1 py-0.2 rounded-xs">K</span> untuk melihat cara navigasi cepat, dan sorot kalimat penting untuk menambahkan catatan atau referensi Anda.
            </p>
          </div>
        )
      })()}

      {/* COMMAND PALETTE SEARCH BOX */}
      <CommandPalette 
        parts={data.parts}
        onSelectSection={(pIdx, sIdx) => onSavePosition(pIdx, sIdx)}
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

    </div>
  )
}
(false)}
      />

    </div>
  )
}
