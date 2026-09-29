/* Roofing calculator: roof area from footprint and pitch, squares, shingle bundles, underlayment, ridge cap and drip edge. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('roof-form');
  if (!form) return;
  var out = document.getElementById('roof-results');

  function compute() {
    var L = S.len(form, 'rl'), W = S.len(form, 'rw');   // footprint including overhangs
    var pitch = S.val(form, 'pitch');                    // rise per 12 in of run
    if (!(L > 0 && W > 0 && pitch >= 0)) {
      out.innerHTML = '<p class="results-empty">Enter the roof footprint and pitch.</p>';
      return '';
    }
    var style = form.querySelector('[data-k="style"]').value;
    var factor = Math.sqrt(1 + Math.pow(pitch / 12, 2));
    var area = L * W * factor;
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var squares = area / 100;
    var perSq = S.val(form, 'bps') || 3;
    var bundles = Math.ceil(squares * (1 + waste / 100) * perSq - 1e-9);

    var ridge, eaves, rakes, hips = 0;
    if (style === 'hip') {
      var ridgeLen = Math.max(0, L - W);
      var hipLen = Math.sqrt(2 * Math.pow(W / 2, 2) + Math.pow(W / 2 * pitch / 12, 2));
      hips = 4 * hipLen;
      ridge = ridgeLen + hips;
      eaves = 2 * (L + W);
      rakes = 0;
    } else {
      ridge = L;
      eaves = 2 * L;
      rakes = 4 * (W / 2) * factor;   // two gable ends, two sloped edges each
    }
    var lfPerBundle = S.val(form, 'ridge') || 25;
    var ridgeBundles = Math.ceil(ridge / lfPerBundle - 1e-9);
    var roll = S.val(form, 'roll');
    var rolls = roll > 0 ? Math.ceil(area * 1.10 / roll - 1e-9) : NaN;   // +10% for laps
    var drip = eaves + rakes;

    var rows = '<li><span>Pitch factor (' + S.fmt(pitch, 1) + '/12)</span><strong>× ' + S.fmt(factor, 3) + '</strong></li>' +
      '<li><span>Roof surface area</span><strong>' + S.fmt(area, 0) + ' sq ft = ' + S.fmt(squares, 2) + ' squares</strong></li>' +
      '<li><span>Starter strip (eaves)</span><strong>' + S.fmt(eaves, 0) + ' ft</strong></li>' +
      '<li><span>Ridge' + (style === 'hip' ? ' + hips' : '') + ' cap</span><strong>' + S.fmt(ridge, 0) + ' ft · ' + ridgeBundles + ' bundles</strong></li>' +
      (isFinite(rolls) ? '<li><span>Underlayment rolls (' + S.fmt(roll, 0) + ' sq ft, +10% laps)</span><strong>' + rolls + '</strong></li>' : '') +
      '<li><span>Drip edge (10 ft pieces)</span><strong>' + S.fmt(drip, 0) + ' ft · ' + Math.ceil(drip / 10 - 1e-9) + ' pieces</strong></li>';
    var price = S.val(form, 'price');
    if (price > 0) rows += '<li><span>Shingles cost</span><strong>' + S.money(price * bundles) + '</strong></li>';

    var note = pitch < 2
      ? '<p class="note warn">Asphalt shingles aren’t used on roofs flatter than 2/12; low slopes need a membrane roof. Check the manufacturer’s minimum slope.</p>'
      : pitch < 4 ? '<p class="note warn">Between 2/12 and 4/12, shingle manufacturers and the building code call for double underlayment or other low-slope measures.</p>'
        : '<p class="note">Walking a roof steeper than about 7/12 needs roof jacks or a harness. Consider a pro for steep or high roofs.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Shingles</div><div class="v">' + S.fmt(bundles, 0) + '<small>bundles</small></div>' +
      '<div class="sub">' + S.fmt(squares * (1 + waste / 100), 2) + ' squares incl. ' + S.fmt(waste, 0) + '% waste · ' + S.fmt(perSq, 0) + ' bundles per square</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + note;

    return 'Roof: ' + S.fmt(area, 0) + ' sq ft (' + S.fmt(squares, 2) + ' squares)\n- Shingles: ' + bundles + ' bundles\n- Ridge cap: ' + ridgeBundles + ' bundles\n' +
      (isFinite(rolls) ? '- Underlayment: ' + rolls + ' rolls\n' : '') + '- Drip edge: ' + Math.ceil(drip / 10 - 1e-9) + ' x 10 ft\n' + location.href;
  }

  S.calculator(form, compute);
})();
