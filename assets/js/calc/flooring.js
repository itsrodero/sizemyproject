/* Flooring calculator: square feet and boxes of flooring, underlayment and baseboard trim. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('floor-form');
  if (!form) return;
  var out = document.getElementById('floor-results');

  function compute() {
    var area = S.area(form);
    if (!isFinite(area) || area <= 0) {
      out.innerHTML = '<p class="results-empty">Enter the size of the room.</p>';
      return '';
    }
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var need = area * (1 + waste / 100);
    var box = S.val(form, 'box');
    var boxes = box > 0 ? Math.ceil(need / box - 1e-9) : NaN;
    var roll = S.val(form, 'roll');
    var rolls = roll > 0 ? Math.ceil(area * 1.05 / roll - 1e-9) : NaN;
    var per = S.perimeter(form);
    var doors = Math.max(0, S.val(form, 'doors') || 0);
    var trim = isFinite(per) ? Math.max(0, per - doors * 3) : NaN;
    var trimPieces = isFinite(trim) ? Math.ceil(trim * 1.10 / 8 - 1e-9) : NaN;

    var rows = '<li><span>Room area</span><strong>' + S.fmt(area, 1) + ' sq ft (' + S.fmt(area / 9, 1) + ' sq yd)</strong></li>' +
      '<li><span>With ' + S.fmt(waste, 0) + '% extra</span><strong>' + S.fmt(need, 1) + ' sq ft</strong></li>' +
      (isFinite(boxes) ? '<li><span>Boxes (' + S.fmt(box, 2) + ' sq ft each)</span><strong>' + boxes + ' boxes = ' + S.fmt(boxes * box, 1) + ' sq ft</strong></li>' : '') +
      (isFinite(rolls) ? '<li><span>Underlayment rolls (' + S.fmt(roll, 0) + ' sq ft)</span><strong>' + rolls + '</strong></li>' : '') +
      (isFinite(trim) ? '<li><span>Baseboard / quarter round</span><strong>' + S.fmt(trim, 1) + ' ft · ' + trimPieces + ' × 8 ft</strong></li>' : '');
    var price = S.val(form, 'price');
    if (price > 0) rows += '<li><span>Flooring cost</span><strong>' + S.money((isFinite(boxes) ? boxes * box : need) * price) + '</strong></li>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Flooring to buy</div><div class="v">' + (isFinite(boxes) ? boxes + '<small>boxes</small>' : S.fmt(need, 0) + '<small>sq ft</small>') + '</div>' +
      '<div class="sub">' + S.fmt(need, 1) + ' sq ft including ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      '<p class="note">Buy all boxes from the same lot number so the color matches, and keep a few spare planks for repairs.</p>';

    return 'Flooring: ' + S.fmt(need, 1) + ' sq ft incl. ' + waste + '% extra' + (isFinite(boxes) ? ' = ' + boxes + ' boxes' : '') + '\n' +
      (isFinite(rolls) ? '- Underlayment: ' + rolls + ' rolls\n' : '') + (isFinite(trim) ? '- Trim: ' + S.fmt(trim, 1) + ' ft (' + trimPieces + ' x 8 ft)\n' : '') + location.href;
  }

  S.calculator(form, compute);
})();
