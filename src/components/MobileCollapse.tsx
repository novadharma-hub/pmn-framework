import React, { useState, useEffect } from 'react'

/*
  MobileCollapse — melipat seksi referensi halaman muka HANYA di ponsel.

  KENAPA. Terukur 2026-09-17 pada lebar 390px: `#home-view` setinggi 14.376px,
  yakni 18,5 layar penuh (tablet 768px: 13,5 layar). Penyumbang terbesarnya
  adalah seksi referensi yang di desktop berupa grid multi-kolom dan di ponsel
  menumpuk jadi satu kolom:

      reading-paths   3.729px
      anatomy-section 3.145px
      theses-section  2.774px

  Ketiganya bahan rujukan, bukan bahan sambutan. Di layar lebar ia terbaca
  sebagai peta; di ponsel ia menjadi dinding yang harus digulir sebelum
  pembaca sampai ke apa pun.

  KENAPA BENTUKNYA BEGINI, BUKAN CSS SAJA. Di atas 640px komponen ini
  mengembalikan `children` APA ADANYA — tanpa pembungkus, tanpa kelas, tanpa
  simpul tambahan. Pohon DOM di desktop karena itu identik dengan sebelum
  perubahan ini, dan "memperbaiki ponsel" secara struktural tak bisa
  menurunkan tampilan lebar. Itu jaminan yang lebih kuat daripada media query,
  yang masih bisa bocor lewat selektor yang salah lingkup.
*/

// Sejak 2026-09-24 juga tablet (sampai 959px). Diukur: di 768px beranda
// 10.800px - lebih panjang dari desktop (8.500px), karena grid desktop
// sudah menumpuk jadi satu kolom tapi belum dilipat.
const PONSEL = '(max-width: 959px)'

function usePonsel() {
  const [ponsel, setPonsel] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PONSEL).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(PONSEL)
    const ubah = () => setPonsel(mq.matches)
    mq.addEventListener('change', ubah)
    ubah()
    return () => mq.removeEventListener('change', ubah)
  }, [])
  return ponsel
}

interface Props {
  /** Judul yang dipakai seksi itu sendiri — bukan nama baru. */
  judul: string
  /** Satu baris tentang isinya, supaya tutup tidak berarti buta. */
  ringkas: string
  children: React.ReactNode
}

export default function MobileCollapse({ judul, ringkas, children }: Props) {
  const ponsel = usePonsel()
  const [buka, setBuka] = useState(false)

  // Di atas 960px: tidak ada apa pun dari komponen ini di dalam pohon.
  if (!ponsel) return <>{children}</>

  return (
    <section className="border-t border-pmn-rule/40">
      <button
        onClick={() => setBuka(b => !b)}
        aria-expanded={buka}
        className="w-full text-left px-5 py-5 min-h-[64px] flex items-start gap-3 active:bg-pmn-bg2 transition-colors"
      >
        <span className="flex-1">
          <span className="block font-pmn-head text-[1.05rem] text-pmn-ink leading-snug">
            {judul}
          </span>
          <span className="block font-pmn-mono text-[0.72rem] uppercase tracking-[0.14em] text-pmn-mute mt-1 leading-relaxed">
            {ringkas}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="font-pmn-mono text-[1.1rem] text-pmn-acc-text leading-none mt-1 shrink-0 w-6 text-center"
        >
          {buka ? '−' : '+'}
        </span>
      </button>
      {buka && <div>{children}</div>}
    </section>
  )
}
