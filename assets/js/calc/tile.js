/* Tile calculator: number of tiles and boxes for a floor or wall, allowing for grout joints and cuts. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('tile-form');
  if (!form) return;
  var out = document.getElementById('tile-results');
  var sizeSel = form.querySelector('[data-k="size"]');

  function compute() {
    form.querySelector('.js-custom-tile').hidden = sizeSel.value !== 'custom';
    var area = S.area(form);
    var size = sizeSel.value === 'custom' ? [S.val(form, 'tl'), S.val(form, 'tw')] : sizeSel.value.split('x').map(Number);
    if (!isFinite(area) || area <= 0 || !(size[0] > 0 && size[1] > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the area and the tile size.</p>';
      return '';
    }
    var joint = S.val(form, 'joint');
    joint = joint > 0 ? joint : 0;
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    var tileSqFt = (size[0] + joint) * (size[1] + joint) / 144;
    var tiles = Math.ceil(area / tileSqFt * (1 + waste / 100) - 1e-9);
    var boxCov = S.val(form, 'box');
    var boxes = boxCov > 0 ? Math.ceil(area * (1 + waste / 100) / boxCov - 1e-9) : NaN;

    var rows = '<li><span>Area</span><strong>' + S.fmt(area, 1) + ' sq ft</strong></li>' +
      '<li><span>One tile + joint covers</span><strong>' + S.fmt(tileSqFt, 3) + ' sq ft</strong></li>' +
      '<li><span>Tiles without extra</span><strong>' + S.fmt(Math.ceil(area / tileSqFt - 1e-9), 0) + '</strong></li>' +
      (isFinite(boxes) ? '<li><span>Boxes (' + S.fmt(boxCov, 2) + ' sq ft each)</span><strong>' + boxes + '</strong></li>' : '');
    var price = S.val(form, 'price');
    if (price > 0) rows += '<li><span>Tile cost</span><strong>' + S.money(price * area * (1 + waste / 100)) + '</strong></li>';

    var large = Math.max(size[0], size[1]) >= 15;
    out.innerHTML =
      '<div class="result-main"><div class="k">Tiles needed</div><div class="v">' + S.fmt(tiles, 0) + '<small>tiles</small></div>' +
      '<div class="sub">' + S.fmt(size[0], 2) + ' × ' + S.fmt(size[1], 2) + ' in · ' + S.fmt(joint, 3) + ' in joints · includes ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' +
      (large ? '<p class="note warn">Large-format tile (any side 15 in or more) needs a very flat substrate and usually a large-and-heavy-tile mortar. Check the flatness tolerance in the installation guide.</p>'
        : '<p class="note">Buy tile from one lot so shades match, and keep a few spares for future repairs.</p>');

    return 'Tile: ' + tiles + ' tiles (' + size[0] + ' x ' + size[1] + ' in) incl. ' + waste + '% extra' + (isFinite(boxes) ? ' = ' + boxes + ' boxes' : '') + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
