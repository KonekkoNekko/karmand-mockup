(function () {
  var AUTH_KEY = 'km_mockup_admin_auth';
  try {
    if (!localStorage.getItem(AUTH_KEY)) {
      location.replace('login.html');
      return;
    }
  } catch (e) {}

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var slugify = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('item-' + Date.now()); };
  var nowStr = function () { return new Date().toISOString().slice(0, 19).replace('T', ' '); };

  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  var drawerBg = $('#drawer-bg');
  function openDrawer(title, bodyHtml, footHtml) {
    $('#drawer-title').textContent = title;
    $('#drawer-body').innerHTML = bodyHtml;
    $('#drawer-foot').innerHTML = footHtml || '<button class="btn outline" type="button" id="df-close">Tutup</button>';
    var c = $('#df-close'); if (c) c.onclick = closeDrawer;
    drawerBg.classList.add('open');
  }
  function closeDrawer() { drawerBg.classList.remove('open'); }
  $('#drawer-close').onclick = closeDrawer;
  drawerBg.onclick = function (e) { if (e.target === drawerBg) closeDrawer(); };
  $('#burger').onclick = function () { $('#side').classList.toggle('open'); };
  $('#btn-logout').onclick = function () { try { localStorage.removeItem(AUTH_KEY); } catch (e) {} location.href = 'login.html'; };
  $('#btn-reset').onclick = function () { window.KMStore.reset(); toast('Data demo berhasil direset.'); render(); };

  var NAV_GROUPS = [
    { label: 'Utama', items: [['dashboard', 'Dashboard']] },
    { label: 'Konten Situs', items: [['about', 'About Us'], ['home-content', 'Home Content'], ['home-stats', 'Home Stats'], ['hero-sliders', 'Hero Sliders'], ['management-teams', 'Management Team'], ['partners', 'Partners']] },
    { label: 'Katalog & Publikasi', items: [['products', 'Products'], ['portfolios', 'Portfolios'], ['blog-posts', 'Blog Posts'], ['job-positions', 'Job Positions']] },
    { label: 'Inbox & Sistem', items: [['contacts', 'Contacts'], ['job-applications', 'Job Applications'], ['newsletters', 'Newsletters'], ['settings', 'Settings']] }
  ];

  function countFor(route, db) {
    var map = {
      products: db.products.length,
      portfolios: db.portfolios.length,
      'blog-posts': db.blogPosts.length,
      'hero-sliders': db.hero.length,
      'home-content': db.homeContents.length,
      'home-stats': db.homeStats.length,
      'management-teams': db.managementTeams.length,
      partners: db.partnerRecords.length,
      'job-positions': db.jobPositions.length,
      contacts: db.contacts.length,
      'job-applications': db.jobApplications.length,
      newsletters: db.newsletters.length
    };
    return map[route] != null ? map[route] : '';
  }

  function currentRoute() {
    var h = (location.hash || '#dashboard').replace(/^#/, '');
    return h || 'dashboard';
  }

  function renderNav(active) {
    var db = window.KMStore.get();
    $('#sidenav').innerHTML = NAV_GROUPS.map(function (g) {
      return '<div class="navgrp"><div class="navgrp-lbl">' + esc(g.label) + '</div>' +
        g.items.map(function (it) {
          var cnt = countFor(it[0], db);
          return '<a class="navlink' + (active === it[0] ? ' on' : '') + '" href="#' + it[0] + '"><span>' + esc(it[1]) + '</span>' + (cnt !== '' ? '<span class="cnt">' + cnt + '</span>' : '') + '</a>';
        }).join('') + '</div>';
    }).join('');
    $$('#sidenav .navlink').forEach(function (a) { a.onclick = function () { $('#side').classList.remove('open'); }; });
  }

  function statusPill(val) {
    var v = String(val || '').toLowerCase();
    if (v === 'true' || v === 'active' || v === 'published' || v === 'replied' || v === 'accepted') return '<span class="pill ok">' + esc(val === true ? 'Aktif' : val) + '</span>';
    if (v === 'new' || v === 'pending') return '<span class="pill warn">' + esc(val) + '</span>';
    if (v === 'reviewed' || v === 'read') return '<span class="pill info">' + esc(val) + '</span>';
    if (v === 'rejected') return '<span class="pill err">' + esc(val) + '</span>';
    return '<span class="pill">' + esc(val === false ? 'Nonaktif' : val) + '</span>';
  }

  /* Generic CRUD Resource Definitions (zero 500s: every resource has Index, Show, Create, Edit, Toggle, Delete) */
  var RESOURCES = {
    products: {
      title: 'Products', key: 'products', toggleKey: 'is_active',
      cols: [['name', 'Produk'], ['category', 'Kategori'], ['packaging', 'Kemasan'], ['is_active', 'Status']],
      fields: [
        { k: 'name', l: 'Nama Produk', req: true },
        { k: 'category', l: 'Kategori', type: 'select', opts: function (db) { return db.sections.map(function (s) { return [s[0], s[1]]; }); } },
        { k: 'packaging', l: 'Kemasan' },
        { k: 'price', l: 'Harga (Rp)' },
        { k: 'description', l: 'Deskripsi', type: 'textarea', req: true },
        { k: 'composition', l: 'Komposisi', type: 'textarea' },
        { k: 'usage', l: 'Cara Pakai', type: 'textarea' },
        { k: 'tokopedia_link', l: 'Link Tokopedia' },
        { k: 'shopee_link', l: 'Link Shopee' },
        { k: 'is_active', l: 'Aktif di website', type: 'checkbox', def: true }
      ],
      beforeSave: function (item) { if (!item.slug) item.slug = slugify(item.name); }
    },
    portfolios: {
      title: 'Portfolios', key: 'portfolios', toggleKey: 'is_active',
      cols: [['title', 'Judul Proyek'], ['client', 'Klien'], ['tag', 'Tag'], ['is_active', 'Status']],
      fields: [
        { k: 'title', l: 'Judul Proyek', req: true },
        { k: 'tag', l: 'Tag Kategori', req: true },
        { k: 'client', l: 'Klien', req: true },
        { k: 'location', l: 'Lokasi' },
        { k: 'duration', l: 'Durasi' },
        { k: 'value', l: 'Nilai Proyek' },
        { k: 'description', l: 'Deskripsi Proyek', type: 'textarea', req: true },
        { k: 'challenges', l: 'Tantangan', type: 'textarea' },
        { k: 'is_featured', l: 'Featured', type: 'checkbox', def: false },
        { k: 'is_active', l: 'Aktif', type: 'checkbox', def: true }
      ],
      beforeSave: function (item) { if (!item.slug) item.slug = slugify(item.title); }
    },
    'blog-posts': {
      title: 'Blog Posts', key: 'blogPosts', toggleKey: 'is_published',
      cols: [['title', 'Judul Artikel'], ['category', 'Kategori'], ['published_at', 'Tanggal'], ['is_published', 'Status']],
      fields: [
        { k: 'title', l: 'Judul Artikel', req: true },
        { k: 'category', l: 'Kategori', req: true, def: 'cold-galvanize' },
        { k: 'read_time', l: 'Waktu Baca (menit)', def: '5' },
        { k: 'published_at', l: 'Tanggal Publikasi', def: '2026-11-21' },
        { k: 'excerpt', l: 'Ringkasan', type: 'textarea', req: true },
        { k: 'content', l: 'Konten Artikel (HTML/Teks)', type: 'textarea', req: true },
        { k: 'is_published', l: 'Published', type: 'checkbox', def: true }
      ],
      beforeSave: function (item) { if (!item.slug) item.slug = slugify(item.title); }
    },
    'hero-sliders': {
      title: 'Hero Sliders', key: 'hero', toggleKey: 'is_active',
      cols: [['title', 'Judul'], ['highlight', 'Highlight'], ['cta', 'Tombol CTA'], ['is_active', 'Status']],
      fields: [
        { k: 'title', l: 'Judul', req: true },
        { k: 'highlight', l: 'Teks Highlight', req: true },
        { k: 'text', l: 'Deskripsi', type: 'textarea', req: true },
        { k: 'cta', l: 'Teks Tombol', def: 'Jelajahi Produk' },
        { k: 'order', l: 'Urutan', def: '1' },
        { k: 'is_active', l: 'Aktif', type: 'checkbox', def: true }
      ]
    },
    'home-content': {
      title: 'Home Content', key: 'homeContents', toggleKey: 'is_active',
      cols: [['company_name', 'Perusahaan'], ['about_title', 'Judul'], ['about_subtitle', 'Subjudul'], ['is_active', 'Status']],
      fields: [
        { k: 'company_name', l: 'Nama Perusahaan', req: true },
        { k: 'about_title', l: 'Judul Section', req: true },
        { k: 'about_subtitle', l: 'Subjudul' },
        { k: 'company_description', l: 'Deskripsi Utama', type: 'textarea', req: true },
        { k: 'mission', l: 'Misi', type: 'textarea' },
        { k: 'vision', l: 'Visi', type: 'textarea' },
        { k: 'is_active', l: 'Aktif', type: 'checkbox', def: true }
      ],
      afterSave: function (db, item) { if (item.is_active) db.about = item.company_description; }
    },
    'home-stats': {
      title: 'Home Stats', key: 'homeStats', toggleKey: 'is_active',
      cols: [['projects_completed', 'Proyek'], ['happy_clients', 'Klien'], ['team_members', 'Tim'], ['years_experience', 'Tahun'], ['is_active', 'Status']],
      fields: [
        { k: 'projects_completed', l: 'Proyek Selesai', req: true, def: '500' },
        { k: 'happy_clients', l: 'Klien Puas', req: true, def: '300' },
        { k: 'team_members', l: 'Anggota Tim', req: true, def: '50' },
        { k: 'years_experience', l: 'Tahun Pengalaman', req: true, def: '10' },
        { k: 'is_active', l: 'Aktif', type: 'checkbox', def: true }
      ],
      afterSave: function (db, item) {
        if (item.is_active) {
          db.stats = { projects: Number(item.projects_completed) || 0, clients: Number(item.happy_clients) || 0, team: Number(item.team_members) || 0, years: Number(item.years_experience) || 0 };
        }
      }
    },
    'management-teams': {
      title: 'Management Team', key: 'managementTeams', toggleKey: 'is_active',
      cols: [['name', 'Nama'], ['position', 'Jabatan'], ['order', 'Urutan'], ['is_active', 'Status']],
      fields: [
        { k: 'name', l: 'Nama Lengkap', req: true },
        { k: 'position', l: 'Jabatan', req: true },
        { k: 'description', l: 'Deskripsi / Bio', type: 'textarea' },
        { k: 'order', l: 'Urutan', def: '1' },
        { k: 'is_active', l: 'Aktif', type: 'checkbox', def: true }
      ]
    },
    partners: {
      title: 'Partners', key: 'partnerRecords', toggleKey: 'is_active',
      cols: [['name', 'Nama Partner'], ['website', 'Website'], ['order', 'Urutan'], ['is_active', 'Status']],
      fields: [
        { k: 'name', l: 'Nama Partner', req: true },
        { k: 'website', l: 'Website' },
        { k: 'order', l: 'Urutan', def: '1' },
        { k: 'is_active', l: 'Aktif', type: 'checkbox', def: true }
      ],
      afterSave: function (db) { db.partners = db.partnerRecords.filter(function (p) { return p.is_active; }).map(function (p) { return p.name; }); }
    },
    'job-positions': {
      title: 'Job Positions', key: 'jobPositions', toggleKey: 'is_active',
      cols: [['title', 'Posisi'], ['department', 'Departemen'], ['type', 'Tipe'], ['location', 'Lokasi'], ['is_active', 'Status']],
      fields: [
        { k: 'title', l: 'Judul Posisi', req: true },
        { k: 'department', l: 'Departemen', req: true, def: 'Technical' },
        { k: 'type', l: 'Tipe Kerja', def: 'Full Time' },
        { k: 'location', l: 'Lokasi', def: 'Surabaya' },
        { k: 'positions_available', l: 'Jumlah Kebutuhan', def: '1' },
        { k: 'description', l: 'Deskripsi Pekerjaan', type: 'textarea', req: true },
        { k: 'is_active', l: 'Aktif', type: 'checkbox', def: true }
      ],
      beforeSave: function (item) { if (!item.slug) item.slug = slugify(item.title); }
    }
  };

  function openResourceShow(route, id) {
    var cfg = RESOURCES[route];
    var db = window.KMStore.get();
    var item = db[cfg.key].filter(function (x) { return String(x.id) === String(id); })[0];
    if (!item) return;
    var kvHtml = '<dl class="kv">' + cfg.fields.map(function (f) {
      var val = item[f.k];
      if (f.type === 'checkbox') val = val ? 'Ya' : 'Tidak';
      return '<div><dt>' + esc(f.l) + '</dt><dd>' + esc(val == null || val === '' ? '-' : val) + '</dd></div>';
    }).join('') + '</dl>';

    /* Inline Prevention Exposures section for Products */
    if (route === 'products') {
      var exps = (db.preventionExposures || []).filter(function (e) { return String(e.product_id) === String(item.id); });
      kvHtml += '<div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b>Prevention Exposures (' + exps.length + ')</b><button class="btn sm" type="button" id="add-exp-btn">+ Tambah</button></div>' +
        (exps.length ? exps.map(function (e) {
          return '<div style="border:1px solid var(--line);border-radius:var(--r);padding:12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:8px"><b>' + esc(e.title) + '</b><button class="btn danger sm" data-del-exp="' + e.id + '" type="button">Hapus</button></div><p style="font-size:12.5px;color:var(--ink-2);margin-top:4px;white-space:pre-line">' + esc(e.description) + '</p></div>';
        }).join('') : '<p style="font-size:13px;color:var(--ink-3)">Belum ada data prevention exposure untuk produk ini.</p>') +
        '</div>';
    }

    openDrawer('Detail ' + cfg.title, kvHtml, '<button class="btn outline" type="button" id="df-close">Tutup</button><button class="btn" type="button" id="df-edit">Edit</button>');
    $('#df-edit').onclick = function () { openResourceForm(route, id); };
    if (route === 'products') {
      var addBtn = $('#add-exp-btn');
      if (addBtn) addBtn.onclick = function () { openExposureForm(item.id); };
      $$('[data-del-exp]').forEach(function (b) {
        b.onclick = function () {
          var d = window.KMStore.get();
          d.preventionExposures = d.preventionExposures.filter(function (x) { return String(x.id) !== String(b.dataset.delExp); });
          window.KMStore.save(d);
          toast('Prevention exposure dihapus.');
          openResourceShow('products', item.id);
        };
      });
    }
  }

  function openExposureForm(productId) {
    var html = '<form class="form" id="exp-form">' +
      '<div class="field"><label>Judul *</label><input id="ef-title" required placeholder="Contoh: Perlindungan Mata / Kulit"></div>' +
      '<div class="field"><label>Tipe</label><input id="ef-type" value="prevention"></div>' +
      '<div class="field"><label>Deskripsi *</label><textarea id="ef-desc" required placeholder="Instruksi pencegahan dan penanganan..."></textarea></div>' +
      '</form>';
    openDrawer('Tambah Prevention Exposure', html, '<button class="btn outline" type="button" id="df-back">Batal</button><button class="btn" type="submit" form="exp-form">Simpan</button>');
    $('#df-back').onclick = function () { openResourceShow('products', productId); };
    $('#exp-form').onsubmit = function (e) {
      e.preventDefault();
      var db = window.KMStore.get();
      db.preventionExposures.push({
        id: window.KMStore.nextId(db.preventionExposures),
        product_id: Number(productId),
        type: $('#ef-type').value.trim() || 'prevention',
        title: $('#ef-title').value.trim(),
        description: $('#ef-desc').value.trim(),
        sort_order: db.preventionExposures.length + 1
      });
      window.KMStore.save(db);
      toast('Prevention exposure ditambahkan.');
      openResourceShow('products', productId);
    };
  }

  function openResourceForm(route, id) {
    var cfg = RESOURCES[route];
    var db = window.KMStore.get();
    var existing = id != null ? db[cfg.key].filter(function (x) { return String(x.id) === String(id); })[0] : null;
    var html = '<form class="form" id="res-form">' + cfg.fields.map(function (f) {
      var val = existing ? existing[f.k] : (f.def !== undefined ? f.def : '');
      if (f.type === 'checkbox') {
        return '<label class="chk"><input type="checkbox" name="' + f.k + '"' + (val ? ' checked' : '') + '> ' + esc(f.l) + '</label>';
      }
      if (f.type === 'select') {
        var opts = f.opts(db);
        return '<div class="field"><label>' + esc(f.l) + '</label><select name="' + f.k + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(val) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
      }
      if (f.type === 'textarea') {
        return '<div class="field"><label>' + esc(f.l) + (f.req ? ' *' : '') + '</label><textarea name="' + f.k + '"' + (f.req ? ' required' : '') + '>' + esc(val) + '</textarea></div>';
      }
      return '<div class="field"><label>' + esc(f.l) + (f.req ? ' *' : '') + '</label><input name="' + f.k + '" value="' + esc(val) + '"' + (f.req ? ' required' : '') + '></div>';
    }).join('') + '</form>';

    openDrawer((existing ? 'Edit ' : 'Tambah ') + cfg.title, html, '<button class="btn outline" type="button" id="df-close">Batal</button><button class="btn" type="submit" form="res-form">Simpan</button>');
    $('#res-form').onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var obj = existing ? Object.assign({}, existing) : { id: window.KMStore.nextId(db[cfg.key]), created_at: nowStr() };
      cfg.fields.forEach(function (f) {
        obj[f.k] = f.type === 'checkbox' ? e.target.elements[f.k].checked : (fd.get(f.k) || '').trim();
      });
      if (cfg.beforeSave) cfg.beforeSave(obj);
      if (existing) {
        db[cfg.key] = db[cfg.key].map(function (x) { return String(x.id) === String(id) ? obj : x; });
      } else {
        db[cfg.key].unshift(obj);
      }
      if (cfg.afterSave) cfg.afterSave(db, obj);
      window.KMStore.save(db);
      closeDrawer();
      toast(cfg.title + ' berhasil disimpan.');
      render();
    };
  }

  function renderCrud(route) {
    var cfg = RESOURCES[route];
    var db = window.KMStore.get();
    $('#page-title').textContent = cfg.title;
    $('#topbar-actions').innerHTML = '<button class="btn" type="button" id="btn-create">+ Tambah ' + esc(cfg.title) + '</button>';
    $('#btn-create').onclick = function () { openResourceForm(route, null); };

    var query = '';
    function drawTable() {
      var list = window.KMStore.get()[cfg.key] || [];
      var filtered = list.filter(function (row) {
        if (!query) return true;
        return JSON.stringify(row).toLowerCase().indexOf(query) >= 0;
      });
      $('#crud-rows').innerHTML = filtered.length ? filtered.map(function (row) {
        return '<tr>' + cfg.cols.map(function (c) {
          var v = row[c[0]];
          return '<td>' + (typeof v === 'boolean' ? statusPill(v) : esc(v == null ? '-' : String(v).slice(0, 72))) + '</td>';
        }).join('') +
        '<td><div class="actions">' +
        '<button class="btn outline sm" data-show="' + row.id + '" type="button">Detail</button>' +
        '<button class="btn outline sm" data-edit="' + row.id + '" type="button">Edit</button>' +
        (cfg.toggleKey ? '<button class="btn outline sm" data-tog="' + row.id + '" type="button">Toggle</button>' : '') +
        '<button class="btn danger sm" data-del="' + row.id + '" type="button">Hapus</button>' +
        '</div></td></tr>';
      }).join('') : '<tr><td colspan="' + (cfg.cols.length + 1) + '" style="text-align:center;color:var(--ink-3);padding:28px">Tidak ada data.</td></tr>';

      $$('[data-show]').forEach(function (b) { b.onclick = function () { openResourceShow(route, b.dataset.show); }; });
      $$('[data-edit]').forEach(function (b) { b.onclick = function () { openResourceForm(route, b.dataset.edit); }; });
      $$('[data-tog]').forEach(function (b) {
        b.onclick = function () {
          var d = window.KMStore.get();
          d[cfg.key].forEach(function (x) { if (String(x.id) === String(b.dataset.tog)) x[cfg.toggleKey] = !x[cfg.toggleKey]; });
          if (cfg.afterSave) cfg.afterSave(d, {});
          window.KMStore.save(d);
          toast('Status diperbarui.');
          drawTable();
        };
      });
      $$('[data-del]').forEach(function (b) {
        b.onclick = function () {
          var d = window.KMStore.get();
          d[cfg.key] = d[cfg.key].filter(function (x) { return String(x.id) !== String(b.dataset.del); });
          if (cfg.afterSave) cfg.afterSave(d, {});
          window.KMStore.save(d);
          toast('Data dihapus.');
          renderNav(route);
          drawTable();
        };
      });
    }

    $('#view').innerHTML = '<div class="panel"><div class="panel-head"><h2>Daftar ' + esc(cfg.title) + ' (' + db[cfg.key].length + ')</h2><input class="search" id="crud-search" type="search" placeholder="Cari data..."></div>' +
      '<div class="tbl-wrap"><table><thead><tr>' + cfg.cols.map(function (c) { return '<th>' + esc(c[1]) + '</th>'; }).join('') + '<th>Aksi</th></tr></thead><tbody id="crud-rows"></tbody></table></div></div>';
    $('#crud-search').oninput = function (e) { query = e.target.value.trim().toLowerCase(); drawTable(); };
    drawTable();
  }

  /* Custom Views */
  function renderDashboard() {
    var db = window.KMStore.get();
    $('#page-title').textContent = 'Dashboard';
    $('#topbar-actions').innerHTML = '<a class="btn outline" href="../index.html">Buka Website &rarr;</a>';
    var newContacts = db.contacts.filter(function (c) { return c.status === 'new'; }).length;
    var pendingApps = db.jobApplications.filter(function (a) { return a.status === 'pending'; }).length;

    $('#view').innerHTML =
      '<div class="kpi-grid">' +
      '<div class="kpi"><span>Total Produk</span><b>' + db.products.length + '</b><small>' + db.products.filter(function (x) { return x.is_active; }).length + ' aktif</small></div>' +
      '<div class="kpi"><span>Portofolio</span><b>' + db.portfolios.length + '</b><small>' + db.portfolios.filter(function (x) { return x.is_featured; }).length + ' featured</small></div>' +
      '<div class="kpi"><span>Blog Posts</span><b>' + db.blogPosts.length + '</b><small>' + db.blogPosts.filter(function (x) { return x.is_published; }).length + ' published</small></div>' +
      '<div class="kpi"><span>Newsletter</span><b>' + db.newsletters.length + '</b><small>subscribers</small></div>' +
      '<div class="kpi"><span>Pesan Baru</span><b>' + newContacts + '</b><small>' + db.contacts.length + ' total</small></div>' +
      '<div class="kpi"><span>Lamaran Pending</span><b>' + pendingApps + '</b><small>' + db.jobApplications.length + ' total</small></div>' +
      '</div>' +
      '<div class="dash-split">' +
      '<div class="panel"><div class="panel-head"><h2>Pesan Kontak Terbaru</h2><a class="btn outline sm" href="#contacts">Lihat Semua</a></div><div class="tbl-wrap"><table><thead><tr><th>Nama</th><th>Subjek</th><th>Status</th></tr></thead><tbody>' +
      db.contacts.slice(0, 5).map(function (c) { return '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.subject) + '</td><td>' + statusPill(c.status) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '<div class="panel"><div class="panel-head"><h2>Lamaran Kerja Terbaru</h2><a class="btn outline sm" href="#job-applications">Lihat Semua</a></div><div class="tbl-wrap"><table><thead><tr><th>Nama</th><th>Posisi</th><th>Status</th></tr></thead><tbody>' +
      db.jobApplications.slice(0, 5).map(function (a) { return '<tr><td>' + esc(a.full_name) + '</td><td>' + esc(a.position) + '</td><td>' + statusPill(a.status) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '</div>';
  }

  function renderAbout() {
    var db = window.KMStore.get();
    var ab = db.aboutFull;
    $('#page-title').textContent = 'About Us';
    $('#topbar-actions').innerHTML = '';
    $('#view').innerHTML = '<div class="panel"><div class="panel-head"><h2>Profil Perusahaan, Visi &amp; Misi</h2></div><div class="panel-body"><form class="form" id="about-form">' +
      '<div class="frow"><div class="field"><label>Judul</label><input name="title" value="' + esc(ab.title) + '"></div><div class="field"><label>Subjudul</label><input name="subtitle" value="' + esc(ab.subtitle) + '"></div></div>' +
      '<div class="field"><label>Heading Utama</label><input name="main_heading" value="' + esc(ab.main_heading) + '"></div>' +
      '<div class="field"><label>Deskripsi Utama</label><textarea name="main_description">' + esc(ab.main_description) + '</textarea></div>' +
      '<div class="field"><label>Deskripsi Tambahan</label><textarea name="secondary_description">' + esc(ab.secondary_description) + '</textarea></div>' +
      '<div class="frow"><div class="field"><label>Misi</label><textarea name="mission">' + esc(ab.mission) + '</textarea></div><div class="field"><label>Visi</label><textarea name="vision">' + esc(ab.vision) + '</textarea></div></div>' +
      '<div><button class="btn" type="submit">Simpan Perubahan</button></div>' +
      '</form></div></div>';
    $('#about-form').onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      ['title', 'subtitle', 'main_heading', 'main_description', 'secondary_description', 'mission', 'vision'].forEach(function (k) { db.aboutFull[k] = fd.get(k); });
      db.about = db.aboutFull.main_description || db.about;
      window.KMStore.save(db);
      toast('Profil About Us berhasil diperbarui.');
    };
  }

  function renderContacts() {
    var db = window.KMStore.get();
    $('#page-title').textContent = 'Contacts Inbox';
    $('#topbar-actions').innerHTML = '';
    $('#view').innerHTML = '<div class="panel"><div class="panel-head"><h2>Pesan Masuk (' + db.contacts.length + ')</h2></div><div class="tbl-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Subjek</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      db.contacts.map(function (c) {
        return '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.email) + '</td><td>' + esc(c.subject) + '</td><td>' + statusPill(c.status) + '</td><td><div class="actions">' +
          '<button class="btn outline sm" data-cview="' + c.id + '" type="button">Detail</button>' +
          '<button class="btn danger sm" data-cdel="' + c.id + '" type="button">Hapus</button></div></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    $$('[data-cview]').forEach(function (b) {
      b.onclick = function () {
        var c = db.contacts.filter(function (x) { return String(x.id) === String(b.dataset.cview); })[0];
        if (!c) return;
        openDrawer('Detail Pesan',
          '<dl class="kv"><div><dt>Pengirim</dt><dd>' + esc(c.name) + ' (' + esc(c.email) + ')</dd></div>' +
          '<div><dt>Telepon</dt><dd>' + esc(c.phone || '-') + '</dd></div>' +
          '<div><dt>Subjek</dt><dd>' + esc(c.subject) + '</dd></div>' +
          '<div><dt>Pesan</dt><dd>' + esc(c.message) + '</dd></div>' +
          '<div><dt>Status</dt><dd>' + statusPill(c.status) + '</dd></div></dl>',
          '<button class="btn outline" type="button" id="cm-read">Tandai Dibaca</button><button class="btn" type="button" id="cm-rep">Tandai Dibalas</button>'
        );
        $('#cm-read').onclick = function () { c.status = 'read'; window.KMStore.save(db); closeDrawer(); toast('Ditandai dibaca.'); render(); };
        $('#cm-rep').onclick = function () { c.status = 'replied'; window.KMStore.save(db); closeDrawer(); toast('Ditandai dibalas.'); render(); };
      };
    });
    $$('[data-cdel]').forEach(function (b) {
      b.onclick = function () { db.contacts = db.contacts.filter(function (x) { return String(x.id) !== String(b.dataset.cdel); }); window.KMStore.save(db); toast('Pesan dihapus.'); render(); };
    });
  }

  function renderJobApps() {
    var db = window.KMStore.get();
    $('#page-title').textContent = 'Job Applications';
    $('#topbar-actions').innerHTML = '';
    $('#view').innerHTML = '<div class="panel"><div class="panel-head"><h2>Lamaran Masuk (' + db.jobApplications.length + ')</h2></div><div class="tbl-wrap"><table><thead><tr><th>Pelamar</th><th>Posisi</th><th>Email</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
      db.jobApplications.map(function (a) {
        return '<tr><td>' + esc(a.full_name) + '</td><td>' + esc(a.position) + '</td><td>' + esc(a.email) + '</td><td>' + statusPill(a.status) + '</td><td><div class="actions">' +
          '<button class="btn outline sm" data-aview="' + a.id + '" type="button">Detail</button>' +
          '<button class="btn danger sm" data-adel="' + a.id + '" type="button">Hapus</button></div></td></tr>';
      }).join('') + '</tbody></table></div></div>';

    $$('[data-aview]').forEach(function (b) {
      b.onclick = function () {
        var a = db.jobApplications.filter(function (x) { return String(x.id) === String(b.dataset.aview); })[0];
        if (!a) return;
        openDrawer('Detail Lamaran',
          '<dl class="kv"><div><dt>Pelamar</dt><dd>' + esc(a.full_name) + ' (' + esc(a.email) + ')</dd></div>' +
          '<div><dt>Posisi</dt><dd>' + esc(a.position) + '</dd></div>' +
          '<div><dt>Telepon</dt><dd>' + esc(a.phone || '-') + '</dd></div>' +
          '<div><dt>Pendidikan &amp; Pengalaman</dt><dd>' + esc(a.education || '-') + ' / ' + esc(a.experience || '-') + '</dd></div>' +
          '<div><dt>Cover Letter</dt><dd>' + esc(a.cover_letter || '-') + '</dd></div></dl>' +
          '<div class="field" style="margin-top:18px"><label>Ubah Status</label><select id="ja-st">' +
          ['pending', 'reviewed', 'accepted', 'rejected'].map(function (st) { return '<option value="' + st + '"' + (a.status === st ? ' selected' : '') + '>' + st + '</option>'; }).join('') +
          '</select></div>',
          '<button class="btn outline" type="button" id="df-close">Tutup</button><button class="btn" type="button" id="ja-save">Simpan Status</button>'
        );
        $('#ja-save').onclick = function () { a.status = $('#ja-st').value; window.KMStore.save(db); closeDrawer(); toast('Status lamaran diperbarui.'); render(); };
      };
    });
    $$('[data-adel]').forEach(function (b) {
      b.onclick = function () { db.jobApplications = db.jobApplications.filter(function (x) { return String(x.id) !== String(b.dataset.adel); }); window.KMStore.save(db); toast('Lamaran dihapus.'); render(); };
    });
  }

  function renderNewsletters() {
    var db = window.KMStore.get();
    $('#page-title').textContent = 'Newsletters';
    $('#topbar-actions').innerHTML = '<button class="btn outline" id="btn-csv" type="button">Export CSV</button>';
    $('#btn-csv').onclick = function () {
      var csv = 'id,email,is_active,created_at\n' + db.newsletters.map(function (n) { return [n.id, n.email, n.is_active, n.created_at].join(','); }).join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'karmand-newsletters.csv'; a.click();
      toast('CSV newsletter diekspor.');
    };
    $('#view').innerHTML = '<div class="panel"><div class="panel-head"><h2>Subscriber Newsletter (' + db.newsletters.length + ')</h2></div><div class="tbl-wrap"><table><thead><tr><th>Email</th><th>Status</th><th>Terdaftar</th><th>Aksi</th></tr></thead><tbody>' +
      db.newsletters.map(function (n) {
        return '<tr><td>' + esc(n.email) + '</td><td>' + statusPill(!!n.is_active) + '</td><td>' + esc(n.created_at || '-') + '</td><td><div class="actions">' +
          '<button class="btn outline sm" data-ntog="' + n.id + '" type="button">Toggle</button>' +
          '<button class="btn danger sm" data-ndel="' + n.id + '" type="button">Hapus</button></div></td></tr>';
      }).join('') + '</tbody></table></div></div>';
    $$('[data-ntog]').forEach(function (b) {
      b.onclick = function () { db.newsletters.forEach(function (x) { if (String(x.id) === String(b.dataset.ntog)) x.is_active = !x.is_active; }); window.KMStore.save(db); render(); };
    });
    $$('[data-ndel]').forEach(function (b) {
      b.onclick = function () { db.newsletters = db.newsletters.filter(function (x) { return String(x.id) !== String(b.dataset.ndel); }); window.KMStore.save(db); render(); };
    });
  }

  function renderSettings() {
    var db = window.KMStore.get();
    var S = db.site;
    $('#page-title').textContent = 'Site Settings';
    $('#topbar-actions').innerHTML = '';
    $('#view').innerHTML = '<div class="panel"><div class="panel-head"><h2>Pengaturan Website &amp; Kontak</h2></div><div class="panel-body"><form class="form" id="set-form">' +
      '<div class="frow"><div class="field"><label>Nama Perusahaan</label><input name="name" value="' + esc(S.name) + '"></div><div class="field"><label>Tagline</label><input name="tagline" value="' + esc(S.tagline) + '"></div></div>' +
      '<div class="frow"><div class="field"><label>Email</label><input name="email" value="' + esc(S.email) + '"></div><div class="field"><label>Telepon</label><input name="phone" value="' + esc(S.phone) + '"></div></div>' +
      '<div class="frow"><div class="field"><label>WhatsApp (628...)</label><input name="wa" value="' + esc(S.wa) + '"></div><div class="field"><label>Domain</label><input name="domain" value="' + esc(S.domain) + '"></div></div>' +
      '<div class="field"><label>Alamat Lengkap</label><textarea name="address">' + esc(S.address) + '</textarea></div>' +
      '<div class="frow"><div class="field"><label>Jam Operasional (Senin-Jumat)</label><input name="hours" value="' + esc(S.hours) + '"></div><div class="field"><label>Jam Operasional (Akhir Pekan)</label><input name="hoursWeekend" value="' + esc(S.hoursWeekend) + '"></div></div>' +
      '<div class="frow"><div class="field"><label>Instagram URL</label><input name="instagram" value="' + esc(S.instagram) + '"></div><div class="field"><label>Facebook URL</label><input name="facebook" value="' + esc(S.facebook) + '"></div></div>' +
      '<div><button class="btn" type="submit">Simpan Pengaturan</button></div>' +
      '</form></div></div>';
    $('#set-form').onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      ['name', 'tagline', 'email', 'phone', 'wa', 'domain', 'address', 'hours', 'hoursWeekend', 'instagram', 'facebook'].forEach(function (k) { db.site[k] = fd.get(k); });
      window.KMStore.save(db);
      toast('Pengaturan website tersimpan.');
    };
  }

  function render() {
    window.KMStore.reload();
    var r = currentRoute();
    renderNav(r);
    if (r === 'dashboard') return renderDashboard();
    if (r === 'about') return renderAbout();
    if (r === 'contacts') return renderContacts();
    if (r === 'job-applications') return renderJobApps();
    if (r === 'newsletters') return renderNewsletters();
    if (r === 'settings') return renderSettings();
    if (RESOURCES[r]) return renderCrud(r);
    renderDashboard();
  }

  window.addEventListener('hashchange', render);
  render();
})();
