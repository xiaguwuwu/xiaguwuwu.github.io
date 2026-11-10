// 深色版（中英两页共用）。在 extras.js 之后加载。
// 视频水波纹：把输出视频逐帧画到画布上，用两层高度场模拟水面；光标划过搅动水面，点击滴一滴
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 216, H = 384, cur = null;
  function Ripple(video){
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.setAttribute('aria-label', (window.t || String)('可以拨动水面的模板视频')); cv.setAttribute('role', 'img');
    var ctx = cv.getContext('2d', {willReadFrequently: true});
    var a = new Float32Array(W * H), b = new Float32Array(W * H), energy = 0, alive = true, out = ctx.createImageData(W, H), last = -1;
    function drop(x, y, r, s){
      for(var j = -r; j <= r; j++) for(var i = -r; i <= r; i++){
        var px = x + i, py = y + j; if(px < 1 || py < 1 || px >= W - 1 || py >= H - 1) continue;
        var d = Math.sqrt(i * i + j * j); if(d <= r) a[py * W + px] += s * (1 - d / r);
      }
      energy = 1;
    }
    function pos(e){ var r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * W), Math.round((e.clientY - r.top) / r.height * H)]; }
    cv.addEventListener('pointermove', function(e){ if(reduce) return; var p = pos(e); drop(p[0], p[1], 5, 420); });
    cv.addEventListener('pointerdown', function(e){ if(reduce) return; var p = pos(e); drop(p[0], p[1], 12, 2600); });
    function step(){
      if(!alive) return;
      if(video.readyState >= 2){
        ctx.drawImage(video, 0, 0, W, H);
        if(energy > 0.002){
          var src = ctx.getImageData(0, 0, W, H).data, o = out.data, e = 0, t;
          for(var y = 1; y < H - 1; y++) for(var x = 1; x < W - 1; x++){
            var i = y * W + x;
            b[i] = (a[i - 1] + a[i + 1] + a[i - W] + a[i + W]) / 2 - b[i];
            b[i] *= .978; e += Math.abs(b[i]);
          }
          t = a; a = b; b = t;
          for(y = 1; y < H - 1; y++) for(x = 1; x < W - 1; x++){
            i = y * W + x;
            var dx = (a[i - 1] - a[i + 1]) / 7, dy = (a[i - W] - a[i + W]) / 7;
            var sx = Math.min(W - 1, Math.max(0, (x + dx) | 0)), sy = Math.min(H - 1, Math.max(0, (y + dy) | 0)), si = (sy * W + sx) * 4, oi = i * 4;
            var shade = (dx - dy) * 3.2;
            o[oi] = src[si] + shade; o[oi + 1] = src[si + 1] + shade; o[oi + 2] = src[si + 2] + shade; o[oi + 3] = 255;
          }
          ctx.putImageData(out, 0, 0);
          energy = e / (W * H) / 6;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return {canvas: cv, drop: drop, stop: function(){ alive = false; }};
  }
  Core.onRender.push(function(k, video){
    if(cur){ cur.stop(); cur = null; }
    if(!video) return;
    cur = Ripple(video);
    video.parentNode.insertBefore(cur.canvas, video.nextSibling);
    // 生成时在画面中央滴一滴，作为输出出现的那一下
    if(!reduce) setTimeout(function(){ if(cur) cur.drop(W / 2, H * .45, 14, 3200); }, 120);
  });
  Core.run(document.getElementById('bench').dataset.k);
})();
