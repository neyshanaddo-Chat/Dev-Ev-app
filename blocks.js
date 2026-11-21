// Dev Ev App — block coder (Scratch-style).
// Drag blocks into the script area; snap them together; press ▶ to run.
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

// ---------------- Block definitions ----------------
const CATS = [
  ['events', 'Events', '#b8860b'], ['motion', 'Motion', '#3b6fd4'], ['looks', 'Looks', '#7c4fd0'],
  ['sound', 'Sound', '#b8439f'], ['control', 'Control', '#c8730f'], ['sensing', 'Sensing', '#1f8db3'],
  ['operators', 'Operators', '#2f8f3d'], ['variables', 'Variables', '#cc5320'], ['lists', 'Lists', '#b23c17'],
  ['pen', 'Pen', '#0b8a75'], ['functions', 'My Blocks', '#c2416b']
];
const CAT_COLOR = Object.fromEntries(CATS.map((c) => [c[0], c[2]]));
const KEYS = ['space', 'up arrow', 'down arrow', 'left arrow', 'right arrow', 'enter', 'any',
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')];
const SOUNDS = ['pop', 'coin', 'jump', 'hit', 'laser', 'powerup'];
const EMOJI = ['🐱','🐶','🐸','🐵','🦊','🐼','🐧','🐢','🐟','🦄','🐝','🦋','🚀','🛸','🚗','⚽','🏀','⭐','❤️','💎','🍎','🍕','🌳','🌵','🏠','👾','🤖','👻','🎈','🔥','⚡','🧱','🪙','🗝️','🏁','🎯'];

const DEFS = {};
function B(op, cat, shape, text, args = {}, extra = {}) { DEFS[op] = Object.assign({ op, cat, shape, text, args }, extra); }
// Events
B('whenFlag', 'events', 'hat', 'when ▶ clicked');
B('whenKey', 'events', 'hat', 'when %KEY key pressed', { KEY: ['menu', 'space', KEYS] });
B('whenClicked', 'events', 'hat', 'when this sprite clicked');
B('whenReceive', 'events', 'hat', 'when I receive %MSG', { MSG: ['text', 'message1'] });
B('whenTimer', 'events', 'hat', 'when timer > %N', { N: ['num', 5] });
B('broadcast', 'events', 'stack', 'broadcast %MSG', { MSG: ['text', 'message1'] });
B('broadcastWait', 'events', 'stack', 'broadcast %MSG and wait', { MSG: ['text', 'message1'] });
// Motion
B('move', 'motion', 'stack', 'move %STEPS steps', { STEPS: ['num', 10] });
B('turnRight', 'motion', 'stack', 'turn ↻ %DEG degrees', { DEG: ['num', 15] });
B('turnLeft', 'motion', 'stack', 'turn ↺ %DEG degrees', { DEG: ['num', 15] });
B('goto', 'motion', 'stack', 'go to x: %X y: %Y', { X: ['num', 0], Y: ['num', 0] });
B('gotoRandom', 'motion', 'stack', 'go to random position');
B('gotoMouse', 'motion', 'stack', 'go to mouse pointer');
B('glide', 'motion', 'stack', 'glide %SECS secs to x: %X y: %Y', { SECS: ['num', 1], X: ['num', 0], Y: ['num', 0] });
B('pointDir', 'motion', 'stack', 'point in direction %DIR', { DIR: ['num', 90] });
B('pointMouse', 'motion', 'stack', 'point towards mouse pointer');
B('changeX', 'motion', 'stack', 'change x by %N', { N: ['num', 10] });
B('setX', 'motion', 'stack', 'set x to %N', { N: ['num', 0] });
B('changeY', 'motion', 'stack', 'change y by %N', { N: ['num', 10] });
B('setY', 'motion', 'stack', 'set y to %N', { N: ['num', 0] });
B('bounce', 'motion', 'stack', 'if on edge, bounce');
B('xpos', 'motion', 'rep', 'x position');
B('ypos', 'motion', 'rep', 'y position');
B('direction', 'motion', 'rep', 'direction');
// Looks
B('sayFor', 'looks', 'stack', 'say %TEXT for %SECS seconds', { TEXT: ['text', 'Hello!'], SECS: ['num', 2] });
B('say', 'looks', 'stack', 'say %TEXT', { TEXT: ['text', 'Hello!'] });
B('think', 'looks', 'stack', 'think %TEXT', { TEXT: ['text', 'Hmm...'] });
B('setCostume', 'looks', 'stack', 'switch costume to %EMOJI', { EMOJI: ['menu', '🐱', EMOJI] });
B('changeSize', 'looks', 'stack', 'change size by %N', { N: ['num', 10] });
B('setSize', 'looks', 'stack', 'set size to %N %', { N: ['num', 100] });
B('show', 'looks', 'stack', 'show');
B('hide', 'looks', 'stack', 'hide');
B('goFront', 'looks', 'stack', 'go to front layer');
B('setGhost', 'looks', 'stack', 'set ghost effect to %N %', { N: ['num', 50] });
B('setBg', 'looks', 'stack', 'set backdrop colour to %C', { C: ['color', '#ffffff'] });
B('size', 'looks', 'rep', 'size');
B('costume', 'looks', 'rep', 'costume');
// Sound
B('playSound', 'sound', 'stack', 'play sound %SND', { SND: ['menu', 'pop', SOUNDS] });
B('playNote', 'sound', 'stack', 'play note %NOTE for %SECS seconds', { NOTE: ['num', 60], SECS: ['num', 0.5] });
B('setVolume', 'sound', 'stack', 'set volume to %N %', { N: ['num', 100] });
B('speak', 'sound', 'stack', 'speak %TEXT', { TEXT: ['text', 'Hello!'] });
// Control
B('wait', 'control', 'stack', 'wait %SECS seconds', { SECS: ['num', 1] });
B('repeat', 'control', 'c', 'repeat %TIMES', { TIMES: ['num', 10] });
B('forever', 'control', 'capc', 'forever');
B('if', 'control', 'c', 'if %COND then', { COND: ['bool'] });
B('ifElse', 'control', 'c2', 'if %COND then', { COND: ['bool'] }, { text2: 'else' });
B('waitUntil', 'control', 'stack', 'wait until %COND', { COND: ['bool'] });
B('repeatUntil', 'control', 'c', 'repeat until %COND', { COND: ['bool'] });
B('forEach', 'control', 'c', 'for each %VAR from %A to %B', { VAR: ['var'], A: ['num', 1], B: ['num', 10] });
B('stop', 'control', 'cap', 'stop %WHAT', { WHAT: ['menu', 'all', ['all', 'this script', 'other scripts in sprite']] });
B('whenClone', 'control', 'hat', 'when I start as a clone');
B('clone', 'control', 'stack', 'create clone of myself');
B('deleteClone', 'control', 'cap', 'delete this clone');
// Sensing
B('touching', 'sensing', 'bool', 'touching %WHAT ?', { WHAT: ['menu', 'edge', () => ['edge', 'mouse-pointer', ...spriteNames()]] });
B('keyPressed', 'sensing', 'bool', 'key %KEY pressed?', { KEY: ['menu', 'space', KEYS] });
B('mouseDown', 'sensing', 'bool', 'mouse down?');
B('mouseX', 'sensing', 'rep', 'mouse x');
B('mouseY', 'sensing', 'rep', 'mouse y');
B('distance', 'sensing', 'rep', 'distance to %WHAT', { WHAT: ['menu', 'mouse-pointer', () => ['mouse-pointer', ...spriteNames()]] });
B('ask', 'sensing', 'stack', 'ask %TEXT and wait', { TEXT: ['text', "What's your name?"] });
B('answer', 'sensing', 'rep', 'answer');
B('timer', 'sensing', 'rep', 'timer');
B('resetTimer', 'sensing', 'stack', 'reset timer');
B('dayNow', 'sensing', 'rep', 'current %PART', { PART: ['menu', 'hour', ['year', 'month', 'date', 'day of week', 'hour', 'minute', 'second']] });
// Operators
B('add', 'operators', 'rep', '%A + %B', { A: ['num', ''], B: ['num', ''] });
B('sub', 'operators', 'rep', '%A − %B', { A: ['num', ''], B: ['num', ''] });
B('mul', 'operators', 'rep', '%A × %B', { A: ['num', ''], B: ['num', ''] });
B('div', 'operators', 'rep', '%A ÷ %B', { A: ['num', ''], B: ['num', ''] });
B('random', 'operators', 'rep', 'pick random %A to %B', { A: ['num', 1], B: ['num', 10] });
B('gt', 'operators', 'bool', '%A > %B', { A: ['text', ''], B: ['text', 50] });
B('lt', 'operators', 'bool', '%A < %B', { A: ['text', ''], B: ['text', 50] });
B('eq', 'operators', 'bool', '%A = %B', { A: ['text', ''], B: ['text', 50] });
B('and', 'operators', 'bool', '%A and %B', { A: ['bool'], B: ['bool'] });
B('or', 'operators', 'bool', '%A or %B', { A: ['bool'], B: ['bool'] });
B('not', 'operators', 'bool', 'not %A', { A: ['bool'] });
B('join', 'operators', 'rep', 'join %A %B', { A: ['text', 'apple '], B: ['text', 'banana'] });
B('letterOf', 'operators', 'rep', 'letter %N of %TEXT', { N: ['num', 1], TEXT: ['text', 'apple'] });
B('lengthOf', 'operators', 'rep', 'length of %TEXT', { TEXT: ['text', 'apple'] });
B('contains', 'operators', 'bool', '%A contains %B ?', { A: ['text', 'apple'], B: ['text', 'a'] });
B('mod', 'operators', 'rep', '%A mod %B', { A: ['num', ''], B: ['num', ''] });
B('round', 'operators', 'rep', 'round %A', { A: ['num', ''] });
B('math', 'operators', 'rep', '%FN of %A', { FN: ['menu', 'abs', ['abs', 'floor', 'ceiling', 'sqrt', 'sin', 'cos', 'tan']], A: ['num', 9] });
// Variables
B('getVar', 'variables', 'rep', '%VAR', { VAR: ['label', 'score'] });
B('setVar', 'variables', 'stack', 'set %VAR to %VALUE', { VAR: ['var'], VALUE: ['text', 0] });
B('changeVar', 'variables', 'stack', 'change %VAR by %N', { VAR: ['var'], N: ['num', 1] });
B('showVar', 'variables', 'stack', 'show variable %VAR', { VAR: ['var'] });
B('hideVar', 'variables', 'stack', 'hide variable %VAR', { VAR: ['var'] });
// Lists
B('getList', 'lists', 'rep', '%LIST', { LIST: ['label', 'items'] });
B('listAdd', 'lists', 'stack', 'add %ITEM to %LIST', { ITEM: ['text', 'thing'], LIST: ['list'] });
B('listDelete', 'lists', 'stack', 'delete %N of %LIST', { N: ['num', 1], LIST: ['list'] });
B('listClear', 'lists', 'stack', 'delete all of %LIST', { LIST: ['list'] });
B('listInsert', 'lists', 'stack', 'insert %ITEM at %N of %LIST', { ITEM: ['text', 'thing'], N: ['num', 1], LIST: ['list'] });
B('listReplace', 'lists', 'stack', 'replace item %N of %LIST with %ITEM', { N: ['num', 1], LIST: ['list'], ITEM: ['text', 'thing'] });
B('listItem', 'lists', 'rep', 'item %N of %LIST', { N: ['num', 1], LIST: ['list'] });
B('listLength', 'lists', 'rep', 'length of %LIST', { LIST: ['list'] });
B('listContains', 'lists', 'bool', '%LIST contains %ITEM ?', { LIST: ['list'], ITEM: ['text', 'thing'] });
// Pen
B('penClear', 'pen', 'stack', 'erase all');
B('penDown', 'pen', 'stack', 'pen down');
B('penUp', 'pen', 'stack', 'pen up');
B('stamp', 'pen', 'stack', 'stamp');
B('penColor', 'pen', 'stack', 'set pen colour to %C', { C: ['color', '#2563eb'] });
B('penSize', 'pen', 'stack', 'set pen size to %N', { N: ['num', 3] });
// My Blocks (functions)
B('defineFn', 'functions', 'hat', 'define %NAME', { NAME: ['label', 'my block'] });
B('callFn', 'functions', 'stack', 'run %NAME', { NAME: ['label', 'my block'] });

const isStacky = (shape) => shape !== 'rep' && shape !== 'bool';

// ---------------- Project state ----------------
const STORE = 'devev-projects', CUR = 'devev-current';
let project, sprite;            // current project, selected sprite
let dirty = false;
function uid() { return Math.random().toString(36).slice(2, 10); }
function newSprite(name, emoji, x = 0, y = 0) {
  return { id: uid(), name, emoji, x, y, dir: 90, size: 100, visible: true, ghost: 0, scripts: [] };
}
function newProject(name) {
  const s = newSprite('Sprite1', '🐱');
  s.scripts.push({ x: 30, y: 30, blocks: [
    { op: 'whenFlag', args: {} },
    { op: 'sayFor', args: { TEXT: 'Hello!', SECS: 2 } },
    { op: 'move', args: { STEPS: 50 } }
  ] });
  return { id: uid(), name: name || 'My project', created: Date.now(), updated: Date.now(),
    bg: '#ffffff', sprites: [s], variables: { score: 0 }, lists: { items: [] }, monitors: {}, fns: ['my block'] };
}
function allProjects() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (_) { return {}; } }
function saveProject(quiet) {
  syncFromDom();
  project.updated = Date.now();
  const all = allProjects(); all[project.id] = project;
  try { localStorage.setItem(STORE, JSON.stringify(all)); localStorage.setItem(CUR, project.id); dirty = false; setStatus('Saved'); if (!quiet) toast('Project saved'); }
  catch (e) { toast('Could not save: storage is full'); }
}
let saveTimer;
function changed() { dirty = true; setStatus('Saving…'); clearTimeout(saveTimer); saveTimer = setTimeout(() => saveProject(true), 600); }
function loadProject(p) {
  stopAll();
  project = p;
  project.lists = project.lists || {}; project.monitors = project.monitors || {}; project.fns = project.fns || [];
  sprite = project.sprites[0];
  $('#projName').value = project.name;
  resetPen(); renderAll(); saveProject(true);
}
function spriteNames() { return project ? project.sprites.filter((s) => s !== sprite).map((s) => s.name) : []; }

