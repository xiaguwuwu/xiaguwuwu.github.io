// 语言：访客系统语言是中文（含繁体）就看中文，其他语言看英文；点过右上角的切换按钮，就按 localStorage 的 site-lang。
// 每页 <head> 里第一个脚本，同步加载。
//   求职主页：<html data-lang-page="zh|en" data-alt="对应语言页面的相对路径">，语言不符就跳过去（带上 #区块）；爬虫不跳。
//   个人主页：不写 data-lang-page，只给 <html> 设 lang，脚本按 window.SITE_LANG 取文案。
(function(){
  var d = document.documentElement, page = d.getAttribute('data-lang-page'), saved = null;
  try { saved = localStorage.getItem('site-lang'); } catch(e){}
  var sys = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  var want = saved === 'zh' || saved === 'en' ? saved : (/^zh\b/i.test(sys) ? 'zh' : 'en');
  window.SITE_LANG = page || want;
  window.setSiteLang = function(l){ try { localStorage.setItem('site-lang', l); } catch(e){} };
  if(!page){ d.lang = want === 'en' ? 'en' : 'zh-CN'; return; }
  var bot = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|whatsapp|telegram|lighthouse/i.test(navigator.userAgent);
  if(want !== page && !bot && d.getAttribute('data-alt')){
    d.style.visibility = 'hidden';
    location.replace(d.getAttribute('data-alt') + location.hash);
  }
})();
