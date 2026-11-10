// 浅色首页（中英两页共用）：章节编号、首屏点阵坐标纸。在 extras.js 之后加载。
// 章节编号
[['projects','02'],['works','03'],['exp-sec','04'],['faq','05']].forEach(function(x){ var h = document.querySelector('#' + x[0] + ' h2'); if(h) h.insertAdjacentHTML('afterbegin', '<span class="no">' + x[1] + '</span>'); });

// 点阵坐标纸：光标附近的点被推开、变深；点击处荡开一圈橙色波纹
(function(){
  var c = document.getElementById('grid'), ctx = c.getContext('2d'), hero = c.parentNode;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(2, window.devicePixelRatio || 1), W, H, G = 22, pts = [], mouse = {x: -999, y: -999}, waves = [], raf = 0, lastMove = 0, scanX = -999;
  function size(){
    var r = hero.getBoundingClientRect(); W = r.width; H = r.height;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = []; for(var y = G / 2; y < H; y += G) for(var x = G / 2; x < W; x += G) pts.push(x, y);
    draw(performance.now());
  }
  function draw(t){
    ctx.clearRect(0, 0, W, H);
    for(var i = 0; i < pts.length; i += 2){
      var x = pts[i], y = pts[i + 1], dx = x - mouse.x, dy = y - mouse.y, d = Math.sqrt(dx * dx + dy * dy), ox = 0, oy = 0, a = .22, r = 1.1, hot = 0;
      if(d < 140){ var k = 1 - d / 140; ox += dx / (d || 1) * k * 10; oy += dy / (d || 1) * k * 10; a += k * .55; r += k * 1.1; }
      if(scanX > -900){ var sd = Math.abs(x - scanX); if(sd < 70){ var sk = 1 - sd / 70; r += sk * 1.5; a += sk * .4; hot = Math.max(hot, sk * sk * .9); } }
      for(var j = 0; j < waves.length; j++){
        var w = waves[j], wx = x - w.x, wy = y - w.y, wd = Math.sqrt(wx * wx + wy * wy), ring = w.r - wd;
        if(ring > -26 && ring < 26){ var s = Math.cos(ring / 26 * Math.PI / 2) * w.life; ox += wx / (wd || 1) * s * 7; oy += wy / (wd || 1) * s * 7; r += s * 1.6; hot = Math.max(hot, s); }
      }
      ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, 6.2832);
      ctx.fillStyle = hot > .05 ? 'rgba(255,79,0,' + Math.min(1, .3 + hot) + ')' : 'rgba(11,11,11,' + Math.min(.85, a) + ')';
      ctx.fill();
    }
  }
  function loop(t){
    waves.forEach(function(w){ w.r += 6; w.life = Math.max(0, 1 - w.r / w.max); });
    waves = waves.filter(function(w){ return w.life > 0; });
    if(scanX > -900){ scanX += Math.max(14, W / 62); if(scanX > W + 90) scanX = -999; }
    draw(t);
    if(waves.length || scanX > -900 || t - lastMove < 600) raf = requestAnimationFrame(loop); else raf = 0;
  }
  function kick(){ if(!raf && !reduce) raf = requestAnimationFrame(loop); }
  hero.addEventListener('pointermove', function(e){ var r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; lastMove = performance.now(); if(reduce) draw(0); else kick(); });
  hero.addEventListener('pointerleave', function(){ mouse.x = mouse.y = -999; lastMove = performance.now(); kick(); });
  hero.addEventListener('pointerdown', function(e){ if(e.target.closest('a,button')) return; var r = c.getBoundingClientRect(); waves.push({x: e.clientX - r.left, y: e.clientY - r.top, r: 0, max: Math.max(W, H) * .7, life: 1}); kick(); });
  new ResizeObserver(size).observe(hero);
  // 首次进入时一道扫描线从左扫到右（配合 motion.js 的名字解码），点过的地方短暂变橙
  setTimeout(function(){ if(reduce) return; scanX = -80; kick(); }, 120);
})();