// ---------------- Rendering blocks ----------------
function makeInput(holder, type, value, def) {
  holder.textContent = '';
  let el;
  if (type === 'bool') { holder.classList.add('slot-bool'); return; }
  if (type === 'label') { el = h('span', 'lbl', value); holder.appendChild(el); holder._val = () => value; return; }
  if (type === 'menu' || type === 'var' || type === 'list') {
    el = h('select', 'in sel');
    let opts = type === 'var' ? Object.keys(project.variables) : type === 'list' ? Object.keys(project.lists) : (typeof def[2] === 'function' ? def[2]() : def[2]);
    if (value == null || value === '') value = opts[0] || '';
    if (value !== '' && !opts.includes(value)) opts = [value, ...opts];
    opts.forEach((o) => { const op = h('option', null, o); op.value = o; el.appendChild(op); });
    el.value = value;
  } else if (type === 'color') {
    el = h('input', 'in col'); el.type = 'color'; el.value = value || '#000000';
  } else {
    el = h('input', 'in ' + (type === 'num' ? 'num' : 'txt'));
    el.value = value == null ? '' : value; el.spellcheck = false;
    const fit = () => { el.style.width = Math.max(2.5, String(el.value).length + 1.2) + 'ch'; };
    fit(); el.addEventListener('input', fit);
  }
  el.addEventListener('input', changed); el.addEventListener('change', changed);
  holder.appendChild(el);
}
function makeBlock(model) {
  const def = DEFS[model.op];
  if (!def) { const x = h('div', 'blk s-stack'); x.textContent = 'unknown block'; return x; }
  const el = h('div', 'blk s-' + def.shape + ' cat-' + def.cat);
  el.style.setProperty('--c', CAT_COLOR[def.cat]);
  el.dataset.op = model.op;
  el._args = {}; el._mouths = [];
  const row = (text) => {
    const r = h('div', 'row');
    text.split(/(%[A-Z0-9]+)/).forEach((part) => {
      if (!part) return;
      if (part[0] === '%') {
        const name = part.slice(1), a = def.args[name];
        const holder = h('span', 'arg t-' + a[0]);
        holder._type = a[0]; holder._def = a;
        const v = model.args ? model.args[name] : undefined;
        if (v && typeof v === 'object') holder.appendChild(makeBlock(v));
        else makeInput(holder, a[0], v === undefined ? a[1] : v, a);
        el._args[name] = holder; r.appendChild(holder);
      } else r.appendChild(h('span', 'txt', part.trim() ? part : ' '));
    });
    return r;
  };
  el.appendChild(row(def.text));
  if (def.shape === 'c' || def.shape === 'c2' || def.shape === 'capc') {
    const m = h('div', 'mouth'); el.appendChild(m); el._mouths.push(m);
    (model.sub || []).forEach((b) => m.appendChild(makeBlock(b)));
    if (def.shape === 'c2') {
      el.appendChild(row(def.text2));
      const m2 = h('div', 'mouth'); el.appendChild(m2); el._mouths.push(m2);
      (model.sub2 || []).forEach((b) => m2.appendChild(makeBlock(b)));
    }
    el.appendChild(h('div', 'foot'));
  }
  return el;
}
function blockModel(el) {
  const m = { op: el.dataset.op, args: {} };
  for (const [name, holder] of Object.entries(el._args || {})) {
    const child = holder.querySelector(':scope > .blk');
    if (child) m.args[name] = blockModel(child);
    else if (holder._type === 'bool') m.args[name] = '';
    else if (holder._val) m.args[name] = holder._val();
    else { const inp = holder.querySelector(':scope > .in'); m.args[name] = inp ? inp.value : ''; }
  }
  if (el._mouths && el._mouths.length) {
    m.sub = listModel(el._mouths[0]);
    if (el._mouths[1]) m.sub2 = listModel(el._mouths[1]);
  }
  return m;
}
function listModel(container) { return $$(':scope > .blk', container).map(blockModel); }

