(function () {
  var D = window.KM, S = D.site;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var secName = {}; D.sections.forEach(function (s) { secName[s[0]] = s[1]; });
  var secDesc = {
    'cold-galvanize': 'Proteksi korosi untuk baja, pipa, tangki, dan struktur.',
    'chemical-maintenance': 'Perawatan mesin, kelistrikan, dan saluran industri.',
    'water-treatment': 'Pengolahan air boiler dan cooling tower.',
    'frp': 'Fabrikasi tangki, pipa, ducting, dan scrubber FRP.',
    'auxiliaries': 'Bahan pendukung proses: scale remover, biocide.'
  };
  var wa = function (t) { return 'https://wa.me/' + S.wa + '?text=' + encodeURIComponent(t || 'Halo Karmand, saya ingin bertanya tentang produk.'); };
  var green = getComputedStyle(document.documentElement).getPropertyValue('--green-1').trim() || '#05374e';

  /* Placeholder until client photos arrive: plain grey panel with the product code as a wordmark (like Jotun's product panels). */
  function code(name) {
    var n = name.replace(/^Karmand\s+/, '');
    var m = n.match(/\b(K[-. ]?\s?\d{3}\s?[A-Z]{1,3}|[A-Z]{2,3}[- ]\d{2,4}\s?[A-Z]{0,3}|JS-\d+|SB \d+)\b/);
    var series = n.replace(/\s*-\s*.*$/, '').replace(m ? m[0] : '', '').trim();
    return { code: m ? m[0] : n.split(' ').slice(0, 2).join(' '), series: series.length > 30 ? series.slice(0, 29) + '…' : series };
  }
  function productArt(name, v) {
    var c = code(name), bg = ['#edfaf9', '#e5f7f6', '#dcf4f3'][v || 0];
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(name) + '"><rect width="400" height="400" fill="' + bg + '"/>' +
      '<text x="200" y="196" text-anchor="middle" font-family="Plus Jakarta Sans,Segoe UI,Arial" font-size="40" font-weight="800" font-style="italic" fill="' + green + '">' + esc(c.code) + '</text>' +
      '<text x="200" y="230" text-anchor="middle" font-family="Plus Jakarta Sans,Segoe UI,Arial" font-size="15" fill="#5f7d88">' + esc(c.series) + '</text></svg>';
  }
  function photoSlot(label) {
    return '<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#e0f9f8"/><text x="150" y="104" text-anchor="middle" font-family="Plus Jakarta Sans,Segoe UI,Arial" font-size="11" fill="#5f7d88" letter-spacing="1">' + esc(label) + '</text></svg>';
  }

  var toastEl;
  function toast(t) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* chrome */
  var page = document.body.dataset.page;
  var menu = [['Beranda', 'index.html', page === 'home'], ['Katalog', '#katalog'], ['Produk', 'product.html', page === 'product'], ['Portofolio', '#portofolio'], ['Blogs', '#blogs']];
  var navHtml = menu.map(function (m) {
    var drop = m[0] === 'Produk' ? '<div class="drop">' + D.sections.map(function (s) {
      return '<a href="' + (s[0] === 'cold-galvanize' ? 'product.html' : '#na') + '"><span>' + s[1] + '</span><span class="arrow">&rsaquo;</span></a>';
    }).join('') + '</div>' : '';
    return '<li><a class="top' + (m[2] ? ' on' : '') + '" href="' + m[1] + '">' + m[0] + '</a>' + drop + '</li>';
  }).join('');
  $('#hdr').outerHTML =
    '<div class="util"><div class="wrap"><span>' + S.domain + '</span><div class="r"><a href="#pdf" data-na="File PDF company profile disediakan client">Company Profile</a><a href="#pdf" data-na="File PDF katalog disediakan client">Download Katalog</a><span>ID</span></div></div></div>' +
    '<header class="hdr"><div class="wrap"><a class="logo" href="index.html"><img src="assets/logo.png" alt="' + S.name + '"></a><button class="burger" aria-label="Menu"><span></span><span></span><span></span></button><ul class="nav">' + navHtml + '</ul></div></header>';

  var q = encodeURIComponent(S.address);
  var flink = function (h, t, na) { return '<a href="' + h + '"' + (na ? ' data-na="' + na + '"' : '') + '><span>' + t + '</span><span class="arrow">&rarr;</span></a>'; };
  $('#ftr').outerHTML = '<footer class="ftr"><div class="wrap"><div class="cols">' +
    '<div><div class="logo"><img src="assets/logo.png" alt="' + S.name + '"></div><p>Penyedia solusi kimia industri: cold galvanize, coating, chemical maintenance, water treatment, dan FRP.</p><p style="margin-top:12px">' + S.hours + '<br>' + S.hoursWeekend + '</p></div>' +
    '<div class="links">' + flink('#katalog', 'Katalog') + flink('product.html', 'Produk') + flink('#portofolio', 'Portofolio') + flink('#blogs', 'Blogs') + flink(S.linktree, 'Linktree') + '</div>' +
    '<div><h4>Lokasi</h4><div class="map"><iframe title="Peta lokasi Karmand" loading="lazy" src="https://www.google.com/maps?q=' + q + '&output=embed"></iframe></div><p>' + S.address + '</p>' +
    '<div class="contact" style="margin-top:8px"><a href="tel:' + S.phone.replace(/\s/g, '') + '">' + S.phone + '</a><a href="mailto:' + S.email + '">' + S.email + '</a><a href="' + wa() + '">WhatsApp</a><a href="' + S.instagram + '">Instagram</a><a href="' + S.facebook + '">Facebook</a></div></div>' +
    '</div><div class="copy"><span>&copy; 2026 ' + S.name + '</span><span>' + S.domain + ' &middot; mockup, foto masih placeholder</span></div></div></footer>';

  var ico = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>';
  var b = document.createElement('div'); b.className = 'bubble';
  b.innerHTML = '<div class="tip" id="tip">Ada pertanyaan? Chat kami</div><div class="bpanel" id="bp"><p>Hubungi Kami</p>' +
    '<a class="wa" href="' + wa() + '"><span>Chat WhatsApp</span><span>&rarr;</span></a><a href="mailto:' + S.email + '"><span>Email kantor</span><span>&rarr;</span></a><a href="#pdf" data-na="Company profile PDF disediakan client"><span>Company Profile (PDF)</span><span>&rarr;</span></a><a href="' + S.instagram + '"><span>Sosial media</span><span>&rarr;</span></a><a href="https://www.google.com/maps?q=' + q + '"><span>Google Maps</span><span>&rarr;</span></a><a href="' + S.linktree + '"><span>Semua tautan (Linktree)</span><span>&rarr;</span></a></div>' +
    '<button class="bubble-btn" id="bb" aria-label="Hubungi Kami" aria-expanded="false">' + ico + '</button>';
  document.body.appendChild(b);
  setTimeout(function () { $('#tip').classList.add('hide'); }, 6000);
  $('#bb').onclick = function () { var o = $('#bp').classList.toggle('open'); this.setAttribute('aria-expanded', o); $('#tip').classList.add('hide'); };
  $('.burger').onclick = function () { $('.nav').classList.toggle('open'); };

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (a.dataset.na || ['#na', '#katalog', '#portofolio', '#blogs', '#pdf'].indexOf(h) >= 0) {
      if ((h === '#katalog' || h === '#portofolio') && $(h)) return;
      e.preventDefault(); toast(a.dataset.na || 'Halaman ini belum dibuat di mockup');
    }
  });

  var pcard = function (p) {
    return '<a class="pc" href="product.html?p=' + p.slug + '"><div class="img">' + productArt(p.name) + '</div><div class="nm">' + esc(p.name) + '</div><div class="sub">' + esc(secName[p.category]) + '</div><div class="val">' + esc(p.packaging || '') + '</div></a>';
  };

  /* home */
  if (page === 'home') {
    var heroProd = ['karmand-cold-galvanize-k-404-cg-pail-20kg', 'karmand-boiler-scale-preventif-k-301-bp', 'karmand-frp-tank-fabrication'];
    $('#hero').innerHTML = D.hero.map(function (h, i) {
      var p = D.products.filter(function (x) { return x.slug === heroProd[i]; })[0] || D.products[i];
      return '<div class="slide' + (i ? '' : ' on') + '"><div class="txt"><div class="eyebrow">' + esc(S.tagline) + '</div><h1>' + esc(h.title) + ' ' + esc(h.highlight) + '</h1><p>' + esc(h.text) + '</p><a class="btn" href="product.html?p=' + p.slug + '">' + esc(h.cta) + '</a></div><div class="pic">' + productArt(p.name, 0).replace('fill="#edfaf9"', 'fill="none"') + '</div></div>';
    }).join('') + '<div class="bar">' + D.hero.map(function (_, i) { return '<button aria-label="Slide ' + (i + 1) + '"' + (i ? '' : ' class="on"') + '></button>'; }).join('') + '</div>';
    var si = 0, slides = $$('.slide'), dots = $$('.bar button');
    var go = function (n) { si = (n + slides.length) % slides.length; slides.forEach(function (s, i) { s.classList.toggle('on', i === si); dots[i].classList.toggle('on', i === si); }); };
    dots.forEach(function (d, i) { d.onclick = function () { go(i); }; });
    setInterval(function () { go(si + 1); }, 6000);

    $('#stats').innerHTML = [[D.stats.projects + '+', 'Proyek selesai'], [D.stats.clients + '+', 'Klien'], [D.partners.length, 'Partner']].map(function (x) {
      return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>';
    }).join('');
    $('#partners').innerHTML = D.partners.map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('');
    $('#top').innerHTML = D.products.slice(0, 6).map(pcard).join('');
    $('#cats').innerHTML = D.sections.map(function (s, i) {
      return '<a class="fc" href="' + (i === 0 ? 'product.html' : '#na') + '"><div class="img">' + photoSlot('FOTO KATEGORI') + '</div><div class="box"><div class="t"><span>' + s[1] + '</span><span class="arrow">&rarr;</span></div><div class="d">' + secDesc[s[0]] + '</div></div></a>';
    }).join('');
    $('#about').textContent = D.about;
    $('#pf').innerHTML = D.portfolios.slice(0, 6).map(function (p) {
      return '<a class="fc" href="#na"><div class="img">' + photoSlot('FOTO PROYEK') + '</div><div class="box"><div class="eyebrow">' + esc(p.tag) + '</div><div class="t" style="margin-top:4px"><span>' + esc(p.title) + '</span><span class="arrow">&rarr;</span></div><div class="d">' + esc(p.client) + ' &middot; ' + esc(p.location) + '</div></div></a>';
    }).join('');
  }

  /* product */
  if (page === 'product') {
    var slug = (location.search.match(/p=([^&]+)/) || [])[1] || 'karmand-cold-galvanize-k-404-cg-pail-20kg';
    var p = D.products.filter(function (x) { return x.slug === slug; })[0] || D.products[0];
    document.title = p.name + ' | ' + S.name;
    $('#crumb').innerHTML = '<a href="index.html">Beranda</a> &nbsp;&rsaquo;&nbsp; <a href="#na">Produk</a> &nbsp;&rsaquo;&nbsp; <a href="#na">' + secName[p.category] + '</a> &nbsp;&rsaquo;&nbsp; ' + esc(p.name);
    var th = [0, 1, 2].map(function (i) { return '<button class="' + (i ? '' : 'on') + '" data-v="' + i + '" aria-label="Foto ' + (i + 1) + '">' + productArt(p.name, i) + '</button>'; }).join('');
    $('#gal').innerHTML = '<div class="main" id="main">' + productArt(p.name, 0) + '</div><div class="prog"><i id="pi"></i></div><div class="thumbs">' + th + '</div>';
    $$('.thumbs button').forEach(function (bt) {
      bt.onclick = function () {
        $$('.thumbs button').forEach(function (x) { x.classList.remove('on'); }); bt.classList.add('on');
        $('#main').innerHTML = productArt(p.name, +bt.dataset.v); $('#pi').style.left = (+bt.dataset.v * 33.3) + '%';
      };
    });
    $('#info').innerHTML = '<div class="eyebrow">' + secName[p.category] + '</div><h1>' + esc(p.name) + '</h1><div class="pk">Kemasan: ' + esc(p.packaging || '-') + '</div><p class="desc">' + esc(p.description) + '</p>' +
      '<a class="buybox" href="' + wa('Halo Karmand, saya ingin membeli / bertanya detail produk: ' + p.name) + '">Pembelian dan informasi detail produk, silakan klik di sini<small>Terhubung langsung ke WhatsApp admin</small></a>' +
      '<div class="trust">&#10003;&nbsp; Produk asli Karmand &middot; konsultasi teknis gratis</div>';
    var L = { base: 'Base', color: 'Warna', components: 'Komponen', specific_gravity: 'Berat jenis', dry_touch: 'Kering sentuh', dry_complete: 'Kering sempurna', coverage: 'Daya sebar', dft: 'DFT', nonvolatile: 'Non-volatile' };
    var rows = Object.keys(p.props || {}).map(function (k) { return '<div><dt>' + (L[k] || k) + '</dt><dd>' + esc(p.props[k]) + '</dd></div>'; }).join('');
    $('#detail').innerHTML = '<h2 class="h-frame">Detail teknis</h2><dl class="spec">' + (rows || '<div><dt>Kategori</dt><dd>' + secName[p.category] + '</dd></div>') + '</dl>';
    $('#feat').innerHTML = (p.composition ? '<div><b>Komposisi</b><p>' + esc(p.composition) + '</p></div>' : '') + (p.usage ? '<div><b>Cara pakai</b><p>' + esc(p.usage) + '</p></div>' : '');
    var sim = D.products.filter(function (x) { return x.category === p.category && x.slug !== p.slug; });
    D.products.forEach(function (x) { if (sim.length < 6 && x.category !== p.category && x.slug !== p.slug) sim.push(x); });
    $('#sim').innerHTML = sim.slice(0, 6).map(pcard).join('');
  }
})();
