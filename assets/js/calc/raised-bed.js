/* Raised bed soil calculator: bed size × soil depth × number of beds → cubic feet, yards, bags and mix breakdown. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('bed-form');
  if (!form) return;
  var out = document.getElementById('bed-results');

  var MIXES = {
    '60-40': [['Topsoil', 0.6], ['Compost', 0.4]],
    '50-50': [['Topsoil', 0.5], ['Compost', 0.5]],
    'mels': [['Compost', 1 / 3], ['Peat moss or coco coir', 1 / 3], ['Coarse vermiculite', 1 / 3]],
    'bagged': [['Raised-bed or garden soil', 1]]
  };
  var BAGS = [1, 1.5, 2];

  function compute() {
    var area = S.area(form);
    var depth = S.len(form, 'depth');
    var fill = S.len(form, 'fill');
    fill = isFinite(fill) && fill > 0 ? fill : 0;
    var n = Math.floor(S.val(form, 'n'));
    if (!isFinite(n) || n < 1) n = 1;
    if (!isFinite(area) || area <= 0 || !isFinite(depth) || depth <= 0) {
      out.innerHTML = '<p class="results-empty">Enter the size of your beds and the soil depth.</p>';
      return '';
    }
    var soilDepth = depth - fill;
    if (soilDepth <= 0) {
      out.innerHTML = '<p class="results-empty">The filler is as deep as the bed — reduce it to leave room for soil.</p>';
      return '';
    }
    var extra = S.val(form, 'extra');
    extra = isFinite(extra) && extra >= 0 ? extra : 0;
    var perBed = area * soilDepth;
    var base = perBed * n;
    var ft3 = base * (1 + extra / 100);
    var yd3 = ft3 / S.FT3_PER_YD3;
    var m3 = ft3 * S.M3_PER_FT3;

    var rows = '<li><span>Area of each bed</span><strong>' + S.fmt(area, 1) + ' sq ft</strong></li>' +
      '<li><span>Soil depth' + (fill > 0 ? ' above the filler' : '') + '</span><strong>' + S.fmt(soilDepth * 12, 1) + ' in</strong></li>' +
      '<li><span>Soil per bed, without extra</span><strong>' + S.fmt(perBed, 1) + ' cu ft</strong></li>';
    if (n > 1) rows += '<li><span>' + n + ' beds, without extra</span><strong>' + S.fmt(base, 1) + ' cu ft</strong></li>';
    if (fill > 0) rows += '<li><span>Soil saved by the filler</span><strong>' + S.fmt(area * fill * n * (1 + extra / 100), 1) + ' cu ft</strong></li>';

    var mixKey = form.querySelector('[data-k="mix"]').value;
    var mix = MIXES[mixKey] || MIXES['60-40'];
    var mixTable = mix.length > 1
      ? '<h3 class="h-sm">Soil mix</h3><table class="bag-table"><thead><tr><th>Ingredient</th><th>Cu ft</th><th>Cu yd</th></tr></thead><tbody>' +
        mix.map(function (m) {
          var v = ft3 * m[1];
          return '<tr><td>' + S.esc(m[0]) + ' (' + S.fmt(m[1] * 100, 0) + '%)</td><td>' + S.fmt(v, 1) + '</td><td>' + S.fmt(v / S.FT3_PER_YD3, 2) + '</td></tr>';
        }).join('') + '</tbody></table>'
      : '';

    var bagRows = BAGS.map(function (b) { return { size: b, n: Math.ceil(ft3 / b - 1e-9) }; });
    var bagTable = '<h3 class="h-sm">If you buy bags</h3><table class="bag-table"><thead><tr><th>Bag size</th><th>Bags</th></tr></thead><tbody>' +
      bagRows.map(function (r) { return '<tr><td>' + S.fmt(r.size, 1) + ' cu ft</td><td>' + S.fmt(r.n, 0) + '</td></tr>'; }).join('') + '</tbody></table>';

    var price = S.val(form, 'price');
    var mode = S.unit(form, 'price');
    if (isFinite(price) && price > 0) {
      var cost, label;
      if (mode === 'yd') { cost = price * yd3; label = S.fmt(yd3, 2) + ' yd³ × ' + S.money(price); }
      else {
        var size = parseFloat(mode.slice(3));
        var bags = Math.ceil(ft3 / size - 1e-9);
        cost = price * bags; label = bags + ' bags of ' + S.fmt(size, 1) + ' cu ft × ' + S.money(price);
      }
      rows += '<li><span>Estimated cost<br><small>' + S.esc(label) + '</small></span><strong>' + S.money(cost) + '</strong></li>';
    }

    var depthIn = soilDepth * 12;
    var note = depthIn < 6
      ? '<p class="note warn">Less than 6 inches of soil only suits shallow crops like lettuce and herbs, unless roots can grow into loose ground below.</p>'
      : yd3 >= 1
        ? '<p class="note">At ' + S.fmt(yd3, 1) + ' cubic yards, bulk soil or a "garden mix" from a landscape supplier is usually much cheaper than ' + S.fmt(bagRows[1].n, 0) + ' bags.</p>'
        : '<p class="note">Water the new soil well and top it up after a week or two — it settles as it gets wet.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Soil needed</div><div class="v">' + S.fmt(ft3, 1) + '<small>cu ft</small></div>' +
      '<div class="sub">' + S.fmt(yd3, 2) + ' cu yd · ' + S.fmt(m3, 2) + ' m³ · ' + n + (n === 1 ? ' bed' : ' beds') + ' · includes ' + S.fmt(extra, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + mixTable + bagTable + note;

    return 'Raised bed soil: ' + S.fmt(ft3, 1) + ' cu ft (' + S.fmt(yd3, 2) + ' cu yd) for ' + n + (n === 1 ? ' bed' : ' beds') + ', incl. ' + S.fmt(extra, 0) + '% extra\n' +
      (mix.length > 1 ? mix.map(function (m) { return '- ' + m[0] + ': ' + S.fmt(ft3 * m[1], 1) + ' cu ft'; }).join('\n') + '\n' : '') +
      bagRows.map(function (r) { return '- or ' + r.n + ' bags of ' + S.fmt(r.size, 1) + ' cu ft'; }).join('\n') + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
