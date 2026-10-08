/* Rebar calculator: a two-way grid of bars in a rectangular slab, with lap splices and stock-length cutting. */
(function () {
  'use strict';
  var S = window.SMP;
  var form = document.getElementById('rebar-form');
  if (!form) return;
  var out = document.getElementById('rebar-results');

  // Nominal diameter (in) and weight (lb/ft) of deformed bars, by bar number.
  var BARS = { 3: [0.375, 0.376], 4: [0.5, 0.668], 5: [0.625, 1.043], 6: [0.75, 1.502] };

  // Length of bar needed for one run, including lap splices when the run is longer than a stock bar.
  function withLaps(run, stock, lap) {
    if (run <= stock + 1e-9) return { len: run, splices: 0 };
    var splices = Math.ceil((run - stock) / (stock - lap) - 1e-9);
    return { len: run + splices * lap, splices: splices };
  }
  // Stock bars needed to cut n pieces of the given length: whole bars, then leftover pieces packed into bars.
  function sticksFor(n, len, stock) {
    var whole = Math.floor(len / stock + 1e-9);
    var rest = len - whole * stock;
    if (rest < 1e-6) return n * whole;
    var perStick = Math.max(1, Math.floor(stock / rest + 1e-9));
    return n * whole + Math.ceil(n / perStick - 1e-9);
  }

  function compute() {
    var L = S.len(form, 'L'), W = S.len(form, 'W');
    var sp = S.val(form, 'sp') / 12, edge = S.val(form, 'edge') / 12;
    var bar = BARS[form.querySelector('[data-k="size"]').value] || BARS[4];
    var stock = parseFloat(form.querySelector('[data-k="stock"]').value) || 20;
    var lapD = S.val(form, 'lap');
    if (!(L > 0) || !(W > 0) || !(sp > 0)) {
      out.innerHTML = '<p class="results-empty">Enter the size of the slab and the rebar spacing.</p>';
      return '';
    }
    edge = edge >= 0 ? edge : 0;
    var runL = L - 2 * edge, runW = W - 2 * edge;
    if (runL <= 0 || runW <= 0) {
      out.innerHTML = '<p class="results-empty">The edge distance is larger than the slab — reduce it.</p>';
      return '';
    }
    var lap = (isFinite(lapD) && lapD > 0 ? lapD : 0) * bar[0] / 12;
    if (lap >= stock) {
      out.innerHTML = '<p class="results-empty">The lap splice is longer than a stock bar — check the lap and stock length.</p>';
      return '';
    }
    var nL = Math.floor(runW / sp + 1e-9) + 1; // bars running along the length
    var nW = Math.floor(runL / sp + 1e-9) + 1; // bars running along the width
    var a = withLaps(runL, stock, lap), b = withLaps(runW, stock, lap);
    var total = nL * a.len + nW * b.len;
    var plain = nL * runL + nW * runW;
    var sticks = sticksFor(nL, a.len, stock) + sticksFor(nW, b.len, stock);
    var weight = total * bar[1];
    var ties = nL * nW;

    var rows = '<li><span>Bars along the length</span><strong>' + nL + ' × ' + S.fmt(runL, 2) + ' ft</strong></li>' +
      '<li><span>Bars along the width</span><strong>' + nW + ' × ' + S.fmt(runW, 2) + ' ft</strong></li>' +
      '<li><span>Rebar length without laps</span><strong>' + S.fmt(plain, 0) + ' ft</strong></li>';
    var splices = nL * a.splices + nW * b.splices;
    if (splices) rows += '<li><span>Lap splices (' + S.fmt(lap * 12, 1) + ' in each)</span><strong>' + splices + '</strong></li>';
    rows += '<li><span>Weight</span><strong>' + S.fmt(weight, 0) + ' lb (' + S.fmt(weight * 0.45359237, 0) + ' kg)</strong></li>' +
      '<li><span>Intersections to tie</span><strong>' + S.fmt(ties, 0) + '</strong></li>';

    var price = S.val(form, 'price');
    if (isFinite(price) && price > 0) {
      var byStick = S.unit(form, 'price') === 'stick';
      var cost = byStick ? price * sticks : price * sticks * stock;
      rows += '<li><span>Estimated cost<br><small>' + (byStick ? sticks + ' bars × ' + S.money(price) : S.fmt(sticks * stock, 0) + ' ft × ' + S.money(price)) + '</small></span><strong>' + S.money(cost) + '</strong></li>';
    }

    var note = splices
      ? '<p class="note">Stagger the lap splices so they don’t all fall in the same line across the slab, and buy a spare bar or two for mistakes.</p>'
      : '<p class="note">Support the grid on chairs or blocks so it sits within the slab, not on the ground.</p>';

    out.innerHTML =
      '<div class="result-main"><div class="k">Stock bars to buy</div><div class="v">' + sticks + '<small>× ' + stock + ' ft</small></div>' +
      '<div class="sub">#' + form.querySelector('[data-k="size"]').value + ' bar · ' + S.fmt(total, 0) + ' ft of rebar including laps · ' + (nL + nW) + ' bars in the grid</div></div>' +
      '<ul class="result-rows">' + rows + '</ul>' + note;

    return 'Rebar #' + form.querySelector('[data-k="size"]').value + ' at ' + S.fmt(sp * 12, 1) + ' in on center: ' + sticks + ' bars of ' + stock + ' ft\n' +
      '- ' + nL + ' bars of ' + S.fmt(runL, 2) + ' ft and ' + nW + ' bars of ' + S.fmt(runW, 2) + ' ft\n' +
      '- ' + S.fmt(total, 0) + ' ft incl. laps, about ' + S.fmt(weight, 0) + ' lb\n' + location.href;
  }

  S.calculator(form, compute);
})();
