
/*
PMN Reader — Main Application Logic

UI_EDITING_GUIDE.md — FILE INI = LOGIKA INTERAKTIF & PERILAKU
Tugas utama:
- Pencarian, AI Terminal, Command Palette, Popover, Tema
- Rendering data dari JSON ke halaman
- Semua event listener dan interaksi pengguna

Ini adalah file yang paling kompleks secara teknis.
Baca UI_EDITING_GUIDE.md sebelum melakukan perubahan besar.
*/

(async function initializeApp() {
  var hasInlined = false;
  try {
    var el = document.getElementById('d-parts');
    if (el && el.textContent.trim().length > 10) {
      hasInlined = true;
    }
  } catch (e) { }

  if (!hasInlined) {
    console.log("Memuat data naskah dari folder data/...");
    const dataFiles = ['parts', 'gl', 'glg', 'rel', 'look', 'ci', 'quotes'];
    const mockData = {};

    // Mengambil data dari folder data/
    await Promise.all(dataFiles.map(async (file) => {
      try {
        const res = await fetch(`data/${file}.json`);
        if (res.ok) mockData[`d-${file}`] = await res.text();
      } catch (e) { console.error("Gagal memuat " + file); }
    }));

    // Memanipulasi fungsi bawaan agar Script asli mengira data ada di HTML
    const originalGetElementById = document.getElementById.bind(document);
    document.getElementById = function (id) {
      if (mockData[id]) return { textContent: mockData[id] };
      return originalGetElementById(id);
    };
    console.log("✅ Data berhasil dimuat secara dinamis.");
  } else {
    console.log("✅ Data inlined terdeteksi. Bypassing fetch lokal.");
  }

  console.log("✅ Aplikasi siap dijalankan...");

  // ================= KODE JAVASCRIPT ASLI DI BAWAH INI =================
  (function () {
    // Load data from JSON script tags - completely safe, no escaping issues
    var PARTS = JSON.parse(document.getElementById('d-parts').textContent);
    var GL = JSON.parse(document.getElementById('d-gl').textContent);
    var GLG = JSON.parse(document.getElementById('d-glg').textContent);
    var REL = JSON.parse(document.getElementById('d-rel').textContent);
    var LOOK = JSON.parse(document.getElementById('d-look').textContent);
    var CITED = JSON.parse(document.getElementById('d-ci').textContent);
    var SPECIAL = { Preface: 1, Coda: 1, 'Intellectual Debts': 1, Bibliography: 1 };
    var SECTION_LABELS = {
      'how-to-read-this-document': 'Guide',
      'preface': 'Preface',
      'coda': 'Coda',
      'intellectual-debts': 'Debts',
      'bibliography': 'Sources'
    };

    var curP = 0, curS = 0, sbOpen = true, readMap = {}, readerScale = 1;
    try { readMap = JSON.parse(localStorage.getItem('pmn-read') || '{}'); } catch (e) { }

    function g(id) { return document.getElementById(id); }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function isR(p, s) { return !!readMap[p + '-' + s]; }
    function markR(p, s) { readMap[p + '-' + s] = true; try { localStorage.setItem('pmn-read', JSON.stringify(readMap)); } catch (e) { } pip(); }
    function savePos(p, s) { try { localStorage.setItem('pmn-pos', p + ',' + s); } catch (e) { } }
    function loadPos() { try { var v = localStorage.getItem('pmn-pos'); if (v) { var a = v.split(','); return [+a[0], +a[1]]; } } catch (e) { } return null; }
    function pshort(p) { return SPECIAL[p.part] ? p.title : 'Part ' + p.part; }
    function plong(p) { return SPECIAL[p.part] ? '' : 'Part ' + p.part; }
    function displaySectionId(id) {
      var sid = String(id || '');
      if (SECTION_LABELS[sid]) return SECTION_LABELS[sid];
      return sid;
    }

    // Theme
    function applyTheme(t) {
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('pmn-theme', t); } catch (e) { }
      var tog = g('theme-tog');
      if (tog) tog.textContent = (t === 'dark' ? '☀ Light' : '☾ Dark');
    }
    function initTheme() { try { applyTheme(localStorage.getItem('pmn-theme') || 'dark'); } catch (e) { applyTheme('dark'); } }
    function toggleTheme() {
      var cur = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    }
    initTheme();

    // ── Layout toggle (mobile/desktop override)
    var isMobileScreen = window.innerWidth <= 680;
    function isManualLayout() { try { return localStorage.getItem('pmn-layout'); } catch (e) { return null; } }
    function applyLayout(mode) {
      var html = document.documentElement;
      if (mode === 'mobile') { html.setAttribute('data-layout', 'mobile'); }
      else if (mode === 'desktop') { html.setAttribute('data-layout', 'desktop'); }
      else { html.removeAttribute('data-layout'); }
      try { if (mode) localStorage.setItem('pmn-layout', mode); else localStorage.removeItem('pmn-layout'); } catch (e) { }
      updateLayoutTog();
      // Re-evaluate sidebar state when switching to desktop
      if (mode === 'desktop' && !sbOpen) { var sb = g('sidebar'); sb.classList.remove('mob-open'); }
    }
    function currentEffectiveLayout() {
      var manual = isManualLayout();
      if (manual) return manual;
      return isMobileScreen ? 'mobile' : 'desktop';
    }
    function updateLayoutTog() {
      var btn = g('layout-tog'); if (!btn) return;
      var eff = currentEffectiveLayout();
      var manual = isManualLayout();
      if (manual === 'mobile') {
        btn.textContent = 'Layout: Mobile \u2192 switch to desktop';
      } else if (manual === 'desktop') {
        btn.textContent = 'Layout: Desktop \u2192 reset to auto';
      } else {
        btn.textContent = 'Layout: Auto (' + (eff === 'mobile' ? 'mobile' : 'desktop') + ') \u2192 override';
      }
    }
    function toggleLayout() {
      var manual = isManualLayout();
      var eff = currentEffectiveLayout();
      if (!manual) {
        // First click: override to opposite of current
        applyLayout(eff === 'mobile' ? 'desktop' : 'mobile');
      } else if (manual === eff) {
        // Currently overriding to match auto — cycle to opposite override
        applyLayout(eff === 'mobile' ? 'desktop' : 'mobile');
      } else {
        // Already overriding to opposite — reset to auto
        applyLayout(null);
      }
    }
    // Init layout on load
    (function () {
      var saved = isManualLayout();
      if (saved) applyLayout(saved);
      else updateLayoutTog();
    })();

    function applyReaderScale(scale) {
      readerScale = scale;
      document.documentElement.style.setProperty('--reader-scale', String(scale));
      var ids = { 0.92: 'font-sm', 1: 'font-md', 1.08: 'font-lg' };
      ['font-sm', 'font-md', 'font-lg'].forEach(function (id) {
        var btn = g(id);
        if (btn) btn.classList.toggle('on', id === ids[scale]);
      });
    }
    function initReaderScale() {
      var saved = 1;
      try {
        var raw = parseFloat(localStorage.getItem('pmn-reader-scale') || '1');
        if (raw === 0.92 || raw === 1 || raw === 1.08) saved = raw;
      } catch (e) { }
      applyReaderScale(saved);
    }
    function setReaderScale(scale) {
      applyReaderScale(scale);
      try { localStorage.setItem('pmn-reader-scale', String(scale)); } catch (e) { }
    }
    function applyContentsScale(scale) {
      document.documentElement.style.setProperty('--contents-scale', String(scale));
      var ids = { 0.94: 'contents-sm', 1: 'contents-md', 1.1: 'contents-lg' };
      ['contents-sm', 'contents-md', 'contents-lg'].forEach(function (id) {
        var btn = g(id);
        if (btn) btn.classList.toggle('on', id === ids[scale]);
      });
    }
    function initContentsScale() {
      var saved = 1;
      try {
        var raw = parseFloat(localStorage.getItem('pmn-contents-scale') || '1');
        if (raw === 0.94 || raw === 1 || raw === 1.1) saved = raw;
      } catch (e) { }
      applyContentsScale(saved);
    }
    function setContentsScale(scale) {
      applyContentsScale(scale);
      try { localStorage.setItem('pmn-contents-scale', String(scale)); } catch (e) { }
    }
    function applySidebarScale(scale) {
      document.documentElement.style.setProperty('--sidebar-scale', String(scale));
      var ids = { 0.92: 'sidebar-sm', 1: 'sidebar-md', 1.1: 'sidebar-lg' };
      ['sidebar-sm', 'sidebar-md', 'sidebar-lg'].forEach(function (id) {
        var btn = g(id);
        if (btn) btn.classList.toggle('on', id === ids[scale]);
      });
    }
    function initSidebarScale() {
      var saved = 1;
      try {
        var raw = parseFloat(localStorage.getItem('pmn-sidebar-scale') || '1');
        if (raw === 0.92 || raw === 1 || raw === 1.1) saved = raw;
      } catch (e) { }
      applySidebarScale(saved);
    }
    function setSidebarScale(scale) {
      applySidebarScale(scale);
      try { localStorage.setItem('pmn-sidebar-scale', String(scale)); } catch (e) { }
    }
    function applyReaderMeasure(measure) {
      document.documentElement.style.setProperty('--reader-measure', measure);
      var ids = { '62ch': 'measure-narrow', '68ch': 'measure-base', '76ch': 'measure-wide' };
      ['measure-narrow', 'measure-base', 'measure-wide'].forEach(function (id) {
        var btn = g(id);
        if (btn) btn.classList.toggle('on', id === ids[measure]);
      });
    }
    function initReaderMeasure() {
      var saved = '68ch';
      try {
        var raw = localStorage.getItem('pmn-reader-measure') || '68ch';
        if (raw === '62ch' || raw === '68ch' || raw === '76ch') saved = raw;
      } catch (e) { }
      applyReaderMeasure(saved);
    }
    function setReaderMeasure(measure) {
      applyReaderMeasure(measure);
      try { localStorage.setItem('pmn-reader-measure', measure); } catch (e) { }
    }

    function updateReaderAgentStatus() {
      var p = PARTS[curP], s = p.subs[curS];
      // Memanggil asisten AI dari jalur komunikasi global secara aman
      var buildCtx = window.buildContextPack || (typeof buildContextPack !== 'undefined' ? buildContextPack : null);
      if (!buildCtx) return; // Lewati jika modul AI belum siap

      var pack = buildCtx('', {
        activeId: s.id,
        relatedIds: (REL[s.id] || []).slice(0, 4),
        fallbackIds: [s.id].concat((REL[s.id] || []).slice(0, 2)),
        maxSections: 3,
        maxGlossary: 3,
        querySeed: [s.id, s.title, p.title].join(' ')
      });
      var retrieved = pack.sections.map(function (item) { return item.id; }).join(', ');
      var terms = pack.glossary.map(function (item) { return item.term; }).join(', ');
      var msg = 'Current packet: ' + s.id + ' - ' + s.title + '\nPart: ' + (SPECIAL[p.part] ? p.title : ('Part ' + p.part + ' - ' + p.title));
      if (retrieved) msg += '\nRetrieved passages: ' + retrieved;
      if (terms) msg += '\nGlossary: ' + terms;

      // PERBAIKAN: Mengganti fungsi setStatus yang hilang dengan manipulasi DOM langsung secara aman
      var statusEl = g('reader-agent-status') || document.getElementById('reader-agent-status');
      if (statusEl) statusEl.textContent = msg;
    }

    function upgradeThesisSection() {
      var lead = document.querySelector('.theses-lead');
      if (lead) {
        var legacy = lead.querySelector('div[style*="margin-top:1.5rem"]');
        if (legacy) {
          legacy.className = 'theses-tier-list';
          legacy.removeAttribute('style');
          var labels = [
            '&#9679; Tier 1 &mdash; Foundational',
            '&#9679; Tier 2 &mdash; Structural',
            '&#9679; Tier 3 &mdash; Empirical'
          ];
          Array.prototype.forEach.call(legacy.children, function (node, idx) {
            node.className = 'theses-tier-chip tier-' + (idx + 1);
            node.removeAttribute('style');
            node.innerHTML = labels[idx] || node.innerHTML;
          });
        }
      }
      var list = g('theses-list');
      if (list) {
        var hdrs = Array.prototype.filter.call(list.children, function (node) {
          return node.classList && !node.classList.contains('thesis-item');
        });
        var meta = [
          ['tier-1 first', 'Tier 1 &mdash; Foundational Axioms', '(adopted as starting points)'],
          ['tier-2', 'Tier 2 &mdash; Structural Commitments', '(revisable only by architectural failure)'],
          ['tier-3', 'Tier 3 &mdash; Empirical Hypotheses', '(explicitly revisable)']
        ];
        hdrs.forEach(function (node, idx) {
          if (!meta[idx]) return;
          node.className = 'thesis-tier-hdr ' + meta[idx][0];
          node.removeAttribute('style');
          node.innerHTML = meta[idx][1] + ' <span class="thesis-tier-note">' + meta[idx][2] + '</span>';
        });
      }
    }
    function injectReadingPaths() {
      if (document.querySelector('.reading-paths')) return;
      var ai = document.querySelector('.home-ai-section');
      if (!ai || !ai.parentNode) return;
      var wrap = document.createElement('section');
      wrap.className = 'reading-paths';
      wrap.innerHTML =
        '<div class="reading-paths-hdr">'
        + '<h2>Reading Paths</h2>'
        + '<p>Not every reader needs to start the same way. These entry paths give faster on-ramps into PMN depending on whether you want foundations, power analysis, formula compression, or applied cases.</p>'
        + '</div>'
        + '<div class="reading-paths-meta">'
        + '<div class="reading-stat"><strong>Entry logic</strong><span>Choose by task, not by obligation.</span></div>'
        + '<div class="reading-stat"><strong>Fastest route</strong><span>15.15 for compression, then backfill.</span></div>'
        + '<div class="reading-stat"><strong>Best for first pass</strong><span>Start with foundations, not slogans.</span></div>'
        + '</div>'
        + '<div class="reading-paths-grid">'
        + '<article class="path-card" data-ghost="01"><span class="path-kicker">Path 01</span><h3>Foundation First</h3><p>Start with epistemology, ontology, and the biological floor before touching doctrine or applied cases.</p><button class="path-btn" type="button" data-open-part="I">Open Part I</button></article>'
        + '<article class="path-card" data-ghost="02"><span class="path-kicker">Path 02</span><h3>Power and Institutions</h3><p>Jump straight into how power, legitimacy, and institutional capture shape the arrangement beneath the narrative.</p><button class="path-btn" type="button" data-open-part="VI">Open Part VI</button></article>'
        + '<article class="path-card" data-ghost="03"><span class="path-kicker">Path 03</span><h3>Compressed Core</h3><p>Use the short-form PMN core when you need the framework fast before going back for the full architecture.</p><button class="path-btn" type="button" data-open-id="15.15">Open 15.15</button></article>'
        + '<article class="path-card" data-ghost="04"><span class="path-kicker">Path 04</span><h3>Cases and the Individual</h3><p>Move from abstract structure into historical cases and the practical demands PMN places on a person who holds it.</p><button class="path-btn" type="button" data-open-part="XVII">Open Part XVII</button></article>'
        + '</div>';
      ai.parentNode.insertBefore(wrap, ai);
    }
    function upgradeHomeAi() {
      var inner = document.querySelector('.home-ai-section .home-ai-inner');
      if (!inner || g('home-ai-copy') || document.getElementById('hai-tabs')) return;
      inner.innerHTML =
        '<div class="home-ai-hdr">Dialectical Synthesis Terminal (AI-Powered)</div>'
        + '<p class="home-ai-desc">Ask a PMN question here, choose your target AI, then let the site retrieve relevant PMN passages and glossary terms from the manuscript before opening ChatGPT or Gemini.</p>'
        + '<div class="home-ai-row">'
        + '<select id="home-ai-mode" class="home-ai-select">'
        + '<option value="local">Target: Local AI (In-Browser Expert)</option>'
        + '<option value="chatgpt">Target: ChatGPT</option>'
        + '<option value="gemini">Target: Gemini</option>'
        + '</select>'
        + '<input type="text" id="home-ai-input" class="home-ai-input" placeholder="e.g. Explain PMN on institutional betrayal, or where should a new reader start?" autocomplete="off">'
        + '<button id="home-ai-btn" class="home-ai-btn" type="button">Ask Agent</button>'
        + '</div>'
        + '<div class="home-ai-terminal" id="home-ai-terminal">&gt;&gt; PMN LOCAL EXPERT AGENT ACTIVE\n&gt;&gt; SELECT "LOCAL AI" FOR IN-BROWSER RESPONSES.\n&gt;&gt; ASK A QUESTION TO GENERATE DEEP ANALYSIS INSTANTLY.</div>'
        + '<div class="home-ai-actions"><button id="home-ai-copy" class="pmn-agent-btn" type="button">Copy prompt only</button></div>'
        + '<p class="home-ai-note">The local AI expert generates responses entirely in-browser, referencing the full manuscript offline.</p>';
    }



    function pip() {
      var tot = 0; for (var i = 0; i < PARTS.length; i++) { var ps = PARTS[i].subs; for (var j = 0; j < ps.length; j++) { tot++; if (ps[j].subs) for (var k = 0; k < ps[j].subs.length; k++) { tot++; if (ps[j].subs[k].subs) tot += ps[j].subs[k].subs.length; } } }
      var done = Object.keys(readMap).length;
      var pct = tot ? Math.round(done / tot * 100) : 0;
      g('pip-fill').style.width = pct + '%';
      if (g('pip-num')) g('pip-num').textContent = done + '/' + tot;
      g('st-p').textContent = PARTS.length;
      g('st-s').textContent = tot;
      g('st-r').textContent = pct + '%';
      if (g('toc-stat-parts')) g('toc-stat-parts').textContent = PARTS.length;
      if (g('toc-stat-sections')) g('toc-stat-sections').textContent = tot;
      if (g('toc-stat-read')) g('toc-stat-read').textContent = pct + '%';
      updateHomeSnapshot(PARTS.length, tot, pct);
    }

    function nav(v) {
      var views = document.querySelectorAll('.view');
      for (var i = 0; i < views.length; i++) views[i].classList.remove('on');
      g(v + '-view').classList.add('on');
      var btns = document.querySelectorAll('.hbtn');
      for (var i = 0; i < btns.length; i++) btns[i].classList.remove('on');
      // Manage toc-panel vs sv-body visibility in srch-view
      var tocPanel = g('toc-panel');
      var svBody = g('sv-body');
      if (v === 'home') {
        pip();
        g('hb-home').classList.add('on');
        if (tocPanel) tocPanel.style.display = 'none';
      }
      if (v === 'srch') {
        // If showing TOC (not a search query active), show toc-panel
        var q = g('srch-in') ? g('srch-in').value.trim() : '';
        if (!q) { showContentsPanel(); }
      }
      if (typeof updateMobNav === 'function') updateMobNav();
    }

    function showContentsPanel() {
      var tocPanel = g('toc-panel');
      var svBody = g('sv-body');
      if (tocPanel) { tocPanel.style.display = 'block'; tocPanel.scrollTop = 0; }
      if (svBody) { svBody.innerHTML = ''; svBody.style.display = 'none'; }
      var hdr = g('sv-hdr');
      if (hdr) hdr.textContent = 'Contents — Manuscript Map';
      var si = g('srch-in'); if (si) si.value = '';
      var sc = g('srch-clr'); if (sc) sc.style.display = 'none';
      buildTOC(); pip();
      g('hb-home').classList.add('on');
    }

    function hideContentsPanel() {
      var tocPanel = g('toc-panel');
      var svBody = g('sv-body');
      if (tocPanel) tocPanel.style.display = 'none';
      if (svBody) svBody.style.display = '';
    }

    function buildTOC() {
      var html = '';
      for (var pi = 0; pi < PARTS.length; pi++) {
        var p = PARTS[pi];
        var lbl = plong(p);
        var subs = '', done = 0, total = p.subs.length;
        for (var si = 0; si < p.subs.length; si++) {
          var s = p.subs[si], r = isR(pi, si), intro = s.is_intro;
          if (r) done++;
          subs += '<button class="toc-sub' + (intro ? ' intro' : '') + '" data-pi="' + pi + '" data-si="' + si + '">'
            + (intro ? '' : '<span class="toc-sid' + (r ? ' r' : '') + '">' + esc(displaySectionId(s.id)) + '</span>')
            + '<span class="toc-sname' + (r ? ' r' : '') + '">' + esc(s.title) + '</span>'
            + (r ? '<span class="toc-chk">&#10003;</span>' : '')
            + '</button>';
        }
        var pct = total ? Math.round(done / total * 100) : 0;
        var progBar = total > 1
          ? '<div class="toc-prog"><div class="toc-prog-bar"><div class="toc-prog-fill" style="width:' + pct + '%"></div></div>'
          + '<span class="toc-prog-lbl">' + done + '/' + total + '</span></div>'
          : '';
        html += '<div class="toc-part">'
          + '<button class="toc-ph" data-pi="' + pi + '" data-si="0">'
          + (lbl ? '<span class="toc-pnum">' + esc(lbl) + '</span>' : '')
          + '<span class="toc-pname">' + esc(p.title) + '</span>'
          + '</button>'
          + '<div class="toc-subs">' + subs + '</div>'
          + progBar
          + '</div>';
      }
      g('toc-grid').innerHTML = html;
      // Attach events
      var btns = g('toc-grid').querySelectorAll('[data-pi]');
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', (function (b) {
          return function () { openSec(+b.getAttribute('data-pi'), +b.getAttribute('data-si')); };
        })(btns[i]));
      }
    }

    function buildSB() {
      var html = '';
      for (var pi = 0; pi < PARTS.length; pi++) {
        var p = PARTS[pi];
        html += '<div class="sb-plbl' + (pi === curP ? ' on' : '') + '">' + esc(pshort(p)) + '</div>';
        for (var si = 0; si < p.subs.length; si++) {
          var s = p.subs[si], on = pi === curP && si === curS, r = isR(pi, si), intro = s.is_intro;
          html += '<button class="sb-item' + (on ? ' on' : '') + (intro ? ' intro-sec' : '') + '" data-pi="' + pi + '" data-si="' + si + '">'
            + '<span class="sb-iid' + (on ? ' on' : r ? ' r' : '') + '">' + esc(displaySectionId(s.id)) + '</span>'
            + '<span class="sb-ilbl' + (on ? ' on' : '') + '">' + esc(s.title) + '</span>'
            + '</button>';
        }
      }
      g('sb-list').innerHTML = html;
      var btns = g('sb-list').querySelectorAll('[data-pi]');
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', (function (b) {
          return function () { openSec(+b.getAttribute('data-pi'), +b.getAttribute('data-si')); };
        })(btns[i]));
      }
    }

    function toggleSB() {
      sbOpen = !sbOpen;
      var sb = g('sidebar'), tog = g('sb-tog');
      sb.classList.toggle('closed', !sbOpen);
      if (window.innerWidth <= 680) {
        sb.classList.toggle('mob-open', sbOpen);
      }
      tog.textContent = sbOpen ? '‹' : '›';
      tog.title = sbOpen ? 'Hide sidebar' : 'Show sidebar';
    }



    function copySecLink() {
      var s = PARTS[curP].subs[curS];
      var url = location.href.split('#')[0] + '#' + (s.id || '');
      copyText(url, function () {
        var btn = g('sec-ttl').querySelector('.share-btn');
        if (btn) { btn.classList.add('copied'); setTimeout(function () { btn.classList.remove('copied'); }, 1800); }
        flashButton(g('reader-copy-link'), 'Copied');
      });
    }

    // ── Cross-reference linking ──────────────────────────
    function copySectionCitation() {
      copyText(buildCurrentSectionCitation(), function () {
        flashButton(g('reader-copy-citation'), 'Copied');
      });
    }
    function dedupeReaderNotesPanel() {
      var nodes = document.querySelectorAll('#reader-view #annot-sec');
      if (nodes.length < 2) return;
      for (var i = 1; i < nodes.length; i++) {
        var n = nodes[i];
        if (n && n.parentNode) n.parentNode.removeChild(n);
      }
    }
    var LEGACY_XREF_IDS = {
      'how-to-read': 'how-to-read-this-document',
      '17.5a': '17.7b',
      '17.5b': '17.7c',
      '17.5c': '17.7d',
      '17.5d': '17.7e'
    };
    var XREF_IDS = Object.keys(LOOK).concat(Object.keys(LEGACY_XREF_IDS).filter(function (id) {
      return LOOK[LEGACY_XREF_IDS[id]];
    })).sort(function (a, b) {
      if (b.length !== a.length) return b.length - a.length;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
    var sectionJumpMeta = null;
    var xrefBack = null;
    function getActiveViewId() {
      var active = document.querySelector('.view.on');
      if (!active || !active.id) return 'home';
      return active.id.replace(/-view$/, '');
    }
    function getSectionMeta(pi, si) {
      if (typeof pi !== 'number' || typeof si !== 'number' || !PARTS[pi] || !PARTS[pi].subs[si]) return null;
      var s = PARTS[pi].subs[si];
      return { kind: 'section', pi: pi, si: si, id: s.id, title: s.title };
    }
    function getJumpOrigin() {
      var view = getActiveViewId();
      if (view === 'reader') return getSectionMeta(curP, curS);
      if (view === 'srch') {
        var q = g('srch-in') ? g('srch-in').value.trim() : '';
        var tocPanel = g('toc-panel');
        var showingContents = !!(tocPanel && tocPanel.style.display !== 'none' && !q);
        return { kind: 'view', view: 'srch', panel: showingContents ? 'contents' : 'search', label: showingContents ? 'Contents' : 'Search' };
      }
      return { kind: 'view', view: 'home', panel: 'home', label: 'Home' };
    }
    function updateJumpBack() {
      var wrap = g('reader-jumpbar'), meta = g('reader-jumpmeta'), btn = g('reader-jumpback');
      if (!wrap || !meta || !btn) return;
      if (!xrefBack || (xrefBack.kind === 'section' && xrefBack.pi === curP && xrefBack.si === curS)) {
        wrap.style.display = 'none';
        return;
      }
      wrap.style.display = 'flex';
      if (xrefBack.kind === 'view') {
        meta.textContent = 'Opened from ' + xrefBack.label;
        btn.textContent = 'Back to ' + xrefBack.label;
        return;
      }
      meta.textContent = 'Jumped here from ' + xrefBack.id + ' — ' + xrefBack.title;
      btn.textContent = 'Back to ' + xrefBack.id;
    }
    function jumpToSection(pi, si, opts) {
      sectionJumpMeta = opts || {};
      openSec(pi, si, !!(opts && opts.nohash));
    }
    function resolveSectionId(sid) {
      if (LOOK[sid]) return sid;
      if (LEGACY_XREF_IDS[sid] && LOOK[LEGACY_XREF_IDS[sid]]) return LEGACY_XREF_IDS[sid];
      return sid;
    }
    function jumpToSectionById(sid, opts) {
      var resolvedId = resolveSectionId(sid);
      var info = LOOK[resolvedId];
      if (!info) return false;
      jumpToSection(info.pi, info.si, opts);
      return true;
    }
    function openPartStart(part, opts) {
      for (var pi = 0; pi < PARTS.length; pi++) {
        if (PARTS[pi].part === part) {
          if (PARTS[pi].subs && PARTS[pi].subs.length > 0) {
            jumpToSection(pi, 0, opts);
            return true;
          }
        }
      }
      return false;
    }
    function linkXrefs(container) {
      var pat = XREF_IDS.map(function (id) { return id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
      var re = new RegExp('(?<![\\w.])(' + pat + ')(?![\\w.])', 'g');
      function walk(node) {
        if (node.nodeType === 3) {
          var txt = node.textContent;
          if (!re.test(txt)) return;
          re.lastIndex = 0;
          var frag = document.createDocumentFragment(), last = 0, m;
          while ((m = re.exec(txt)) !== null) {
            var sid = m[1];
            var resolvedId = LEGACY_XREF_IDS[sid] || sid;
            if (!LOOK[resolvedId]) continue;
            if (last < m.index) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
            var sp = document.createElement('a');
            sp.className = 'xref'; sp.textContent = sid;
            sp.href = '#' + resolvedId;
            sp.title = (LOOK[resolvedId].title || resolvedId).slice(0, 60);
            sp.setAttribute('data-sid', resolvedId);
            sp.addEventListener('click', function (e) {
              e.preventDefault();
              e.stopPropagation();
              jumpToSectionById(this.getAttribute('data-sid'), { origin: getJumpOrigin() });
            });
            frag.appendChild(sp);
            last = m.index + m[0].length;
          }
          if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
          node.parentNode.replaceChild(frag, node);
          return;
        }
        if (node.nodeType !== 1) return;
        var tag = node.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'A' || tag === 'MARK') return;
        if (node.classList && node.classList.contains('xref')) return;
        Array.from(node.childNodes).forEach(walk);
      }
      walk(container);
    }

    function openSec(pi, si, nohash) {
      var meta = sectionJumpMeta || {};
      sectionJumpMeta = null;
      var prev = getSectionMeta(curP, curS);
      if (meta.origin && !(meta.origin.kind === 'section' && meta.origin.pi === pi && meta.origin.si === si)) xrefBack = meta.origin;
      else if (meta.trackBack && prev && !(prev.pi === pi && prev.si === si)) xrefBack = prev;
      else if (!meta.keepBack) xrefBack = null;
      curP = pi; curS = si;
      markR(pi, si); savePos(pi, si); addHist(pi, si); buildSB(); renderSec(); nav('reader'); if (typeof window._afterOpenSec === 'function') window._afterOpenSec(pi, si);
      if (!nohash) { try { history.pushState(null, '', '#' + PARTS[pi].subs[si].id); } catch (e) { } }
      if (window.innerWidth <= 680) { var sb = g('sidebar'); sb.classList.remove('mob-open'); sb.classList.add('closed'); sbOpen = false; }
      g('reader-main').scrollTop = 0;
      updateJumpBack();
      setTimeout(function () { var a = g('sb-list').querySelector('.sb-item.on'); if (a) a.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 60);
    }
    function openById(sid) { return jumpToSectionById(sid, { nohash: true }); }

    function clean(t) {
      return t.replace(/\\'/g, "'").replace(/\\"/g, '"')
        .replace(/---/g, '—').replace(/--(?!-)/g, '–')
        .replace(/\\\\/g, '');
    }


    // ── Session history
    var sessHist = [];
    function addHist(pi, si) {
      var s = PARTS[pi].subs[si], key = pi + '-' + si;
      sessHist = sessHist.filter(function (h) { return h.pi + '-' + h.si !== key; });
      sessHist.unshift({ pi: pi, si: si, id: s.id, title: s.title });
      if (sessHist.length > 12) sessHist.pop();
      renderHist();
    }
    function renderHist() {
      var wrap = g('sb-hist'), list = g('sb-hist-list'); if (!wrap || !list) return;
      if (sessHist.length < 2) { wrap.style.display = 'none'; return; }
      wrap.style.display = '';
      var h = '';
      for (var i = 1; i < sessHist.length; i++) {
        var e = sessHist[i];
        h += '<div class="sb-hist-item" data-pi="' + e.pi + '" data-si="' + e.si + '">'
          + '<span class="sb-hist-sid">' + esc(displaySectionId(e.id)) + '</span>'
          + '<span class="sb-hist-title">' + esc(e.title.length > 32 ? e.title.slice(0, 30) + '\u2026' : e.title) + '</span>'
          + '</div>';
      }
      list.innerHTML = h;
    }
    // ── Suggestions
    var SG = { 'unread': [['1.1', 'Start at beginning'], ['3.4', 'Minimal anchor'], ['12.1', 'How to use']], 'early': [['1.3', 'Probabilistic determinism'], ['4.1', 'Foundation of value'], ['6.1', 'Power']], 'mid': [['10.1', 'Systems change'], ['13.1', 'Permanent tensions'], ['16.0', 'Technology']], 'late': [['12.5', 'Failure modes'], ['14.2', 'The doctrine'], ['13.5', 'Beyond the framework']] };
    function renderSuggestions() {
      var wrap = g('suggestions'); if (!wrap) return;
      var tot = 0; for (var i = 0; i < PARTS.length; i++) { var ps = PARTS[i].subs; for (var j = 0; j < ps.length; j++) { tot++; if (ps[j].subs) for (var k = 0; k < ps[j].subs.length; k++) { tot++; if (ps[j].subs[k].subs) tot += ps[j].subs[k].subs.length; } } }
      var done = Object.keys(readMap).length, pct = tot ? done / tot : 0;
      var tier = pct === 0 ? 'unread' : pct < 0.15 ? 'early' : pct < 0.5 ? 'mid' : 'late';
      var ents = SG[tier], h = '<div class="suggest-lbl">Suggested entry points</div>', shown = 0;
      for (var i = 0; i < ents.length; i++) {
        var sid = ents[i][0], why = ents[i][1], info = LOOK[sid]; if (!info) continue;
        h += '<button class="suggest-btn" data-pi="' + info.pi + '" data-si="' + info.si + '">'
          + '<span class="suggest-sid">' + esc(sid) + '</span>'
          + '<span class="suggest-title">' + esc(PARTS[info.pi].subs[info.si].title) + '</span>'
          + '<span class="suggest-why">' + esc(why) + '</span>'
          + '</button>';
        shown++;
      }
      if (shown > 0) { wrap.innerHTML = h; wrap.style.display = ''; }
    }
    // ── Cited-in
    function renderCitedIn(sid) {
      var el = g('cited-sec'); if (!el) return;
      var refs = CITED[sid];
      if (!refs || !refs.length) { el.innerHTML = ''; return; }
      var h = '<span class="cited-lbl">Referenced in</span><div class="cited-list">';
      for (var i = 0; i < refs.length; i++) {
        var r = refs[i], info = LOOK[r]; if (!info) continue;
        h += '<button class="cited-btn" data-pi="' + info.pi + '" data-si="' + info.si + '">'
          + '<span class="cited-sid">' + esc(r) + '</span>'
          + esc(info.title.length > 40 ? info.title.slice(0, 38) + '\u2026' : info.title)
          + '</button>';
      }
      h += '</div>';
      el.innerHTML = h;
    }
    // ── Annotations
    function annotKey(pi, si) { return 'pmn-an-' + PARTS[pi].subs[si].id; }
    function loadAnnot(pi, si) {
      var ta = g('annot-ta'); if (!ta) return;
      try { ta.value = localStorage.getItem(annotKey(pi, si)) || ''; } catch (e) { ta.value = ''; }
    }
    function saveAnnot() {
      var ta = g('annot-ta'); if (!ta) return;
      try {
        var k = annotKey(curP, curS);
        if (ta.value.trim()) localStorage.setItem(k, ta.value);
        else localStorage.removeItem(k);
        var msg = g('annot-saved');
        msg.textContent = 'Saved'; msg.classList.add('show');
        setTimeout(function () { msg.classList.remove('show'); }, 1600);
      } catch (e) { }
    }
    function loadHomeNotes() {
      var ta = g('home-notes-ta'); if (!ta) return;
      try { ta.value = localStorage.getItem('pmn-home-notes') || ''; } catch (e) { ta.value = ''; }
    }
    function saveHomeNotes() {
      var ta = g('home-notes-ta'); if (!ta) return;
      try {
        if (ta.value.trim()) localStorage.setItem('pmn-home-notes', ta.value);
        else localStorage.removeItem('pmn-home-notes');
        showHomeNotesStatus('Saved');
      } catch (e) { }
    }
    function showHomeNotesStatus(text) {
      var msg = g('home-notes-saved');
      if (!msg) return;
      msg.textContent = text;
      msg.classList.add('show');
      setTimeout(function () { msg.classList.remove('show'); }, 1600);
    }
    function clearHomeNotes() {
      var ta = g('home-notes-ta'); if (!ta) return;
      ta.value = '';
      try { localStorage.removeItem('pmn-home-notes'); } catch (e) { }
      showHomeNotesStatus('Cleared');
    }
    function copyHomeNotes() {
      var ta = g('home-notes-ta'); if (!ta) return;
      var text = ta.value.trim();
      if (!text) { showHomeNotesStatus('Nothing to copy'); return; }
      navigator.clipboard.writeText(text).then(function () {
        showHomeNotesStatus('Copied');
      }).catch(function () {
        showHomeNotesStatus('Copy blocked');
      });
    }
    function getPublicVersionTag() {
      var lbl = g('doc-footer') ? g('doc-footer').querySelector('.doc-footer-lbl') : null;
      var text = lbl ? lbl.textContent : '';
      var m = text.match(/Version\s+(\d+)/i);
      return m ? ('V' + m[1]) : 'PMN';
    }
    function updateHomeSnapshot(partsCount, sectionCount, readPct) {
      var ver = g('home-bottom-version'), pcs = g('home-bottom-parts'), secs = g('home-bottom-sections'), prog = g('home-bottom-progress');
      if (ver) ver.textContent = getPublicVersionTag();
      if (pcs) pcs.textContent = String(partsCount);
      if (secs) secs.textContent = String(sectionCount);
      if (prog) prog.textContent = readPct + '%';
    }
    // ── Export
    function exportSec() {
      var s = PARTS[curP].subs[curS];
      var plain = s.html.replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').trim();
      var annot = g('annot-ta') ? g('annot-ta').value.trim() : '';
      var out = ['# ' + s.id + ' - ' + s.title, '', plain];
      if (annot) out.push('', '---', 'Notes:', annot);
      var txt = out.join('\n');
      try {
        navigator.clipboard.writeText(txt).then(function () {
          var btn = g('export-btn'), orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = orig; }, 1800);
        });
      } catch (e) {
        var w = window.open('', '_blank');
        w.document.write('<pre style="font:14px monospace;padding:2rem;white-space:pre-wrap">' + txt + '</pre>');
      }
    }
    // ── Annotation summary
    function flashButton(btn, text) {
      if (!btn) return;
      var orig = btn.textContent;
      btn.textContent = text;
      setTimeout(function () { btn.textContent = orig; }, 1800);
    }
    function copyText(text, onSuccess) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { if (onSuccess) onSuccess(); }).catch(function () {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          if (onSuccess) onSuccess();
        });
        return;
      }
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (onSuccess) onSuccess();
    }
    function buildCurrentSectionCitation() {
      var p = PARTS[curP], s = p.subs[curS];
      var partLabel = SPECIAL[p.part] ? p.title : ('Part ' + p.part + ' — ' + p.title);
      return [
        getPublicVersionTag() + ' — Progressive Materialist Naturalism',
        s.id + ' — ' + s.title,
        partLabel,
        location.href.split('#')[0] + '#' + (s.id || '')
      ].join('\n');
    }
    function openAnnotSummary() {
      var entries = [];
      for (var pi = 0; pi < PARTS.length; pi++) {
        for (var si = 0; si < PARTS[pi].subs.length; si++) {
          var s = PARTS[pi].subs[si], note = '';
          try { note = localStorage.getItem('pmn-an-' + s.id) || ''; } catch (e) { }
          if (note.trim()) entries.push({ id: s.id, title: s.title, note: note.trim() });
        }
      }
      var modal = g('notes-modal'), body = g('notes-body');
      if (!modal || !body) return;
      if (!entries.length) {
        body.innerHTML = '<p style="font-family:Lora,serif;font-style:italic;color:var(--mute);padding:1rem 0">No notes yet. Open any section and write in the Notes field below the text.</p>';
      } else {
        body.innerHTML = entries.map(function (e) {
          return '<div style="margin-bottom:2rem;padding-bottom:2rem;border-bottom:1px solid var(--rule)">'
            + '<div style="display:flex;gap:.6rem;align-items:baseline;margin-bottom:.5rem">'
            + '<span style="font-family:Source Code Pro,monospace;font-size:.7rem;color:var(--acc)">' + esc(e.id) + '</span>'
            + '<span style="font-family:Lora,serif;font-size:.9rem;color:var(--mute)">' + esc(e.title) + '</span>'
            + '</div>'
            + '<pre style="font-family:Lora,serif;font-size:.95rem;line-height:1.75;white-space:pre-wrap;color:var(--ink2);margin:0">' + esc(e.note) + '</pre>'
            + '</div>';
        }).join('');
      }
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      // Copy all
      var copyBtn = g('notes-copy-all');
      if (copyBtn) {
        copyBtn.onclick = function () {
          var txt = entries.map(function (e) { return e.id + ' - ' + e.title + '\n' + e.note; }).join('\n\n---\n\n');
          navigator.clipboard.writeText(txt).then(function () {
            copyBtn.textContent = 'Copied!';
            setTimeout(function () { copyBtn.textContent = 'Copy all'; }, 1800);
          });
        };
      }
    }
    function closeNotesModal() {
      var m = g('notes-modal'); if (m) m.style.display = 'none';
      document.body.style.overflow = '';
    }
    function renderRelated(sid) {
      var el = g('related-sec');
      var refs = REL[sid];
      if (!refs || !refs.length) { el.innerHTML = ''; return; }
      var h = '<span class="related-lbl">See also</span><div class="related-list">';
      for (var i = 0; i < refs.length; i++) {
        var r = refs[i], info = LOOK[r];
        if (!info) continue;
        var pt = info.pt;
        var ptlbl = (['Preface', 'Coda', 'Intellectual Debts', 'Bibliography'].indexOf(pt) >= 0) ? pt : 'Part ' + pt;
        h += '<button class="rel-btn" data-pi="' + info.pi + '" data-si="' + info.si + '">'
          + '<span class="rel-sid">' + esc(r) + '</span>'
          + '<span class="rel-stitle">' + esc(info.title) + '</span>'
          + '<span class="rel-pt">' + esc(ptlbl) + '</span>'
          + '</button>';
      }
      h += '</div>';
      el.innerHTML = h;
      // clicks handled by delegation
    }

    function renderSec() {
      var p = PARTS[curP], s = p.subs[curS];
      var lbl = SPECIAL[p.part] ? '' : ('Part ' + p.part + ' — ' + p.title);
      var intro = s.is_intro;
      g('bc-part').textContent = pshort(p);
      g('bc-sid').textContent = s.id;
      g('sec-eye').textContent = lbl;
      var isSpecialSec = SPECIAL[p.part] || s.id.indexOf('.') < 0;
      var shareBtn = '<button class="share-btn" title="Copy link" onclick="copySecLink()"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="13" cy="3" r="1.8"/><circle cx="3" cy="8" r="1.8"/><circle cx="13" cy="13" r="1.8"/><line x1="4.7" y1="7" x2="11.3" y2="4"/><line x1="4.7" y1="9" x2="11.3" y2="12"/></svg></button>';
      g('sec-ttl').innerHTML = (isSpecialSec ? '' : '<span class="sec-id">' + esc(s.id) + '</span>') + esc(s.title) + shareBtn;
      g('sec-ttl').className = isSpecialSec ? 'sec-ttl intro-ttl' : 'sec-ttl';
      var html = s.html || (s.text ? '<p>' + esc(s.text) + '</p>' : '');
      var _sh = g('srch-in') ? g('srch-in').value.trim() : '';
      if (_sh.length > 2) {
        var _re = new RegExp('(' + _sh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        html = html.replace(_re, '<mark>$1</mark>');
      }
      g('prose').innerHTML = html;
      linkXrefs(g('prose'));
      g('prose').addEventListener('mouseup', handleSel);
      // Reading time
      var words = (s.html || s.text || '').replace(/<[^>]+>/g, ' ').split(/\s+/).length;
      var mins = Math.max(1, Math.round(words / 200));
      if (g('read-time')) g('read-time').textContent = mins + ' min read';
      var col = g('reader-col');
      col.classList.remove('fi'); void col.offsetWidth; col.classList.add('fi');
      var first = curP === 0 && curS === 0, last = curP === PARTS.length - 1 && curS === PARTS[curP].subs.length - 1;
      g('rn-p').disabled = first;
      g('rn-n').disabled = last;
      g('rn-n').className = last ? 'rnav-btn' : 'rnav-btn nxt';
      g('rn-pos').textContent = (curS + 1) + '/' + p.subs.length;
      // Back-matter styling
      var bm = ['Coda', 'Intellectual Debts', 'Bibliography'];
      g('prose').className = bm.indexOf(p.part) >= 0 ? 'prose back-matter' : 'prose';
      // Related sections
      renderRelated(s.id);
      renderCitedIn(s.id);

      // Dynamically show/hide meta-links-panel based on reference presence
      var hasRefs = (REL[s.id] && REL[s.id].length > 0) || (CITED[s.id] && CITED[s.id].length > 0);
      var metaPanel = g('meta-links-panel');
      if (metaPanel) {
        metaPanel.style.display = hasRefs ? '' : 'none';
        if (metaPanel.parentNode) {
          if (!hasRefs) {
            metaPanel.parentNode.classList.add('single-panel');
          } else {
            metaPanel.parentNode.classList.remove('single-panel');
          }
        }
      }

      updateReaderAgentStatus();
      loadAnnot(curP, curS);
      // Feedback mailto
      var subj = encodeURIComponent('PMN Reader - Feedback: ' + s.id + ' ' + s.title);
      var body = encodeURIComponent('Section: ' + s.id + ' - ' + s.title + '\nMy comment:\n');
      var fl = g('feedback-link'); if (fl) fl.setAttribute('href', 'mailto:novadharma.pm@gmail.com?subject=' + subj + '&body=' + body);
      var tweet = encodeURIComponent('Re: PMN Reader - ' + s.id + ' ' + s.title + ' @nova_dharma_pm');
      var tl = g('twitter-link'); if (tl) tl.setAttribute('href', 'https://twitter.com/intent/tweet?text=' + tweet);
    }

    function nextSec(pi, si) {
      si++; if (si >= PARTS[pi].subs.length) { pi++; si = 0; }
      if (pi >= PARTS.length) return;
      if (PARTS[pi].subs[si] && PARTS[pi].subs[si].is_intro) { si++; if (si >= PARTS[pi].subs.length) { pi++; si = 0; } }
      if (pi < PARTS.length) openSec(pi, si);
    }
    function prevSec(pi, si) {
      si--; if (si < 0) { pi--; if (pi < 0) return; si = PARTS[pi].subs.length - 1; }
      if (PARTS[pi].subs[si] && PARTS[pi].subs[si].is_intro) { si--; if (si < 0) { pi--; if (pi < 0) return; si = PARTS[pi].subs.length - 1; } }
      openSec(pi, si);
    }
    function navN() { nextSec(curP, curS); }
    function navP() { prevSec(curP, curS); }

    // ── Mobile bottom nav
    function updateMobNav() {
      var bar = g('mob-nav'); if (!bar) return;
      var inReader = g('reader-view').classList.contains('on');
      if (inReader) { bar.classList.remove('hidden'); }
      else { bar.classList.add('hidden'); }
      var pp = g('mob-prev'), nn = g('mob-next');
      if (pp) pp.disabled = (curP === 0 && curS === 0);
      if (nn) nn.disabled = (curP === PARTS.length - 1 && curS === PARTS[curP].subs.length - 1);
    }

    var _st = null;
    function onSI(v) {
      g('srch-clr').style.display = v ? 'block' : 'none';
      clearTimeout(_st);
      hideContentsPanel();
      if (v.length >= 3) { nav('srch'); _st = setTimeout(function () { doSrch(v); }, 180); }
      else if (!v) { nav('home'); }
      else { nav('srch'); renderGL(); }
    }
    function onSF() { var v = g('srch-in').value; if (v.length >= 3) { nav('srch'); hideContentsPanel(); doSrch(v); } else { nav('srch'); renderGL(); } }
    function clrS() { g('srch-in').value = ''; g('srch-clr').style.display = 'none'; nav('home'); }
    function showGL() { g('srch-in').value = ''; nav('srch'); hideContentsPanel(); renderGL(); g('hb-gl').classList.add('on'); }

    function renderGLLegacyUnused() {
      hideContentsPanel();
      var svBody = g('sv-body');
      if (svBody) svBody.style.display = '';
      g('sv-hdr').textContent = 'Lexicon — Key Terms';
      var h = '';
      var grps = Object.keys(GLG);
      for (var i = 0; i < grps.length; i++) {
        var grp = grps[i], terms = GLG[grp];
        h += '<div class="gl-grp-lbl">' + esc(grp) + '</div><div class="gl-grid">';
        for (var j = 0; j < terms.length; j++) {
          var t = terms[j], d = GL[t] || '';
          h += '<button class="gl-card" data-term="' + esc(t) + '" title="Search sections mentioning this term"><p class="gl-term">' + esc(t) + '</p><p class="gl-def">' + esc(d) + '</p></button>';
        }
        h += '</div>';
      }
      g('sv-body').innerHTML = h;
    }

    function renderGL() {
      hideContentsPanel();
      var svBody = g('sv-body');
      if (svBody) svBody.style.display = '';
      g('sv-hdr').textContent = 'Glossary - Key Terms';
      var h = '';
      var grps = Object.keys(GLG);
      for (var i = 0; i < grps.length; i++) {
        var grp = grps[i], terms = GLG[grp];
        h += '<div class="gl-grp-lbl">' + esc(grp) + '</div><div class="gl-grid">';
        for (var j = 0; j < terms.length; j++) {
          var t = terms[j], raw = (GL[t] || '').trim();
          var empty = !raw;
          var d = empty ? 'Definition pending in this public build. Open the manuscript or search this term for context.' : raw;
          h += '<button class="gl-card" data-term="' + esc(t) + '" title="Search sections mentioning this term"><p class="gl-term">' + esc(t) + '</p><p class="gl-def' + (empty ? ' is-empty' : '') + '">' + esc(d) + '</p></button>';
        }
        h += '</div>';
      }
      g('sv-body').innerHTML = h;
    }

    function populatePartFilter() {
      var sel = g('srch-part'); if (!sel) return;
      for (var pi = 0; pi < PARTS.length; pi++) {
        var o = document.createElement('option');
        o.value = pi; o.textContent = pshort(PARTS[pi]);
        sel.appendChild(o);
      }
      sel.addEventListener('change', function () { doSrch(g('srch-in').value); });
    }
    function doSrch(q) {
      hideContentsPanel();
      var svBody = g('sv-body');
      if (svBody) svBody.style.display = '';
      var ql = q.toLowerCase().trim(), res = [];
      var pf = g('srch-part') ? g('srch-part').value : '';
      if (/^[0-9]+\.[0-9]+[a-z]?$/.test(ql) || /^a\.[0-9]+$/i.test(ql)) {
        var info = LOOK[resolveSectionId(ql)]; if (info) { jumpToSection(info.pi, info.si, { origin: getJumpOrigin() }); clrS(); return; }
      }

      // Smart Glossary mapping:
      var citedSections = [];
      var matchedTermKey = null;
      var keys = Object.keys(GL);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k.toLowerCase() === ql || ql.indexOf(k.toLowerCase()) >= 0 || k.toLowerCase().indexOf(ql) >= 0) {
          matchedTermKey = k;
          var def = GL[k];
          var rx = /\((\d+\.\d+[a-z]?)\)/g, match;
          while ((match = rx.exec(def)) !== null) {
            var secId = match[1];
            if (citedSections.indexOf(secId) < 0) citedSections.push(secId);
          }
        }
      }

      var addedSections = {}; // To avoid duplicates

      // First, add explicitly cited sections from matching glossary term
      for (var i = 0; i < citedSections.length; i++) {
        var secId = citedSections[i];
        var info = LOOK[resolveSectionId(secId)];
        if (info) {
          if (pf !== '' && info.pi !== +pf) continue;
          var p = PARTS[info.pi];
          var s = p.subs[info.si];
          var key = info.pi + '-' + info.si;
          if (!addedSections[key]) {
            res.push({
              pi: info.pi,
              si: info.si,
              p: p,
              s: s,
              snip: '<em>Key Term Match: “' + matchedTermKey + '” is cited here.</em>',
              isGlossaryMatch: true
            });
            addedSections[key] = true;
          }
        }
      }

      // Now scan all parts for regular matching
      for (var pi = 0; pi < PARTS.length; pi++) {
        var p = PARTS[pi];
        for (var si = 0; si < p.subs.length; si++) {
          var s = p.subs[si];
          if (pf !== '' && pi !== +pf) continue;
          var key = pi + '-' + si;
          if (addedSections[key]) continue; // Already added as glossary match

          var stxt = s.html ? (s.html.replace(/<[^>]+>/g, ' ')) : s.text || '';
          var matched = false;
          var snip = '';

          // 1. Strict substring match
          if (ql && (s.title.toLowerCase().indexOf(ql) >= 0 || stxt.toLowerCase().indexOf(ql) >= 0)) {
            matched = true;
            var idx = stxt.toLowerCase().indexOf(ql);
            if (idx >= 0) {
              var st = Math.max(0, idx - 90), en = Math.min(stxt.length, idx + 160);
              snip = (st > 0 ? '…' : '') + stxt.slice(st, en) + (en < stxt.length ? '…' : '');
            }
          }
          // 2. Token fallback: if multi-word query, check if all words are present
          else if (ql && ql.indexOf(' ') > 0) {
            var words = ql.split(/\s+/).filter(function (w) { return w.length > 2; });
            if (words.length >= 2) {
              var allWordsPresent = true;
              for (var wIdx = 0; wIdx < words.length; wIdx++) {
                var w = words[wIdx];
                if (s.title.toLowerCase().indexOf(w) < 0 && stxt.toLowerCase().indexOf(w) < 0) {
                  allWordsPresent = false;
                  break;
                }
              }
              if (allWordsPresent) {
                matched = true;
                // Create a snippet around the first matching word
                var firstWord = words[0];
                var idx = stxt.toLowerCase().indexOf(firstWord);
                if (idx >= 0) {
                  var st = Math.max(0, idx - 90), en = Math.min(stxt.length, idx + 160);
                  snip = (st > 0 ? '…' : '') + stxt.slice(st, en) + (en < stxt.length ? '…' : '');
                }
              }
            }
          }

          if (matched) {
            res.push({ pi: pi, si: si, p: p, s: s, snip: snip });
            addedSections[key] = true;
          }
        }
      }

      function hl(t) { if (!q || q.length < 2) return esc(t); return esc(t).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); }
      g('sv-hdr').textContent = res.length + ' result' + (res.length !== 1 ? 's' : '') + ' for “' + q + '”';
      var shown = res.slice(0, 40), h = '';
      for (var i = 0; i < shown.length; i++) {
        var r = shown[i];
        h += '<button class="res' + (r.isGlossaryMatch ? ' is-glossary-match' : '') + '" data-pi="' + r.pi + '" data-si="' + r.si + '">'
          + '<p class="res-loc">' + esc(pshort(r.p)) + ' · ' + esc(r.s.id) + '</p>'
          + '<p class="res-title">' + hl(r.s.title) + '</p>'
          + (r.snip ? '<p class="res-snip">' + (r.isGlossaryMatch ? r.snip : hl(r.snip)) + '</p>' : '')
          + '</button>';
      }
      if (!res.length) h = '<p class="empty">No results found.</p>';
      g('sv-body').innerHTML = h;
      // clicks handled by delegation
    }

    function handleSel(e) {
      var sel = window.getSelection(); if (!sel) return;
      var txt = sel.toString().trim().toLowerCase();
      if (!txt || txt.length < 3) { hideTT(); return; }
      var keys = Object.keys(GL), key = null;
      for (var i = 0; i < keys.length; i++) { if (txt === keys[i] || txt.indexOf(keys[i]) >= 0) { key = keys[i]; break; } }
      if (!key) { hideTT(); return; }
      g('tt-term').textContent = key;
      g('tt-def').textContent = GL[key];
      var x = Math.min(e.clientX, window.innerWidth - 285);
      var y = Math.min(e.clientY + 14, window.innerHeight - 120);
      var tt = g('tt');
      tt.style.left = x + 'px'; tt.style.top = y + 'px'; tt.style.display = 'block';
      e.stopPropagation();
    }
    function hideTT() { g('tt').style.display = 'none'; }
    document.addEventListener('click', hideTT);

    function showKbd() {
      var m = g('kbd-modal'); if (m) { m.style.display = 'block'; document.body.style.overflow = 'hidden'; }
    }
    function closeKbd() {
      var m = g('kbd-modal'); if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
    }

    document.addEventListener('keydown', function (e) {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      var key = e.key.toLowerCase();

      // c/C -> Start Reading / Contents
      if (key === 'c') {
        e.preventDefault();
        nav('srch');
        showContentsPanel();
        return;
      }

      // r/R -> Resume Reading
      if (key === 'r') {
        e.preventDefault();
        var resBtn = g('cta-resume');
        if (resBtn && resBtn.style.display !== 'none') {
          resBtn.click();
        }
        return;
      }

      // a/A -> AI Agent Guide
      if (key === 'a') {
        e.preventDefault();
        window.location.href = 'pmn-agent-guide.html';
        return;
      }

      // n/N -> My Notes modal toggle
      if (key === 'n') {
        e.preventDefault();
        var notesBtn = g('cta-notes');
        if (notesBtn) notesBtn.click();
        return;
      }

      // ? or g/G -> Glossary / Key Terms
      if (e.key === '?' || key === 'g') {
        e.preventDefault();
        showGL();
        return;
      }

      // k/K -> Keyboard Shortcuts modal help
      if (key === 'k') {
        e.preventDefault();
        showKbd();
        return;
      }

      // / -> Focus Search input
      if (e.key === '/') {
        e.preventDefault();
        g('srch-in').focus();
        return;
      }

      // Escape -> Close active modals
      if (e.key === 'Escape') {
        if (g('kbd-modal') && g('kbd-modal').style.display === 'block') { closeKbd(); return; }
        if (g('notes-modal') && g('notes-modal').style.display === 'block') { closeNotesModal(); return; }
        if (g('srch-view') && g('srch-view').classList.contains('on')) { clrS(); return; }
      }

      // Arrow keys (Reader mode only)
      if (g('reader-view').classList.contains('on')) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); navN(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); navP(); }
      }
    });

    // Event delegation
    g('sv-body').addEventListener('click', function (e) {
      // Glossary card click → search that term
      var card = e.target.closest('.gl-card[data-term]');
      if (card) {
        var term = card.getAttribute('data-term');
        g('srch-in').value = term;
        g('srch-clr').style.display = 'block';
        doSrch(term);
        return;
      }
      // Search result click → open section
      var btn = e.target.closest('[data-pi]'); if (!btn) return;
      jumpToSection(+btn.getAttribute('data-pi'), +btn.getAttribute('data-si'), { origin: getJumpOrigin() });
      if (g('srch-view').classList.contains('on')) clrS();
    });
    g('related-sec').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-pi]'); if (!btn) return;
      jumpToSection(+btn.getAttribute('data-pi'), +btn.getAttribute('data-si'), { origin: getJumpOrigin() });
    });
    g('toc-grid').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-pi]'); if (!btn) return;
      jumpToSection(+btn.getAttribute('data-pi'), +btn.getAttribute('data-si'), { origin: getJumpOrigin() });
    });
    g('toc-panel').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-toc-open-id],[data-toc-open-part],[data-toc-open-glossary]');
      if (!btn) return;
      if (btn.hasAttribute('data-toc-open-glossary')) {
        showGL();
        return;
      }
      var sid = btn.getAttribute('data-toc-open-id');
      var part = btn.getAttribute('data-toc-open-part');
      if (sid) {
        var resolvedId = resolveSectionId(sid);
        if (LOOK[resolvedId]) jumpToSection(LOOK[resolvedId].pi, LOOK[resolvedId].si, { origin: getJumpOrigin() });
        return;
      }
      if (part) openPartStart(part, { origin: getJumpOrigin() });
    });
    g('sb-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-pi]'); if (!btn) return;
      jumpToSection(+btn.getAttribute('data-pi'), +btn.getAttribute('data-si'), { origin: getJumpOrigin() });
    });
    // Wire up static buttons (no inline onclick)
    g('hdr-logo').addEventListener('click', function () { nav('home'); });
    g('hb-home').addEventListener('click', function () { nav('srch'); showContentsPanel(); });
    g('hb-gl') && g('hb-gl').addEventListener('click', showGL);
    g('mob-prev') && g('mob-prev').addEventListener('click', function () { navP(); });
    g('mob-next') && g('mob-next').addEventListener('click', function () { navN(); });
    g('mob-mid') && g('mob-mid').addEventListener('click', function () { nav('srch'); showContentsPanel(); });

    g('theme-tog').addEventListener('click', toggleTheme);
    g('layout-tog') && g('layout-tog').addEventListener('click', toggleLayout);
    g('srch-clr').addEventListener('click', clrS);
    g('srch-in').addEventListener('input', function () { onSI(this.value); });
    g('srch-in').addEventListener('focus', onSF);
    g('cta-begin').addEventListener('click', function () { nav('srch'); showContentsPanel(); });
    g('cta-gl').addEventListener('click', showGL);
    g('sb-tog').addEventListener('click', toggleSB);
    g('bc-home').addEventListener('click', function () { nav('srch'); showContentsPanel(); });
    g('rn-p').addEventListener('click', navP);
    g('rn-n').addEventListener('click', navN);
    g('hb-kbd') && g('hb-kbd').addEventListener('click', showKbd);
    g('kbd-close') && g('kbd-close').addEventListener('click', closeKbd);
    g('kbd-modal') && g('kbd-modal').addEventListener('click', function (e) {
      if (e.target === g('kbd-modal')) closeKbd();
    });

    // Init
    upgradeThesisSection();
    injectReadingPaths();
    upgradeHomeAi();
    initReaderScale();
    initContentsScale();
    initSidebarScale();
    initReaderMeasure();
    loadHomeNotes();
    pip();
    buildTOC();
    // Init sb-tog position
    (function () {
      var tog = g('sb-tog');
      if (tog) { tog.textContent = '‹'; tog.title = 'Hide sidebar'; }
    })();
    populatePartFilter();
    renderSuggestions();
    g('footer-home').addEventListener('click', function () { nav('home'); });
    g('home-bottom-glossary') && g('home-bottom-glossary').addEventListener('click', showGL);
    g('home-bottom-open-contents') && g('home-bottom-open-contents').addEventListener('click', function () { nav('srch'); showContentsPanel(); });
    g('home-notes-copy') && g('home-notes-copy').addEventListener('click', copyHomeNotes);
    g('home-notes-clear') && g('home-notes-clear').addEventListener('click', clearHomeNotes);
    g('home-notes-save') && g('home-notes-save').addEventListener('click', saveHomeNotes);
    g('font-sm') && g('font-sm').addEventListener('click', function () { setReaderScale(0.92); });
    g('font-md') && g('font-md').addEventListener('click', function () { setReaderScale(1); });
    g('font-lg') && g('font-lg').addEventListener('click', function () { setReaderScale(1.08); });
    g('contents-sm') && g('contents-sm').addEventListener('click', function () { setContentsScale(0.94); });
    g('contents-md') && g('contents-md').addEventListener('click', function () { setContentsScale(1); });
    g('contents-lg') && g('contents-lg').addEventListener('click', function () { setContentsScale(1.1); });
    g('sidebar-sm') && g('sidebar-sm').addEventListener('click', function () { setSidebarScale(0.92); });
    g('sidebar-md') && g('sidebar-md').addEventListener('click', function () { setSidebarScale(1); });
    g('sidebar-lg') && g('sidebar-lg').addEventListener('click', function () { setSidebarScale(1.1); });
    g('measure-narrow') && g('measure-narrow').addEventListener('click', function () { setReaderMeasure('62ch'); });
    g('measure-base') && g('measure-base').addEventListener('click', function () { setReaderMeasure('68ch'); });
    g('measure-wide') && g('measure-wide').addEventListener('click', function () { setReaderMeasure('76ch'); });
    g('reader-jumpback') && g('reader-jumpback').addEventListener('click', function () {
      if (!xrefBack) return;
      if (xrefBack.kind === 'view') {
        var back = xrefBack;
        xrefBack = null;
        if (back.panel === 'search') nav('srch');
        else if (back.panel === 'contents') { nav('srch'); showContentsPanel(); }
        else nav('home');
        updateJumpBack();
        return;
      }
      jumpToSection(xrefBack.pi, xrefBack.si, { keepBack: false });
    });
    // reader chat handled by initReaderChat() in AI engine
    if (!g('hai-tabs')) {
      g('home-ai-btn') && g('home-ai-btn').addEventListener('click', function () {
        var target = g('home-ai-mode') ? g('home-ai-mode').value : 'chatgpt';
        var question = g('home-ai-input') ? g('home-ai-input').value.trim() : '';
        launchAgent(target, 'home', question, false);
      });
      g('home-ai-copy') && g('home-ai-copy').addEventListener('click', function () {
        var question = g('home-ai-input') ? g('home-ai-input').value.trim() : '';
        launchAgent('chatgpt', 'home', question, true);
      });
      g('home-ai-input') && g('home-ai-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var target = g('home-ai-mode') ? g('home-ai-mode').value : 'chatgpt';
          launchAgent(target, 'home', this.value.trim(), false);
        }
      });
    }

    // ── Homepage cover hold: sticky stage with eased release ──
    (function () {
      var homeView = g('home-view');
      var stage = g('hero-stage');
      if (!homeView || !stage) return;

      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var current = 0;
      var target = 0;
      var rafId = 0;

      function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
      function easeOutCubic(v) { return 1 - Math.pow(1 - v, 3); }
      function smoothStep(v) { return v * v * (3 - 2 * v); }
      function holdRatio() { return window.innerWidth <= 680 ? 0.18 : 0.3; }
      function shapeProgress(raw) {
        var hold = holdRatio();
        if (raw <= hold) return raw * 0.05;
        return 0.015 + smoothStep((raw - hold) / (1 - hold)) * 0.985;
      }

      function computeTarget() {
        var releaseRange = Math.max(stage.offsetHeight - homeView.clientHeight, 1);
        var raw = clamp((homeView.scrollTop - stage.offsetTop) / releaseRange, 0, 1);
        target = shapeProgress(raw);
        if (reduceMotion) current = target;
      }

      function paint() {
        if (!reduceMotion) {
          current += (target - current) * 0.075;
          if (Math.abs(target - current) < 0.001) current = target;
        }
        var eased = easeOutCubic(current);
        stage.style.setProperty('--cover-progress', eased.toFixed(4));
        stage.classList.toggle('cover-settled', eased > 0.985);
        if (!reduceMotion && current !== target) {
          rafId = requestAnimationFrame(paint);
        } else {
          rafId = 0;
        }
      }

      function syncCover() {
        computeTarget();
        if (rafId) return;
        rafId = requestAnimationFrame(paint);
      }

      homeView.addEventListener('scroll', syncCover, { passive: true });
      window.addEventListener('resize', syncCover);
      syncCover();
    })();
    // Resume reading
    var _pos = loadPos();
    if (_pos && _pos[0] < PARTS.length && _pos[1] < PARTS[_pos[0]].subs.length) {
      var _rs = PARTS[_pos[0]].subs[_pos[1]];
      var _rb = g('cta-resume');
      _rb.textContent = 'Resume: ' + _rs.id + ' →';
      _rb.style.display = '';
      _rb.addEventListener('click', function () { jumpToSection(_pos[0], _pos[1]); });
    }
    dedupeReaderNotesPanel();
    g('annot-save') && g('annot-save').addEventListener('click', saveAnnot);
    g('export-btn') && g('export-btn').addEventListener('click', exportSec);
    g('reader-copy-link') && g('reader-copy-link').addEventListener('click', copySecLink);
    g('reader-copy-citation') && g('reader-copy-citation').addEventListener('click', copySectionCitation);
    g('reader-open-contents') && g('reader-open-contents').addEventListener('click', function () { nav('srch'); showContentsPanel(); });
    g('cta-notes') && g('cta-notes').addEventListener('click', openAnnotSummary);
    g('notes-close') && g('notes-close').addEventListener('click', closeNotesModal);
    g('notes-modal') && g('notes-modal').addEventListener('click', function (e) {
      if (e.target === g('notes-modal')) closeNotesModal();
    });
    g('annot-ta') && g('annot-ta').addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveAnnot(); }
    });
    g('sidebar').addEventListener('click', function (e) {
      var h = e.target.closest('.sb-hist-item');
      if (h) { jumpToSection(+h.getAttribute('data-pi'), +h.getAttribute('data-si'), { origin: getJumpOrigin() }); }
    });
    g('reader-col') && g('reader-col').addEventListener('click', function (e) {
      var cb = e.target.closest('.cited-btn');
      if (cb) { jumpToSection(+cb.getAttribute('data-pi'), +cb.getAttribute('data-si'), { origin: getJumpOrigin() }); }
    });
    g('suggestions') && g('suggestions').addEventListener('click', function (e) {
      var b = e.target.closest('.suggest-btn');
      if (b) { jumpToSection(+b.getAttribute('data-pi'), +b.getAttribute('data-si'), { origin: getJumpOrigin() }); }
    });
    g('home-view') && g('home-view').addEventListener('click', function (e) {
      var b = e.target.closest('.path-btn');
      if (!b) return;
      var sid = b.getAttribute('data-open-id');
      var part = b.getAttribute('data-open-part');
      var resolvedId = resolveSectionId(sid);
      if (resolvedId && LOOK[resolvedId]) jumpToSection(LOOK[resolvedId].pi, LOOK[resolvedId].si, { origin: getJumpOrigin() });
      else if (part) openPartStart(part, { origin: getJumpOrigin() });
    });
    (function () {
      var h = resolveSectionId(location.hash.slice(1));
      if (h && LOOK[h]) { var inf = LOOK[h]; openSec(inf.pi, inf.si, true); }
    })();
    window.addEventListener('hashchange', function () {
      var h = resolveSectionId(location.hash.slice(1));
      if (h && LOOK[h]) { var inf = LOOK[h]; openSec(inf.pi, inf.si, true); }
      else if (!h) { nav('home'); }
    });
    document.addEventListener('click', function (e) {
      if (window.innerWidth > 680) return;
      var sb = g('sidebar');
      if (sbOpen && !sb.contains(e.target) && e.target !== g('sb-tog')) {
        sb.classList.remove('mob-open'); sb.classList.add('closed'); sbOpen = false;
      }
    });

    // --- JALUR KOMUNIKASI GLOBAL (AGAR ANTAR KAMAR BISA SALING MENDENGAR) ---
    window.PARTS = PARTS;
    window.LOOK = LOOK;
    window.REL = REL;
    window.GL = GL;
    window.openSec = openSec;
    window.jumpToSection = jumpToSection;
    window.jumpToSectionById = jumpToSectionById;
    window.openPartStart = openPartStart;
    window.getJumpOrigin = getJumpOrigin;
    window.resolveSectionId = resolveSectionId;
    window.esc = esc;
    window.nav = nav;
    window.showContentsPanel = showContentsPanel;

    // Rotating quotes
    (function () {
      var QUOTES = JSON.parse(document.getElementById('d-quotes').textContent);
      var bodyEl = document.getElementById('quote-body');
      var titleEl = document.getElementById('quote-title');
      var dotsEl = document.getElementById('quote-dots');
      var strip = document.getElementById('quote-strip');
      var togBtn = document.getElementById('quote-tog');
      if (!bodyEl) return;

      // Restore collapsed state
      var collapsed = localStorage.getItem('pmn-quotes-collapsed') === '1';
      if (collapsed) strip.classList.add('collapsed');
      togBtn.textContent = collapsed ? '+' : '\u2212';

      togBtn.addEventListener('click', function () {
        collapsed = !collapsed;
        strip.classList.toggle('collapsed', collapsed);
        togBtn.textContent = collapsed ? '+' : '\u2212';
        localStorage.setItem('pmn-quotes-collapsed', collapsed ? '1' : '0');
      });

      var cur = Math.floor(Math.random() * QUOTES.length);
      var timer;

      QUOTES.forEach(function (_, i) {
        var d = document.createElement('span');
        d.className = 'quote-dot' + (i === cur ? ' active' : '');
        d.addEventListener('click', function () { goTo(i, true); });
        dotsEl.appendChild(d);
      });

      function setDot(i) {
        dotsEl.querySelectorAll('.quote-dot').forEach(function (d, idx) {
          d.classList.toggle('active', idx === i);
        });
      }

      function showQuote(i) {
        bodyEl.textContent = QUOTES[i].body;
        titleEl.textContent = QUOTES[i].title;
        setDot(i);
      }

      function goTo(i, manual) {
        if (i === cur) return;
        bodyEl.classList.add('fade');
        titleEl.classList.add('fade');
        setTimeout(function () {
          cur = i;
          showQuote(cur);
          bodyEl.classList.remove('fade');
          titleEl.classList.remove('fade');
        }, 600);
        if (manual) { clearInterval(timer); startTimer(); }
      }

      function next() { goTo((cur + 1) % QUOTES.length, false); }
      function startTimer() { timer = setInterval(next, 18000); }

      showQuote(cur);
      startTimer();
    })();

  })(); // end main IIFE

  // =====================================================================
  // v84 SYNTHESIS: ANATOMY TERMINAL
  // Builds tabbed panels from PARTS data across all main parts
  // =====================================================================
  (function () {
    var PARTS = (function () { try { return JSON.parse(document.getElementById('d-parts').textContent); } catch (e) { return []; } })();
    var sb = document.getElementById('anatomy-sidebar');
    var ac = document.getElementById('anatomy-content');
    if (!sb || !ac || !PARTS.length) return;

    // Show all main parts (exclude backmatter)
    var SPECIAL_PARTS = ['Preface', 'Coda', 'Intellectual Debts', 'Bibliography'];
    var display = PARTS.filter(function (p) { return SPECIAL_PARTS.indexOf(p.part) < 0; });

    var tabsHtml = '', panelsHtml = '';
    display.forEach(function (part, i) {
      var id = 'ap-' + i;
      var partLabel = 'Part ' + part.part;
      tabsHtml += '<button class="anatomy-tab' + (i === 0 ? ' on' : '') + '" data-target="' + id + '">' + partLabel + '</button>';
      // Build section list from the first 8 subs
      var secList = '';
      var subs = part.subs.slice(0, 8);
      subs.forEach(function (s) {
        if (s.is_intro) return;
        secList += '<span style="display:block;font-family:var(--f-mono);font-size:.7rem;color:var(--acc);margin-bottom:.3rem">' + (s.id || '') + ' &mdash; ' + s.title + '</span>';
      });
      if (part.subs.length > 8) secList += '<span style="font-family:var(--f-mono);font-size:.65rem;color:var(--mute)">+ ' + (part.subs.length - 8) + ' more sections</span>';
      // Get a short description from the first real section's text
      var descText = '';
      for (var di = 0; di < part.subs.length; di++) {
        var ds = part.subs[di];
        if (!ds.is_intro && ds.html) {
          var plain = ds.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          descText = plain.slice(0, 200) + (plain.length > 200 ? '…' : '');
          break;
        }
      }
      panelsHtml += '<div class="anatomy-panel' + (i === 0 ? ' on' : '') + '" id="' + id + '">'
        + '<div class="ap-badge">' + partLabel.toUpperCase() + '</div>'
        + '<h3>' + part.title + '</h3>'
        + (descText ? '<p style="font-size:.9rem;color:var(--ink2);line-height:1.65;margin-bottom:1.2rem">' + descText + '</p>' : '')
        + '<div style="margin-top:.8rem">' + secList + '</div>'
        + '</div>';
    });

    sb.innerHTML = tabsHtml;
    ac.innerHTML = panelsHtml;

    sb.querySelectorAll('.anatomy-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sb.querySelectorAll('.anatomy-tab').forEach(function (b) { b.classList.remove('on'); });
        ac.querySelectorAll('.anatomy-panel').forEach(function (p) { p.classList.remove('on'); });
        btn.classList.add('on');
        var panel = document.getElementById(btn.getAttribute('data-target'));
        if (panel) { panel.classList.add('on'); ac.scrollTop = 0; }
      });
    });
  })();

  // =====================================================================
  // PMN UPGRADE: CSS INJECTION
  // =====================================================================
  (function () {
    var css = `
/* AI Mode Tabs */
.hai-tabs{display:flex;gap:0;border-bottom:1px solid var(--rule);margin-bottom:.8rem}
.hai-tab{font-family:var(--f-mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;background:transparent;border:none;border-bottom:2px solid transparent;padding:.45rem .9rem;cursor:pointer;color:var(--mute);transition:color .15s;margin-bottom:-1px}
.hai-tab:hover{color:var(--ink)}
.hai-tab.active{color:var(--acc);border-bottom-color:var(--acc)}
.hai-redirect-desc{font-family:var(--f-body);font-size:.88rem;color:var(--ink2);line-height:1.65;margin-bottom:.8rem}
/* Highlight system */
.pmn-hl{background:rgba(173,52,30,.18);border-bottom:1.5px solid var(--acc);cursor:pointer;transition:background .15s;border-radius:1px}
[data-theme=dark] .pmn-hl{background:rgba(192,39,26,.22);border-bottom-color:var(--acc)}
.pmn-hl:hover{background:rgba(173,52,30,.32)}
.pmn-hl.hl-blue{background:rgba(29,78,216,.15);border-bottom-color:#60a5fa}
.pmn-hl.hl-green{background:rgba(74,222,128,.15);border-bottom-color:#4ade80}
.pmn-hl.hl-yellow{background:rgba(250,204,21,.2);border-bottom-color:#facc15}
[data-theme=dark] .pmn-hl.hl-blue{background:rgba(29,78,216,.25)}
[data-theme=dark] .pmn-hl.hl-green{background:rgba(74,222,128,.18)}
[data-theme=dark] .pmn-hl.hl-yellow{background:rgba(250,204,21,.18)}
#hl-toolbar{position:fixed;display:none;z-index:8000;background:var(--bg);border:1px solid var(--rule);box-shadow:0 4px 16px rgba(0,0,0,.18);padding:.3rem .5rem;gap:.35rem;align-items:center;border-radius:2px}
#hl-toolbar.visible{display:flex}
.hl-btn{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform .12s;display:block;flex-shrink:0}
.hl-btn:hover{transform:scale(1.2)}
.hl-btn-red{background:rgba(173,52,30,.8);border-color:var(--acc)}
.hl-btn-blue{background:rgba(29,78,216,.7);border-color:#60a5fa}
.hl-btn-green{background:rgba(74,222,128,.7);border-color:#4ade80}
.hl-btn-yellow{background:rgba(250,204,21,.7);border-color:#facc15}
.hl-btn-remove{width:20px;height:20px;line-height:20px;text-align:center;cursor:pointer;color:var(--mute);font-family:var(--f-mono);font-size:.65rem;border:1px solid var(--rule);background:var(--bg2);flex-shrink:0}
.hl-btn-remove:hover{color:var(--acc);border-color:var(--acc)}
#hl-toolbar-note-in{width:130px;font-family:var(--f-mono);font-size:.68rem;background:var(--bg2);border:1px solid var(--rule);color:var(--ink);padding:.2rem .4rem;outline:none;min-width:0}
#hl-toolbar-note-in:focus{border-color:var(--acc)}
.hl-save-note{font-family:var(--f-mono);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;background:var(--acc);color:var(--bg);border:none;padding:.22rem .55rem;cursor:pointer;white-space:nowrap;flex-shrink:0}
.hl-count-badge{font-family:var(--f-mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--acc);background:var(--bg2);border:1px solid var(--rule2);padding:.25rem .6rem;border-radius:0;cursor:pointer;transition:color .15s,border-color .15s,background .15s;white-space:nowrap}
.hl-count-badge:hover{color:var(--ink);border-color:var(--acc);background:rgba(173,52,30,.06)}
[data-theme=dark] .hl-count-badge{background:#111}
/* Semantic search */
#semantic-badge{font-family:var(--f-mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);background:var(--bg2);border:1px solid var(--rule);padding:.2rem .5rem;cursor:pointer;transition:color .15s,border-color .15s;white-space:nowrap}
#semantic-badge:hover,#semantic-badge.active{color:var(--acc);border-color:var(--acc)}
.semantic-bar{background:var(--bg2);border-bottom:1px solid var(--rule);padding:.45rem 2.5rem;font-family:var(--f-mono);font-size:.68rem;color:var(--mute2);display:none}
.semantic-bar.visible{display:block}
.semantic-bar strong{color:var(--acc)}
/* Home chat */
.home-chat-log{min-height:90px;max-height:320px;overflow-y:auto;background:var(--bg2);border:1px solid var(--rule);padding:1rem 1.2rem;font-family:var(--f-mono);font-size:.8rem;line-height:1.6;color:var(--ink)}
[data-theme=dark] .home-chat-log{background:#000;border-color:var(--acc);box-shadow:inset 0 0 12px rgba(185,28,28,.08)}
.hcl-placeholder{color:var(--mute);font-style:italic}
.hcl-msg{margin-bottom:.7rem;padding-bottom:.7rem;border-bottom:1px solid var(--rule)}
.hcl-msg:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.hcl-role{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--mute2);margin-bottom:.25rem}
.hcl-role.user{color:var(--acc)}
.hcl-body{font-family:var(--f-body);font-size:.88rem;line-height:1.7;color:var(--ink2);white-space:pre-wrap}
.hcl-body.thinking{color:var(--mute);font-style:italic;animation:blink 1s infinite}
/* Reader chat */
.pmn-chat-log{min-height:60px;max-height:260px;overflow-y:auto;background:var(--bg2);border:1px solid var(--rule);padding:.8rem 1rem;font-family:var(--f-mono);font-size:.78rem;line-height:1.6;color:var(--ink);margin-bottom:.6rem}
.pmn-chat-msg{margin-bottom:.55rem;padding-bottom:.55rem;border-bottom:1px solid var(--rule)}
.pmn-chat-msg:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.pmn-chat-role{font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--mute2);margin-bottom:.2rem}
.pmn-chat-role.user{color:var(--acc2)}
.pmn-chat-body{font-family:var(--f-body);font-size:.85rem;line-height:1.65;color:var(--ink2);white-space:pre-wrap}
.pmn-chat-body.thinking{color:var(--mute);font-style:italic;animation:blink 1s infinite}
  `;
    var el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
  })();

  // =====================================================================
  // PMN UPGRADE: ALL DYNAMIC MODULES
  // =====================================================================
  (function () {

    // ── Shared: Claude API call ──
    function callClaude(messages, sysPrompt, onDone, onError) {
      var lastMsg = messages[messages.length - 1].content;

      // Extract query
      var q = lastMsg;
      if (q.indexOf('USER QUESTION:') >= 0) {
        var parts = q.split('USER QUESTION:');
        if (parts[1]) {
          q = parts[1].split('ACTIVE SECTION:')[0].split('RETRIEVED PMN PASSAGES:')[0].trim();
        }
      }

      // Get active section
      var activeId = null;
      if (lastMsg.indexOf('ACTIVE SECTION:') >= 0) {
        var match = lastMsg.match(/ACTIVE SECTION:\s*([0-9.a-zA-Z-]+)/);
        if (match && match[1]) activeId = match[1].trim();
      }

      ensureData();
      var pack = buildContextPack(q, {
        activeId: activeId,
        maxSections: 3,
        maxGlossary: 3
      });

      var response = generateLocalResponse(q, pack, activeId);

      // Simulate streaming typing
      var index = 0;
      var currentText = "";
      var words = response.split(" ");

      function stream() {
        if (index < words.length) {
          currentText += (index === 0 ? "" : " ") + words[index];
          index++;

          if (onDone) {
            onDone(currentText + "█");
          }

          var homeLog = document.getElementById('home-chat-log');
          if (homeLog) homeLog.scrollTop = homeLog.scrollHeight;
          var pmnLog = document.getElementById('pmn-chat-log');
          if (pmnLog) pmnLog.scrollTop = pmnLog.scrollHeight;

          setTimeout(stream, Math.random() * 20 + 25);
        } else {
          if (onDone) {
            onDone(currentText);
          }

          var homeLog = document.getElementById('home-chat-log');
          if (homeLog) {
            linkXrefs(homeLog);
            homeLog.scrollTop = homeLog.scrollHeight;
          }
          var pmnLog = document.getElementById('pmn-chat-log');
          if (pmnLog) {
            linkXrefs(pmnLog);
            pmnLog.scrollTop = pmnLog.scrollHeight;
          }
        }
      }

      setTimeout(stream, 700);
    }

    function generateLocalResponse(query, pack, activeId) {
      var q = query.toLowerCase();
      var response = "";

      if (q.indexOf('custodian') >= 0 || q.indexOf('asymmetry') >= 0 || q.indexOf('power') >= 0) {
        response = "### ✦ PMN DIALECTICAL ANALYSIS: THE CUSTODIAN PROBLEM\n\n"
          + "Under the **Progressive Materialist Naturalism (PMN)** architecture, power asymmetry is not merely a moral failure but a structural necessity of complex information networks. This is defined as **The Custodian Problem**.\n\n"
          + "According to **Part VI** and specifically **Section 3.4**, when an institutional arrangement designates a 'custodian' to manage resources or information, a structural asymmetry is established. Because the custodian has direct access to the source layer while the public only experiences the interface layer, information asymmetry inevitably emerges.\n\n"
          + "**Causal Diagnosis:**\n"
          + "1. *Structural Power:* The custodian leverages information asymmetry to secure its own survival (Descriptive Egoism).\n"
          + "2. *Legitimacy Capture:* The custodian rewrites the interface rules to declare its own preservation as the primary public good.\n\n"
          + "**Evaluative Recommendation:**\n"
          + "To resolve this, PMN recommends transitioning from custodian-dependency to direct material audits (see Section 10.1). You should study Section 3.4 for the foundational mechanics and Section 12.5 for the institutional failure modes.";
      }
      else if (q.indexOf('ought') >= 0 || q.indexOf('value') >= 0 || q.indexOf('suffering') >= 0 || q.indexOf('morality') >= 0) {
        response = "### ✦ PMN ONTOLOGICAL SYSTEM: THE IS-OUGHT BRIDGE\n\n"
          + "The transition from descriptive fact ('is') to evaluative commitment ('ought') is a core architecture of PMN, resolved through material biology rather than abstract metaphysics.\n\n"
          + "As outlined in **Axiom 1b** and **Section 3.0**, PMN anchors value in the **Biological Floor**. The experience of suffering has an inherently negative evaluative valence for any conscious organism. This is a descriptive fact.\n\n"
          + "**The Bridge Mechanics:**\n"
          + "1. *Universal Valence:* Since suffering is materially avoided by organisms, the reduction of structural suffering becomes the non-arbitrary anchor of our value system.\n"
          + "2. *Becoming:* Minimizing the floor enables the expansion of development (Becoming), which acts as the evaluative ceiling.\n\n"
          + "**Structural Linkages:**\n"
          + "Consult Section 3.0 for the three-level architecture (Life, Suffering, Becoming), and Section 3.3 for the instability caused by systemic suffering.";
      }
      else if (q.indexOf('start') >= 0 || q.indexOf('read') >= 0 || q.indexOf('begin') >= 0 || q.indexOf('guide') >= 0) {
        response = "### ✦ PMN ENTRY ORIENTATION\n\n"
          + "Welcome to the PMN Interactive Framework. The manuscript is structurally layered, meaning you do not have to read it linearly from start to finish. Here is your optimal entry strategy:\n\n"
          + "1. **Foundations (Part I & II):** If you prefer analytical rigor, begin with the metaphysics of material reality (Axiom 1a) and the layered constraint model (Section 2.2).\n"
          + "2. **Compressed Core (Section 15.15):** If you need a high-density operational summary of the entire framework in under 10 minutes, jump straight to Section 15.15.\n"
          + "3. **Power Analysis (Part VI):** To see how PMN diagnoses systemic power, custodian capture, and information bottlenecks, proceed directly to Part VI.\n"
          + "4. **Applied Action (Part XVII):** To explore the ethical demands PMN places on the individual holding it, read Part XVII.\n\n"
          + "Select 'Contents' in the top bar to choose your path, or jump straight to Section 15.15 to begin the core overview.";
      }
      else {
        var bestSec = (pack.sections && pack.sections[0]) ? pack.sections[0] : null;
        var bestGloss = (pack.glossary && pack.glossary[0]) ? pack.glossary[0] : null;

        response = "### ✦ PMN CONTEXTUAL SYNTHESIS\n\n"
          + "Analyzing your query through the lens of the Progressive Materialist Naturalism manuscript. ";

        if (bestSec) {
          response += "The most relevant architectural anchor is **Section " + bestSec.id + " (" + bestSec.title + ")** under **" + bestSec.part + "**.\n\n"
            + "**Manuscript Passage Analysis:**\n"
            + "The framework establishes that: \n"
            + "> \"" + truncate(bestSec.excerpt, 450).trim() + "...\"\n\n"
            + "This asserts that material processes are primary (source level) and emergent phenomena must be tracked through their causal dependencies.\n\n";
        } else {
          response += "The manuscript focuses on anchoring all conceptual claims in mind-independent material foundations, bypassing speculative abstractions.\n\n";
        }

        if (bestGloss) {
          response += "**Core Terminology:**\n"
            + "To understand this, you should master **" + bestGloss.term + "** (" + bestGloss.def + ").\n\n";
        }

        response += "**Analytical Conclusion:**\n"
          + "PMN tracks these processes using the *Layered Constraint Model* (ecological, biological, economic, institutional, meaning). Any proposed solution that violates a lower layer constraint will inevitably fail. ";

        if (bestSec) {
          response += "You are recommended to read Section " + bestSec.id + " to trace these causal mechanics further.";
        }
      }

      return response;
    }

    // ── Shared: get data ──
    var PARTS, LOOK, REL, GL;
    function ensureData() {
      if (!PARTS) {
        try { PARTS = JSON.parse(document.getElementById('d-parts').textContent); } catch (e) { PARTS = []; }
        try { LOOK = JSON.parse(document.getElementById('d-look').textContent); } catch (e) { LOOK = {}; }
        try { REL = JSON.parse(document.getElementById('d-rel').textContent); } catch (e) { REL = {}; }
        try { GL = JSON.parse(document.getElementById('d-gl').textContent); } catch (e) { GL = {}; }
      }
    }

    // Strip HTML tags, collapse whitespace, keep meaningful text
    function stripHtml(str) { return (str || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&mdash;/g, '—').replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/\s{2,}/g, ' ').trim(); }
    function truncate(str, n) { return stripHtml(str).slice(0, n); }

    // Extract full section text (used for redirect prompts — more content = better AI results)
    function fullText(s, maxChars) {
      return stripHtml(s.html || s.text || '').slice(0, maxChars || 3000);
    }

    function buildContextPack(query, opts) {
      ensureData();
      opts = opts || {};
      var q = (query || '').toLowerCase();
      var scored = [];
      for (var pi = 0; pi < PARTS.length; pi++) {
        var p = PARTS[pi];
        for (var si = 0; si < p.subs.length; si++) {
          var s = p.subs[si];
          var score = 0;
          var blob = ((s.title || '') + ' ' + stripHtml(s.html || '')).toLowerCase();
          if (q.length > 2 && blob.indexOf(q) >= 0) score += 3;
          q.split(/\s+/).filter(function (w) { return w.length > 3; }).forEach(function (w) { if (blob.indexOf(w) >= 0) score++; });
          if (opts.activeId && s.id === opts.activeId) score += 5;
          if (opts.relatedIds && opts.relatedIds.indexOf(s.id) >= 0) score += 4;
          if (opts.fallbackIds && opts.fallbackIds.indexOf(s.id) >= 0) score += 2;
          if (score > 0) scored.push({ pi: pi, si: si, s: s, p: p, score: score });
        }
      }
      scored.sort(function (a, b) { return b.score - a.score; });
      var maxSec = opts.maxSections || 5;
      var sections = scored.slice(0, maxSec).map(function (item) {
        return {
          id: item.s.id,
          title: item.s.title,
          part: 'Part ' + item.p.part,
          // Short excerpt for inline Claude (token-efficient)
          excerpt: truncate(item.s.html, 600),
          // Full text for redirect prompts (AI needs real content, not URLs)
          fullText: fullText(item.s, opts.fullTextChars || 2000)
        };
      });
      var glossary = [];
      if (q.length > 2) {
        Object.keys(GL || {}).forEach(function (term) {
          if (term.toLowerCase().indexOf(q) >= 0 || q.indexOf(term.toLowerCase()) >= 0)
            glossary.push({ term: term, def: (GL[term] || '').slice(0, 240) });
        });
        glossary = glossary.slice(0, opts.maxGlossary || 4);
      }
      return { sections: sections, glossary: glossary };
    }

    // formatPack for inline Claude — concise excerpts
    function formatPack(pack) {
      var lines = ['--- PMN CONTEXT ---'];
      (pack.sections || []).forEach(function (s, i) {
        lines.push('\n[' + s.id + '] ' + s.title + ' (' + s.part + ')');
        lines.push(s.excerpt);
      });
      if (pack.glossary && pack.glossary.length) {
        lines.push('\n--- GLOSSARY ---');
        pack.glossary.forEach(function (g) { lines.push('• ' + g.term + ': ' + g.def); });
      }
      lines.push('\n--- END OF CONTEXT ---');
      return lines.join('\n');
    }

    // formatPackFull — full text for redirect prompts (ChatGPT/Gemini can't open URLs)
    function formatPackFull(pack, activeSec) {
      var lines = [];
      lines.push('================================================================');
      lines.push('PMN — MANUSCRIPT EXTRACTS (Progressive Materialist Naturalism)');
      lines.push('Author: Nova Dharma | Framework: Adaptive Naturalism');
      lines.push('================================================================');
      lines.push('');
      lines.push('NOTE: The text below is extracted directly from the PMN manuscript embedded in this reader.');
      lines.push('Do NOT rely on URL or anchor browsing alone — read the text provided here.');
      lines.push('');

      // If there's an active section, put its FULL text first and prominently
      if (activeSec && activeSec.fullText) {
        lines.push('━━━ CURRENT SECTION (full text) ━━━');
        lines.push('[' + activeSec.id + '] ' + activeSec.title);
        lines.push('─────────────────────────────────────');
        lines.push(activeSec.fullText);
        lines.push('');
      }

      // Related sections
      var others = activeSec
        ? pack.sections.filter(function (s) { return s.id !== activeSec.id; })
        : pack.sections;

      if (others.length) {
        lines.push('━━━ RELATED SECTIONS ━━━');
        others.forEach(function (s) {
          lines.push('');
          lines.push('[' + s.id + '] ' + s.title + ' (' + s.part + ')');
          lines.push('─────────────────────────────────────');
          lines.push(s.fullText || s.excerpt);
        });
      }

      if (pack.glossary && pack.glossary.length) {
        lines.push('');
        lines.push('━━━ KEY TERMS ━━━');
        pack.glossary.forEach(function (g) {
          lines.push('• ' + g.term + ': ' + g.def);
        });
      }

      lines.push('');
      lines.push('================================================================');
      lines.push('END OF MANUSCRIPT EXTRACTS');
      lines.push('================================================================');
      return lines.join('\n');
    }

    var SYS = 'You are PMN Agent for Progressive Materialist Naturalism by Nova Dharma. Cite section IDs when relevant. Label inferences. Be concise (max 250 words). Use the PMN context pack as primary source.';

    var MODES = {
      agent: 'Apply PMN evaluative criterion. Connect adjacent sections when helpful.',
      diagnostic: 'Apply the seven diagnostic questions (11.0) and failure mode typology (12.5). Focus on rigorous diagnosis, not conclusions.',
      debate: 'Reconstruct the strongest PMN version of the argument. Then identify architectural incompleteness. Apply consistency standard 8.3.',
      oracle: 'FORMAT: [PMN REFERENCE] — ... [STRUCTURAL ANALYSIS] — ... [EVALUATIVE IMPLICATION] — ...'
    };

    function buildPrompt(mode, question, pack, activeSec) {
      var secInfo = activeSec ? '\nACTIVE SECTION: ' + activeSec.id + ' — ' + activeSec.title : '';
      return ['MODE: ' + (MODES[mode] || MODES.agent), secInfo, '', 'USER QUESTION:', question || 'Explain this section.', '', formatPack(pack)].join('\n');
    }

    // Build self-contained redirect prompt — no URLs, full text embedded
    function buildRedirectPrompt(mode, question, pack, activeSec) {
      var modeLabel = MODES[mode] || MODES.agent;
      var lines = [
        '# PMN Agent — Manuscript-Grounded Prompt',
        '',
        '## Your Role',
        'You are PMN Agent for Progressive Materialist Naturalism (PMN) by Nova Dharma.',
        'The manuscript text is provided below. Read it directly — do NOT open links or assume URL browsing is sufficient.',
        'When answering: cite section IDs (e.g. "[7.3]"), label inferences, be analytically precise.',
        '',
        '## Mode: ' + modeLabel,
        '',
        '## Question',
        question || 'Explain this section and its role in the PMN architecture.',
        '',
        '## Manuscript Text',
        formatPackFull(pack, activeSec),
        '',
        '## Instructions',
        '- Answer using ONLY the manuscript text above as your source.',
        '- Cite section IDs when making claims (e.g. "as [3.4] states...").',
        '- If the answer requires a section not provided, say so explicitly.',
        '- Label speculative extensions as "inference beyond the provided text".',
        activeSec ? '- The user is currently reading [' + activeSec.id + ']: ' + activeSec.title + '. Address this section first, then connect to others.' : ''
      ];
      return lines.filter(function (l) { return l !== false && l !== undefined; }).join('\n');
    }

    // ──────────────────────────────────────────────────────────────────
    // MODULE 1: HOME AI — Tabs + Claude inline + ChatGPT/Gemini
    // ──────────────────────────────────────────────────────────────────
    (function () {
      var tabs = document.querySelectorAll('#hai-tabs .hai-tab');
      var panels = { claude: document.getElementById('hai-panel-claude'), chatgpt: document.getElementById('hai-panel-chatgpt'), gemini: document.getElementById('hai-panel-gemini') };
      if (!tabs.length) return;
      function switchTab(mode) {
        tabs.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-mode') === mode); });
        Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].style.display = k === mode ? '' : 'none'; });
      }
      tabs.forEach(function (btn) { btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-mode')); }); });
      switchTab('chatgpt');
      var homeChatgptSwitch = document.getElementById('home-chatgpt-switch');
      var homeGeminiSwitch = document.getElementById('home-gemini-switch');
      if (homeChatgptSwitch) homeChatgptSwitch.addEventListener('click', function () {
        switchTab('chatgpt');
        var q = document.getElementById('hai-chatgpt-q');
        if (q) q.focus();
      });
      if (homeGeminiSwitch) homeGeminiSwitch.addEventListener('click', function () {
        switchTab('gemini');
        var q = document.getElementById('hai-gemini-q');
        if (q) q.focus();
      });

      // Claude inline
      var chatLog = document.getElementById('home-chat-log');
      var inp = document.getElementById('home-ai-input');
      var btn = document.getElementById('home-ai-btn');
      var clearBtn = document.getElementById('home-chat-clear');
      var exportBtn = document.getElementById('home-ai-export');
      var history = [];

      function appendMsg(role, text, thinking) {
        var ph = chatLog && chatLog.querySelector('.hcl-placeholder');
        if (ph) ph.remove();
        var div = document.createElement('div');
        div.className = 'hcl-msg';
        div.innerHTML = '<div class="hcl-role' + (role === 'user' ? ' user' : '') + '">' + ((role === 'user') ? 'You' : 'PMN Agent') + '</div><div class="hcl-body' + (thinking ? ' thinking' : '') + '"></div>';
        div.querySelector('.hcl-body').textContent = text;
        chatLog.appendChild(div);
        chatLog.scrollTop = chatLog.scrollHeight;
        return div.querySelector('.hcl-body');
      }

      function ask() {
        if (!inp) return;
        var q = inp.value.trim(); if (!q) return;
        inp.value = ''; if (btn) { btn.disabled = true; btn.textContent = '…'; }
        appendMsg('user', q);
        history.push({ role: 'user', content: q });
        var thinkEl = appendMsg('assistant', 'Retrieving PMN context…', true);
        var pack = buildContextPack(q, { maxSections: 5, maxGlossary: 5, fallbackIds: ['how-to-read-this-document', '3.0', '6.1', '10.1', '15.15', '17.0'] });
        var userMsg = buildPrompt('agent', q, pack, null);
        var msgs = history.slice(0, -1).concat([{ role: 'user', content: userMsg }]);
        callClaude(msgs, SYS, function (text) {
          thinkEl.className = 'hcl-body'; thinkEl.textContent = text;
          history.push({ role: 'assistant', content: text });
          if (btn) { btn.disabled = true; btn.textContent = 'Backend required'; }
          chatLog.scrollTop = chatLog.scrollHeight;
        }, function (err) {
          thinkEl.className = 'hcl-body'; thinkEl.textContent = 'Error: ' + err;
          if (btn) { btn.disabled = true; btn.textContent = 'Backend required'; }
        });
      }

      if (btn) btn.addEventListener('click', ask);
      if (inp) inp.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); ask(); } });
      if (clearBtn) clearBtn.addEventListener('click', function () {
        history = [];
        if (chatLog) chatLog.innerHTML = '<div class="hcl-placeholder">&gt;&gt; STATIC BUILD DETECTED — inline provider is parked until a secure backend is connected.<br>&gt;&gt; Use ChatGPT/Gemini tabs for grounded handoff, or open the PMN Agent Guide below.</div>';
      });
      if (exportBtn) exportBtn.addEventListener('click', function () {
        if (!history.length) return;
        var txt = history.map(function (m) { return (m.role === 'user' ? 'YOU: ' : 'PMN AGENT: ') + m.content; }).join('\n\n---\n\n');
        navigator.clipboard.writeText(txt).then(function () { var o = exportBtn.textContent; exportBtn.textContent = 'Copied!'; setTimeout(function () { exportBtn.textContent = o; }, 1800); });
      });

      // ChatGPT / Gemini redirect — full manuscript text embedded, no URL dependency
      function setupRedirect(qId, btnId, cpyId, statId, modeId, url) {
        var qEl = document.getElementById(qId), rbtn = document.getElementById(btnId), cpyBtn = document.getElementById(cpyId), stat = document.getElementById(statId), modeSel = document.getElementById(modeId);
        if (!rbtn) return;
        function go(openWin) {
          var q = (qEl && qEl.value.trim()) || 'Give me an orientation to PMN and tell me where to start.';
          var mode = modeSel ? modeSel.value : 'agent';
          // fullTextChars: more text per section so AI has real content to work with
          var pack = buildContextPack(q, { maxSections: 5, maxGlossary: 6, fullTextChars: 2500, fallbackIds: ['how-to-read-this-document', '3.0', '6.1', '10.1', '15.15', '17.0'] });
          var full = buildRedirectPrompt(mode, q, pack, null);
          var win = openWin ? window.open(url, '_blank', 'noopener') : null;
          navigator.clipboard.writeText(full).then(function () {
            var chars = full.length;
            var kb = Math.round(chars / 1024);
            if (stat) stat.textContent = openWin
              ? 'Prompt copied (' + pack.sections.length + ' sections, ~' + kb + 'KB of manuscript text). Paste into ' + url.split('/')[2] + '.'
              : 'Copied (' + pack.sections.length + ' sections, ~' + kb + 'KB). Paste into any AI.';
            if (qEl) qEl.value = '';
          }).catch(function () { if (stat) stat.textContent = 'Clipboard blocked. Try copy-only.'; });
          if (openWin && !win && stat) stat.textContent = 'Pop-up blocked. Open the site manually and paste.';
        }
        rbtn.addEventListener('click', function () { go(true); });
        if (cpyBtn) cpyBtn.addEventListener('click', function () { go(false); });
        if (qEl) qEl.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(true); } });
      }
      setupRedirect('hai-chatgpt-q', 'hai-chatgpt-btn', 'hai-chatgpt-copy', 'hai-chatgpt-status', 'hai-chatgpt-mode', 'https://chatgpt.com/');
      setupRedirect('hai-gemini-q', 'hai-gemini-btn', 'hai-gemini-copy', 'hai-gemini-status', 'hai-gemini-mode', 'https://gemini.google.com/app');
    })();

    // ──────────────────────────────────────────────────────────────────
    // MODULE 2: READER AI — Tabs + Claude inline + ChatGPT/Gemini
    // ──────────────────────────────────────────────────────────────────
    (function () {
      var tabs = document.querySelectorAll('#reader-hai-tabs .hai-tab');
      var panels = { claude: document.getElementById('reader-panel-claude'), chatgpt: document.getElementById('reader-panel-chatgpt'), gemini: document.getElementById('reader-panel-gemini') };
      if (!tabs.length) return;
      function switchTab(mode) {
        tabs.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-rmode') === mode); });
        Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].style.display = k === mode ? '' : 'none'; });
      }
      tabs.forEach(function (btn) { btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-rmode')); }); });
      switchTab('chatgpt');
      var readerChatgptSwitch = document.getElementById('reader-chatgpt-switch');
      var readerGeminiSwitch = document.getElementById('reader-gemini-switch');
      if (readerChatgptSwitch) readerChatgptSwitch.addEventListener('click', function () {
        switchTab('chatgpt');
        var q = document.getElementById('reader-chatgpt-q');
        if (q) q.focus();
      });
      if (readerGeminiSwitch) readerGeminiSwitch.addEventListener('click', function () {
        switchTab('gemini');
        var q = document.getElementById('reader-gemini-q');
        if (q) q.focus();
      });

      var chatLog = document.getElementById('pmn-chat-log');
      var chatIn = document.getElementById('pmn-chat-in');
      var sendBtn = document.getElementById('pmn-chat-send');
      var clearBtn = document.getElementById('pmn-chat-clear');
      var rHistory = [];

      function getActiveSec() {
        if (window._pmnParts && window._pmnCurP !== undefined) {
          var p = window._pmnParts[window._pmnCurP];
          return p && p.subs[window._pmnCurS] || null;
        }
        return null;
      }

      function appendMsg(role, text, thinking) {
        if (!chatLog) return null;
        var div = document.createElement('div');
        div.className = 'pmn-chat-msg';
        div.innerHTML = '<div class="pmn-chat-role' + (role === 'user' ? ' user' : '') + '">' + ((role === 'user') ? 'You' : 'Agent') + '</div><div class="pmn-chat-body' + (thinking ? ' thinking' : '') + '"></div>';
        div.querySelector('.pmn-chat-body').textContent = text;
        chatLog.appendChild(div);
        chatLog.scrollTop = chatLog.scrollHeight;
        return div.querySelector('.pmn-chat-body');
      }

      function ask() {
        if (!chatIn) return;
        var q = chatIn.value.trim(); if (!q) return;
        chatIn.value = ''; if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '…'; }
        appendMsg('user', q);
        rHistory.push({ role: 'user', content: q });
        var thinkEl = appendMsg('assistant', 'Analyzing…', true);
        var activeSec = getActiveSec();
        var relIds = activeSec ? (window._pmnRel && window._pmnRel[activeSec.id] || []).slice(0, 4) : [];
        var pack = buildContextPack(q, { activeId: activeSec && activeSec.id, relatedIds: relIds, maxSections: 4, maxGlossary: 4 });
        var userMsg = buildPrompt('agent', q, pack, activeSec);
        var msgs = rHistory.slice(0, -1).concat([{ role: 'user', content: userMsg }]);
        callClaude(msgs, SYS, function (text) {
          thinkEl.className = 'pmn-chat-body'; thinkEl.textContent = text;
          rHistory.push({ role: 'assistant', content: text });
          if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Backend required'; }
          chatLog.scrollTop = chatLog.scrollHeight;
        }, function (err) {
          thinkEl.className = 'pmn-chat-body'; thinkEl.textContent = 'Error: ' + err;
          if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Backend required'; }
        });
      }

      if (sendBtn) sendBtn.addEventListener('click', ask);
      if (chatIn) chatIn.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); ask(); } });
      if (clearBtn) clearBtn.addEventListener('click', function () {
        rHistory = [];
        if (chatLog) chatLog.innerHTML = '&gt;&gt; INLINE BACKEND MODE IS NOT LIVE IN THIS STATIC BUILD.<br>&gt;&gt; Use ChatGPT/Gemini handoff for grounded answers, or connect a secure backend for in-page replies.';
      });

      // Reader ChatGPT/Gemini — embeds full active section text, no URL needed
      function setupReaderRedirect(qId, btnId, cpyId, statId, modeId, url) {
        var qEl = document.getElementById(qId), rbtn = document.getElementById(btnId), cpyBtn = document.getElementById(cpyId), stat = document.getElementById(statId), modeSel = document.getElementById(modeId);
        if (!rbtn) return;
        function go(openWin) {
          var activeSec = getActiveSec();
          var relIds = activeSec ? (window._pmnRel && window._pmnRel[activeSec.id] || []).slice(0, 4) : [];
          var q = (qEl && qEl.value.trim()) || 'Explain this section and its role in PMN.';
          var mode = modeSel ? modeSel.value : 'agent';
          // Build active section object with full text
          var activeSecFull = null;
          if (activeSec) {
            activeSecFull = {
              id: activeSec.id,
              title: activeSec.title,
              fullText: fullText(activeSec, 4000) // Full active section up to 4000 chars
            };
          }
          var pack = buildContextPack(q, {
            activeId: activeSec && activeSec.id,
            relatedIds: relIds,
            maxSections: 4,
            maxGlossary: 5,
            fullTextChars: 2000
          });
          var full = buildRedirectPrompt(mode, q, pack, activeSecFull);
          var win = openWin ? window.open(url, '_blank', 'noopener') : null;
          navigator.clipboard.writeText(full).then(function () {
            var chars = full.length;
            var kb = Math.round(chars / 1024);
            if (stat) stat.textContent = openWin
              ? 'Prompt copied (~' + kb + 'KB with full section text). Paste into ' + url.split('/')[2] + '.'
              : 'Copied (~' + kb + 'KB of manuscript text). Paste into any AI.';
            if (qEl) qEl.value = '';
          }).catch(function () { if (stat) stat.textContent = 'Clipboard blocked.'; });
          if (openWin && !win && stat) stat.textContent = 'Pop-up blocked. Open manually and paste.';
        }
        rbtn.addEventListener('click', function () { go(true); });
        if (cpyBtn) cpyBtn.addEventListener('click', function () { go(false); });
        if (qEl) qEl.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(true); } });
      }
      setupReaderRedirect('reader-chatgpt-q', 'reader-chatgpt-btn', 'reader-copy-btn', 'reader-chatgpt-status', 'reader-chatgpt-mode', 'https://chatgpt.com/');
      setupReaderRedirect('reader-gemini-q', 'reader-gemini-btn', 'reader-gemini-copy', 'reader-gemini-status', 'reader-gemini-mode', 'https://gemini.google.com/app');

      // Expose clear for section switching
      window._pmnClearReaderChat = function () { rHistory = []; if (chatLog) chatLog.innerHTML = ''; };
    })();

    // ──────────────────────────────────────────────────────────────────
    // MODULE 3: HIGHLIGHT & ANNOTATE
    // ──────────────────────────────────────────────────────────────────
    (function () {
      var HL_KEY = 'pmn-hl-v3';
      var highlights = {};
      function loadHL() { try { highlights = JSON.parse(localStorage.getItem(HL_KEY) || '{}'); } catch (e) { highlights = {}; } }
      function saveHL() { try { localStorage.setItem(HL_KEY, JSON.stringify(highlights)); } catch (e) { } }
      loadHL();

      var toolbar = document.createElement('div');
      toolbar.id = 'hl-toolbar';
      toolbar.innerHTML = '<button class="hl-btn hl-btn-red" data-color="red" title="Red"></button><button class="hl-btn hl-btn-blue" data-color="blue" title="Blue"></button><button class="hl-btn hl-btn-green" data-color="green" title="Green"></button><button class="hl-btn hl-btn-yellow" data-color="yellow" title="Yellow"></button><input id="hl-toolbar-note-in" placeholder="Add note…" autocomplete="off"/><button class="hl-save-note" id="hl-save-note-btn">Save</button><span class="hl-btn-remove" id="hl-remove-btn" title="Remove">✕</span>';
      document.body.appendChild(toolbar);

      var curSel = null, editHlId = null;

      function hideToolbar() { toolbar.classList.remove('visible'); curSel = null; editHlId = null; }
      function showToolbar(x, y, noteVal) {
        toolbar.style.left = Math.min(x, window.innerWidth - 280) + 'px';
        toolbar.style.top = (y - 50) + 'px';
        document.getElementById('hl-toolbar-note-in').value = noteVal || '';
        toolbar.classList.add('visible');
      }

      document.addEventListener('mouseup', function (e) {
        if (toolbar.contains(e.target)) return;
        var prose = document.getElementById('prose');
        if (!prose || !prose.contains(e.target)) { setTimeout(function () { var sel = window.getSelection(); if (!sel || sel.isCollapsed) hideToolbar(); }, 100); return; }
        setTimeout(function () {
          var sel = window.getSelection();
          if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
          var text = sel.toString().trim();
          if (text.length < 3 || text.length > 600) return;
          var range = sel.getRangeAt(0);
          if (!prose.contains(range.commonAncestorContainer)) return;
          curSel = { text: text, range: range.cloneRange() };
          editHlId = null;
          var rect = range.getBoundingClientRect();
          showToolbar(rect.left + window.scrollX, rect.top + window.scrollY);
        }, 15);
      });

      function getSecId() {
        if (window._pmnParts && window._pmnCurP !== undefined) {
          var p = window._pmnParts[window._pmnCurP];
          var s = p && p.subs[window._pmnCurS];
          return s && s.id;
        }
        return null;
      }

      function wrapSpan(range, hlId, color, note) {
        try {
          var span = document.createElement('span');
          span.className = 'pmn-hl' + (color !== 'red' ? ' hl-' + color : '');
          span.setAttribute('data-hl-id', hlId);
          span.title = note ? '📝 ' + note : 'Click to annotate';
          range.surroundContents(span);
          attachSpanClick(span, hlId);
        } catch (ex) { }
      }

      function attachSpanClick(span, hlId) {
        span.addEventListener('click', function (e) {
          e.stopPropagation();
          editHlId = hlId; curSel = null;
          var secId = getSecId();
          var hl = (highlights[secId] || []).find(function (h) { return h.id === hlId; });
          var rect = span.getBoundingClientRect();
          showToolbar(rect.left + window.scrollX, rect.top + window.scrollY, hl && hl.note || '');
        });
      }

      function applyHL(color, note) {
        if (!curSel) return;
        var secId = getSecId(); if (!secId) return;
        var hlId = 'hl-' + Date.now() + '-' + Math.random().toString(16).slice(2, 6);
        if (!highlights[secId]) highlights[secId] = [];
        highlights[secId].push({ id: hlId, text: curSel.text, color: color, note: note || '' });
        saveHL();
        wrapSpan(curSel.range, hlId, color, note);
        window.getSelection().removeAllRanges();
        hideToolbar();
        updateBadge(secId);
      }

      toolbar.querySelectorAll('.hl-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var color = btn.getAttribute('data-color');
          var note = document.getElementById('hl-toolbar-note-in').value.trim();
          if (editHlId) {
            var secId = getSecId();
            var hl = (highlights[secId] || []).find(function (h) { return h.id === editHlId; });
            if (hl) { hl.color = color; saveHL(); }
            var sp = document.querySelector('[data-hl-id="' + editHlId + '"]');
            if (sp) sp.className = 'pmn-hl' + (color !== 'red' ? ' hl-' + color : '');
            hideToolbar();
          } else { applyHL(color, note); }
        });
      });

      document.getElementById('hl-save-note-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        var note = document.getElementById('hl-toolbar-note-in').value.trim();
        var secId = getSecId();
        if (editHlId && secId) {
          var hl = (highlights[secId] || []).find(function (h) { return h.id === editHlId; });
          if (hl) { hl.note = note; saveHL(); }
          var sp = document.querySelector('[data-hl-id="' + editHlId + '"]');
          if (sp) sp.title = note ? '📝 ' + note : 'Click to annotate';
          hideToolbar();
        } else if (curSel) { applyHL('red', note); }
      });

      document.getElementById('hl-remove-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        var secId = getSecId();
        if (editHlId && secId) {
          highlights[secId] = (highlights[secId] || []).filter(function (h) { return h.id !== editHlId; });
          saveHL();
          var sp = document.querySelector('[data-hl-id="' + editHlId + '"]');
          if (sp) { var par = sp.parentNode; while (sp.firstChild) par.insertBefore(sp.firstChild, sp); par.removeChild(sp); }
          updateBadge(secId);
        }
        hideToolbar();
      });

      // Add badge to reader tools
      var readerTools = document.querySelector('.reader-tools');
      if (readerTools) {
        var group = document.createElement('div');
        group.className = 'reader-tools-group';
        var lbl = document.createElement('span');
        lbl.className = 'reader-tools-lbl';
        lbl.textContent = 'Highlights';
        var badge = document.createElement('button');
        badge.id = 'hl-count-badge';
        badge.className = 'hl-count-badge';
        badge.textContent = 'Highlights';
        badge.title = 'View highlights for this section';
        badge.addEventListener('click', function () { showHlModal(); });
        group.appendChild(lbl);
        group.appendChild(badge);
        readerTools.insertBefore(group, readerTools.firstChild);
      }

      function updateBadge(secId) {
        var badge = document.getElementById('hl-count-badge');
        if (!badge) return;
        var n = (highlights[secId] || []).length;
        badge.textContent = n ? n + ' highlight' + (n > 1 ? 's' : '') : 'Highlights';
      }

      function showHlModal() {
        var secId = getSecId();
        var sHls = highlights[secId] || [];
        var modal = document.getElementById('notes-modal'), body = document.getElementById('notes-body');
        if (!modal || !body) return;
        if (!sHls.length) {
          body.innerHTML = '<p style="font-family:Lora,serif;font-style:italic;color:var(--mute);padding:1rem 0">No highlights in this section. Select text in the reader to highlight it.</p>';
        } else {
          var colors = { red: 'var(--acc)', blue: '#60a5fa', green: '#4ade80', yellow: '#facc15' };
          body.innerHTML = sHls.map(function (h) {
            var dot = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + (colors[h.color] || colors.red) + ';margin-right:.4rem;vertical-align:middle"></span>';
            return '<div style="margin-bottom:1.4rem;padding-bottom:1.4rem;border-bottom:1px solid var(--rule)">' + dot + '<span style="font-family:Lora,serif;font-size:.9rem;color:var(--ink2);font-style:italic">&ldquo;' + h.text.slice(0, 120) + (h.text.length > 120 ? '…' : '') + '&rdquo;</span>' + (h.note ? '<div style="font-family:Source Code Pro,monospace;font-size:.75rem;color:var(--mute);margin-top:.3rem;margin-left:1.2rem">📝 ' + h.note + '</div>' : '') + '</div>';
          }).join('');
        }
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      }

      function renderHL(secId) {
        var prose = document.getElementById('prose');
        if (!prose || !secId) return;
        var sHls = highlights[secId] || [];
        if (!sHls.length) return;
        var html = prose.innerHTML;
        sHls.forEach(function (hl) {
          var esc = hl.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var cls = 'pmn-hl' + (hl.color && hl.color !== 'red' ? ' hl-' + hl.color : '');
          var titleAttr = hl.note ? 'title="📝 ' + hl.note.replace(/"/g, '&quot;') + '"' : '';
          // Only replace first occurrence to avoid double-wrapping
          html = html.replace(new RegExp('(?<![\'"=>])(' + esc + ')(?![^<]*>)'), '<span class="' + cls + '" data-hl-id="' + hl.id + '" ' + titleAttr + '>$1</span>');
        });
        prose.innerHTML = html;
        prose.querySelectorAll('[data-hl-id]').forEach(function (sp) {
          attachSpanClick(sp, sp.getAttribute('data-hl-id'));
        });
      }

      // Expose for section hook
      window._pmnRenderHL = function (secId) { renderHL(secId); updateBadge(secId); };
    })();

    // ──────────────────────────────────────────────────────────────────
    // MODULE 4: SEMANTIC SEARCH
    // ──────────────────────────────────────────────────────────────────
    (function () {
      var srchIn = document.getElementById('srch-in');
      var svHdr = document.getElementById('sv-hdr');
      var svBody = document.getElementById('sv-body');
      if (!srchIn || !svBody) return;

      // Inject local ranking badge into header
      var badge = document.createElement('button');
      badge.id = 'semantic-badge';
      badge.textContent = 'Deep scan ✦';
      badge.title = 'Toggle deeper local ranking for manuscript search';
      var hdrR = document.getElementById('hdr-r');
      if (hdrR) hdrR.insertBefore(badge, hdrR.firstChild);

      var semanticOn = false;
      badge.addEventListener('click', function () {
        semanticOn = !semanticOn;
        badge.classList.toggle('active', semanticOn);
        badge.textContent = semanticOn ? 'Deep scan ✦ ON' : 'Deep scan ✦';
      });

      // Inject semantic bar above sv-body
      var semBar = document.createElement('div');
      semBar.className = 'semantic-bar';
      semBar.id = 'sem-bar';
      svBody.parentNode.insertBefore(semBar, svBody);

      var semTimer = null;
      srchIn.addEventListener('input', function () {
        var q = srchIn.value.trim();
        if (!semanticOn || q.length < 4) { semBar.classList.remove('visible'); return; }
        clearTimeout(semTimer);
        semBar.textContent = '✦ Deep scan: locally ranking "' + q + '"…';
        semBar.classList.add('visible');
        semTimer = setTimeout(function () { doSemantic(q); }, 700);
      });

      function doSemantic(q) {
        ensureData();
        var scored = [];
        for (var pi = 0; pi < PARTS.length; pi++) {
          var p = PARTS[pi];
          for (var si = 0; si < p.subs.length; si++) {
            var s = p.subs[si];
            var blob = ((s.title || '') + ' ' + (s.html || '')).toLowerCase().replace(/<[^>]+>/g, ' ');
            var score = 0;
            q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 2; }).forEach(function (w) {
              var i = blob.indexOf(w);
              while (i >= 0 && score < 30) { score++; i = blob.indexOf(w, i + 1); }
            });
            Object.keys(GL || {}).forEach(function (term) {
              if (q.toLowerCase().indexOf(term.toLowerCase()) >= 0 && blob.indexOf(term.toLowerCase()) >= 0) score += 3;
            });
            if (score > 0) scored.push({ pi: pi, si: si, s: s, p: p, score: score });
          }
        }
        scored.sort(function (a, b) { return b.score - a.score; });
        var top = scored.slice(0, 8);
        if (!top.length) { semBar.textContent = 'No results for "' + q + '"'; return; }
        semBar.innerHTML = '✦ Deep scan: <strong>' + top.length + '</strong> locally ranked matches';
        renderSemantic(q, top);
      }

      function renderSemantic(q, results) {
        var tocPanel = document.getElementById('toc-panel');
        if (tocPanel) tocPanel.style.display = 'none';
        svBody.style.display = '';
        if (svHdr) svHdr.textContent = 'Deep scan: "' + q + '"';
        var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        var h = results.map(function (item) {
          var snip = truncate(item.s.html, 200).replace(re, '<mark>$1</mark>');
          var pt = (['Preface', 'Coda', 'Intellectual Debts', 'Bibliography'].indexOf(item.p.part) >= 0) ? item.p.part : 'Part ' + item.p.part;
          return '<button class="res" data-pi="' + item.pi + '" data-si="' + item.si + '"><span class="res-loc">' + pt + ' — ' + item.s.id + '</span><div class="res-title">' + item.s.title + '</div><div class="res-snip">' + snip + '</div></button>';
        }).join('');
        svBody.innerHTML = h || '<p class="empty">No results.</p>';
      }
    })();

    // ──────────────────────────────────────────────────────────────────
    // WIRE UP: expose globals + hook section opens
    // ──────────────────────────────────────────────────────────────────
    // Daftarkan fungsi asisten agar bisa dipakai di luar kamar AI
    window.buildContextPack = buildContextPack;
    window.ensureData = ensureData;
    window.stripHtml = stripHtml;

    setTimeout(function () {
      if (window.ensureData) window.ensureData();
      window._pmnParts = window.PARTS || PARTS;
      window._pmnRel = window.REL || REL;

      // Hubungkan fungsi navigasi secara global
      if (typeof window.openSec === 'function' && !window._pmnOpenSecPatched) {
        window._pmnOpenSecPatched = true;
        var _orig = window.openSec;
        window.openSec = function (pi, si, nohash) {
          window._pmnCurP = pi;
          window._pmnCurS = si;
          _orig(pi, si, nohash);
          setTimeout(function () {
            var p = window._pmnParts[pi], s = p && p.subs[si];
            if (s) {
              if (window._pmnRenderHL) window._pmnRenderHL(s.id);
              if (window._pmnClearReaderChat) window._pmnClearReaderChat();
            }
          }, 80);
        };
      }
    }, 400);

  })(); // end upgrade IIFE
  // ── Core Axioms accordion ──
  (function () {
    var list = document.getElementById('theses-list');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var toggle = e.target.closest('.thesis-toggle');
      if (!toggle) return;
      var item = toggle.closest('.thesis-item');
      if (!item) return;
      var isOpen = item.classList.contains('open');
      // Close all
      list.querySelectorAll('.thesis-item').forEach(function (i) { i.classList.remove('open'); });
      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
  })();


  // =====================================================================
  (function () {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, particles = [];
    var mouse = { x: null, y: null, radius: 120 };
    var isHome = true;
    var animId = null;

    function getHero() { return document.querySelector('.hero'); }

    function resize() {
      var hero = getHero();
      if (hero && hero.offsetWidth > 0) {
        w = canvas.width = hero.offsetWidth;
        h = canvas.height = hero.offsetHeight;
      } else {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
      // Reinit particles on resize so they fill new dimensions
      if (particles.length > 0) init();
    }

    window.addEventListener('resize', resize);

    // Canvas has pointer-events:none so we listen on window and convert coords
    function updateMouse(e) {
      var rect = canvas.getBoundingClientRect();
      // Only active if cursor is within the hero canvas area
      var cx = e.clientX - rect.left;
      var cy = e.clientY - rect.top;
      if (cx >= 0 && cx <= rect.width && cy >= 0 && cy <= rect.height) {
        mouse.x = cx;
        mouse.y = cy;
      } else {
        mouse.x = null;
        mouse.y = null;
      }
    }
    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('mouseout', function () { mouse.x = null; mouse.y = null; });

    function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

    function Particle() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2.8 + 0.8;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.sizeSeed = Math.random() * 100;
    }
    Particle.prototype.update = function () {
      // Organic sine-wave drift
      this.x += this.vx + Math.sin(this.y * 0.008 + this.sizeSeed) * 0.22;
      this.y += this.vy + Math.cos(this.x * 0.008 + this.sizeSeed) * 0.22;

      // Bounce off canvas edges
      if (this.x > w) { this.x = w; this.vx = -Math.abs(this.vx); }
      if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx); }
      if (this.y > h) { this.y = h; this.vy = -Math.abs(this.vy); }
      if (this.y < 0) { this.y = 0; this.vy = Math.abs(this.vy); }

      // Mouse repulsion
      if (mouse.x != null) {
        var dx = mouse.x - this.x, dy = mouse.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          var force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3.5;
          this.y -= (dy / dist) * force * 3.5;
        }
      }
    };
    Particle.prototype.draw = function (index) {
      var dark = isDark();
      var col = dark ? 'rgba(192,39,26,0.85)' : 'rgba(184,58,27,0.7)';
      var glow = dark ? 'rgba(239,68,68,0.7)' : 'rgba(220,38,38,0.5)';

      // Size breathing effect
      var currentSize = this.size + Math.sin(Date.now() * 0.0016 + this.sizeSeed) * 0.35;
      currentSize = Math.max(0.4, currentSize);

      ctx.save();
      ctx.fillStyle = col;
      ctx.beginPath();
      // Glowing shadow effect for particles!
      ctx.shadowBlur = dark ? 6 : 4;
      ctx.shadowColor = glow;
      ctx.arc(this.x, this.y, currentSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Connect to nearby mouse
      if (mouse.x != null) {
        var dx = mouse.x - this.x, dy = mouse.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius * 0.85) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / (mouse.radius * 0.85)) * 0.35;
          ctx.strokeStyle = dark ? 'rgba(239,68,68,0.45)' : 'rgba(184,58,27,0.35)';
          ctx.lineWidth = 0.75;
          ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Connect particles to each other (glowing neural network/constellation!)
      for (var j = index + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var dx2 = this.x - p2.x, dy2 = this.y - p2.y;
        var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist2 < 82) {
          ctx.save();
          ctx.globalAlpha = (1 - dist2 / 82) * (dark ? 0.22 : 0.16);
          ctx.strokeStyle = dark ? 'rgba(192,39,26,0.35)' : 'rgba(184,58,27,0.22)';
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    function init() {
      particles = [];
      var n = Math.min(Math.floor((w * h) / 6000), 200);
      n = Math.max(n, 80); // minimum 80 particles
      for (var i = 0; i < n; i++) particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      if (!isHome) { animId = null; return; }
      particles.forEach(function (p, i) { p.update(); p.draw(i); });
      animId = requestAnimationFrame(animate);
    }

    function checkView() {
      var hv = document.getElementById('home-view');
      var wasHome = isHome;
      isHome = !!(hv && hv.classList.contains('on'));
      if (isHome && !wasHome && animId === null) {
        resize(); // Recalculate canvas size when returning to home
        animate();
      }
    }

    // MutationObserver to detect view switches
    var obs = new MutationObserver(checkView);
    document.querySelectorAll('.view').forEach(function (v) {
      obs.observe(v, { attributes: true, attributeFilter: ['class'] });
    });

    // Defer initial setup until DOM is fully rendered
    setTimeout(function () {
      resize();
      init();
      checkView();
      if (isHome) animate();
    }, 100);

    // --- PMN Custom UI Enhancements ---
    // 1. Reading Progress Bar
    const progressBar = document.getElementById('reading-progress');
    const readerMain = document.getElementById('reader-main');
    function updateProgress() {
      if (!progressBar) return;
      let scrollPos = 0, totalHeight = 0;
      if (readerMain && readerMain.scrollHeight > readerMain.clientHeight) {
        scrollPos = readerMain.scrollTop;
        totalHeight = readerMain.scrollHeight - readerMain.clientHeight;
      } else {
        scrollPos = window.scrollY;
        totalHeight = document.body.scrollHeight - window.innerHeight;
      }
      progressBar.style.width = totalHeight > 0 ? ((scrollPos / totalHeight) * 100) + '%' : '0%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    if (readerMain) readerMain.addEventListener('scroll', updateProgress, { passive: true });

    // 2. Focus Mode Toggle
    const focusBtn = document.getElementById('focus-btn');
    if (focusBtn) {
      focusBtn.addEventListener('click', function () {
        document.body.classList.toggle('focus-mode-active');
        if (document.body.classList.contains('focus-mode-active')) {
          focusBtn.textContent = 'Exit Focus';
          focusBtn.classList.add('active');
        } else {
          focusBtn.textContent = 'Focus';
          focusBtn.classList.remove('active');
        }
        setTimeout(() => { if (typeof resize === 'function') resize(); }, 300);
      });
    }

    // 3. Glossary Tooltips (Inject dynamically)
    function injectGlossaryTooltips() {
      const prose = document.getElementById('prose');
      const glScript = document.getElementById('d-gl');
      if (!prose || !glScript) return;

      let glData = null;
      try { glData = JSON.parse(glScript.textContent); } catch (e) { return; }
      if (!glData) return;

      const terms = Object.keys(glData).sort((a, b) => b.length - a.length);
      if (!terms.length) return;

      const escapedTerms = terms.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
      const termRegex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

      prose.querySelectorAll('p').forEach(p => {
        if (p.hasAttribute('data-glossary-processed')) return;
        const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null, false);
        const nodesToReplace = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          let parent = node.parentNode, skip = false;
          while (parent && parent !== p) {
            if (parent.tagName === 'A' || parent.classList.contains('glossary-term')) { skip = true; break; }
            parent = parent.parentNode;
          }
          if (!skip && node.nodeValue.match(termRegex)) nodesToReplace.push(node);
        }
        nodesToReplace.forEach(node => {
          const fragment = document.createDocumentFragment();
          let lastIndex = 0, text = node.nodeValue;
          text.replace(termRegex, (match, p1, offset) => {
            if (offset > lastIndex) fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
            const termKey = terms.find(t => t.toLowerCase() === match.toLowerCase());
            if (termKey && glData[termKey]) {
              const termSpan = document.createElement('span');
              termSpan.className = 'glossary-term';
              termSpan.textContent = match;
              const tooltipSpan = document.createElement('span');
              tooltipSpan.className = 'glossary-tooltip';
              tooltipSpan.textContent = glData[termKey];
              termSpan.appendChild(tooltipSpan);
              fragment.appendChild(termSpan);
            } else {
              fragment.appendChild(document.createTextNode(match));
            }
            lastIndex = offset + match.length;
            return match;
          });
          if (lastIndex < text.length) fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
          node.parentNode.replaceChild(fragment, node);
        });
        p.setAttribute('data-glossary-processed', 'true');
      });
    }

    // 4. Copy Link Anchors
    function injectCopyAnchors() {
      const prose = document.getElementById('prose');
      if (!prose) return;
      prose.querySelectorAll('h2[id], h3[id], h4[id]').forEach(heading => {
        if (heading.querySelector('.copy-anchor')) return;
        const anchor = document.createElement('span');
        anchor.className = 'copy-anchor';
        anchor.innerHTML = '&#128279;';
        anchor.title = 'Copy link to this section';
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const url = window.location.href.split('#')[0] + '#' + heading.id;
          navigator.clipboard.writeText(url).then(() => {
            anchor.innerHTML = '&#10003;'; anchor.classList.add('copied');
            setTimeout(() => { anchor.innerHTML = '&#128279;'; anchor.classList.remove('copied'); }, 2000);
          });
        });
        heading.appendChild(anchor);
      });
    }

    // 5. Universal Search & Command Palette Modal
    (function () {
      var backdrop = document.createElement('div');
      backdrop.className = 'cmd-palette-backdrop';
      backdrop.innerHTML =
        '<div class="cmd-palette-box">'
        + '<div class="cmd-palette-input-wrap">'
        + '<span class="cmd-palette-search-icon">&#8981;</span>'
        + '<input type="text" class="cmd-palette-input" placeholder="Type a command, section number, or keyword..." autocomplete="off">'
        + '<span class="cmd-palette-escape-hint">ESC</span>'
        + '</div>'
        + '<div class="cmd-palette-results"></div>'
        + '</div>';
      document.body.appendChild(backdrop);

      var input = backdrop.querySelector('.cmd-palette-input');
      var results = backdrop.querySelector('.cmd-palette-results');

      function show() {
        ensureData();
        backdrop.classList.add('visible');
        input.value = "";
        input.focus();
        renderDefault();
      }

      function hide() {
        backdrop.classList.remove('visible');
        input.blur();
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hide();
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          show();
        }
      });

      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) hide();
      });

      function renderDefault() {
        var h =
          '<button class="cmd-palette-item" data-action="theme">'
          + '<div class="cmd-palette-item-main">'
          + '<span class="cmd-palette-item-title">Toggle Dark / Light Theme</span>'
          + '<span class="cmd-palette-item-desc">Switch between vintage bookstore and sleek dark mode</span>'
          + '</div>'
          + '<span class="cmd-palette-item-badge">Action</span>'
          + '</button>'
          + '<button class="cmd-palette-item" data-action="focus">'
          + '<div class="cmd-palette-item-main">'
          + '<span class="cmd-palette-item-title">Toggle Focus Mode</span>'
          + '<span class="cmd-palette-item-desc">Hide sidebars and read with zero distraction</span>'
          + '</div>'
          + '<span class="cmd-palette-item-badge">Action</span>'
          + '</button>'
          + '<button class="cmd-palette-item" data-action="random">'
          + '<div class="cmd-palette-item-main">'
          + '<span class="cmd-palette-item-title">Read a Random Section</span>'
          + '<span class="cmd-palette-item-desc">Browse a random emergent thesis from the manuscript</span>'
          + '</div>'
          + '<span class="cmd-palette-item-badge">Action</span>'
          + '</button>'
          + '<button class="cmd-palette-item" data-action="reset">'
          + '<div class="cmd-palette-item-main">'
          + '<span class="cmd-palette-item-title">Reset Reading Progress</span>'
          + '<span class="cmd-palette-item-desc">Clear local history and restart reading logs</span>'
          + '</div>'
          + '<span class="cmd-palette-item-badge">Action</span>'
          + '</button>';
        results.innerHTML = h;
      }

      input.addEventListener('input', function () {
        var q = input.value.trim();
        if (!q) {
          renderDefault();
          return;
        }

        // Ambil asisten AI dari jalur komunikasi global
        var buildCtx = window.buildContextPack || (typeof buildContextPack !== 'undefined' ? buildContextPack : null);
        if (!buildCtx) return;

        var pack = buildCtx(q, {
          maxSections: 6,
          maxGlossary: 4
        });

        var h = "";

        // Render Glossary items matching
        (pack.glossary || []).forEach(function (item) {
          h += '<button class="cmd-palette-item" data-action="glossary" data-term="' + esc(item.term) + '">'
            + '<div class="cmd-palette-item-main">'
            + '<span class="cmd-palette-item-title">Key Term: ' + esc(item.term) + '</span>'
            + '<span class="cmd-palette-item-desc">' + esc(item.def) + '</span>'
            + '</div>'
            + '<span class="cmd-palette-item-badge">Glossary</span>'
            + '</button>';
        });

        // Render Section items matching
        (pack.sections || []).forEach(function (item) {
          h += '<button class="cmd-palette-item" data-action="section" data-id="' + esc(item.id) + '">'
            + '<div class="cmd-palette-item-main">'
            + '<span class="cmd-palette-item-title">' + esc(item.id) + ' &mdash; ' + esc(item.title) + '</span>'
            + '<span class="cmd-palette-item-desc">' + esc(item.part) + '</span>'
            + '</div>'
            + '<span class="cmd-palette-item-badge">Read</span>'
            + '</button>';
        });

        results.innerHTML = h || '<div style="padding: 1.5rem; text-align: center; font-family: var(--f-mono); font-size: 0.8rem; color: var(--mute);">No matching sections or terms found.</div>';
      });

      results.addEventListener('click', function (e) {
        var btn = e.target.closest('.cmd-palette-item');
        if (!btn) return;

        var action = btn.getAttribute('data-action');
        if (action === 'theme') {
          var tog = document.getElementById('theme-tog');
          if (tog) tog.click();
          hide();
        } else if (action === 'focus') {
          var focusBtn = document.getElementById('focus-btn');
          if (focusBtn) focusBtn.click();
          hide();
        } else if (action === 'random') {
          var partsList = window.PARTS || (typeof PARTS !== 'undefined' ? PARTS : []);
          var pi = Math.floor(Math.random() * partsList.length);
          if (partsList[pi]) {
            var si = Math.floor(Math.random() * partsList[pi].subs.length);
            if (window.jumpToSection) {
              window.jumpToSection(pi, si, { origin: window.getJumpOrigin ? window.getJumpOrigin() : null });
            }
          }
          hide();
        } else if (action === 'reset') {
          if (confirm("Are you sure you want to reset your reading progress?")) {
            readMap = {};
            try { localStorage.removeItem('pmn-read'); } catch (e) { }
            pip();
            buildTOC();
            alert("Reading progress reset!");
          }
          hide();
        } else if (action === 'glossary') {
          if (window.nav) window.nav('gl');
          hide();
        } else if (action === 'section') {
          var id = btn.getAttribute('data-id');
          if (window.jumpToSectionById) {
            window.jumpToSectionById(id, { origin: window.getJumpOrigin ? window.getJumpOrigin() : null });
          }
          hide();
        }
      });
    })();

    // 6. Wikipedia-Style Xref Hover Cards
    (function () {
      var card = document.createElement('div');
      card.className = 'xref-preview-card';
      document.body.appendChild(card);

      var hideTimeout = null;

      document.addEventListener('mouseover', function (e) {
        var link = e.target.closest('.xref');
        if (!link) return;

        clearTimeout(hideTimeout);
        var sid = link.getAttribute('data-sid');
        if (window.ensureData) window.ensureData();
        var info = window.LOOK ? window.LOOK[sid] : null;
        if (!info) return;

        var sec = (window.PARTS || PARTS)[info.pi].subs[info.si];
        var plain = window.stripHtml ? window.stripHtml(sec.html || sec.text || '') : '';
        var excerpt = plain.slice(0, 180) + (plain.length > 180 ? '...' : '');

        card.innerHTML =
          '<span class="xref-preview-kicker">Part ' + (window.PARTS || PARTS)[info.pi].part + ' &mdash; Section ' + sid + '</span>'
          + '<h4 class="xref-preview-title">' + (window.esc ? window.esc(sec.title) : sec.title) + '</h4>'
          + '<p class="xref-preview-excerpt">' + (window.esc ? window.esc(excerpt) : excerpt) + '</p>'
          + '<span class="xref-preview-footer">&#128279; Click to jump to section</span>';

        var rect = link.getBoundingClientRect();
        var cardWidth = 320;
        var cardHeight = 160;

        var left = rect.left + window.scrollX + (rect.width / 2) - (cardWidth / 2);
        var top = rect.top + window.scrollY - cardHeight - 10;

        if (left < 10) left = 10;
        if (left + cardWidth > window.innerWidth - 10) left = window.innerWidth - cardWidth - 10;
        if (rect.top < cardHeight + 40) {
          top = rect.bottom + window.scrollY + 10;
        }

        card.style.left = left + 'px';
        card.style.top = top + 'px';
        card.classList.add('visible');
      });

      document.addEventListener('mouseout', function (e) {
        var link = e.target.closest('.xref');
        if (!link) return;
        hideTimeout = setTimeout(function () {
          card.classList.remove('visible');
        }, 300);
      });

      card.addEventListener('mouseover', function () {
        clearTimeout(hideTimeout);
      });
      card.addEventListener('mouseout', function () {
        hideTimeout = setTimeout(function () {
          card.classList.remove('visible');
        }, 300);
      });
    })();

    const proseObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach(m => { if (m.addedNodes.length > 0) shouldUpdate = true; });
      if (shouldUpdate) {
        injectCopyAnchors();
        clearTimeout(window._glTimeout);
        window._glTimeout = setTimeout(injectGlossaryTooltips, 300);
        updateProgress();
      }
    });
    const proseEl = document.getElementById('prose');
    if (proseEl) proseObserver.observe(proseEl, { childList: true, subtree: false });

    // ── Floating Welcome / Orientation Toast ──
    (function () {
      var banner = document.getElementById('welcome-banner');
      if (!banner) return;

      var closeBtn = document.getElementById('welcome-close');
      var startBtn = document.getElementById('welcome-start');

      function dismissBanner() {
        banner.classList.add('hidden');
        try {
          localStorage.setItem('pmn-welcome-dismissed', 'true');
        } catch (e) { }
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          dismissBanner();
        });
      }

      if (startBtn) {
        startBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          dismissBanner();
          // Trigger Start Reading Contents Navigation
          if (window.nav) window.nav('srch');
          if (window.showContentsPanel) window.showContentsPanel();
        });
      }

      // Show banner after 1.5 seconds if not dismissed previously
      setTimeout(function () {
        try {
          var dismissed = localStorage.getItem('pmn-welcome-dismissed');
          if (dismissed !== 'true' && document.getElementById('home-view').classList.contains('on')) {
            banner.classList.remove('hidden');
          }
        } catch (e) {
          banner.classList.remove('hidden');
        }
      }, 1500);
    })();

  })();
})();