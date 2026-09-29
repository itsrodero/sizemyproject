/* Retaining wall calculator: blocks, caps, base gravel and drainage stone for a segmental block wall. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('wall-form');
  if (!form) return;
  var out = document.getElementById('wall-results');
  var sizeSel = form.querySelector('[data-k="block"]');
  var custom = form.querySelector('.js-custom-block');
  var GRAVEL_T_PER_YD3 = 1.4;
  // Caps usually match the block length, so follow the block choice.
  sizeSel.addEventListener('change', function () {
    var capInp = form.querySelector('[data-k="cap"]');
    if (sizeSel.value !== 'custom') capInp.value = sizeSel.value.split('x')[0];
  });

  function block() {
    if (sizeSel.value === 'custom') return { l: S.val(form, 'bl'), h: S.val(form, 'bh'), d: S.val(form, 'bd') };
    var p = sizeSel.value.split('x').map(Number);
    return { l: p[0], h: p[1], d: p[2] };
  }

  function compute() {
    custom.hidden = sizeSel.value !== 'custom';
    var lenFt = S.len(form, 'wl');
    var hIn = S.len(form, 'wh') * 12;
    var b = block();
    if (!(lenFt > 0 && hIn > 0 && b.l > 0 && b.h > 0 && b.d > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the wall length, height and block size.</p>';
      return '';
    }
    var waste = S.val(form, 'waste');
    waste = isFinite(waste) && waste >= 0 ? waste : 0;
    // Bury at least 6 in, or 1 in for every foot of wall height — whichever is more.
    var buriedMin = Math.max(6, hIn / 12);
    var buriedCourses = Math.ceil(buriedMin / b.h - 1e-9);
    var exposedCourses = Math.ceil(hIn / b.h - 1e-9);
    var courses = exposedCourses + buriedCourses;
    var perCourse = Math.ceil(lenFt * 12 / b.l - 1e-9);
    var blocks = Math.ceil(perCourse * courses * (1 + waste / 100) - 1e-9);
    var capLen = S.val(form, 'cap');
    var caps = capLen > 0 ? Math.ceil(lenFt * 12 / capLen * (1 + waste / 100) - 1e-9) : 0;

    var trenchIn = Math.max(12, 1.5 * b.d);
    var baseYd = lenFt * (trenchIn / 12) * 0.5 / S.FT3_PER_YD3;            // 6 in compacted base
    var totalHIn = courses * b.h;
    var drainYd = lenFt * 1 * (totalHIn / 12) / S.FT3_PER_YD3;            // 12 in wide behind the wall
    var faceSqFt = lenFt * courses * b.h / 12;

    var rows = '<li><span>Courses</span><strong>' + courses + ' (' + exposedCourses + ' exposed + ' + buriedCourses + ' buried)</strong></li>' +
      '<li><span>Blocks per course</span><strong>' + perCourse + '</strong></li>' +
      (caps ? '<li><span>Cap blocks</span><strong>' + caps + '</strong></li>' : '') +
      '<li><span>Wall face incl. buried</span><strong>' + S.fmt(faceSqFt, 1) + ' sq ft</strong></li>' +
      '<li><span>Base gravel (' + S.fmt(trenchIn, 0) + ' in wide × 6 in)</span><strong>' + S.fmt(baseYd, 2) + ' yd³ · ' + S.fmt(baseYd * GRAVEL_T_PER_YD3, 2) + ' tons</strong></li>' +
      '<li><span>Drainage stone behind wall (12 in)</span><strong>' + S.fmt(drainYd, 2) + ' yd³ · ' + S.fmt(drainYd * GRAVEL_T_PER_YD3, 2) + ' tons</strong></li>' +
      '<li><span>Perforated drain pipe</span><strong>' + S.fmt(Math.ceil(lenFt), 0) + ' ft</strong></li>';

    var price = S.val(form, 'price');
    if (isFinite(price) && price > 0) rows += '<li><span>Blocks cost</span><strong>' + S.money(price * blocks) + '</strong></li>';

    var note;
    if (hIn > 48) note = '<p class="note warn">Walls over 4 ft usually need an engineered design with soil reinforcement (geogrid), and many towns require a permit. Check with your building department and the block manufacturer.</p>';
    else if (b.h <= 4 && hIn > 24) note = '<p class="note warn">Small garden-wall blocks are typically rated for walls of only about 2 ft. Check the product’s maximum height or use a larger block.</p>';
    else note = '<p class="note">A drain pipe is recommended for most retaining walls and required by manufacturers for taller walls or poorly drained sites.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Wall blocks needed</div><div class="v">' + S.fmt(blocks, 0) + '<small>blocks</small></div>' +
      '<div class="sub">' + b.l + ' × ' + b.h + ' in face · buried ' + S.fmt(buriedCourses * b.h, 0) + ' in · includes ' + S.fmt(waste, 0) + '% extra</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + note;

    return 'Retaining wall ' + S.fmt(lenFt, 1) + ' ft x ' + S.fmt(hIn, 0) + ' in exposed\n- Blocks: ' + blocks + ' (' + b.l + 'x' + b.h + ' in face)\n' +
      (caps ? '- Caps: ' + caps + '\n' : '') + '- Base gravel: ' + S.fmt(baseYd, 2) + ' yd3\n- Drainage stone: ' + S.fmt(drainYd, 2) + ' yd3\n- Drain pipe: ' +
      Math.ceil(lenFt) + ' ft\n' + location.href;
  }

  S.calculator(form, compute);
})();