// ---------------- Palette ----------------
function renderPalette() {
  const cats = $('#bcCats'), list = $('#bcPalette');
  cats.textContent = ''; list.textContent = '';
  CATS.forEach(([id, name, color]) => {
    const b = h('button', 'cat-btn'); b.innerHTML = '<span class="dot"></span>'; b.appendChild(h('span', null, name));
    b.querySelector('.dot').style.background = color;
    b.addEventListener('click', () => { const t = $('#pal-' + id); if (t) list.scrollTo({ top: t.offsetTop - list.offsetTop - 4, behavior: 'smooth' }); });
    cats.appendChild(b);
    const sec = h('div', 'pal-sec'); sec.id = 'pal-' + id;
    sec.appendChild(h('h4', null, name)).style.color = color;
    if (id === 'variables') {
      const mk = h('button', 'btn small', '＋ Make a variable');
      mk.addEventListener('click', makeVariable); sec.appendChild(mk);
      Object.keys(project.variables).forEach((v) => {
        const r = h('div', 'pal-var');
        const cb = h('input'); cb.type = 'checkbox'; cb.checked = !!project.monitors[v]; cb.title = 'Show on stage';
        cb.addEventListener('change', () => { project.monitors[v] = cb.checked; changed(); });
        r.appendChild(cb); r.appendChild(palBlock({ op: 'getVar', args: { VAR: v } }));
        sec.appendChild(r);
      });
    }
    if (id === 'lists') {
      const mk = h('button', 'btn small', '＋ Make a list');
      mk.addEventListener('click', makeList); sec.appendChild(mk);
      Object.keys(project.lists).forEach((v) => {
        const r = h('div', 'pal-var');
        const cb = h('input'); cb.type = 'checkbox'; cb.checked = !!project.monitors['list:' + v]; cb.title = 'Show on stage';
        cb.addEventListener('change', () => { project.monitors['list:' + v] = cb.checked; changed(); });
        r.appendChild(cb); r.appendChild(palBlock({ op: 'getList', args: { LIST: v } }));
        sec.appendChild(r);
      });
    }
    if (id === 'functions') {
      const mk = h('button', 'btn small', '＋ Make a block');
      mk.addEventListener('click', makeFn); sec.appendChild(mk);
      sec.appendChild(h('p', 'muted small', 'Put blocks under "define", then use "run" anywhere to run them.'));
      (project.fns || []).forEach((f) => {
        sec.appendChild(palBlock({ op: 'defineFn', args: { NAME: f } }));
        sec.appendChild(palBlock({ op: 'callFn', args: { NAME: f } }));
      });
    }
    Object.values(DEFS).filter((d) => d.cat === id && !['getVar', 'getList', 'defineFn', 'callFn'].includes(d.op)).forEach((d) => {
      if ((d.args.VAR && d.args.VAR[0] === 'var' && !Object.keys(project.variables).length) ||
          (d.args.LIST && d.args.LIST[0] === 'list' && !Object.keys(project.lists).length)) return;
      sec.appendChild(palBlock({ op: d.op, args: {} }));
    });
    list.appendChild(sec);
  });
}
function palBlock(model) { const b = makeBlock(model); b.classList.add('in-pal'); $$('input,select', b).forEach((i) => { i.tabIndex = -1; }); return b; }

// ---------------- Workspace ----------------
function renderWorkspace() {
  const ws = $('#wsInner'); ws.textContent = '';
  sprite.scripts.forEach((sc) => ws.appendChild(makeStack(sc)));
  $('#wsEmpty').hidden = sprite.scripts.length > 0;
  renderCode();
}
function makeStack(sc) {
  const st = h('div', 'stack'); st.style.left = sc.x + 'px'; st.style.top = sc.y + 'px';
  sc.blocks.forEach((b) => st.appendChild(makeBlock(b)));
  return st;
}
function syncFromDom() {
  if (!sprite) return;
  sprite.scripts = $$('#wsInner > .stack').filter((s) => s.children.length).map((s) => ({
    x: parseInt(s.style.left) || 0, y: parseInt(s.style.top) || 0, blocks: listModel(s)
  }));
  $('#wsEmpty').hidden = sprite.scripts.length > 0;
}

// ---------------- Drag and drop ----------------
let drag = null, press = null;
const marker = h('div', 'drop-marker');
function onDown(e) {
  if (e.button !== 0) return;
  const blk = e.target.closest('.blk');
  if (!blk || e.target.closest('input,select,button')) return;
  const inPal = !!blk.closest('#bcPalette'), inWs = !!blk.closest('#wsInner');
  if (!inPal && !inWs) return;
  e.preventDefault();
  press = { blk, inPal, x: e.clientX, y: e.clientY };
}
function startDrag(e) {
  const { blk, inPal } = press;
  const r = blk.getBoundingClientRect();
  let st;
  if (inPal) {
    st = h('div', 'stack'); st.appendChild(makeBlock(blockModel(blk)));
  } else {
    const shape = DEFS[blk.dataset.op].shape;
    if (!isStacky(shape)) {
      const holder = blk.parentElement;
      st = h('div', 'stack'); st.appendChild(blk);
      if (holder.classList.contains('arg')) makeInput(holder, holder._type, holder._def[1], holder._def);
    } else if (blk.parentElement.classList.contains('stack') && blk === blk.parentElement.firstElementChild) {
      st = blk.parentElement;
    } else {
      st = h('div', 'stack');
      let n = blk; const move = [];
      while (n) { move.push(n); n = n.nextElementSibling; }
      move.forEach((m) => st.appendChild(m));
    }
  }
  st.classList.add('dragging');
  document.body.appendChild(st);
  drag = { st, dx: press.x - r.left, dy: press.y - r.top };
  moveDrag(e);
  document.body.appendChild(marker);
}
function moveDrag(e) {
  drag.st.style.left = (e.clientX - drag.dx) + 'px';
  drag.st.style.top = (e.clientY - drag.dy) + 'px';
  drag.target = findTarget(e);
  const t = drag.target;
  marker.style.display = t ? 'block' : 'none';
  if (t) {
    marker.className = 'drop-marker' + (t.kind === 'arg' ? ' arg' : '');
    Object.assign(marker.style, { left: t.mx + 'px', top: t.my + 'px', width: (t.mw || 80) + 'px', height: (t.mh || 4) + 'px' });
  }
}
function findTarget(e) {
  const st = drag.st, first = st.firstElementChild;
  if (!first) return null;
  const shape = DEFS[first.dataset.op].shape;
  const dr = first.getBoundingClientRect();
  const wsr = $('#ws').getBoundingClientRect();
  if (e.clientX < wsr.left || e.clientX > wsr.right || e.clientY < wsr.top || e.clientY > wsr.bottom) return null;
  if (!isStacky(shape)) {
    let best = null;
    $$('#wsInner .arg').forEach((holder) => {
      if (holder.querySelector(':scope > .blk')) return;
      const t = holder._type;
      if (t === 'label' || t === 'menu' || t === 'var' || t === 'list' || t === 'color') return;
      if (t === 'bool' && shape !== 'bool') return;
      const r = holder.getBoundingClientRect();
      const px = dr.left + 6, py = dr.top + dr.height / 2;
      if (px > r.left - 14 && px < r.right + 10 && py > r.top - 12 && py < r.bottom + 12) {
        const d = Math.abs(px - r.left) + Math.abs(py - (r.top + r.height / 2));
        if (!best || d < best.d) best = { kind: 'arg', holder, d, mx: r.left - 2, my: r.top - 2, mw: r.width + 4, mh: r.height + 4 };
      }
    });
    return best;
  }
  const isHat = shape === 'hat';
  const last = st.lastElementChild, lastShape = DEFS[last.dataset.op].shape;
  const endsCap = lastShape === 'cap' || lastShape === 'capc';
  let best = null;
  const consider = (d, t) => { if (d < 36 && (!best || d < best.d)) { t.d = d; best = t; } };
  if (!isHat) {
    $$('#wsInner .blk').forEach((b) => {
      const s = DEFS[b.dataset.op].shape;
      if (!isStacky(s) || s === 'cap' || s === 'capc') return;
      if (b.parentElement.classList.contains('arg')) return;
      if (endsCap && b.nextElementSibling) return;
      const r = b.getBoundingClientRect();
      consider(Math.hypot(dr.left - r.left, dr.top - r.bottom), { kind: 'after', ref: b, mx: r.left, my: r.bottom - 2, mw: 120 });
    });
    $$('#wsInner .mouth').forEach((m) => {
      if (endsCap && m.firstElementChild) return;
      const r = m.getBoundingClientRect();
      consider(Math.hypot(dr.left - r.left, dr.top - r.top), { kind: 'mouth', ref: m, mx: r.left, my: r.top - 2, mw: 120 });
    });
  }
  if (!endsCap) {
    $$('#wsInner > .stack').forEach((s) => {
      const top = s.firstElementChild; if (!top) return;
      if (DEFS[top.dataset.op].shape === 'hat') return;
      const r = top.getBoundingClientRect();
      const db = st.getBoundingClientRect();
      consider(Math.hypot(dr.left - r.left, db.bottom - r.top), { kind: 'before', ref: top, mx: r.left, my: r.top - 2, mw: 120 });
    });
  }
  return best;
}
function endDrag(e) {
  marker.remove();
  const st = drag.st, t = drag.target;
  st.classList.remove('dragging');
  const pal = $('#bcPaletteWrap').getBoundingClientRect();
  const overPal = e.clientX >= pal.left && e.clientX <= pal.right && e.clientY >= pal.top && e.clientY <= pal.bottom;
  const blocks = Array.from(st.children);
  if (overPal) { st.remove(); }
  else if (t && t.kind === 'arg') { t.holder.textContent = ''; t.holder.classList.remove('slot-bool'); t.holder.appendChild(blocks[0]); st.remove(); }
  else if (t && t.kind === 'after') { let ref = t.ref; blocks.forEach((b) => { ref.after(b); ref = b; }); st.remove(); }
  else if (t && t.kind === 'mouth') { const f = t.ref.firstElementChild; blocks.forEach((b) => t.ref.insertBefore(b, f)); st.remove(); }
  else if (t && t.kind === 'before') { blocks.forEach((b) => t.ref.parentElement.insertBefore(b, t.ref)); st.remove(); }
  else {
    const ws = $('#ws'), wr = ws.getBoundingClientRect();
    if (e.clientX < wr.left || e.clientX > wr.right || e.clientY < wr.top || e.clientY > wr.bottom) { st.remove(); }
    else {
      const sr = st.getBoundingClientRect();
      st.style.left = Math.max(0, Math.round(sr.left - wr.left + ws.scrollLeft)) + 'px';
      st.style.top = Math.max(0, Math.round(sr.top - wr.top + ws.scrollTop)) + 'px';
      $('#wsInner').appendChild(st);
    }
  }
  $$('#wsInner > .stack').forEach((s) => { if (!s.children.length) s.remove(); });
  drag = null;
  syncFromDom(); renderCode(); changed();
}
document.addEventListener('pointerdown', onDown);
document.addEventListener('pointermove', (e) => {
  if (drag) { moveDrag(e); return; }
  if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) startDrag(e);
});
document.addEventListener('pointerup', (e) => {
  if (drag) endDrag(e);
  else if (press) {
    // A click (no drag): run that script (or the single palette block) once.
    const blk = press.blk;
    if (press.inPal) runOnce([blockModel(blk)]);
    else {
      let top = blk; while (top.parentElement && !top.parentElement.classList.contains('stack')) top = top.parentElement.closest('.blk') || top.parentElement;
      const stk = blk.closest('#wsInner > .stack');
      if (stk) { syncFromDom(); const m = listModel(stk); runOnce(m[0] && DEFS[m[0].op].shape === 'hat' ? m.slice(1) : m, stk); }
    }
  }
  press = null;
});

