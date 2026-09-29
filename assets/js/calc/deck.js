/* Deck calculator: decking boards, joists and fasteners for a rectangular deck. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('deck-form');
  if (!form) return;
  var out = document.getElementById('deck-results');
  var typeSel = form.querySelector('[data-k="type"]');

  // Board width (actual, inches) and the maximum joist spacing for boards laid
  // perpendicular to the joists (IRC Table R507.7; composites follow the manufacturer).
  var TYPES = {
    wood54: { w: 5.5, max: 16, name: '5/4×6 wood' },
    wood26: { w: 5.5, max: 24, name: '2×6 wood' },
    wood24: { w: 3.5, max: 24, name: '2×4 wood' },
    composite: { w: 5.5, max: 16, name: 'composite or PVC' },
    custom: { w: NaN, max: NaN, name: 'custom board' }
  };

  function compute() {
    var t = TYPES[typeSel.value] || TYPES.wood54;
    form.querySelector('.js-custom-board').hidden = typeSel.value !== 'custom';
    var bw = typeSel.value === 'custom' ? S.val(form, 'bw') : t.w;
    var L = S.len(form, 'dl'), W = S.len(form, 'dw');
    var gap = S.val(form, 'gap');
    gap = isFinite(gap) && gap >= 0 ? gap : 0;
    var blen = S.val(form, 'blen'), js = S.val(form, 'js');
    if (!(L > 0 && W > 0 && bw > 0 && blen > 0 && js > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the deck size and board details.</p>';
      return '';
    }
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var rows = Math.ceil(W * 12 / (bw + gap) - 1e-9);
    var perRow = Math.ceil(L / blen - 1e-9);
    var boards = Math.ceil(rows * perRow * (1 + waste / 100) - 1e-9);
    var joists = Math.ceil(L * 12 / js - 1e-9) + 1;
    var screws = rows * joists * 2;
    var clips = rows * joists;

    var rowsHtml = '<li><span>Deck area</span><strong>' + S.fmt(L * W, 1) + ' sq ft</strong></li>' +
      '<li><span>Rows of boards</span><strong>' + rows + '</strong></li>' +
      '<li><span>Boards per row (' + S.fmt(blen, 0) + ' ft)</span><strong>' + perRow + '</strong></li>' +
      '<li><span>Linear feet of decking</span><strong>' + S.fmt(rows * L, 0) + ' ft</strong></li>' +
      '<li><span>Joists at ' + S.fmt(js, 0) + ' in on center</span><strong>' + joists + ' × ' + S.fmt(W, 1) + ' ft span direction</strong></li>' +
      '<li><span>Face screws (2 per joist)</span><strong>' + S.fmt(screws, 0) + '</strong></li>' +
      '<li><span>or hidden fastener clips</span><strong>≈ ' + S.fmt(clips, 0) + '</strong></li>';

    var price = S.val(form, 'price');
    if (isFinite(price) && price > 0) rowsHtml += '<li><span>Decking cost</span><strong>' + S.money(price * boards) + '</strong></li>';

    var note;
    if (isFinite(t.max) && js > t.max) note = '<p class="note warn">' + S.esc(t.name) + ' decking usually needs joists no more than ' + t.max + ' in apart when laid square to the joists (less for diagonal layouts). Check the product’s installation guide.</p>';
    else if (perRow > 1) note = '<p class="note">Butt joints must land on a joist — stagger them from row to row, and consider longer boards to avoid joints altogether.</p>';
    else note = '<p class="note">Joist size and span depend on the lumber species, grade and load — follow your local code or the American Wood Council’s DCA 6 guide.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Decking boards</div><div class="v">' + S.fmt(boards, 0) + '<small>boards</small></div>' +
      '<div class="sub">' + S.fmt(blen, 0) + ' ft ' + S.esc(t.name) + ' · ' + S.fmt(bw, 2) + ' in wide · includes ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rowsHtml + '</ul>' + note;

    return 'Deck ' + S.fmt(L, 1) + ' x ' + S.fmt(W, 1) + ' ft\n- Decking: ' + boards + ' x ' + blen + ' ft boards (' + S.fmt(rows * L, 0) + ' linear ft)\n- Joists: ' + joists +
      ' at ' + js + ' in o.c.\n- Screws: ' + screws + ' (or ~' + clips + ' hidden clips)\n' + location.href;
  }

  S.calculator(form, compute);
})();
