/* Drywall calculator: sheets, screws, joint tape and compound for a room's walls and ceiling. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('drywall-form');
  if (!form) return;
  var out = document.getElementById('drywall-results');

  function compute() {
    var L = S.len(form, 'rl'), W = S.len(form, 'rw'), H = S.len(form, 'rh');
    if (!(L > 0 && W > 0 && H > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the room length, width and wall height.</p>';
      return '';
    }
    var ceiling = form.querySelector('[data-k="ceil"]').value === 'yes';
    var sheet = S.val(form, 'sheet') || 32;
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var openings = Math.max(0, S.val(form, 'openings') || 0);

    var walls = Math.max(0, 2 * (L + W) * H - openings);
    var ceil = ceiling ? L * W : 0;
    var board = walls + ceil;
    var sheets = Math.ceil(board * (1 + waste / 100) / sheet - 1e-9);
    // Estimating rules of thumb: about 1 screw per sq ft of board (32 per 4×8 sheet),
    // and about 370 ft of joint tape per 1,000 sq ft (USG).
    var screws = Math.ceil(sheets * sheet - 1e-9);
    var tape = board * 0.37;

    var rows = '<li><span>Wall area' + (openings ? ' (less openings)' : '') + '</span><strong>' + S.fmt(walls, 0) + ' sq ft</strong></li>' +
      (ceiling ? '<li><span>Ceiling area</span><strong>' + S.fmt(ceil, 0) + ' sq ft</strong></li>' : '') +
      '<li><span>Drywall screws (about 1 per sq ft)</span><strong>' + S.fmt(screws, 0) + '</strong></li>' +
      '<li><span>Joint tape (~370 ft per 1,000 sq ft)</span><strong>' + S.fmt(Math.ceil(tape), 0) + ' ft</strong></li>' +
      '<li><span>Ready-mix joint compound</span><strong>about ' + S.fmt(board / 1000 * 2, 1) + ' × 4.5-gal pails</strong></li>';
    var price = S.val(form, 'price');
    if (price > 0) rows += '<li><span>Sheets cost</span><strong>' + S.money(price * sheets) + '</strong></li>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Drywall sheets</div><div class="v">' + S.fmt(sheets, 0) + '<small>sheets</small></div>' +
      '<div class="sub">' + S.fmt(sheet, 0) + ' sq ft sheets · ' + S.fmt(board, 0) + ' sq ft of board · includes ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      '<p class="note">Compound use depends heavily on the product and finish level — check the coverage on the pail. Lightweight compounds cover more area per pail.</p>';

    return 'Drywall: ' + sheets + ' sheets (' + sheet + ' sq ft)\n- Screws: ~' + screws + '\n- Tape: ~' + Math.ceil(tape) + ' ft\n' + location.href;
  }

  S.calculator(form, compute);
})();