// Right-click a script: duplicate / delete
document.addEventListener('contextmenu', (e) => {
  const blk = e.target.closest('#wsInner .blk'); if (!blk) return;
  e.preventDefault();
  showMenu(e.clientX, e.clientY, [
    ['Duplicate', () => {
      const st = h('div', 'stack'); st.appendChild(makeBlock(blockModel(blk)));
      let n = blk.nextElementSibling; if (isStacky(DEFS[blk.dataset.op].shape)) while (n) { st.appendChild(makeBlock(blockModel(n))); n = n.nextElementSibling; }
      const host = blk.closest('#wsInner > .stack');
      st.style.left = (parseInt(host.style.left) + 30) + 'px'; st.style.top = (parseInt(host.style.top) + 30) + 'px';
      $('#wsInner').appendChild(st); syncFromDom(); renderCode(); changed();
    }],
    ['Delete block', () => {
      const shape = DEFS[blk.dataset.op].shape, holder = blk.parentElement;
      if (blk._mouths) blk._mouths.forEach((m) => Array.from(m.children).forEach((c) => blk.before(c)));
      blk.remove();
      if (holder.classList.contains('arg')) makeInput(holder, holder._type, holder._def[1], holder._def);
      $$('#wsInner > .stack').forEach((s) => { if (!s.children.length) s.remove(); });
      syncFromDom(); renderCode(); changed();
    }],
    ['Add comment', () => { const c = prompt('Comment for this block:', blk.title || ''); if (c != null) { blk.title = c; toast('Hover the block to see the comment'); } }]
  ]);
});
function showMenu(x, y, items) {
  let m = $('#ctxMenu'); if (m) m.remove();
  m = h('div'); m.id = 'ctxMenu';
  items.forEach(([label, fn]) => { const b = h('button', null, label); b.addEventListener('click', () => { m.remove(); fn(); }); m.appendChild(b); });
  m.style.left = x + 'px'; m.style.top = y + 'px';
  document.body.appendChild(m);
  setTimeout(() => document.addEventListener('pointerdown', function off(ev) { if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('pointerdown', off); } }), 0);
}
function cleanUp() {
  let y = 20;
  $$('#wsInner > .stack').forEach((s) => { s.style.left = '20px'; s.style.top = y + 'px'; y += s.offsetHeight + 24; });
  syncFromDom(); changed();
}

// ---------------- Code view (blocks → JavaScript) ----------------
function lit(v, type) {
  if (v && typeof v === 'object') return expr(v);
  if (type === 'bool') return 'false';
  if (type === 'num' && v !== '' && !isNaN(Number(v))) return String(Number(v));
  if (type === 'num' && v === '') return '0';
  if (type === 'var' || type === 'label') return ident(v);
  return JSON.stringify(String(v));
}
function ident(s) { const id = String(s).replace(/[^A-Za-z0-9_]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^[0-9]/, '_$&'); return id || 'v'; }
function A(b, n) { const d = DEFS[b.op].args[n]; return lit(b.args ? b.args[n] : undefined, d ? d[0] : 'text'); }
const EXPR = {
  xpos: () => 'x', ypos: () => 'y', direction: () => 'direction', size: () => 'size', costume: () => 'costume',
  mouseX: () => 'mouseX', mouseY: () => 'mouseY', answer: () => 'answer', timer: () => 'timer',
  touching: (b) => `touching(${A(b, 'WHAT')})`, keyPressed: (b) => `keyPressed(${A(b, 'KEY')})`, mouseDown: () => 'mouseDown',
  distance: (b) => `distanceTo(${A(b, 'WHAT')})`, dayNow: (b) => `now(${A(b, 'PART')})`,
  add: (b) => `(${A(b, 'A')} + ${A(b, 'B')})`, sub: (b) => `(${A(b, 'A')} - ${A(b, 'B')})`,
  mul: (b) => `(${A(b, 'A')} * ${A(b, 'B')})`, div: (b) => `(${A(b, 'A')} / ${A(b, 'B')})`,
  random: (b) => `random(${A(b, 'A')}, ${A(b, 'B')})`, gt: (b) => `(${A(b, 'A')} > ${A(b, 'B')})`,
  lt: (b) => `(${A(b, 'A')} < ${A(b, 'B')})`, eq: (b) => `(${A(b, 'A')} == ${A(b, 'B')})`,
  and: (b) => `(${A(b, 'A')} && ${A(b, 'B')})`, or: (b) => `(${A(b, 'A')} || ${A(b, 'B')})`, not: (b) => `!(${A(b, 'A')})`,
  join: (b) => `(${A(b, 'A')} + ${A(b, 'B')})`, letterOf: (b) => `${A(b, 'TEXT')}[${A(b, 'N')} - 1]`,
  lengthOf: (b) => `${A(b, 'TEXT')}.length`, contains: (b) => `${A(b, 'A')}.includes(${A(b, 'B')})`,
  mod: (b) => `(${A(b, 'A')} % ${A(b, 'B')})`, round: (b) => `Math.round(${A(b, 'A')})`,
  math: (b) => `Math.${({ ceiling: 'ceil' })[b.args.FN] || b.args.FN || 'abs'}(${A(b, 'A')})`,
  getVar: (b) => ident(b.args.VAR), getList: (b) => ident(b.args.LIST),
  listItem: (b) => `${lit(b.args.LIST, 'var')}[${A(b, 'N')} - 1]`, listLength: (b) => `${lit(b.args.LIST, 'var')}.length`,
  listContains: (b) => `${lit(b.args.LIST, 'var')}.includes(${A(b, 'ITEM')})`
};
function expr(b) { return EXPR[b.op] ? EXPR[b.op](b) : b.op + '()'; }
const STMT = {
  move: (b) => `move(${A(b, 'STEPS')});`, turnRight: (b) => `turnRight(${A(b, 'DEG')});`, turnLeft: (b) => `turnLeft(${A(b, 'DEG')});`,
  goto: (b) => `goTo(${A(b, 'X')}, ${A(b, 'Y')});`, gotoRandom: () => 'goToRandomPosition();', gotoMouse: () => 'goToMouse();',
  glide: (b) => `await glide(${A(b, 'SECS')}, ${A(b, 'X')}, ${A(b, 'Y')});`, pointDir: (b) => `direction = ${A(b, 'DIR')};`,
  pointMouse: () => 'pointTowardsMouse();', changeX: (b) => `x += ${A(b, 'N')};`, setX: (b) => `x = ${A(b, 'N')};`,
  changeY: (b) => `y += ${A(b, 'N')};`, setY: (b) => `y = ${A(b, 'N')};`, bounce: () => 'bounceOffEdge();',
  sayFor: (b) => `await say(${A(b, 'TEXT')}, ${A(b, 'SECS')});`, say: (b) => `say(${A(b, 'TEXT')});`, think: (b) => `think(${A(b, 'TEXT')});`,
  setCostume: (b) => `costume = ${A(b, 'EMOJI')};`, changeSize: (b) => `size += ${A(b, 'N')};`, setSize: (b) => `size = ${A(b, 'N')};`,
  show: () => 'show();', hide: () => 'hide();', goFront: () => 'goToFront();', setGhost: (b) => `ghost = ${A(b, 'N')};`,
  setBg: (b) => `stage.background = ${A(b, 'C')};`, playSound: (b) => `playSound(${A(b, 'SND')});`,
  playNote: (b) => `await playNote(${A(b, 'NOTE')}, ${A(b, 'SECS')});`, setVolume: (b) => `volume = ${A(b, 'N')};`, speak: (b) => `speak(${A(b, 'TEXT')});`,
  wait: (b) => `await wait(${A(b, 'SECS')});`, waitUntil: (b) => `await waitUntil(() => ${A(b, 'COND')});`,
  stop: (b) => `stop(${A(b, 'WHAT')}); return;`, clone: () => 'createClone(this);', deleteClone: () => 'deleteThisClone(); return;',
  ask: (b) => `answer = await ask(${A(b, 'TEXT')});`, resetTimer: () => 'timer = 0;',
  broadcast: (b) => `broadcast(${A(b, 'MSG')});`, broadcastWait: (b) => `await broadcastAndWait(${A(b, 'MSG')});`,
  setVar: (b) => `${lit(b.args.VAR, 'var')} = ${A(b, 'VALUE')};`, changeVar: (b) => `${lit(b.args.VAR, 'var')} += ${A(b, 'N')};`,
  showVar: (b) => `showVariable("${b.args.VAR}");`, hideVar: (b) => `hideVariable("${b.args.VAR}");`,
  listAdd: (b) => `${lit(b.args.LIST, 'var')}.push(${A(b, 'ITEM')});`, listDelete: (b) => `${lit(b.args.LIST, 'var')}.splice(${A(b, 'N')} - 1, 1);`,
  listClear: (b) => `${lit(b.args.LIST, 'var')}.length = 0;`, listInsert: (b) => `${lit(b.args.LIST, 'var')}.splice(${A(b, 'N')} - 1, 0, ${A(b, 'ITEM')});`,
  listReplace: (b) => `${lit(b.args.LIST, 'var')}[${A(b, 'N')} - 1] = ${A(b, 'ITEM')};`,
  penClear: () => 'pen.clear();', penDown: () => 'pen.down();', penUp: () => 'pen.up();', stamp: () => 'stamp();',
  penColor: (b) => `pen.color = ${A(b, 'C')};`, penSize: (b) => `pen.size = ${A(b, 'N')};`,
  callFn: (b) => `await ${ident(b.args.NAME)}();`
};
function code(list, ind) {
  const p = '  '.repeat(ind); let out = '';
  list.forEach((b) => {
    const d = DEFS[b.op]; if (!d) return;
    if (b.op === 'repeat') out += `${p}for (let i = 0; i < ${A(b, 'TIMES')}; i++) {\n${code(b.sub || [], ind + 1)}${p}}\n`;
    else if (b.op === 'forever') out += `${p}while (true) {\n${code(b.sub || [], ind + 1)}${p}  await nextFrame();\n${p}}\n`;
    else if (b.op === 'if') out += `${p}if (${A(b, 'COND')}) {\n${code(b.sub || [], ind + 1)}${p}}\n`;
    else if (b.op === 'ifElse') out += `${p}if (${A(b, 'COND')}) {\n${code(b.sub || [], ind + 1)}${p}} else {\n${code(b.sub2 || [], ind + 1)}${p}}\n`;
    else if (b.op === 'repeatUntil') out += `${p}while (!${A(b, 'COND')}) {\n${code(b.sub || [], ind + 1)}${p}}\n`;
    else if (b.op === 'forEach') { const v = lit(b.args.VAR, 'var'); out += `${p}for (${v} = ${A(b, 'A')}; ${v} <= ${A(b, 'B')}; ${v}++) {\n${code(b.sub || [], ind + 1)}${p}}\n`; }
    else if (STMT[b.op]) out += p + STMT[b.op](b) + '\n';
    else if (d.shape === 'rep' || d.shape === 'bool') out += p + expr(b) + ';\n';
  });
  return out;
}
function scriptCode(sc) {
  const [first, ...rest] = sc.blocks; if (!first) return '';
  const hat = {
    whenFlag: () => 'when("▶ clicked", async () => {', whenKey: (b) => `whenKeyPressed(${A(b, 'KEY')}, async () => {`,
    whenClicked: () => 'whenThisSpriteClicked(async () => {', whenReceive: (b) => `whenIReceive(${A(b, 'MSG')}, async () => {`,
    whenClone: () => 'whenIStartAsAClone(async () => {', whenTimer: (b) => `whenTimerIsMoreThan(${A(b, 'N')}, async () => {`,
    defineFn: (b) => `async function ${ident(b.args.NAME)}() {`
  }[first.op];
  if (hat) return hat(first) + '\n' + code(rest, 1) + (first.op === 'defineFn' ? '}\n' : '});\n');
  return '// (no hat block: click this script to run it)\n' + code(sc.blocks, 0);
}
function renderCode() {
  if (!sprite) return;
  const vars = Object.keys(project.variables).map((v) => `let ${ident(v)} = ${JSON.stringify(project.variables[v])};`).join('\n');
  const lists = Object.keys(project.lists).map((v) => `let ${ident(v)} = [];`).join('\n');
  const body = sprite.scripts.map(scriptCode).filter(Boolean).join('\n');
  $('#codeOut').textContent = `// ${sprite.name} — your blocks written as JavaScript\n` + (vars ? vars + '\n' : '') + (lists ? lists + '\n' : '') + '\n' + (body || '// Drag blocks into the script area to see code here.');
}

