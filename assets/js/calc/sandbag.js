/* Sandbag calculator: bags for a sandbag levee or single-row wall, sand and weight. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('bag-form');
  if (!form) return;
  var out = document.getElementById('bag-results');

  var TONS_PER_YD3 = 1.35;  // dry sand

  function compute() {
    var L = S.len(form, 'L'), H = S.len(form, 'H');
    if (!(L > 0) || !(H > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the length and height of the barrier.</p>';
      return '';
    }
    var type = form.querySelector('[data-k="type"]').value;
    var perYd = S.val(form, 'perYd');
    perYd = perYd > 0 ? perYd : 60;
    // USACE levee figures (600, 2,100, 4,500, 7,800 bags per 100 ft for 1–4 ft) = 4.5h² + 1.5h bags per foot.
    var perFt = type === 'single' ? 3 * H : 4.5 * H * H + 1.5 * H;
    var bags = Math.ceil(L * perFt - 1e-9);
    var yd3 = bags / perYd;
    var tons = yd3 * TONS_PER_YD3;

    var rows = '<li><span>Bags per foot of barrier</span><strong>' + S.fmt(perFt, 1) + '</strong></li>' +
      (type === 'pyramid' ? '<li><span>Base width (about 3 × height)</span><strong>≈ ' + S.fmt(3 * H, 1) + ' ft</strong></li>' : '') +
      '<li><span>Sand (' + S.fmt(perYd, 0) + ' bags per yd³)</span><strong>' + S.fmt(yd3, 1) + ' yd³ · ≈ ' + S.fmt(tons, 1) + ' tons</strong></li>';
    var note = type === 'single' && H > 1 + 1e-9
      ? '<p class="note warn">A single row is only suitable up to about 1 foot. For a taller barrier, choose the levee (pyramid) type.</p>'
      : '<p class="note">Fill bags half to two-thirds full, overlap each bag halfway over the one below and stagger the joints.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Sandbags needed</div><div class="v">' + S.fmt(bags, 0) + '<small>bags</small></div>' +
      '<div class="sub">' + S.fmt(L, 1) + ' ft long × ' + S.fmt(H, 2) + ' ft high · ' + (type === 'single' ? 'single row' : 'levee') + '</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + note;

    return 'Sandbags: ' + S.fmt(bags, 0) + ' bags for ' + S.fmt(L, 1) + ' ft × ' + S.fmt(H, 2) + ' ft (' + (type === 'single' ? 'single row' : 'levee') + ')\n' +
      '- sand: ' + S.fmt(yd3, 1) + ' cu yd (~' + S.fmt(tons, 1) + ' tons)\n' + location.href;
  }

  S.calculator(form, compute);
})();
