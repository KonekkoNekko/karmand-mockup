(function () {
  var D = window.KM, S = D.site;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var secName = {}; D.sections.forEach(function (s) { secName[s[0]] = s[1]; });
  var secDesc = {
    'cold-galvanize': 'Proteksi korosi untuk baja, pipa, tangki, dan struktur.',
    'chemical-maintenance': 'Perawatan mesin, kelistrikan, dan saluran industri.',
    'water-treatment': 'Pengolahan air boiler dan cooling tower.',
    'frp': 'Fabrikasi tangki, pipa, ducting, dan scrubber FRP.',
    'auxiliaries': 'Bahan pendukung proses: scale remover, biocide.'
  };
  var wa = function (t) { return 'https://wa.me/' + S.wa + '?text=' + encodeURIComponent(t || 'Halo Karmand, saya ingin bertanya tentang produk.'); };
  var green = getComputedStyle(document.documentElement).getPropertyValue('--green-1').trim() || '#1f6b45';
  var qs = function (k) { return new URLSearchParams(location.search).get(k) || ''; };
  var fmtDate = function (s) {
    if (!s) return '';
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + mo[d.getMonth()] + ' ' + d.getFullYear();
  };
  var nowStr = function () { return new Date().toISOString().slice(0, 19).replace('T', ' '); };

  /* Placeholder art (matching Jotun/Kick Avenue minimal aesthetic) */
  function code(name) {
    var n = String(name || '').replace(/^Karmand\s+/, '');
    var m = n.match(/\b(K[-. ]?\s?\d{3}\s?[A-Z]{1,3}|[A-Z]{2,3}[- ]\d{2,4}\s?[A-Z]{0,3}|JS-\d+|SB \d+)\b/);
    var series = n.replace(/\s*-\s*.*$/, '').replace(m ? m[0] : '', '').trim();
    return { code: m ? m[0] : n.split(' ').slice(0, 2).join(' '), series: series.length > 30 ? series.slice(0, 29) + '…' : series };
  }
  function productArt(name, v) {
    var c = code(name), bg = ['#f7f7f7', '#f2f2f2', '#efefef'][v || 0];
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(name) + '"><rect width="400" height="400" fill="' + bg + '"/>' +
      '<text x="200" y="196" text-anchor="middle" font-family="Plus Jakarta Sans,Segoe UI,Arial" font-size="40" font-weight="800" font-style="italic" fill="' + green + '">' + esc(c.code) + '</text>' +
      '<text x="200" y="230" text-anchor="middle" font-family="Plus Jakarta Sans,Segoe UI,Arial" font-size="15" fill="#8a8a8a">' + esc(c.series) + '</text></svg>';
  }
  function photoSlot(label) {
    return '<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="200" fill="#ececec"/><text x="150" y="104" text-anchor="middle" font-family="Plus Jakarta Sans,Segoe UI,Arial" font-size="11" fill="#a3a3a3" letter-spacing="1">' + esc(label) + '</text></svg>';
  }
  function productVisual(p, v) {
    if (p && p.image) return '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" style="width:100%;height:100%;object-fit:cover">';
    return productArt(p ? p.name : '', v);
  }
  function portfolioVisual(p, label) {
    if (p && p.image) return '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" style="width:100%;height:100%;object-fit:cover">';
    return photoSlot(label || 'FOTO PROYEK');
  }

  /* Backend-configured SEO meta tags (invisible on page) */
  if (D.seo) {
    [['description', D.seo.metaDescription], ['keywords', D.seo.metaKeywords]].forEach(function (pair) {
      if (!pair[1]) return;
      var m = document.querySelector('meta[name="' + pair[0] + '"]');
      if (!m) { m = document.createElement('meta'); m.setAttribute('name', pair[0]); document.head.appendChild(m); }
      m.setAttribute('content', pair[1]);
    });
  }

  var toastEl;
  function toast(t) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* Shared chrome — exact 5-item header per client brief Section B */
  var page = document.body.dataset.page;
  var menu = [
    ['Beranda', 'index.html', page === 'home'],
    ['Katalog', 'catalog.html', page === 'catalog'],
    ['Produk', 'product.html', page === 'product'],
    ['Portofolio', 'portfolio.html', page === 'portfolio' || page === 'portfolio-detail'],
    ['Blogs', 'blogs.html', page === 'blogs' || page === 'blog-detail']
  ];
  var navHtml = menu.map(function (m) {
    var drop = m[0] === 'Produk' ? '<div class="drop"><a href="catalog.html"><span>Semua Produk</span><span class="arrow">&rsaquo;</span></a>' + D.sections.map(function (s) {
      return '<a href="catalog.html?cat=' + encodeURIComponent(s[0]) + '"><span>' + esc(s[1]) + '</span><span class="arrow">&rsaquo;</span></a>';
    }).join('') + '</div>' : '';
    return '<li><a class="top' + (m[2] ? ' on' : '') + '" href="' + m[1] + '">' + m[0] + '</a>' + drop + '</li>';
  }).join('');

  $('#hdr').outerHTML =
    '<div class="util"><div class="wrap"><span>' + esc(S.domain) + '</span><div class="r"><a href="#pdf" data-pdf="profile" data-na="File PDF company profile disediakan client">Company Profile</a><a href="#pdf" data-pdf="catalog" data-na="File PDF katalog disediakan client">Download Katalog</a><span>ID</span></div></div></div>' +
    '<header class="hdr"><div class="wrap"><a class="logo" href="index.html"><img src="assets/logo.png" alt="' + esc(S.name) + '"></a><button class="burger" aria-label="Menu"><span></span><span></span><span></span></button><ul class="nav">' + navHtml + '</ul></div></header>';

  var q = encodeURIComponent(S.address);
  var flink = function (h, t, na, ext) { return '<a href="' + h + '"' + (na ? ' data-na="' + esc(na) + '"' : '') + (ext ? ' target="_blank" rel="noopener"' : '') + '><span>' + esc(t) + '</span><span class="arrow">&rarr;</span></a>'; };
  $('#ftr').outerHTML = '<footer class="ftr"><div class="wrap"><div class="cols">' +
    '<div><div class="logo"><img src="assets/logo.png" alt="' + esc(S.name) + '"></div><p>Penyedia solusi kimia industri: cold galvanize, coating, chemical maintenance, water treatment, dan FRP.</p><p style="margin-top:12px">' + esc(S.hours) + '<br>' + esc(S.hoursWeekend) + '</p></div>' +
    '<div class="links">' + flink('catalog.html', 'Katalog') + flink('product.html', 'Produk') + flink('portfolio.html', 'Portofolio') + flink('blogs.html', 'Blogs') + flink(S.linktree, 'Linktree', '', true) + '</div>' +
    '<div><h4>Lokasi</h4><div class="map"><iframe title="Peta lokasi Karmand" loading="lazy" src="https://www.google.com/maps?q=' + q + '&output=embed"></iframe></div><p>' + esc(S.address) + '</p>' +
    '<div class="contact" style="margin-top:8px"><a href="tel:' + esc(S.phone.replace(/\s/g, '')) + '">' + esc(S.phone) + '</a><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a><a href="' + wa() + '">WhatsApp</a><a href="' + esc(S.instagram) + '">Instagram</a><a href="' + esc(S.facebook) + '">Facebook</a></div></div>' +
    '</div><div class="copy"><span>&copy; 2026 ' + esc(S.name) + '</span><span>' + esc(S.domain) + ' &middot; mockup, foto dan warna masih placeholder</span></div></div></footer>';

  var ico = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>';
  var b = document.createElement('div'); b.className = 'bubble';
  b.innerHTML = '<div class="tip" id="tip">Ada pertanyaan? Chat kami</div><div class="bpanel" id="bp"><p>Hubungi Kami</p>' +
    '<a class="wa" href="' + wa() + '"><span>Chat WhatsApp</span><span>&rarr;</span></a><a href="mailto:' + esc(S.email) + '"><span>Email kantor</span><span>&rarr;</span></a><a href="#pdf" data-pdf="profile" data-na="Company profile PDF disediakan client"><span>Company Profile (PDF)</span><span>&rarr;</span></a><a href="' + esc(S.instagram) + '"><span>Sosial media</span><span>&rarr;</span></a><a href="https://www.google.com/maps?q=' + q + '"><span>Google Maps</span><span>&rarr;</span></a><a href="' + esc(S.linktree) + '"><span>Semua tautan (Linktree)</span><span>&rarr;</span></a></div>' +
    '<button class="bubble-btn" id="bb" aria-label="Hubungi Kami" aria-expanded="false">' + ico + '</button>';
  document.body.appendChild(b);
  setTimeout(function () { var t = $('#tip'); if (t) t.classList.add('hide'); }, 6000);
  $('#bb').onclick = function () { var o = $('#bp').classList.toggle('open'); this.setAttribute('aria-expanded', o); $('#tip').classList.add('hide'); };
  $('.burger').onclick = function () { $('.nav').classList.toggle('open'); };

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    if (a.dataset.pdf) {
      e.preventDefault();
      var docs = D.documents || {};
      var isCat = a.dataset.pdf === 'catalog';
      var url = isCat ? docs.catalogPdf : docs.companyProfilePdf;
      var fname = isCat ? (docs.catalogPdfName || 'Katalog-Produk-Karmand.pdf') : (docs.companyProfilePdfName || 'Company-Profile-Karmand.pdf');
      if (url) {
        var dl = document.createElement('a');
        dl.href = url;
        if (url.indexOf('data:') === 0) dl.download = fname; else { dl.target = '_blank'; dl.rel = 'noopener'; }
        dl.click();
        return;
      }
      toast(a.dataset.na || 'File PDF disediakan client');
      return;
    }
    if (a.dataset.na) { e.preventDefault(); toast(a.dataset.na); }
  });

  var activeProducts = function () { return (D.products || []).filter(function (p) { return p.is_active !== false; }); };
  var activePortfolios = function () { return (D.portfolios || []).filter(function (p) { return p.is_active !== false; }); };
  var publishedBlogs = function () { return (D.blogPosts || []).filter(function (p) { return p.is_published !== false; }); };

  var pcard = function (p) {
    return '<a class="pc" href="product.html?p=' + encodeURIComponent(p.slug) + '"><div class="img">' + productVisual(p) + '</div><div class="nm">' + esc(p.name) + '</div><div class="sub">' + esc(secName[p.category] || p.category) + '</div><div class="val">' + esc(p.packaging || '') + '</div></a>';
  };
  var pfCard = function (p) {
    return '<a class="fc" href="portfolio-detail.html?slug=' + encodeURIComponent(p.slug) + '"><div class="img">' + portfolioVisual(p, 'FOTO PROYEK') + '</div><div class="box"><div class="eyebrow">' + esc(p.tag) + '</div><div class="t" style="margin-top:4px"><span>' + esc(p.title) + '</span><span class="arrow">&rarr;</span></div><div class="d">' + esc(p.client) + ' &middot; ' + esc(p.location) + '</div></div></a>';
  };
  var blogCard = function (p) {
    return '<a class="fc" href="blog-detail.html?slug=' + encodeURIComponent(p.slug) + '"><div class="img">' + photoSlot('FOTO ARTIKEL') + '</div><div class="box"><div class="eyebrow">' + esc(String(p.category || '').replace(/-/g, ' ')) + ' &middot; ' + esc(p.read_time) + ' min</div><div class="t" style="margin-top:4px"><span>' + esc(p.title) + '</span><span class="arrow">&rarr;</span></div><div class="d">' + esc(p.excerpt) + '</div></div></a>';
  };

  /* 1. HOME */
  if (page === 'home') {
    var slidesData = (D.hero || []).filter(function (h) { return h.is_active !== false; });
    var prods = activeProducts();
    var heroProd = ['karmand-cold-galvanize-k-404-cg-pail-20kg', 'karmand-boiler-scale-preventif-k-301-bp', 'karmand-frp-tank-fabrication'];
    $('#hero').innerHTML = slidesData.map(function (h, i) {
      var p = prods.filter(function (x) { return x.slug === heroProd[i]; })[0] || prods[i] || prods[0];
      return '<div class="slide' + (i ? '' : ' on') + '"><div class="txt"><div class="eyebrow">' + esc(S.tagline) + '</div><h1>' + esc(h.title) + ' ' + esc(h.highlight) + '</h1><p>' + esc(h.text) + '</p><a class="btn" href="' + (p ? 'product.html?p=' + encodeURIComponent(p.slug) : 'catalog.html') + '">' + esc(h.cta) + '</a></div><div class="pic">' + (p ? productArt(p.name, 0).replace('fill="#f7f7f7"', 'fill="none"') : '') + '</div></div>';
    }).join('') + '<div class="bar">' + slidesData.map(function (_, i) { return '<button aria-label="Slide ' + (i + 1) + '"' + (i ? '' : ' class="on"') + '></button>'; }).join('') + '</div>';
    var si = 0, slides = $$('.slide'), dots = $$('.bar button');
    var go = function (n) { if (!slides.length) return; si = (n + slides.length) % slides.length; slides.forEach(function (s, i) { s.classList.toggle('on', i === si); dots[i].classList.toggle('on', i === si); }); };
    dots.forEach(function (d, i) { d.onclick = function () { go(i); }; });
    if (slides.length > 1) setInterval(function () { go(si + 1); }, 6000);

    var activePartners = (D.partnerRecords || []).filter(function (x) { return x.is_active !== false; }).map(function (x) { return x.name; });
    if (!activePartners.length) activePartners = D.partners || [];
    $('#stats').innerHTML = [[D.stats.projects + '+', 'Proyek selesai'], [D.stats.clients + '+', 'Klien'], [activePartners.length, 'Partner']].map(function (x) {
      return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>';
    }).join('');
    $('#partners').innerHTML = activePartners.map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('');
    $('#top').innerHTML = prods.slice(0, 6).map(pcard).join('');
    $('#cats').innerHTML = D.sections.map(function (s) {
      return '<a class="fc" href="catalog.html?cat=' + encodeURIComponent(s[0]) + '"><div class="img">' + photoSlot('FOTO KATEGORI') + '</div><div class="box"><div class="t"><span>' + esc(s[1]) + '</span><span class="arrow">&rarr;</span></div><div class="d">' + esc(secDesc[s[0]]) + '</div></div></a>';
    }).join('');
    $('#about').textContent = D.about;
    $('#pf').innerHTML = activePortfolios().slice(0, 6).map(pfCard).join('');
    var lb = $('#latest-blogs');
    if (lb) lb.innerHTML = publishedBlogs().slice(0, 3).map(blogCard).join('');
  }

  /* 2. CATALOG */
  if (page === 'catalog') {
    var curCat = qs('cat') || 'all';
    var searchEl = $('#cat-search');
    function renderCat() {
      var qv = (searchEl.value || '').trim().toLowerCase();
      var all = activeProducts();
      var list = all.filter(function (p) {
        if (curCat !== 'all' && p.category !== curCat) return false;
        if (qv && (p.name + ' ' + p.description + ' ' + p.packaging + ' ' + (secName[p.category] || '')).toLowerCase().indexOf(qv) < 0) return false;
        return true;
      });
      $('#cat-title').textContent = curCat === 'all' ? 'Semua Produk' : (secName[curCat] || 'Katalog Produk');
      $('#cat-desc').textContent = curCat === 'all' ? 'Rangkaian lengkap produk kimia industri PT Karmand Mitra Andalan untuk proteksi korosi, maintenance, pengolahan air, fabrikasi FRP, dan bahan pendukung proses.' : (secDesc[curCat] || '');
      $('#cat-count').textContent = 'Menampilkan ' + list.length + ' dari ' + all.length + ' produk';
      $('#cat-grid').innerHTML = list.length ? list.map(pcard).join('') : '<div class="empty" style="grid-column:1/-1">Tidak ada produk yang cocok dengan pencarian Anda.</div>';
      $$('#cat-tabs .tab').forEach(function (t) { t.classList.toggle('on', t.dataset.cat === curCat); });
    }
    var tabsHtml = '<button class="tab" data-cat="all" type="button">Semua (' + activeProducts().length + ')</button>' + D.sections.map(function (s) {
      var cnt = activeProducts().filter(function (p) { return p.category === s[0]; }).length;
      return '<button class="tab" data-cat="' + esc(s[0]) + '" type="button">' + esc(s[1]) + ' (' + cnt + ')</button>';
    }).join('');
    $('#cat-tabs').innerHTML = tabsHtml;
    $$('#cat-tabs .tab').forEach(function (t) {
      t.onclick = function () {
        curCat = t.dataset.cat;
        history.replaceState(null, '', curCat === 'all' ? 'catalog.html' : 'catalog.html?cat=' + encodeURIComponent(curCat));
        renderCat();
      };
    });
    searchEl.oninput = renderCat;
    var catWa = $('#cat-wa'); if (catWa) catWa.href = wa('Halo Karmand, saya ingin konsultasi teknis mengenai produk di katalog.');
    renderCat();
  }

  /* 3. PRODUCT DETAIL */
  if (page === 'product') {
    var prods = activeProducts();
    var slug = qs('p') || (prods[0] && prods[0].slug);
    var p = prods.filter(function (x) { return x.slug === slug; })[0] || prods[0];
    if (!p) { location.replace('404.html'); return; }
    document.title = p.name + ' | ' + S.name;
    $('#crumb').innerHTML = '<a href="index.html">Beranda</a> &nbsp;&rsaquo;&nbsp; <a href="catalog.html">Katalog</a> &nbsp;&rsaquo;&nbsp; <a href="catalog.html?cat=' + encodeURIComponent(p.category) + '">' + esc(secName[p.category] || p.category) + '</a> &nbsp;&rsaquo;&nbsp; ' + esc(p.name);
    var th = [0, 1, 2].map(function (i) { return '<button class="' + (i ? '' : 'on') + '" data-v="' + i + '" aria-label="Foto ' + (i + 1) + '">' + (i === 0 ? productVisual(p, 0) : productArt(p.name, i)) + '</button>'; }).join('');
    $('#gal').innerHTML = '<div class="main" id="main">' + productVisual(p, 0) + '</div><div class="prog"><i id="pi"></i></div><div class="thumbs">' + th + '</div>';
    $$('.thumbs button').forEach(function (bt) {
      bt.onclick = function () {
        $$('.thumbs button').forEach(function (x) { x.classList.remove('on'); }); bt.classList.add('on');
        var vi = +bt.dataset.v;
        $('#main').innerHTML = vi === 0 ? productVisual(p, 0) : productArt(p.name, vi); $('#pi').style.left = (vi * 33.3) + '%';
      };
    });
    var mkts = '';
    if (p.tokopedia_link || p.shopee_link) {
      mkts = '<div class="mkts">' +
        (p.tokopedia_link ? '<a href="' + esc(p.tokopedia_link) + '" target="_blank" rel="noopener">Tokopedia &rarr;</a>' : '') +
        (p.shopee_link ? '<a href="' + esc(p.shopee_link) + '" target="_blank" rel="noopener">Shopee &rarr;</a>' : '') +
        '</div>';
    }
    $('#info').innerHTML = '<div class="eyebrow">' + esc(secName[p.category] || p.category) + '</div><h1>' + esc(p.name) + '</h1><div class="pk">Kemasan: ' + esc(p.packaging || '-') + '</div><p class="desc">' + esc(p.description) + '</p>' +
      '<a class="buybox" href="' + wa('Halo Karmand, saya ingin membeli / bertanya detail produk: ' + p.name) + '">Pembelian dan informasi detail produk, silakan klik di sini<small>Terhubung langsung ke WhatsApp admin</small></a>' +
      mkts +
      '<div class="trust">&#10003;&nbsp; Produk asli Karmand &middot; konsultasi teknis gratis</div>';
    var L = { base: 'Base', color: 'Warna', components: 'Komponen', specific_gravity: 'Berat jenis', dry_touch: 'Kering sentuh', dry_complete: 'Kering sempurna', coverage: 'Daya sebar', dft: 'DFT', nonvolatile: 'Non-volatile', form: 'Bentuk', solubility: 'Kelarutan', ph: 'pH', flash_point: 'Flash point', concentration: 'Konsentrasi', zinc_content: 'Kandungan Zinc' };
    var rows = Object.keys(p.props || {}).map(function (k) { return '<div><dt>' + esc(L[k] || k) + '</dt><dd>' + esc(p.props[k]) + '</dd></div>'; }).join('');
    $('#detail').innerHTML = '<h2 class="h-frame">Detail teknis</h2><dl class="spec">' + (rows || '<div><dt>Kategori</dt><dd>' + esc(secName[p.category] || p.category) + '</dd></div>') + '</dl>';
    $('#feat').innerHTML =
      (p.composition ? '<div><b>Komposisi</b><p>' + esc(p.composition) + '</p></div>' : '') +
      (p.usage ? '<div><b>Cara pakai</b><p style="white-space:pre-line">' + esc(p.usage) + '</p></div>' : '') +
      (p.security ? '<div><b>Keamanan &amp; Penyimpanan</b><p style="white-space:pre-line">' + esc(p.security) + '</p></div>' : '') +
      (p.applications ? '<div><b>Aplikasi Industri</b><p style="white-space:pre-line">' + esc(p.applications) + '</p></div>' : '');

    var exps = (D.preventionExposures || []).filter(function (x) { return String(x.product_id) === String(p.id); });
    if (exps.length && $('#exposures')) {
      $('#exposures').innerHTML = '<section class="expsec"><h2 class="h-frame">Pencegahan &amp; Paparan</h2><div class="expgrid">' + exps.map(function (x) {
        return '<div class="expcard"><b>' + esc(x.title) + '</b><p>' + esc(x.description) + '</p></div>';
      }).join('') + '</div></section>';
    }

    var sim = prods.filter(function (x) { return x.category === p.category && x.slug !== p.slug; });
    prods.forEach(function (x) { if (sim.length < 6 && x.category !== p.category && x.slug !== p.slug) sim.push(x); });
    $('#sim').innerHTML = sim.slice(0, 6).map(pcard).join('');
  }

  /* 4. PORTFOLIO LIST */
  if (page === 'portfolio') {
    var allPf = activePortfolios();
    var tags = ['Semua'];
    allPf.forEach(function (p) { if (p.tag && tags.indexOf(p.tag) < 0) tags.push(p.tag); });
    var curTag = 'Semua';
    var sEl = $('#pf-search');
    $('#pf-tabs').innerHTML = tags.map(function (t) { return '<button class="tab" data-tag="' + esc(t) + '" type="button">' + esc(t) + '</button>'; }).join('');
    function renderPf() {
      var qv = (sEl.value || '').trim().toLowerCase();
      var list = allPf.filter(function (p) {
        if (curTag !== 'Semua' && p.tag !== curTag) return false;
        if (qv && (p.title + ' ' + p.client + ' ' + p.location + ' ' + p.tag).toLowerCase().indexOf(qv) < 0) return false;
        return true;
      });
      $('#pf-grid').innerHTML = list.length ? list.map(pfCard).join('') : '<div class="empty" style="grid-column:1/-1">Tidak ada proyek yang cocok.</div>';
      $$('#pf-tabs .tab').forEach(function (b) { b.classList.toggle('on', b.dataset.tag === curTag); });
    }
    $$('#pf-tabs .tab').forEach(function (b) { b.onclick = function () { curTag = b.dataset.tag; renderPf(); }; });
    sEl.oninput = renderPf;
    renderPf();
  }

  /* 5. PORTFOLIO DETAIL */
  if (page === 'portfolio-detail') {
    var allPf = activePortfolios();
    var slug = qs('slug') || (allPf[0] && allPf[0].slug);
    var p = allPf.filter(function (x) { return x.slug === slug; })[0] || allPf[0];
    if (!p) { location.replace('404.html'); return; }
    document.title = p.title + ' | ' + S.name;
    $('#crumb').innerHTML = '<a href="index.html">Beranda</a> &nbsp;&rsaquo;&nbsp; <a href="portfolio.html">Portofolio</a> &nbsp;&rsaquo;&nbsp; ' + esc(p.title);
    var specs = [['Klien', p.client], ['Lokasi', p.location], ['Durasi', p.duration], ['Nilai Proyek', p.value]].filter(function (x) { return x[1]; });
    $('#pf-detail').innerHTML =
      '<div class="pagehead" style="border:0;padding-bottom:20px"><div class="eyebrow">' + esc(p.tag) + '</div><h1>' + esc(p.title) + '</h1><p>' + esc(p.description) + '</p></div>' +
      '<div class="artcover">' + portfolioVisual(p, 'FOTO DOKUMENTASI PROYEK') + '</div>' +
      (specs.length ? '<dl class="speclist">' + specs.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
      '<div class="split2" style="padding:12px 0 44px">' +
      (p.scope && p.scope.length ? '<div><h2 class="h-shelf">Ruang Lingkup Pekerjaan</h2><ul class="bullet">' + p.scope.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
      (p.results && p.results.length ? '<div><h2 class="h-shelf">Hasil &amp; Pencapaian</h2><ul class="bullet">' + p.results.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' : '') +
      '</div>' +
      (p.challenges ? '<div style="background:var(--surface);padding:24px 28px;margin-bottom:36px"><div class="eyebrow">Tantangan Proyek</div><p class="muted" style="margin-top:8px">' + esc(p.challenges) + '</p></div>' : '') +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;padding-bottom:36px"><a class="btn" href="' + wa('Halo Karmand, saya tertarik dengan studi kasus proyek: ' + p.title) + '">Diskusikan Proyek Serupa</a><a class="btn outline" href="contact.html">Minta Penawaran</a></div>';
    var rel = allPf.filter(function (x) { return x.slug !== p.slug; }).slice(0, 3);
    $('#pf-related').innerHTML = rel.map(pfCard).join('');
  }

  /* 6. BLOGS LIST */
  if (page === 'blogs') {
    var allB = publishedBlogs();
    var cats = ['Semua'];
    allB.forEach(function (b) { if (b.category && cats.indexOf(b.category) < 0) cats.push(b.category); });
    var curB = 'Semua';
    var bsEl = $('#blog-search');
    $('#blog-tabs').innerHTML = cats.map(function (c) { return '<button class="tab" data-c="' + esc(c) + '" type="button">' + esc(c.replace(/-/g, ' ')) + '</button>'; }).join('');
    function renderB() {
      var qv = (bsEl.value || '').trim().toLowerCase();
      var list = allB.filter(function (b) {
        if (curB !== 'Semua' && b.category !== curB) return false;
        if (qv && (b.title + ' ' + b.excerpt + ' ' + b.category).toLowerCase().indexOf(qv) < 0) return false;
        return true;
      });
      $('#blog-grid').innerHTML = list.length ? list.map(blogCard).join('') : '<div class="empty" style="grid-column:1/-1">Tidak ada artikel yang cocok.</div>';
      $$('#blog-tabs .tab').forEach(function (t) { t.classList.toggle('on', t.dataset.c === curB); });
    }
    $$('#blog-tabs .tab').forEach(function (t) { t.onclick = function () { curB = t.dataset.c; renderB(); }; });
    bsEl.oninput = renderB;
    renderB();

    $('#nl-form').onsubmit = function (e) {
      e.preventDefault();
      var em = $('#nl-email').value.trim();
      if (!em) return;
      var db = window.KMStore.get();
      var exists = (db.newsletters || []).some(function (n) { return String(n.email).toLowerCase() === em.toLowerCase(); });
      if (exists) { toast('Email sudah terdaftar di newsletter.'); return; }
      db.newsletters.unshift({ id: window.KMStore.nextId(db.newsletters), email: em, is_active: true, created_at: nowStr() });
      window.KMStore.save(db);
      $('#nl-email').value = '';
      toast('Berhasil berlangganan newsletter.');
    };
  }

  /* 7. BLOG DETAIL */
  if (page === 'blog-detail') {
    var allB = publishedBlogs();
    var slug = qs('slug') || (allB[0] && allB[0].slug);
    var post = allB.filter(function (x) { return x.slug === slug; })[0] || allB[0];
    if (!post) { location.replace('404.html'); return; }
    document.title = post.title + ' | ' + S.name;
    $('#crumb').innerHTML = '<a href="index.html">Beranda</a> &nbsp;&rsaquo;&nbsp; <a href="blogs.html">Blogs</a> &nbsp;&rsaquo;&nbsp; ' + esc(post.title);
    var u = encodeURIComponent(location.href), tt = encodeURIComponent(post.title);
    $('#blog-detail').innerHTML =
      '<div class="artmeta"><span>' + esc(String(post.category || '').replace(/-/g, ' ').toUpperCase()) + '</span><span>&middot;</span><span>' + esc(fmtDate(post.published_at)) + '</span><span>&middot;</span><span>' + esc(post.read_time) + ' min read</span></div>' +
      '<h1>' + esc(post.title) + '</h1>' +
      '<div class="artcover">' + photoSlot('FOTO ARTIKEL') + '</div>' +
      '<div class="prose">' + post.content + '</div>' +
      '<div class="sharebar"><span class="eyebrow">Bagikan Artikel</span><div class="sharelinks">' +
      '<a href="https://wa.me/?text=' + tt + '%20' + u + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '" target="_blank" rel="noopener">LinkedIn</a>' +
      '<a href="https://twitter.com/intent/tweet?text=' + tt + '&url=' + u + '" target="_blank" rel="noopener">X / Twitter</a>' +
      '</div></div>';
    var rel = allB.filter(function (x) { return x.slug !== post.slug; }).slice(0, 3);
    $('#blog-related').innerHTML = rel.map(blogCard).join('');
  }

  /* 8. ABOUT */
  if (page === 'about') {
    var ab = D.aboutFull || {};
    $('#ab-sub').textContent = ab.subtitle || 'Tentang Kami';
    $('#ab-title').textContent = ab.main_heading || S.name;
    $('#ab-lead').textContent = D.about;
    $('#ab-story').innerHTML =
      '<div><p>' + esc(ab.main_description || D.about) + '</p>' +
      (ab.secondary_description ? '<p>' + esc(ab.secondary_description) + '</p>' : '') +
      (ab.tertiary_description ? '<p>' + esc(ab.tertiary_description) + '</p>' : '') +
      '<div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="catalog.html">Jelajahi Produk</a><a class="btn outline" href="contact.html">Hubungi Kami</a></div></div>' +
      '<div class="artcover" style="margin:0">' + photoSlot('FOTO FASILITAS / TIM') + '</div>';
    $('#ab-stats').innerHTML = [
      [D.stats.projects + '+', 'Proyek Selesai'],
      [D.stats.clients + '+', 'Klien Puas'],
      [(D.stats.team || 50) + '+', 'Tim Profesional'],
      [(D.stats.years || 10) + '+', 'Tahun Pengalaman']
    ].map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
    $('#ab-mv').innerHTML =
      '<div class="mvcard"><div class="eyebrow">Misi Kami</div><h3>Komitmen Kualitas</h3><p>' + esc(ab.mission) + '</p></div>' +
      '<div class="mvcard"><div class="eyebrow">Visi Kami</div><h3>Kepemimpinan Industri</h3><p>' + esc(ab.vision) + '</p></div>';
    var team = (D.managementTeams || []).filter(function (m) { return m.is_active !== false; });
    $('#ab-team').innerHTML = team.map(function (m) {
      return '<div class="tcard"><div class="img">' + photoSlot('FOTO MANAJEMEN') + '</div><div class="box"><b>' + esc(m.name) + '</b><span>' + esc(m.position) + '</span><p>' + esc(m.description || '') + '</p></div></div>';
    }).join('');
    var activePartners = (D.partnerRecords || []).filter(function (x) { return x.is_active !== false; }).map(function (x) { return x.name; });
    $('#ab-partners').innerHTML = (activePartners.length ? activePartners : D.partners).map(function (p) { return '<span>' + esc(p) + '</span>'; }).join('');
  }

  /* 9. CAREER */
  if (page === 'career') {
    var benefits = [
      ['Kompensasi Kompetitif', 'Paket remunerasi menarik sesuai pengalaman dan kontribusi profesional.'],
      ['Pengembangan Karir', 'Pelatihan teknis kimia industri, sertifikasi, dan jalur karir terstruktur.'],
      ['Asuransi Kesehatan', 'Perlindungan kesehatan menyeluruh bagi karyawan dan keluarga.'],
      ['Keseimbangan Kerja', 'Lingkungan kerja suportif yang menghargai produktivitas dan kesehatan.'],
      ['Proyek Berdampak', 'Terlibat langsung di proyek energi, infrastruktur, dan manufaktur nasional.'],
      ['Tim Kolaboratif', 'Bekerja bersama insinyur kimia, praktisi lapangan, dan tim bisnis berpengalaman.']
    ];
    $('#car-ben').innerHTML = benefits.map(function (x) { return '<div class="bencard"><b>' + x[0] + '</b><p>' + x[1] + '</p></div>'; }).join('');
    var jobs = (D.jobPositions || []).filter(function (j) { return j.is_active !== false; });
    var depts = ['Semua'];
    jobs.forEach(function (j) { if (j.department && depts.indexOf(j.department) < 0) depts.push(j.department); });
    var curD = 'Semua';
    var jsEl = $('#car-search');
    $('#car-tabs').innerHTML = depts.map(function (d) { return '<button class="tab" data-d="' + esc(d) + '" type="button">' + esc(d) + '</button>'; }).join('');

    var modal = $('#apply-modal');
    function openApply(job) {
      $('#ap-job-id').value = job ? job.id : '';
      $('#ap-pos').value = job ? job.title : 'Lamaran Umum';
      $('#apply-title').textContent = job ? 'Lamar: ' + job.title : 'Kirim Lamaran Umum';
      modal.classList.add('open');
    }
    $('#apply-close').onclick = function () { modal.classList.remove('open'); };
    modal.onclick = function (e) { if (e.target === modal) modal.classList.remove('open'); };
    $('#btn-gen-apply').onclick = function () { openApply(null); };

    function renderJobs() {
      var qv = (jsEl.value || '').trim().toLowerCase();
      var list = jobs.filter(function (j) {
        if (curD !== 'Semua' && j.department !== curD) return false;
        if (qv && (j.title + ' ' + j.department + ' ' + j.location + ' ' + j.description).toLowerCase().indexOf(qv) < 0) return false;
        return true;
      });
      $('#car-grid').innerHTML = list.length ? list.map(function (j) {
        var reqs = (j.requirements || []).slice(0, 3).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('');
        return '<article class="jobcard"><div><div class="jobmeta"><span>' + esc(j.department) + '</span><span>' + esc(j.type) + '</span><span>' + esc(j.location) + '</span></div><h3>' + esc(j.title) + '</h3><p>' + esc(j.description) + '</p>' + (reqs ? '<ul class="bullet">' + reqs + '</ul>' : '') + '</div><div class="jobfoot"><span>' + esc(j.positions_available || 1) + ' posisi terbuka</span><button class="btn" type="button" data-apply="' + j.id + '">Lamar Sekarang</button></div></article>';
      }).join('') : '<div class="empty" style="grid-column:1/-1">Tidak ada lowongan yang cocok.</div>';
      $$('#car-tabs .tab').forEach(function (t) { t.classList.toggle('on', t.dataset.d === curD); });
      $$('[data-apply]').forEach(function (btn) {
        btn.onclick = function () {
          var j = jobs.filter(function (x) { return String(x.id) === String(btn.dataset.apply); })[0];
          openApply(j);
        };
      });
    }
    $$('#car-tabs .tab').forEach(function (t) { t.onclick = function () { curD = t.dataset.d; renderJobs(); }; });
    jsEl.oninput = renderJobs;
    renderJobs();

    $('#apply-form').onsubmit = function (e) {
      e.preventDefault();
      var db = window.KMStore.get();
      db.jobApplications.unshift({
        id: window.KMStore.nextId(db.jobApplications),
        job_position_id: $('#ap-job-id').value ? Number($('#ap-job-id').value) : null,
        position: $('#ap-pos').value.trim(),
        full_name: $('#ap-name').value.trim(),
        email: $('#ap-email').value.trim(),
        phone: $('#ap-phone').value.trim(),
        education: $('#ap-edu').value.trim() || '-',
        experience: $('#ap-exp').value.trim() || '-',
        cover_letter: $('#ap-cover').value.trim(),
        status: 'pending',
        notes: '',
        created_at: nowStr()
      });
      window.KMStore.save(db);
      e.target.reset();
      modal.classList.remove('open');
      toast('Lamaran berhasil dikirim dan tercatat di Admin Panel.');
    };
  }

  /* 10. CONTACT */
  if (page === 'contact') {
    $('#ct-info').innerHTML =
      '<div><dt>Alamat Kantor</dt><dd>' + esc(S.address) + '</dd></div>' +
      '<div><dt>Telepon &amp; WhatsApp</dt><dd><a href="tel:' + esc(S.phone.replace(/\s/g, '')) + '">' + esc(S.phone) + '</a> &middot; <a style="color:var(--green-1);font-weight:600" href="' + wa() + '">Chat WhatsApp &rarr;</a></dd></div>' +
      '<div><dt>Email</dt><dd><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a></dd></div>' +
      '<div><dt>Jam Operasional</dt><dd>' + esc(S.hours) + '<br>' + esc(S.hoursWeekend) + '</dd></div>' +
      '<div class="map"><iframe title="Peta lokasi Karmand" loading="lazy" src="https://www.google.com/maps?q=' + q + '&output=embed"></iframe></div>';

    $('#contact-form').onsubmit = function (e) {
      e.preventDefault();
      var db = window.KMStore.get();
      db.contacts.unshift({
        id: window.KMStore.nextId(db.contacts),
        name: $('#ct-name').value.trim(),
        email: $('#ct-email').value.trim(),
        phone: $('#ct-phone').value.trim() || '-',
        subject: $('#ct-subject').value.trim(),
        message: $('#ct-message').value.trim(),
        status: 'new',
        created_at: nowStr()
      });
      window.KMStore.save(db);
      e.target.reset();
      toast('Pesan berhasil dikirim dan masuk ke Admin Inbox.');
    };
  }
})();
