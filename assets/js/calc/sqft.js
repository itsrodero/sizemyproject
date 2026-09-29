/* Square footage calculator: add up several areas of different shapes and subtract cut-outs. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('sqft-form');
  if (!form) return;
  var list = document.getElementById('sqft-rows');
  var out = document.getElementById('sqft-results');
  var SHAPES = {
    rect: { name: 'Rectangle', dims: ['Length', 'Width'] },
    circle: { name: 'Circle', dims: ['Diameter'] },
    tri: { name: 'Triangle', dims: ['Base', 'Height'] },
    trap: { name: 'Trapezoid', dims: ['Side a', 'Side b', 'Height'] }
  };
  var UNITS = ['ft', 'in', 'yd', 'm', 'cm'];

  function rowHtml(r, i) {
    var sh = SHAPES[r.shape] || SHAPES.rect;
    var dims = sh.dims.map(function (label, j) {
      return '<div class="field"><label>' + label + '</label><div class="inp"><input type="text" inputmode="decimal" data-d="' + j + '" value="' + S.esc(r.d[j] || '') + '" aria-label="' + label + ' of area ' + (i + 1) + '"></div></div>';
    }).join('');
    return '<fieldset class="area-row" data-i="' + i + '"><legend>Area ' + (i + 1) + '</legend><div class="fields">' +
      '<div class="field"><label>Shape</label><select class="select" data-role="shape" aria-label="Shape of area ' + (i + 1) + '">' + Object.keys(SHAPES).map(function (k) {
        return '<option value="' + k + '"' + (k === r.shape ? ' selected' : '') + '>' + SHAPES[k].name + '</option>';
      }).join('') + '</select></div>' +
      '<div class="field"><label>Units</label><select class="select" data-role="unit" aria-label="Units for area ' + (i + 1) + '">' + UNITS.map(function (u) {
        return '<option' + (u === r.unit ? ' selected' : '') + '>' + u + '</option>';
      }).join('') + '</select></div>' + dims + '</div>' +
      '<div class="row-foot"><label class="check"><input type="checkbox" data-role="sub"' + (r.sub ? ' checked' : '') + '> Subtract this area (a cut-out)</label>' +
      '<span class="row-area" data-role="area"></span>' +
      (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-role="remove">Remove</button>' : '') + '</div></fieldset>';
  }

  var rows = load() || [{ shape: 'rect', unit: 'ft', d: ['12', '10'], sub: false }];

  function load() {
    var s = new URLSearchParams(location.search).get('rows');
    if (!s) return null;
    return s.split('|').map(function (part) {
      var p = part.split(',');
      return { shape: SHAPES[p[0]] ? p[0] : 'rect', unit: UNITS.indexOf(p[4]) > -1 ? p[4] : 'ft', d: [p[1] || '', p[2] || '', p[3] || ''], sub: p[5] === '1' };
    });
  }
  function save() {
    var params = new URLSearchParams(location.search);
    params.set('rows', rows.map(function (r) { return [r.shape, r.d[0], r.d[1], r.d[2], r.unit, r.sub ? 1 : 0].join(','); }).join('|'));
    history.replaceState && history.replaceState(null, '', location.pathname + '?' + params.toString());
  }
  function draw() { list.innerHTML = rows.map(rowHtml).join(''); }

  function areaOf(r) {
    var f = S.TO_FT[r.unit] || 1;
    var d = r.d.map(function (x) { return parseFloat(String(x).replace(/,/g, '')) * f; });
    if (r.shape === 'rect') return d[0] * d[1];
    if (r.shape === 'circle') return Math.PI * Math.pow(d[0] / 2, 2);
    if (r.shape === 'tri') return d[0] * d[1] / 2;
    if (r.shape === 'trap') return (d[0] + d[1]) / 2 * d[2];
    return NaN;
  }

  function compute() {
    var total = 0, any = false;
    list.querySelectorAll('.area-row').forEach(function (el, i) {
      var a = areaOf(rows[i]);
      el.querySelector('[data-role="area"]').textContent = isFinite(a) ? (rows[i].sub ? '− ' : '') + S.fmt(a, 2) + ' sq ft' : '';
      if (isFinite(a)) { total += rows[i].sub ? -a : a; any = true; }
    });
    if (!any) { out.innerHTML = '<p class="results-empty">Enter the dimensions of at least one area.</p>'; return; }
    var price = S.val(form, 'price');
    var cost = isFinite(price) && price > 0 ? (S.unit(form, 'price') === 'sqyd' ? price * total / 9 : price * total) : NaN;
    out.innerHTML =
      '<div class="result-main"><div class="k">Total area</div><div class="v">' + S.fmt(total, 2) + '<small>sq ft</small></div>' +
      '<div class="sub">' + rows.length + ' area' + (rows.length > 1 ? 's' : '') + '</div></div>' +
      '<ul class="result-rows">' +
      '<li><span>Square yards</span><strong>' + S.fmt(total / 9, 2) + ' sq yd</strong></li>' +
      '<li><span>Square meters</span><strong>' + S.fmt(total * 0.09290304, 2) + ' m²</strong></li>' +
      '<li><span>Square inches</span><strong>' + S.fmt(total * 144, 0) + ' sq in</strong></li>' +
      '<li><span>Acres</span><strong>' + S.fmt(total / 43560, 4) + ' ac</strong></li>' +
      (isFinite(cost) ? '<li><span>Estimated cost</span><strong>' + S.money(cost) + '</strong></li>' : '') + '</ul>';
    form._list = 'Total area: ' + S.fmt(total, 2) + ' sq ft (' + S.fmt(total / 9, 2) + ' sq yd, ' + S.fmt(total * 0.09290304, 2) + ' m2)\n' + location.href;
  }

  list.addEventListener('input', function (e) {
    var row = e.target.closest('.area-row');
    if (!row) return;
    var r = rows[+row.dataset.i];
    if (e.target.dataset.d != null) r.d[+e.target.dataset.d] = e.target.value;
    save(); compute();
  });
  list.addEventListener('change', function (e) {
    var row = e.target.closest('.area-row');
    if (!row) return;
    var r = rows[+row.dataset.i], role = e.target.dataset.role;
    if (role === 'shape') { r.shape = e.target.value; r.d = ['', '', '']; draw(); }
    if (role === 'unit') r.unit = e.target.value;
    if (role === 'sub') r.sub = e.target.checked;
    save(); compute();
  });
  list.addEventListener('click', function (e) {
    if (e.target.dataset.role !== 'remove') return;
    rows.splice(+e.target.closest('.area-row').dataset.i, 1);
    draw(); save(); compute();
  });
  document.getElementById('sqft-add').addEventListener('click', function () {
    rows.push({ shape: 'rect', unit: rows[rows.length - 1].unit, d: ['', '', ''], sub: false });
    draw(); save(); compute();
    var inputs = list.querySelectorAll('.area-row:last-child input[data-d]');
    if (inputs[0]) inputs[0].focus();
  });
  form.querySelector('[data-k="price"]').addEventListener('input', compute);
  form.querySelector('[data-u="price"]').addEventListener('change', compute);
  var root = form.closest('.calc');
  root.querySelector('.js-share').addEventListener('click', function (e) { S.copy(location.href, e.currentTarget, 'Link copied ✓'); });
  root.querySelector('.js-print').addEventListener('click', function () { window.print(); });
  root.querySelector('.js-list').addEventListener('click', function (e) { S.copy(form._list || '', e.currentTarget, 'Copied ✓'); });
  root.querySelector('.js-reset').addEventListener('click', function () {
    rows = [{ shape: 'rect', unit: 'ft', d: ['12', '10'], sub: false }];
    draw(); history.replaceState && history.replaceState(null, '', location.pathname); compute();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  draw();
  compute();
})();