// ---------------- Stage + engine ----------------
const W = 480, H = 360;
let canvas, ctx, penCanvas, penCtx;
let targets = [];       // sprites + clones on stage (draw order)
let threads = [];
let keys = new Set(), mouse = { x: 0, y: 0, down: false };
let timerStart = performance.now(), answer = '', volume = 1, timerFired = new Set();
let audio = null;
function resetPen() { if (penCtx) penCtx.clearRect(0, 0, W, H); }
function syncTargets() {
  const clones = targets.filter((t) => t.isClone);
  targets = [...project.sprites, ...clones.filter((c) => project.sprites.includes(c.original))];
}
function scriptsOf(t) { return (t.isClone ? t.original : t).scripts; }
function startHats(match, only) {
  const started = [];
  syncTargets();
  targets.slice().forEach((t) => {
    if (only && t !== only) return;
    scriptsOf(t).forEach((sc) => {
      const hat = sc.blocks[0]; if (!hat || !match(hat, t)) return;
      threads = threads.filter((th) => !(th.target === t && th.script === sc));
      const th = { target: t, script: sc, stopped: false, done: false };
      th.gen = runList(sc.blocks.slice(1), t, th);
      threads.push(th); started.push(th);
    });
  });
  return started;
}
function runOnce(list, stackEl) {
  syncTargets();
  const th = { target: sprite, script: null, stopped: false, done: false, el: stackEl };
  th.gen = runList(list, sprite, th);
  threads.push(th);
  if (stackEl) stackEl.classList.add('running');
}
function greenFlag() {
  stopAll();
  timerStart = performance.now(); timerFired.clear();
  startHats((b) => b.op === 'whenFlag');
}
function stopAll() {
  threads.forEach((th) => th.el && th.el.classList.remove('running'));
  threads = [];
  targets = targets.filter((t) => !t.isClone);
  if (project) project.sprites.forEach((s) => { s.bubble = null; });
  $('#askBox') && ($('#askBox').hidden = true);
  if (window.speechSynthesis) speechSynthesis.cancel();
}
function broadcastMsg(msg) { return startHats((b, t) => b.op === 'whenReceive' && String(b.args.MSG) === String(msg)); }

