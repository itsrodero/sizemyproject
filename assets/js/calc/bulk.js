/* Bulk material calculator (gravel, mulch, topsoil, sand): area × depth → cubic yards, tons and bags.
   Each page describes its material in <script type="application/json" id="bulk-config">. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('bulk-form');
  var cfgEl = document.getElementById('bulk-config');
  if (!form || !cfgEl) return;
  var cfg = JSON.parse(cfgEl.textContent);
  var out = document.getElementById('bulk-results');
  var matSel = form.querySelector('[data-k="mat"]');
  var densInp = form.querySelector('[data-k="dens"]');

  // Fill the material list and keep the density box in sync with it.
  if (matSel && cfg.materials) {
    matSel.innerHTML = cfg.materials.map(function (m, i) { return '<option value="' + i + '">' + S.esc(m.name) + '</option>'; }).join('');
    matSel.addEventListener('change', function () {
      var m = cfg.materials[+matSel.value];
      if (densInp && m) densInp.value = m.density;
    });
    if (densInp) densInp.defaultValue = densInp.value = cfg.materials[0].density;
  }

  function areaFt2() {
    var shape = form.dataset.shape;
    if (shape === 'rect') return S.len(form, 'L') * S.len(form, 'W');
    if (shape === 'circle') { var r = S.len(form, 'D') / 2; return Math.PI * r * r; }
    if (shape === 'tri') return S.len(form, 'B') * S.len(form, 'H') / 2;
    if (shape === 'area') {
      var a = S.val(form, 'A');
      return S.unit(form, 'A') === 'm2' ? a * 10.7639104 : a;
    }
    return NaN;
  }

  function compute() {
    var area = areaFt2();
    var depth = S.len(form, 'depth');
    var ft3base = area * depth;
    if (!isFinite(ft3base) || ft3base <= 0) {
      out.innerHTML = '<p class="results-empty">Enter the size of the area and the depth to see how much ' + S.esc(cfg.noun) + ' you need.</p>';
      return '';
    }
    var extra = S.val(form, 'extra');
    extra = isFinite(extra) && extra >= 0 ? extra : 0;
    var ft3 = ft3base * (1 + extra / 100);
    var yd3 = ft3 / S.FT3_PER_YD3;
    var m3 = ft3 * S.M3_PER_FT3;
    var dens = densInp ? S.val(form, 'dens') : NaN; // US tons per cubic yard
    var tons = isFinite(dens) && dens > 0 ? yd3 * dens : NaN;

    var rows = '<li><span>Area</span><strong>' + S.fmt(area, 1) + ' sq ft (' + S.fmt(area / 10.7639104, 1) + ' m²)</strong></li>' +
      '<li><span>Volume without extra</span><strong>' + S.fmt(ft3base / S.FT3_PER_YD3, 2) + ' yd³</strong></li>';
    if (isFinite(tons)) rows += '<li><span>Weight at ' + S.fmt(dens, 2) + ' t/yd³</span><strong>' + S.fmt(tons, 2) + ' tons (' + S.fmt(tons * 0.90718474, 2) + ' t)</strong></li>';

    var bagRows = (cfg.bags || []).map(function (b) {
      return { label: b.label, n: Math.ceil(ft3 / b.ft3 - 1e-9) };
    });
    var table = bagRows.length ? '<h3 class="h-sm">Bagged ' + S.esc(cfg.noun) + '</h3><table class="bag-table"><thead><tr><th>Bag size</th><th>Bags</th></tr></thead><tbody>' +
      bagRows.map(function (r) { return '<tr><td>' + S.esc(r.label) + '</td><td>' + S.fmt(r.n, 0) + '</td></tr>'; }).join('') + '</tbody></table>' : '';

    var price = S.val(form, 'price');
    var mode = S.unit(form, 'price');
    var cost = NaN, costLabel = '';
    if (isFinite(price) && price > 0) {
      if (mode === 'yd') { cost = price * yd3; costLabel = S.fmt(yd3, 2) + ' yd³ × ' + S.money(price); }
      else if (mode === 'ton' && isFinite(tons)) { cost = price * tons; costLabel = S.fmt(tons, 2) + ' tons × ' + S.money(price); }
      else if (mode.indexOf('bag') === 0 && bagRows.length) {
        var bi = parseInt(mode.slice(3), 10) || 0;
        cost = price * bagRows[bi].n; costLabel = bagRows[bi].n + ' bags (' + bagRows[bi].label + ') × ' + S.money(price);
      }
    }
    if (isFinite(cost)) rows += '<li><span>Estimated cost<br><small>' + S.esc(costLabel) + '</small></span><strong>' + S.money(cost) + '</strong></li>';

    var tip = '';
    var depthIn = depth * 12;
    (cfg.tips || []).forEach(function (t) {
      if (!tip && depthIn >= (t.min || 0) && depthIn <= (t.max || 1e9)) tip = '<p class="note' + (t.warn ? ' warn' : '') + '">' + S.esc(t.text) + '</p>';
    });
    var bulkNote = yd3 >= (cfg.bulkAbove || 1) && bagRows.length
      ? '<p class="note">At ' + S.fmt(yd3, 1) + ' cubic yards, buying in bulk from a landscape supplier is usually much cheaper than ' + S.fmt(bagRows[0].n, 0) + ' bags.</p>' : '';

    out.innerHTML =
      '<div class="result-main"><div class="k">' + S.esc(cfg.title) + ' needed</div><div class="v">' + S.fmt(yd3, 2) + '<small>cu yd</small></div>' +
      '<div class="sub">' + S.fmt(ft3, 1) + ' cu ft · ' + S.fmt(m3, 2) + ' m³' + (isFinite(tons) ? ' · ≈ ' + S.fmt(tons, 2) + ' tons' : '') + ' · includes ' + S.fmt(extra, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + table + tip + bulkNote;

    return cfg.title + ': ' + S.fmt(yd3, 2) + ' cu yd (' + S.fmt(ft3, 1) + ' cu ft' + (isFinite(tons) ? ', ~' + S.fmt(tons, 2) + ' tons' : '') + ') incl. ' + S.fmt(extra, 0) + '% extra\n' +
      bagRows.map(function (r) { return '- or ' + r.n + ' bags of ' + r.label; }).join('\n') + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
