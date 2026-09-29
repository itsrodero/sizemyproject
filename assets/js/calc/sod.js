/* Sod calculator: square feet, pieces and pallets. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('sod-form');
  if (!form) return;
  var out = document.getElementById('sod-results');
  var pieceSel = form.querySelector('[data-k="piece"]');
  var palletSel = form.querySelector('[data-k="pallet"]');

  function compute() {
    form.querySelector('.js-custom-piece').hidden = pieceSel.value !== 'custom';
    form.querySelector('.js-custom-pallet').hidden = palletSel.value !== 'custom';
    var area = S.area(form);
    if (!isFinite(area) || area <= 0) {
      out.innerHTML = '<p class="results-empty">Enter the size of the lawn area.</p>';
      return '';
    }
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var need = area * (1 + waste / 100);
    var piece = pieceSel.value === 'custom' ? S.val(form, 'pc') : parseFloat(pieceSel.value);
    var pallet = palletSel.value === 'custom' ? S.val(form, 'pal') : parseFloat(palletSel.value);
    var pieces = piece > 0 ? Math.ceil(need / piece - 1e-9) : NaN;
    var pallets = pallet > 0 ? need / pallet : NaN;

    var rows = '<li><span>Lawn area</span><strong>' + S.fmt(area, 1) + ' sq ft (' + S.fmt(area / 9, 1) + ' sq yd)</strong></li>' +
      '<li><span>With ' + S.fmt(waste, 0) + '% extra</span><strong>' + S.fmt(need, 0) + ' sq ft</strong></li>' +
      (isFinite(pieces) ? '<li><span>Pieces (' + S.fmt(piece, 2) + ' sq ft each)</span><strong>' + S.fmt(pieces, 0) + '</strong></li>' : '') +
      (isFinite(pallets) ? '<li><span>Pallets (' + S.fmt(pallet, 0) + ' sq ft each)</span><strong>' + S.fmt(pallets, 2) + ' → order ' + Math.ceil(pallets - 1e-9) + '</strong></li>' : '');

    var price = S.val(form, 'price');
    if (isFinite(price) && price > 0) {
      var mode = S.unit(form, 'price');
      var cost = mode === 'pallet' ? price * Math.ceil(pallets - 1e-9) : mode === 'piece' ? price * pieces : price * need;
      rows += '<li><span>Estimated cost</span><strong>' + S.money(cost) + '</strong></li>';
    }
    var partial = isFinite(pallets) && pallets % 1 > 0 && pallets % 1 < 0.3
      ? '<p class="note">You’re just over a whole pallet. Many sod farms sell partial pallets or single pieces — ask before ordering a full extra pallet.</p>'
      : '<p class="note">Lay sod within a day of delivery, starting along a straight edge, and water it deeply the same day.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Sod needed</div><div class="v">' + S.fmt(need, 0) + '<small>sq ft</small></div>' +
      '<div class="sub">' + (isFinite(pallets) ? S.fmt(pallets, 2) + ' pallets · ' : '') + (isFinite(pieces) ? S.fmt(pieces, 0) + ' pieces · ' : '') + 'includes ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + partial;

    return 'Sod: ' + S.fmt(need, 0) + ' sq ft incl. ' + waste + '% extra\n' + (isFinite(pieces) ? '- ' + pieces + ' pieces\n' : '') +
      (isFinite(pallets) ? '- ' + S.fmt(pallets, 2) + ' pallets (order ' + Math.ceil(pallets - 1e-9) + ')\n' : '') + location.href;
  }

  S.calculator(form, compute);
})();
