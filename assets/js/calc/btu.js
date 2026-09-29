/* BTU / air conditioner size calculator, based on the ENERGY STAR room air conditioner sizing chart. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('btu-form');
  if (!form) return;
  var out = document.getElementById('btu-results');

  // [maximum area in sq ft, BTU per hour] — ENERGY STAR sizing chart for 8 ft ceilings.
  var CHART = [[150, 5000], [250, 6000], [300, 7000], [350, 8000], [400, 9000], [450, 10000], [550, 12000],
    [700, 14000], [1000, 18000], [1200, 21000], [1400, 23000], [1500, 24000], [2000, 30000], [2500, 34000]];
  var UNITS = [5000, 6000, 8000, 10000, 12000, 14000, 15000, 18000, 24000, 30000, 36000];

  function compute() {
    var area = S.area(form);
    if (!isFinite(area) || area <= 0) {
      out.innerHTML = '<p class="results-empty">Enter the size of the room.</p>';
      return '';
    }
    var row = CHART.filter(function (r) { return area <= r[0]; })[0];
    var base = row ? row[1] : NaN;
    var sun = form.querySelector('[data-k="sun"]').value;
    var people = Math.max(0, Math.round(S.val(form, 'people')) || 0);
    var kitchen = form.querySelector('[data-k="kitchen"]').value === 'yes';
    var ceil = S.len(form, 'ceil');
    var btu = base;
    var steps = ['Chart for ' + S.fmt(area, 0) + ' sq ft: ' + S.fmt(base, 0) + ' BTU/h'];
    if (sun === 'shade') { btu *= 0.9; steps.push('Heavily shaded: −10%'); }
    if (sun === 'sunny') { btu *= 1.1; steps.push('Very sunny: +10%'); }
    if (people > 2) { btu += (people - 2) * 600; steps.push((people - 2) + ' extra occupant' + (people > 3 ? 's' : '') + ': +' + S.fmt((people - 2) * 600, 0)); }
    if (kitchen) { btu += 4000; steps.push('Kitchen: +4,000'); }
    if (ceil > 8) { btu *= ceil / 8; steps.push('Ceiling ' + S.fmt(ceil, 1) + ' ft: × ' + S.fmt(ceil / 8, 2) + ' (our adjustment)'); }

    if (!isFinite(btu)) {
      out.innerHTML = '<div class="result-main"><div class="k">Cooling capacity</div><div class="v">&gt; 34,000<small>BTU/h</small></div>' +
        '<div class="sub">Over 2,500 sq ft</div></div><p class="note warn">Spaces this large — and whole houses — need a load calculation (ACCA Manual J) by an HVAC contractor rather than a room-size chart.</p>';
      return '';
    }
    var unit = UNITS.filter(function (u) { return u >= btu - 1e-9; })[0];
    out.innerHTML =
      '<div class="result-main"><div class="k">Cooling capacity</div><div class="v">' + S.fmt(Math.round(btu / 100) * 100, 0) + '<small>BTU/h</small></div>' +
      '<div class="sub">' + S.fmt(btu / 12000, 2) + ' tons' + (unit ? ' · nearest common unit: ' + S.fmt(unit, 0) + ' BTU' : '') + '</div></div>' +
      '<ul class="result-rows">' + steps.map(function (s) { return '<li><span>' + S.esc(s) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="note">For room air conditioners and single-zone mini-splits. Oversized units cycle on and off and leave the room clammy; undersized ones run constantly — pick the closest size, not the biggest.</p>' +
      (area > 1000 ? '<p class="note warn">For whole floors, open-plan homes or central air, ask for a Manual J load calculation — insulation, windows and climate matter more than square footage.</p>' : '');

    return 'Room ' + S.fmt(area, 0) + ' sq ft: about ' + S.fmt(Math.round(btu / 100) * 100, 0) + ' BTU/h' + (unit ? ' (' + S.fmt(unit, 0) + ' BTU unit)' : '') + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
