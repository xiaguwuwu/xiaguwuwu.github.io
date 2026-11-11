// 案例页用（2026-11-11）：图表滚到可见时长出来；「定价与订阅权益」里的定价计算器演示。
// 计算器里的模型、单价、倍率全部是虚构的演示数据，只演示算法结构，不含任何真实价格和成本。
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 图：滚到可见时条形从左长出来 ---------- */
  var figs = [].slice.call(document.querySelectorAll('.fig'));
  if(reduce || !('IntersectionObserver' in window)) figs.forEach(function(f){ f.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin: '0px 0px -12% 0px'});
    figs.forEach(function(f){ io.observe(f); });
  }

  /* ---------- 定价计算器演示 ---------- */
  var box = document.getElementById('calc'); if(!box) return;
  var EN = box.getAttribute('data-lang') === 'en';
  var L = EN ? {
    model: 'Model', res: 'Resolution', dur: 'Duration', margin: 'Target margin', price: 'Your price', coins: 'coins', reset: 'Use target price',
    up: 'Upstream billing', cost: 'Cost on one basis', even: 'Break-even price', target: 'Target-margin price', now: 'Margin at your price',
    below: 'below target', loss: 'below cost', ok: 'meets target', na: 'This combination is not available for this model, so it is flagged in the backend.',
    struct: 'Backend structure', base: 'Base price', rmul: 'Resolution multiplier', dmul: 'Duration multiplier', sell: 'Price', sec: 's',
    models: ['Model A', 'Model B', 'Model C'], units: ['billed per second', 'billed in credits', 'billed per clip'],
    a: function(r, d){ return '6 /s × ' + d + ' s × ' + r; },
    b: function(r, d){ return '20 credits/s × 0.25 × ' + d + ' s × ' + r; },
    c: function(r, d, v){ return v + ' per ' + d + ' s clip × ' + r; }
  } : {
    model: '模型', res: '清晰度', dur: '时长', margin: '目标毛利率', price: '售价', coins: '金币', reset: '按目标毛利价',
    up: '上游计价', cost: '统一成本', even: '保本价', target: '目标毛利价', now: '当前售价的毛利率',
    below: '低于目标', loss: '低于成本', ok: '达到目标', na: '这个模型没有这个规格组合，后台会把它标记为不可用。',
    struct: '后台定价结构', base: '基准价', rmul: '清晰度倍率', dmul: '时长倍率', sell: '售价', sec: ' 秒',
    models: ['模型 A', '模型 B', '模型 C'], units: ['按秒计费', '按 Credits 计费', '按条计费'],
    a: function(r, d){ return '6 /秒 × ' + d + ' 秒 × ' + r; },
    b: function(r, d){ return '20 Credits/秒 × 0.25 × ' + d + ' 秒 × ' + r; },
    c: function(r, d, v){ return d + ' 秒一条 ' + v + ' × ' + r; }
  };
  var RES = [['540p', 1], ['720p', 1.5], ['1080p', 2.5]], DUR = [5, 8, 10], CLIP = {5: 28, 10: 56};
  // 三种计费单位折成同一个成本口径（演示里 1 个成本单位 = 1 金币）
  function cost(m, r, d){
    var k = RES[r][1], s = DUR[d];
    if(m === 0) return {v: 6 * s * k, how: L.a(k, s)};
    if(m === 1) return {v: 20 * .25 * s * k, how: L.b(k, s)};
    return CLIP[s] ? {v: CLIP[s] * k, how: L.c(k, s, CLIP[s])} : null;
  }
  var st = {m: 0, r: 1, d: 0, g: 50, p: null};
  function seg(name, key, items){
    return '<div class="cf"><span class="cl" id="cl-' + key + '">' + name + '</span><div class="cseg" role="radiogroup" aria-labelledby="cl-' + key + '">' +
      items.map(function(x, i){ return '<button type="button" role="radio" data-k="' + key + '" data-i="' + i + '" aria-checked="false">' + x + '</button>'; }).join('') + '</div></div>';
  }
  box.innerHTML =
    '<div class="c-in">' +
      seg(L.model, 'm', L.models.map(function(n, i){ return n + '<small>' + L.units[i] + '</small>'; })) +
      seg(L.res, 'r', RES.map(function(x){ return x[0]; })) +
      seg(L.dur, 'd', DUR.map(function(x){ return x + L.sec; })) +
      '<div class="cf"><label class="cl" for="c-g">' + L.margin + '</label><div class="crange"><input id="c-g" type="range" min="0" max="80" step="5" value="50"><output id="c-go">50%</output></div></div>' +
      '<div class="cf"><label class="cl" for="c-p">' + L.price + '</label><div class="cprice"><input id="c-p" type="number" min="1" step="1" inputmode="numeric"><span>' + L.coins + '</span><button type="button" id="c-reset">' + L.reset + '</button></div></div>' +
    '</div>' +
    '<div class="c-out" id="c-out" aria-live="polite"></div>';
  var out = document.getElementById('c-out'), g = document.getElementById('c-g'), go = document.getElementById('c-go'), pin = document.getElementById('c-p');
  function n1(v){ return (Math.round(v * 10) / 10).toString(); }
  function draw(){
    [].forEach.call(box.querySelectorAll('.cseg button'), function(b){ b.setAttribute('aria-checked', st[b.dataset.k] === +b.dataset.i ? 'true' : 'false'); });
    go.textContent = st.g + '%';
    var c = cost(st.m, st.r, st.d);
    if(!c){ pin.value = ''; pin.disabled = true; out.innerHTML = '<p class="c-na">' + L.na + '</p>'; return; }
    pin.disabled = false;
    var even = Math.ceil(c.v), target = Math.ceil(c.v / (1 - st.g / 100));
    if(st.p === null) st.p = target;
    if(document.activeElement !== pin) pin.value = st.p;
    var mg = st.p > 0 ? (st.p - c.v) / st.p * 100 : 0, state = mg < 0 ? 'loss' : mg + .05 < st.g ? 'below' : 'ok';
    // 后台结构：基准价是最低规格（540p、最短时长）下的目标毛利价，其余规格用倍率换算
    var c0 = cost(st.m, 0, 0), base = c0.v / (1 - st.g / 100), rm = RES[st.r][1], dm = c.v / (c0.v * rm), exact = Math.abs(base * rm * dm - target) < .01;
    out.innerHTML =
      '<dl class="c-rows">' +
        '<div><dt>' + L.up + '</dt><dd class="c-how">' + c.how + '</dd></div>' +
        '<div><dt>' + L.cost + '</dt><dd><b>' + n1(c.v) + '</b></dd></div>' +
        '<div><dt>' + L.even + '</dt><dd><b>' + even + '</b> ' + L.coins + '</dd></div>' +
        '<div class="c-key"><dt>' + L.target + '</dt><dd><b>' + target + '</b> ' + L.coins + '</dd></div>' +
      '</dl>' +
      '<div class="c-meter ' + state + '"><p><span>' + L.now + '</span><b>' + n1(mg) + '%</b><em>' + L[state] + '</em></p>' +
        '<span class="track"><span class="bar" style="--v:' + Math.max(0, Math.min(1, mg / 80)).toFixed(3) + '"></span><i style="left:' + (st.g / 80 * 100) + '%"></i></span></div>' +
      '<div class="c-struct"><p class="ch-t">' + L.struct + '</p><div class="ch-flow">' +
        '<span class="node">' + L.base + ' ' + n1(base) + '</span><i class="op">×</i><span class="node">' + L.rmul + ' ' + n1(rm) + '</span><i class="op">×</i><span class="node">' + L.dmul + ' ' + n1(dm) + '</span><i class="op">' + (exact ? '=' : '≈') + '</i><span class="node end">' + L.sell + ' ' + target + '</span></div></div>';
  }
  box.addEventListener('click', function(e){
    var b = e.target.closest('.cseg button');
    if(b){ st[b.dataset.k] = +b.dataset.i; st.p = null; draw(); return; }
    if(e.target.id === 'c-reset'){ st.p = null; draw(); }
  });
  box.addEventListener('keydown', function(e){
    var b = e.target.closest('.cseg button'); if(!b || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    var bs = [].slice.call(b.parentNode.children), n = bs[(bs.indexOf(b) + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
    e.preventDefault(); n.focus(); n.click();
  });
  g.addEventListener('input', function(){ st.g = +g.value; st.p = null; draw(); });
  pin.addEventListener('input', function(){ var v = parseFloat(pin.value); if(v > 0){ st.p = v; draw(); } });
  pin.addEventListener('blur', draw);
  draw();
})();
