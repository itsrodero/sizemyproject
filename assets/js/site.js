/* SizeMyProject — navigation and shared calculator helpers (window.SMP). */
(function () {
  'use strict';

  // ---------- navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.nav-dd').forEach(function (dd) {
    var btn = dd.querySelector('.nav-dd-btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav-dd.is-open').forEach(function (dd) {
      if (!dd.contains(e.target)) { dd.classList.remove('is-open'); dd.querySelector('.nav-dd-btn').setAttribute('aria-expanded', 'false'); }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.nav-dd.is-open').forEach(function (dd) { dd.classList.remove('is-open'); });
  });

  // ---------- calculator helpers
  // Length units expressed in feet.
  var TO_FT = { ft: 1, in: 1 / 12, yd: 3, m: 3.280839895, cm: 0.03280839895 };
  var FT3_PER_YD3 = 27;
  var M3_PER_FT3 = 0.028316846592;

  function val(form, key) {
    var el = form.querySelector('[data-k="' + key + '"]');
    if (!el) return NaN;
    var v = parseFloat(String(el.value).replace(/,/g, ''));
    return isFinite(v) ? v : NaN;
  }
  function unit(form, key) {
    var el = form.querySelector('[data-u="' + key + '"]');
    return el ? el.value : 'ft';
  }
  // A length field in feet (value × its unit select).
  function len(form, key) {
    var v = val(form, key);
    return isFinite(v) ? v * (TO_FT[unit(form, key)] || 1) : NaN;
  }
  function fmt(n, dec) {
    if (!isFinite(n)) return '–';
    dec = dec == null ? 2 : dec;
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: dec });
  }
  function money(n) {
    return isFinite(n) ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n < 100 ? 2 : 0 }) : '–';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // Keep every input in the URL so a result can be shared or bookmarked.
  function saveState(form) {
    var params = new URLSearchParams();
    form.querySelectorAll('[data-k], [data-u]').forEach(function (el) {
      var name = el.dataset.k ? el.dataset.k : 'u_' + el.dataset.u;
      var def = el.tagName === 'SELECT' ? (el.querySelector('option[selected]') || el.options[0] || {}).value : el.defaultValue;
      if (el.value !== '' && el.value !== def) params.set(name, el.value);
    });
    var shape = form.dataset.shape;
    if (shape && shape !== form.dataset.defaultShape) params.set('shape', shape);
    var q = params.toString();
    if (history.replaceState) history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
  }
  function loadState(form) {
    var params = new URLSearchParams(location.search);
    params.forEach(function (v, k) {
      var el = k.indexOf('u_') === 0 ? form.querySelector('[data-u="' + k.slice(2) + '"]') : form.querySelector('[data-k="' + k + '"]');
      if (el) el.value = v;
    });
    return params.get('shape');
  }

  // Shape switcher: buttons with data-shape toggle [data-for] field groups.
  function initShapes(form, onChange) {
    var buttons = form.querySelectorAll('.seg [data-shape]');
    if (!buttons.length) return;
    form.dataset.defaultShape = buttons[0].dataset.shape;
    function set(shape) {
      form.dataset.shape = shape;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.shape === shape ? 'true' : 'false'); });
      form.querySelectorAll('[data-for]').forEach(function (g) { g.hidden = g.dataset.for.split(' ').indexOf(shape) === -1; });
      form.querySelectorAll('[data-diagram]').forEach(function (d) { d.hidden = d.dataset.diagram !== shape; });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { set(b.dataset.shape); onChange(); });
    });
    set(form.dataset.shape || form.dataset.defaultShape);
    return set;
  }

  function copy(text, btn, done) {
    function ok() {
      if (!btn) return;
      var t = btn.textContent;
      btn.textContent = done || 'Copied ✓';
      setTimeout(function () { btn.textContent = t; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, ok);
    else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); ok(); }
  }

  // Wires up a calculator: restores state, recalculates on every change,
  // and connects the Copy link / Print / Copy list buttons.
  function calculator(form, compute) {
    var fromUrl = loadState(form);
    if (fromUrl) form.dataset.shape = fromUrl;
    var setShape = initShapes(form, run);
    if (fromUrl && setShape) setShape(fromUrl);
    function run() {
      var list = compute();
      form._list = list || '';
      saveState(form);
    }
    form.addEventListener('input', run);
    form.addEventListener('change', run);
    form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    var root = form.closest('.calc') || document;
    var share = root.querySelector('.js-share');
    if (share) share.addEventListener('click', function () { copy(location.href, share, 'Link copied ✓'); });
    var print = root.querySelector('.js-print');
    if (print) print.addEventListener('click', function () { window.print(); });
    var list = root.querySelector('.js-list');
    if (list) list.addEventListener('click', function () { copy(form._list || '', list, 'List copied ✓'); });
    var reset = root.querySelector('.js-reset');
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      if (setShape) setShape(form.dataset.defaultShape);
      history.replaceState(null, '', location.pathname);
      run();
    });
    run();
  }

  window.SMP = {
    TO_FT: TO_FT, FT3_PER_YD3: FT3_PER_YD3, M3_PER_FT3: M3_PER_FT3,
    val: val, unit: unit, len: len, fmt: fmt, money: money, esc: esc, copy: copy, calculator: calculator
  };
})();
