// 生成三个版本共用的页面块，放进页面里预留的占位元素。必须在 core.js 之前加载。
// 界面文字一律写成 t('中文')：英文页先加载 data/en.js（window.T 词典），中文页不加载，原样返回中文。
(function(){
  var t = window.t = function(s){ return (window.T && window.T[s]) || s; };
  function svg(d){ return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  var svgA = svg;
  var MAIL = '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>';
  var COPY = '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>';
  function mail(addr, name, primary){
    return '<span class="mail' + (primary ? ' primary' : '') + '"><a href="mailto:' + addr + '">' + svg(MAIL) + addr + '</a>' +
      '<button class="copy" type="button" data-copy="' + addr + '" aria-label="' + t('复制' + name + '邮箱') + '" title="' + t('复制') + '">' + svg(COPY) + '</button></span>';
  }
  var FACTS = [
    ['<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>', '产品', '出海 AI 视频 VerseIn'],
    ['<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>', '学历', '西安交通大学硕士'],
    ['<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>', 'Vibe Coding', 'Claude Code、Codex'],
    ['<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>', '城市', '不限，随时到岗']
  ];
  // 首屏的一句定位和三个结果（2026-11-11）：数字只取案例页已有的，每个链到对应案例
  var LEAD = '负责过出海 AI 视频产品 VerseIn 的模板运营、定价与订阅、投放增长，以及大模型 API 网关 ToRouter 的激活方案。';
  var PROOFS = [
    ['92', '%', '排队预计时间改版后的承诺达成率（月包；年包 100%）', 'cases/queue-eta.html'],
    ['6', '倍', '两个相近模板的归因收入差，查出原因在互动反应', 'cases/template-ops.html'],
    ['4', '个', '官网需求，用 Codex 独立开发并上线', 'cases/torouter.html']
  ];
  var DOC = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>';
  var BASE = window.BASE || '', ZH = window.SITE_LANG !== 'en';
  // 投递邮件：主题和正文预先写好，招聘方填上公司和岗位就能发
  var APPLY = 'mailto:xiaguwuwu@gmail.com?subject=' + encodeURIComponent(t('岗位邀约：AI 产品经理')) +
    '&body=' + encodeURIComponent(t('陈鹏飞你好：\n\n我是（公司）的（姓名、职位），想和你聊聊（岗位名称）。\n岗位链接或 JD：\n\n方便的联系时间：\n'));
  var put = function(id, html){ var el = document.getElementById(id); if(el) el.innerHTML = html; };

  put('idrow',
    '<span class="avatar" aria-hidden="true">' + t('陈') + '</span><div class="nm"><b>' + t('陈鹏飞') + '</b><span>' + t('产品经理') + '</span></div>' +
    '<div class="reach" id="contact"><span class="status"><i aria-hidden="true"></i><span class="shine">' + t('正在找工作') + '</span></span>' +
    mail('xiaguwuwu@gmail.com', 'Gmail ', true) + mail('534963019@qq.com', 'QQ ', false) +
    (ZH ? '<a class="cv" href="' + BASE + 'resume.html">' + svg(DOC) + '简历</a>' : '') + '</div>');
  put('lead', t(LEAD));
  put('proofs', PROOFS.map(function(p){ return '<li><a href="' + BASE + (ZH ? '' : 'en/') + p[3] + '"><b>' + p[0] + '<i>' + t(p[1]) + '</i></b><span>' + t(p[2]) + '</span></a></li>'; }).join(''));
  put('facts', FACTS.map(function(f){ return '<li>' + svg(f[0]) + '<span class="k">' + t(f[1]) + '</span><b>' + t(f[2]) + '</b></li>'; }).join(''));
  put('studio',
    '<div class="panel">' +
      '<div class="field"><span class="flab" id="model-lab">' + t('能力模型') + '</span><div class="picker">' +
        '<button class="pick" id="pick" type="button" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="model-lab pick"></button>' +
        '<ul class="menu" id="menu" role="listbox" aria-labelledby="model-lab" hidden></ul></div></div>' +
      '<div class="field"><span class="flab">' + t('项目') + '</span><dl class="brief" id="brief"></dl></div>' +
      '<div class="field"><span class="flab">' + t('参数') + '</span><dl class="params" id="params"></dl></div>' +
    '</div>' +
    '<div class="canvas"><div class="out" id="bench" aria-live="polite"></div></div>');
  put('sections',
    '<section class="sec" id="projects"><div class="sec-h"><h2>' + t('项目') + '</h2></div><ul class="plist" id="plist"></ul></section>' +
    '<section class="sec" id="works"><div class="sec-h"><h2>' + t('作品') + '</h2><div class="shelf-nav"><button type="button" class="sn" data-dir="-1" aria-label="' + t('往前翻') + '">' + svgA('<path d="m15 18-6-6 6-6"/>') + '</button><button type="button" class="sn" data-dir="1" aria-label="' + t('往后翻') + '">' + svgA('<path d="m9 18 6-6-6-6"/>') + '</button></div></div><div class="shelf" id="shelf" role="list" aria-label="' + t('作品书架') + '"></div></section>' +
    '<section class="sec" id="exp-sec"><div class="sec-h"><h2>' + t('经历') + '</h2></div><dl class="exp" id="exp"></dl></section>' +
    '<section class="sec apply" id="apply"><div class="apply-in">' +
      '<div><h2>' + t('有合适的岗位，<br>直接写邮件给我') + '</h2></div>' +
      '<div class="ap-cta"><a class="ap-btn" href="' + APPLY + '">' + svg(MAIL) + t('写邮件给我') + '<span class="rp" aria-hidden="true"></span></a>' +
      '<span class="cursor" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 2.5 19.5 12l-6.6 1.6-3.4 6.4z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg></span></div>' +
    '</div></section>');
  // 「常见问题」写在页面源码里（给爬虫和 AI 引擎读），这里把它挪到经历下面、联系上面
  var fq = document.getElementById('faq'), ap = document.getElementById('apply'); if(fq && ap) ap.parentNode.insertBefore(fq, ap);
  document.body.insertAdjacentHTML('beforeend', '<div class="modal" id="modal" role="dialog" aria-modal="true" aria-label="' + t('模板详情') + '"><div class="sheet" id="sheet"></div></div>');
})();