// value helpers
function val(v, t) { return (v && typeof v === 'object') ? evalR(v, t) : v; }
function num(v, t) { const n = Number(val(v, t)); return isNaN(n) ? 0 : n; }
function str(v, t) { const x = val(v, t); return x == null ? '' : String(x); }
function truth(v, t) { if (v === '' || v == null) return false; const x = val(v, t); return x === true || (x !== false && x !== 0 && x !== '' && x !== 'false' && x !== '0'); }
function cmp(a, b) { const na = Number(a), nb = Number(b); if (a !== '' && b !== '' && !isNaN(na) && !isNaN(nb)) return na - nb; return String(a).toLowerCase().localeCompare(String(b).toLowerCase()); }
function radius(t) { return 24 * t.size / 100; }
function findSprite(name) { return targets.filter((s) => s.name === name && s.visible); }
function evalR(b, t) {
  const a = b.args || {};
  switch (b.op) {
    case 'xpos': return Math.round(t.x * 100) / 100; case 'ypos': return Math.round(t.y * 100) / 100;
    case 'direction': return t.dir; case 'size': return t.size; case 'costume': return t.emoji;
    case 'mouseX': return Math.round(mouse.x); case 'mouseY': return Math.round(mouse.y);
    case 'mouseDown': return mouse.down; case 'answer': return answer;
    case 'timer': return Math.round((performance.now() - timerStart) / 100) / 10;
    case 'keyPressed': { const k = str(a.KEY, t); return k === 'any' ? keys.size > 0 : keys.has(k); }
    case 'touching': {
      const w = str(a.WHAT, t), r = radius(t);
      if (!t.visible) return false;
      if (w === 'edge') return Math.abs(t.x) + r > W / 2 || Math.abs(t.y) + r > H / 2;
      if (w === 'mouse-pointer') return Math.hypot(t.x - mouse.x, t.y - mouse.y) < r;
      return findSprite(w).some((o) => o !== t && Math.hypot(t.x - o.x, t.y - o.y) < r + radius(o));
    }
    case 'distance': {
      const w = str(a.WHAT, t);
      if (w === 'mouse-pointer') return Math.round(Math.hypot(t.x - mouse.x, t.y - mouse.y));
      const o = findSprite(w)[0]; return o ? Math.round(Math.hypot(t.x - o.x, t.y - o.y)) : 10000;
    }
    case 'dayNow': { const d = new Date(); return ({ year: d.getFullYear(), month: d.getMonth() + 1, date: d.getDate(), 'day of week': d.getDay() + 1, hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() })[str(a.PART, t)]; }
    case 'add': return num(a.A, t) + num(a.B, t); case 'sub': return num(a.A, t) - num(a.B, t);
    case 'mul': return num(a.A, t) * num(a.B, t); case 'div': return num(a.B, t) === 0 ? Infinity : num(a.A, t) / num(a.B, t);
    case 'random': { let lo = num(a.A, t), hi = num(a.B, t); if (lo > hi) [lo, hi] = [hi, lo];
      return (Number.isInteger(lo) && Number.isInteger(hi)) ? lo + Math.floor(Math.random() * (hi - lo + 1)) : lo + Math.random() * (hi - lo); }
    case 'gt': return cmp(str(a.A, t), str(a.B, t)) > 0; case 'lt': return cmp(str(a.A, t), str(a.B, t)) < 0;
    case 'eq': return cmp(str(a.A, t), str(a.B, t)) === 0;
    case 'and': return truth(a.A, t) && truth(a.B, t); case 'or': return truth(a.A, t) || truth(a.B, t); case 'not': return !truth(a.A, t);
    case 'join': return str(a.A, t) + str(a.B, t);
    case 'letterOf': return str(a.TEXT, t).charAt(num(a.N, t) - 1);
    case 'lengthOf': return str(a.TEXT, t).length;
    case 'contains': return str(a.A, t).toLowerCase().includes(str(a.B, t).toLowerCase());
    case 'mod': { const n = num(a.A, t), m = num(a.B, t); return m ? ((n % m) + m) % m : NaN; }
    case 'round': return Math.round(num(a.A, t));
    case 'math': { const x = num(a.A, t), f = str(a.FN, t), rad = x * Math.PI / 180;
      const r = { abs: Math.abs(x), floor: Math.floor(x), ceiling: Math.ceil(x), sqrt: Math.sqrt(x), sin: Math.sin(rad), cos: Math.cos(rad), tan: Math.tan(rad) }[f];
      return Math.round(r * 1e10) / 1e10; }
    case 'getVar': return project.variables[a.VAR] ?? 0;
    case 'getList': return (project.lists[a.LIST] || []).join(' ');
    case 'listItem': { const l = project.lists[a.LIST] || []; return l[num(a.N, t) - 1] ?? ''; }
    case 'listLength': return (project.lists[a.LIST] || []).length;
    case 'listContains': { const it = str(a.ITEM, t).toLowerCase(); return (project.lists[a.LIST] || []).some((x) => String(x).toLowerCase() === it); }
  }
  return '';
}
function clampToStage(t) { const r = radius(t); t.x = Math.max(-W / 2 - r + 10, Math.min(W / 2 + r - 10, t.x)); t.y = Math.max(-H / 2 - r + 10, Math.min(H / 2 + r - 10, t.y)); }
function moveTo(t, x, y) {
  const ox = t.x, oy = t.y; t.x = x; t.y = y; clampToStage(t);
  if (t.penDown) { penCtx.strokeStyle = t.penColor || '#2563eb'; penCtx.lineWidth = t.penSize || 3; penCtx.lineCap = 'round';
    penCtx.beginPath(); penCtx.moveTo(W / 2 + ox, H / 2 - oy); penCtx.lineTo(W / 2 + t.x, H / 2 - t.y); penCtx.stroke(); }
}
function* waitSecs(s) { const end = performance.now() + s * 1000; do { yield; } while (performance.now() < end); }
function* runList(list, t, th) {
  for (const b of list) { if (th.stopped) return; yield* exec(b, t, th); }
  if (th === th) { /* finished */ }
}
function* exec(b, t, th) {
  const a = b.args || {};
  switch (b.op) {
    case 'move': { const s = num(a.STEPS, t), r = (90 - t.dir) * Math.PI / 180; moveTo(t, t.x + s * Math.cos(r), t.y + s * Math.sin(r)); break; }
    case 'turnRight': t.dir = norm(t.dir + num(a.DEG, t)); break;
    case 'turnLeft': t.dir = norm(t.dir - num(a.DEG, t)); break;
    case 'goto': moveTo(t, num(a.X, t), num(a.Y, t)); break;
    case 'gotoRandom': moveTo(t, Math.round(Math.random() * W - W / 2), Math.round(Math.random() * H - H / 2)); break;
    case 'gotoMouse': moveTo(t, mouse.x, mouse.y); break;
    case 'glide': { const secs = num(a.SECS, t), x0 = t.x, y0 = t.y, x1 = num(a.X, t), y1 = num(a.Y, t), st = performance.now();
      while (true) { const p = secs <= 0 ? 1 : Math.min(1, (performance.now() - st) / (secs * 1000)); moveTo(t, x0 + (x1 - x0) * p, y0 + (y1 - y0) * p); if (p >= 1) break; yield; if (th.stopped) return; } break; }
    case 'pointDir': t.dir = norm(num(a.DIR, t)); break;
    case 'pointMouse': t.dir = norm(90 - Math.atan2(mouse.y - t.y, mouse.x - t.x) * 180 / Math.PI); break;
    case 'changeX': moveTo(t, t.x + num(a.N, t), t.y); break; case 'setX': moveTo(t, num(a.N, t), t.y); break;
    case 'changeY': moveTo(t, t.x, t.y + num(a.N, t)); break; case 'setY': moveTo(t, t.x, num(a.N, t)); break;
    case 'bounce': { const r = radius(t), rad = (90 - t.dir) * Math.PI / 180; let dx = Math.cos(rad), dy = Math.sin(rad);
      if (t.x + r > W / 2) { dx = -Math.abs(dx); t.x = W / 2 - r; } if (t.x - r < -W / 2) { dx = Math.abs(dx); t.x = -W / 2 + r; }
      if (t.y + r > H / 2) { dy = -Math.abs(dy); t.y = H / 2 - r; } if (t.y - r < -H / 2) { dy = Math.abs(dy); t.y = -H / 2 + r; }
      t.dir = norm(90 - Math.atan2(dy, dx) * 180 / Math.PI); break; }
    case 'sayFor': t.bubble = { text: str(a.TEXT, t), think: false }; yield* waitSecs(num(a.SECS, t)); t.bubble = null; break;
    case 'say': { const s = str(a.TEXT, t); t.bubble = s ? { text: s, think: false } : null; break; }
    case 'think': { const s = str(a.TEXT, t); t.bubble = s ? { text: s, think: true } : null; break; }
    case 'setCostume': t.emoji = str(a.EMOJI, t) || t.emoji; break;
    case 'changeSize': t.size = Math.max(5, Math.min(500, t.size + num(a.N, t))); break;
    case 'setSize': t.size = Math.max(5, Math.min(500, num(a.N, t))); break;
    case 'show': t.visible = true; break; case 'hide': t.visible = false; break;
    case 'goFront': targets = targets.filter((x) => x !== t).concat(t); break;
    case 'setGhost': t.ghost = Math.max(0, Math.min(100, num(a.N, t))); break;
    case 'setBg': project.bg = str(a.C, t); break;
    case 'playSound': sfx(str(a.SND, t)); break;
    case 'playNote': { const secs = num(a.NOTE, t) ? num(a.SECS, t) : 0; tone(num(a.NOTE, t), secs); yield* waitSecs(secs); break; }
    case 'setVolume': volume = Math.max(0, Math.min(100, num(a.N, t))) / 100; break;
    case 'speak': if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(str(a.TEXT, t)); u.volume = volume; speechSynthesis.speak(u); } break;
    case 'wait': yield* waitSecs(num(a.SECS, t)); break;
    case 'repeat': { const n = Math.round(num(a.TIMES, t)); for (let i = 0; i < n; i++) { yield* runList(b.sub || [], t, th); if (th.stopped) return; yield; } break; }
    case 'forever': while (true) { yield* runList(b.sub || [], t, th); if (th.stopped) return; yield; }
    case 'if': if (truth(a.COND, t)) yield* runList(b.sub || [], t, th); break;
    case 'ifElse': yield* runList(truth(a.COND, t) ? (b.sub || []) : (b.sub2 || []), t, th); break;
    case 'waitUntil': while (!truth(a.COND, t)) { yield; if (th.stopped) return; } break;
    case 'repeatUntil': while (!truth(a.COND, t)) { yield* runList(b.sub || [], t, th); if (th.stopped) return; yield; } break;
    case 'forEach': { const v = a.VAR, hi = num(a.B, t); for (let i = num(a.A, t); i <= hi; i++) { project.variables[v] = i; yield* runList(b.sub || [], t, th); if (th.stopped) return; yield; } break; }
    case 'stop': { const w = str(a.WHAT, t);
      if (w === 'all') { stopAll(); th.stopped = true; return; }
      if (w === 'this script') { th.stopped = true; return; }
      threads.forEach((o) => { if (o.target === t && o !== th) o.stopped = true; }); break; }
    case 'clone': if (targets.filter((x) => x.isClone).length < 300) {
      const c = Object.assign({}, t, { isClone: true, original: t.isClone ? t.original : t, bubble: null, id: uid() });
      targets.splice(targets.indexOf(t), 0, c);
      startHats((hb) => hb.op === 'whenClone', c); } break;
    case 'deleteClone': if (t.isClone) { targets = targets.filter((x) => x !== t); threads.forEach((o) => { if (o.target === t) o.stopped = true; }); th.stopped = true; return; } break;
    case 'ask': { const box = $('#askBox'); $('#askQ').textContent = str(a.TEXT, t); $('#askIn').value = ''; box.hidden = false; $('#askIn').focus();
      th.asking = true; while (!box.hidden) { yield; if (th.stopped) return; } break; }
    case 'resetTimer': timerStart = performance.now(); timerFired.clear(); break;
    case 'broadcast': broadcastMsg(str(a.MSG, t)); break;
    case 'broadcastWait': { const ths = broadcastMsg(str(a.MSG, t)); while (ths.some((x) => !x.done && !x.stopped)) { yield; if (th.stopped) return; } break; }
    case 'setVar': project.variables[a.VAR] = val(a.VALUE, t); break;
    case 'changeVar': project.variables[a.VAR] = (Number(project.variables[a.VAR]) || 0) + num(a.N, t); break;
    case 'showVar': project.monitors[a.VAR] = true; break; case 'hideVar': project.monitors[a.VAR] = false; break;
    case 'listAdd': (project.lists[a.LIST] ||= []).push(str(a.ITEM, t)); break;
    case 'listDelete': (project.lists[a.LIST] ||= []).splice(num(a.N, t) - 1, 1); break;
    case 'listClear': project.lists[a.LIST] = []; break;
    case 'listInsert': (project.lists[a.LIST] ||= []).splice(num(a.N, t) - 1, 0, str(a.ITEM, t)); break;
    case 'listReplace': { const l = (project.lists[a.LIST] ||= []), i = num(a.N, t) - 1; if (i >= 0 && i < l.length) l[i] = str(a.ITEM, t); break; }
    case 'penClear': resetPen(); break;
    case 'penDown': t.penDown = true; moveTo(t, t.x, t.y); break; case 'penUp': t.penDown = false; break;
    case 'stamp': drawSprite(penCtx, t, false); break;
    case 'penColor': t.penColor = str(a.C, t); break; case 'penSize': t.penSize = Math.max(1, num(a.N, t)); break;
    case 'callFn': { const def = scriptsOf(t).find((sc) => sc.blocks[0] && sc.blocks[0].op === 'defineFn' && sc.blocks[0].args.NAME === a.NAME);
      if (def) { th.depth = (th.depth || 0) + 1; if (th.depth > 200) { th.stopped = true; toast('Too many blocks running inside each other'); return; }
        yield* runList(def.blocks.slice(1), t, th); th.depth--; } break; }
  }
}
function norm(d) { d = ((d + 180) % 360 + 360) % 360 - 180; return d === -180 ? 180 : d; }

