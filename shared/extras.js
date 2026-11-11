// 三个版本共用：吉祥物「阿鹏」、个人世界入口（经历地图 2026-11-11 删掉了）。在 core.js 之后加载。
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';
  var t = window.t || function(s){ return s; }, EN = window.SITE_LANG === 'en';

  /* ---------- 吉祥物「阿鹏」：名字取自「鹏飞」的鹏。它是这一页的导览：滚到哪个区块就飞过去落在标题旁，落地说一句；点它换一句 ---------- */
  // 每个区块几句话，轮着说。只写页面上有的事实，提到陈鹏飞用「他」；口吻是阿鹏自己的，可以带一点引导。
  var TIPS = {
    top: [['我是阿鹏，「鹏飞」的鹏。他做产品，我带路。往下滑，我跟着你飞。', [['先看工作台', '#wb']]],
          ['护目镜戴好了，随时能起飞。', [['先看工作台', '#wb']]]],
    wb: [['这是他的工作台。左边换一个能力模型，我给你跑一遍对应的项目。', [['去看项目', '#projects']]],
         ['运营、定价、增长、Vibe Coding，四种活儿他都干过。挑一个？', [['去看项目', '#projects']]]],
    projects: [['我最喜欢第 3 个：排队时间被用户叫「骗局」，他改完以后月包 92% 说到做到。', [['去看作品', '#works']]],
               ['6 个项目，每个点进去都是完整案例，有图有数。不信你点。', [['去看作品', '#works']]]],
    works: [['这些视频是他自己写提示词跑出来的。抽一本，提示词夹在里面。', [['去看经历', '#exp-sec']]],
            ['书脊平时是黑白的，碰一下才上色。试试。', [['去看经历', '#exp-sec']]]],
    'exp-sec': [['成都、西安、杭州、上海，这一路我都跟着飞。', [['常见问题', '#faq']]],
                ['本科在电子科大，硕士在西安交大，都是计算机方向。', [['常见问题', '#faq']]]],
    faq: [['常被问到的 8 件事都在这儿，省得你发邮件来问。', [['联系我', '#apply']]],
          ['想知道他有没有技术背景？第 6 条。', [['联系我', '#apply']]]],
    apply: [['都看到这儿了，说明有戏。写封邮件吧，主题和正文他都起好头了。', [['回到顶部', '#top']]],
            ['有合适的岗位就写邮件，我替他盯着邮箱。', [['回到顶部', '#top']]]]
  };
  var EXTRA = ['放着不动我会打瞌睡，别介意。', '他在找 AI 产品经理的工作，城市不限，随时到岗。', '连点我三下试试。'];
  var DIZZY = ['别戳了别戳了，我晕。', '转了一圈，护目镜差点飞出去。'];
  var bird = document.createElement('div');
  bird.className = 'mascot'; bird.innerHTML =
    '<div class="m-bub" role="status" hidden></div>' +
    '<button type="button" class="m-btn" aria-label="' + t('吉祥物阿鹏，点一下看提示') + '">' +
    '<svg viewBox="0 0 80 80" aria-hidden="true">' +
      '<ellipse class="m-shadow" cx="40" cy="76.5" rx="18" ry="3"/>' +
      '<path class="m-heart" d="M40 9c-1.6-3.2-7-2.6-7 1.4 0 3 3.6 5.2 7 8.2 3.4-3 7-5.2 7-8.2 0-4-5.4-4.6-7-1.4z"/>' +
      '<g class="m-body">' +
      '<ellipse class="m-foot" cx="32.5" cy="72.6" rx="4.6" ry="2.5"/><ellipse class="m-foot" cx="47.5" cy="72.6" rx="4.6" ry="2.5"/>' +
      '<path class="m-wing l" d="M15.5 49c-6.8.4-9.6 6.8-7.2 11.6 5.6.2 9.4-4 9.2-8.6z"/>' +
      '<path class="m-wing r" d="M64.5 49c6.8.4 9.6 6.8 7.2 11.6-5.6.2-9.4-4-9.2-8.6z"/>' +
      '<path class="m-crest" d="M40 23c-.4-4.6 1.4-7.8 5-9M40 23c-2-3.4-5-4.6-8-3.8"/>' +
      '<path class="m-skin" d="M40 22.5c17 0 27.5 12 27.5 27 0 14-11.5 22-27.5 22S12.5 63.5 12.5 49.5c0-15 10.5-27 27.5-27z"/>' +
      '<ellipse class="m-belly" cx="40" cy="60.5" rx="16.5" ry="9.6"/>' +
      '<g class="m-eyes"><g class="m-eye"><g class="m-pupil"><ellipse cx="30.5" cy="50" rx="4.5" ry="5.3"/><circle class="m-hl" cx="32.1" cy="48" r="1.9"/><circle class="m-hl" cx="29.2" cy="52.2" r=".8"/></g></g><g class="m-eye"><g class="m-pupil"><ellipse cx="49.5" cy="50" rx="4.5" ry="5.3"/><circle class="m-hl" cx="51.1" cy="48" r="1.9"/><circle class="m-hl" cx="48.2" cy="52.2" r=".8"/></g></g><path class="m-happy" d="M26 51.2q4.5-5.2 9 0M45 51.2q4.5-5.2 9 0"/><path class="m-sleep" d="M26 50q4.5 4.2 9 0M45 50q4.5 4.2 9 0"/></g>' +
      '<path class="m-beak" d="M37.3 55.2q2.7-1.4 5.4 0-1 3.2-2.700 3.200t-2.7-3.2z"/>' +
      '<ellipse class="m-cheek" cx="22.5" cy="57.5" rx="4.4" ry="2.7"/><ellipse class="m-cheek" cx="57.5" cy="57.5" rx="4.4" ry="2.7"/>' +
      '<g class="m-gog"><path class="m-gog-strap" d="M15.5 39.5Q40 26.5 64.5 39.5"/><circle class="m-gog-rim" cx="30.5" cy="33.5" r="7.2"/><circle class="m-gog-rim" cx="49.5" cy="33.5" r="7.2"/><path class="m-gog-bridge" d="M37.5 33.5h5"/><circle class="m-gog-lens" cx="30.5" cy="33.5" r="5"/><circle class="m-gog-lens" cx="49.5" cy="33.5" r="5"/><path class="m-gog-glint" d="M27.8 32.4q.8-1.9 2.7-2.3M46.8 32.4q.8-1.9 2.7-2.3"/></g>' +
      '</g>' +
      '<g class="m-zz"><path d="M58 24h6l-6 7h6"/><path d="M67 12h4.4l-4.4 5.2h4.4"/></g>' +
      '</svg></button>';
  document.body.appendChild(bird);
  var btn = bird.querySelector('.m-btn'), bub = bird.querySelector('.m-bub'), pupils = bird.querySelectorAll('.m-pupil');
  var hideT = 0, lastSec = null, stage = null, turn = {}, spoken = {top: 1}, clicks = [];

  function section(){
    var ids = ['top', 'wb', 'projects', 'works', 'exp-sec', 'faq', 'apply'], cur = 'top', line = innerHeight * .4;
    ids.forEach(function(id){ var el = $(id); if(el && id !== 'top' && el.getBoundingClientRect().top <= line) cur = id; });
    return cur;
  }
  function say(text, acts, ms){
    clearTimeout(hideT);
    bub.innerHTML = '<p>' + t(text) + '</p>' + (acts && acts.length ? '<div class="m-acts">' + acts.map(function(a){ return '<a href="' + a[1] + '">' + t(a[0]) + '</a>'; }).join('') + '</div>' : '') +
      '<button type="button" class="m-x" aria-label="' + t('关闭提示') + '">×</button>';
    bub.hidden = false; bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
    hideT = setTimeout(function(){ bub.hidden = true; }, ms || 7000);
    if(stage) stage();
  }
  // 说某个区块的下一句；这个区块的话说完一轮后，穿插一句闲话
  function sayFor(s, ms){
    var pool = TIPS[s] || TIPS.top, n = turn[s] = (turn[s] === undefined ? 0 : turn[s] + 1);
    if(n && n % pool.length === 0){ say(EXTRA[(n / pool.length - 1) % EXTRA.length], null, ms); return; }
    var x = pool[n % pool.length]; say(x[0], x[1], ms);
  }
  function act(cls, ms){ bird.classList.remove(cls); void bird.offsetWidth; bird.classList.add(cls); setTimeout(function(){ bird.classList.remove(cls); }, ms); }
  btn.addEventListener('click', function(){
    var now = Date.now(); clicks = clicks.filter(function(x){ return now - x < 1400; }); clicks.push(now);
    if(clicks.length >= 3){  // 连点三下：转一圈，喊晕
      clicks = []; if(!reduce) act('spin', 800);
      say(DIZZY[Math.floor(Math.random() * DIZZY.length)], null, 3200); return;
    }
    if(!reduce){ bird.classList.remove('hop', 'love'); void bird.offsetWidth; bird.classList.add('hop', 'love'); }
    sayFor(section());
  });
  bub.addEventListener('click', function(e){ if(e.target.closest('.m-x')) bub.hidden = true; if(e.target.closest('.m-acts a')) setTimeout(function(){ bub.hidden = true; }, 300); });
  if(!reduce){
    document.addEventListener('pointermove', function(e){
      var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .45, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 220) * 2.2;
      pupils.forEach(function(p){ p.style.transform = 'translate(' + (dx / d * k).toFixed(2) + 'px,' + (dy / d * k).toFixed(2) + 'px)'; });
    }, {passive: true});
    (function blink(){ setTimeout(function(){ bird.classList.add('blink'); setTimeout(function(){ bird.classList.remove('blink'); blink(); }, 160); }, 2800 + Math.random() * 3200); })();

    var active = Date.now(), lastY = scrollY, flyT = 0, roam = false;
    function wake(){
      active = Date.now();
      if(bird.classList.contains('doze')){ bird.classList.remove('doze', 'hop'); void bird.offsetWidth; bird.classList.add('hop'); }
    }
    ['pointermove', 'pointerdown', 'keydown'].forEach(function(ev){ document.addEventListener(ev, wake, {passive: true}); });
    // 闲着时隔几秒做个小动作；45 秒没人动就打瞌睡
    var ACTS = ['a-glance', 'a-crest', 'a-wing'];
    (function idle(){ setTimeout(function(){
      var busy = document.hidden || bird.classList.contains('fly') || bird.classList.contains('doze') || btn.matches(':hover');
      if(!busy && Date.now() - active > 45000 && bub.hidden) bird.classList.add('doze');
      else if(!busy){
        var a = ACTS[Math.floor(Math.random() * ACTS.length)];
        bird.classList.add(a); setTimeout(function(){ bird.classList.remove(a); }, 1700);
      }
      idle();
    }, 6000 + Math.random() * 6000); })();

    // 阿鹏在页面里飞（2026-11-10）：每个区块有一个落脚点。首屏在名字旁（中文浅色版踩在「理」字上），
    // 其余区块在标题文字右边，联系区在卡片上沿。屏幕上看得到落脚点，它就飞过去站着，跟着页面一起滚；
    // 看不到就回右下角。第一次落到某个区块会说一句。窄屏没有落脚点，一直待在角落，换区块时照样说话。
    var heroEl = document.querySelector('.hero'), nameEl = document.querySelector('h1.name');
    var pos = null, cur = null, attached = false, rafId = 0;
    var box = function(el){ var rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); };  // 量文字本身，不量块级元素的整行
    function anchors(vw, size){
      var out = [];
      if(vw <= 900) return out;
      if(heroEl && nameEl){
        var line1 = nameEl.querySelector('.me-link') || nameEl.firstElementChild, line2 = nameEl.querySelector('span');
        var wr = nameEl.parentNode.getBoundingClientRect(), r1 = box(line1), r2 = line2 ? box(line2) : null;
        var fs = parseFloat(getComputedStyle(line1).fontSize) || 100, BIG = Math.max(1.6, Math.min(2.7, fs * 1.28 / size)), half = size * BIG / 2, tx = r1.right + fs * .1 + half;
        var onWord = !EN && r2 && parseFloat(getComputedStyle(line2).fontSize) > fs * .6 && r2.right > tx;  // 第二行够大、够长，就踩在它上面
        var lh = parseFloat(getComputedStyle(nameEl).lineHeight) || fs, l1b = nameEl.getBoundingClientRect().top + lh;  // 第一行行框的底边（文字 Range 的高度是字体内容区，比行框高，不能用来对齐）
        if(tx + half < wr.right) out.push({k: 'top', x: tx, feet: onWord ? line2.getBoundingClientRect().top + fs * .07 : l1b - fs * (EN ? .2 : .07), s: BIG});
      }
      [['wb', '#wb h2'], ['projects', '#projects h2'], ['works', '#works h2'], ['exp-sec', '#exp-sec h2'], ['faq', '#faq h2']].forEach(function(a){
        var h = document.querySelector(a[1]); if(!h || !h.lastChild) return;
        var r = box(h.lastChild), hb = h.getBoundingClientRect(), hfs = parseFloat(getComputedStyle(h).fontSize) || 40, sc = 1.35;
        if(!r.width) return;
        out.push({k: a[0], x: r.right + 14 + size * sc / 2, feet: hb.bottom - hfs * (EN ? .2 : .1), s: sc});
      });
      var card = document.querySelector('#apply .apply-in');
      if(card){ var ar = card.getBoundingClientRect(); out.push({k: 'apply', x: ar.right - 96, feet: ar.top + 3, s: 1.4}); }
      return out;
    }
    function target(vw, size){
      var hx = vw - 24 - size / 2, hy = innerHeight - 20 - size / 2, mid = innerHeight * .38, best = null, keep = null;
      anchors(vw, size).forEach(function(a){
        if(a.feet < 110 || a.feet > innerHeight - 36) return;  // 落脚点不在屏幕上（或被顶栏挡住）
        a.d = Math.abs(a.feet - mid); if(!best || a.d < best.d) best = a; if(a.k === cur) keep = a;
      });
      if(keep && best !== keep && keep.d - best.d < 110) best = keep;  // 两个落脚点都看得到时，别来回跳
      return best ? {x: best.x, y: best.feet - .41 * size * best.s, s: best.s, k: best.k, hx: hx, hy: hy} : {x: hx, y: hy, s: 1, k: null, hx: hx, hy: hy};
    }
    function place(g, vw, size){
      var home = attached && cur === null;
      bird.classList.toggle('front', !home);
      if(home){ bird.style.transform = btn.style.transform = bub.style.translate = ''; return; }
      bird.style.transform = 'translate(' + (pos.x - g.hx).toFixed(1) + 'px,' + (pos.y - g.hy).toFixed(1) + 'px)';
      btn.style.transform = 'scale(' + pos.s.toFixed(3) + ')';
      // 气泡放在它旁边：右边放得下就放右边，否则放左边。用 translate 属性，气泡的出场动画占着 transform
      var bw = bub.offsetWidth, bh = bub.offsetHeight, half = pos.s * size / 2;
      if(!bw){ bub.style.translate = ''; return; }
      var right = pos.x + half + 14 + bw < vw - 12, top = Math.max(72, pos.y - half + 4);
      bub.style.translate = (right ? half + 14 + bw - size / 2 : -(half + 14 + size / 2)).toFixed(1) + 'px ' + (top + bh - (pos.y - size / 2 - 8)).toFixed(1) + 'px';
    }
    function landed(){
      bird.classList.remove('fly', 'dn', 'up'); bird.style.removeProperty('--lean');
      if(cur && !spoken[cur]){ spoken[cur] = 1; sayFor(cur, 5200); }
    }
    function tick(){
      rafId = 0;
      var vw = document.documentElement.clientWidth, size = btn.offsetWidth, g = target(vw, size);
      if(g.k !== cur){ cur = g.k; }
      var dx = g.x - pos.x, dy = g.y - pos.y, dist = Math.sqrt(dx * dx + dy * dy);
      if(dist < 1.5){ pos = {x: g.x, y: g.y, s: g.s}; attached = true; place(g, vw, size); landed(); return; }
      var sp = Math.max(.11, Math.min(.22, 26 / dist));  // 远的时候稳稳地飞，快到了再收
      pos.x += dx * sp; pos.y += dy * sp; pos.s += (g.s - pos.s) * .16;
      bird.classList.add('fly'); if(Math.abs(dx) > 30) bird.style.setProperty('--lean', (dx > 0 ? 9 : -9) + 'deg');
      place(g, vw, size);
      rafId = requestAnimationFrame(tick);
    }
    stage = function(){
      var vw = document.documentElement.clientWidth, size = btn.offsetWidth, g = target(vw, size);
      roam = vw > 900;
      if(!pos){ pos = {x: g.x, y: g.y, s: g.s}; cur = g.k; attached = true; }
      if(g.k !== cur){ cur = g.k; attached = false; bub.hidden = true; }
      if(attached){ pos = {x: g.x, y: g.y, s: g.s}; place(g, vw, size); }
      else if(!rafId) rafId = requestAnimationFrame(tick);
    };
    addEventListener('scroll', function(){
      var y = scrollY, d = y - lastY; lastY = y; wake(); stage();
      if(roam) return;
      // 窄屏：待在角落，滚动时离地扇翅膀；换了区块就说一句
      if(Math.abs(d) >= 6){
        bird.classList.add('fly'); bird.classList.toggle('dn', d > 0); bird.classList.toggle('up', d < 0);
        clearTimeout(flyT); flyT = setTimeout(function(){ bird.classList.remove('fly', 'dn', 'up'); }, 260);
      }
      var sct = section(); if(sct !== lastSec){ lastSec = sct; if(!spoken[sct]){ spoken[sct] = 1; sayFor(sct, 5200); } }
    }, {passive: true});
    addEventListener('resize', stage);
    stage(); bird.classList.add('enter');
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(stage);
    // 开场：等首屏的字打完，打个招呼
    setTimeout(function(){ if(scrollY < 120 && bub.hidden) sayFor('top', 5200); }, 2200);

    // 滚到投递区时挥挥翅膀
    var ap = $('apply');
    if(ap && 'IntersectionObserver' in window) new IntersectionObserver(function(es){ bird.classList.toggle('wave', es[0].isIntersecting); }, {threshold: .5}).observe(ap);
  }

  /* ---------- 个人世界入口：点首屏的名字，纸飞机从名字飞出，深色铺满全屏，再告诉对方这是哪里 ---------- */
  var meLink = document.querySelector('.me-link');
  if(meLink) meLink.addEventListener('click', function(e){
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;  // 新标签打开就不拦
    e.preventDefault(); openWorld(meLink.getAttribute('href'));
  });
  function openWorld(href){
    if(document.querySelector('.mw')) return;
    var W = innerWidth, H = innerHeight, r = meLink.getBoundingClientRect();
    var x0 = r.right - 8, y0 = r.top + r.height * .45, ex = W * (W < 700 ? .7 : .78), ey = H * .26;
    var d = 'M' + x0 + ' ' + y0 + 'C' + (x0 + W * .18) + ' ' + (y0 - H * .32) + ' ' + (ex - W * .34) + ' ' + (ey + H * .42) + ' ' + ex + ' ' + ey;
    meLink.classList.remove('me-pop'); void meLink.offsetWidth; meLink.classList.add('me-pop');
    var w = document.createElement('div');
    w.className = 'mw'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'mw-h');
    w.style.setProperty('--x', ex + 'px'); w.style.setProperty('--y', ey + 'px');
    w.innerHTML =
      '<svg class="mw-fly" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
        '<defs><mask id="mw-m" maskUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '"><path class="mw-mk" d="' + d + '" pathLength="1"/></mask></defs>' +
        '<path class="mw-trail" d="' + d + '" mask="url(#mw-m)"/></svg>' +
      '<div class="mw-bg"></div>' +
      '<svg class="mw-plane" viewBox="0 0 32 32" aria-hidden="true" style="offset-path:path(\'' + d + '\')"><path d="M3 15.5 29 4l-8 24-5.5-9.5z"/><path class="f" d="M15.5 18.5 29 4"/></svg>' +
      '<div class="mw-in">' +
        '<p class="mw-k">' + t('嘘——') + '</p>' +
        '<h2 id="mw-h">' + t('你不小心闯进了<br>我的个人世界') + '</h2>' +
        '<div class="mw-b"><a class="mw-go" href="' + href + '">' + t('进去看看') + '</a><button type="button" class="mw-back">' + t('先回简历') + '</button></div>' +
      '</div>';
    document.body.appendChild(w);
    document.documentElement.classList.add('mw-lock');
    var back = w.querySelector('.mw-back'), go = w.querySelector('.mw-go');
    requestAnimationFrame(function(){ w.classList.add(reduce ? 'show' : 'fly'); });
    setTimeout(function(){ w.classList.add('show'); go.focus({preventScroll: true}); }, reduce ? 30 : 1250);
    function close(){
      document.removeEventListener('keydown', onKey);
      w.classList.add('out');
      setTimeout(function(){ w.remove(); document.documentElement.classList.remove('mw-lock'); meLink.focus({preventScroll: true}); }, reduce ? 10 : 650);
    }
    function onKey(e){
      if(e.key === 'Escape') close();
      if(e.key === 'Tab'){ var f = e.shiftKey ? go : back; if(document.activeElement === f){ e.preventDefault(); (e.shiftKey ? back : go).focus(); } }
    }
    document.addEventListener('keydown', onKey);
    back.addEventListener('click', close);
    go.addEventListener('click', function(e){
      e.preventDefault();
      try{ sessionStorage.setItem('me-arrive', '1'); }catch(_){}
      w.classList.add('leave');
      setTimeout(function(){ location.href = href; }, reduce ? 10 : 420);
    });
  }
  // 从个人主页按「返回」回来时，页面可能来自缓存，把残留的转场层清掉
  addEventListener('pageshow', function(e){ if(e.persisted){ var o = document.querySelector('.mw'); if(o) o.remove(); document.documentElement.classList.remove('mw-lock'); } });
})();
