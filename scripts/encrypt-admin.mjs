import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '_site');

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!email || !password) {
  console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
  process.exit(1);
}

const SKIP = new Set(['.git', '.github', 'scripts', '_site', '.gitignore']);

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      // Never publish plaintext js/admin.js
      if (path.relative(ROOT, s).replace(/\\/g, '/') === 'js/admin.js') continue;
      fs.copyFileSync(s, d);
    }
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(ROOT, OUT);

// Extract admin shell HTML body (between <body> and <script src="../js/data.js">)
const adminHtmlSrc = fs.readFileSync(path.join(ROOT, 'admin', 'index.html'), 'utf8');
const bodyMatch = adminHtmlSrc.match(/<body>([\s\S]*?)<script src="\.\.\/js\/data\.js">/i);
if (!bodyMatch) {
  console.error('ERROR: Could not extract admin shell markup from admin/index.html');
  process.exit(1);
}
const adminShellHtml = bodyMatch[1].trim();
const adminJsSrc = fs.readFileSync(path.join(ROOT, 'js', 'admin.js'), 'utf8');

// Encrypt { html, js } with PBKDF2-SHA256 (300,000 iterations) + AES-256-GCM
const ITER = 300000;
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(`${email}:${password}`, salt, ITER, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const plaintext = Buffer.from(JSON.stringify({ html: adminShellHtml, js: adminJsSrc }), 'utf8');
const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();
// WebCrypto AES-GCM expects ciphertext || authTag concatenated
const ct = Buffer.concat([enc, tag]);

const vault = {
  v: 1,
  iter: ITER,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ct: ct.toString('base64'),
};

fs.writeFileSync(path.join(OUT, 'admin', 'vault.enc.json'), JSON.stringify(vault), 'utf8');

// Replace _site/admin/index.html with locked vault loader
const lockedAdminIndex = `<!DOCTYPE html>
<html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Admin Panel | PT Karmand Mitra Andalan</title>
<link rel="stylesheet" href="../css/theme.css"><link rel="stylesheet" href="../css/admin.css">
</head><body>
<div id="vault-root"></div>
<script src="../js/data.js"></script>
<script>
(function () {
  var raw;
  try { raw = sessionStorage.getItem('km_mockup_admin_vault'); } catch (e) {}
  if (!raw) {
    location.replace('login.html');
    return;
  }
  try {
    var payload = JSON.parse(raw);
    if (!payload || !payload.html || !payload.js) throw new Error('invalid');
    document.getElementById('vault-root').outerHTML = payload.html;
    var s = document.createElement('script');
    s.textContent = payload.js;
    document.body.appendChild(s);
  } catch (e) {
    try { sessionStorage.removeItem('km_mockup_admin_vault'); } catch (_) {}
    location.replace('login.html');
  }
})();
</script>
</body></html>
`;

fs.writeFileSync(path.join(OUT, 'admin', 'index.html'), lockedAdminIndex, 'utf8');
console.log('Encrypted admin vault built cleanly into _site/admin/vault.enc.json (plaintext js/admin.js excluded).');
