/* Concrete calculator: volume, premix bags and ready-mix for slabs, columns, round slabs and steps. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('concrete-form');
  if (!form) return;
  var out = document.getElementById('concrete-results');

  // QUIKRETE Concrete Mix (No. 1101) data sheet yields, in cubic feet per bag.
  var BAGS = [
    { lb: 40, yield: 0.30 },
    { lb: 50, yield: 0.375 },
    { lb: 60, yield: 0.45 },
    { lb: 80, yield: 0.60 }
  ];
  var DENSITY_LB_FT3 = 140; // same data sheet, hardened concrete

  function volumeFt3() {
    var shape = form.dataset.shape;
    var v;
    if (shape === 'slab') v = S.len(form, 'L') * S.len(form, 'W') * S.len(form, 'T');
    else if (shape === 'column') { var r = S.len(form, 'cd') / 2; v = Math.PI * r * r * S.len(form, 'ch'); }
    else if (shape === 'round') { var rr = S.len(form, 'rd') / 2; v = Math.PI * rr * rr * S.len(form, 'rt'); }
    else if (shape === 'steps') {
      var n = Math.round(S.val(form, 'sn'));
      // Solid steps poured to grade: step i is i risers tall.
      v = S.len(form, 'sw') * S.len(form, 'sr') * S.len(form, 'sd') * n * (n + 1) / 2;
    }
    var q = S.val(form, 'qty');
    return v * (isFinite(q) && q > 0 ? q : 1);
  }

  function compute() {
    var base = volumeFt3();
    if (!isFinite(base) || base <= 0) {
      out.innerHTML = '<p class="results-empty">Enter your dimensions to see how much concrete you need.</p>';
      return '';
    }
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var ft3 = base * (1 + waste / 100);
    var yd3 = ft3 / S.FT3_PER_YD3;
    var m3 = ft3 * S.M3_PER_FT3;

    var bagPrice = S.val(form, 'bagprice');
    var bagSize = parseInt(S.unit(form, 'bagprice') || '80', 10);
    var rows = BAGS.map(function (b) {
      var n = Math.ceil(ft3 / b.yield - 1e-9);
      return { lb: b.lb, n: n, weight: n * b.lb };
    });
    var table = '<table class="bag-table"><thead><tr><th>Bag size</th><th>Bags</th><th>Total weight</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr' + (r.lb === bagSize ? ' class="best"' : '') + '><td>' + r.lb + ' lb</td><td>' + S.fmt(r.n, 0) + '</td><td>' + S.fmt(r.weight, 0) + ' lb</td></tr>';
      }).join('') + '</tbody></table>';

    var costRows = '';
    var chosen = rows.filter(function (r) { return r.lb === bagSize; })[0];
    if (isFinite(bagPrice) && bagPrice > 0) costRows += '<li><span>' + S.fmt(chosen.n, 0) + ' × ' + bagSize + ' lb bags</span><strong>' + S.money(chosen.n * bagPrice) + '</strong></li>';
    var rmPrice = S.val(form, 'rmprice');
    var orderYd = Math.ceil(yd3 * 4 - 1e-9) / 4; // most plants sell in quarter-yard steps
    if (isFinite(rmPrice) && rmPrice > 0) {
      var fee = S.val(form, 'rmfee');
      fee = isFinite(fee) && fee > 0 ? fee : 0;
      costRows += '<li><span>Ready-mix, ' + S.fmt(orderYd, 2) + ' yd³' + (fee ? ' + fees' : '') + '</span><strong>' + S.money(orderYd * rmPrice + fee) + '</strong></li>';
    }

    var advice;
    var n80 = rows[3].n;
    if (yd3 < 1) advice = '<p class="note">About ' + S.fmt(n80, 0) + ' bags of 80 lb mix — a manageable job to mix by hand or with a rented mixer.</p>';
    else if (yd3 <= 3) advice = '<p class="note warn">That’s ' + S.fmt(n80, 0) + ' bags of 80 lb mix (' + S.fmt(n80 * 80 / 2000, 1) + ' tons to lift and mix). Compare the price of a ready-mix short load before you start.</p>';
    else advice = '<p class="note warn">At ' + S.fmt(yd3, 1) + ' cubic yards, ready-mix delivery is usually faster and cheaper than ' + S.fmt(n80, 0) + ' bags. Ask local plants for their minimum order and short-load fee.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Concrete needed</div><div class="v">' + S.fmt(yd3, 2) + '<small>cu yd</small></div>' +
      '<div class="sub">' + S.fmt(ft3, 2) + ' cu ft · ' + S.fmt(m3, 2) + ' m³ · includes ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' +
      '<li><span>Volume without extra</span><strong>' + S.fmt(base / S.FT3_PER_YD3, 2) + ' yd³ (' + S.fmt(base, 2) + ' ft³)</strong></li>' +
      '<li><span>Ready-mix order (¼ yd steps)</span><strong>' + S.fmt(orderYd, 2) + ' yd³</strong></li>' +
      '<li><span>Approx. weight in place</span><strong>' + S.fmt(ft3 * DENSITY_LB_FT3 / 2000, 2) + ' tons</strong></li>' +
      costRows + '</ul>' +
      '<h3 class="h-sm">Premixed bags</h3>' + table + advice;

    return 'Concrete: ' + S.fmt(yd3, 2) + ' cu yd (' + S.fmt(ft3, 2) + ' cu ft, ' + S.fmt(m3, 2) + ' m3) incl. ' + S.fmt(waste, 0) + '% extra\n' +
      rows.map(function (r) { return '- ' + r.n + ' x ' + r.lb + ' lb bags'; }).join('\n') +
      '\nor ' + S.fmt(orderYd, 2) + ' yd3 of ready-mix\n' + location.href;
  }

  S.calculator(form, compute);
})();
