/* Fence calculator: posts, rails, pickets, concrete for the post holes and fasteners for a wood fence. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('fence-form');
  if (!form) return;
  var out = document.getElementById('fence-results');
  var BAG_50 = 0.375, BAG_80 = 0.60; // concrete mix yields, ft³ per bag
  var STOCK = [8, 10, 12, 14, 16];   // common post lengths, ft

  function compute() {
    var L = S.len(form, 'fl');
    var H = S.len(form, 'fh');
    var sp = S.len(form, 'sp');
    if (!(L > 0 && H > 0 && sp > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the fence length, height and post spacing.</p>';
      return '';
    }
    var gates = Math.max(0, Math.round(S.val(form, 'gates')) || 0);
    var gw = gates ? S.len(form, 'gw') || 0 : 0;
    var corners = Math.max(0, Math.round(S.val(form, 'corners')) || 0);
    var railsSel = S.val(form, 'rails');
    var railsPer = isFinite(railsSel) ? railsSel : (H <= 4 ? 2 : H <= 6 ? 3 : 4);
    var pw = S.val(form, 'pw'), gap = S.val(form, 'gap');
    gap = isFinite(gap) && gap > 0 ? gap : 0;
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;

    var fenced = Math.max(0, L - gates * gw);            // length of fence panels
    var sections = Math.ceil(fenced / sp - 1e-9);
    var posts = sections + 1 + gates + corners;          // gate openings and corners each add a post
    var rails = sections * railsPer;
    var pickets = pw > 0 ? Math.ceil(L * 12 / (pw + gap) * (1 + waste / 100) - 1e-9) : 0;

    var holeD = S.len(form, 'hd'), depth = S.len(form, 'hdep'), post = S.val(form, 'ps') / 12; // ps is the actual post width in inches
    var holeFt3 = Math.PI * Math.pow(holeD / 2, 2) * depth - post * post * depth;
    var totalFt3 = Math.max(0, holeFt3) * posts;
    var postLen = H + depth;
    var stock = STOCK.filter(function (s) { return s >= postLen - 1e-9; })[0];

    var rows = '<li><span>Posts</span><strong>' + posts + (stock ? ' × ' + stock + ' ft' : '') + '</strong></li>' +
      '<li><span>Rails (' + railsPer + ' per section)</span><strong>' + rails + ' × ' + S.fmt(sp, 1) + ' ft</strong></li>' +
      (pickets ? '<li><span>Pickets (' + S.fmt(pw, 2) + ' in' + (gap ? ', ' + S.fmt(gap, 2) + ' in gap' : '') + ')</span><strong>' + S.fmt(pickets, 0) + '</strong></li>' : '') +
      '<li><span>Concrete per hole</span><strong>' + S.fmt(holeFt3, 2) + ' ft³ (' + S.fmt(holeFt3 / BAG_80, 1) + ' × 80 lb)</strong></li>' +
      '<li><span>Concrete, all holes</span><strong>' + Math.ceil(totalFt3 / BAG_80 - 1e-9) + ' × 80 lb or ' + Math.ceil(totalFt3 / BAG_50 - 1e-9) + ' × 50 lb bags</strong></li>' +
      (pickets ? '<li><span>Picket fasteners (2 per rail)</span><strong>' + S.fmt(pickets * railsPer * 2, 0) + '</strong></li>' : '') +
      '<li><span>Rail fasteners or brackets</span><strong>' + S.fmt(rails * 2, 0) + ' rail ends</strong></li>';

    var notes = [];
    if (sp > 8) notes.push('<p class="note warn">Post spacing over 8 ft lets rails sag. Most wood fences use 6 to 8 ft.</p>');
    if (depth < H / 3 - 1e-9) notes.push('<p class="note warn">That hole is shallower than a third of the fence height. Go deeper — and always below your local frost line.</p>');
    if (!stock) notes.push('<p class="note warn">Posts longer than 16 ft are unusual; check the height and hole depth.</p>');
    if (!notes.length) notes.push('<p class="note">Call 811 before you dig — it’s free, and utility lines are often shallower than you’d expect.</p>');

    out.innerHTML =
      '<div class="result-main"><div class="k">Fence materials</div><div class="v">' + posts + '<small>posts</small></div>' +
      '<div class="sub">' + rails + ' rails · ' + (pickets ? S.fmt(pickets, 0) + ' pickets · ' : '') + Math.ceil(totalFt3 / BAG_80 - 1e-9) + ' bags of 80 lb concrete</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + notes.join('');

    return 'Fence ' + S.fmt(L, 1) + ' ft x ' + S.fmt(H, 1) + ' ft\n- Posts: ' + posts + (stock ? ' x ' + stock + ' ft' : '') + '\n- Rails: ' + rails + ' x ' + S.fmt(sp, 1) + ' ft\n' +
      (pickets ? '- Pickets: ' + pickets + '\n' : '') + '- Concrete: ' + Math.ceil(totalFt3 / BAG_80 - 1e-9) + ' x 80 lb bags\n' + location.href;
  }

  S.calculator(form, compute);
})();
