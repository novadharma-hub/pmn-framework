/**
 * PMN — pemetaan antara state navigasi dan location.hash.
 *
 * Sebelum ini seluruh view berbagi satu URL: location.hash selalu kosong,
 * sehingga tidak ada deep-link ke bagian mana pun dari naskah 600 halaman,
 * tombol Back browser mati, dan reload memulihkan view terakhir dari
 * localStorage - tak bisa diprediksi maupun dibagikan.
 *
 * Rute memakai ID seksi yang sudah ada di data (`1.1`, `3.4c`, `preface`),
 * BUKAN indeks [part, seksi]. Indeks bergeser setiap kali naskah disunting;
 * ID tidak. Tautan yang dibagikan hari ini harus tetap sahih di v119.
 *
 * Fungsi di berkas ini murni: tidak menyentuh DOM, window, maupun state
 * React, sehingga bisa diperiksa terpisah dari aplikasi.
 */

export type PmnPage = 'home' | 'contents' | 'reader' | 'guide'
export type ContentsSub = 'map' | 'glossary' | 'search'

export interface RouteState {
  page: PmnPage
  contentsSub: ContentsSub
  /** ID seksi untuk halaman reader; null untuk halaman lain. */
  sectionId: string | null
}

/** Bentuk minimum data naskah yang dibutuhkan router. */
export interface PartLike {
  subs?: Array<{ id?: string }>
}

/**
 * Halaman yang TIDAK pernah masuk URL. 'login' dan 'admin' adalah pintu
 * pengelolaan; menaruhnya di URL berarti membagikannya secara tak sengaja
 * lewat tautan yang di-copy.
 */
const HALAMAN_PRIVAT = ['login', 'admin']

export function bolehMasukUrl(page: string): page is PmnPage {
  return !HALAMAN_PRIVAT.includes(page)
}

/** Cari posisi [indeks part, indeks seksi] dari sebuah ID seksi. */
export function findSection(parts: PartLike[] | null | undefined, sectionId: string): [number, number] | null {
  if (!parts || !sectionId) return null
  for (let pi = 0; pi < parts.length; pi++) {
    const subs = parts[pi]?.subs
    if (!subs) continue
    for (let si = 0; si < subs.length; si++) {
      if (subs[si]?.id === sectionId) return [pi, si]
    }
  }
  return null
}

/** Kebalikannya: ID seksi pada posisi tertentu, atau null bila di luar jangkauan. */
export function sectionIdAt(parts: PartLike[] | null | undefined, pi: number, si: number): string | null {
  return parts?.[pi]?.subs?.[si]?.id ?? null
}

/**
 * Susun hash dari state. Home menghasilkan string kosong supaya URL beranda
 * tetap bersih tanpa ekor '#'.
 */
export function routeToHash(state: RouteState): string {
  switch (state.page) {
    case 'home':
      return ''
    case 'guide':
      return '#/guide'
    case 'contents':
      if (state.contentsSub === 'glossary') return '#/glossary'
      if (state.contentsSub === 'search') return '#/search'
      return '#/contents'
    case 'reader':
      return state.sectionId ? '#/s/' + encodeURIComponent(state.sectionId) : '#/reader'
  }
}

/**
 * Urai hash menjadi state. Mengembalikan null bila hash tidak dikenali,
 * supaya pemanggil bisa membedakan "tidak ada rute" dari "rute home" dan
 * jatuh kembali ke localStorage.
 *
 * `parts` hanya dipakai untuk memvalidasi ID seksi. Bila belum termuat,
 * ID tetap dikembalikan apa adanya agar pemanggil dapat menerapkannya
 * setelah data tiba.
 */
export function hashToRoute(hash: string, parts?: PartLike[] | null): RouteState | null {
  const bersih = (hash || '').replace(/^#\/?/, '').replace(/\/+$/, '')

  if (bersih === '') return { page: 'home', contentsSub: 'map', sectionId: null }
  if (bersih === 'guide') return { page: 'guide', contentsSub: 'map', sectionId: null }
  if (bersih === 'contents') return { page: 'contents', contentsSub: 'map', sectionId: null }
  if (bersih === 'glossary') return { page: 'contents', contentsSub: 'glossary', sectionId: null }
  if (bersih === 'search') return { page: 'contents', contentsSub: 'search', sectionId: null }
  if (bersih === 'reader') return { page: 'reader', contentsSub: 'map', sectionId: null }

  if (bersih.startsWith('s/')) {
    let id: string
    try {
      id = decodeURIComponent(bersih.slice(2))
    } catch {
      return null // hash cacat, jangan paksa
    }
    if (!id) return null
    // Bila data sudah ada, tolak ID yang tidak dikenal supaya tautan basi
    // tidak membuka reader pada bagian yang salah tanpa penjelasan.
    if (parts && !findSection(parts, id)) return null
    return { page: 'reader', contentsSub: 'map', sectionId: id }
  }

  return null
}
