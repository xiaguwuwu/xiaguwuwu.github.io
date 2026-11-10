// 个人主页的英文：访客语言是英文时（shared/lang.js 定的 window.SITE_LANG），在 data.js 之后、fold.js 之前把文案换成英文。
// 规则（2026-11-10 菲菲定）：引文以英译为主，下面小字附中文原话，出处链接照旧跳中文原文那一句；文章页不翻译。
// 引文按中文原话做键：story.json 换了引文，这里要同步加上译文，否则那句只显示中文。
// 手写，不由 build_me.py 生成（library 不在每台电脑上，改英文不必重建 data.js）。
(function(){
  if(window.SITE_LANG !== 'en' || !window.ME) return;
  var ME = window.ME, S = ME.story;

  var FOLDS = [
    {years: 'Middle school – college', title: 'No Single Right Answer', from: 'Good at exams', to: 'Learning to live', step: 'Fold in half for a center line, then open'},
    {years: '2022 grad school offer – master’s', title: 'Held Up', from: 'Seeing only myself', to: 'Seeing the people holding me up', step: 'Fold the top-left corner to the center'},
    {years: '2023 – 2025 counseling', title: 'Feelings First', from: 'Pushing feelings down', to: 'Asking how I feel first', step: 'Fold the top-right corner to the center'},
    {years: '2025 job hunt – early 2026', title: 'My Own Choice', from: 'Wanting a sure answer', to: 'Making my own choices', step: 'Fold both slanted edges to the center'},
    {years: 'Spring 2026', title: 'The Body Is Me', from: 'Pushing through on willpower', to: 'Stopping to listen to my body', step: 'Fold in half along the center line'},
    {years: 'Summer 2026, Shanghai', title: 'Saying It', from: 'Holding it in', to: 'Saying it out loud', step: 'Open the wings on both sides'}
  ];
  var WAYS = ['Seeing people the way I see products', 'Land on the feeling first', 'After the anxiety, untangling myself', 'Old poems to hold the present'];

  // 引文译文：键是中文原话
  var Q = {
    '我认为自己是在不断变化的': 'I think of myself as always changing',
    '数学只有一个标准答案，而人生有千千万万种非标准答案': 'Math has one right answer; life has countless answers that are not standard',
    '我只被教会了如何做题，却从来没有被教会如何去生活': 'I was only taught how to solve problems, never how to live',
    '写作成了他唯一的出路': 'Writing became his only way out',
    '那应该是四年前，我大二的时候': 'That must have been four years ago, in my second year of college',
    '研究生三年，我时时刻刻能感受到身边的人对于我的托举': 'In three years of grad school, I could always feel the people around me holding me up',
    '那时候写下“感谢自己”的我，在那时那刻，确实只能看到自己。': 'Back then, when I wrote “thank myself”, in that moment I really could see only myself.',
    '锦上添花非常容易，但雪中送炭才让人难忘。': 'Adding to good fortune is easy; help in the cold is what people remember.',
    '是一种被深深接住的踏实': 'a steady feeling of being truly caught',
    '个人的感受一定是世界上最重要的事情': 'Your own feelings must be the most important thing in the world',
    '长达两年多达七十次的心理咨询': 'two years and as many as seventy counseling sessions',
    '我积攒的勇气慢慢让我重新长出手和脚': 'The courage I saved up slowly let me grow my hands and feet back',
    '我的创作根基是“真诚”': 'The root of my writing is “sincerity”',
    '自己才是自己人生的第一负责人': 'I am the one who answers first for my own life',
    '我就能让我的未来更确定一点': 'then I could make my future a little more certain',
    '所以我不想要再去做循规蹈矩的事情': 'so I no longer want to just follow the rules',
    '宇宙充满混乱，但我们始终拥有选择': 'The universe is full of chaos, but we always have a choice',
    '因为，它就是我，我就是它。': 'Because it is me, and I am it.',
    '我在用身体为情绪买单': 'My body was paying for my emotions',
    '所以我到底在急些什么呢？': 'So what was I in such a hurry for?',
    '一个人一天能有 3 个小时高精力': 'A person gets about 3 hours of high energy a day',
    '说出来，本身就是勇气的一部分': 'Saying it out loud is itself part of courage',
    '请捍卫自己愤怒的权利': 'Defend your right to be angry',
    '上海是一片不错的栖息地': 'Shanghai is a good place to dwell',
    '先把自己的情感放到第一位': 'Put your own feelings first',
    '每一场无领导小组会议，其实都代表了一个微缩的项目流程': 'Every leaderless group discussion is really a project in miniature',
    '我们可以用这套逻辑去理解心理咨询': 'We can use the same logic to understand counseling',
    '形成复杂多变的三角关系': 'forming a complex, ever-shifting triangle',
    '这个感受越真诚，越纯朴，往往越能打动人心': 'The more sincere and plain the feeling, the more it tends to move people',
    '请允许它在你身体里自然地流动': 'Let it flow through your body naturally',
    '想到这里时，我终于完全解套了。': 'Having thought it through, I was finally free of it.',
    '想到这里，我也有点解套。': 'Having thought it through, I felt a little freer too.',
    '惟江上之清风，与山间之明月': 'Only the cool breeze on the river, and the bright moon between the mountains',
    '此情可待成追忆，只是当时已惘然': 'This feeling could wait to become a memory, yet even then I was already lost',
    '人应该诗意地栖息在大地上': 'People should dwell poetically on this earth',
    '让我成为一个自己都无法预料的人': 'Let me become someone even I can’t predict'
  };
  // 文章题目（文章页本身仍是中文）
  var A = {
    '01': 'Hard to Meet, Harder to Part', '02': 'Hoping for Life’s Unexpected Surprises', '03': 'I Will Never Forgive Xi’an Jiaotong University',
    '04': 'A Typhoon Work-from-Home Day in Shanghai', '05': 'People Should Dwell Poetically on This Earth', '06': 'Thesis Acknowledgments (II)',
    '07': 'Thesis Acknowledgments (I)', '08': 'What I Think About When I Tutor', '09': 'The First Step to Loving Yourself: Stop Treating Your Body as Other',
    '10': 'Chengdu at Spring Festival', '11': 'May the Sun Shine on Your Face', '12': 'The Sea Wind on Dongshan Island Dried Me Out After the Job Hunt',
    '13': 'In the Age of Clicks, I Choose to Write Slowly', '14': 'Staying Humble', '15': 'The Job Is Settled, and I’m Less Sure Than Ever',
    '16': 'Job Hunt: Leaderless Group Discussions (II)', '17': 'Job Hunt: Leaderless Group Discussions (I)', '18': 'How Highly Sensitive People Can Help Themselves (I)',
    '19': 'The Job Hunt', '20': 'I Don’t Miss the Past'
  };
  var W = {'感受': 'feelings', '世界': 'world', '选择': 'choice', '未来': 'future', '身体': 'body', '幸福': 'happiness', '写作': 'writing', '当下': 'the present',
           '栖息': 'dwelling', '痛苦': 'pain', '母亲': 'mother', '自由': 'freedom', '平静': 'calm', '敏感': 'sensitivity', '愤怒': 'anger', '勇气': 'courage', '真诚': 'sincerity'};

  ME.articles.forEach(function(a){ if(A[a.id]){ a.s = a.t = A[a.id]; } });
  function ref(r){
    if(!r || !r.q) return;
    if(Q[r.q]) r.en = Q[r.q];
    var m = /a\/(\d+)\.html/.exec(r.href || ''); if(m && A[m[1]]) r.s = r.t = A[m[1]];
  }
  S.hero.line = 'A sheet covered in writing, folded many times over.';
  ref(S.hero.q); ref(S.end.q);
  S.folds.forEach(function(f, i){ var e = FOLDS[i]; if(e) for(var k in e) f[k] = e[k]; ref(f.q); f.refs.forEach(ref); });
  S.ways.forEach(function(w, i){ if(WAYS[i]) w.title = WAYS[i]; w.refs.forEach(ref); });
  ME.words.forEach(function(w){ if(W[w.w]) w.en = W[w.w]; });

  // 共用的界面词典（fold.js、apeng.js 里的 t('…')）
  window.T = {
    '陈鹏飞': 'Pengfei Chen', '折痕': 'Crease', '从': '', '第 {n} 步 · ': 'Step {n} · ', '原文 ↗': 'Original, in Chinese ↗', '（中文）': ' (in Chinese)',
    '声音已打开': 'Sound on', '打开声音再往下': 'Turn on sound, then scroll',
    '：{n} 次': ': {n} times', '<b>{w}</b>出现 {n} 次，在 {m} 篇文章里': '<b>{w}</b> appears {n} times across {m} essays', '看全部 {n} 篇': 'See all {n} essays',
    '{n} 个小时': '{n} hours', '本书': 'books', '条笔记': 'notes', '天在读': 'days reading', '读得最久：': 'Read the longest: ', '{n} 小时': '{n} h',
    // 阿鹏
    '吉祥物阿鹏，点一下听它说下一句': 'Peng the mascot, click to hear the next line',
    '嗨，我是阿鹏～<br>往下滑，这只纸飞机会<b>一折一折拆开</b>。每道折痕里，藏着他的一次变化。<small>点我一下，声音就来了</small>':
      'Hi, I’m Peng!<br>Scroll down and this paper plane <b>unfolds one crease at a time</b>. Each crease holds one way he has changed.<small>Click me and the sound comes on</small>',
    '每一折都配着他自己写的原话，点出处能跳回文章里的那一句。': 'Every crease comes with his own words. Click a source to jump to that sentence in the essay (in Chinese).',
    '再往后，是他反复写到的词，和他读过的书：一个点就是一小时。': 'Further down: the words he keeps coming back to, and the books he has read. One dot is one hour.',
    '滑到最后，纸飞机会重新折好，再飞一次。': 'At the very end, the plane folds itself back up and flies again.',
    '声音开着呢。嫌吵的话，右上角可以关。': 'Sound is on. If it’s too much, turn it off at the top right.'
  };

  // 页面里写死的文字：元素上的 data-en（内容）、data-en-label（aria-label）、data-en-href（链接）
  document.title = 'Pengfei Chen | Paper Plane';
  var md = document.querySelector('meta[name=description]');
  if(md) md.content = 'Pengfei Chen’s personal page: a sheet covered in his writing, unfolded and folded back into a paper plane. Each fold is one way he has changed, and each quote links to the sentence in his essay.';
  document.querySelectorAll('[data-en]').forEach(function(el){ el.innerHTML = el.getAttribute('data-en'); });
  document.querySelectorAll('[data-en-label]').forEach(function(el){ el.setAttribute('aria-label', el.getAttribute('data-en-label')); });
  document.querySelectorAll('[data-en-title]').forEach(function(el){ el.setAttribute('title', el.getAttribute('data-en-title')); });
  document.querySelectorAll('[data-en-href]').forEach(function(el){ el.setAttribute('href', el.getAttribute('data-en-href')); });
  var lb = document.getElementById('lng'); if(lb) lb.lang = 'zh-CN';
  window.ME_EN = true;
})();
