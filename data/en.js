// 求职主页的英文内容和界面词典，只在英文页（en/、en/dark/）加载，放在 projects.js、works.js 之后、shell.js 之前。
// 规则：只翻译中文版（data/projects.js、works.js、shared/*.js）已有的事实，不新增数字和技能；<mark> 的位置和数量与中文一致。
// 改了中文内容要同步改这里。用词先过 ../../简历用词避雷.md 第六节。
(function(){
  var P = window.PROJECTS;
  function set(k, o){ for(var f in o) P[k][f] = o[f]; }

  set('template', {
    title: 'Trend- and Data-Driven Template Operations', role: 'Product Manager', href: 'en/cases/template-ops.html',
    line: 'Two similar templates: <mark>51.6% vs 19.5% share rate</mark> and a 6× gap in attributed revenue; homepage ranking became a formula, re-run every two weeks',
    bg: 'Nearly 600 templates on the homepage. New template ideas came from gut feel and the homepage order was set by hand, while the first row got <mark>about 13×</mark> the exposure of the rows behind it.',
    goal: 'Use <mark>trend monitoring</mark> to pick topics, and event data to drive template iteration and homepage ranking.',
    process: ['Ran daily AI-generated trend reports on Reddit, Instagram and Xiaohongshu, 120+ so far',
              'Put <mark>backend config, event funnels and sampled video frames</mark> side by side and compared templates by mechanic',
              'Turned homepage ranking into a weighted formula; a script re-ranks it every two weeks and writes to production'],
    result: ['Two similar templates: share rate <b>51.6%</b> vs <b>19.5%</b>, attributed revenue <b>6</b>× apart. Frame by frame, the only difference was <mark>whether the little figure reacts to the user</mark>',
             'Wrote down 4 rules for topics and pricing; homepage ranking became a repeatable, checkable process']
  });
  set('pricing', {
    title: 'Pricing and Subscription Benefits', role: 'Product Manager', href: 'en/cases/pricing-unlimited.html',
    line: 'Priced on one <mark>cost basis</mark> across upstream providers; designed an unlimited-generation benefit after studying 9 competitors, then iterated three rounds',
    bg: 'Several video-model providers billed in different units (credits, seconds, clips), but the backend had <mark>a single coin field</mark>, so price and cost never lined up. Subscriptions needed “unlimited generation” as a selling point, and video generation is expensive.',
    goal: '<mark>One cost basis</mark> and one price structure, plus an unlimited-generation benefit with cost under control.',
    process: ['Built a <mark>pricing calculator</mark> on one cost basis; backend price became base price × resolution and duration multipliers',
              'Studied unlimited-generation terms at <b>9</b> competitors; designed per-tier model lists, spec caps, and a queue users can skip with credits',
              'Iterated three rounds on event data after launch: more exposure, a new default channel, paywall stats split by trigger'],
    result: ['The pricing calculator became <mark>the company’s single source for plan pricing and margin estimates</mark>',
             'After launch, shipped <b>3</b> rounds of changes based on event data']
  });
  set('queue', {
    title: 'Free-Queue Wait Estimates', role: 'Product Manager', href: 'en/cases/queue-eta.html',
    line: 'Recalibrated on 692 release records; after launch the <mark>upper bound held 92% of the time on monthly plans, 100% on annual</mark>',
    bg: 'Free generations wait in a queue. Releases are throttled by a daily budget and light users go first, so it is not first come, first served. The first two versions showed people ahead and time left, and users called both <mark>“a scam”</mark>.',
    goal: 'Make the estimate <mark>believable</mark>: keep the range we show whenever possible, and say so plainly when it runs over.',
    process: ['Added tracking and compared promise with reality across a week of 692 release records: <mark>the p90 actual wait was 3.1× the promise</mark>',
              'Looked at queue displays in 7 products: minute-level waits show no time at all, and if you do show one, too long is safer than too short',
              'Switched to a conservative range calibrated at p90, said so plainly on overruns, and showed the range before submission'],
    result: ['Shipped to production on Oct 22; the upper bound held <b>92%</b> of the time on monthly plans and <b>100%</b> on annual']
  });
  set('growth', {
    title: 'Ad Landing Pages and New-User Conversion', role: 'Product Manager', href: 'en/cases/growth-landing.html',
    line: '<mark>The first landing pages are live</mark> and ops builds them in the backend; found that email sign-up loses about 75% of ad attribution',
    bg: 'The ads team had a batch of long-tail search terms, but every landing page needed <mark>a dev slot and a release</mark>. Attribution got lost at sign-up, and the path from visitor to paying user had gaps.',
    goal: 'Make landing pages <mark>configurable in the backend</mark>, fix attribution, and smooth out new-user conversion.',
    process: ['Planned 4 kinds of configurable landing pages: theme pages, model pages, a long-tail keyword workbench, a scenario workbench',
              'Walked the 5 stages and 20 steps from landing to payment and listed <mark>33 conversion hooks</mark>, 13 of them in phase one',
              'Found 3 rule conflicts, e.g. buying a coin pack removed the first-month discount for good'],
    result: ['<mark>The first theme pages and model pages are live</mark>; ops builds them in the backend without a release',
             'Found that email sign-up loses about <b>75%</b> of ad attribution; the fix is in phase one']
  });
  set('ai', {
    title: 'Rebuilding Product Work with Claude Code', org: 'VerseIn, ToRouter', role: 'Initiator', href: 'en/cases/ai-workflow.html',
    line: 'Trends, config, tagging and data pulls now run as <mark>skills and scheduled tasks</mark>; 11 weekly tag reviews so far',
    bg: 'I covered both model lines, video and image (30+ models), nearly 600 templates, plus pricing and new-user conversion. <mark>Repetitive work</mark> such as trend monitoring, template config and data pulls ate much of the week.',
    goal: 'Turn frequent repetitive work into reusable <mark>skills and scheduled tasks</mark>, and keep the time for analysis and decisions.',
    process: ['Built trend monitoring, viral-video breakdowns, template config, weekly tag updates and data analysis as <mark>skills and scheduled tasks</mark>',
              'Every analysis keeps its script and a snapshot taken before writing, so the next round simply re-runs',
              'Renames, deletions and anything that spends money only produce a proposal for a person to approve'],
    result: ['<b>11</b> weekly tag reviews; renames, merges and deletions only as proposals',
             'Shipped <b>4</b> website requirements on my own with AI coding']
  });
  set('torouter', {
    title: 'ToRouter Activation and Retention Plan', role: 'AI Product Manager', href: 'en/cases/torouter.html',
    line: 'A <mark>four-layer plan from activation to growth</mark>, built as a 7-page interactive prototype; shipped 4 website requirements with AI coding',
    bg: 'New users of this LLM API gateway <mark>didn’t know which tool to connect first</mark> or which model to pick, and had no concrete reason to top up. Check-ins, invites and coupons were scattered; rates and usage were hard to see.',
    goal: 'Design an ops plan <mark>from activation to growth</mark> that makes onboarding and the first top-up easier.',
    process: ['Designed a four-layer plan: activation, payment, retention, growth',
              'Built an interactive prototype of <b>7</b> pages with AI coding for review'],
    result: ['Built and shipped <b>4</b> website requirements myself with Codex: event tracking, blog image upload, country and region pages, short-form legal pages']
  });

  window.MODELS.forEach(function(m){
    var x = {template: ['Product Ops', 'Trends, events, homepage ranking'], pricing: ['Pricing and Benefits', 'Cost basis, subscription benefits'],
             growth: ['Ads and Growth', 'Landing pages, new-user conversion'], ai: ['Vibe Coding', 'Skills and scheduled tasks']}[m.key];
    if(x){ m.name = x[0]; m.sub = x[1]; }
  });

  window.EXP = [
    { time: '2026.05 – 2026.11', org: 'Zuler International', city: '上海', role: 'AI Product Manager',
      items: ['<i class="tag">VerseIn</i>AI video and image generation for global markets: product ops, pricing and subscription benefits, new feature planning, ad landing pages',
              '<i class="tag">ToRouter</i>LLM API gateway: activation and retention plan; shipped <mark>4 website requirements</mark> with AI coding'] },
    { time: '2025.06 – 2025.09', org: 'Alibaba Cloud Intelligence Group', city: '杭州', role: 'Infrastructure R&amp;D Intern',
      items: ['Optimized artifact import for Kubernetes cloud environments in Go', 'Cut artifact metadata queries from minutes to <mark>milliseconds</mark>'] },
    { time: '2025.03 – 2025.06', org: 'AutoArk', city: '上海', role: 'AI Product Manager Intern',
      items: ['Financial AI agent: competitor research, requirements analysis and PRD', 'AI early-education robot: built a multimodal interaction workflow in Dify'] },
    { time: '2023.09 – 2026.06', org: 'Xi’an Jiaotong University', city: '西安', role: 'Master’s, Network and Information Security',
      items: ['Research: LLM-based anomaly detection for distributed devices', 'First-Class Freshman Scholarship, Special-Class Scholarship in year one, Outstanding Graduate Student 2024'] },
    { time: '2019.09 – 2023.07', org: 'University of Electronic Science and Technology of China', city: '成都', role: 'Bachelor’s, Information and Software Engineering',
      items: ['GPA 3.92/4.00, top 8% of the major', 'China Undergraduate Mathematical Contest in Modeling, <mark>National First Prize</mark>; MCM/ICM Honorable Mention', 'Outstanding Student Scholarship, three years in a row'] }
  ];

  window.CHARTS = {
    template: [
      { type: 'pair', title: 'Two similar templates: same model, same input, and A costs 50% more', series: ['A: finger pokes the figure', 'B: figure stands in a palm'], unit: '%',
        rows: [['Click rate', 13.3, 9.6], ['Share rate', 51.6, 19.5]] },
      { type: 'stats', items: [['6×', 'attributed revenue, A vs B'], ['4', 'topic and pricing rules written down'], ['~600', 'templates re-ranked by formula every two weeks']] }
    ],
    pricing: [
      { type: 'flow', title: 'Backend price structure', op: '×', steps: ['Base price', 'Resolution multiplier', 'Duration multiplier'], end: 'Price' },
      { type: 'stats', items: [['9', 'competitors’ unlimited-generation terms studied'], ['3', 'rounds of changes on event data'], ['1', 'single source for pricing and margins']] }
    ],
    queue: [
      { type: 'bars', title: 'Before: actual wait vs promise (692 release records)', unit: '×',
        rows: [['Promised', 1], ['Actual p90', 3.1, true]] },
      { type: 'meters', title: 'After: upper bound held', rows: [['Monthly', 92], ['Annual', 100]] }
    ],
    growth: [
      { type: 'status', title: '4 kinds of configurable landing pages', items: [['Theme pages', 'Live', true], ['Model pages', 'Live', true], ['Keyword workbench', 'In planning', false], ['Scenario workbench', 'In planning', false]] },
      { type: 'bars', title: 'New-user conversion hooks', rows: [['Listed', 33], ['Phase one', 13, true]] },
      { type: 'meters', title: 'Attribution gap found', rows: [['Ad sources lost at email sign-up', 75]] }
    ],
    ai: [
      { type: 'flow', title: 'Steps now run as skills and scheduled tasks', steps: ['Trends', 'Viral breakdowns', 'Template config', 'Tag ops', 'Data analysis'] },
      { type: 'stats', items: [['11', 'weekly tag reviews'], ['4', 'website requirements shipped with AI coding'], ['30+', 'models owned by one person']] }
    ],
    torouter: [
      { type: 'flow', title: 'New-user ops plan', steps: ['Activation', 'Payment', 'Retention', 'Growth'] },
      { type: 'stats', items: [['7', 'prototype pages for review'], ['4', 'website requirements shipped solo']] }
    ]
  };

  // 作品：提示词本来就是英文，只换标题、分类、说明
  var CAT = {'手办小人': 'Miniatures', '人像玩法': 'Portrait', '节日体育': 'Holidays and Sports', '萌宠玩具': 'Pets and Toys'};
  var WK = {
    'miniature-poke': ['Squishy Mini Me', 'Data showed that what makes miniature templates work is a figure that reacts to you. This version makes the figure soft silicone that squashes and springs back, so the interaction is the star of the shot.'],
    'miniature-protest': ['Palm-Sized Protest', 'Same palm-sized figure, now with feelings: it sits in your palm and throws a tantrum. Part of a series built on “the figure reacts”.'],
    'miniature-stay': ['The Mini Me Who Won’t Leave', 'Palm-sized series: the figure hugs your finger and won’t let go. Emotion gets shared more than plain display.'],
    'chibi-burst': ['Flash into a Figurine', 'Within two seconds the person bursts into light and reassembles as a chibi figurine. The transformation sits at the start to hook viewers in the first 3 seconds.'],
    'hair-style': ['One-Tap Hairstyles', 'The most-iterated template: transitions, pacing and the number of hairstyle changes were reworked until the face stayed the same person in every look.'],
    'kpop-idol': ['Idol in the Dark', 'A quiet opening, a sudden lighting change, then the transformation. The contrast is the hook.'],
    'ending-fairy': ['Ending Fairy Freeze', 'Recreates the “ending fairy” close-up from K-pop music shows, a running meme on social media.'],
    'anime-power': ['Hand Signs, Power Up', 'Actions written in order: look at the camera, form hand signs, blue light in the hands. The fixed order keeps the model from scrambling the rhythm.'],
    'food-burst': ['Slow-Mo Food Burst', 'You hold up your own drink or food and it bursts upward in super slow motion. Low input bar: any photo of food in hand works.'],
    'teacup': ['Teacup Ride at Night', 'Only the face from the input photo is kept; the background is rebuilt as an amusement park at night, which fixes messy backgrounds in casual photos.'],
    'caught-live': ['Caught on the Big Screen', 'The sports-broadcast meme where a fan gets caught on camera: zoning out over pizza, then freezing on noticing the lens. Iterations moved the “caught” reaction to the final beat.'],
    'birthday': ['Birthday Surprise', 'A cut to black, then a birthday scene. Took more than ten rounds to keep the person’s identity and the transition timing stable.'],
    'pet-machine': ['Claw Machine Catches Your Pet', 'Your pet becomes the prize pulled out of a claw machine. Iterations focused on the prize chute and a believable grab.'],
    'claw-blindbox': ['Blind Box Reveals You', 'One box in a blind-box machine gets picked and opens to a tiny figure of you. Unboxing is a built-in suspense hook.'],
    'plush-capsule': ['Plush in a Capsule Machine', 'A macaron-colored capsule machine drops a plush toy. Colors and machine design are fixed so the series looks consistent.'],
    'raccoon-cam': ['Doorbell Cam Raccoon', 'Mimics a fixed home doorbell-camera view, the popular “caught on camera” meme on social media.']
  };
  (window.WORKS || []).forEach(function(w){ var x = WK[w.slug]; if(x){ w.title = x[0]; w.note = x[1]; } w.catName = CAT[w.catName] || w.catName; });

  // 界面词典：键是共用脚本里 t('…') 的中文原文
  window.T = {
    // 顶栏、首屏
    '陈': 'P', '陈鹏飞': 'Pengfei Chen', '产品经理': 'Product Manager', '正在找工作': 'Open to work',
    '复制Gmail 邮箱': 'Copy Gmail address', '复制QQ 邮箱': 'Copy QQ address', '复制': 'Copy', '已复制': 'Copied', '复制这个邮箱': 'Copy this address',
    '产品': 'Product', '学历': 'Education', '方向': 'Focus', '城市': 'Location',
    '出海 AI 视频 VerseIn': 'VerseIn, AI video for global markets', '西安交通大学硕士': 'Master’s, Xi’an Jiaotong University',
    'AIGC 应用、AI 工具': 'AIGC apps, AI tools', 'Claude Code、Codex': 'Claude Code, Codex', '不限，随时到岗': 'Any city, available now',
    // 工作台、项目
    '能力模型': 'Capability', '项目': 'Projects', '参数': 'Details', '背景': 'Context', '目标': 'Goal', '过程': 'Process', '结果': 'Results',
    '角色': 'Role', '时间': 'Dates', '读完整案例：': 'Read the full case: ', '读完整案例': 'Read the full case',
    // 作品
    '作品': 'Work', '往前翻': 'Previous', '往后翻': 'Next', '作品书架': 'Work shelf', '模板详情': 'Template details',
    '模型': 'Model', '迭代': 'Iterations', '{n} 轮定稿': '{n} rounds to final', '迭代 {n} 轮定稿': '{n} rounds to final', '，': ', ',
    '看输入和提示词': 'See input and prompt', '关闭': 'Close', '输入': 'Input', '输入图': 'Input image', '只用文字提示词': 'Text prompt only',
    '输出': 'Output', '我写的提示词': 'My prompt', '可以拨动水面的模板视频': 'Template video with a water surface you can stir',
    // 经历
    '经历': 'Experience', '经历的展示方式': 'How to show experience', '地图': 'Map', '列表': 'List', '重播路线': 'Replay the route',
    '成都': 'Chengdu', '西安': 'Xi’an', '上海': 'Shanghai', '杭州': 'Hangzhou', '：': ': ', '、': ', ',
    '经历地图：成都、西安、上海、杭州': 'Experience map: Chengdu, Xi’an, Shanghai, Hangzhou',
    '返回行程': 'Back to the route', '在列表里看全部经历': 'See all experience as a list',
    // 联系
    '有合适的岗位，<br>直接写邮件给我': 'Have a role in mind?<br>Just email me', '写邮件给我': 'Email me',
    '岗位邀约：AI 产品经理': 'Opportunity: AI Product Manager',
    '陈鹏飞你好：\n\n我是（公司）的（姓名、职位），想和你聊聊（岗位名称）。\n岗位链接或 JD：\n\n方便的联系时间：\n':
      'Hi Pengfei,\n\nI’m (name, title) at (company), and I’d like to talk with you about (role).\nJob link or description:\n\nGood times to talk:\n',
    // 吉祥物阿鹏（提到陈鹏飞用 he）
    '我是阿鹏，「鹏飞」的鹏。他做产品，我带路。往下滑，我跟着你飞。': 'I’m Peng, the “Peng” in Pengfei: a giant bird from Chinese legend. He builds products, I show people around. Scroll down and I’ll fly along.',
    '护目镜戴好了，随时能起飞。': 'Goggles on. Ready for take-off.',
    '这是他的工作台。左边换一个能力模型，我给你跑一遍对应的项目。': 'This is his workbench. Switch the capability on the left and I’ll run that project for you.',
    '运营、定价、增长、Vibe Coding，四种活儿他都干过。挑一个？': 'Product ops, pricing, growth, vibe coding: he has done all four. Pick one?',
    '6 个项目，点开每个都有数。不信你点。': 'Six projects, and every one opens to real numbers. Go on, open one.',
    '书脊平时是黑白的，碰一下才上色。试试。': 'The spines stay black and white until you touch them. Try it.',
    '那架小飞机飞得没我好看，但路线是对的。': 'That little plane doesn’t fly as nicely as I do, but it has the route right.',
    '常被问到的 8 件事都在这儿，省得你发邮件来问。': 'The eight things people ask most are all here, so you don’t have to email to ask.',
    '想知道他有没有技术背景？第 6 条。': 'Wondering whether he has a technical background? See No. 6.',
    '都看到这儿了，说明有戏。写封邮件吧，主题和正文他都起好头了。': 'You read this far, so there may be a fit. Send an email. He has already started the subject and body for you.',
    '有合适的岗位就写邮件，我替他盯着邮箱。': 'If you have a role for him, send an email. I’ll keep an eye on the inbox.',
    '连点我三下试试。': 'Try clicking me three times in a row.',
    '别戳了别戳了，我晕。': 'Stop poking, stop poking. I’m dizzy.',
    '转了一圈，护目镜差点飞出去。': 'One full spin. My goggles nearly flew off.',
    '常见问题': 'FAQ',
    '吉祥物阿鹏，点一下看提示': 'Peng the mascot, click for a tip', '关闭提示': 'Close tip',
    '我是阿鹏，「鹏飞」的鹏。他做产品，我看门。': 'I’m Peng, the “Peng” in Pengfei: a giant bird from Chinese legend. He builds products, I mind the door.',
    '先看工作台': 'Start with the workbench',
    '他在 VerseIn 做的四类事都在这儿，换一个能力模型就换一个项目。': 'The four kinds of work he did at VerseIn are all here. Switch the capability and the project switches too.',
    '去看项目': 'See projects',
    '我最喜欢第 3 个：排队时间被用户叫「骗局」，他改完以后月包 92% 说到做到。': 'My favourite is No. 3: users called the queue estimate a “scam”, and after his rework it held 92% of the time on monthly plans.',
    '去看作品': 'See work',
    '这些视频是他自己写提示词跑出来的。抽一本，提示词夹在里面。': 'He wrote the prompts and ran these videos himself. Pull one off the shelf; the prompt is tucked inside.',
    '去看经历': 'See experience',
    '成都、西安、杭州、上海，这一路我都跟着飞。点机票再飞一遍。': 'Chengdu, Xi’an, Hangzhou, Shanghai: I flew the whole way with him. Click the ticket to fly it again.',
    '联系我': 'Contact',
    '有合适的岗位就写邮件吧，主题和正文他都起好头了。': 'Have a role for him? Send an email. He has already started the subject and body for you.',
    '回到顶部': 'Back to top',
    '你滚页面的时候，我在跟着飞。': 'When you scroll, I fly along.',
    '再点我一下，我换个地方站。': 'Click me again and I’ll move to the other side.',
    '放着不动我会打瞌睡，别介意。': 'Leave me alone for a while and I doze off. Don’t mind me.',
    '他在找 AI 产品经理的工作，城市不限，随时到岗。': 'He’s looking for AI product manager roles, any city, available now.',
    // 点名字进个人主页的转场
    '嘘——': 'Shh—', '你不小心闯进了<br>我的个人世界': 'You’ve wandered into<br>my personal world', '进去看看': 'Take a look', '先回简历': 'Back to résumé'
  };
})();
