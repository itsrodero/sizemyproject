/* Insulation calculator: target R-value by climate zone, depth needed and bags for attic insulation. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('ins-form');
  if (!form) return;
  var out = document.getElementById('ins-results');

  // ENERGY STAR attic recommendations (retrofit): [uninsulated, with 3–4 in existing].
  var ZONES = { '1': [30, 25], '2': [49, 38], '3': [49, 38], '4': [60, 49], '5': [60, 49], '6': [60, 49], '7': [60, 49], '8': [60, 49] };
  // R-value per inch — mid-points of the ranges published by the U.S. Department of Energy.
  var MATERIALS = {
    fiberglass: { r: 2.5, name: 'Blown-in fiberglass', range: '2.2–2.7' },
    cellulose: { r: 3.5, name: 'Blown-in cellulose', range: '3.2–3.8' },
    batts: { r: 3.3, name: 'Fiberglass batts', range: '2.9–3.8' }
  };

  function compute() {
    var area = S.area(form);
    if (!isFinite(area) || area <= 0) {
      out.innerHTML = '<p class="results-empty">Enter the attic floor area.</p>';
      return '';
    }
    var zone = form.querySelector('[data-k="zone"]').value;
    var existing = form.querySelector('[data-k="existing"]').value;
    var custom = S.val(form, 'target');
    var target = custom > 0 ? custom : ZONES[zone][existing === 'some' ? 1 : 0];
    var have = existing === 'some' ? 0 : Math.max(0, S.val(form, 'have') || 0);
    var mat = MATERIALS[form.querySelector('[data-k="mat"]').value] || MATERIALS.fiberglass;
    form.querySelector('.js-have').hidden = existing === 'some';
    var add = Math.max(0, target - have);
    var depth = add / mat.r;
    var ft3 = area * depth / 12;
    var bagCov = S.val(form, 'bag');
    var bags = bagCov > 0 ? Math.ceil(area / bagCov - 1e-9) : NaN;

    var some = existing === 'some' && !(custom > 0);
    var rows = '<li><span>' + (some ? 'Recommended to add' : 'Recommended total') + '</span><strong>R-' + S.fmt(target, 0) + (custom > 0 ? ' (your target)' : ' (ENERGY STAR, zone ' + zone + ')') + '</strong></li>' +
      (existing === 'some' ? '<li><span>Existing 3–4 in</span><strong>already counted</strong></li>' : '<li><span>Existing insulation</span><strong>R-' + S.fmt(have, 0) + '</strong></li>') +
      '<li><span>R-value to add</span><strong>R-' + S.fmt(add, 0) + '</strong></li>' +
      '<li><span>' + S.esc(mat.name) + ' at R-' + mat.r + '/in</span><strong>' + S.fmt(depth, 1) + ' in deep</strong></li>' +
      '<li><span>Volume</span><strong>' + S.fmt(ft3, 0) + ' ft³ (' + S.fmt(ft3 / 27, 1) + ' yd³)</strong></li>' +
      (isFinite(bags) ? '<li><span>Bags (' + S.fmt(bagCov, 0) + ' sq ft per bag at this R)</span><strong>' + bags + '</strong></li>' : '');

    out.innerHTML =
      '<div class="result-main"><div class="k">' + (some ? 'Add R-' + S.fmt(add, 0) + ' on top' : 'Add to reach R-' + S.fmt(target, 0)) + '</div><div class="v">' + S.fmt(depth, 1) + '<small>inches</small></div>' +
      '<div class="sub">R-' + S.fmt(add, 0) + ' of ' + S.esc(mat.name.toLowerCase()) + ' over ' + S.fmt(area, 0) + ' sq ft</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      '<p class="note">Bag coverage depends on the product and the R-value — use the coverage chart printed on the bag for your target R. Seal air leaks and keep soffit vents clear before adding insulation.</p>';

    return 'Attic insulation: add R-' + S.fmt(add, 0) + ' (' + S.fmt(depth, 1) + ' in of ' + mat.name.toLowerCase() + ') over ' + S.fmt(area, 0) + ' sq ft' +
      (isFinite(bags) ? '\n- ' + bags + ' bags' : '') + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
