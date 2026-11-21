// Dev Ev App — Tools: 50 working developer tools. Everything runs on this PC; nothing is uploaded.
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toast = (m) => { const t = $('#bcToast'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2000); };
const copy = (text) => navigator.clipboard.writeText(text).then(() => toast('Copied'));
const download = (name, data, type = 'text/plain') => { const a = document.createElement('a'); a.href = typeof data === 'string' && data.startsWith('data:') ? data : URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); };
const store = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem('devev-tool-' + k)); localStorage.setItem('devev-tool-' + k, JSON.stringify(v)); } catch (_) { return null; } };

const TOOLS = [];
const T = (id, cat, name, desc, build) => TOOLS.push({ id, cat, name, desc, build });

// Generic "paste text → press a button → get text" tool
function textTool(sample, actions, opts = {}) {
  return (box) => {
    box.appendChild(el(`<div class="tl-io">
      <label>${opts.inLabel || 'Input'}<textarea class="tl-in" spellcheck="false"></textarea></label>
      <div class="tl-actions"></div>
      <label>${opts.outLabel || 'Result'}<textarea class="tl-out" spellcheck="false" readonly></textarea></label>
      <div class="tl-row"><button class="btn small tl-copy">📋 Copy result</button><span class="tl-msg muted small"></span></div></div>`));
    const inp = $('.tl-in', box), out = $('.tl-out', box), msg = $('.tl-msg', box);
    inp.value = sample;
    actions.forEach(([label, fn], i) => {
      const b = el(`<button class="btn ${i ? '' : 'primary'}">${label}</button>`);
      b.addEventListener('click', async () => { msg.textContent = ''; try { out.value = await fn(inp.value); } catch (e) { out.value = ''; msg.textContent = '⚠ ' + e.message; } });
      $('.tl-actions', box).appendChild(b);
    });
    $('.tl-copy', box).addEventListener('click', () => copy(out.value));
    if (opts.live) inp.addEventListener('input', () => $('.tl-actions .btn', box).click());
    $('.tl-actions .btn', box).click();
  };
}

// ---------- Data & formats ----------
T('json', 'Data', 'JSON formatter', 'Tidy, minify and check JSON.', textTool('{"name":"Dev Ev","blocks":[1,2,3],"ok":true}', [
  ['Format', (s) => JSON.stringify(JSON.parse(s), null, 2)], ['Minify', (s) => JSON.stringify(JSON.parse(s))],
  ['Check', (s) => { JSON.parse(s); return '✓ Valid JSON'; }], ['Sort keys', (s) => JSON.stringify(sortKeys(JSON.parse(s)), null, 2)]]));
function sortKeys(o) { if (Array.isArray(o)) return o.map(sortKeys); if (o && typeof o === 'object') return Object.fromEntries(Object.keys(o).sort().map((k) => [k, sortKeys(o[k])])); return o; }
T('json2csv', 'Data', 'JSON → CSV', 'Turn a JSON list into a spreadsheet table.', textTool('[{"name":"Ann","score":10},{"name":"Bo","score":7}]', [['Convert', (s) => {
  const arr = JSON.parse(s); if (!Array.isArray(arr)) throw new Error('Needs a list [ ... ]');
  const keys = [...new Set(arr.flatMap((o) => Object.keys(o)))];
  const cell = (v) => { v = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return [keys.join(','), ...arr.map((o) => keys.map((k) => cell(o[k])).join(','))].join('\n'); }]]));
function parseCSV(s) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < s.length; i++) { const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; } else cur += c; }
  if (cur || row.length) { row.push(cur); rows.push(row); } return rows;
}
T('csv2json', 'Data', 'CSV → JSON', 'Turn a spreadsheet table into JSON.', textTool('name,score\nAnn,10\nBo,7', [['Convert', (s) => {
  const [head, ...rows] = parseCSV(s.trim()); return JSON.stringify(rows.map((r) => Object.fromEntries(head.map((h, i) => [h, isNaN(r[i]) || r[i] === '' ? r[i] : Number(r[i])]))), null, 2); }]]));
T('json2ts', 'Data', 'JSON → TypeScript', 'Make TypeScript types from example JSON.', textTool('{"id":1,"name":"Ann","tags":["a"],"pos":{"x":0,"y":0}}', [['Make types', (s) => {
  const out = []; const tn = (k) => k.replace(/(^|_|-)(\w)/g, (_, a, b) => b.toUpperCase()) || 'Item';
  const typeOf = (v, k) => { if (v === null) return 'null'; if (Array.isArray(v)) return (v.length ? typeOf(v[0], k.replace(/s$/, '')) : 'unknown') + '[]';
    if (typeof v === 'object') { iface(tn(k), v); return tn(k); } return typeof v; };
  const iface = (name, o) => { out.unshift(`interface ${name} {\n${Object.entries(o).map(([k, v]) => `  ${/^\w+$/.test(k) ? k : JSON.stringify(k)}: ${typeOf(v, k)};`).join('\n')}\n}`); };
  iface('Root', JSON.parse(s)); return out.join('\n\n'); }]]));
T('yaml', 'Data', 'JSON → YAML', 'Write JSON as YAML (config files).', textTool('{"app":"Dev Ev","version":2,"features":["blocks","tools"],"window":{"w":1280,"h":800}}', [['Convert', (s) => toYaml(JSON.parse(s), 0).trim()]]));
function toYaml(v, ind) {
  const p = '  '.repeat(ind);
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === 'object') ? `${p}-\n${toYaml(x, ind + 1)}` : `${p}- ${yv(x)}`).join('\n') + '\n';
  if (v && typeof v === 'object') return Object.entries(v).map(([k, x]) => (x && typeof x === 'object') ? `${p}${k}:\n${toYaml(x, ind + 1).replace(/\n$/, '')}` : `${p}${k}: ${yv(x)}`).join('\n') + '\n';
  return p + yv(v) + '\n';
}
function yv(x) { return typeof x === 'string' && (/[:#\-{}[\],&*?|>!%@`]/.test(x) || x.trim() !== x || x === '') ? JSON.stringify(x) : String(x); }
T('base64', 'Encode', 'Base64', 'Encode or decode Base64 text.', textTool('Hello, Dev Ev!', [
  ['Encode', (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)))],
  ['Decode', (s) => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0)))]]));
T('url', 'Encode', 'URL encode / decode', 'Make text safe for web addresses.', textTool('name=Dev Ev & age=10?', [['Encode', encodeURIComponent], ['Decode', decodeURIComponent],
  ['Split a URL', (s) => { const u = new URL(s.includes('://') ? s : 'https://example.com/?' + s); return [`protocol: ${u.protocol}`, `host: ${u.host}`, `path: ${u.pathname}`, `hash: ${u.hash}`, 'query:', ...[...u.searchParams].map(([k, v]) => `  ${k} = ${v}`)].join('\n'); }]]));
T('html-ent', 'Encode', 'HTML entities', 'Show code safely inside a web page.', textTool('<p class="hi">Tom & Jerry</p>', [['Encode', esc],
  ['Decode', (s) => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; }]]));
T('jwt', 'Encode', 'JWT decoder', 'Read what’s inside a login token.', textTool('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiRGV2IEV2IiwiaWF0IjoxNzAwMDAwMDAwfQ.sig', [['Decode', (s) => {
  const parts = s.trim().split('.'); if (parts.length < 2) throw new Error('A JWT has 3 parts separated by dots');
  const dec = (p) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(p.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(p.length / 4) * 4, '=')), (c) => c.charCodeAt(0))));
  const pay = dec(parts[1]); const dates = ['iat', 'exp', 'nbf'].filter((k) => pay[k]).map((k) => `${k}: ${new Date(pay[k] * 1000).toLocaleString()}`);
  return `HEADER\n${JSON.stringify(dec(parts[0]), null, 2)}\n\nPAYLOAD\n${JSON.stringify(pay, null, 2)}${dates.length ? '\n\nDATES\n' + dates.join('\n') : ''}\n\n(The signature is not checked.)`; }]]));
