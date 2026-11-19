(function () {
  var D = window.KM, S = D.site;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var secName = {}; D.sections.forEach(function (s) { secName[s[0]] = s[1]; });
  var wa = function (t) { return 'https://wa.me/' + S.wa + '?text=' + encodeURIComponent(t || 'Halo Karmand, saya ingin bertanya tentang produk.'); };
  var hash = function (s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

  /* placeholder art, generated (no photos yet; client supplies real ones) */
  function productArt(name, cat, v) {
    var h = hash(name + (v || 0)), tint = ['#cfe8d8', '#dcefe2', '#c3e0cf', '#e4f2e9'][h % 4];
    var short = name.replace(/^Karmand\s+/, ''), label = esc(short.length > 27 ? short.slice(0, 26) + '…' : short);
    var body = cat === 'frp'
      ? '<rect x="62" y="70" width="76" height="86" rx="10" fill="#1d5c3f"/><rect x="72" y="60" width="56" height="14" rx="5" fill="#3d9a69"/><rect x="70" y="100" width="60" height="3" fill="#cfe8d8"/><rect x="70" y="118" width="60" height="3" fill="#cfe8d8"/>'
      : '<path d="M62 80h76l-6 78H68z" fill="#1d5c3f"/><rect x="58" y="68" width="84" height="16" rx="6" fill="#3d9a69"/><rect x="82" y="60" width="36" height="9" rx="4" fill="#1d5c3f"/><rect x="72" y="104" width="56" height="32" rx="4" fill="#f7f3e8"/><rect x="78" y="112" width="44" height="4" fill="#3d9a69"/><rect x="78" y="121" width="30" height="3" fill="#1d5c3f" opacity=".6"/>';
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '"><rect width="200" height="200" fill="' + tint + '"/><circle cx="' + (150 - (h % 40)) + '" cy="40" r="46" fill="#fff" opacity=".35"/>' + body + '<text x="100" y="184" text-anchor="middle" font-family="Segoe UI,Arial" font-size="10" font-weight="700" fill="#1d5c3f">' + label + '</text></svg>';
  }
  function workArt(title) {
    var h = hash(title), c = ['#1d5c3f', '#2a7a55', '#256b49', '#34845e'][h % 4];
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="' + c + '"/><rect y="200" width="400" height="100" fill="#14482f"/><rect x="' + (40 + h % 50) + '" y="110" width="110" height="110" rx="8" fill="#cfe8d8" opacity=".9"/><rect x="' + (200 + h % 40) + '" y="140" width="130" height="80" rx="8" fill="#3d9a69"/><rect x="' + (60 + h % 50) + '" y="90" width="70" height="20" rx="6" fill="#f7f3e8" opacity=".8"/><circle cx="340" cy="60" r="26" fill="#f7f3e8" opacity=".25"/></svg>';
  }
  function heroArt(i) {
    return '<svg class="art" viewBox="0 0 1000 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hg' + i + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d5c3f"/><stop offset="1" stop-color="' + ['#3d9a69', '#2a7a55', '#256b49'][i % 3] + '"/></linearGradient></defs><rect width="1000" height="340" fill="url(#hg' + i + ')"/><circle cx="' + (820 - i * 60) + '" cy="120" r="170" fill="#fff" opacity=".08"/><circle cx="' + (930 - i * 40) + '" cy="290" r="120" fill="#fff" opacity=".07"/><g transform="translate(' + (700 + i * 20) + ' 70) scale(1.5)" opacity=".28"><path d="M62 80h76l-6 78H68z" fill="#fff"/><rect x="58" y="68" width="84" height="16" rx="6" fill="#fff"/></g></svg>';
  }

  var toastEl;
  function toast(t) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* shared chrome */
  var page = document.body.dataset.page;
  var menu = [['Beranda', 'index.html', page === 'home'], ['Katalog', '#katalog'], ['Produk', 'product.html', page === 'product'], ['Portofolio', '#portofolio'], ['Blogs', '#blogs']];
  var navHtml = menu.map(function (m) {
    var cls = 'top' + (m[2] ? ' on' : '');
    var drop = m[0] === 'Produk' ? '<div class="drop">' + D.sections.map(function (s) {
      return '<a href="' + (s[0] === 'cold-galvanize' ? 'product.html' : '#na') + '">' + s[1] + '</a>';
    }).join('') + '</div>' : '';
    return '<li><a class="' + cls + '" href="' + m[1] + '">' + m[0] + '</a>' + drop + '</li>';
  }).join('');
  $('#hdr').outerHTML = '<header class="hdr"><div class="wrap"><a class="logo" href="index.html"><img src="assets/logo.png" alt="' + S.name + '"></a><button class="burger" aria-label="Menu"><span></span><span></span><span></span></button><ul class="nav">' + navHtml + '</ul></div></header>';

  var q = encodeURIComponent(S.address);
  $('#ftr').outerHTML = '<footer class="ftr"><div class="wrap"><div><div class="logo-w"><img src="assets/logo.png" alt="' + S.name + '"></div><p>' + S.address + '</p><p>' + S.hours + '<br>' + S.hoursWeekend + '</p></div>' +
    '<div><h4>Hubungi</h4><ul><li><a href="tel:' + S.phone.replace(/\s/g, '') + '">Telepon: ' + S.phone + '</a></li><li><a href="mailto:' + S.email + '">' + S.email + '</a></li><li><a href="' + wa() + '">WhatsApp</a></li><li><a href="' + S.instagram + '">Instagram</a></li><li><a href="' + S.facebook + '">Facebook</a></li><li><a href="' + S.linktree + '">Linktree (semua tautan)</a></li></ul></div>' +
    '<div><h4>Lokasi</h4><div class="map"><iframe title="Peta lokasi Karmand" loading="lazy" src="https://www.google.com/maps?q=' + q + '&output=embed"></iframe></div></div></div><div class="copy">&copy; 2026 ' + S.name + ' &middot; ' + S.domain + '</div></footer>';

  var ico = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>';
  var b = document.createElement('div'); b.className = 'bubble';
  b.innerHTML = '<div class="bpanel" id="bp"><p>Ada pertanyaan tentang produk? Hubungi kami.</p><a class="wa" href="' + wa() + '">Chat WhatsApp</a><a href="mailto:' + S.email + '">Email kantor</a><a href="#pdf" data-na="Company profile PDF disediakan client">Company Profile (PDF)</a><a href="' + S.instagram + '">Sosial media</a><a href="https://www.google.com/maps?q=' + q + '">Google Maps</a><a href="' + S.linktree + '">Semua tautan (Linktree)</a></div><button class="bubble-btn" id="bb" aria-expanded="false">' + ico + '<span>Hubungi Kami</span></button>';
  document.body.appendChild(b);
  $('#bb').onclick = function () { var o = $('#bp').classList.toggle('open'); this.setAttribute('aria-expanded', o); };
  var burger = $('.burger'); burger.onclick = function () { $('.nav').classList.toggle('open'); };

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (a.dataset.na || h === '#na' || h === '#katalog' || h === '#portofolio' || h === '#blogs' || h === '#pdf') {
      if (h === '#katalog' && $('#katalog')) return;
      if (h === '#portofolio' && $('#portofolio')) return;
      e.preventDefault(); toast(a.dataset.na || 'Halaman ini belum dibuat di mockup');
    }
  });

  /* page: home */
  if (page === 'home') {
    $('#hero').innerHTML = D.hero.map(function (h, i) {
      return '<div class="slide' + (i ? '' : ' on') + '">' + heroArt(i) + '<div class="txt"><small>' + S.tagline + '</small><h1>' + esc(h.title) + ' <em>' + esc(h.highlight) + '</em></h1><p>' + esc(h.text) + '</p><a class="btn" href="product.html">' + esc(h.cta) + '</a></div></div>';
    }).join('') + '<div class="dots">' + D.hero.map(function (_, i) { return '<button aria-label="Slide ' + (i + 1) + '"' + (i ? '' : ' class="on"') + '></button>'; }).join('') + '</div>';
    var si = 0, slides = $$('.slide'), dots = $$('.dots button');
    var go = function (n) { si = (n + slides.length) % slides.length; slides.forEach(function (s, i) { s.classList.toggle('on', i === si); dots[i].classList.toggle('on', i === si); }); };
    dots.forEach(function (d, i) { d.onclick = function () { go(i); }; });
    setInterval(function () { go(si + 1); }, 5500);

    var card = function (p) {
      return '<a class="card" href="product.html?p=' + p.slug + '"><div class="img">' + productArt(p.name, p.category) + '</div><div class="body"><div class="tag">' + secName[p.category] + '</div><h3>' + esc(p.name) + '</h3><div class="meta">' + esc(p.packaging || '') + '</div></div></a>';
    };
    var top = ['karmand-cold-galvanize-k-404-cg-pail-20kg', 'karmand-cold-galvanize-k-404-cg-5kg', 'karmand-rust-converter-k-413-cp', 'karmand-boiler-scale-preventif-k-301-bp'];
    var pick = top.map(function (s) { return D.products.filter(function (p) { return p.slug === s; })[0]; }).filter(Boolean);
    if (pick.length < 4) pick = D.products.slice(0, 4);
    $('#top').innerHTML = pick.map(card).join('');
    $('#cats').innerHTML = D.sections.map(function (s, i) {
      var n = D.products.filter(function (p) { return p.category === s[0]; }).length;
      return '<a class="card cat" href="' + (i === 0 ? 'product.html' : '#na') + '"><div class="ico">' + (i + 1) + '</div><b>' + s[1] + '</b><span>' + n + ' produk</span></a>';
    }).join('');
    $('#about').textContent = D.about;
    $('#stats').innerHTML = [[D.stats.projects, 'Proyek selesai'], [D.stats.clients, 'Klien'], [D.partners.length, 'Partner']].map(function (x) {
      return '<div class="stat"><b data-n="' + x[0] + '">0</b><span>' + x[1] + '</span></div>';
    }).join('');
    $('#partners').innerHTML = D.partners.map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('');
    $$('[data-n]').forEach(function (el) { var n = +el.dataset.n, t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(n * k) + (n > 100 ? '+' : ''); if (k < 1) requestAnimationFrame(f); })(t0); });
    $('#pf').innerHTML = D.portfolios.slice(0, 6).map(function (p) {
      return '<a class="pf" href="#na">' + workArt(p.title) + '<div class="cap"><b>' + esc(p.title) + '</b><span>' + esc(p.tag) + ' &middot; ' + esc(p.client) + '</span></div></a>';
    }).join('');
  }

  /* page: product */
  if (page === 'product') {
    var slug = (location.search.match(/p=([^&]+)/) || [])[1] || 'karmand-cold-galvanize-k-404-cg-pail-20kg';
    var p = D.products.filter(function (x) { return x.slug === slug; })[0] || D.products[0];
    document.title = p.name + ' | ' + S.name;
    $('#crumb').innerHTML = '<a href="index.html">Beranda</a> / <a href="#na">Produk</a> / <a href="#na">' + secName[p.category] + '</a> / ' + esc(p.name);
    var th = [0, 1, 2].map(function (i) { return '<button class="' + (i ? '' : 'on') + '" data-v="' + i + '" aria-label="Foto ' + (i + 1) + '">' + productArt(p.name, p.category, i) + '</button>'; }).join('');
    $('#gal').innerHTML = '<div class="main" id="main">' + productArt(p.name, p.category, 0) + '</div><div class="thumbs">' + th + '</div>';
    $$('.thumbs button').forEach(function (bt) { bt.onclick = function () { $$('.thumbs button').forEach(function (x) { x.classList.remove('on'); }); bt.classList.add('on'); $('#main').innerHTML = productArt(p.name, p.category, +bt.dataset.v); }; });
    var L = { base: 'Base', color: 'Warna', components: 'Komponen', specific_gravity: 'Berat jenis', dry_touch: 'Kering sentuh', dry_complete: 'Kering sempurna', coverage: 'Daya sebar', dft: 'DFT', nonvolatile: 'Non-volatile' };
    var rows = Object.keys(p.props || {}).map(function (k) { return '<tr><td>' + (L[k] || k) + '</td><td>' + esc(p.props[k]) + '</td></tr>'; }).join('');
    $('#info').innerHTML = '<span class="chip">' + secName[p.category] + '</span><h1>' + esc(p.name) + '</h1><div class="pk">Kemasan: ' + esc(p.packaging || '-') + '</div><p class="desc">' + esc(p.description) + '</p>' +
      '<a class="buybox" href="' + wa('Halo Karmand, saya ingin membeli / bertanya detail produk: ' + p.name) + '">Pembelian dan informasi detail produk, silakan klik di sini<small>Terhubung langsung ke WhatsApp admin</small></a>' +
      (rows ? '<table class="spec">' + rows + '</table>' : '') +
      '<div class="tabs-like">' + (p.composition ? '<h3>Komposisi</h3><p>' + esc(p.composition) + '</p>' : '') + (p.usage ? '<h3>Cara pakai</h3><p>' + esc(p.usage) + '</p>' : '') + '</div>';
    var sim = D.products.filter(function (x) { return x.category === p.category && x.slug !== p.slug; });
    D.products.forEach(function (x) { if (sim.length < 4 && x.category !== p.category && x.slug !== p.slug) sim.push(x); });
    $('#sim').innerHTML = sim.slice(0, 4).map(function (x) {
      return '<a class="card" href="product.html?p=' + x.slug + '"><div class="img">' + productArt(x.name, x.category) + '</div><div class="body"><div class="tag">' + secName[x.category] + '</div><h3>' + esc(x.name) + '</h3><div class="meta">' + esc(x.packaging || '') + '</div></div></a>';
    }).join('');
  }
})();
