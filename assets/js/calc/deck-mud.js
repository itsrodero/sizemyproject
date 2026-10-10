/* Deck mud calculator: sloped mortar bed (shower pan) volume, 80 lb premixed bags or sand and cement. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('mud-form');
  if (!form) return;
  var out = document.getElementById('mud-results');

  var BAG_FT3 = 0.66;        // QUIKRETE Floor Mud, 80 lb bag
  var CEMENT_LB_FT3 = 94;    // a 94 lb sack of Portland cement is 1 ft³
  var SAND_BAG_FT3 = 0.5;    // a 50 lb bag of sand is about half a cubic foot

  function compute() {
    var L = S.len(form, 'L'), W = S.len(form, 'W'), d = S.len(form, 'd');
    var t0 = S.val(form, 't0'), slope = S.val(form, 'slope');
    if (!(L > 0) || !(W > 0) || !(t0 > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the size of the shower floor and the thickness at the drain.</p>';
      return '';
    }
    d = d > 0 ? d : 0;
    slope = slope > 0 ? slope : 0;
    var extra = S.val(form, 'extra');
    extra = isFinite(extra) && extra >= 0 ? extra : 0;
    var area = L * W;
    var rise = slope * d;                 // inches
    var wall = t0 + rise;
    var avg = t0 + rise / 2;
    var ft3 = area * avg / 12 * (1 + extra / 100);
    var mix = form.querySelector('[data-k="mix"]').value;

    var rows = '<li><span>Floor area</span><strong>' + S.fmt(area, 1) + ' sq ft</strong></li>' +
      '<li><span>Thickness at the wall</span><strong>' + S.fmt(wall, 2) + ' in</strong></li>' +
      '<li><span>Average thickness</span><strong>' + S.fmt(avg, 2) + ' in</strong></li>';
    var main, sub, list;
    if (mix === 'bag') {
      var bags = Math.ceil(ft3 / BAG_FT3 - 1e-9);
      rows += '<li><span>80 lb bags (≈0.66 ft³ each)</span><strong>' + bags + '</strong></li>';
      main = bags + '<small>bags of 80 lb</small>';
      sub = S.fmt(ft3, 2) + ' cu ft of deck mud · includes ' + S.fmt(extra, 0) + '% extra';
      list = '- ' + bags + ' bags of 80 lb premixed floor mud';
    } else {
      var ratio = parseFloat(mix);
      var cementLb = ft3 / ratio * CEMENT_LB_FT3;
      var sandBags = Math.ceil(ft3 / SAND_BAG_FT3 - 1e-9);
      rows += '<li><span>Sand (≈ finished volume)</span><strong>' + S.fmt(ft3, 2) + ' ft³ · ' + sandBags + ' bags of 50 lb</strong></li>' +
        '<li><span>Portland cement (' + ratio + ' : 1)</span><strong>' + S.fmt(cementLb, 0) + ' lb</strong></li>';
      main = S.fmt(ft3, 2) + '<small>cu ft</small>';
      sub = ratio + ' parts sand : 1 cement · includes ' + S.fmt(extra, 0) + '% extra';
      list = '- sand: ' + S.fmt(ft3, 2) + ' cu ft (' + sandBags + ' bags of 50 lb)\n- Portland cement: ' + S.fmt(cementLb, 0) + ' lb';
    }
    var note = wall > 3
      ? '<p class="note warn">The bed gets over 3 inches thick at the wall — check the drain height and the distance, or consider a linear drain.</p>'
      : '<p class="note">Mix it stiff: a handful should hold its shape when squeezed and crumble when tapped.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Deck mud needed</div><div class="v">' + main + '</div><div class="sub">' + sub + '</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + note;

    return 'Deck mud: ' + S.fmt(ft3, 2) + ' cu ft for ' + S.fmt(area, 1) + ' sq ft (' + S.fmt(t0, 2) + ' in at drain, ' + S.fmt(wall, 2) + ' in at wall)\n' + list + '\n' + location.href;
  }

  S.calculator(form, compute);
})();
