/* 个人主页：一张写满字的纸，拆开、再一步步折成纸飞机，最后飞走。
 * 结构参照 animejs.com：一个立体物件固定在舞台中间，随滚动拆解、重组，旁边用引线标注。
 * 没有依赖库：折纸几何、贴图透视、合成音效都在这里手写。
 *
 * 几何：纸在平面坐标里是 x∈[-1,1]、y∈[-1.4,1.4]，机头朝 +y。
 * 6 步折法（STEPS），每一步是一条或两条折线；建模时按折线把纸切成多块（piece），
 * 每块记下它被哪几条折线带着转。渲染时按每一步的进度，把块上的点依次绕折线旋转。
 */
(function(){
  'use strict';
  var ME = window.ME, S = ME.story, $ = function(id){ return document.getElementById(id); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var clamp = function(x, a, b){ return x < a ? a : x > b ? b : x; };
  var lerp = function(a, b, k){ return a + (b - a) * k; };
  var ease = function(x){ return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var eout = function(x){ return 1 - Math.pow(1 - x, 3); };
  var PI = Math.PI;
  // 英文时 me/en.js 先把 story 换成英文、给引文加上 r.en（译文），界面文字查 window.T
  var t = function(k){ var T = window.T; return T && Object.prototype.hasOwnProperty.call(T, k) ? T[k] : k; };
  function qh(r){ return r.en ? '“' + esc(r.en) + '”<small class="orig" lang="zh-CN">「' + esc(r.q) + '」</small>' : '「' + esc(r.q) + '」'; }

  /* ================= 声音：Web Audio 现场合成，不加载音频文件 ================= */
  var Snd = (function(){
    var ctx = null, on = false, master, buf, rus;
    on = true;  // 默认打开，访客关掉过才记成 0
    try { on = localStorage.getItem('me-sound') !== '0'; } catch(e){}
    function init(){
      if(ctx) return;
      var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
      buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      var d = buf.getChannelData(0); for(var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // 持续的纸张摩擦声：白噪声 → 带通 → 音量跟着折纸的速度走
      var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(); src.buffer = buf; src.loop = true;
      bp.type = 'bandpass'; bp.frequency.value = 3600; bp.Q.value = .5;
      rus = ctx.createGain(); rus.gain.value = 0; src.connect(bp); bp.connect(rus); rus.connect(master); src.start();
    }
    function noise(dur, f, q, g, f2, delay){
      var t = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gn = ctx.createGain();
      s.buffer = buf; bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f, t);
      if(f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur * .8);
      gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(g, t + Math.min(.012, dur * .3)); gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(gn); gn.connect(master); s.start(t, Math.random() * 1.5); s.stop(t + dur + .05);
    }
    function tone(f, dur, g, type, f2, delay){
      var t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(g, t + .008); gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + .05);
    }
    var NOTE = [392, 440, 523.25, 587.33, 659.25, 783.99, 880];
    var ok = function(){ return on && ctx && ctx.state === 'running'; };
    return {
      on: function(){ return on; },
      set: function(v){
        on = v; try { localStorage.setItem('me-sound', v ? '1' : '0'); } catch(e){}
        if(v){ init(); if(ctx && ctx.state !== 'running') ctx.resume(); }
        else if(rus) rus.gain.setTargetAtTime(0, ctx.currentTime, .02);
      },
      wake: function(){ if(on){ init(); if(ctx && ctx.state !== 'running') ctx.resume(); } },
      crease: function(soft){ if(!ok()) return; noise(.11, 2600, .9, soft ? .18 : .42); tone(150, .09, soft ? .08 : .16, 'sine', 70); },
      rustle: function(v){ if(ctx && rus) rus.gain.setTargetAtTime(ok() ? Math.min(.11, v) : 0, ctx.currentTime, .06); },
      tick: function(){ if(!ok()) return; tone(2200, .02, .02, 'sine'); },
      note: function(i){ if(!ok()) return; var f = NOTE[i % NOTE.length]; tone(f, 1.4, .07, 'triangle'); tone(f * 2, .9, .02, 'sine', 0, .02); },
      blip: function(i){ if(!ok()) return; tone(NOTE[(i || 0) % NOTE.length] * 2, .12, .035, 'sine'); },
      whoosh: function(){ if(!ok()) return; noise(1.6, 260, 1.4, .5, 2400); noise(.9, 900, .7, .14, 3800, .55); },
      swish: function(){ if(!ok()) return; noise(.42, 2600, .7, .16, 700); }
    };
  })();

  /* ================= 折纸几何 ================= */
  var HL = 1.4;
  function sub(a, b){ return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function dot(a, b){ return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b){ return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unit(a){ var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function rotA(p, o, d, t){
    if(!t) return p;
    var v = sub(p, o), c = Math.cos(t), s = Math.sin(t), k = dot(d, v) * (1 - c), x = cross(d, v);
    return [o[0] + v[0] * c + x[0] * s + d[0] * k, o[1] + v[1] * c + x[1] * s + d[1] * k, o[2] + v[2] * c + x[2] * s + d[2] * k];
  }
  // 每一步的折线：o 折线上一点，d 方向，ref 会动的那一侧的参考点，up 往观众(+1)还是往后(-1)折，flat 只动原来在左(-1)/右(+1)半边的纸
  var STEPS = [
    [{o: [0, 0, 0], d: [0, 1, 0], ref: [-.5, 0], ang: .9, up: 1, flick: true}],
    [{o: [0, HL, 0], d: [-1, -1, 0], ref: [-.98, HL - .02], ang: .95, up: 1}],
    [{o: [0, HL, 0], d: [1, -1, 0], ref: [.98, HL - .02], ang: .95, up: 1}],
    [{o: [0, HL, 0], d: [-.38268, -.92388, 0], ref: [-.95, 0], ang: .9, up: 1}, {o: [0, HL, 0], d: [.38268, -.92388, 0], ref: [.95, 0], ang: .9, up: 1}],
    [{o: [0, 0, 0], d: [0, 1, 0], ref: [-.5, -1], ang: .965, up: -1}],
    [{o: [0, HL, 0], d: [.34, -2 * HL, 0], ref: [.9, -1.3], flat: 1, ang: .5, up: 1}, {o: [0, HL, 0], d: [.34, -2 * HL, 0], ref: [.9, -1.3], flat: -1, ang: .5, up: -1}]
  ];
  var FOLDS = [];
  STEPS.forEach(function(st, si){ st.forEach(function(f){ f.step = si; f.d = unit(f.d); f.ang *= PI; f.id = FOLDS.length; FOLDS.push(f); }); });

  function place(piece, pt, g){            // 平面上的点 → 当前折叠状态下的空间位置
    var p = [pt[0], pt[1], 0];
    for(var i = 0; i < piece.m.length; i++){
      var f = FOLDS[piece.m[i]], k = g[f.step]; if(!k) continue;
      p = rotA(p, f.o, f.d, f.ang * (f.flick ? Math.sin(PI * k) : k));
    }
    return p;
  }
  var pieces = [{f: [[-1, -HL], [1, -HL], [1, HL], [-1, HL]], m: []}], creases = STEPS.map(function(){ return []; });
  (function build(){
    FOLDS.forEach(function(F){
      var g = STEPS.map(function(_, s){ return s < F.step ? 1 : 0; });
      var n = [F.d[1], -F.d[0], 0];      // 折线在纸面内的法向
      var side = function(p){ return dot(sub(p, F.o), n); };
      var refSide = side([F.ref[0], F.ref[1], 0]) > 0;
      var out = [];
      pieces.forEach(function(pc){
        var s = pc.f.map(function(pt){ var v = side(place(pc, pt, g)); return Math.abs(v) < 1e-7 ? 0 : v; });
        if(s.every(function(v){ return v >= 0; }) || s.every(function(v){ return v <= 0; })){ out.push(pc); return; }
        var A = [], B = [], cut = [];
        for(var i = 0; i < pc.f.length; i++){
          var j = (i + 1) % pc.f.length, p = pc.f[i], q = pc.f[j], a = s[i], b = s[j];
          if(a >= 0) A.push(p); if(a <= 0) B.push(p);
          if((a > 0 && b < 0) || (a < 0 && b > 0)){ var t = a / (a - b), x = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; A.push(x); B.push(x); cut.push(x); }
          else if(a === 0) cut.push(p);
        }
        if(cut.length >= 2) creases[F.step].push([cut[0], cut[cut.length - 1]]);
        out.push({f: A, m: pc.m.slice()}, {f: B, m: pc.m.slice()});
      });
      pieces = out.filter(function(pc){ return pc.f.length >= 3; });
      // 选出要动的块，并定下往哪边转
      var moving = pieces.filter(function(pc){
        var c = [0, 0]; pc.f.forEach(function(p){ c[0] += p[0] / pc.f.length; c[1] += p[1] / pc.f.length; });
        if(F.flat && Math.sign(c[0]) !== F.flat) return false;
        return (side(place(pc, c, g)) > 0) === refSide;
      });
      var probe = moving[0], c = [0, 0]; probe.f.forEach(function(p){ c[0] += p[0] / probe.f.length; c[1] += p[1] / probe.f.length; });
      var p0 = place(probe, c, g), p1 = rotA(p0, F.o, F.d, .2);
      if((p1[2] - p0[2]) * F.up < 0) F.ang = -F.ang;
      moving.forEach(function(pc){ pc.m.push(F.id); });
    });
  })();
  // 每块切成小三角，画家算法排序才不会穿插
  var tris = [];
  (function(){
    function split(t, pc){
      var e = [0, 1, 2].map(function(i){ var a = t[i], b = t[(i + 1) % 3]; return Math.hypot(a[0] - b[0], a[1] - b[1]); });
      var mx = Math.max.apply(null, e);
      if(mx < .34){ tris.push({t: t, pc: pc}); return; }
      var i = e.indexOf(mx), a = t[i], b = t[(i + 1) % 3], c = t[(i + 2) % 3], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      split([a, m, c], pc); split([m, b, c], pc);
    }
    pieces.forEach(function(pc){
      var area = 0; pc.f.forEach(function(p, i){ var q = pc.f[(i + 1) % pc.f.length]; area += p[0] * q[1] - q[0] * p[1]; });
      if(area < 0) pc.f.reverse();         // 统一成逆时针，方便判断正反面
      for(var i = 1; i < pc.f.length - 1; i++) split([pc.f[0], pc.f[i], pc.f[i + 1]], pc);
    });
  })();
  function pieceAt(pt){
    for(var i = 0; i < pieces.length; i++){
      var f = pieces[i].f, inside = true;
      for(var j = 0; j < f.length; j++){ var a = f[j], b = f[(j + 1) % f.length]; if((b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]) < -1e-6){ inside = false; break; } }
      if(inside) return pieces[i];
    }
    return pieces[0];
  }

  /* ================= 纸面纹理：他的名字和 20 篇文章的题目 ================= */
  var TW = 720, TH = 1008, tex = document.createElement('canvas'); tex.width = TW; tex.height = TH;
  function paintTex(){
    var g = tex.getContext('2d'), ff = getComputedStyle(document.body).fontFamily;
    g.fillStyle = '#f2ede4'; g.fillRect(0, 0, TW, TH);
    g.strokeStyle = 'rgba(120,100,80,.15)'; g.lineWidth = 2;
    for(var y = 236; y < TH - 50; y += 36){ g.beginPath(); g.moveTo(36, y); g.lineTo(TW - 36, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,91,58,.5)'; g.beginPath(); g.moveTo(88, 26); g.lineTo(88, TH - 26); g.stroke();
    g.fillStyle = '#1d1b1a'; g.font = '600 84px ' + ff; g.fillText(t('陈鹏飞'), 112, 150);
    g.fillStyle = '#ff5b3a'; g.fillRect(112 + g.measureText(t('陈鹏飞')).width + 10, 132, 15, 15);
    g.font = '22px ' + ff; g.fillStyle = '#5d564f';
    ME.articles.slice().reverse().forEach(function(a, i){ var t = a.s; while(g.measureText(t).width > TW - 160 && t.length > 2) t = t.slice(0, -2) + '…'; g.fillText(t, 112, 228 + i * 36); });
    g.font = '18px ui-monospace, Menlo, monospace'; g.fillStyle = '#a0968b';
    g.fillText(ME.reading.books + ' BOOKS · ' + ME.reading.hours + ' H · ' + ME.articles.length + ' ESSAYS', 112, TH - 30);
  }
  paintTex(); if(document.fonts) document.fonts.ready.then(function(){ paintTex(); kick(); });

  /* ================= 文字层 ================= */
  var NCH = S.folds.length, COLORS = S.folds.map(function(f){ return f.color; });
  function cite(r, cls){ return '<a class="' + (cls || 'cite') + '" href="' + esc(r.href) + '">' + qh(r) + '<span>' + esc(r.s) + t('（中文）') + ' ↗</span></a>'; }
  $('hero-line').textContent = S.hero.line;
  $('hero-q').outerHTML = cite(S.hero.q);
  $('labels').innerHTML = S.folds.map(function(f, i){
    return '<li style="--c:' + f.color + '"><a href="#ch' + (i + 1) + '" data-i="' + i + '"><b>' + String(i + 1).padStart(2, '0') + '</b>' + esc(f.title) + '</a></li>'; }).join('');
  $('chs').innerHTML = S.folds.map(function(f, i){
    return '<div class="o o-ch" data-s="' + (i + 2) + '" style="--c:' + f.color + '">' +
      '<p class="kick"><b>' + t('折痕') + ' ' + String(i + 1).padStart(2, '0') + '</b>' + esc(f.years) + '</p>' +
      '<h2>' + esc(f.title) + '</h2>' +
      '<p class="ft">' + t('从') + '<s>' + esc(f.from) + '</s><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg><em>' + esc(f.to) + '</em></p>' +
      '<ul class="refs">' + f.refs.map(function(r, j){ return '<li><a href="' + esc(r.href) + '" data-c="' + i + '" data-r="' + j + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>' + esc(r.s) + '</a></li>'; }).join('') + '</ul>' +
      '<p class="step">' + t('第 {n} 步 · ').replace('{n}', i + 1) + esc(f.step) + '</p>' +
      '<blockquote class="mq">' + qh(f.q) + '<a href="' + esc(f.q.href) + '">' + esc(f.q.s) + t('（中文）') + ' ↗</a></blockquote></div>'; }).join('');
  $('ch-spacers').innerHTML = S.folds.map(function(f, i){ return '<section class="s" id="ch' + (i + 1) + '" data-s="' + (i + 2) + '" aria-label="' + esc(f.title) + '"></section>'; }).join('');
  $('wl').innerHTML = S.ways.map(function(w, i){ return '<li data-w="' + i + '"><button type="button" data-w="' + i + '"><b>' + String(i + 1).padStart(2, '0') + '</b>' + esc(w.title) + '</button></li>'; }).join('');
  $('end-q').innerHTML = qh(S.end.q);
  $('end-a').outerHTML = '<a class="cite" href="' + esc(S.end.q.href) + '">' + esc(S.end.q.s) + t('（中文）') + ' ↗</a>';

  var card = {q: $('card-q'), a: $('card-a'), key: ''};
  function showCard(r, key, color){
    if(card.key === key) return; card.key = key;
    $('card').style.setProperty('--c', color || '#ff5b3a');
    $('card').classList.remove('swap'); void $('card').offsetWidth; $('card').classList.add('swap');
    card.q.innerHTML = qh(r);
    card.a.href = r.href; card.a.innerHTML = esc(r.t) + '<span>' + t('原文 ↗') + '</span>';
  }

  /* ================= 舞台 ================= */
  var cv = $('cv'), ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, raf = 0, t0 = performance.now();
  var hush = false, introAt = performance.now();
  var secs = [], T = 0, Tshown = -1, gPrev = STEPS.map(function(){ return 1; }), wayI = 0, wayHover = -1, labelHover = -1, mx = 0, my = 0;
  function measure(){ secs = Array.prototype.slice.call(document.querySelectorAll('main .s')); }
  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; measure(); onScroll();
  }
  // 当前滚动位置 → 连续的「节拍」T：第 i 节的中线经过屏幕中线时 T = i + 0.5
  function readT(){
    var mid = H * .5, t = 0;
    for(var i = 0; i < secs.length; i++){
      var r = secs[i].getBoundingClientRect();
      if(r.top <= mid){ t = +secs[i].dataset.s + clamp((mid - r.top) / r.height, 0, 1); }
    }
    return t;
  }
  // 每一步折到哪了：首屏是折好的飞机；第 1 节拆开（倒着一步步展开）；之后每一章折一步
  function stepsAt(t){
    return STEPS.map(function(_, s){
      if(t < 1.05) return 1;
      if(t < 2) return 1 - ease(clamp((t - 1.05 - (5 - s) * .07) / .1, 0, 1));
      return ease(clamp((t - (2 + s) - .12) / .5, 0, 1));
    });
  }
  // 姿态关键帧：[绕 x, 绕 y, 绕 z, 中心 x 占宽, 中心 y 占高, 大小]
  var POSE = {
    fly:  [PI + .75, -.35, PI / 2 + .45, .66, .48, 1.05],
    flat: [-.08, .06, 0, .5, .5, .92],
    fold: [-.5, .3, .05, .58, .5, .95],
    show: [PI + .9, .45, PI / 2 + .3, .62, .52, 1],
    ways: [PI + 1, .5, PI / 2 + .3, .58, .56, 1]
  };
  function mix(A, B, k){ return A.map(function(v, i){ return lerp(v, B[i], k); }); }
  function poseAt(t, now){
    var p, mob = W < 760;
    if(t < 1.05) p = POSE.fly.slice();
    else if(t < 1.9) p = mix(POSE.fly, POSE.flat, ease(clamp((t - 1.05) / .55, 0, 1)));
    else if(t < 6) p = mix(POSE.flat, POSE.fold, ease(clamp((t - 1.9) / .5, 0, 1)));
    else if(t < 8) p = mix(POSE.fold, POSE.show, ease(clamp((t - 6) / 1.4, 0, 1)));
    else p = mix(POSE.show, POSE.ways, ease(clamp((t - 8) / .4, 0, 1)));
    var sec = now / 1000, idle = reduce ? 0 : 1;
    if(t < 1.05){ p[0] += Math.sin(sec * 1.2) * .06 * idle + my * .12; p[1] += mx * .2; p[2] += Math.sin(sec * .8) * .05 * idle; }
    if(t >= 8){ p[1] += Math.sin(sec * .5) * .35 * idle; }  // 展示台上慢慢转
    if(mob){ p[3] = .5; p[4] = t < 1.05 ? .62 : t < 2 ? .44 : .36; p[5] *= .95; }
    return p;
  }
  function rot(p, a, b, c){
    var x = p[0], y = p[1], z = p[2], t;
    t = y * Math.cos(a) - z * Math.sin(a); z = y * Math.sin(a) + z * Math.cos(a); y = t;
    t = x * Math.cos(b) + z * Math.sin(b); z = -x * Math.sin(b) + z * Math.cos(b); x = t;
    t = x * Math.cos(c) - y * Math.sin(c); y = x * Math.sin(c) + y * Math.cos(c); x = t;
    return [x, y, z];
  }
  function texTri(s, uv){
    var x0 = s[0][0], y0 = s[0][1], x1 = s[1][0], y1 = s[1][1], x2 = s[2][0], y2 = s[2][1];
    var u0 = uv[0][0], v0 = uv[0][1], u1 = uv[1][0], v1 = uv[1][1], u2 = uv[2][0], v2 = uv[2][1];
    var det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0); if(Math.abs(det) < 1e-6) return;
    var a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / det, b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / det;
    var c = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / det, d = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / det;
    var e = x0 - a * u0 - c * v0, f = y0 - b * u0 - d * v0;
    var cx = (x0 + x1 + x2) / 3, cy = (y0 + y1 + y2) / 3;
    ctx.save(); ctx.beginPath();
    for(var i = 0; i < 3; i++){ var dx = s[i][0] - cx, dy = s[i][1] - cy, l = Math.hypot(dx, dy) || 1; ctx[i ? 'lineTo' : 'moveTo'](s[i][0] + dx / l * .8, s[i][1] + dy / l * .8); }
    ctx.closePath(); ctx.clip(); ctx.transform(a, b, c, d, e, f); ctx.drawImage(tex, 0, 0); ctx.restore();
  }
  var uvOf = function(p){ return [(p[0] + 1) / 2 * TW, (HL - p[1]) / (2 * HL) * TH]; };

  // 把纸画出来。opt: {g 每步进度, pose, blue 线稿程度, alpha, ox/oy 平移, s 缩放}
  function renderPlane(c2, g, P, opt){
    var cx = W * P[3] + (opt.ox || 0), cy = H * P[4] + (opt.oy || 0), size = Math.min(W * (W < 760 ? .3 : .19), H * .27) * P[5] * (opt.s || 1);
    var D = 6, L = unit([-.4, .6, .7]), blue = opt.blue || 0;
    var proj = function(q){ var k = D / (D - q[2]); return [cx + q[0] * size * k, cy - q[1] * size * k, q[2]]; };
    var tp = function(pc, pt){ return proj(rot(place(pc, pt, g), P[0], P[1], P[2])); };
    var list = tris.map(function(tr){
      var w = tr.t.map(function(pt){ return rot(place(tr.pc, pt, g), P[0], P[1], P[2]); });
      var e1 = sub(w[1], w[0]), e2 = sub(w[2], w[0]), n = unit(cross(e1, e2));
      var s = w.map(proj), area = (s[1][0] - s[0][0]) * (s[2][1] - s[0][1]) - (s[2][0] - s[0][0]) * (s[1][1] - s[0][1]);
      return {s: s, uv: tr.t.map(uvOf), z: (w[0][2] + w[1][2] + w[2][2]) / 3, front: area < 0, lit: Math.abs(dot(n, L))};
    }).sort(function(a, b){ return a.z - b.z; });
    c2.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
    if(blue < 1 && !opt.noShadow){
      c2.save(); c2.fillStyle = 'rgba(0,0,0,' + (.3 * (1 - blue)) + ')'; c2.filter = 'blur(20px)';
      c2.beginPath(); c2.ellipse(cx, cy + size * 1.25, size * 1.05, size * .13, 0, 0, PI * 2); c2.fill(); c2.restore();
    }
    list.forEach(function(f){
      var s = f.s;
      if(blue < 1){
        if(f.front) texTri(s, f.uv);
        c2.beginPath(); c2.moveTo(s[0][0], s[0][1]); c2.lineTo(s[1][0], s[1][1]); c2.lineTo(s[2][0], s[2][1]); c2.closePath();
        if(!f.front){ c2.fillStyle = '#e6dfd3'; c2.fill(); }
        c2.fillStyle = 'rgba(24,18,12,' + ((1 - f.lit) * .5).toFixed(3) + ')'; c2.fill();
        c2.strokeStyle = c2.fillStyle; c2.lineWidth = .6; c2.stroke();
      }
    });
    // 折痕和纸边
    pieces.forEach(function(pc){
      c2.beginPath(); pc.f.forEach(function(pt, i){ var q = tp(pc, pt); c2[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); c2.closePath();
      if(blue > 0){ c2.fillStyle = 'rgba(242,237,228,' + (.55 * blue) + ')'; c2.fill(); }
      c2.strokeStyle = 'rgba(60,50,40,' + (.28 - .12 * blue) + ')'; c2.lineWidth = .8; c2.stroke();
    });
    if(blue > 0){                          // 线稿：纸的外框描深
      var pc0 = pieceAt([0, 0]);
      c2.beginPath(); [[-1, -HL], [1, -HL], [1, HL], [-1, HL]].forEach(function(pt, i){ var q = tp(pieceAt([pt[0] * .99, pt[1] * .99]), pt); c2[i ? 'lineTo' : 'moveTo'](q[0], q[1]); }); c2.closePath();
      c2.strokeStyle = 'rgba(29,27,26,' + (.8 * blue) + ')'; c2.lineWidth = 1.4; c2.stroke();
    }
    c2.globalAlpha = 1;
    return {cx: cx, cy: cy, size: size, tp: tp};
  }

  function ring(R, cx, cy, prog, lit, alpha){
    ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = alpha;
    for(var k = 0; k < 144; k++){
      var an = k / 144 * PI * 2 - PI / 2, l1 = R - (k % 12 ? 5 : 12);
      ctx.strokeStyle = k / 144 <= prog ? 'rgba(244,241,236,.6)' : 'rgba(244,241,236,.12)'; ctx.lineWidth = k % 12 ? 1 : 1.6;
      ctx.beginPath(); ctx.moveTo(Math.cos(an) * l1, Math.sin(an) * l1); ctx.lineTo(Math.cos(an) * R, Math.sin(an) * R); ctx.stroke();
    }
    var gap = .05;
    for(var i = 0; i < NCH; i++){
      var a0 = i / NCH * PI * 2 - PI / 2 + gap, a1 = (i + 1) / NCH * PI * 2 - PI / 2 - gap, on = lit[i];
      ctx.strokeStyle = COLORS[i]; ctx.lineCap = 'round';
      ctx.globalAlpha = alpha * (.16 + .84 * on); ctx.lineWidth = 3 + on * 2;
      if(on > .01){ ctx.shadowColor = COLORS[i]; ctx.shadowBlur = 14 * on; }
      ctx.beginPath(); ctx.arc(0, 0, R + 12, a0, a1); ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
  // 从 HTML 标签拉一条折线引到画布上的某一点（animejs 工具箱那种标注线）
  function leader(el, pt, color, alpha, right){
    var r = el.getBoundingClientRect(); if(!r.width) return;
    var y = r.top + r.height / 2, x0 = right ? r.left - 8 : r.right + 8;
    var bend = right ? Math.max(pt[0] + 40, x0 - 160) : Math.min(pt[0] - 40, x0 + 160);
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(bend, y); ctx.lineTo(pt[0], pt[1]); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(pt[0], pt[1], 3.2, 0, PI * 2); ctx.fill(); ctx.restore();
  }

  var BG_D = [37, 36, 35], BG_L = [216, 211, 203];
  var WAY_PT = {nose: [0, HL - .04], wingL: [-.96, -HL + .06], keel: [0, -HL + .2], wingR: [.96, -HL + .06]};
  function draw(now){
    raf = 0;
    var t = T, g = stepsAt(t), P = poseAt(t, now), mob = W < 760;
    // 线稿模式：拆开后的那一节，背景换成米灰色
    var blue = clamp((t - 1.55) / .2, 0, 1) * (1 - clamp((t - 1.93) / .12, 0, 1));
    var bg = BG_D.map(function(v, i){ return Math.round(lerp(v, BG_L[i], blue)); });
    document.documentElement.style.setProperty('--stage', 'rgb(' + bg.join(',') + ')');
    document.body.classList.toggle('lite', blue > .5);
    var vis = 1 - clamp((t - 8.9) / .5, 0, 1);
    $('stage').style.opacity = vis.toFixed(3);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    if(vis <= 0){ settle(g, t); return; }

    var size = Math.min(W * (mob ? .3 : .19), H * .27) * P[5];
    var ringA = clamp((t - 1.9) / .3, 0, 1);
    if(ringA > 0){
      var lit = S.folds.map(function(_, i){ return g[i]; });
      ring(size * (mob ? 1.5 : 1.5), W * P[3], H * P[4], clamp((t - 2) / 7, 0, 1), lit, ringA * (1 - blue));
    }
    // 首屏入场：纸飞机从左下方滑进来（第一次打开、以及点标志回到顶部时）
    var ik = reduce ? 1 : clamp((now - introAt) / 1400, 0, 1), ie = eout(ik), hero = t < 1.05 ? 1 : 0;
    P[2] += hero * (1 - ie) * .3;
    var R = renderPlane(ctx, g, P, {blue: blue, ox: hero * (1 - ie) * -W * .7, oy: hero * (1 - ie) * H * .3});
    if(ik < 1 && hero) kick();

    // 拆开那一节：六道折痕编号，引线连到标签
    if(blue > 0){
      creases.forEach(function(list, si){
        var col = COLORS[si], best = null, bl = 0;
        ctx.save(); ctx.globalAlpha = blue; ctx.strokeStyle = col; ctx.lineWidth = labelHover === si ? 3.2 : 2; ctx.setLineDash([7, 5]);
        list.slice().sort(function(a, b){ return Math.hypot(b[1][0] - b[0][0], b[1][1] - b[0][1]) - Math.hypot(a[1][0] - a[0][0], a[1][1] - a[0][1]); }).slice(0, si === 5 ? 2 : si === 3 ? 2 : 1).forEach(function(seg){  // 每步只画最长的折痕，线稿才干净
          var a = R.tp(pieceAt(seg[0]), seg[0]), b = R.tp(pieceAt(seg[1]), seg[1]);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          var l = Math.hypot(b[0] - a[0], b[1] - a[1]); if(l > bl){ bl = l; best = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
        });
        ctx.restore();
        var el = document.querySelector('#labels li:nth-child(' + (si + 1) + ')');
        if(best && el && !mob) leader(el, best, labelHover === si ? col : 'rgba(40,36,32,.55)', blue, si >= 3);
      });
    }
    // 展示台：四种想法从机身各部位引出
    var wa = clamp((t - 8.05) / .3, 0, 1) * vis;
    if(wa > 0 && !mob){
      S.ways.forEach(function(w, i){
        var pt = WAY_PT[w.part], q = R.tp(pieceAt(pt), pt), el = document.querySelector('#wl li:nth-child(' + (i + 1) + ')');
        var hot = i === (wayHover >= 0 ? wayHover : wayI);
        leader(el, q, hot ? '#ff5b3a' : 'rgba(244,241,236,.38)', wa, i % 2 === 1);
      });
    }
    settle(g, t);
    if(!reduce && (t < 1.05 || t >= 8)) kick();
  }
  // 折完一步时咔嗒一声；拆开时轻一点；折的过程中有沙沙声
  function settle(g, t){
    if(hush){ gPrev = g; Tshown = t; Snd.rustle(0); return; }
    var dv = 0;
    g.forEach(function(v, i){
      dv += Math.abs(v - gPrev[i]);
      if(gPrev[i] < .97 && v >= .97 && t > 1.9){ Snd.crease(); Snd.note(i); }
      if(gPrev[i] > .03 && v <= .03 && t < 2){ Snd.crease(true); }
    });
    gPrev = g; Snd.rustle(dv * 2.2);
    var tk = Math.floor(t * 8); if(Tshown >= 0 && tk !== Math.floor(Tshown * 8) && t > .9 && t < 9) Snd.tick();
    Tshown = t;
  }
  function kick(){ if(!raf) raf = requestAnimationFrame(draw); }

  /* ================= 文字层随滚动切换 ================= */
  var curS = -1;
  function overlay(t){
    var s = Math.floor(t), local = t - s;
    if(t >= 9) s = 99;
    if(s !== curS){
      curS = s;
      document.querySelectorAll('#ov .o').forEach(function(o){ o.classList.toggle('on', +o.dataset.s === s); });
      $('labels').classList.toggle('on', s === 1);
      $('wl').classList.toggle('on', s === 8);
      if(s >= 2 && s <= 7){ var f = S.folds[s - 2]; showCard(f.q, 'c' + s, f.color); }
      if(s === 8) showWay(wayI, true);
      $('card').classList.toggle('on', s >= 2 && s <= 8); $('card').classList.toggle('w', s === 8);
      document.querySelectorAll('.bar nav a').forEach(function(a){
        var h = a.getAttribute('href'); a.classList.toggle('on', (h === '#folds' && s >= 1 && s <= 7) || (h === '#ways' && s === 8));
      });
    }
    $('scrub-p').style.setProperty('--p', clamp((t - 2) / 7, 0, 1).toFixed(4));
    $('ov').style.setProperty('--lo', local.toFixed(3));
  }
  function showWay(i, force){
    if(i === wayI && !force && card.key === 'w' + i) return;
    wayI = i; var w = S.ways[i], r = w.refs[0];
    document.querySelectorAll('#wl li').forEach(function(li){ li.classList.toggle('hot', +li.dataset.w === i); });
    showCard(r, 'w' + i, '#ff5b3a'); kick();
  }
  // 「想法」那一节：每 4 秒换一种，悬停时停住
  setInterval(function(){
    if(curS !== 8 || wayHover >= 0) return;
    var w = S.ways[wayI], k = (card.ref || 0) + 1;
    if(k < w.refs.length){ card.ref = k; card.key = ''; showCard(w.refs[k], 'w' + wayI + k, '#ff5b3a'); }
    else { card.ref = 0; showWay((wayI + 1) % S.ways.length); Snd.blip(wayI); }
  }, 3600);

  function onScroll(){ T = readT(); overlay(T); kick(); }
  addEventListener('scroll', onScroll, {passive: true});
  addEventListener('resize', resize);
  addEventListener('pointermove', function(e){ mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; });

  // 悬停章节里的出处：右下角卡片换成那句原话
  document.addEventListener('pointerover', function(e){
    var a = e.target.closest('.refs a');
    if(a){ var f = S.folds[+a.dataset.c]; showCard(f.refs[+a.dataset.r], 'r' + a.dataset.c + a.dataset.r, f.color); Snd.blip(+a.dataset.r + 2); return; }
    var lb = e.target.closest('#labels a'); labelHover = lb ? +lb.dataset.i : -1; if(lb) Snd.blip(labelHover);
    var wb = e.target.closest('#wl button'); if(wb){ wayHover = +wb.dataset.w; card.ref = 0; showWay(wayHover); Snd.blip(wayHover); } else if(!e.target.closest('#card')) wayHover = -1;
    kick();
  });
  document.addEventListener('pointerout', function(e){ if(e.target.closest('.refs a') && curS >= 2 && curS <= 7){ var f = S.folds[curS - 2]; showCard(f.q, 'c' + curS, f.color); } });
  $('wl').addEventListener('click', function(e){ var b = e.target.closest('button'); if(b){ wayHover = +b.dataset.w; card.ref = 0; showWay(wayHover); } });

  // 声音开关
  function syncSnd(){
    var on = Snd.on();
    $('snd').setAttribute('aria-pressed', on ? 'true' : 'false');
    document.querySelectorAll('[data-snd] span').forEach(function(s){ s.textContent = t(on ? '声音已打开' : '打开声音再往下'); });
    document.body.classList.toggle('snd-on', on);
  }
  function toggleSnd(){ Snd.set(!Snd.on()); syncSnd(); if(Snd.on()) setTimeout(function(){ Snd.crease(); Snd.note(2); }, 60); }
  $('snd').addEventListener('click', toggleSnd);
  document.querySelectorAll('[data-snd]').forEach(function(b){ b.addEventListener('click', toggleSnd); });
  // 浏览器要等访客第一次点击、触摸或按键才让声音响（滚动不算）
  ['pointerdown', 'keydown', 'touchend'].forEach(function(ev){ addEventListener(ev, function(){ Snd.wake(); }, {once: true}); });
  syncSnd();

  /* ================= 索引：关键词 → 哪几篇、哪一句 ================= */
  (function(){
    var Wd = ME.words, maxN = Wd[0].n, old = ME.articles.slice().reverse(), cur = -1;
    $('cloud').innerHTML = Wd.map(function(w, i){
      var k = Math.sqrt(w.n / maxN);
      return '<button type="button" data-i="' + i + '" style="--k:' + k.toFixed(3) + ';--d:' + (i * 45) + 'ms">' + (w.en ? esc(w.en) + '<small lang="zh-CN">' + esc(w.w) + '</small>' : esc(w.w)) + '<sup>' + w.n + '</sup></button>'; }).join('');
    $('strip').innerHTML = old.map(function(a){ return '<a href="a/' + a.id + '.html" data-id="' + a.id + '" title="' + esc(a.t) + '"><i></i></a>'; }).join('');
    $('strip-a').textContent = (old[0].date || '').slice(0, 7); $('strip-b').textContent = (old[old.length - 1].date || '').slice(0, 7);
    var byId = {}; ME.articles.forEach(function(a){ byId[a.id] = a; });
    function pick(i){
      cur = i; var w = Wd[i], mx = 1;
      $('cloud').querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', +b.dataset.i === i ? 'true' : 'false'); });
      var hit = {}; w.hits.forEach(function(h){ hit[h.id] = h; if(h.n > mx) mx = h.n; });
      $('strip').querySelectorAll('a').forEach(function(a, j){
        var h = hit[a.dataset.id]; a.style.setProperty('--v', h ? (.18 + .82 * h.n / mx).toFixed(3) : 0); a.style.setProperty('--d', j * 22 + 'ms');
        a.classList.toggle('on', !!h); a.href = h ? h.href : 'a/' + a.dataset.id + '.html';
        a.title = byId[a.dataset.id].t + (h ? t('：{n} 次').replace('{n}', h.n) : '');
      });
      var re = new RegExp(w.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      $('hits').innerHTML = '<li class="sum">' + t('<b>{w}</b>出现 {n} 次，在 {m} 篇文章里').replace('{w}', w.en ? '“' + esc(w.en) + '” ' + esc(w.w) : '「' + esc(w.w) + '」').replace('{n}', w.n).replace('{m}', w.hits.length) + '</li>' +
        w.hits.slice().sort(function(a, b){ return b.n - a.n; }).map(function(h, j){ return '<li' + (j >= 5 ? ' class="more"' : '') + '><a href="' + esc(h.href) + '"><span class="n">' + h.n + '</span><span class="hs" lang="zh-CN">…' + esc(h.s).replace(re, '<mark>$&</mark>') + '…</span><span class="t">' + esc(byId[h.id].s) + ' ↗</span></a></li>'; }).join('') +
        (w.hits.length > 5 ? '<li class="all"><button type="button">' + t('看全部 {n} 篇').replace('{n}', w.hits.length) + '</button></li>' : '');
      $('hits').classList.remove('open');
    }
    $('cloud').addEventListener('click', function(e){ var b = e.target.closest('button'); if(b){ pick(+b.dataset.i); Snd.note(+b.dataset.i); } });
    $('hits').addEventListener('click', function(e){ if(e.target.closest('.all button')){ $('hits').classList.add('open'); Snd.blip(3); } });
    $('cloud').addEventListener('pointerover', function(e){ var b = e.target.closest('button'); if(b && +b.dataset.i !== cur) Snd.blip(+b.dataset.i); });
    pick(0);
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ $('index').classList.add('in'); io.disconnect(); } }); }, {threshold: .2});
    io.observe($('index'));
  })();

  /* ================= 读书：一个点 = 一个小时 ================= */
  (function(){
    var R = ME.reading, c = $('dots'), g = c.getContext('2d'), pts = [], cw = 0, ch = 0, start = -1, origin = [0, 0];
    var YC = {'2018': '#6f6a64', '2019': '#6f6a64', '2021': '#8f8983', '2022': '#b48cff', '2023': '#4f8cff', '2024': '#2fd3a4', '2025': '#ff5b3a', '2026': '#f5a524'};
    $('r-h').textContent = t('{n} 个小时').replace('{n}', R.hours);
    var seq = []; R.years.forEach(function(y){ for(var i = 0; i < Math.round(y.h); i++) seq.push(y.y); });
    $('rfacts').innerHTML = '<div class="leg">' + R.years.filter(function(y){ return Math.round(y.h) > 0; }).map(function(y){ return '<span><i style="background:' + (YC[y.y] || '#8f8983') + '"></i>' + y.y + '<em>' + Math.round(y.h) + '</em></span>'; }).join('') + '</div>' +
      '<p class="nums"><span><b>' + R.books + '</b>' + t('本书') + '</span><span><b>' + R.notes + '</b>' + t('条笔记') + '</span><span><b>' + R.days + '</b>' + t('天在读') + '</span></p>' +
      '<p class="top">' + t('读得最久：') + R.top.map(function(b){ return '《' + esc(b.t) + '》' + t('{n} 小时').replace('{n}', b.h); }).join(' · ') + '</p>';
    function layout(){
      var w = c.clientWidth, cols = w < 560 ? 15 : 24, gap = w / cols, rows = Math.ceil(seq.length / cols);
      var d = Math.min(2, devicePixelRatio || 1); cw = w; ch = rows * gap; c.width = w * d; c.height = ch * d; c.style.height = ch + 'px'; g.setTransform(d, 0, 0, d, 0, 0);
      pts = seq.map(function(y, i){ return {x: (i % cols + .5) * gap, y: (Math.floor(i / cols) + .5) * gap, r: gap * .3, c: YC[y] || '#8f8983'}; });
      paint(performance.now());
    }
    function paint(now){
      g.clearRect(0, 0, cw, ch);
      var el = start < 0 ? 0 : (now - start) / 1000, busy = false;
      pts.forEach(function(p){
        var dd = Math.hypot(p.x - origin[0], p.y - origin[1]) / Math.max(cw, ch), k = start < 0 ? 0 : clamp((el - dd * 1.1) / .55, 0, 1);
        if(k < 1 && start >= 0) busy = true;
        var s = start < 0 ? .25 : (k < .5 ? eout(k * 2) * 1.6 : lerp(1.6, 1, eout((k - .5) * 2)));
        g.globalAlpha = start < 0 ? .25 : .25 + .75 * Math.min(1, k * 2);
        g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, Math.max(.5, p.r * s), 0, PI * 2); g.fill();
      });
      g.globalAlpha = 1;
      if(busy && !reduce) requestAnimationFrame(paint);
    }
    function ripple(x, y){ origin = [x, y]; start = reduce ? -1e9 : performance.now(); requestAnimationFrame(paint); }
    c.addEventListener('click', function(e){ var r = c.getBoundingClientRect(); ripple(e.clientX - r.left, e.clientY - r.top); Snd.note(5); });
    var lastTick = 0;
    c.addEventListener('pointermove', function(e){ var n = performance.now(); if(n - lastTick > 90){ lastTick = n; Snd.tick(); } });
    addEventListener('resize', layout); layout();
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ ripple(0, 0); io.disconnect(); } }); }, {threshold: .35});
    io.observe(c);
  })();

  /* ================= 结尾：纸飞机飞走 ================= */
  (function(){
    var c = $('fly'), g = c.getContext('2d'), start = -1, done = STEPS.map(function(){ return 1; }), trail = [], w = 0, h = 0;
    function size(){ var d = Math.min(2, devicePixelRatio || 1), r = c.getBoundingClientRect(); w = r.width; h = r.height; c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0); }
    function frame(now){
      var k = clamp((now - start) / 3200, 0, 1);
      g.clearRect(0, 0, w, h);
      // 路径：从左下方滑进来，在中间稍停，再加速冲向右上角
      var u = k < .45 ? eout(k / .45) * .5 : .5 + Math.pow((k - .45) / .55, 2.2) * .5;
      var x = lerp(-.15, 1.25, u) * w, y = h * (.7 - Math.sin(u * PI * .9) * .25 - Math.max(0, u - .5) * .9);
      var s = lerp(.55, .55 + (u > .5 ? (u - .5) * 1.4 : 0), 1);
      trail.push([x, y]); if(trail.length > 90) trail.shift();
      g.save(); g.setLineDash([2, 9]); g.strokeStyle = 'rgba(244,241,236,.35)'; g.lineWidth = 1.5; g.beginPath();
      trail.forEach(function(p, i){ g[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); g.stroke(); g.restore();
      var bank = Math.sin(now / 400) * .08 + (u > .5 ? -(u - .5) * .9 : 0);
      var P = [PI + .75 + bank, -.35 + (u - .5) * .4, PI / 2 + .45 + (u > .5 ? (u - .5) * .5 : 0), 0, 0, 1];
      var W0 = W, H0 = H; W = w; H = h;
      renderPlane(g, done, P, {ox: x, oy: y, s: s * (w < 760 ? 1.2 : 1.1), noShadow: true});
      W = W0; H = H0;
      if(k < 1) requestAnimationFrame(frame); else c.classList.add('gone');
    }
    function go(){
      size(); trail = []; c.classList.remove('gone'); start = performance.now(); Snd.whoosh();
      if(reduce){ g.clearRect(0, 0, w, h); return; }
      requestAnimationFrame(frame);
    }
    $('again').addEventListener('click', go);
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ go(); io.disconnect(); } }); }, {threshold: .45});
    io.observe($('end'));
  })();

  /* 站内跳转：不让滚动带着折纸动画快速倒放。先暗场，瞬间跳到目标位置，再亮起来 */
  var veil = document.createElement('div'); veil.className = 'veil'; veil.setAttribute('aria-hidden', 'true'); document.body.appendChild(veil);
  var LAND = {1: .75, 8: .35};             // 落在每节的什么位置：拆开那节要停在线稿，章节停在这一步刚折完
  function jump(hash){
    var el = hash === '#top' ? null : document.querySelector(hash); if(hash !== '#top' && !el) return;
    hush = true; veil.classList.add('on'); Snd.swish();
    setTimeout(function(){
      var html = document.documentElement, sb = html.style.scrollBehavior, y = 0;
      html.style.scrollBehavior = 'auto';
      if(el){
        var r = el.getBoundingClientRect(), top = r.top + scrollY;
        y = el.matches('main .s') ? top - H / 2 + (LAND[el.dataset.s] || .72) * el.offsetHeight : top;
      }
      scrollTo({top: Math.max(0, y), behavior: 'instant'}); history.replaceState(null, '', hash === '#top' ? location.pathname : hash);
      if(!el) introAt = performance.now();
      onScroll(); draw(performance.now());
      requestAnimationFrame(function(){ veil.classList.remove('on'); html.style.scrollBehavior = sb; setTimeout(function(){ hush = false; }, 450); });
    }, reduce ? 0 : 320);
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]'); if(!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var h = a.getAttribute('href'); if(h.length < 2) return;
    e.preventDefault(); jump(h);
  });

  // 调试：window.__me.at(T) 把舞台跳到某个节拍
  window.__me = {at: function(t){ T = t; overlay(t); draw(performance.now()); }, POSE: POSE, pieces: pieces, tris: tris, creases: creases};
  resize();
})();
