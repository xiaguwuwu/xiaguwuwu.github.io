// 三个版本共用：经历地图、吉祥物「阿鹏」。在 core.js 之后加载。
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- 经历地图：中国地图上，飞机按时间飞过每一站；右边是行程单，点城市或行程看经历，可以切回列表 ---------- */
  var sec = $('exp-sec'), list = $('exp');
  if(sec && list && window.CITIES && window.ROUTE){
    var C = window.CITIES, R = window.ROUTE, EXP = window.EXP;
    // 等距圆柱投影，按北纬 36° 压缩经度。整张中国地图（含南海诸岛）都画出来，
    // 但视口只聚焦成都、西安、杭州、上海这一片；角上的小地图显示整张中国和当前聚焦的范围。
    // S 取值让聚焦区在桌面宽度下大约 1 个单位 = 1px，点、字、线的尺寸可以直接按像素写。
    var K = Math.cos(36 * Math.PI / 180), S = 34, LON0 = 73, LON1 = 136, LAT0 = 3, LAT1 = 54;
    var VW = Math.round((LON1 - LON0) * K * S), VH = (LAT1 - LAT0) * S;
    var X = function(lon){ return (lon - LON0) * K * S; }, Y = function(lat){ return (LAT1 - lat) * S; };
    var FOCUS = [X(101.6), Y(36.4), X(124.2) - X(101.6), Y(28.6) - Y(36.4)], FULL = [0, 0, VW, VH];
    var vb = function(b){ return b.map(function(v){ return v.toFixed(1); }).join(' '); };
    var byCity = {}; EXP.forEach(function(e){ (byCity[e.city] = byCity[e.city] || []).push(e); });
    var stopOrg = function(r){ for(var i = 0; i < EXP.length; i++) if(EXP[i].city === r.city && EXP[i].time.indexOf(r.when) === 0) return EXP[i]; return null; };
    var PLANE = '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>';
    var TICKET = '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>';

    var head = sec.querySelector('.sec-h');
    head.insertAdjacentHTML('beforeend', '<div class="seg" role="tablist" aria-label="经历的展示方式">' +
      '<button type="button" role="tab" data-v="map" aria-selected="true">地图</button><button type="button" role="tab" data-v="list" aria-selected="false">列表</button></div>');
    list.insertAdjacentHTML('beforebegin', '<div class="xmap" id="xmap"><div class="xm-stage">' +
      '<button type="button" class="xm-replay" aria-label="重播路线" title="重播路线"><svg viewBox="0 0 24 24" aria-hidden="true">' + TICKET + '</svg></button>' +
      '</div><div class="xm-side"></div></div>');
    var map = $('xmap'), stage = map.querySelector('.xm-stage'), side = map.querySelector('.xm-side');

    // 航段：相邻两站之间一段向北拱起的弧线
    var segs = '';
    for(var i = 1; i < R.length; i++){
      var a = C[R[i - 1].city], b = C[R[i].city], x1 = X(a.lon), y1 = Y(a.lat), x2 = X(b.lon), y2 = Y(b.lat);
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy), bend = Math.max(9, len * .26);
      segs += '<path class="xm-seg" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q' + (mx + dy / len * bend).toFixed(1) + ' ' + (my - dx / len * bend).toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" pathLength="1"/>';
    }
    var order = []; R.forEach(function(r){ if(order.indexOf(r.city) < 0) order.push(r.city); });
    var LBL = {'成都': [0, 26, 'middle'], '西安': [12, 4, 'start'], '上海': [12, -2, 'start'], '杭州': [-10, 14, 'end']};
    var pins = order.map(function(name){
      var c = C[name], l = LBL[name] || [12, 4, 'start'];
      return '<g class="xm-pin" tabindex="0" role="button" data-city="' + name + '" aria-label="' + name + '：' + (byCity[name] || []).map(function(e){ return e.org; }).join('、') + '" transform="translate(' + X(c.lon).toFixed(1) + ' ' + Y(c.lat).toFixed(1) + ')"><g class="pz">' +
        '<circle class="pr" r="12"/><circle class="pc" r="4.5"/><text class="pn" x="' + l[0] + '" y="' + l[1] + '" text-anchor="' + l[2] + '">' + name + '</text></g></g>';
    }).join('');
    var miniK = 120 / VW;
    stage.insertAdjacentHTML('afterbegin', '<svg class="xm-main" preserveAspectRatio="xMidYMid slice" viewBox="' + vb(reduce ? FOCUS : FULL) + '" style="aspect-ratio:' + FOCUS[2].toFixed(0) + ' / ' + FOCUS[3].toFixed(0) + '" role="img" aria-label="经历地图：成都、西安、上海、杭州">' +
      '<g class="xm-land" id="xm-land-g"></g><g class="xm-route">' + segs + '</g>' + pins +
      '<g class="xm-plane" aria-hidden="true"><g class="pz"><g transform="translate(-11 -11) scale(.92)">' + PLANE + '</g></g></g></svg>' +
      '<div class="xm-mini" aria-hidden="true"><svg viewBox="' + vb(FULL) + '"><use href="#xm-land-g"/>' +
      '<rect x="' + FOCUS[0].toFixed(0) + '" y="' + FOCUS[1].toFixed(0) + '" width="' + FOCUS[2].toFixed(0) + '" height="' + FOCUS[3].toFixed(0) + '" rx="' + (3 / miniK).toFixed(0) + '" stroke-width="' + (1.5 / miniK).toFixed(0) + '"/></svg></div>');
    var svg = stage.querySelector('.xm-main'), plane = svg.querySelector('.xm-plane'), segEls = [].slice.call(svg.querySelectorAll('.xm-seg'));

    // 底图：整张中国地图（含台湾、南海诸岛和断续线），原样绘制，不简化不改动
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json').then(function(r){ if(!r.ok) throw r.status; return r.json(); }).then(function(geo){
      var ring = function(rg){ return 'M' + rg.map(function(p){ return X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('L') + 'Z'; };
      var land = '', jd = '';
      geo.features.forEach(function(f){
        var polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates, d = '';
        polys.forEach(function(poly){ poly.forEach(function(rg){ d += ring(rg); }); });
        if(String(f.properties.adcode).indexOf('JD') >= 0) jd += '<path class="jd" d="' + d + '"/>';
        else land += '<path d="' + d + '"><title>' + (f.properties.name || '') + '</title></path>';
      });
      svg.querySelector('.xm-land').innerHTML = land + jd;
    }).catch(function(){ map.classList.add('no-base'); });

    // 右侧：默认是行程单；点城市或行程看那里的经历
    function itinerary(){
      side.innerHTML = '<ol class="xs-trip">' + R.map(function(r, n){ var e = stopOrg(r);
        return '<li><button type="button" data-city="' + r.city + '" data-n="' + n + '"><time>' + r.when + '</time><b>' + r.city + '</b><span>' + (e ? e.org : '') + '</span></button></li>'; }).join('') + '</ol>' +
        '';
    }
    function openCity(name){
      svg.querySelectorAll('.xm-pin').forEach(function(p){ p.classList.toggle('on', p.dataset.city === name); });
      side.innerHTML = '<button type="button" class="xs-back">返回行程</button><p class="xs-city">' + name + '</p>' +
        (byCity[name] || []).map(function(e){ return '<div class="xc-e"><p class="xc-t">' + e.time + '</p><p class="xc-o">' + e.org + '<span>' + e.role + '</span></p><ul>' +
          e.items.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul></div>'; }).join('') +
        '<button type="button" class="xc-list">在列表里看全部经历</button>';
      side.classList.remove('pop'); void side.offsetWidth; side.classList.add('pop');
      if(window.Core && Core.arm) Core.arm(side);
    }
    svg.addEventListener('click', function(e){ var p = e.target.closest('.xm-pin'); if(p) openCity(p.dataset.city); });
    svg.addEventListener('keydown', function(e){ var p = e.target.closest('.xm-pin'); if(p && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); openCity(p.dataset.city); } });
    side.addEventListener('click', function(e){
      var t = e.target.closest('.xs-trip button'); if(t) openCity(t.dataset.city);
      if(e.target.closest('.xs-back')){ itinerary(); mark(-1); svg.querySelectorAll('.xm-pin.on').forEach(function(p){ p.classList.remove('on'); }); }
      if(e.target.closest('.xc-list')) show('list');
    });

    // 飞机沿航段飞：每段画出尾迹，到站时城市点亮、行程单对应一站高亮
    var token = 0;
    function mark(n){ side.querySelectorAll('.xs-trip li').forEach(function(li, i){ li.classList.toggle('now', i === n); li.classList.toggle('done', i < n); }); }
    function place(path, t){
      var L = path.getTotalLength(), p = path.getPointAtLength(L * t), q = path.getPointAtLength(Math.min(L, L * t + .5)), o = path.getPointAtLength(Math.max(0, L * t - .5));
      var ang = Math.atan2(q.y - o.y, q.x - o.x) * 180 / Math.PI + 45;
      plane.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
    }
    function hit(city){ var p = svg.querySelector('.xm-pin[data-city="' + city + '"]'); if(p){ p.classList.add('hit'); p.classList.remove('ping'); void p.getBBox(); p.classList.add('ping'); } }
    function fly(){
      var my = ++token;
      if(side.querySelector('.xs-back')) itinerary();
      svg.querySelectorAll('.xm-pin').forEach(function(p){ p.classList.remove('hit', 'ping'); });
      segEls.forEach(function(s){ s.style.strokeDashoffset = 1; });
      if(reduce){ segEls.forEach(function(s){ s.style.strokeDashoffset = 0; }); order.forEach(hit); place(segEls[segEls.length - 1], 1); mark(R.length - 1); return; }
      map.classList.add('flying'); hit(R[0].city); mark(0);
      var i = 0;
      (function leg(){
        if(my !== token) return;
        if(i >= segEls.length){ map.classList.remove('flying'); return; }
        var path = segEls[i], dur = Math.min(1700, Math.max(900, path.getTotalLength() * 4.2)), t0 = null;
        requestAnimationFrame(function step(ts){
          if(my !== token) return;
          if(!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          path.style.strokeDashoffset = 1 - e; place(path, e);
          if(k < 1) requestAnimationFrame(step);
          else { i++; hit(R[i].city); mark(i); setTimeout(leg, 380); }
        });
      })();
    }
    itinerary(); place(segEls[0], 0);
    map.querySelector('.xm-replay').addEventListener('click', fly);

    // 第一次看到地图：先是整张中国，再推近到这几座城市，然后起飞
    var zoomed = reduce;
    function zoomIn(then){
      if(zoomed){ then(); return; }
      zoomed = true; var t0 = null, dur = 1400;
      requestAnimationFrame(function step(ts){
        if(!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        svg.setAttribute('viewBox', vb(FULL.map(function(v, i){ return v + (FOCUS[i] - v) * e; })));
        if(k < 1) requestAnimationFrame(step); else setTimeout(then, 200);
      });
    }

    var tabs = head.querySelectorAll('.seg button');
    function show(v){
      tabs.forEach(function(t){ t.setAttribute('aria-selected', t.dataset.v === v ? 'true' : 'false'); });
      map.hidden = v !== 'map'; list.hidden = v !== 'list';
      if(v === 'map') zoomIn(fly); else token++;
    }
    tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.v); }); });
    list.hidden = true;
    if('IntersectionObserver' in window){
      var mo = new IntersectionObserver(function(es){ if(es[0].isIntersecting){ setTimeout(function(){ zoomIn(fly); }, 300); mo.disconnect(); } }, {threshold: .35}); mo.observe(map);
    } else zoomIn(fly);
  }

  /* ---------- 吉祥物「阿鹏」：名字取自「鹏飞」的鹏。眼睛跟着鼠标，点它会按你所在的区块给提示 ---------- */
  var TIPS = {
    top: ['你好，我是阿鹏，名字取自「鹏飞」的鹏。点我，我带你逛一圈。', [['先看工作台', '#studio']]],
    wb: ['左边换一个能力模型，右边马上换成那个项目的过程和结果。', [['去看项目', '#projects']]],
    projects: ['点开任意一行，能看到背景、目标、过程和结果图表。', [['去看作品', '#works']]],
    works: ['这些是他做的 AI 视频模板。抽一本出来翻翻，能看到他写的提示词。', [['去看经历', '#exp-sec']]],
    'exp-sec': ['小飞机按时间飞过他待过的城市。点右上角的机票能再飞一遍，点城市看那里的经历。', [['联系我', '#apply']]],
    apply: ['有合适的岗位？点「写邮件给我」，主题和正文都预先写好了。', [['回到顶部', '#top']]]
  };
  var EXTRA = ['我会眨眼，也会一直看着你的鼠标。', '再点我一下，我换个地方站。', '他在找 AI 产品经理的工作，城市不限，随时到岗。'];
  var bird = document.createElement('div');
  bird.className = 'mascot'; bird.innerHTML =
    '<div class="m-bub" role="status" hidden></div>' +
    '<button type="button" class="m-btn" aria-label="吉祥物阿鹏，点一下看提示">' +
    '<svg viewBox="0 0 80 80" aria-hidden="true">' +
      '<ellipse class="m-shadow" cx="40" cy="74" rx="18" ry="3.5"/>' +
      '<g class="m-body">' +
        '<path class="m-wing l" d="M17 40c-9 2-12 10-9 16 6-1 11-5 13-10z"/>' +
        '<path class="m-wing r" d="M63 40c9 2 12 10 9 16-6-1-11-5-13-10z"/>' +
        '<path class="m-crest" d="M36 13c1-6 6-9 9-7-3 1-4 4-3 7z"/>' +
        '<ellipse class="m-skin" cx="40" cy="42" rx="24" ry="26"/>' +
        '<ellipse class="m-belly" cx="40" cy="50" rx="14" ry="13"/>' +
        '<g class="m-eyes"><g class="m-eye"><ellipse cx="31" cy="36" rx="5.2" ry="6"/><circle class="m-pupil" cx="31" cy="36.5" r="2.7"/></g>' +
        '<g class="m-eye"><ellipse cx="49" cy="36" rx="5.2" ry="6"/><circle class="m-pupil" cx="49" cy="36.5" r="2.7"/></g></g>' +
        '<path class="m-beak" d="M35 44h10l-5 6z"/>' +
        '<ellipse class="m-cheek" cx="25" cy="46" rx="3.6" ry="2.2"/><ellipse class="m-cheek" cx="55" cy="46" rx="3.6" ry="2.2"/>' +
      '</g></svg></button>';
  document.body.appendChild(bird);
  var btn = bird.querySelector('.m-btn'), bub = bird.querySelector('.m-bub'), pupils = bird.querySelectorAll('.m-pupil');
  var hideT = 0, extra = 0, lastSec = null, perch = 'r';

  function section(){
    var ids = ['top', 'wb', 'projects', 'works', 'exp-sec', 'apply'], cur = 'top', line = innerHeight * .4;
    ids.forEach(function(id){ var el = $(id); if(el && id !== 'top' && el.getBoundingClientRect().top <= line) cur = id; });
    return cur;
  }
  function say(text, acts, ms){
    clearTimeout(hideT);
    bub.innerHTML = '<p>' + text + '</p>' + (acts && acts.length ? '<div class="m-acts">' + acts.map(function(a){ return '<a href="' + a[1] + '">' + a[0] + '</a>'; }).join('') + '</div>' : '') +
      '<button type="button" class="m-x" aria-label="关闭提示">×</button>';
    bub.hidden = false; bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
    hideT = setTimeout(function(){ bub.hidden = true; }, ms || 7000);
  }
  btn.addEventListener('click', function(){
    if(!reduce){ bird.classList.remove('hop'); void bird.offsetWidth; bird.classList.add('hop'); }
    var s = section();
    if(s === lastSec && !bub.hidden){
      var line = EXTRA[extra++ % EXTRA.length];
      if(line.indexOf('换个地方') >= 0){ perch = perch === 'r' ? 'l' : 'r'; bird.classList.toggle('left', perch === 'l'); }
      say(line);
    } else { var t = TIPS[s] || TIPS.top; say(t[0], t[1]); }
    lastSec = s;
  });
  bub.addEventListener('click', function(e){ if(e.target.closest('.m-x')) bub.hidden = true; if(e.target.closest('.m-acts a')) setTimeout(function(){ bub.hidden = true; }, 300); });
  if(!reduce){
    document.addEventListener('pointermove', function(e){
      var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .45, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 220) * 2.2;
      pupils.forEach(function(p){ p.style.transform = 'translate(' + (dx / d * k).toFixed(2) + 'px,' + (dy / d * k).toFixed(2) + 'px)'; });
    }, {passive: true});
    (function blink(){ setTimeout(function(){ bird.classList.add('blink'); setTimeout(function(){ bird.classList.remove('blink'); blink(); }, 160); }, 2800 + Math.random() * 3200); })();
    // 滚到投递区时挥挥翅膀
    var ap = $('apply');
    if(ap && 'IntersectionObserver' in window) new IntersectionObserver(function(es){ bird.classList.toggle('wave', es[0].isIntersecting); }, {threshold: .5}).observe(ap);
  }
})();
