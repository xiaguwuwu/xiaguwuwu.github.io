// 「生成感」动效（2026-11-10）：首屏像被算出来一样出现；工作台像跑一次任务。浅色、深色、中英文共用，在 extras.js 之后加载。
// 只做一次性的出场，不循环；减少动效时全部跳过。
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  var Core = window.Core || {};

  // 乱码解码：每个字先在同类字符里跳，再从左到右依次定下来。
  // 汉字只在 pool 里跳（标题字体是按页面用字裁剪的子集，跳到子集外的字会掉回系统字体，很难看）。
  function scramble(el, pool, o){
    o = o || {};
    var txt = el.textContent, n = txt.length, step = o.step || 70, hold = o.hold || 240, t0 = 0, last = 0;
    var UP = 'ABCDEFGHJKLMNPRSTUVXYZ', LO = 'abcdefghknopqrstuvxyz', NUM = '0123456789';
    function rnd(c){
      var s = /[一-鿿]/.test(c) ? pool : /[A-Z]/.test(c) ? UP : /[a-z]/.test(c) ? LO : /\d/.test(c) ? NUM : '';
      return s ? s.charAt(Math.floor(Math.random() * s.length)) : c;
    }
    requestAnimationFrame(function f(t){
      if(!t0) t0 = t; var el2 = t - t0, done = el2 >= (n - 1) * step + hold;
      if(done){ el.textContent = txt; return; }
      if(t - last > 42){ last = t; var s = ''; for(var i = 0; i < n; i++) s += el2 >= i * step + hold ? txt.charAt(i) : rnd(txt.charAt(i)); el.textContent = s; }
      requestAnimationFrame(f);
    });
  }
  function cjk(s){ return (s.match(/[一-鿿]/g) || []).join(''); }

  /* ---------- 首屏：名字解码，四项信息逐格打出来。每次会话只播一次（切换深浅色、语言是跳页，不重播） ---------- */
  var h1 = document.querySelector('h1.name'), facts = document.getElementById('facts'), first = true;
  try{ first = !sessionStorage.getItem('boot'); sessionStorage.setItem('boot', '1'); }catch(e){}
  if(h1 && first){
    var pool = cjk(h1.textContent), link = h1.querySelector('.me-link'), sub = h1.querySelector('span');
    if(link){ link.setAttribute('aria-label', link.textContent); scramble(link, pool, {step: 110, hold: 320}); }
    if(sub) setTimeout(function(){ scramble(sub, pool, {step: 80, hold: 260}); }, 260);
    if(facts) [].slice.call(facts.querySelectorAll('li')).forEach(function(li, i){
      var b = li.querySelector('b'), k = li.querySelector('.k'), ic = li.querySelector('svg'); if(!b) return;
      var full = b.textContent, n = full.length, dur = Math.min(520, 60 + n * 34), t0 = 0;
      // 没打出来的部分留着占位（不可见），格子的宽高不跳
      b.innerHTML = '<span></span><span class="caret" aria-hidden="true"></span><span style="visibility:hidden"></span>';
      b.setAttribute('aria-label', full);
      var a = b.firstChild, rest = b.lastChild, caret = b.children[1]; rest.textContent = full;
      [k, ic].forEach(function(x){ if(x){ x.style.opacity = 0; x.style.transition = 'opacity .3s ease'; } });
      setTimeout(function(){
        [k, ic].forEach(function(x){ if(x) x.style.opacity = ''; });
        requestAnimationFrame(function f(t){
          if(!t0) t0 = t; var c = Math.min(n, Math.ceil((t - t0) / dur * n));
          a.textContent = full.slice(0, c); rest.textContent = full.slice(c);
          if(c < n) requestAnimationFrame(f); else { b.textContent = full; }
        });
      }, 620 + i * 170);
    });
  }

  /* ---------- 工作台：像跑一次任务。第一次滚到时自动跑一遍；每次跑，顶部走一条进度线，标题解码 ---------- */
  var out = document.getElementById('bench');
  if(out && Core.run && Core.onRender){
    var P = Core.projects || {}, tpool = ''; Object.keys(P).forEach(function(k){ tpool += cjk(P[k].title); });
    Core.onRender.push(function(k){
      if(!out.classList.contains('play')) return;
      var n = (P[k] && P[k].process.length) || 3, h3 = out.querySelector('h3');
      out.style.setProperty('--run', (0.7 + n * 0.22 + 0.5).toFixed(2) + 's');
      if(h3) scramble(h3, tpool, {step: 26, hold: 200});
    });
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){ if(es[0].isIntersecting){ io.disconnect(); Core.run(out.dataset.k); } }, {threshold: .35});
      io.observe(out);
    }
  }
})();