const hash = (alg) => async (s) => [...new Uint8Array(await crypto.subtle.digest(alg, new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
T('hash', 'Encode', 'Hash generator', 'SHA-1 / SHA-256 / SHA-512 fingerprints.', textTool('Dev Ev App', [['SHA-256', hash('SHA-256')], ['SHA-1', hash('SHA-1')], ['SHA-384', hash('SHA-384')], ['SHA-512', hash('SHA-512')]]));
T('escape', 'Encode', 'String escaper', 'Escape text for code strings.', textTool('She said "hi"\nNew line\tTab', [['To JS string', (s) => JSON.stringify(s)],
  ['From JS string', (s) => JSON.parse(s.trim().startsWith('"') ? s : '"' + s + '"')], ['Escape regex', (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')]]));
T('binary', 'Encode', 'Text ↔ binary / hex', 'See text as 0s and 1s or hex.', textTool('Hi!', [
  ['To binary', (s) => [...new TextEncoder().encode(s)].map((b) => b.toString(2).padStart(8, '0')).join(' ')],
  ['To hex', (s) => [...new TextEncoder().encode(s)].map((b) => b.toString(16).padStart(2, '0')).join(' ')],
  ['From binary/hex', (s) => { const parts = s.trim().split(/\s+/); const base = parts.every((p) => /^[01]{8}$/.test(p)) ? 2 : 16; return new TextDecoder().decode(new Uint8Array(parts.map((p) => parseInt(p, base)))); }]]));
const MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
T('morse', 'Encode', 'Morse code', 'Text ↔ Morse code.', textTool('SOS dev ev', [['To Morse', (s) => s.toLowerCase().split(' ').map((w) => [...w].map((c) => MORSE[c] || '').filter(Boolean).join(' ')).join(' / ')],
  ['From Morse', (s) => { const r = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k])); return s.trim().split(' / ').map((w) => w.split(' ').map((c) => r[c] || '?').join('')).join(' '); }]]));

// ---------- Text ----------
const words = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
T('case', 'Text', 'Case converter', 'camelCase, snake_case, kebab-case and more.', textTool('my cool game score', [
  ['camelCase', (s) => words(s).map((w, i) => i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join('')],
  ['PascalCase', (s) => words(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('')],
  ['snake_case', (s) => words(s).map((w) => w.toLowerCase()).join('_')], ['kebab-case', (s) => words(s).map((w) => w.toLowerCase()).join('-')],
  ['CONSTANT', (s) => words(s).map((w) => w.toUpperCase()).join('_')], ['Title Case', (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())],
  ['UPPER', (s) => s.toUpperCase()], ['lower', (s) => s.toLowerCase()]]));
T('slug', 'Text', 'Slug maker', 'Turn a title into a web-address name.', textTool('My First Game: Space Dodge!', [['Make slug', (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')]], { live: true }));
T('stats', 'Text', 'Word & character counter', 'Count words, characters, lines and reading time.', textTool('Type or paste some text here to count it.', [['Count', (s) => {
  const w = (s.match(/\S+/g) || []).length; return `Words: ${w}\nCharacters: ${s.length}\nCharacters (no spaces): ${s.replace(/\s/g, '').length}\nLines: ${s ? s.split('\n').length : 0}\nSentences: ${(s.match(/[.!?]+(\s|$)/g) || []).length}\nBytes (UTF-8): ${new TextEncoder().encode(s).length}\nReading time: ~${Math.max(1, Math.round(w / 200))} min`; }]], { live: true }));
T('lines', 'Text', 'Line tools', 'Sort, remove duplicates, reverse, shuffle, number.', textTool('banana\napple\ncherry\napple', [
  ['Sort A→Z', (s) => s.split('\n').sort((a, b) => a.localeCompare(b)).join('\n')], ['Sort Z→A', (s) => s.split('\n').sort((a, b) => b.localeCompare(a)).join('\n')],
  ['Remove duplicates', (s) => [...new Set(s.split('\n'))].join('\n')], ['Reverse', (s) => s.split('\n').reverse().join('\n')],
  ['Shuffle', (s) => s.split('\n').map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).join('\n')],
  ['Number lines', (s) => s.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n')], ['Remove empty', (s) => s.split('\n').filter((l) => l.trim()).join('\n')],
  ['Trim spaces', (s) => s.split('\n').map((l) => l.trim()).join('\n')]]));
T('replace', 'Text', 'Find & replace', 'Replace text everywhere (regex allowed).', (box) => {
  box.appendChild(el(`<div class="tl-io"><label>Text<textarea class="tl-in">The cat sat on the cat mat.</textarea></label>
    <div class="tl-row"><input class="tl-f" placeholder="Find" value="cat"><input class="tl-r" placeholder="Replace with" value="dog">
    <label class="small"><input type="checkbox" class="tl-rx"> regex</label><label class="small"><input type="checkbox" class="tl-ci"> ignore case</label></div>
    <label>Result<textarea class="tl-out" readonly></textarea></label><div class="tl-row"><button class="btn small tl-copy">📋 Copy</button><span class="tl-msg muted small"></span></div></div>`));
  const run = () => { try { const f = $('.tl-f', box).value; if (!f) { $('.tl-out', box).value = $('.tl-in', box).value; return; }
    const re = new RegExp($('.tl-rx', box).checked ? f : f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g' + ($('.tl-ci', box).checked ? 'i' : ''));
    const n = ($('.tl-in', box).value.match(re) || []).length; $('.tl-out', box).value = $('.tl-in', box).value.replace(re, $('.tl-r', box).value); $('.tl-msg', box).textContent = n + ' replaced'; }
    catch (e) { $('.tl-msg', box).textContent = '⚠ ' + e.message; } };
  box.querySelectorAll('input,textarea.tl-in').forEach((i) => i.addEventListener('input', run)); $('.tl-copy', box).addEventListener('click', () => copy($('.tl-out', box).value)); run();
});
T('regex', 'Text', 'Regex tester', 'Test a pattern and see every match highlighted.', (box) => {
  box.appendChild(el(`<div class="tl-io"><div class="tl-row"><span>/</span><input class="tl-p grow" value="\\b(\\w)(\\w*)\\b"><span>/</span><input class="tl-fl" value="g" style="width:60px"></div>
    <label>Test text<textarea class="tl-in">Learn to code with Dev Ev blocks.</textarea></label><div class="tl-hl"></div><pre class="tl-pre"></pre>
    <details><summary class="small">Cheat sheet</summary><pre class="tl-pre">.  any character     \\d digit      \\w letter/digit/_   \\s space
^  start             $  end         *  0 or more         +  1 or more
?  0 or 1            {2,4} 2 to 4   [abc] one of these   [^abc] not these
(…) group            a|b a or b     \\b word edge         flags: g i m s u</pre></details></div>`));
  const run = () => { const out = $('.tl-pre', box), hl = $('.tl-hl', box), txt = $('.tl-in', box).value;
    try { const fl = $('.tl-fl', box).value.includes('g') ? $('.tl-fl', box).value : $('.tl-fl', box).value + 'g'; const re = new RegExp($('.tl-p', box).value, fl);
      const ms = [...txt.matchAll(re)]; let html = '', last = 0;
      ms.forEach((m) => { html += esc(txt.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>'; last = m.index + m[0].length; });
      hl.innerHTML = html + esc(txt.slice(last));
      out.textContent = `${ms.length} match${ms.length === 1 ? '' : 'es'}\n` + ms.slice(0, 50).map((m, i) => `${i + 1}. "${m[0]}" at ${m.index}${m.length > 1 ? '  groups: ' + m.slice(1).map((g) => JSON.stringify(g)).join(', ') : ''}`).join('\n');
    } catch (e) { out.textContent = '⚠ ' + e.message; hl.textContent = txt; } };
  box.querySelectorAll('input,textarea').forEach((i) => i.addEventListener('input', run)); run();
});
T('diff', 'Text', 'Text compare (diff)', 'See which lines changed between two versions.', (box) => {
  box.appendChild(el(`<div class="tl-io"><div class="tl-2"><label>Before<textarea class="tl-a">let score = 0;\nmove(10);\nsay("hi");</textarea></label>
    <label>After<textarea class="tl-b">let score = 0;\nmove(20);\nsay("hi");\nplaySound("pop");</textarea></label></div><pre class="tl-diff"></pre></div>`));
  const run = () => { const a = $('.tl-a', box).value.split('\n'), b = $('.tl-b', box).value.split('\n');
    const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0, out = '', add = 0, del = 0;
    while (i < n || j < m) { if (i < n && j < m && a[i] === b[j]) { out += `<div>  ${esc(a[i])}</div>`; i++; j++; }
      else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { out += `<div class="add">+ ${esc(b[j])}</div>`; j++; add++; }
      else { out += `<div class="del">− ${esc(a[i])}</div>`; i++; del++; } }
    $('.tl-diff', box).innerHTML = `<div class="muted">${add} added, ${del} removed</div>` + out; };
  box.querySelectorAll('textarea').forEach((t) => t.addEventListener('input', run)); run();
});
T('lorem', 'Text', 'Placeholder text', 'Lorem ipsum filler text for designs.', textTool('3', [['Paragraphs', (s) => lorem(+s || 3, 'p')], ['Sentences', (s) => lorem(+s || 3, 's')], ['Words', (s) => lorem(+s || 3, 'w')]], { inLabel: 'How many?' }));
function lorem(n, kind) {
  const W = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat'.split(' ');
  const word = () => W[Math.floor(Math.random() * W.length)];
  const sent = () => { const s = Array.from({ length: 8 + Math.floor(Math.random() * 8) }, word).join(' '); return s[0].toUpperCase() + s.slice(1) + '.'; };
  if (kind === 'w') return Array.from({ length: n }, word).join(' ');
  if (kind === 's') return Array.from({ length: n }, sent).join(' ');
  return Array.from({ length: n }, () => Array.from({ length: 4 + Math.floor(Math.random() * 3) }, sent).join(' ')).join('\n\n');
}
T('markdown', 'Text', 'Markdown preview', 'Write Markdown, see the formatted page.', (box) => {
  box.appendChild(el(`<div class="tl-2"><textarea class="tl-in" style="min-height:300px"># My game\n\nA **fast** game where you _dodge_ rocks.\n\n## Controls\n- Arrow keys to move\n- Space to jump\n\n1. Collect coins\n2. Avoid rocks\n\n> Have fun!\n\n\`move(10)\` moves the sprite. [Dev Ev](https://neyshanaddo-chat.github.io/Dev-Ev-app/)\n\n\`\`\`\nwhile (true) { move(1); }\n\`\`\`</textarea><div class="tl-md"></div></div>`));
  const run = () => { $('.tl-md', box).innerHTML = md($('.tl-in', box).value); };
  $('.tl-in', box).addEventListener('input', run); run();
});
function md(src) {
  const blocks = []; src = src.replace(/```([\s\S]*?)```/g, (_, c) => { blocks.push('<pre><code>' + esc(c.replace(/^\n/, '')) + '</code></pre>'); return '\u0000' + (blocks.length - 1) + '\u0000'; });
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>').replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  let html = '', list = null;
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  src.split('\n').forEach((line) => {
    let m;
    if ((m = line.match(/^\u0000(\d+)\u0000$/))) { close(); html += blocks[m[1]]; }
    else if ((m = line.match(/^(#{1,6})\s+(.*)/))) { close(); html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; }
    else if ((m = line.match(/^\s*[-*+]\s+(.*)/))) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; } html += `<li>${inline(m[1])}</li>`; }
    else if ((m = line.match(/^\s*\d+\.\s+(.*)/))) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; } html += `<li>${inline(m[1])}</li>`; }
    else if ((m = line.match(/^>\s?(.*)/))) { close(); html += `<blockquote>${inline(m[1])}</blockquote>`; }
    else if (/^(-{3,}|\*{3,})$/.test(line.trim())) { close(); html += '<hr>'; }
    else if (!line.trim()) close();
    else { close(); html += `<p>${inline(line)}</p>`; }
  });
  close(); return html;
}

// ---------- Code ----------
T('playground', 'Code', 'HTML / CSS / JS playground', 'Write a web page and see it live.', (box) => {
  const saved = store('playground') || { html: '<h1>Hello!</h1>\n<button id="b">Click me</button>', css: 'body { font-family: sans-serif; text-align: center; }\nh1 { color: #2563eb; }', js: "document.getElementById('b').onclick = () => alert('Hi from Dev Ev!');" };
  box.appendChild(el(`<div><div class="tl-3"><label>HTML<textarea class="tl-h code"></textarea></label><label>CSS<textarea class="tl-c code"></textarea></label><label>JavaScript<textarea class="tl-j code"></textarea></label></div>
    <div class="tl-row"><button class="btn primary tl-run">▶ Run</button><label class="small"><input type="checkbox" class="tl-auto" checked> auto-run</label><span class="grow"></span><button class="btn small tl-dl">⬇ Download page</button></div>
    <iframe class="tl-frame" sandbox="allow-scripts allow-modals"></iframe></div>`));
  $('.tl-h', box).value = saved.html; $('.tl-c', box).value = saved.css; $('.tl-j', box).value = saved.js;
  const page = () => `<!doctype html><html><head><meta charset="utf-8"><style>${$('.tl-c', box).value}</style></head><body>${$('.tl-h', box).value}<script>${$('.tl-j', box).value.replace(/<\/script/gi, '<\\/script')}<\/script></body></html>`;
  const run = () => { $('.tl-frame', box).srcdoc = page(); store('playground', { html: $('.tl-h', box).value, css: $('.tl-c', box).value, js: $('.tl-j', box).value }); };
  let t; box.querySelectorAll('textarea').forEach((a) => a.addEventListener('input', () => { if ($('.tl-auto', box).checked) { clearTimeout(t); t = setTimeout(run, 500); } }));
  $('.tl-run', box).addEventListener('click', run); $('.tl-dl', box).addEventListener('click', () => download('page.html', page(), 'text/html')); run();
});
T('jsrun', 'Code', 'JavaScript console', 'Run JavaScript and see console.log output.', (box) => {
  box.appendChild(el(`<div class="tl-io"><label>Code<textarea class="tl-in code" style="min-height:180px">// Try changing this!\nconst names = ['Ann', 'Bo', 'Cy'];\nfor (const n of names) {\n  console.log('Hello, ' + n);\n}\nconsole.log(2 + 2 * 10);</textarea></label>
    <div class="tl-row"><button class="btn primary tl-run">▶ Run (Ctrl+Enter)</button><button class="btn small tl-clr">Clear</button></div><pre class="tl-pre tl-con"></pre><iframe class="tl-hidden" sandbox="allow-scripts"></iframe></div>`));
  const con = $('.tl-con', box), frame = $('.tl-hidden', box);
  window.addEventListener('message', (e) => { if (e.source !== frame.contentWindow || !e.data || !e.data.devevLog) return; con.textContent += e.data.devevLog + '\n'; });
  const run = () => { con.textContent = ''; frame.srcdoc = `<script>const send=(p,a)=>parent.postMessage({devevLog:p+a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ')},'*');
console.log=(...a)=>send('',a);console.error=(...a)=>send('❌ ',a);console.warn=(...a)=>send('⚠ ',a);
window.onerror=(m,s,l)=>send('❌ ',[m+' (line '+(l-3)+')']);
<\/script><script>${$('.tl-in', box).value.replace(/<\/script/gi, '<\\/script')}\n;parent.postMessage({devevLog:'✓ done'},'*')<\/script>`; };
  $('.tl-run', box).addEventListener('click', run); $('.tl-clr', box).addEventListener('click', () => { con.textContent = ''; });
  $('.tl-in', box).addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'Enter') run(); });
});
T('cssmin', 'Code', 'CSS minify / beautify', 'Shrink or tidy CSS.', textTool('body{margin:0;padding:0}h1{color:red;font-size:2em}', [
  ['Beautify', (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*{\s*/g, ' {\n  ').replace(/;\s*/g, ';\n  ').replace(/\s*}\s*/g, '\n}\n\n').replace(/\n  \n}/g, '\n}').trim()],
  ['Minify', (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').trim()]]));
T('htmlfmt', 'Code', 'HTML formatter', 'Indent messy HTML so it’s readable.', textTool('<div><h1>Title</h1><ul><li>One</li><li>Two</li></ul><p>Text <b>bold</b></p></div>', [['Format', (s) => {
  let ind = 0; const out = []; const voids = /^<(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)\b/i;
  s.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/).map((x) => x.trim()).filter(Boolean).forEach((tok) => {
    if (/^<\//.test(tok)) ind = Math.max(0, ind - 1);
    out.push('  '.repeat(ind) + tok);
    if (/^<[^/!]/.test(tok) && !/\/>$/.test(tok) && !voids.test(tok)) ind++;
  }); return out.join('\n'); }], ['Minify', (s) => s.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()]]));
T('sqlfmt', 'Code', 'SQL formatter', 'Put SQL keywords on their own lines.', textTool('select id, name, score from players where score > 10 and active = 1 order by score desc limit 5', [['Format', (s) => {
  const kw = ['select', 'from', 'where', 'and', 'or', 'order by', 'group by', 'having', 'limit', 'join', 'left join', 'right join', 'inner join', 'on', 'insert into', 'values', 'update', 'set', 'delete from'];
  let o = ' ' + s.replace(/\s+/g, ' ') + ' ';
  kw.sort((a, b) => b.length - a.length).forEach((k) => { o = o.replace(new RegExp('\\s' + k.replace(' ', '\\s+') + '\\s', 'gi'), (m) => '\n' + (['and', 'or', 'on'].includes(k) ? '  ' : '') + k.toUpperCase() + ' '); });
  return o.replace(/,\s*/g, ',\n  ').trim(); }]]));
T('keycode', 'Code', 'Key code finder', 'Press any key to see its name and code.', (box) => {
  box.appendChild(el(`<div><div class="tl-big" tabindex="0">Click here, then press a key</div><pre class="tl-pre"></pre></div>`));
  const big = $('.tl-big', box);
  big.addEventListener('keydown', (e) => { e.preventDefault(); big.textContent = e.key === ' ' ? 'Space' : e.key;
    $('.tl-pre', box).textContent = `event.key:   ${JSON.stringify(e.key)}\nevent.code:  ${JSON.stringify(e.code)}\nkeyCode:     ${e.keyCode}\nShift: ${e.shiftKey}  Ctrl: ${e.ctrlKey}  Alt: ${e.altKey}\n\nIn Dev Ev blocks use: "${({ ' ': 'space', ArrowUp: 'up arrow', ArrowDown: 'down arrow', ArrowLeft: 'left arrow', ArrowRight: 'right arrow', Enter: 'enter' })[e.key] || e.key.toLowerCase()}"`; });
  setTimeout(() => big.focus(), 50);
});
T('http', 'Code', 'HTTP status codes', 'What 200, 404, 500… mean.', (box) => {
  const codes = [[200, 'OK', 'It worked.'], [201, 'Created', 'Something new was made.'], [204, 'No Content', 'Worked, nothing to send back.'], [301, 'Moved Permanently', 'The page lives somewhere else now.'], [302, 'Found', 'Temporarily somewhere else.'], [304, 'Not Modified', 'Use your saved copy.'], [400, 'Bad Request', 'The request was wrong.'], [401, 'Unauthorized', 'You need to log in.'], [403, 'Forbidden', 'Logged in but not allowed.'], [404, 'Not Found', 'Nothing at that address.'], [405, 'Method Not Allowed', 'Wrong kind of request (GET/POST…).'], [408, 'Request Timeout', 'Took too long.'], [409, 'Conflict', 'Clashes with what’s there.'], [413, 'Payload Too Large', 'Too much data sent.'], [418, "I'm a teapot", 'A joke code.'], [429, 'Too Many Requests', 'Slow down.'], [500, 'Internal Server Error', 'The server broke.'], [502, 'Bad Gateway', 'A server in the middle failed.'], [503, 'Service Unavailable', 'Down or busy.'], [504, 'Gateway Timeout', 'A server in the middle took too long.']];
  box.appendChild(el(`<div><input class="tl-s" placeholder="Search e.g. 404 or found"><table class="tl-table"></table></div>`));
  const run = () => { const q = $('.tl-s', box).value.toLowerCase(); $('.tl-table', box).innerHTML = codes.filter((c) => c.join(' ').toLowerCase().includes(q)).map(([c, n, d]) => `<tr><td><strong>${c}</strong></td><td>${n}</td><td class="muted">${d}</td></tr>`).join(''); };
  $('.tl-s', box).addEventListener('input', run); run();
});
T('cron', 'Code', 'Cron explainer', 'Read a cron schedule in plain English.', textTool('30 9 * * 1-5', [['Explain', (s) => {
  const f = s.trim().split(/\s+/); if (f.length !== 5) throw new Error('A cron schedule has 5 parts: minute hour day month weekday');
  const [mi, hr, dom, mon, dow] = f; const D = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const part = (v, name, map) => v === '*' ? `every ${name}` : v.startsWith('*/') ? `every ${v.slice(2)} ${name}s` : `${name} ${v.split(',').map((x) => x.includes('-') ? x.split('-').map((y) => map ? map[+y] : y).join(' to ') : (map ? map[+x] : x)).join(', ')}`;
  return `Runs at: ${part(mi, 'minute')}, ${part(hr, 'hour')}\nOn: ${part(dom, 'day-of-month')}, ${part(mon, 'month')}, ${part(dow, 'weekday', D)}\n\n${/^\d+$/.test(mi) && /^\d+$/.test(hr) ? `i.e. at ${hr.padStart(2, '0')}:${mi.padStart(2, '0')}` : ''}`; }]], { inLabel: 'Cron (minute hour day month weekday)' }));

// ---------- Design ----------
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); }
function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]; }
function hslToRgb(h, s, l) { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0) * 255, f(8) * 255, f(4) * 255]; }
function lum(hex) { return hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); }
T('color', 'Design', 'Colour converter', 'Pick a colour; get HEX, RGB and HSL.', (box) => {
  box.appendChild(el(`<div class="tl-row"><input type="color" class="tl-cp" value="#2563eb" style="width:80px;height:60px"><pre class="tl-pre grow"></pre></div>`));
  const run = () => { const hx = $('.tl-cp', box).value, [r, g, b] = hexToRgb(hx), [hh, s, l] = rgbToHsl(r, g, b);
    $('.tl-pre', box).innerHTML = [hx, `rgb(${r}, ${g}, ${b})`, `hsl(${hh}, ${s}%, ${l}%)`, `0x${hx.slice(1).toUpperCase()}`].map((v) => `<button class="btn small tl-cv">${v}</button>`).join(' ');
    box.querySelectorAll('.tl-cv').forEach((b2) => b2.addEventListener('click', () => copy(b2.textContent))); };
  $('.tl-cp', box).addEventListener('input', run); run();
});
T('contrast', 'Design', 'Contrast checker', 'Is your text readable on its background?', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><label>Text <input type="color" class="tl-fg" value="#111111"></label><label>Background <input type="color" class="tl-bg" value="#ffffff"></label></div><div class="tl-sample">The quick brown fox</div><pre class="tl-pre"></pre></div>`));
  const run = () => { const f = $('.tl-fg', box).value, b = $('.tl-bg', box).value, a = lum(f), c = lum(b), r = (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05);
    Object.assign($('.tl-sample', box).style, { color: f, background: b });
    $('.tl-pre', box).textContent = `Contrast ratio: ${r.toFixed(2)} : 1\n\nNormal text  AA ${r >= 4.5 ? '✓ pass' : '✗ fail'}   AAA ${r >= 7 ? '✓ pass' : '✗ fail'}\nLarge text   AA ${r >= 3 ? '✓ pass' : '✗ fail'}   AAA ${r >= 4.5 ? '✓ pass' : '✗ fail'}`; };
  box.querySelectorAll('input').forEach((i) => i.addEventListener('input', run)); run();
});
T('palette', 'Design', 'Palette maker', 'Shades, tints and matching colours.', (box) => {
  box.appendChild(el(`<div><input type="color" class="tl-cp" value="#2563eb"><div class="tl-swatches"></div><p class="muted small">Click a colour to copy it.</p></div>`));
  const run = () => { const [r, g, b] = hexToRgb($('.tl-cp', box).value), [h, s, l] = rgbToHsl(r, g, b);
    const row = (name, list) => `<div class="small">${name}</div><div class="tl-sw">${list.map((c) => `<button style="background:${c}" title="${c}" data-c="${c}"></button>`).join('')}</div>`;
    const mk = (hh, ss, ll) => rgbToHex(...hslToRgb((hh + 360) % 360, ss, ll));
    $('.tl-swatches', box).innerHTML = row('Shades', [95, 85, 70, 55, 45, 35, 25, 15].map((L) => mk(h, s, L))) + row('Matching (complementary, triad, analogous)', [mk(h + 180, s, l), mk(h + 120, s, l), mk(h + 240, s, l), mk(h + 30, s, l), mk(h - 30, s, l)]);
    box.querySelectorAll('[data-c]').forEach((b2) => b2.addEventListener('click', () => copy(b2.dataset.c))); };
  $('.tl-cp', box).addEventListener('input', run); run();
});
const cssTool = (controls, css, previewHtml = '<div class="tl-box">Preview</div>') => (box) => {
  box.appendChild(el(`<div class="tl-2"><div class="tl-ctrls">${controls}</div><div><div class="tl-prev">${previewHtml}</div><pre class="tl-pre tl-css"></pre><button class="btn small tl-copy">📋 Copy CSS</button></div></div>`));
  const run = () => { const v = Object.fromEntries([...box.querySelectorAll('[data-k]')].map((i) => [i.dataset.k, i.type === 'checkbox' ? i.checked : i.value]));
    const c = css(v); $('.tl-css', box).textContent = c; $('.tl-prev > *', box).setAttribute('style', c.replace(/\n/g, ' ')); };
  box.querySelectorAll('[data-k]').forEach((i) => i.addEventListener('input', run)); $('.tl-copy', box).addEventListener('click', () => copy($('.tl-css', box).textContent)); run();
};
const rng = (k, label, min, max, v) => `<label>${label} <input type="range" data-k="${k}" min="${min}" max="${max}" value="${v}"></label>`;
T('gradient', 'Design', 'Gradient maker', 'Make a CSS colour gradient.', cssTool(`<label>Colour 1 <input type="color" data-k="a" value="#2563eb"></label><label>Colour 2 <input type="color" data-k="b" value="#ec4899"></label>${rng('ang', 'Angle', 0, 360, 135)}<label><input type="checkbox" data-k="rad"> round (radial)</label>`,
  (v) => `background: ${v.rad ? `radial-gradient(circle, ${v.a}, ${v.b})` : `linear-gradient(${v.ang}deg, ${v.a}, ${v.b})`};`));
T('shadow', 'Design', 'Shadow maker', 'Make a CSS box shadow.', cssTool(`${rng('x', 'Right', -40, 40, 6)}${rng('y', 'Down', -40, 40, 8)}${rng('blur', 'Blur', 0, 80, 20)}${rng('sp', 'Spread', -20, 40, 0)}${rng('op', 'Darkness', 0, 100, 30)}<label><input type="checkbox" data-k="in"> inside</label>`,
  (v) => `box-shadow: ${v.in ? 'inset ' : ''}${v.x}px ${v.y}px ${v.blur}px ${v.sp}px rgba(0, 0, 0, ${v.op / 100});`));
T('radius', 'Design', 'Corner rounder', 'Make CSS rounded corners.', cssTool(`${rng('tl', 'Top left', 0, 100, 20)}${rng('tr', 'Top right', 0, 100, 20)}${rng('br', 'Bottom right', 0, 100, 20)}${rng('bl', 'Bottom left', 0, 100, 20)}`,
  (v) => `border-radius: ${v.tl}px ${v.tr}px ${v.br}px ${v.bl}px;`));
T('flexbox', 'Design', 'Flexbox playground', 'Learn how CSS flexbox lines things up.', cssTool(
  ['flex-direction:row,column,row-reverse,column-reverse', 'justify-content:flex-start,center,flex-end,space-between,space-around,space-evenly', 'align-items:stretch,flex-start,center,flex-end', 'flex-wrap:nowrap,wrap'].map((x) => { const [k, o] = x.split(':'); return `<label>${k} <select data-k="${k}">${o.split(',').map((y) => `<option>${y}</option>`).join('')}</select></label>`; }).join('') + rng('gap', 'gap', 0, 40, 8),
  (v) => `display: flex;\nflex-direction: ${v['flex-direction']};\njustify-content: ${v['justify-content']};\nalign-items: ${v['align-items']};\nflex-wrap: ${v['flex-wrap']};\ngap: ${v.gap}px;`,
  '<div class="tl-flex"><span>1</span><span>2</span><span>3</span><span>4</span></div>'));
T('units', 'Design', 'px / rem / em converter', 'Convert CSS sizes.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><label>Value <input class="tl-v" value="24" style="width:80px"></label><select class="tl-u"><option>px</option><option>rem</option><option>pt</option><option>%</option></select><label>Base font size <input class="tl-b" value="16" style="width:60px"> px</label></div><pre class="tl-pre"></pre></div>`));
  const run = () => { const v = +$('.tl-v', box).value || 0, base = +$('.tl-b', box).value || 16, u = $('.tl-u', box).value;
    const px = u === 'px' ? v : u === 'rem' ? v * base : u === 'pt' ? v * 4 / 3 : v / 100 * base;
    $('.tl-pre', box).textContent = `${+px.toFixed(3)} px\n${+(px / base).toFixed(4)} rem (and em)\n${+(px * 0.75).toFixed(3)} pt\n${+(px / base * 100).toFixed(2)} %`; };
  box.querySelectorAll('input,select').forEach((i) => i.addEventListener('input', run)); run();
});
T('aspect', 'Design', 'Aspect ratio calculator', 'Resize while keeping the same shape.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><label>Width <input class="tl-w" value="1920" style="width:90px"></label><label>Height <input class="tl-h2" value="1080" style="width:90px"></label></div>
    <div class="tl-row"><label>New width <input class="tl-nw" value="1280" style="width:90px"></label></div><pre class="tl-pre"></pre></div>`));
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const run = () => { const w = +$('.tl-w', box).value, hh = +$('.tl-h2', box).value, nw = +$('.tl-nw', box).value; if (!w || !hh) return; const g = gcd(w, hh);
    $('.tl-pre', box).textContent = `Ratio: ${w / g}:${hh / g}  (${(w / hh).toFixed(3)})\nNew size: ${nw} × ${Math.round(nw * hh / w)}\nCSS: aspect-ratio: ${w / g} / ${hh / g};`; };
  box.querySelectorAll('input').forEach((i) => i.addEventListener('input', run)); run();
});
T('easing', 'Design', 'Easing curves', 'See how animations speed up and slow down.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><select class="tl-e"><option>linear</option><option>ease</option><option>ease-in</option><option>ease-out</option><option>ease-in-out</option><option>cubic-bezier(0.68,-0.55,0.27,1.55)</option></select><button class="btn primary tl-go">▶ Play</button></div><div class="tl-track"><div class="tl-ball"></div></div><pre class="tl-pre"></pre></div>`));
  const go = () => { const b = $('.tl-ball', box), e = $('.tl-e', box).value; b.style.transition = 'none'; b.style.left = '0'; void b.offsetWidth; b.style.transition = `left 1.2s ${e}`; b.style.left = 'calc(100% - 30px)'; $('.tl-pre', box).textContent = `transition: left 1.2s ${e};`; };
  $('.tl-go', box).addEventListener('click', go); $('.tl-e', box).addEventListener('change', go); setTimeout(go, 100);
});

// ---------- Generators ----------
T('uuid', 'Generate', 'UUID generator', 'Unique IDs for your data.', textTool('5', [['Generate', (s) => Array.from({ length: Math.min(500, +s || 1) }, () => crypto.randomUUID()).join('\n')]], { inLabel: 'How many?' }));
T('password', 'Generate', 'Password generator', 'Strong random passwords.', (box) => {
  box.appendChild(el(`<div><div class="tl-row">${rng('len', 'Length', 6, 64, 16).replace('data-k', 'class="tl-len" data-x')}<label><input type="checkbox" class="tl-sym" checked> symbols</label><label><input type="checkbox" class="tl-num" checked> numbers</label><button class="btn primary tl-go">Generate</button></div><div class="tl-big tl-pw"></div><button class="btn small tl-copy">📋 Copy</button></div>`));
  const go = () => { let set = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'; if ($('.tl-num', box).checked) set += '23456789'; if ($('.tl-sym', box).checked) set += '!@#$%^&*-_=+?';
    const n = +$('.tl-len', box).value, a = crypto.getRandomValues(new Uint32Array(n)); $('.tl-pw', box).textContent = [...a].map((x) => set[x % set.length]).join(''); };
  box.querySelectorAll('input').forEach((i) => i.addEventListener('input', go)); $('.tl-go', box).addEventListener('click', go); $('.tl-copy', box).addEventListener('click', () => copy($('.tl-pw', box).textContent)); go();
});
T('random', 'Generate', 'Dice & random numbers', 'Roll dice, flip coins, pick numbers.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><button class="btn primary" data-r="d6">🎲 Roll a die</button><button class="btn" data-r="2d6">🎲🎲 Two dice</button><button class="btn" data-r="coin">🪙 Flip a coin</button><button class="btn" data-r="d20">d20</button></div>
    <div class="tl-row"><label>From <input class="tl-a" value="1" style="width:70px"></label><label>to <input class="tl-b" value="100" style="width:70px"></label><button class="btn" data-r="range">Pick</button></div><div class="tl-big tl-res">?</div></div>`));
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  box.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => { const r = b.dataset.r, out = $('.tl-res', box);
    out.textContent = r === 'd6' ? ri(1, 6) : r === '2d6' ? (() => { const a = ri(1, 6), c = ri(1, 6); return `${a} + ${c} = ${a + c}`; })() : r === 'coin' ? (Math.random() < 0.5 ? 'Heads' : 'Tails') : r === 'd20' ? ri(1, 20) : ri(+$('.tl-a', box).value || 0, +$('.tl-b', box).value || 0); }));
});
T('pixel', 'Game dev', 'Pixel art editor', 'Draw sprites pixel by pixel; save as PNG.', (box) => {
  const N = 16; const saved = store('pixel') || Array(N * N).fill('');
  box.appendChild(el(`<div class="tl-2"><div><div class="tl-grid" style="grid-template-columns:repeat(${N},1fr)"></div></div><div><div class="tl-row"><input type="color" class="tl-pc" value="#2563eb"><button class="btn small tl-er">Eraser</button><button class="btn small tl-fill">Fill all</button><button class="btn small tl-clr">Clear</button></div>
    <div class="tl-sw tl-pal"></div><p class="muted small">Click or drag to paint. Right-click to erase.</p><div class="tl-row"><button class="btn primary tl-png">⬇ Save PNG (x16)</button><button class="btn tl-mir">↔ Mirror</button></div><canvas class="tl-pv" width="64" height="64"></canvas></div></div>`));
  const grid = $('.tl-grid', box); let erase = false, painting = false;
  ['#000000', '#ffffff', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#6d4c41', '#9e9e9e', '#f8bbd0', '#80deea'].forEach((c) => { const b = el(`<button style="background:${c}"></button>`); b.addEventListener('click', () => { $('.tl-pc', box).value = c; erase = false; }); $('.tl-pal', box).appendChild(b); });
  const cells = saved.map((c, i) => { const d = el('<div></div>'); d.style.background = c; d.addEventListener('pointerdown', (e) => { painting = true; paint(i, e.button === 2); }); d.addEventListener('pointerenter', (e) => { if (painting) paint(i, e.buttons === 2); }); d.addEventListener('contextmenu', (e) => e.preventDefault()); grid.appendChild(d); return d; });
  window.addEventListener('pointerup', () => { painting = false; });
  const pv = () => { const c = $('.tl-pv', box).getContext('2d'); c.clearRect(0, 0, 64, 64); saved.forEach((col, i) => { if (col) { c.fillStyle = col; c.fillRect((i % N) * 4, Math.floor(i / N) * 4, 4, 4); } }); store('pixel', saved); };
  const paint = (i, er) => { saved[i] = (er || erase) ? '' : $('.tl-pc', box).value; cells[i].style.background = saved[i]; pv(); };
  $('.tl-er', box).addEventListener('click', () => { erase = true; }); $('.tl-pc', box).addEventListener('input', () => { erase = false; });
  $('.tl-clr', box).addEventListener('click', () => { saved.fill(''); cells.forEach((c) => { c.style.background = ''; }); pv(); });
  $('.tl-fill', box).addEventListener('click', () => { saved.fill($('.tl-pc', box).value); cells.forEach((c) => { c.style.background = saved[0]; }); pv(); });
  $('.tl-mir', box).addEventListener('click', () => { for (let y = 0; y < N; y++) for (let x = 0; x < N / 2; x++) { const a = y * N + x, b = y * N + N - 1 - x; saved[b] = saved[a]; cells[b].style.background = saved[b]; } pv(); });
  $('.tl-png', box).addEventListener('click', () => { const c = document.createElement('canvas'); c.width = c.height = N * 16; const x = c.getContext('2d'); saved.forEach((col, i) => { if (col) { x.fillStyle = col; x.fillRect((i % N) * 16, Math.floor(i / N) * 16, 16, 16); } }); download('sprite.png', c.toDataURL('image/png')); });
  pv();
});
T('sfx', 'Game dev', 'Sound effect maker', 'Design retro game sounds.', (box) => {
  box.appendChild(el(`<div class="tl-2"><div class="tl-ctrls"><label>Wave <select class="tl-w"><option>square</option><option>sawtooth</option><option>triangle</option><option>sine</option></select></label>
    ${rng('f1', 'Start pitch', 50, 2000, 300).replace('data-k', 'class="tl-f1" data-x')}${rng('f2', 'End pitch', 50, 2000, 900).replace('data-k', 'class="tl-f2" data-x')}${rng('d', 'Length (ms)', 30, 1500, 250).replace('data-k', 'class="tl-d" data-x')}${rng('vib', 'Wobble', 0, 50, 0).replace('data-k', 'class="tl-vb" data-x')}</div>
    <div><div class="tl-row"><button class="btn primary tl-play">▶ Play</button><button class="btn tl-rand">🎲 Random</button></div><div class="tl-row">${['coin', 'jump', 'laser', 'hit', 'powerup'].map((p) => `<button class="btn small" data-p="${p}">${p}</button>`).join('')}</div><pre class="tl-pre"></pre></div></div>`));
  let ac; const P = { coin: ['square', 900, 1800, 150, 0], jump: ['square', 200, 800, 220, 0], laser: ['sawtooth', 1500, 200, 250, 0], hit: ['sawtooth', 300, 60, 180, 10], powerup: ['triangle', 300, 1500, 600, 20] };
  const play = () => { ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(), d = +$('.tl-d', box).value / 1000;
    o.type = $('.tl-w', box).value; o.frequency.setValueAtTime(+$('.tl-f1', box).value, ac.currentTime); o.frequency.exponentialRampToValueAtTime(+$('.tl-f2', box).value, ac.currentTime + d);
    const vb = +$('.tl-vb', box).value; if (vb) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 12; lg.gain.value = vb * 4; l.connect(lg).connect(o.frequency); l.start(); l.stop(ac.currentTime + d); }
    g.gain.setValueAtTime(0.2, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d + 0.02);
    $('.tl-pre', box).textContent = `wave: ${o.type}, pitch ${$('.tl-f1', box).value} → ${$('.tl-f2', box).value} Hz, ${$('.tl-d', box).value} ms, wobble ${vb}`; };
  const set = ([w, a, b, d, v]) => { $('.tl-w', box).value = w; $('.tl-f1', box).value = a; $('.tl-f2', box).value = b; $('.tl-d', box).value = d; $('.tl-vb', box).value = v; play(); };
  $('.tl-play', box).addEventListener('click', play); box.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => set(P[b.dataset.p])));
  $('.tl-rand', box).addEventListener('click', () => set([['square', 'sawtooth', 'triangle', 'sine'][Math.floor(Math.random() * 4)], 60 + Math.random() * 1500, 60 + Math.random() * 1500, 60 + Math.random() * 700, Math.random() < 0.3 ? Math.random() * 40 : 0]));
});
T('icon', 'Game dev', 'Icon maker', 'Make an app or game icon from an emoji.', (box) => {
  box.appendChild(el(`<div class="tl-2"><div class="tl-ctrls"><label>Emoji or letters <input class="tl-t" value="🚀" style="width:100px"></label><label>Background <input type="color" class="tl-bgc" value="#2563eb"></label><label>Shape <select class="tl-sh"><option>rounded</option><option>circle</option><option>square</option></select></label><label>Size <select class="tl-sz"><option>512</option><option>192</option><option>180</option><option>64</option><option>32</option></select></label></div>
    <div><canvas class="tl-ic" width="256" height="256"></canvas><div class="tl-row"><button class="btn primary tl-dl">⬇ Save PNG</button></div></div></div>`));
  const drawI = (c, S) => { const x = c.getContext('2d'); x.clearRect(0, 0, S, S); x.fillStyle = $('.tl-bgc', box).value; const sh = $('.tl-sh', box).value; x.beginPath();
    if (sh === 'circle') x.arc(S / 2, S / 2, S / 2, 0, 7); else x.roundRect(0, 0, S, S, sh === 'rounded' ? S * 0.22 : 0); x.fill();
    const t = $('.tl-t', box).value; x.font = `${S * (t.length > 2 ? 0.35 : 0.6)}px "Segoe UI Emoji","Segoe UI",sans-serif`; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, S / 2, S * 0.54); };
  const run = () => drawI($('.tl-ic', box), 256);
  box.querySelectorAll('input,select').forEach((i) => i.addEventListener('input', run));
  $('.tl-dl', box).addEventListener('click', () => { const S = +$('.tl-sz', box).value, c = document.createElement('canvas'); c.width = c.height = S; drawI(c, S); download(`icon-${S}.png`, c.toDataURL('image/png')); }); run();
});
T('tilemap', 'Game dev', 'Level / tile map maker', 'Lay out a game level as a grid, export as code.', (box) => {
  const C = 20, R = 12, tiles = ['', '🧱', '🪙', '🌳', '💧', '🔥', '⭐', '🏁', '👾'];
  const map = store('tilemap') || Array(C * R).fill(0);
  box.appendChild(el(`<div><div class="tl-row tl-tiles"></div><div class="tl-map" style="grid-template-columns:repeat(${C},1fr)"></div><div class="tl-row"><button class="btn primary tl-exp">Show as code</button><button class="btn small tl-clr">Clear</button></div><pre class="tl-pre"></pre></div>`));
  let cur = 1, down = false;
  tiles.forEach((t, i) => { const b = el(`<button class="btn small">${t || '⬜ empty'}</button>`); b.addEventListener('click', () => { cur = i; box.querySelectorAll('.tl-tiles .btn').forEach((x) => x.classList.remove('primary')); b.classList.add('primary'); }); $('.tl-tiles', box).appendChild(b); if (i === 1) b.classList.add('primary'); });
  const cells = map.map((v, i) => { const d = el(`<div>${tiles[v]}</div>`); const set = () => { map[i] = cur; d.textContent = tiles[cur]; store('tilemap', map); };
    d.addEventListener('pointerdown', () => { down = true; set(); }); d.addEventListener('pointerenter', () => { if (down) set(); }); $('.tl-map', box).appendChild(d); return d; });
  window.addEventListener('pointerup', () => { down = false; });
  $('.tl-clr', box).addEventListener('click', () => { map.fill(0); cells.forEach((c) => { c.textContent = ''; }); store('tilemap', map); });
  $('.tl-exp', box).addEventListener('click', () => { $('.tl-pre', box).textContent = `// 0 empty, ${tiles.slice(1).map((t, i) => `${i + 1} ${t}`).join(', ')}\nconst level = [\n${Array.from({ length: R }, (_, r) => '  [' + map.slice(r * C, r * C + C).join(',') + ']').join(',\n')}\n];`; });
});
T('spritesheet', 'Game dev', 'Animation previewer', 'Flip between emoji frames like a flipbook.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><label>Frames <input class="tl-fr" value="🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘" style="width:260px"></label>${rng('fps', 'Speed (fps)', 1, 30, 8).replace('data-k', 'class="tl-fps" data-x')}</div><div class="tl-big tl-anim">🌑</div></div>`));
  let i = 0; const tick = () => { if (!box.isConnected) return; const f = $('.tl-fr', box).value.trim().split(/\s+/); $('.tl-anim', box).textContent = f[i++ % f.length]; setTimeout(tick, 1000 / (+$('.tl-fps', box).value || 8)); }; tick();
});

// ---------- Numbers & time ----------
T('base', 'Numbers', 'Number base converter', 'Decimal ↔ binary ↔ hex ↔ octal.', (box) => {
  box.appendChild(el(`<div class="tl-ctrls">${[['10', 'Decimal'], ['2', 'Binary'], ['16', 'Hex'], ['8', 'Octal']].map(([b, n]) => `<label>${n} <input data-b="${b}" ${b === '10' ? 'value="255"' : ''}></label>`).join('')}</div>`));
  const ins = box.querySelectorAll('[data-b]');
  const from = (src) => { const n = parseInt(src.value.trim() || '0', +src.dataset.b); ins.forEach((i) => { if (i !== src) i.value = isNaN(n) ? '' : n.toString(+i.dataset.b).toUpperCase(); }); };
  ins.forEach((i) => i.addEventListener('input', () => from(i))); from(ins[0]);
});
T('time', 'Numbers', 'Timestamp converter', 'Unix time ↔ readable date.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><label>Unix time <input class="tl-u" style="width:160px"></label><button class="btn small tl-now">Now</button></div><div class="tl-row"><label>Date <input type="datetime-local" class="tl-d" step="1"></label></div><pre class="tl-pre"></pre></div>`));
  const show = (ms) => { const d = new Date(ms); $('.tl-pre', box).textContent = `Local: ${d.toLocaleString()}\nUTC:   ${d.toUTCString()}\nISO:   ${d.toISOString()}\nSeconds: ${Math.floor(ms / 1000)}\nMilliseconds: ${ms}`; };
  $('.tl-u', box).addEventListener('input', () => { let v = +$('.tl-u', box).value; if (v < 1e11) v *= 1000; show(v); $('.tl-d', box).value = new Date(v - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19); });
  $('.tl-d', box).addEventListener('input', () => { const v = new Date($('.tl-d', box).value).getTime(); $('.tl-u', box).value = Math.floor(v / 1000); show(v); });
  $('.tl-now', box).addEventListener('click', () => { $('.tl-u', box).value = Math.floor(Date.now() / 1000); $('.tl-u', box).dispatchEvent(new Event('input')); }); $('.tl-now', box).click();
});
T('datediff', 'Numbers', 'Days between dates', 'Count days, weeks and months between two dates.', (box) => {
  const today = new Date().toISOString().slice(0, 10);
  box.appendChild(el(`<div><div class="tl-row"><label>From <input type="date" class="tl-a" value="${today}"></label><label>To <input type="date" class="tl-b" value="${new Date().getFullYear()}-12-25"></label></div><pre class="tl-pre"></pre></div>`));
  const run = () => { const a = new Date($('.tl-a', box).value), b = new Date($('.tl-b', box).value), d = Math.round((b - a) / 864e5);
    $('.tl-pre', box).textContent = isNaN(d) ? '' : `${d} days\n${(d / 7).toFixed(1)} weeks\n${(d / 30.44).toFixed(1)} months\n${(d / 365.25).toFixed(2)} years\n${d * 24} hours`; };
  box.querySelectorAll('input').forEach((i) => i.addEventListener('input', run)); run();
});
T('bytes', 'Numbers', 'File size converter', 'Bytes ↔ KB ↔ MB ↔ GB.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><input class="tl-v" value="5" style="width:100px"><select class="tl-u"><option>B</option><option>KB</option><option selected>MB</option><option>GB</option><option>TB</option></select></div><pre class="tl-pre"></pre></div>`));
  const U = ['B', 'KB', 'MB', 'GB', 'TB'];
  const run = () => { const b = (+$('.tl-v', box).value || 0) * Math.pow(1024, U.indexOf($('.tl-u', box).value));
    $('.tl-pre', box).textContent = U.map((u, i) => `${+(b / Math.pow(1024, i)).toPrecision(6)} ${u}`).join('\n') + `\n\n(1 KB = 1024 bytes)\nDownload time at 50 Mbps: ${(b * 8 / 50e6).toFixed(1)} s`; };
  box.querySelectorAll('input,select').forEach((i) => i.addEventListener('input', run)); run();
});
T('calc', 'Numbers', 'Calculator', 'Type maths like (2+3)*4 or sqrt(16).', textTool('(2 + 3) * 4 ^ 2 / sqrt(16)', [['=', (s) => {
  if (!/^[\d\s+\-*/().,^%a-z]*$/i.test(s)) throw new Error('Only numbers and maths please');
  const fns = 'sqrt|abs|round|floor|ceil|sin|cos|tan|log|min|max|pow|PI|E'; if (s.replace(new RegExp(fns, 'g'), '').match(/[a-z]/i)) throw new Error('Unknown word');
  return String(Function('"use strict";const {' + fns.split('|').join(',') + '}=Math;return (' + s.replace(/\^/g, '**') + ')')()); }]], { live: true }));
