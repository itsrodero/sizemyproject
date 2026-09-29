/* Stair calculator: risers, treads, total run, stringer length and code checks for a straight stair. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('stair-form');
  if (!form) return;
  var out = document.getElementById('stair-results');

  function inches(n) { // 7.1875 → 7 3/16 in
    if (!isFinite(n)) return '–';
    var whole = Math.floor(n + 1e-9), six = Math.round((n - whole) * 16);
    if (six === 16) { whole += 1; six = 0; }
    var frac = '';
    if (six) { var g = six % 8 === 0 ? 8 : six % 4 === 0 ? 4 : six % 2 === 0 ? 2 : 1; frac = ' ' + six / g + '/' + 16 / g; }
    return whole + frac + ' in';
  }

  function compute() {
    var rise = S.len(form, 'rise') * 12;          // total rise, inches
    var maxR = S.val(form, 'maxr'), tread = S.val(form, 'tread');
    var width = S.len(form, 'sw') * 12;
    if (!(rise > 0 && maxR > 0 && tread > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the total rise and your riser and tread sizes.</p>';
      return '';
    }
    var risers = Math.ceil(rise / maxR - 1e-9);
    var riser = rise / risers;
    var treads = risers - 1;                        // the upper floor is the last step
    var run = treads * tread;
    var stringer = Math.sqrt(rise * rise + run * run);
    var angle = Math.atan(rise / run) * 180 / Math.PI;
    var comfort = 2 * riser + tread;
    var stringers = width > 0 ? Math.max(2, Math.ceil(width / 18 - 1e-9) + 1) : NaN; // no more than ~18 in apart

    var checks = [
      [riser <= 7.75 + 1e-9, 'Riser ' + inches(riser) + (riser <= 7.75 + 1e-9 ? ' is within' : ' exceeds') + ' the 7¾ in maximum'],
      [tread >= 10 - 1e-9, 'Tread ' + inches(tread) + (tread >= 10 - 1e-9 ? ' meets' : ' is below') + ' the 10 in minimum'],
      [!(width > 0) || width >= 36 - 1e-9, width > 0 ? 'Width ' + inches(width) + (width >= 36 - 1e-9 ? ' meets' : ' is below') + ' the 36 in minimum' : 'Width not entered'],
      [comfort >= 24 && comfort <= 25.5, 'Comfort rule 2 × riser + tread = ' + S.fmt(comfort, 2) + ' in (24–25 in feels natural)']
    ];
    var rows = '<li><span>Number of risers</span><strong>' + risers + '</strong></li>' +
      '<li><span>Exact riser height</span><strong>' + inches(riser) + ' (' + S.fmt(riser, 3) + ' in)</strong></li>' +
      '<li><span>Number of treads</span><strong>' + treads + ' × ' + inches(tread) + '</strong></li>' +
      '<li><span>Total run</span><strong>' + S.fmt(run / 12, 2) + ' ft (' + S.fmt(run, 1) + ' in)</strong></li>' +
      '<li><span>Stringer length (rise/run line)</span><strong>' + S.fmt(stringer / 12, 2) + ' ft</strong></li>' +
      '<li><span>Stair angle</span><strong>' + S.fmt(angle, 1) + '°</strong></li>' +
      (isFinite(stringers) ? '<li><span>Stringers (18 in apart or less)</span><strong>' + stringers + '</strong></li>' : '');
    var checkHtml = '<ul class="checks">' + checks.map(function (c) {
      return '<li class="' + (c[0] ? 'ok' : 'bad') + '">' + (c[0] ? '✓ ' : '✗ ') + S.esc(c[1]) + '</li>';
    }).join('') + '</ul>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Stair layout</div><div class="v">' + risers + '<small>risers</small></div>' +
      '<div class="sub">' + inches(riser) + ' rise · ' + treads + ' treads of ' + inches(tread) + ' · ' + S.fmt(run / 12, 2) + ' ft run</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + checkHtml +
      '<p class="note">Checks use the International Residential Code limits. Your local code may differ, and stairs usually need a permit and an inspection.</p>';

    return 'Stairs: ' + risers + ' risers of ' + inches(riser) + ', ' + treads + ' treads of ' + inches(tread) + '\n- Total run: ' + S.fmt(run / 12, 2) +
      ' ft\n- Stringer length: ' + S.fmt(stringer / 12, 2) + ' ft\n' + location.href;
  }

  S.calculator(form, compute);
})();
