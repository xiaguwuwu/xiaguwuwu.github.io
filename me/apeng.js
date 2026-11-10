// 首屏的吉祥物阿鹏（和求职主页同一只）：从右下角探出来，用气泡告诉访客往下滑能看到什么。
// 点它会蹦一下、冒爱心、换一句话；这一下点击也让浏览器放行声音。滑过首屏就挥挥翅膀躲起来。
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = function(k){ return (window.T && window.T[k]) || k; };  // 英文由 me/en.js 提供
  var LINES = [
    '嗨，我是阿鹏～<br>往下滑，这只纸飞机会<b>一折一折拆开</b>。每道折痕里，藏着他的一次变化。<small>点我一下，声音就来了</small>',
    '每一折都配着他自己写的原话，点出处能跳回文章里的那一句。',
    '再往后，是他反复写到的词，和他读过的书：一个点就是一小时。',
    '滑到最后，纸飞机会重新折好，再飞一次。',
    '声音开着呢。嫌吵的话，右上角可以关。'
  ];
  var el = document.createElement('div');
  el.className = 'apeng pre';
  el.innerHTML =
    '<div class="ap-bub" role="status"></div>' +
    '<button type="button" class="ap-btn" aria-label="' + t('吉祥物阿鹏，点一下听它说下一句') + '">' +
    '<svg viewBox="0 0 80 80" aria-hidden="true">' +
      '<ellipse class="ap-shadow" cx="40" cy="76.5" rx="18" ry="3"/>' +
      '<path class="ap-heart" d="M40 9c-1.6-3.2-7-2.6-7 1.4 0 3 3.6 5.2 7 8.2 3.4-3 7-5.2 7-8.2 0-4-5.4-4.6-7-1.4z"/>' +
      '<g class="ap-body">' +
      '<ellipse class="ap-foot" cx="32.5" cy="72.6" rx="4.6" ry="2.5"/><ellipse class="ap-foot" cx="47.5" cy="72.6" rx="4.6" ry="2.5"/>' +
      '<path class="ap-wing l" d="M15.5 49c-6.8.4-9.6 6.8-7.2 11.6 5.6.2 9.4-4 9.2-8.6z"/>' +
      '<path class="ap-wing r" d="M64.5 49c6.8.4 9.6 6.8 7.2 11.6-5.6.2-9.4-4-9.2-8.6z"/>' +
      '<path class="ap-crest" d="M40 23c-.4-4.6 1.4-7.8 5-9M40 23c-2-3.4-5-4.6-8-3.8"/>' +
      '<path class="ap-skin" d="M40 22.5c17 0 27.5 12 27.5 27 0 14-11.5 22-27.5 22S12.5 63.5 12.5 49.5c0-15 10.5-27 27.5-27z"/>' +
      '<ellipse class="ap-belly" cx="40" cy="60.5" rx="16.5" ry="9.6"/>' +
      '<g class="ap-eye"><g class="ap-pupil"><ellipse cx="30.5" cy="50" rx="4.5" ry="5.3"/><circle class="ap-hl" cx="32.1" cy="48" r="1.9"/><circle class="ap-hl" cx="29.2" cy="52.2" r=".8"/></g></g><g class="ap-eye"><g class="ap-pupil"><ellipse cx="49.5" cy="50" rx="4.5" ry="5.3"/><circle class="ap-hl" cx="51.1" cy="48" r="1.9"/><circle class="ap-hl" cx="48.2" cy="52.2" r=".8"/></g></g><path class="ap-happy" d="M26 51.2q4.5-5.2 9 0M45 51.2q4.5-5.2 9 0"/>' +
      '<path class="ap-beak" d="M37.3 55.2q2.7-1.4 5.4 0-1 3.2-2.700 3.200t-2.7-3.2z"/>' +
      '<ellipse class="ap-cheek" cx="22.5" cy="57.5" rx="4.4" ry="2.7"/><ellipse class="ap-cheek" cx="57.5" cy="57.5" rx="4.4" ry="2.7"/>' +
      '<g class="ap-gog"><path class="ap-gog-strap" d="M15.5 39.5Q40 26.5 64.5 39.5"/><circle class="ap-gog-rim" cx="30.5" cy="33.5" r="7.2"/><circle class="ap-gog-rim" cx="49.5" cy="33.5" r="7.2"/><path class="ap-gog-bridge" d="M37.5 33.5h5"/><circle class="ap-gog-lens" cx="30.5" cy="33.5" r="5"/><circle class="ap-gog-lens" cx="49.5" cy="33.5" r="5"/><path class="ap-gog-glint" d="M27.8 32.4q.8-1.9 2.7-2.3M46.8 32.4q.8-1.9 2.7-2.3"/></g>' +
      '</g></svg></button>';
  document.body.appendChild(el);
  var bub = el.querySelector('.ap-bub'), btn = el.querySelector('.ap-btn'), pupils = el.querySelectorAll('.ap-pupil'), i = 0;

  function say(k){
    bub.innerHTML = '<p>' + t(LINES[k]) + '</p>';
    if(!reduce){ bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop'); }
  }
  say(0);
  // 从求职主页的转场进来时，等首屏淡入完再出场
  setTimeout(function(){ el.classList.remove('pre'); }, document.documentElement.classList.contains('arrive') ? 1700 : 900);

  btn.addEventListener('click', function(){
    if(!reduce){ el.classList.remove('hop', 'love'); void el.offsetWidth; el.classList.add('hop', 'love'); }
    i = (i + 1) % LINES.length; say(i);
  });

  // 滑过首屏就躲起来，回到顶部再出来
  var away = false;
  addEventListener('scroll', function(){
    var a = scrollY > innerHeight * .35;
    if(a !== away){ away = a; el.classList.toggle('away', a); if(!a){ i = 0; say(0); } }
  }, {passive: true});

  if(!reduce){
    document.addEventListener('pointermove', function(e){
      var r = btn.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .45), d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 220) * 2.2;
      pupils.forEach(function(p){ p.style.transform = 'translate(' + (dx / d * k).toFixed(2) + 'px,' + (dy / d * k).toFixed(2) + 'px)'; });
    }, {passive: true});
    (function blink(){ setTimeout(function(){ el.classList.add('blink'); setTimeout(function(){ el.classList.remove('blink'); blink(); }, 160); }, 2600 + Math.random() * 3000); })();
  }
})();