T('stopwatch', 'Numbers', 'Stopwatch & timer', 'Time things, or count down.', (box) => {
  box.appendChild(el(`<div><div class="tl-big tl-sw-t">00:00.0</div><div class="tl-row"><button class="btn primary tl-ss">Start</button><button class="btn tl-lap">Lap</button><button class="btn tl-rs">Reset</button><span class="grow"></span><label>Count down from <input class="tl-cd" value="5:00" style="width:70px"></label><button class="btn tl-cdg">Start timer</button></div><pre class="tl-pre"></pre></div>`));
  let start = 0, acc = 0, run = false, down = 0;
  const fmt = (ms) => { ms = Math.max(0, ms); const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${Math.floor(ms / 100) % 10}`; };
  const cur = () => acc + (run ? performance.now() - start : 0);
  const tick = () => { if (!box.isConnected) return; const t = $('.tl-sw-t', box);
    if (down) { const left = down - performance.now(); t.textContent = fmt(left); if (left <= 0) { down = 0; t.textContent = '⏰ Time!'; try { new AudioContext().resume(); } catch (_) {} } } else t.textContent = fmt(cur());
    requestAnimationFrame(tick); };
  $('.tl-ss', box).addEventListener('click', (e) => { down = 0; if (run) { acc = cur(); run = false; e.target.textContent = 'Start'; } else { start = performance.now(); run = true; e.target.textContent = 'Pause'; } });
  $('.tl-lap', box).addEventListener('click', () => { $('.tl-pre', box).textContent += fmt(cur()) + '\n'; });
  $('.tl-rs', box).addEventListener('click', () => { acc = 0; start = performance.now(); down = 0; $('.tl-pre', box).textContent = ''; });
  $('.tl-cdg', box).addEventListener('click', () => { const [m, s] = $('.tl-cd', box).value.split(':').map(Number); down = performance.now() + ((m || 0) * 60 + (s || 0)) * 1000; });
  tick();
});

// ---------- Files & images ----------
T('img64', 'Files', 'Image → Base64', 'Turn a picture into a data URL for code.', (box) => {
  box.appendChild(el(`<div><input type="file" accept="image/*" class="tl-f"><img class="tl-img"><textarea class="tl-out" readonly></textarea><button class="btn small tl-copy">📋 Copy</button> <span class="muted small tl-msg"></span></div>`));
  $('.tl-f', box).addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { $('.tl-out', box).value = r.result; $('.tl-img', box).src = r.result; $('.tl-msg', box).textContent = `${(r.result.length / 1024).toFixed(1)} KB of text`; }; r.readAsDataURL(f); });
  $('.tl-copy', box).addEventListener('click', () => copy($('.tl-out', box).value));
});
T('resize', 'Files', 'Image resizer', 'Shrink or convert a picture (PNG, JPG, WebP).', (box) => {
  box.appendChild(el(`<div><input type="file" accept="image/*" class="tl-f"><div class="tl-row"><label>Width <input class="tl-w" value="512" style="width:80px"> px</label><select class="tl-t"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select><button class="btn primary tl-go">⬇ Resize & save</button></div><canvas class="tl-cv"></canvas><p class="muted small tl-msg"></p></div>`));
  let img = null;
  $('.tl-f', box).addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; img = new Image(); img.onload = () => { $('.tl-msg', box).textContent = `Original: ${img.width} × ${img.height}`; draw(); }; img.src = URL.createObjectURL(f); });
  const draw = () => { if (!img) return; const w = +$('.tl-w', box).value || img.width, c = $('.tl-cv', box); c.width = w; c.height = Math.round(img.height * w / img.width); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); };
  $('.tl-w', box).addEventListener('input', draw);
  $('.tl-go', box).addEventListener('click', () => { if (!img) return toast('Pick a picture first'); draw(); const t = $('.tl-t', box).value; download('resized.' + t.split('/')[1].replace('jpeg', 'jpg'), $('.tl-cv', box).toDataURL(t, 0.9)); });
});
T('emoji', 'Files', 'Emoji & symbol picker', 'Find and copy emoji and symbols.', (box) => {
  const sets = { 'Game': '🎮🕹️👾🤖🚀🛸⭐🌟💥🔥⚡💎🪙🗝️🏆🏁🎯🧱🌳🌵🏠🏰⛰️🌊☁️🌙☀️❤️💀👻🐉', Animals: '🐱🐶🐸🐵🦊🐼🐧🐢🐟🦄🐝🦋🐙🦀🐍🦖🐞🐘🦁🐯', Faces: '😀😂😍😎🤔😴😡😱🥳🤩😇🙃😜🤯', Arrows: '←↑→↓↖↗↘↙⇐⇑⇒⇓↻↺⟳', Maths: '±×÷≠≈≤≥∞√∑π°µΩ∆', Shapes: '■□▲△●○◆◇★☆♥♦♣♠', Code: '{}[]()<>/\\|&;:#$@%^~`' };
  box.appendChild(el(`<div>${Object.entries(sets).map(([n, s]) => `<div class="small">${n}</div><div class="tl-emo">${[...new Intl.Segmenter().segment(s)].map((g) => `<button>${g.segment}</button>`).join('')}</div>`).join('')}</div>`));
  box.querySelectorAll('.tl-emo button').forEach((b) => b.addEventListener('click', () => copy(b.textContent)));
});
T('notes', 'Files', 'Notes', 'A scratchpad that saves itself.', (box) => {
  box.appendChild(el(`<div><textarea class="tl-in" style="min-height:320px" placeholder="Ideas, to-dos, code snippets…"></textarea><div class="tl-row"><span class="muted small tl-msg">Saved on this computer</span><span class="grow"></span><button class="btn small tl-dl">⬇ Save as .txt</button></div></div>`));
  const ta = $('.tl-in', box); ta.value = store('notes') || '';
  ta.addEventListener('input', () => store('notes', ta.value)); $('.tl-dl', box).addEventListener('click', () => download('notes.txt', ta.value));
});
T('todo', 'Files', 'To-do list', 'Track what to build next.', (box) => {
  box.appendChild(el(`<div><div class="tl-row"><input class="tl-new grow" placeholder="Add a task and press Enter"><button class="btn primary tl-add">Add</button></div><ul class="tl-todo"></ul><button class="btn small ghost tl-done">Clear finished</button></div>`));
  let items = store('todo') || [{ t: 'Make my first game in Dev Ev', d: false }];
  const render = () => { store('todo', items); $('.tl-todo', box).innerHTML = ''; items.forEach((it, i) => { const li = el(`<li><label><input type="checkbox" ${it.d ? 'checked' : ''}> <span>${esc(it.t)}</span></label> <button class="btn small ghost">✕</button></li>`);
    $('input', li).addEventListener('change', (e) => { it.d = e.target.checked; render(); }); $('button', li).addEventListener('click', () => { items.splice(i, 1); render(); }); if (it.d) li.classList.add('done'); $('.tl-todo', box).appendChild(li); }); };
  const add = () => { const v = $('.tl-new', box).value.trim(); if (v) { items.push({ t: v, d: false }); $('.tl-new', box).value = ''; render(); } };
  $('.tl-add', box).addEventListener('click', add); $('.tl-new', box).addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  $('.tl-done', box).addEventListener('click', () => { items = items.filter((x) => !x.d); render(); }); render();
});
T('screen', 'Files', 'Screen & system info', 'Your screen size, browser and more.', (box) => {
  box.appendChild(el('<pre class="tl-pre"></pre>'));
  const run = () => { if (!box.isConnected) return; $('.tl-pre', box).textContent = `Screen: ${screen.width} × ${screen.height}\nWindow: ${innerWidth} × ${innerHeight}\nPixel ratio: ${devicePixelRatio}\nColour depth: ${screen.colorDepth}-bit\nLanguage: ${navigator.language}\nTime zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\nCPU cores: ${navigator.hardwareConcurrency || '?'}\nMemory: ${navigator.deviceMemory ? navigator.deviceMemory + ' GB+' : '?'}\nOnline: ${navigator.onLine}\nInstalled app: ${matchMedia('(display-mode: standalone)').matches}\nDark mode preferred: ${matchMedia('(prefers-color-scheme: dark)').matches}\n\n${navigator.userAgent}`; setTimeout(run, 1000); };
  run();
});
T('cheats', 'Code', 'JavaScript cheat sheet', 'The JavaScript behind each kind of block.', (box) => {
  box.appendChild(el(`<pre class="tl-pre">VARIABLES             let score = 0;   score += 1;   const speed = 5;
IF                    if (score > 10) { … } else { … }
LOOPS                 for (let i = 0; i < 10; i++) { … }      while (alive) { … }
LISTS (arrays)        const items = ['a', 'b'];  items.push('c');  items.length  items[0]
FUNCTIONS             function jump(height) { y += height; }   jump(20);
OBJECTS               const player = { x: 0, y: 0, lives: 3 };  player.x += 10;
TEXT                  'Hello ' + name     \`Score: \${score}\`     text.length
RANDOM                Math.floor(Math.random() * 10) + 1   // 1 to 10
MATHS                 Math.round(x)  Math.abs(x)  Math.sqrt(x)  a % b (remainder)
COMPARE               ===  !==  <  >  <=  >=     AND &&   OR ||   NOT !
EVENTS                document.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp') … });
TIMERS                setTimeout(() => { … }, 1000);   setInterval(tick, 16);
ANIMATION             function loop() { update(); draw(); requestAnimationFrame(loop); }
CANVAS                const ctx = canvas.getContext('2d'); ctx.fillRect(x, y, w, h);
DEBUGGING             console.log('x is', x);   (see Tools → JavaScript console)</pre>`));
});

// ---------- Tools page ----------
function renderTools() {
  const root = $('#toolsRoot'); if (!root || root.dataset.ready) return; root.dataset.ready = '1';
  const cats = ['All', ...new Set(TOOLS.map((t) => t.cat))];
  root.innerHTML = `<div class="tl-head"><h2>Tools <span class="muted small">${TOOLS.length} tools · all work offline on this PC</span></h2><input id="toolSearch" placeholder="🔎 Search tools…"></div>
    <div class="tl-cats">${cats.map((c, i) => `<button class="tab ${i ? '' : 'on'}" data-cat="${c}">${c}</button>`).join('')}</div>
    <div class="tl-cards"></div><div class="tl-panel" hidden><div class="tl-row"><button class="btn tl-back">← All tools</button><h3 class="tl-title"></h3></div><div class="tl-body"></div></div>`;
  let cat = 'All';
  const cards = () => { const q = $('#toolSearch').value.toLowerCase();
    $('.tl-cards', root).innerHTML = TOOLS.filter((t) => (cat === 'All' || t.cat === cat) && (t.name + ' ' + t.desc + ' ' + t.cat).toLowerCase().includes(q))
      .map((t) => `<button class="tl-card" data-id="${t.id}"><strong>${t.name}</strong><span class="muted small">${t.desc}</span><span class="tl-tag">${t.cat}</span></button>`).join('') || '<p class="muted">No tools match.</p>';
    root.querySelectorAll('.tl-card').forEach((c) => c.addEventListener('click', () => open(c.dataset.id))); };
  const open = (id) => { const t = TOOLS.find((x) => x.id === id); if (!t) return;
    $('.tl-title', root).textContent = t.name; const body = $('.tl-body', root); body.innerHTML = ''; body.appendChild(el(`<p class="muted">${t.desc}</p>`));
    const box = document.createElement('div'); body.appendChild(box); t.build(box); $('.tl-panel', root).hidden = false; $('.tl-cards', root).hidden = true; $('.tl-cats', root).hidden = true; $('.tl-head', root).hidden = true;
    window.scrollTo(0, 0); if (location.hash !== '#tools/' + id) history.replaceState(null, '', '#tools/' + id); };
  const back = () => { $('.tl-body', root).innerHTML = ''; $('.tl-panel', root).hidden = true; $('.tl-cards', root).hidden = false; $('.tl-cats', root).hidden = false; $('.tl-head', root).hidden = false; history.replaceState(null, '', '#tools'); };
  $('.tl-back', root).addEventListener('click', back);
  $('#toolSearch').addEventListener('input', cards);
  root.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { cat = b.dataset.cat; root.querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b)); cards(); }));
  cards();
  window.DevEvTools = { open, back, TOOLS };
}
function route() { if (location.hash.startsWith('#tools')) { renderTools(); const id = location.hash.split('/')[1]; if (id && window.DevEvTools) window.DevEvTools.open(id); } }
window.addEventListener('hashchange', route);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route); else route();
window.DevEvToolsList = TOOLS;
})();
