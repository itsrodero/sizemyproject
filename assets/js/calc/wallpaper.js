/* Wallpaper calculator: rolls needed using the strip method, with pattern repeat and trimming allowance. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('wp-form');
  if (!form) return;
  var out = document.getElementById('wp-results');
  var rollSel = form.querySelector('[data-k="roll"]');
  var TRIM = 4; // inches of trimming allowance per strip (top and bottom)

  function compute() {
    form.querySelector('.js-custom-roll').hidden = rollSel.value !== 'custom';
    var mode = form.querySelector('[data-k="mode"]').value;
    form.querySelector('.js-room').hidden = mode !== 'room';
    form.querySelector('.js-wall').hidden = mode !== 'wall';
    var wallWidth = mode === 'room' ? 2 * (S.len(form, 'rl') + S.len(form, 'rw')) : S.len(form, 'ww');
    var H = S.len(form, 'h') * 12;
    var roll = rollSel.value === 'custom' ? [S.val(form, 'cw'), S.val(form, 'cl')] : rollSel.value.split('x').map(Number); // [width in, length ft]
    var repeat = Math.max(0, S.val(form, 'rep') || 0);
    if (!(wallWidth > 0 && H > 0 && roll[0] > 0 && roll[1] > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the wall size and the roll size.</p>';
      return '';
    }
    var openings = Math.max(0, S.len(form, 'open') || 0) * 12;   // total width of full-height openings, inches
    var widthIn = Math.max(0, wallWidth * 12 - openings);
    var strips = Math.ceil(widthIn / roll[0] - 1e-9);
    var stripLen = H + repeat + TRIM;
    var perRoll = Math.floor(roll[1] * 12 / stripLen + 1e-9);
    if (perRoll < 1) {
      out.innerHTML = '<p class="note warn">One strip is longer than a whole roll. Check the wall height and roll length.</p>';
      return '';
    }
    var extra = Math.max(0, S.val(form, 'extra') || 0);
    var rolls = Math.ceil(strips / perRoll * (1 + extra / 100) - 1e-9);
    var wallArea = widthIn / 12 * H / 12;

    var rows = '<li><span>Wall width to cover</span><strong>' + S.fmt(widthIn / 12, 1) + ' ft</strong></li>' +
      '<li><span>Strips needed (' + S.fmt(roll[0], 1) + ' in wide)</span><strong>' + strips + '</strong></li>' +
      '<li><span>Strip length (height + repeat + 4 in)</span><strong>' + S.fmt(stripLen, 1) + ' in</strong></li>' +
      '<li><span>Strips per roll (' + S.fmt(roll[1], 1) + ' ft)</span><strong>' + perRoll + '</strong></li>' +
      '<li><span>Wall area</span><strong>' + S.fmt(wallArea, 0) + ' sq ft</strong></li>';
    var price = S.val(form, 'price');
    if (price > 0) rows += '<li><span>Wallpaper cost</span><strong>' + S.money(price * rolls) + '</strong></li>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Wallpaper rolls</div><div class="v">' + rolls + '<small>rolls</small></div>' +
      '<div class="sub">' + strips + ' strips · ' + perRoll + ' per roll' + (extra ? ' · includes ' + S.fmt(extra, 0) + '% extra' : '') + '</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      '<p class="note">Buy every roll from the same batch (dye lot) — shades can differ between batches — and keep the labels until the job is done.</p>';

    return 'Wallpaper: ' + rolls + ' rolls (' + strips + ' strips, ' + perRoll + ' per roll)\n' + location.href;
  }

  S.calculator(form, compute);
})();
