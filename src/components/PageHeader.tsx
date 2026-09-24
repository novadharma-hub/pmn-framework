/**
 * Kerangka bersama halaman sekunder: Daftar Isi, Glosarium, Pencarian,
 * AI Guide, dan Rules & Data.
 *
 * Sampai 2026-09-24 ada tiga pola untuk hal yang sama: Daftar Isi/Glosarium
 * memakai bar "← Home · judul tengah · Size" dengan anak absolut, AI Guide
 * punya bar sendiri (lencana "AI LAB", judul kiri, "← Return Home" kanan),
 * dan Rules & Data tidak punya bar sama sekali - judul dan Back berada di
 * dalam kartunya. Satu komponen, supaya keempatnya tidak bisa menyimpang
 * lagi. Gaya di style.css, blok "Kerangka halaman sekunder".
 */
import React from 'react'

interface PageHeaderProps {
  title: string
  /** Ekor judul, disembunyikan di layar sempit (mis. " — Key Terms"). */
  subtitle?: string
  backLabel?: string
  onBack: () => void
  /** Kontrol kecil di kanan (mis. ukuran teks). */
  tools?: React.ReactNode
}

export function PageHeader({ title, subtitle, backLabel = 'Home', onBack, tools }: PageHeaderProps) {
  return (
    <div className="pg-hdr">
      <div className="pg-hdr-in">
        <button type="button" className="pg-back" onClick={onBack}>
          <span aria-hidden="true">&larr;</span> {backLabel}
        </button>
        <div className="pg-title">
          {title}
          {subtitle && <span className="pg-sub">{subtitle}</span>}
        </div>
        <div className="pg-tools">{tools}</div>
      </div>
    </div>
  )
}

export function PageFooter({ version }: { version?: string }) {
  return (
    <footer className="pg-foot">
      Progressive Materialist Naturalism &mdash; v{version}
    </footer>
  )
}
