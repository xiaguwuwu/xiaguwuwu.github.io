// 三个风格版本共用的交互。每个版本只换样式和招牌特效。
// 需要页面先加载 data/works.js、data/projects.js，并设置 window.BASE（站点根目录的相对路径）。
(function(){
  var BASE = window.BASE || '';
  var P = window.PROJECTS, M = window.MODELS, W = {};
  (window.WORKS || []).forEach(function(w){ W[w.slug] = w; });
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };

  var ICON = {
    template: '<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>',
    pricing: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    growth: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    ai: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    chev: '<path d="m6 9 6 6 6-6"/>', tick: '<path d="M20 6 9 17l-5-5"/>', plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
  };
  function svg(k, cls){ return '<svg class="' + (cls || 'i') + '" viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>'; }
  function model(k){ for(var i = 0; i < M.length; i++) if(M[i].key === k) return M[i]; }
  var Core = window.Core = { svg: svg, onRender: [], onPick: [], models: M, projects: P, works: W };

  /* ---------- 高亮：<mark> 滚到可见时，像记号笔一样从左往右画出来 ---------- */
  var hlIO = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function(es){
    es.forEach(function(en){ if(en.isIntersecting){ var m = en.target; setTimeout(function(){ m.classList.add('on'); }, +m.dataset.d || 0); hlIO.unobserve(m); } });
  }, {rootMargin: '0px 0px -12% 0px'}) : null;
  function arm(root){ if(!root) return; [].slice.call(root.querySelectorAll('mark')).forEach(function(m, i){
    if(m.classList.contains('on')) return; if(!hlIO){ m.classList.add('on'); return; } m.dataset.d = 250 + (i % 3) * 160; hlIO.observe(m); }); }
  Core.arm = arm;

  /* ---------- 工作台 ---------- */
  var pick = $('pick'), menu = $('menu'), brief = $('brief'), params = $('params'), out = $('bench'), hist = $('history');
  var picked = M[0].key;
  function mrow(m, end){ return '<span class="mi">' + svg(m.icon) + '</span><span class="mt"><b>' + m.name + '</b></span>' + end; }
  function pid(k){ for(var i = 0; i < M.length; i++) if(M[i].key === k) return 'PM-0' + (i + 1); return ''; }
  function fullTime(t){ return t.replace(/^(\d{4})\.(\d\d) – (\d\d)$/, '$1.$2 – $1.$3'); }
  function kv(rows){ return rows.map(function(r){ return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join(''); }
  // 左边选能力模型，右边同时切换
  function choose(k){
    var panel = pick && pick.closest('.panel');
    if(panel && !reduce){ panel.classList.add('swap'); setTimeout(function(){ setPanel(k); panel.classList.remove('swap'); }, 180); } else setPanel(k);
    Core.run(k);
  }
  function setPanel(k){
    picked = k; var m = model(k), p = P[k];
    if(pick) pick.innerHTML = mrow(m, '<span class="chev">' + svg('chev') + '</span>');
    if(brief) brief.innerHTML = kv([['背景', p.bg], ['目标', p.goal]]);
    if(params) params.innerHTML = kv([['产品', p.org], ['角色', p.role], ['时间', fullTime(p.time)]]);
    if(menu) menu.querySelectorAll('[role=option]').forEach(function(o){ o.setAttribute('aria-selected', o.dataset.k === k ? 'true' : 'false'); });
    Core.onPick.forEach(function(f){ f(k); });
    arm(brief);
  }
  Core.setPanel = setPanel;
  if(menu){
    menu.innerHTML = M.map(function(m){ return '<li role="option" tabindex="-1" data-k="' + m.key + '" aria-selected="false">' + mrow(m, '<span class="tick">' + svg('tick') + '</span>') + '</li>'; }).join('');
    var openMenu = function(v){ menu.hidden = !v; pick.setAttribute('aria-expanded', v ? 'true' : 'false'); if(v) menu.querySelector('[data-k="' + picked + '"]').focus(); };
    pick.addEventListener('click', function(){ openMenu(menu.hidden); });
    menu.addEventListener('click', function(e){ var o = e.target.closest('[role=option]'); if(!o) return; choose(o.dataset.k); openMenu(false); pick.focus(); });
    menu.addEventListener('keydown', function(e){
      var os = [].slice.call(menu.querySelectorAll('[role=option]')), i = os.indexOf(document.activeElement);
      if(e.key === 'ArrowDown'){ e.preventDefault(); os[Math.min(i + 1, os.length - 1)].focus(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); os[Math.max(i - 1, 0)].focus(); }
      else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); if(os[i]){ choose(os[i].dataset.k); openMenu(false); pick.focus(); } }
      else if(e.key === 'Escape' || e.key === 'Tab'){ openMenu(false); pick.focus(); }
    });
    document.addEventListener('click', function(e){ if(!menu.hidden && !e.target.closest('.picker')) openMenu(false); });
  }

  // 结果里的数字从 0 滚到真实值（只是动画，不表示前后变化）
  function countUp(root, delay){
    root.querySelectorAll('.ch b').forEach(function(b){
      var m = b.textContent.match(/^([\d.]+)(.*)$/); if(!m || reduce) return;
      var to = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, suf = m[2], t0 = null;
      b.textContent = (0).toFixed(dec) + suf;
      setTimeout(function(){ requestAnimationFrame(function step(t){
        if(!t0) t0 = t; var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        b.textContent = (to * e).toFixed(dec) + suf; if(k < 1) requestAnimationFrame(step);
      }); }, delay);
    });
  }
  /* ---------- 图表：结果用图说话，文字只做标注 ---------- */
  var CH = window.CHARTS || {};
  function num(v){ return String(v); }
  function chartHTML(blocks){
    return (blocks || []).map(function(c){
      var h = c.title ? '<p class="ch-t">' + c.title + '</p>' : '';
      if(c.type === 'pair'){
        var max = 0; c.rows.forEach(function(r){ max = Math.max(max, r[1], r[2]); });
        h += '<div class="ch-legend"><span><i class="sw a"></i>' + c.series[0] + '</span><span><i class="sw b"></i>' + c.series[1] + '</span></div>';
        h += c.rows.map(function(r){
          return '<div class="ch-pair"><span class="ch-k">' + r[0] + '</span><div class="ch-bars">' +
            [[r[1], 'a', c.series[0]], [r[2], 'b', c.series[1]]].map(function(x){
              return '<div class="ch-row" title="' + x[2] + ' ' + r[0] + ' ' + x[0] + (c.unit || '') + '"><span class="bar ' + x[1] + '" style="--v:' + (x[0] / max) + '"></span><b>' + num(x[0]) + (c.unit || '') + '</b></div>'; }).join('') +
            '</div></div>'; }).join('');
      } else if(c.type === 'bars'){
        var mx = 0; c.rows.forEach(function(r){ mx = Math.max(mx, r[1]); });
        h += c.rows.map(function(r){
          return '<div class="ch-single" title="' + r[0] + ' ' + r[1] + (c.unit || '') + '"><span class="ch-k">' + r[0] + '</span><span class="bar ' + (r[2] ? 'a' : 'b') + '" style="--v:' + (r[1] / mx) + '"></span><b>' + num(r[1]) + (c.unit || '') + '</b></div>'; }).join('');
      } else if(c.type === 'meters'){
        h += c.rows.map(function(r){
          return '<div class="ch-meter" title="' + r[0] + ' ' + r[1] + '%"><span class="ch-k">' + r[0] + '</span><span class="track"><span class="bar a" style="--v:' + (r[1] / 100) + '"></span></span><b>' + r[1] + '%</b></div>'; }).join('');
      } else if(c.type === 'stats'){
        h += '<div class="ch-stats">' + c.items.map(function(x){ return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>';
      } else if(c.type === 'flow'){
        var op = c.op ? '<i class="op">' + c.op + '</i>' : '<i class="op arrow" aria-hidden="true">→</i>';
        h += '<div class="ch-flow">' + c.steps.map(function(x){ return '<span class="node">' + x + '</span>'; }).join(op) +
          (c.end ? '<i class="op">=</i><span class="node end">' + c.end + '</span>' : '') + '</div>';
      } else if(c.type === 'status'){
        h += '<ul class="ch-status">' + c.items.map(function(x){ var on = x[1] === '已上线';
          return '<li class="' + (on ? 'on' : '') + '"><i aria-hidden="true"></i><span>' + x[0] + '</span><em>' + x[1] + '</em></li>'; }).join('') + '</ul>';
      }
      return '<div class="ch ch-' + c.type + '-b">' + h + '</div>';
    }).join('');
  }
  Core.chart = chartHTML;

  function li(a, mark){ return a.map(function(x, i){ return '<li style="--i:' + i + '">' + (mark ? svg('tick', 'ck') : '') + '<span>' + x + '</span></li>'; }).join(''); }
  function render(k, animate){
    var p = P[k], m = model(k);
    out.innerHTML =
      '<div class="o-head"><span class="o-id">' + pid(k) + '</span><a class="go" href="' + BASE + p.href + '" aria-label="读完整案例：' + p.title + '" title="读完整案例"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg></a></div>' +
      '<div class="o-body"><h3>' + p.title + '</h3>' +
        '<p class="o-lab">过程</p><ol class="o-steps">' + li(p.process, true) + '</ol>' +
        '<p class="o-lab">结果</p><div class="o-res">' + chartHTML(CH[k]) + '</div>' +
        '</div>';
    out.dataset.k = k;
    if(hist) hist.querySelectorAll('.hist').forEach(function(h){ h.setAttribute('aria-pressed', h.dataset.k === k ? 'true' : 'false'); });
    out.classList.remove('play'); void out.offsetWidth;
    if(animate && !reduce){ out.classList.add('play'); countUp(out, 260 + p.process.length * 220); }
    Core.onRender.forEach(function(f){ f(k, out.querySelector('video')); });
    arm(out);
  }
  Core.run = function(k){ render(k || picked, true); };
  if(out){
    if(hist){
      hist.innerHTML = M.map(function(m){
        return '<button class="hist" type="button" data-k="' + m.key + '" aria-pressed="false"><span class="h-id">' + pid(m.key) + '</span><span>' + m.name + '</span></button>'; }).join('');
      hist.addEventListener('click', function(e){ var h = e.target.closest('.hist'); if(!h) return; choose(h.dataset.k); });
    }
    setPanel(picked); render(picked, false);
  }

  /* ---------- 项目：点开才展开项目、过程、结果 ---------- */
  var plist = $('plist');
  if(plist){
    plist.innerHTML = window.PROJECT_ORDER.map(function(k, n){ var p = P[k];
      return '<li class="pj"><button class="pj-h" type="button" aria-expanded="false" aria-controls="pj-' + k + '">' +
        '<span class="pj-n">' + String(n + 1).padStart(2, '0') + '</span><span class="pj-t">' + p.title + '</span><span class="pj-l">' + p.line + '</span>' +
        '<span class="pj-w">' + (n && P[window.PROJECT_ORDER[n - 1]].org === p.org ? '' : '<span>' + p.org + '</span>') + '<time>' + fullTime(p.time) + '</time></span>' + svg('plus', 'pj-x') + '</button>' +
        '<div class="pj-b" id="pj-' + k + '" hidden><dl><dt>背景</dt><dd>' + p.bg + '</dd><dt>目标</dt><dd>' + p.goal + '</dd><dt>过程</dt><dd><ul>' + li(p.process) + '</ul></dd><dt>结果</dt><dd class="pj-ch">' + chartHTML(CH[k]) + '</dd></dl>' +
        '<a class="go pj-go" href="' + BASE + p.href + '" aria-label="读完整案例：' + p.title + '" title="读完整案例"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg></a></div></li>'; }).join('');
    arm(plist);
    plist.addEventListener('click', function(e){
      var h = e.target.closest('.pj-h'); if(!h) return;
      var open = h.getAttribute('aria-expanded') !== 'true', b = $(h.getAttribute('aria-controls'));
      h.setAttribute('aria-expanded', open ? 'true' : 'false'); b.hidden = !open;
      if(open){ arm(b); if(!reduce) countUp(b, 150); }
    });
  }

  /* ---------- 经历 ---------- */
  var exp = $('exp');
  if(exp){ exp.innerHTML = window.EXP.map(function(x){ return '<div class="ex"><dt>' + x.time + '</dt><dd class="ex-o"><b>' + x.org + '</b><span>' + x.role + '</span></dd><dd class="ex-d"><ul>' + x.items.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul></dd></div>'; }).join(''); arm(exp); }

  /* ---------- 作品书架：平时只露书脊，悬停抽出，点击翻开成对开页 ---------- */
  var shelf = $('shelf');
  if(shelf){
    var list = window.WORKS || [];
    shelf.innerHTML = list.map(function(w, n){
      var h = [92, 100, 96, 88, 100, 94][n % 6];
      return '<div class="book" role="listitem" style="--h:' + h + '%" data-slug="' + w.slug + '">' +
        '<button class="spine" type="button" aria-expanded="false" aria-controls="leaf-' + w.slug + '" style="background-image:url(' + BASE + w.poster + ')">' +
          '<span class="sp-r">R' + String(w.rounds).padStart(2, '0') + '</span><span class="sp-t">' + w.title + '</span><span class="sp-c">' + w.catName + '</span></button>' +
        '<div class="leaf" id="leaf-' + w.slug + '"><div class="cover"></div>' +
          '<div class="page"><p class="pg-c">' + w.catName + '</p><h3>' + w.title + '</h3>' +
          '<dl class="pg-m"><dt>模型</dt><dd>' + w.model + '</dd><dt>迭代</dt><dd>' + w.rounds + ' 轮定稿</dd></dl>' +
          (w.note ? '<p class="pg-n">' + w.note + '</p>' : '') +
          '<button class="pg-p" type="button" data-open="' + w.slug + '">看输入和提示词</button></div></div></div>';
    }).join('');
    function closeBook(bk){
      bk.classList.remove('open'); bk.querySelector('.spine').setAttribute('aria-expanded', 'false');
      var v = bk.querySelector('.cover video'); if(v){ v.pause(); v.remove(); }
    }
    function openBook(bk){
      shelf.querySelectorAll('.book.open').forEach(function(o){ if(o !== bk) closeBook(o); });
      var w = W[bk.dataset.slug];
      bk.classList.add('open'); bk.querySelector('.spine').setAttribute('aria-expanded', 'true');
      bk.querySelector('.cover').innerHTML = '<video src="' + BASE + w.video + '" poster="' + BASE + w.poster + '" muted loop playsinline autoplay></video>';
      setTimeout(function(){ bk.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'center'}); }, 80);
    }
    shelf.addEventListener('click', function(e){
      var sp = e.target.closest('.spine'); if(!sp) return;
      var bk = sp.parentNode; if(bk.classList.contains('open')) closeBook(bk); else openBook(bk);
    });
    shelf.addEventListener('keydown', function(e){
      var sp = e.target.closest('.spine'); if(!sp || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      e.preventDefault(); var bk = sp.parentNode, nx = e.key === 'ArrowRight' ? bk.nextElementSibling : bk.previousElementSibling;
      if(nx) nx.querySelector('.spine').focus();
    });
    document.querySelectorAll('.sn').forEach(function(b){ b.addEventListener('click', function(){
      shelf.scrollBy({left: +b.dataset.dir * shelf.clientWidth * .7, behavior: reduce ? 'auto' : 'smooth'});
    }); });
    // 鼠标拖动翻阅
    var drag = null;
    shelf.addEventListener('pointerdown', function(e){ if(e.pointerType !== 'mouse') return; drag = {x: e.clientX, l: shelf.scrollLeft, moved: false}; });
    window.addEventListener('pointermove', function(e){ if(!drag) return; var dx = e.clientX - drag.x; if(Math.abs(dx) > 4){ drag.moved = true; shelf.classList.add('dragging'); } shelf.scrollLeft = drag.l - dx; });
    window.addEventListener('pointerup', function(){ if(drag && drag.moved){ var stop = function(ev){ ev.stopPropagation(); ev.preventDefault(); shelf.removeEventListener('click', stop, true); }; shelf.addEventListener('click', stop, true); setTimeout(function(){ shelf.removeEventListener('click', stop, true); }, 0); } drag = null; shelf.classList.remove('dragging'); });
  }

  /* ---------- 弹层：输入、输出、提示词 ---------- */
  var modal = $('modal'), sheet = $('sheet'), last = null;
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function open(slug){
    var w = W[slug]; if(!w || !modal) return; last = document.activeElement;
    sheet.innerHTML = '<button class="x" type="button" aria-label="关闭">×</button><h3>' + esc(w.title) + '</h3><p class="meta">' + esc(w.catName) + '，' + esc(w.model) + '，迭代 ' + w.rounds + ' 轮定稿</p>' +
      '<div class="pipe"><div><div class="lab">输入</div>' + (w.input ? '<img src="' + BASE + w.input + '" alt="输入图">' : '<div class="none">只用文字提示词</div>') + '</div>' +
      '<div><div class="lab">输出</div><video src="' + BASE + w.video + '" poster="' + BASE + w.poster + '" muted loop playsinline autoplay controls></video></div>' +
      '<div class="info"><div class="lab">我写的提示词</div><div class="prompt">' + esc(w.prompt) + '</div>' + (w.note ? '<p class="note">' + esc(w.note) + '</p>' : '') + '</div></div>';
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
    var x = sheet.querySelector('.x'); x.addEventListener('click', close); x.focus();
  }
  function close(){ modal.classList.remove('open'); document.body.style.overflow = ''; sheet.innerHTML = ''; if(last) last.focus(); }
  if(modal){
    modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal.classList.contains('open')) close(); });
  }
  document.addEventListener('click', function(e){ var t = e.target.closest('[data-open]'); if(t){ e.preventDefault(); open(t.dataset.open); } });

  /* ---------- 复制邮箱 ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    var label = b.getAttribute('aria-label'), icon = b.innerHTML;
    b.addEventListener('click', function(){
      var t = b.dataset.copy;
      function done(){ b.innerHTML = svg('tick'); b.setAttribute('aria-label', '已复制'); setTimeout(function(){ b.innerHTML = icon; b.setAttribute('aria-label', label); }, 1600); }
      if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, function(){ window.prompt('复制这个邮箱', t); });
      else { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch(err) { window.prompt('复制这个邮箱', t); } ta.remove(); }
    });
  });

  /* ---------- 顶栏：当前所在区块的链接加黑底、加粗 ---------- */
  var navLinks = [].slice.call(document.querySelectorAll('.top nav a'));
  var spied = navLinks.map(function(a){ return [a, document.querySelector(a.getAttribute('href'))]; })
    .filter(function(x){ return x[1] && !x[0].classList.contains('keep'); });
  function spy(){
    var cur = null, line = window.innerHeight * 0.35;
    spied.forEach(function(x){ if(x[1].getBoundingClientRect().top <= line) cur = x[0]; });
    if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && spied.length) cur = spied[spied.length - 1][0];
    var ap = document.getElementById('apply'); if(ap && ap.getBoundingClientRect().top <= line) cur = null;
    if(topBar) topBar.classList.toggle('stuck', window.scrollY > 8);
    navLinks.forEach(function(a){ var on = a === cur; a.classList.toggle('on', on); if(on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    if(ind){ if(cur){ ind.style.width = cur.offsetWidth + 'px'; ind.style.transform = 'translateX(' + cur.offsetLeft + 'px)'; ind.style.opacity = 1; } else ind.style.opacity = 0; }
  }
  var navEl = document.querySelector('.top nav'), ind = null, topBar = document.querySelector('.top');
  if(navEl && !reduce){ ind = document.createElement('span'); ind.className = 'ind'; ind.setAttribute('aria-hidden', 'true'); navEl.insertBefore(ind, navEl.firstChild); navEl.classList.add('has-ind'); }
  window.addEventListener('scroll', spy, {passive: true}); window.addEventListener('resize', spy); spy();
  navLinks.forEach(function(a){ a.addEventListener('click', function(){ if(a.classList.contains('keep')){ navLinks.forEach(function(b){ b.classList.toggle('on', b === a); }); } }); });

  /* ---------- 区块过渡：标题逐字模糊淡入、下方细线画出；内容模糊淡入上移 ---------- */
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){
      en.target.classList.remove('pre'); en.target.classList.add('in'); io.unobserve(en.target); } }); }, {rootMargin: '0px 0px -10% 0px'});
    document.querySelectorAll('.sec-h').forEach(function(h){
      var t = h.querySelector('h2'), n = 0;
      if(t) [].slice.call(t.childNodes).forEach(function(node){
        if(node.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        node.textContent.split('').forEach(function(c){ var sp = document.createElement('span'); sp.className = 'sc'; sp.style.setProperty('--i', n++); sp.textContent = c; frag.appendChild(sp); });
        t.replaceChild(frag, node);
      });
      h.classList.add('pre'); io.observe(h);
    });
    var rvs = document.querySelectorAll('.pj, .ex, .apply-in, .facts li, .studio, .shelf, .wb-h');
    rvs.forEach(function(el){ var sib = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
      el.classList.add('rv'); el.style.transitionDelay = (el.matches('.pj, .ex, .facts li') ? Math.min(sib, 6) * 70 : 0) + 'ms'; io.observe(el); });
  }

  /* ---------- 互动：滚动进度条、卡片跟随光斑、磁吸按钮、导航滑块 ---------- */
  if(!reduce){
    var bar = document.createElement('div'); bar.className = 'sprog'; document.body.appendChild(bar);
    var prog = function(){ var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; };
    addEventListener('scroll', prog, {passive: true}); prog();
    document.addEventListener('pointermove', function(e){
      var c = e.target.closest && e.target.closest('.out, .pj, .ex, .apply-in, .pick, .hist');
      if(!c) return; if(!c.classList.contains('spot')) c.classList.add('spot');
      var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    document.addEventListener('pointerout', function(e){ var c = e.target.closest && e.target.closest('.spot'); if(c && !c.contains(e.relatedTarget)){ c.style.setProperty('--mx', '-999px'); c.style.setProperty('--my', '-999px'); } });
    if(matchMedia('(hover:hover)').matches) document.querySelectorAll('.ap-btn, .mail, .status').forEach(function(el){
      el.classList.add('mag');
      el.addEventListener('pointermove', function(e){ var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
      el.addEventListener('pointerleave', function(){ el.style.transform = ''; });
    });
  }

  var apply = $('apply');
  if(apply && 'IntersectionObserver' in window && !reduce){
    var cta = apply.querySelector('.ap-cta'), btn = apply.querySelector('.ap-btn');
    var aim = function(){ var c = cta.getBoundingClientRect(), b = btn.getBoundingClientRect();
      cta.style.setProperty('--cx', Math.round(b.left - c.left + b.width * 0.7) + 'px'); cta.style.setProperty('--cy', Math.round(b.top - c.top + b.height * 0.55) + 'px'); };
    aim(); window.addEventListener('resize', aim);
    new IntersectionObserver(function(es){ apply.classList.toggle('live', es[0].isIntersecting); }, {threshold: 0.4}).observe(apply);
  }
})();

// 浅色 A 版 ↔ 深色 C 版：跳过去时带上当前所在的那一节（另一版没有这一节就回到顶部）
(function(){
  var t = document.querySelector('.theme-t'); if(!t) return;
  t.addEventListener('click', function(){
    var cur = '';
    ['projects', 'works', 'exp-sec', 'apply'].forEach(function(id){ var el = document.getElementById(id); if(el && el.getBoundingClientRect().top < innerHeight * .4) cur = id; });
    t.href = t.getAttribute('href').split('#')[0] + (cur ? '#' + cur : '');
  });
})();

// 记下访客在看浅色还是深色版，案例详情页按它配色
(function(){
  var t = document.querySelector('.theme-t'); if(!t) return;
  try { localStorage.setItem('resume-theme', /dark/.test(t.getAttribute('href')) ? 'light' : 'dark'); } catch(e){}
})();
