(()=>{
  'use strict';
  const data=window.PD_SITE_DATA,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  if(!data){document.body.textContent='Не удалось загрузить материалы. Убедитесь,что все файлы сайта находятся рядом.';return;}
  const store={get(key,fallback){try{return JSON.parse(localStorage.getItem('pd.design.site.'+key))??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem('pd.design.site.'+key,JSON.stringify(value));}catch{}}};
  const viewDefaults={page:'prototype',category:'all',search:'',order:'new',document:'role-context',role:'internal-v',width:'390'};
  const state={...viewDefaults,...store.get('view',{})};
  const frames=new Map(),loaded=new Set();let syncing=false,toastTimer,fullscreenRestore=null;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  function toast(text){const n=$('#site-toast');n.textContent=text;n.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.hidden=true,4500);}
  function saveView(){store.set('view',state);}
  function frameBootstrap(){
    const config=window.__PD_FRAME_CONFIG;let cached={};try{cached=JSON.parse(localStorage.getItem('pd.design.frame.'+config.id))||{};}catch{}
    const send=(type,payload={})=>parent.postMessage({pdSite:true,type,id:config.id,...payload},'*');
    function status(){const app=document.querySelector('.phone'),core=app?.verifierApp,timer=app?.verifierTimerDemo;if(core){const base=app.verifierBridge?.getBaseState?.()?.modelContent||{};send('state',{view:core.getPreviewView?.()||{...base,route:core.getRoute().route,theme:core.api.getSettings().theme,labelAppearance:app.dataset.labelAppearance,timerStyle:timer?.getState().style,timerPlaying:timer?.getState().playing,minutes:timer?.getDisplayMinutes()}});}const role=document.querySelector('[data-epc-role]'),process=document.querySelector('[data-epc-process]');if(role&&process)send('scenario',{role:role.value,process:process.value,processes:[...process.options].map(o=>({value:o.value,label:o.textContent}))});}
    window.openai={widgetState:cached,setWidgetState:async snapshot=>{cached=snapshot;window.openai.widgetState=snapshot;try{localStorage.setItem('pd.design.frame.'+config.id,JSON.stringify(snapshot));}catch{}status();},sendFollowUpMessage:async value=>send('notice',{text:value?.prompt||'Это сохранённый исследовательский макет.'})};
    class Tweak{
      constructor(options={}){this.options=options;this.supported=true;this.box=document.createElement('details');this.box.className='site-tweak';const summary=document.createElement('summary');summary.textContent=options.container?.getAttribute('aria-label')||'Настройки примера';this.box.append(summary);options.container?.parentNode?.insertBefore(this.box,options.container);}
      control(object,key,options,type){const label=document.createElement('label');label.textContent=options.label||key;const input=document.createElement(type==='select'?'select':'input');if(type!=='select')input.type=type;input.setAttribute('aria-label',options.label||key);if(type==='select'){for(const option of options.options||[]){const n=document.createElement('option');n.value=typeof option==='string'?option:option.value;n.textContent=typeof option==='string'?option:option.label;input.append(n);}input.value=object[key];}else if(type==='checkbox')input.checked=Boolean(object[key]);else{if(options.min!==undefined)input.min=options.min;if(options.max!==undefined)input.max=options.max;if(options.step!==undefined)input.step=options.step;input.value=object[key];}input.addEventListener(type==='range'||type==='color'?'input':'change',()=>{object[key]=type==='checkbox'?input.checked:type==='range'?Number(input.value):input.value;this.options.onChange?.();});label.append(input);this.box.append(label);return input;}
      addSelect(o,k,c){return this.control(o,k,c,'select');}addToggle(o,k,c){return this.control(o,k,c,'checkbox');}addSlider(o,k,c){return this.control(o,k,c,'range');}addColorPicker(o,k,c){return this.control(o,k,c,'color');}dispose(){this.box.remove();}
    }
    window.Tweak=Tweak;
    window.addEventListener('error',event=>send('frame-error',{message:String(event.message||'Ошибка макета')}));
    window.addEventListener('unhandledrejection',event=>send('frame-error',{message:String(event.reason?.message||event.reason)}));
    document.addEventListener('DOMContentLoaded',()=>{globalThis.lucide?.createIcons?.();document.addEventListener('change',()=>setTimeout(status,0));document.addEventListener('click',event=>{const link=event.target.closest?.('a[href^="#"]'),id=link?.getAttribute('href')?.slice(1),target=id?document.getElementById(id):null;if(target){event.preventDefault();target.scrollIntoView?.({block:'start'});}setTimeout(status,0);});status();send('ready');if(config.id==='main')setInterval(status,500);});
  }
  const script=code=>'<script>'+String(code).replace(/<\/script/gi,'<\\/script')+'<\/script>';
  const previewCss=`html{color-scheme:light}body{margin:0;padding:16px;font-family:"Segoe UI",sans-serif;background:#fff;color:#181818}body>div{max-width:100%}select,input,button,textarea{font-family:inherit}select{min-height:42px;border:1px solid #ccd2dc;border-radius:11px;padding:8px 12px;background:#fff;color:#181818}.site-tweak{padding:12px;margin-bottom:16px;border:1px solid #d6dbe3;border-radius:12px;background:#fff;font:14px/20px "Segoe UI",sans-serif}.site-tweak summary{font-weight:600;cursor:pointer}.site-tweak label{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px}.site-tweak select{max-width:65%}.site-tweak input[type=checkbox]{accent-color:#0084c1;width:20px;height:20px}.site-tweak input[type=range]{max-width:60%;accent-color:#0084c1}.cursor-interaction{cursor:pointer}.prototype-controls{padding:16px;border:1px solid #ccd2dc;border-radius:16px;background:#fff!important;color:#181818!important}.prototype-controls button,.prototype-controls select{font-family:"Segoe UI",sans-serif}.viz-carousel-options{z-index:30}.viz-carousel-controls{z-index:20}a{overflow-wrap:anywhere}`;
  const mainCss=`html,body{padding:0!important;margin:0!important;background:transparent!important;height:100%!important;overflow:hidden!important}#pd-verifier-app-preview{padding:0!important;margin:0!important;height:100%!important;display:block!important}#pd-verifier-app-preview .prototype-layout{width:100%!important;height:100%!important;display:block!important;padding:0!important;margin:0!important}#pd-verifier-app-preview #prototype-controls,#pd-verifier-app-preview>.prototype-detail-note,#pd-verifier-app-preview .prototype-layout>.prototype-detail-note{display:none!important}#pd-verifier-app-preview .phone{width:100%!important;height:100dvh!important;min-height:0!important;border-radius:28px!important}#pd-verifier-app-preview .prototype-layout>.phone{margin:0!important}@media(min-width:500px){#pd-verifier-app-preview{max-width:430px!important;margin:0 auto!important}}.site-tweak{display:none!important}`;
  function frameDocument(id,source){
    const r=data.runtime,config=script('window.__PD_FRAME_CONFIG='+JSON.stringify({id})+';('+frameBootstrap.toString()+')();');
    const vendor=script(r.icons)+script(r.dagre)+script(r.floatingCore)+script(r.floatingDom);
    const helpers=source.includes('data-visualize-standalone')?'':r.kit;
    const css='<style>'+r.css+'\n'+previewCss+(id==='main'?mainCss:'')+(id==='scenarios'?'#pd-original-epc>.viz-controls{display:none!important}':'')+'</style>';
    if(/<!doctype|<html/i.test(source.slice(0,100))){let result=source.replace(/<meta[^>]*http-equiv="Content-Security-Policy"[^>]*>/gi,'');result=result.replace(/<head[^>]*>/i,match=>match+config+vendor+css);return result;}
    return '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+config+vendor+css+'</head><body>'+source+(id==='main'?'<style>'+mainCss+'</style>':'')+helpers+'</body></html>';
  }
  function mountFrame(frame,id){if(!data.raw[id]){toast('Материал отсутствует в этой сборке.');return;}if(frame.dataset.material===id&&frame.getAttribute('srcdoc'))return;frames.set(id,frame);frame.dataset.material=id;frame.srcdoc=frameDocument(id,data.raw[id]);loaded.add(id);}
  function frameDoc(id='main'){try{return frames.get(id)?.contentDocument;}catch{return null;}}
  function sourceChange(selector,value,type='change'){
    const doc=frameDoc(),n=doc?.querySelector(selector);if(!n){toast('Дождитесь загрузки макета.');return;}if(n.type==='checkbox')n.checked=Boolean(value);else n.value=String(value);n.dispatchEvent(new doc.defaultView.Event(type,{bubbles:true}));
  }
  function sourceClick(selector){const n=frameDoc()?.querySelector(selector);if(!n){toast('Дождитесь загрузки макета.');return;}n.click();}
  function setTheme(theme){const app=frameDoc()?.querySelector('.phone');if(!app?.verifierApp)return;app.verifierApp.api.setSettings({theme});app.verifierApp.render();app.verifierApp.persist();syncTheme(theme);}
  function syncTheme(theme){$$('[data-theme]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.theme===theme)));}
  function setPhoneWidth(value){if(!['320','360','390','430'].includes(String(value)))value=viewDefaults.width;state.width=String(value);$('#phone-width').value=state.width;$('#prototype-frame').style.width=state.width+'px';$('#device-size').textContent=state.width+' × адаптивная высота';saveView();}
  function updateMain(view){
    syncing=true;try{const doc=frameDoc();if(!doc)return;syncTheme(view.theme);$('#device-route').textContent=({requests:'Заявки',request:'Заявка',acts:'Акты',tools:'Инструменты',settings:'Настройки',register:'Регистрация',onboarding:'Онбординг',notifications:'Уведомления',messages:'Сообщения'})[view.route]||'Поверка дома';
      const picker=$('#screen-picker'),temporary=picker.querySelector('[data-current-screen]');if(temporary&&temporary.value!==view.route)temporary.remove();if(![...picker.options].some(n=>n.value===view.route)){const current=el('option','',[...doc.querySelectorAll('.phone header')].find(n=>!n.closest('[hidden]'))?.querySelector('.app-screen-title')?.textContent||$('#device-route').textContent);current.value=view.route;current.disabled=true;current.dataset.currentScreen='';picker.append(current);}picker.value=view.route;
      for(const n of $$('[data-proxy-select]')){const source=doc.getElementById(n.dataset.proxySelect);if(source)n.value=source.value;}
      for(const n of $$('[data-proxy-check]')){const source=doc.getElementById(n.dataset.proxyCheck);if(source)n.checked=source.checked;}
      for(const n of $$('[data-proxy-click]')){const source=doc.querySelector(n.dataset.proxyClick);if(source?.hasAttribute('aria-pressed'))n.setAttribute('aria-pressed',source.getAttribute('aria-pressed'));}
      $('#top-corners').value=view.roundedTopbar?'rounded':'square';$('#bottom-corners').value=view.roundedBottomBar?'rounded':'square';$('#city-scenario').value=view.cityScenario||'single';
      const depth=doc.getElementById('shadow-depth');if(depth){$('#site-shadow-depth').value=depth.value;$('#site-shadow-depth').disabled=depth.disabled;$('#site-shadow-value').textContent=depth.value+'%';}
      const sample=doc.getElementById('request-sample');if(sample)$('#request-example').value=sample.value;
      if(Number.isFinite(view.minutes)){if(document.activeElement!==$('#site-time'))$('#site-time').value=view.minutes;$('#site-time-value').textContent=view.minutes<0?'Просрочено '+Math.abs(view.minutes)+' мин':view.minutes===0?'Срок истёк':view.minutes+' мин';}
      $('#site-timer-play').textContent=view.timerPlaying?'Пауза':'Запустить';$('#site-timer-play').setAttribute('aria-pressed',String(Boolean(view.timerPlaying)));
    }finally{syncing=false;}
  }
  document.addEventListener('change',event=>{if(syncing)return;const n=event.target;if(n.matches('[data-proxy-select]'))sourceChange('#'+n.dataset.proxySelect,n.value);if(n.matches('[data-proxy-check]'))sourceChange('#'+n.dataset.proxyCheck,n.checked);});
  document.addEventListener('input',event=>{if(syncing)return;const n=event.target;if(n.matches('[data-proxy-range]'))sourceChange('#'+n.dataset.proxyRange,n.value,'input');});
  document.addEventListener('click',event=>{const proxy=event.target.closest('[data-proxy-click]');if(proxy)sourceClick(proxy.dataset.proxyClick);const theme=event.target.closest('[data-theme]');if(theme)setTheme(theme.dataset.theme);const full=event.target.closest('[data-fullscreen]');if(full)openFullscreen(document.getElementById(full.dataset.fullscreen));});
  $('#phone-width').addEventListener('change',e=>setPhoneWidth(e.target.value));
  $('#screen-picker').addEventListener('change',e=>frameDoc()?.querySelector('.phone')?.verifierApp?.navigate(e.target.value));
  $('#top-corners').addEventListener('change',e=>sourceClick('[data-corners="'+e.target.value+'"]'));
  $('#bottom-corners').addEventListener('change',e=>sourceClick('[data-bottom-corners="'+e.target.value+'"]'));
  $('#city-scenario').addEventListener('change',e=>sourceClick('[data-city-scenario="'+e.target.value+'"]'));
  $('#site-timer-play').addEventListener('click',()=>sourceClick('#request-timer-play'));
  $('#reset-preview').addEventListener('click',()=>{const core=frameDoc()?.querySelector('.phone')?.verifierApp;if(!core?.resetDemoData){toast('Дождитесь загрузки макета.');return;}updateMain(core.resetDemoData());toast('Данные макета восстановлены. Сообщения снова непрочитанные.');});
  $('#open-request-example').addEventListener('click',()=>{sourceChange('#request-sample',$('#request-example').value);sourceClick('#request-sample-open');});
  function experiments(){
    const query=state.search.trim().toLocaleLowerCase('ru');let entries=data.experiments.filter(x=>(state.category==='all'||x.category===state.category)&&(!query||[x.title,x.description,x.category,x.decision].join(' ').toLocaleLowerCase('ru').includes(query)));entries.sort((a,b)=>state.order==='old'?a.order-b.order:b.order-a.order);
    const feed=$('#experiment-feed');for(const item of data.experiments)frames.delete(item.id);feed.replaceChildren();$('#experiment-empty').hidden=entries.length>0;$('#experiment-count').textContent=entries.length+' серий · '+entries.reduce((n,x)=>n+x.count,0)+' вариантов';
    for(const item of entries){const card=el('details','experiment'),summary=el('summary'),step=el('span','experiment-step',String(item.order).padStart(2,'0')),text=el('div'),meta=el('div','experiment-meta');meta.append(el('span','',item.category),el('span','','·'),el('span','',item.count===1?'Отдельный макет':item.count+' вариантов'));if(item.decision)meta.append(el('span','pill accepted',item.decision));text.append(meta,el('h2','experiment-title',item.title),el('p','experiment-desc',item.description));summary.append(step,text,el('span','experiment-chevron','›'));const body=el('div','experiment-body'),actions=el('div','experiment-action-row'),open=el('button','button','Развернуть серию ↗'),frame=el('iframe','experiment-frame');frame.id='experiment-'+item.id;frame.title=item.title;frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox');actions.append(el('span','','Сохранённый этап исследования'),open);body.append(actions,frame);card.append(summary,body);open.addEventListener('click',()=>openFullscreen(frame));card.addEventListener('toggle',()=>{if(card.open)mountFrame(frame,item.id);else{frame.removeAttribute('srcdoc');frames.delete(item.id);}});feed.append(card);}
  }
  const categories=[...new Set(data.experiments.map(x=>x.category))];for(const c of categories){const option=el('option','',c);option.value=c;$('#experiment-category').append(option);}
  $('#experiment-category').value=categories.includes(state.category)?state.category:'all';state.category=$('#experiment-category').value;$('#experiment-order').value=state.order==='old'?'old':'new';$('#experiment-search').value=state.search;
  $('#experiment-search').addEventListener('input',e=>{state.search=e.target.value;experiments();saveView();});$('#experiment-category').addEventListener('change',e=>{state.category=e.target.value;experiments();saveView();});$('#experiment-order').addEventListener('change',e=>{state.order=e.target.value;experiments();saveView();});
  function option(select,value,label){const n=el('option','',label);n.value=value;select.append(n);}
  for(const r of data.roles){option($('#research-role'),r.id,r.label);option($('#scenario-role'),r.id,r.label);}
  if(!data.roles.some(r=>r.id===state.role))state.role='internal-v';$('#research-role').value=state.role;$('#scenario-role').value=state.role;
  for(const d of data.documents)option($('#research-picker'),d.id,d.title);
  function research(){
    const item=data.documents.find(d=>d.id===state.document)||data.documents[0];state.document=item.id;$('#research-picker').value=item.id;$('#research-role').value=state.role;$('#research-kind').textContent=item.kind;$('#research-date').textContent=item.snapshot||'Снимок исследования: октябрь — ноябрь 2026';
    const host=$('#research-content');host.replaceChildren();if(item.file==='roles'){host.innerHTML=data.roleHtml[state.role];}
    else if(data.raw['doc-'+item.id]){const frame=el('iframe');frame.title=item.title;frame.id='research-frame';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox');host.append(frame);mountFrame(frame,'doc-'+item.id);}else{const title=el('h1','',item.title);host.append(title);const content=el('div');content.innerHTML=data.reportHtml[item.id]||'';host.append(content);}
    $('#research-role').disabled=item.file!=='roles';saveView();
  }
  $('#research-picker').addEventListener('change',e=>{state.document=e.target.value;research();});$('#research-role').addEventListener('change',e=>{state.role=e.target.value;research();});
  function download(text,filename,type){const url=URL.createObjectURL(new Blob([text],{type})),a=el('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('#download-research').addEventListener('click',()=>{const item=data.documents.find(d=>d.id===state.document);if(item.file==='roles')download('<!doctype html><html lang="ru"><meta charset="utf-8"><title>'+item.title+'</title><body>'+data.roleHtml[state.role]+'</body></html>','role-'+state.role+'.html','text/html');else if(data.reportData[item.id])download(JSON.stringify(data.reportData[item.id],null,2),item.file,'application/json');else download(frameDocument('download',data.raw['doc-'+item.id]||data.reportHtml[item.id]),item.id+'.html','text/html');});
  function chooseScenarioRole(){const id=$('#scenario-role').value,profile=data.roles.find(r=>r.id===id);$('#scenario-context').textContent=profile?.note||'';const doc=frameDoc('scenarios'),select=doc?.querySelector('[data-epc-role]');if(select&&select.value!==id){select.value=id;select.dispatchEvent(new doc.defaultView.Event('change',{bubbles:true}));}state.role=id;saveView();}
  $('#scenario-role').addEventListener('change',chooseScenarioRole);$('#scenario-process').addEventListener('change',e=>{const doc=frameDoc('scenarios'),select=doc?.querySelector('[data-epc-process]');if(select){select.value=e.target.value;select.dispatchEvent(new doc.defaultView.Event('change',{bubbles:true}));}});
  window.addEventListener('message',event=>{const m=event.data;if(!m?.pdSite||!frames.has(m.id)||event.source!==frames.get(m.id).contentWindow)return;
    if(m.type==='ready'&&m.id==='main'){const sample=frameDoc()?.getElementById('request-sample');if(sample){$('#request-example').replaceChildren();for(const item of sample.options)option($('#request-example'),item.value,item.textContent);}setPhoneWidth(state.width);}
    if(m.type==='state'&&m.id==='main')updateMain(m.view);
    if(m.type==='ready'&&m.id==='scenarios'){$('#scenario-role').value=state.role;chooseScenarioRole();}
    if(m.type==='scenario'){if(m.id!=='scenarios')return;$('#scenario-role').value=m.role;$('#scenario-process').replaceChildren();for(const item of m.processes)option($('#scenario-process'),item.value,item.label);$('#scenario-process').value=m.process;$('#scenario-context').textContent=data.roles.find(r=>r.id===m.role)?.note||'';}
    if(m.type==='frame-error'){console.error('Preview '+m.id+': '+m.message);toast('В материале возникла ошибка: '+m.message);}
    if(m.type==='notice')toast(m.text);
  });
  async function openFullscreen(frame){if(!frame)return;if(frame.requestFullscreen){try{await frame.requestFullscreen();return;}catch{}}if(!frame.getAttribute('srcdoc')){const item=data.experiments.find(x=>'experiment-'+x.id===frame.id);if(item)mountFrame(frame,item.id);}const placeholder=document.createComment('frame-position');frame.before(placeholder);fullscreenRestore={frame,placeholder,focus:document.activeElement};$('#fullscreen-title').textContent=frame.title||'Макет';$('#fullscreen-content').replaceChildren(frame);$('#fullscreen-layer').hidden=false;document.body.style.overflow='hidden';$('#fullscreen-close').focus();}
  function closeFullscreen(){if(!fullscreenRestore)return;const {frame,placeholder,focus}=fullscreenRestore;placeholder.replaceWith(frame);$('#fullscreen-layer').hidden=true;document.body.style.overflow='';fullscreenRestore=null;focus?.focus?.();}
  $('#fullscreen-close').addEventListener('click',closeFullscreen);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFullscreen();if(e.key==='Tab'&&fullscreenRestore&&document.activeElement===$('#fullscreen-close')&&e.shiftKey){e.preventDefault();fullscreenRestore.frame.focus();}});

  function filterProblems(){
    const query=$('#problem-search').value.trim().toLocaleLowerCase('ru'),status=$('#problem-status').value,group=$('#problem-group').value;
    let count=0;
    $$('#problem-list .problem-item').forEach(item=>{const text=item.textContent.toLocaleLowerCase('ru');const match=(!query||text.includes(query)||item.id==='problem-'+query)&&(status==='all'||item.dataset.status===status)&&(group==='all'||item.dataset.group===group);item.hidden=!match;if(match)count++;});
    $('#problem-count').textContent='Показано '+count+' из 43';$('#problem-empty').hidden=count>0;
  }
  function resetProblemFilters(){ $('#problem-search').value='';$('#problem-status').value='all';$('#problem-group').value='all';filterProblems(); }
  function openProblemLink(){const id=new URLSearchParams(location.hash.split('?')[1]||'').get('item');if(!/^\d+$/.test(id||''))return;const item=document.getElementById('problem-'+id);if(!item)return;resetProblemFilters();item.open=true;requestAnimationFrame(()=>item.scrollIntoView({block:'start'}));}
  $('#problem-search').addEventListener('input',filterProblems);
  $('#problem-status').addEventListener('change',filterProblems);
  $('#problem-group').addEventListener('change',filterProblems);
  $('#problem-reset').addEventListener('click',resetProblemFilters);
  function filterComparison(){
    const query=$('#comparison-search').value.trim().toLocaleLowerCase('ru'),status=$('#comparison-status').value,group=$('#comparison-group').value;
    let count=0;
    $$('[data-comparison-row]').forEach(row=>{const match=(!query||row.textContent.toLocaleLowerCase('ru').includes(query)||row.dataset.number===query)&&(status==='all'||row.dataset.status===status)&&(group==='all'||row.dataset.group===group);row.hidden=!match;if(match)count++;});
    $('#comparison-count').textContent='Показано '+count+' из 43';$('#comparison-empty').hidden=count>0;
  }
  $('#comparison-search').addEventListener('input',filterComparison);
  $('#comparison-status').addEventListener('change',filterComparison);
  $('#comparison-group').addEventListener('change',filterComparison);
  $('#comparison-reset').addEventListener('click',()=>{$('#comparison-search').value='';$('#comparison-status').value='all';$('#comparison-group').value='all';filterComparison();});
  function route(){const hash=location.hash.slice(1).split('?')[0],page=['prototype','problems','comparison','experiments','research','scenarios'].includes(hash)?hash:'prototype';state.page=page;$$('[data-page]').forEach(n=>n.hidden=n.dataset.page!==page);$$('[data-nav]').forEach(n=>{if(n.dataset.nav===page)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});if(page==='prototype'&&!loaded.has('main'))mountFrame($('#prototype-frame'),'main');if(page==='problems')openProblemLink();if(page==='experiments')experiments();if(page==='research')research();if(page==='scenarios'&&!loaded.has('scenarios'))mountFrame($('#scenario-frame'),'scenarios');saveView();}
  $('#open-rules').addEventListener('click',()=>{state.document='rules';if(location.hash==='#research')research();});window.addEventListener('hashchange',route);window.addEventListener('load',()=>{if(location.hash.startsWith('#problems?'))openProblemLink();});
  $('#edition-date').textContent='05.11.2026';$('#site-snapshot').textContent=data.experiments.length+' серий · '+data.documents.length+' материалов · '+data.roles.length+' профилей';
  window.PD_DESIGN_SITE={state,frameDocument,experiments,research,route,data,frames};route();
})();
