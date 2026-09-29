/* Paver calculator: number of pavers plus gravel base and bedding sand for a patio or walkway. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('paver-form');
  if (!form) return;
  var out = document.getElementById('paver-results');
  var sizeSel = form.querySelector('[data-k="size"]');
  var custom = form.querySelector('.js-custom-size');

  var BASE_T_PER_YD3 = 1.5;  // road base / crusher run, loose
  var SAND_T_PER_YD3 = 1.35; // dry concrete sand

  function paverSize() {
    if (sizeSel.value === 'custom') return [S.val(form, 'pl'), S.val(form, 'pw')];
    return sizeSel.value.split('x').map(Number);
  }

  function compute() {
    custom.hidden = sizeSel.value !== 'custom';
    var area = S.area(form);
    var size = paverSize();
    var joint = S.val(form, 'joint');
    joint = isFinite(joint) && joint > 0 ? joint : 0;
    if (!isFinite(area) || area <= 0 || !(size[0] > 0 && size[1] > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the size of the area and the paver size.</p>';
      return '';
    }
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var perSqFt = 144 / ((size[0] + joint) * (size[1] + joint));
    var pavers = Math.ceil(area * perSqFt * (1 + waste / 100) - 1e-9);

    var baseIn = S.len(form, 'base') * 12;
    var sandIn = S.len(form, 'sand') * 12;
    var baseYd = area * (baseIn / 12) * 1.10 / S.FT3_PER_YD3; // +10% for compaction
    var sandFt3 = area * (sandIn / 12) * 1.10;
    var sandYd = sandFt3 / S.FT3_PER_YD3;
    var edge = S.perimeter(form);

    var rows = '<li><span>Area</span><strong>' + S.fmt(area, 1) + ' sq ft</strong></li>' +
      '<li><span>Pavers per sq ft</span><strong>' + S.fmt(perSqFt, 2) + '</strong></li>' +
      '<li><span>Base gravel, ' + S.fmt(baseIn, 1) + ' in (+10%)</span><strong>' + S.fmt(baseYd, 2) + ' yd³ · ' + S.fmt(baseYd * BASE_T_PER_YD3, 2) + ' tons</strong></li>' +
      '<li><span>Bedding sand, ' + S.fmt(sandIn, 2) + ' in (+10%)</span><strong>' + S.fmt(sandYd, 2) + ' yd³ · ' + Math.ceil(sandFt3 / 0.5 - 1e-9) + ' × 50 lb bags</strong></li>';
    if (isFinite(edge)) rows += '<li><span>Edge restraint (perimeter)</span><strong>' + S.fmt(edge, 1) + ' ft</strong></li>';

    var price = S.val(form, 'price');
    if (isFinite(price) && price > 0) {
      var mode = S.unit(form, 'price');
      var cost = mode === 'sqft' ? price * area * (1 + waste / 100) : price * pavers;
      rows += '<li><span>Pavers cost</span><strong>' + S.money(cost) + '</strong></li>';
    }

    var tip = baseIn < 4
      ? '<p class="note warn">A compacted base of at least 4 inches is the usual minimum for patios and walkways; driveways need more.</p>'
      : (baseIn >= 8 ? '<p class="note">8 inches or more of base suits driveways and soft or clay soils. Compact it in 2–4 inch lifts.</p>'
        : '<p class="note">4–6 inches of compacted base is typical for patios and walkways on well-drained soil.</p>');

    out.innerHTML =
      '<div class="result-main"><div class="k">Pavers needed</div><div class="v">' + S.fmt(pavers, 0) + '<small>pavers</small></div>' +
      '<div class="sub">' + S.fmt(size[0], 2) + ' × ' + S.fmt(size[1], 2) + ' in · includes ' + S.fmt(waste, 0) + '% extra for cuts and breakage</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + tip;

    return 'Pavers: ' + pavers + ' (' + size[0] + ' x ' + size[1] + ' in) incl. ' + waste + '% extra\n' +
      '- Base gravel: ' + S.fmt(baseYd, 2) + ' yd3 (~' + S.fmt(baseYd * BASE_T_PER_YD3, 2) + ' tons)\n' +
      '- Bedding sand: ' + S.fmt(sandYd, 2) + ' yd3 (' + Math.ceil(sandFt3 / 0.5 - 1e-9) + ' x 50 lb bags)\n' +
      (isFinite(edge) ? '- Edge restraint: ' + S.fmt(edge, 1) + ' ft\n' : '') + location.href;
  }

  S.calculator(form, compute);
})();
