// 首屏的吉祥物阿鹏（和求职主页同一只）：从右下角探出来，用气泡告诉访客往下滑能看到什么。
// 点它会蹦一下、冒爱心、换一句话；这一下点击也让浏览器放行声音。滑过首屏就挥挥翅膀躲起来。
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    '<button type="button" class="ap-btn" aria-label="吉祥物阿鹏，点一下听它说下一句">' +
    '<svg viewBox="0 0 80 80" aria-hidden="true">' +
      '<ellipse class="ap-shadow" cx="40" cy="76" rx="17" ry="3"/>' +
      '<path class="ap-heart" d="M40 13c-1.6-3.2-7-2.6-7 1.4 0 3 3.6 5.2 7 8.2 3.4-3 7-5.2 7-8.2 0-4-5.4-4.6-7-1.4z"/>' +
      '<g class="ap-body">' +
        '<ellipse class="ap-foot" cx="33" cy="71.5" rx="4.4" ry="2.4"/><ellipse class="ap-foot" cx="47" cy="71.5" rx="4.4" ry="2.4"/>' +
        '<path class="ap-wing l" d="M17 46c-6.5 0-9.5 6-7.5 11 5.5.5 9.5-3.5 9.5-8z"/>' +
        '<path class="ap-wing r" d="M63 46c6.5 0 9.5 6 7.5 11-5.5.5-9.5-3.5-9.5-8z"/>' +
        '<path class="ap-crest" d="M40 24c-.6-5 .8-8.6 4.6-10M40 24c-2.2-4-5.6-5.4-9-4.4M40 24c1.6-3.6 4.8-5 8.4-4"/>' +
        '<ellipse class="ap-skin" cx="40" cy="47" rx="25" ry="24"/>' +
        '<ellipse class="ap-belly" cx="40" cy="56" rx="15" ry="11.5"/>' +
        '<g class="ap-eye"><g class="ap-pupil"><ellipse cx="31" cy="43" rx="4.6" ry="5.4"/><circle class="ap-hl" cx="32.6" cy="41" r="1.8"/><circle class="ap-hl" cx="29.6" cy="45" r=".8"/></g></g>' +
        '<g class="ap-eye"><g class="ap-pupil"><ellipse cx="49" cy="43" rx="4.6" ry="5.4"/><circle class="ap-hl" cx="50.6" cy="41" r="1.8"/><circle class="ap-hl" cx="47.6" cy="45" r=".8"/></g></g>' +
        '<path class="ap-happy" d="M26.6 44.2q4.4-5 8.8 0M44.6 44.2q4.4-5 8.8 0"/>' +
        '<path class="ap-beak" d="M36.8 49.6q3.2-1.6 6.4 0-1.2 3.6-3.2 3.6t-3.2-3.6z"/>' +
        '<ellipse class="ap-cheek" cx="25.5" cy="51" rx="4.2" ry="2.6"/><ellipse class="ap-cheek" cx="54.5" cy="51" rx="4.2" ry="2.6"/>' +
      '</g></svg></button>';
  document.body.appendChild(el);
  var bub = el.querySelector('.ap-bub'), btn = el.querySelector('.ap-btn'), pupils = el.querySelectorAll('.ap-pupil'), i = 0;

  function say(k){
    bub.innerHTML = '<p>' + LINES[k] + '</p>';
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