function step() {
  // timer hats
  const secs = (performance.now() - timerStart) / 1000;
  if (project) project.sprites.forEach((s) => s.scripts.forEach((sc) => {
    const hb = sc.blocks[0]; if (!hb || hb.op !== 'whenTimer') return;
    const key = s.id + JSON.stringify(hb.args);
    if (!timerFired.has(key) && threads.length && secs > num(hb.args.N, s)) { timerFired.add(key); startHats((b) => b === hb, s); }
  }));
  const until = performance.now() + 12;
  for (const th of threads.slice()) {
    if (th.stopped || th.done) continue;
    try { const r = th.gen.next(); if (r.done) th.done = true; }
    catch (err) { th.done = true; console.error(err); toast('Something went wrong in a script: ' + err.message); }
    if (performance.now() > until) break;
  }
  threads.forEach((th) => { if ((th.done || th.stopped) && th.el) th.el.classList.remove('running'); });
  threads = threads.filter((th) => !th.done && !th.stopped);
  $('#runState').textContent = threads.length ? '● running' : '';
  draw();
  requestAnimationFrame(step);
}

// ---------------- Drawing ----------------
function drawSprite(c, t, withBubble) {
  if (!t.visible) return;
  c.save();
  c.globalAlpha = 1 - (t.ghost || 0) / 100;
  c.translate(W / 2 + t.x, H / 2 - t.y);
  c.rotate((t.dir - 90) * Math.PI / 180);
  c.font = `${Math.round(48 * t.size / 100)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(t.emoji, 0, 2);
  c.restore();
  if (withBubble && t.bubble) {
    const text = String(t.bubble.text).slice(0, 200);
    c.font = '14px "Segoe UI",sans-serif';
    const lines = wrap(c, text, 150);
    const bw = Math.max(...lines.map((l) => c.measureText(l).width)) + 18, bh = lines.length * 17 + 12;
    let bx = W / 2 + t.x + radius(t) * 0.6, by = H / 2 - t.y - radius(t) - bh - 8;
    bx = Math.min(W - bw - 2, Math.max(2, bx)); by = Math.max(2, by);
    c.fillStyle = '#fff'; c.strokeStyle = '#999'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(bx, by, bw, bh, t.bubble.think ? 16 : 10); c.fill(); c.stroke();
    c.fillStyle = '#222'; c.textAlign = 'left'; c.textBaseline = 'top';
    lines.forEach((l, i) => c.fillText(l, bx + 9, by + 7 + i * 17));
  }
}
function wrap(c, text, max) {
  const words = text.split(' '), lines = []; let cur = '';
  words.forEach((w) => { const tst = cur ? cur + ' ' + w : w; if (c.measureText(tst).width > max && cur) { lines.push(cur); cur = w; } else cur = tst; });
  lines.push(cur); return lines;
}
function draw() {
  if (!ctx || !project) return;
  ctx.fillStyle = project.bg || '#ffffff'; ctx.fillRect(0, 0, W, H);
  if ($('#gridToggle') && $('#gridToggle').checked) {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
  }
  ctx.drawImage(penCanvas, 0, 0);
  syncTargets();
  targets.forEach((t) => drawSprite(ctx, t, false));
  targets.forEach((t) => t.bubble && drawSprite(ctx, Object.assign({}, t, { emoji: '' }), true));
  // variable monitors
  let my = 6;
  ctx.font = '12px "Segoe UI",sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  Object.keys(project.monitors).forEach((k) => {
    if (!project.monitors[k]) return;
    const isList = k.startsWith('list:'), name = isList ? k.slice(5) : k;
    if (isList ? !(name in project.lists) : !(name in project.variables)) return;
    const v = isList ? '[' + (project.lists[name] || []).slice(-8).join(', ') + ']' : String(project.variables[name]);
    const label = name + ': ', lw = ctx.measureText(label).width, vw = ctx.measureText(v).width;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = '#bbb';
    ctx.beginPath(); ctx.roundRect(6, my, lw + vw + 16, 20, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#333'; ctx.fillText(label, 12, my + 10);
    ctx.fillStyle = '#cc5320'; ctx.fillText(v, 12 + lw, my + 10);
    my += 24;
  });
  // selected sprite info
  if (sprite) $('#spriteInfo').textContent = `x: ${Math.round(sprite.x)}   y: ${Math.round(sprite.y)}   direction: ${Math.round(sprite.dir)}   size: ${Math.round(sprite.size)}%`;
}

// ---------------- Sound ----------------
function ac() { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); return audio; }
function tone(midi, secs, type = 'square', vol = 0.15) {
  if (!secs) return;
  const a = ac(), o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
  g.gain.setValueAtTime(vol * volume, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + secs);
  o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + secs + 0.02);
}
function sweep(f1, f2, secs, type = 'square') {
  const a = ac(), o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, a.currentTime); o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + secs);
  g.gain.setValueAtTime(0.15 * volume, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + secs);
  o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + secs + 0.02);
}
function sfx(name) {
  if (name === 'pop') sweep(600, 200, 0.1, 'sine');
  else if (name === 'coin') { tone(83, 0.08); setTimeout(() => tone(88, 0.25), 80); }
  else if (name === 'jump') sweep(200, 700, 0.2);
  else if (name === 'hit') sweep(300, 60, 0.18, 'sawtooth');
  else if (name === 'laser') sweep(1400, 200, 0.22, 'sawtooth');
  else if (name === 'powerup') [60, 64, 67, 72].forEach((n, i) => setTimeout(() => tone(n, 0.12), i * 90));
}

// ---------------- Sprites panel ----------------
function renderSprites() {
  const box = $('#spriteList'); box.textContent = '';
  project.sprites.forEach((s) => {
    const b = h('button', 'sprite-chip' + (s === sprite ? ' on' : ''));
    b.appendChild(h('span', 'emo', s.emoji)); b.appendChild(h('span', null, s.name));
    b.addEventListener('click', () => { syncFromDom(); sprite = s; renderAll(); });
    box.appendChild(b);
  });
  $('#spriteName').value = sprite.name;
  $('#spriteEmoji').textContent = sprite.emoji;
  $('#spriteShow').checked = sprite.visible;
}
function pickEmoji(title, cb) {
  const m = $('#emojiModal'); $('#emojiTitle').textContent = title;
  const grid = $('#emojiGrid'); grid.textContent = '';
  EMOJI.forEach((e) => { const b = h('button', null, e); b.addEventListener('click', () => { m.hidden = true; cb(e); }); grid.appendChild(b); });
  $('#emojiCustom').value = '';
  $('#emojiOk').onclick = () => { const v = $('#emojiCustom').value.trim(); if (v) { m.hidden = true; cb(v); } };
  $('#emojiCancel').onclick = () => { m.hidden = true; };
  m.hidden = false;
}
function makeVariable() {
  const n = (prompt('New variable name:') || '').trim(); if (!n) return;
  if (n in project.variables) return toast('There is already a variable called ' + n);
  syncFromDom(); project.variables[n] = 0; project.monitors[n] = true; renderAll(); changed();
}
function makeList() {
  const n = (prompt('New list name:') || '').trim(); if (!n) return;
  if (n in project.lists) return toast('There is already a list called ' + n);
  syncFromDom(); project.lists[n] = []; project.monitors['list:' + n] = true; renderAll(); changed();
}
function makeFn() {
  const n = (prompt('Name of your new block:') || '').trim(); if (!n) return;
  if (project.fns.includes(n)) return toast('That block already exists');
  syncFromDom(); project.fns.push(n);
  sprite.scripts.push({ x: 40, y: 40 + sprite.scripts.length * 20, blocks: [{ op: 'defineFn', args: { NAME: n } }] });
  renderAll(); changed();
}

// ---------------- Projects UI ----------------
function setStatus(s) { const el = $('#saveState'); if (el) el.textContent = s; }
function toast(msg) { const t = $('#bcToast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2400); }
function openProjects() {
  saveProject(true);
  const list = $('#projList'); list.textContent = '';
  const all = Object.values(allProjects()).sort((a, b) => b.updated - a.updated);
  all.forEach((p) => {
    const r = h('div', 'proj-row' + (p.id === project.id ? ' on' : ''));
    const info = h('div', 'grow');
    info.appendChild(h('strong', null, p.name));
    info.appendChild(h('div', 'muted small', `${p.sprites.length} sprite${p.sprites.length === 1 ? '' : 's'} · saved ${new Date(p.updated).toLocaleString()}`));
    const open = h('button', 'btn small primary', 'Open'); open.addEventListener('click', () => { $('#projModal').hidden = true; loadProject(p); toast('Opened ' + p.name); });
    const dup = h('button', 'btn small', 'Copy'); dup.addEventListener('click', () => { const c = JSON.parse(JSON.stringify(p)); c.id = uid(); c.name = p.name + ' (copy)'; c.updated = Date.now(); const all2 = allProjects(); all2[c.id] = c; localStorage.setItem(STORE, JSON.stringify(all2)); openProjects(); });
    const del = h('button', 'btn small ghost', '🗑');
    del.title = 'Delete';
    del.addEventListener('click', () => {
      if (!confirm('Delete "' + p.name + '"? This can\'t be undone.')) return;
      const all2 = allProjects(); delete all2[p.id]; localStorage.setItem(STORE, JSON.stringify(all2));
      if (p.id === project.id) { const rest = Object.values(all2); loadProject(rest[0] || newProject()); }
      openProjects();
    });
    r.append(info, open, dup, del); list.appendChild(r);
  });
  $('#projModal').hidden = false;
}
function exportProject() {
  saveProject(true);
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const a = h('a'); a.href = URL.createObjectURL(blob); a.download = (project.name || 'project').replace(/[\\/:*?"<>|]+/g, '-') + '.devev.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Saved to your Downloads folder');
}
function importProject(file) {
  const r = new FileReader();
  r.onload = () => {
    try { const p = JSON.parse(r.result); if (!p.sprites) throw new Error('not a project');
      p.id = uid(); p.updated = Date.now(); loadProject(p); toast('Opened ' + p.name); }
    catch (_) { toast('That file is not a Dev Ev project'); }
  };
  r.readAsText(file);
}
// ---------------- Wire up ----------------
function renderAll() { renderPalette(); renderWorkspace(); renderSprites(); }
function init() {
  if (!window.IS_WINDOWS_PC || !$('#bcRoot')) return;
  canvas = $('#stage'); ctx = canvas.getContext('2d');
  penCanvas = document.createElement('canvas'); penCanvas.width = W; penCanvas.height = H; penCtx = penCanvas.getContext('2d');
  const all = allProjects(); const cur = all[localStorage.getItem(CUR)] || Object.values(all)[0];
  project = cur || newProject();
  project.lists = project.lists || {}; project.monitors = project.monitors || {}; project.fns = project.fns || [];
  sprite = project.sprites[0];
  $('#projName').value = project.name;
  renderAll(); saveProject(true);

  $('#flagBtn').addEventListener('click', greenFlag);
  $('#stopBtn').addEventListener('click', stopAll);
  $('#projName').addEventListener('input', () => { project.name = $('#projName').value || 'Untitled'; changed(); });
  $('#newProj').addEventListener('click', () => { saveProject(true); const n = prompt('Name for the new project:', 'My project'); if (n == null) return; loadProject(newProject(n.trim() || 'My project')); toast('New project started'); });
  $('#openProj').addEventListener('click', openProjects);
  $('#saveProj').addEventListener('click', () => saveProject(false));
  $('#exportProj').addEventListener('click', exportProject);
  $('#importProj').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProject(e.target.files[0]); e.target.value = ''; });
  $('#projClose').addEventListener('click', () => { $('#projModal').hidden = true; });
  $('#cleanUp').addEventListener('click', cleanUp);
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-view]').forEach((x) => x.classList.toggle('on', x === b));
    $('#ws').hidden = b.dataset.view !== 'blocks'; $('#codeView').hidden = b.dataset.view !== 'code';
    if (b.dataset.view === 'code') { syncFromDom(); renderCode(); }
  }));
  $('#copyCode').addEventListener('click', () => { navigator.clipboard.writeText($('#codeOut').textContent).then(() => toast('Code copied')); });
  $('#addSprite').addEventListener('click', () => pickEmoji('Pick a sprite', (e) => {
    syncFromDom(); let n = 1; while (project.sprites.some((s) => s.name === 'Sprite' + n)) n++;
    const s = newSprite('Sprite' + n, e, Math.round(Math.random() * 200 - 100), Math.round(Math.random() * 160 - 80));
    project.sprites.push(s); sprite = s; renderAll(); changed();
  }));
  $('#spriteEmoji').addEventListener('click', () => pickEmoji('Change costume', (e) => { sprite.emoji = e; renderSprites(); changed(); }));
  $('#spriteName').addEventListener('change', () => {
    const n = $('#spriteName').value.trim(); if (!n || project.sprites.some((s) => s !== sprite && s.name === n)) { $('#spriteName').value = sprite.name; return toast('Pick a different name'); }
    sprite.name = n; renderSprites(); renderPalette(); changed();
  });
  $('#spriteShow').addEventListener('change', () => { sprite.visible = $('#spriteShow').checked; changed(); });
  $('#delSprite').addEventListener('click', () => {
    if (project.sprites.length < 2) return toast('A project needs at least one sprite');
    if (!confirm('Delete ' + sprite.name + ' and its scripts?')) return;
    project.sprites = project.sprites.filter((s) => s !== sprite); sprite = project.sprites[0]; renderAll(); changed();
  });
  $('#dupSprite').addEventListener('click', () => {
    syncFromDom(); const c = JSON.parse(JSON.stringify(sprite)); c.id = uid(); c.name = sprite.name + '2'; c.x += 30; c.y -= 30;
    project.sprites.push(c); sprite = c; renderAll(); changed();
  });
  $('#bgColor').addEventListener('input', (e) => { project.bg = e.target.value; changed(); });
  $('#fullBtn').addEventListener('click', () => { const w = $('#stageWrap'); document.fullscreenElement ? document.exitFullscreen() : w.requestFullscreen(); });
  $('#shotBtn').addEventListener('click', () => { const a = h('a'); a.href = canvas.toDataURL('image/png'); a.download = (project.name || 'stage') + '.png'; a.click(); toast('Screenshot saved to Downloads'); });
  $('#askIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') { answer = $('#askIn').value; $('#askBox').hidden = true; } });
  $('#askOk').addEventListener('click', () => { answer = $('#askIn').value; $('#askBox').hidden = true; });

  // Stage mouse
  const toStage = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W - W / 2, y: H / 2 - (e.clientY - r.top) / r.height * H }; };
  let dragSprite = null;
  canvas.addEventListener('pointermove', (e) => { const p = toStage(e); mouse.x = p.x; mouse.y = p.y;
    if (dragSprite && !threads.length) { dragSprite.s.x = Math.round(p.x - dragSprite.ox); dragSprite.s.y = Math.round(p.y - dragSprite.oy); } });
  canvas.addEventListener('pointerdown', (e) => {
    mouse.down = true; ac();
    const p = toStage(e);
    const hit = targets.slice().reverse().find((t) => t.visible && Math.hypot(t.x - p.x, t.y - p.y) < radius(t));
    if (hit) {
      startHats((b) => b.op === 'whenClicked', hit);
      const base = hit.isClone ? null : hit;
      if (base) { if (base !== sprite) { syncFromDom(); sprite = base; renderAll(); } dragSprite = { s: base, ox: p.x - base.x, oy: p.y - base.y }; }
    }
  });
  window.addEventListener('pointerup', () => { mouse.down = false; if (dragSprite) { dragSprite = null; changed(); } });

  // Keyboard
  const keyName = (e) => ({ ' ': 'space', ArrowUp: 'up arrow', ArrowDown: 'down arrow', ArrowLeft: 'left arrow', ArrowRight: 'right arrow', Enter: 'enter' })[e.key] || (e.key.length === 1 ? e.key.toLowerCase() : null);
  const onHome = () => $('#screen-home').classList.contains('active');
  window.addEventListener('keydown', (e) => {
    if (!onHome()) return;
    if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(false); return; }
    if (e.target.closest && e.target.closest('input,select,textarea')) return;
    const k = keyName(e); if (!k) return;
    if (['space', 'up arrow', 'down arrow', 'left arrow', 'right arrow'].includes(k)) e.preventDefault();
    if (!keys.has(k)) { keys.add(k); startHats((b) => b.op === 'whenKey' && (b.args.KEY === k || b.args.KEY === 'any')); }
  });
  window.addEventListener('keyup', (e) => { const k = keyName(e); if (k) keys.delete(k); });
  window.addEventListener('blur', () => keys.clear());
  window.addEventListener('beforeunload', () => { if (dirty) saveProject(true); });

  requestAnimationFrame(step);
}
window.DevEvBlocks = { get project() { return project; }, greenFlag, stopAll, saveProject, get threads() { return threads; }, DEFS };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
