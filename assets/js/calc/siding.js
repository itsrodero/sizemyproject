/* Siding calculator: wall + gable area minus openings, squares, vinyl boxes or lap boards, and trim. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('sd-form');
  if (!form) return;
  var out = document.getElementById('sd-results');

  var DOOR = 21, WINDOW = 15, GARAGE = 112;   // 3×7, 3×5 and 16×7 ft
  var ACC_LEN = 12.5, CORNER_LEN = 10;          // vinyl accessory and outside-corner post lengths (ft)

  function compute() {
    var L = S.len(form, 'L'), W = S.len(form, 'W'), H = S.len(form, 'H');
    if (!(L > 0) || !(W > 0) || !(H > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the length, width and wall height of the house.</p>';
      return '';
    }
    var gables = Math.max(0, Math.min(2, Math.round(S.val(form, 'gables') || 0)));
    var pitch = S.val(form, 'pitch'); pitch = pitch > 0 ? pitch : 0;
    var doors = Math.max(0, S.val(form, 'doors') || 0), wins = Math.max(0, S.val(form, 'windows') || 0), gar = Math.max(0, S.val(form, 'garage') || 0);
    var waste = S.val(form, 'waste'); waste = isFinite(waste) && waste >= 0 ? waste : 10;
    var type = form.querySelector('[data-k="type"]').value;

    var walls = 2 * (L + W) * H;
    var gableEach = W * W * pitch / 48;                 // triangle: W × (W/2 × pitch/12) ÷ 2
    var gableArea = gables * gableEach;
    var openings = doors * DOOR + wins * WINDOW + gar * GARAGE;
    var net = Math.max(walls + gableArea - openings, 0);
    var order = net * (1 + waste / 100);
    var squares = order / 100;

    var rows = '<li><span>Walls</span><strong>' + S.fmt(walls, 0) + ' sq ft</strong></li>' +
      (gables ? '<li><span>Gable ends (' + gables + ' × ' + S.fmt(gableEach, 0) + ')</span><strong>' + S.fmt(gableArea, 0) + ' sq ft</strong></li>' : '') +
      '<li><span>Doors, windows and garage doors</span><strong>− ' + S.fmt(openings, 0) + ' sq ft</strong></li>' +
      '<li><span>Net area to cover</span><strong>' + S.fmt(net, 0) + ' sq ft</strong></li>' +
      '<li><span>With ' + S.fmt(waste, 0) + '% waste</span><strong>' + S.fmt(order, 0) + ' sq ft = ' + S.fmt(squares, 2) + ' squares</strong></li>';

    var main, list;
    if (type === 'vinyl') {
      var sq = Math.ceil(squares - 1e-9), boxes = Math.ceil(squares / 2 - 1e-9);
      rows += '<li><span>Vinyl boxes (≈ 2 squares each)</span><strong>' + boxes + '</strong></li>';
      main = sq + '<small>squares</small>';
      list = '- vinyl siding: ' + sq + ' squares (about ' + boxes + ' boxes of 2 squares)';
    } else {
      var exp = S.val(form, 'exposure'), blen = S.val(form, 'blen');
      exp = exp > 0 ? exp : 7; blen = blen > 0 ? blen : 12;
      var perBoard = blen * exp / 12;
      var boards = Math.ceil(order / perBoard - 1e-9);
      rows += '<li><span>Each board covers (' + S.fmt(exp, 2) + ' in × ' + S.fmt(blen, 1) + ' ft)</span><strong>' + S.fmt(perBoard, 2) + ' sq ft</strong></li>' +
        '<li><span>Lap boards</span><strong>' + boards + '</strong></li>';
      main = boards + '<small>boards</small>';
      list = '- lap siding: ' + boards + ' boards (' + S.fmt(blen, 1) + ' ft, ' + S.fmt(exp, 2) + ' in exposure)';
    }

    // Trim and accessories (lineal feet, and 12.5 ft vinyl pieces).
    var rake = gables ? gables * 2 * Math.sqrt(Math.pow(W / 2, 2) + Math.pow(W / 2 * pitch / 12, 2)) : 0;
    var jFt = wins * 16 + doors * 17 + gar * 30 + rake;           // window 3×5 all round, doors 3 sides, garage 16×7 3 sides, gable rakes
    var starterFt = Math.max(2 * (L + W) - doors * 3 - gar * 16, 0);
    var finishFt = gables ? 2 * L : 2 * (L + W);                   // under the eaves; gable walls end at the rake J-channel
    var posts = 4 * Math.ceil(H / CORNER_LEN - 1e-9);
    var pcs = function (ft) { return Math.ceil(ft / ACC_LEN - 1e-9); };
    var trim = '<table class="bag-table"><thead><tr><th>Trim</th><th>Feet</th><th>12½ ft pieces</th></tr></thead><tbody>' +
      '<tr><td>Starter strip</td><td>' + S.fmt(starterFt, 0) + '</td><td>' + pcs(starterFt) + '</td></tr>' +
      '<tr><td>J-channel (openings' + (gables ? ' + rakes' : '') + ')</td><td>' + S.fmt(jFt, 0) + '</td><td>' + pcs(jFt) + '</td></tr>' +
      '<tr><td>Finish trim (under eaves)</td><td>' + S.fmt(finishFt, 0) + '</td><td>' + pcs(finishFt) + '</td></tr>' +
      '<tr><td>Outside corner posts (10 ft)</td><td>' + S.fmt(4 * H, 0) + '</td><td>' + posts + ' posts</td></tr>' +
      '</tbody></table>';

    out.innerHTML =
      '<div class="result-main"><div class="k">' + (type === 'vinyl' ? 'Vinyl siding' : 'Lap siding') + '</div><div class="v">' + main + '</div>' +
      '<div class="sub">' + S.fmt(net, 0) + ' sq ft to cover · ' + S.fmt(waste, 0) + '% extra included</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + trim +
      '<p class="note">Openings are estimated at 21 sq ft per door, 15 sq ft per window and 112 sq ft per 16 × 7 ft garage door. Measure unusual windows and add the difference.</p>';

    return 'Siding for ' + S.fmt(L, 1) + ' × ' + S.fmt(W, 1) + ' ft house, ' + S.fmt(H, 1) + ' ft walls: ' + S.fmt(net, 0) + ' sq ft net, ' + S.fmt(squares, 2) + ' squares with ' + S.fmt(waste, 0) + '% waste\n' +
      list + '\n- starter strip: ' + pcs(starterFt) + ' pieces\n- J-channel: ' + pcs(jFt) + ' pieces\n- finish trim: ' + pcs(finishFt) + ' pieces\n- outside corner posts: ' + posts + '\n' + location.href;
  }

  function toggle() {
    var lap = form.querySelector('[data-k="type"]').value === 'lap';
    form.querySelectorAll('[data-lap]').forEach(function (n) { n.hidden = !lap; });
  }
  form.addEventListener('change', toggle);
  S.calculator(form, compute);
  toggle();
})();
