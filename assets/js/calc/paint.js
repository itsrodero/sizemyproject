/* Paint calculator: gallons of paint (and primer) for the walls and ceiling of a room. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('paint-form');
  if (!form) return;
  var out = document.getElementById('paint-results');
  var DOOR = 21, WINDOW = 15; // sq ft: a 3 × 7 ft door and a 3 × 5 ft window

  // How to buy a quantity: whole gallons plus quarts, switching to another gallon when 3+ quarts are needed.
  function buy(gal) {
    if (!(gal > 0)) return '–';
    var g = Math.floor(gal + 1e-9), q = Math.ceil((gal - g) * 4 - 1e-9);
    if (q >= 3) { g += 1; q = 0; }
    var parts = [];
    var buckets = Math.floor(g / 5);
    if (buckets) { parts.push(buckets + ' × 5-gal bucket'); g -= buckets * 5; }
    if (g) parts.push(g + ' gal');
    if (q) parts.push(q + ' qt');
    return parts.join(' + ');
  }

  function compute() {
    var L = S.len(form, 'rl'), W = S.len(form, 'rw'), H = S.len(form, 'rh');
    if (!(L > 0 && W > 0 && H > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the room length, width and wall height.</p>';
      return '';
    }
    var doors = Math.max(0, S.val(form, 'doors') || 0), windows = Math.max(0, S.val(form, 'windows') || 0);
    var coats = Math.max(1, Math.round(S.val(form, 'coats')) || 1);
    var cov = S.val(form, 'cov');
    cov = cov > 0 ? cov : 350;
    var ceiling = form.querySelector('[data-k="ceil"]').value === 'yes';
    var primer = form.querySelector('[data-k="primer"]').value === 'yes';

    var walls = Math.max(0, 2 * (L + W) * H - doors * DOOR - windows * WINDOW);
    var ceil = L * W;
    var wallGal = walls * coats / cov;
    var ceilGal = ceiling ? ceil * coats / cov : 0;
    var primerGal = primer ? (walls + (ceiling ? ceil : 0)) / cov : 0;

    var rows = '<li><span>Wall area (less doors and windows)</span><strong>' + S.fmt(walls, 0) + ' sq ft</strong></li>' +
      '<li><span>Wall paint, ' + coats + ' coat' + (coats > 1 ? 's' : '') + '</span><strong>' + S.fmt(wallGal, 2) + ' gal → ' + buy(wallGal) + '</strong></li>';
    if (ceiling) rows += '<li><span>Ceiling (' + S.fmt(ceil, 0) + ' sq ft), ' + coats + ' coat' + (coats > 1 ? 's' : '') + '</span><strong>' + S.fmt(ceilGal, 2) + ' gal → ' + buy(ceilGal) + '</strong></li>';
    if (primer) rows += '<li><span>Primer, 1 coat</span><strong>' + S.fmt(primerGal, 2) + ' gal → ' + buy(primerGal) + '</strong></li>';
    var price = S.val(form, 'price');
    if (price > 0) rows += '<li><span>Paint cost (whole gallons)</span><strong>' + S.money(Math.ceil(wallGal + ceilGal - 1e-9) * price) + '</strong></li>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Wall paint</div><div class="v">' + S.fmt(wallGal, 2) + '<small>gallons</small></div>' +
      '<div class="sub">Buy ' + buy(wallGal) + ' · ' + S.fmt(cov, 0) + ' sq ft per gallon per coat</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      '<p class="note">Coverage varies by product, color and surface — check the label. Dark colors, bare drywall and textured walls often need an extra coat or primer.</p>';

    return 'Paint for ' + S.fmt(L, 1) + ' x ' + S.fmt(W, 1) + ' ft room\n- Walls: ' + S.fmt(wallGal, 2) + ' gal (' + buy(wallGal) + ')\n' +
      (ceiling ? '- Ceiling: ' + S.fmt(ceilGal, 2) + ' gal (' + buy(ceilGal) + ')\n' : '') + (primer ? '- Primer: ' + S.fmt(primerGal, 2) + ' gal\n' : '') + location.href;
  }

  S.calculator(form, compute);
})();
