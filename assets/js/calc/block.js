/* Block & brick calculator: concrete blocks or bricks for a wall, plus bags of mortar mix. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('block-form');
  if (!form) return;
  var out = document.getElementById('block-results');
  var unitSel = form.querySelector('[data-k="unit"]');

  // Face size including a 3/8 in mortar joint, and units laid per 80 lb bag of QUIKRETE Mortar Mix (data sheet table).
  var UNITS = {
    cmu8: { face: [16, 8], perBag: 12, name: 'concrete blocks (8 × 16 in face)' },
    cmu4: { face: [16, 4], perBag: NaN, name: 'half-high blocks (4 × 16 in face)' },
    brick: { face: [8, 2.6667], perBag: 37, name: 'modular bricks' },
    custom: { face: [NaN, NaN], perBag: NaN, name: 'units' }
  };

  function compute() {
    var u = UNITS[unitSel.value] || UNITS.cmu8;
    form.querySelector('.js-custom-unit').hidden = unitSel.value !== 'custom';
    var face = unitSel.value === 'custom' ? [S.val(form, 'ul'), S.val(form, 'uh')] : u.face;
    var L = S.len(form, 'wl'), H = S.len(form, 'wh');
    if (!(L > 0 && H > 0 && face[0] > 0 && face[1] > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the wall size and the unit size.</p>';
      return '';
    }
    var openings = Math.max(0, S.val(form, 'open') || 0);
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var area = Math.max(0, L * H - openings);
    var perSqFt = 144 / (face[0] * face[1]);
    var units = Math.ceil(area * perSqFt * (1 + waste / 100) - 1e-9);
    var bags = u.perBag > 0 ? Math.ceil(units / u.perBag - 1e-9) : NaN;

    var rows = '<li><span>Wall area</span><strong>' + S.fmt(area, 1) + ' sq ft</strong></li>' +
      '<li><span>Per square foot</span><strong>' + S.fmt(perSqFt, 3) + '</strong></li>' +
      '<li><span>Courses (rows)</span><strong>' + Math.ceil(H * 12 / face[1] - 1e-9) + '</strong></li>' +
      (isFinite(bags) ? '<li><span>Mortar mix, 80 lb bags</span><strong>' + bags + ' (≈' + u.perBag + ' per bag)</strong></li>' : '');
    var price = S.val(form, 'price');
    if (price > 0) rows += '<li><span>Cost</span><strong>' + S.money(price * units) + '</strong></li>';

    out.innerHTML =
      '<div class="result-main"><div class="k">You need</div><div class="v">' + S.fmt(units, 0) + '<small>' + (unitSel.value === 'brick' ? 'bricks' : unitSel.value === 'custom' ? 'units' : 'blocks') + '</small></div>' +
      '<div class="sub">' + S.esc(u.name) + ' · includes ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      (unitSel.value === 'cmu8' || unitSel.value === 'cmu4'
        ? '<p class="note">Structural block walls need footings, reinforcement and grout as specified by your plans and local code; the calculator counts units and mortar only.</p>'
        : '<p class="note">Mortar use varies with joint size and how neatly it’s placed — the bag counts are a planning figure.</p>');

    return 'Wall ' + S.fmt(area, 1) + ' sq ft: ' + units + ' ' + u.name + (isFinite(bags) ? '\n- Mortar: ' + bags + ' x 80 lb bags' : '') + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
