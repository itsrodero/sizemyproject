/* Board foot calculator: up to four board sizes, thickness in inches or quarters (5/4), total board feet and cost. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('bf-form');
  if (!form) return;
  var out = document.getElementById('bf-results');
  var ROWS = [1, 2, 3, 4];

  // Accepts 2, 1.5, 5/4 or 1 1/2.
  function num(key) {
    var el = form.querySelector('[data-k="' + key + '"]');
    var s = el ? String(el.value).trim().replace(/,/g, '') : '';
    if (!s) return NaN;
    var m = s.match(/^(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)$/);
    if (m) return +m[1] + m[2] / m[3];
    m = s.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (m) return m[2] > 0 ? m[1] / m[2] : NaN;
    var v = parseFloat(s);
    return isFinite(v) && /^\d*\.?\d+$/.test(s) ? v : NaN;
  }

  function compute() {
    var lines = [];
    ROWS.forEach(function (i) {
      var t = num('t' + i), w = num('w' + i), l = num('l' + i), q = num('q' + i);
      if (!(t > 0 && w > 0 && l > 0)) return;
      q = q > 0 ? Math.round(q) : 1;
      lines.push({ t: t, w: w, l: l, q: q, each: t * w * l / 12 });
    });
    if (!lines.length) {
      out.innerHTML = '<p class="results-empty">Enter the size and number of your boards.</p>';
      return '';
    }
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste > 0 ? waste : 0;
    var bf = lines.reduce(function (s, x) { return s + x.each * x.q; }, 0);
    var need = bf * (1 + waste / 100);
    var linear = lines.reduce(function (s, x) { return s + x.l * x.q; }, 0);

    var rows = lines.map(function (x) {
      return '<li><span>' + x.q + ' × ' + S.fmt(x.t, 3) + '″ × ' + S.fmt(x.w, 3) + '″ × ' + S.fmt(x.l, 2) + ' ft<br><small>' + S.fmt(x.each, 2) + ' bf each</small></span><strong>' + S.fmt(x.each * x.q, 2) + ' bf</strong></li>';
    }).join('');
    rows += '<li><span>Total length of boards</span><strong>' + S.fmt(linear, 1) + ' linear ft</strong></li>';
    if (waste) rows += '<li><span>With ' + S.fmt(waste, 0) + '% extra</span><strong>' + S.fmt(need, 2) + ' bf</strong></li>';
    var price = S.val(form, 'price');
    if (isFinite(price) && price > 0) {
      rows += '<li><span>Estimated cost<br><small>' + S.fmt(need, 2) + ' bf × ' + S.money(price) + '</small></span><strong>' + S.money(need * price) + '</strong></li>';
    }

    out.innerHTML =
      '<div class="result-main"><div class="k">Total</div><div class="v">' + S.fmt(need, 2) + '<small>board feet</small></div>' +
      '<div class="sub">' + S.fmt(need / 12, 2) + ' cu ft · ' + S.fmt(need * 0.002359737, 3) + ' m³' + (waste ? ' · includes ' + S.fmt(waste, 0) + '% extra' : '') + '</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      '<p class="note">Lumberyards usually count softwood lumber by its nominal size (a 2×4 as 2 × 4 in); hardwood dealers use rough thickness in quarters.</p>';

    return 'Lumber: ' + S.fmt(need, 2) + ' board feet\n' + lines.map(function (x) {
      return '- ' + x.q + ' × ' + S.fmt(x.t, 3) + 'in × ' + S.fmt(x.w, 3) + 'in × ' + S.fmt(x.l, 2) + 'ft = ' + S.fmt(x.each * x.q, 2) + ' bf';
    }).join('\n') + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
