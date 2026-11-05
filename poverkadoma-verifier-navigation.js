/* One request-header contract and direct role destinations for the full prototype. */
// Place visible ink evenly while keeping full, non-overlapping touch targets.
function planToolsHeaderInk(titleRight,right,inkEnd,widths,targetWidth){
  if(![titleRight,right,inkEnd,targetWidth,...widths].every(Number.isFinite)||!widths.length||targetWidth<44)return null;
  const gap=(inkEnd-titleRight-widths.reduce((a,b)=>a+b,0))/widths.length;
  if(gap<0||widths.some(w=>w<=0||w>targetWidth))return null;
  let edge=titleRight;const items=widths.map(width=>{const left=edge+gap;edge=left+width;return {left,width};});
  let next=right;
  for(let i=items.length-1;i>=0;i--){const item=items[i];item.target=Math.min(item.left+(item.width-targetWidth)/2,next-targetWidth);if(item.target<titleRight+4||item.target<item.left+item.width-targetWidth-.01||item.target>item.left+.01)return null;next=item.target;}
  return {gap,items};
}
function createVerifierNavigation({app,bridge,el,navigate,showHelp,back,getSettings}) {
  const roots=['requests','acts','tools'];
  const names={requests:'Заявки',acts:'Акты',tools:'Инструменты',upload:'Выгрузка',history:'История',statistics:'Статистика',equipment:'Приборы',tags:'Бирки',storage:'Условия хранения',nepton:'НЕПТОН',guide:'Справочник СИ',arshin:'АРШИН',documents:'Документы СМК',settings:'Настройки',account:'Личные данные',notifications:'Уведомления',messages:'Сообщения',feedback:'Поддержка'};
  const glyphs={tools:'wrench',settings:'settings',sections:'layout-grid',equipment:'gauge',tags:'tag',storage:'thermometer',nepton:'radio',guide:'book-open',arshin:'search-check',documents:'file-check-2',requests:'clipboard-list',acts:'files',upload:'cloud-upload',history:'history',statistics:'chart-no-axes-combined',account:'user-round',notifications:'bell',messages:'message-square',feedback:'headset'};
  function navIcon(key){const box=el('span','icon v-nav-glyph'),i=el('i');box.setAttribute('aria-hidden','true');box.style.width='24px';box.style.height='24px';i.dataset.lucide=glyphs[key]||key;box.append(i);return box;}
  const paintIcons=()=>globalThis.lucide?.createIcons?.({attrs:{width:20,height:20,'stroke-width':1.7}});
  const requestHeader=app.querySelector('#request-screen > header'),generated=requestHeader.cloneNode(true);generated.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));generated.classList.add('v-topbar');
  function prepare(header){
    header.classList.add('detail-topbar');header.dataset.headerContract='request';const toolbar=header.querySelector('.toolbar');toolbar.classList.add('detail-toolbar');const heading=toolbar.querySelector('h1,h2');heading.classList.add('app-screen-title');
    const actions=header.querySelector('.detail-toolbar-actions,.toolbar-actions');actions.classList.add('detail-toolbar-actions','toolbar-actions');
    const backButton=toolbar.querySelector(':scope > .icon-button');if(backButton)backButton.classList.add('app-back-button');
    const offline=header.querySelector('.network-slot .icon-button');offline.classList.add('detail-offline');
    const helpButton=[...actions.querySelectorAll('button')].find(n=>(n.getAttribute('aria-label')||'').includes('Подсказ'));helpButton.setAttribute('aria-label','Подсказки');helpButton.classList.add('v-route-help');helpButton.addEventListener('click',showHelp);
    let notifications=actions.querySelector('[aria-label="Уведомления"]');if(!notifications){notifications=el('button','icon-button v-notifications-button');notifications.type='button';notifications.setAttribute('aria-label','Уведомления');notifications.append(bridge.icon('bell'));actions.append(notifications);}notifications.dataset.globalRoute='notifications';notifications.addEventListener('click',()=>navigate('notifications'));
    const settings=el('button','icon-button v-settings-button');settings.type='button';settings.setAttribute('aria-label','Настройки');settings.dataset.globalRoute='settings';settings.append(navIcon('settings'));settings.addEventListener('click',()=>navigate('settings'));
    const sections=el('button','icon-button v-sections-button');sections.type='button';sections.setAttribute('aria-label','Разделы');sections.dataset.openSections='';sections.append(navIcon('sections'));sections.addEventListener('click',()=>navigate('sections'));actions.append(settings,sections);
    return {header,toolbar,heading,actions,backButton,offline,helpButton,notifications,settings,sections};
  }
  const request=prepare(requestHeader),main=prepare(app.querySelector(':scope > header.topbar')),screen=prepare(generated);
  screen.header.classList.add('v-topbar');screen.toolbar.classList.add('v-toolbar');screen.backButton.classList.add('v-back-button');screen.backButton.setAttribute('aria-label','Назад');screen.backButton.addEventListener('click',back);
  let inkFrame;
  function alignToolsInk(){
    const {toolbar,heading,actions}=screen;toolbar.removeAttribute('data-ink-layout');
    [...actions.children].forEach(n=>{n.style.removeProperty('--tools-button-left');n.style.removeProperty('--tools-icon-shift');});
    if(!['tools','notifications'].includes(app.dataset.vRoute)||screen.header.closest('[hidden]')||!window.getComputedStyle)return;
    const controls=[...actions.children].filter(n=>!n.hidden&&!(n.classList.contains('network-slot')&&screen.offline.hidden));
    const area=toolbar.getBoundingClientRect(),title=heading.getBoundingClientRect();
    if(!area.width||!title.width||controls.some(n=>Math.abs(n.getBoundingClientRect().top-title.top)>16))return;
    const context=document.createElement('canvas').getContext?.('2d');if(!context)return;
    context.font=window.getComputedStyle(heading).font;
    const text=context.measureText(heading.textContent),titleRight=title.left+(text.actualBoundingBoxRight||title.width);
    // These IMG bounds come from their source paths, not their padded 24px groups.
    const bounds=controls.map(control=>{
      const glyph=control.querySelector('.icon'),image=glyph?.querySelector('img'),svg=glyph?.querySelector('svg');
      if(image){const r=image.getBoundingClientRect(),help=glyph.dataset.iconKind==='help';return {left:r.left+(help?r.width*6/19.7:0),width:r.width*(help?7.7/19.7:1),glyph};}
      if(svg?.getBBox){const r=svg.getBoundingClientRect(),box=svg.getBBox(),vb=svg.viewBox.baseVal,stroke=parseFloat(window.getComputedStyle(svg).strokeWidth)||0,scale=r.width/vb.width;return {left:r.left+(box.x-vb.x-stroke/2)*scale,width:(box.width+stroke)*scale,glyph};}
      return null;
    });
    if(bounds.some(b=>!b||!b.width))return;
    const targetWidth=controls[0].getBoundingClientRect().width,last=bounds.at(-1),plan=planToolsHeaderInk(titleRight,area.right,last.left+last.width,bounds.map(b=>b.width),targetWidth);if(!plan)return;
    controls.forEach((control,i)=>{const rect=control.getBoundingClientRect(),item=plan.items[i];control.style.setProperty('--tools-button-left',(item.target-area.left)+'px');control.style.setProperty('--tools-icon-shift',(item.left-bounds[i].left-(item.target-rect.left))+'px');});
    toolbar.dataset.inkLayout='true';
  }
  function scheduleToolsInk(){if(!window.requestAnimationFrame)return;window.cancelAnimationFrame?.(inkFrame);inkFrame=window.requestAnimationFrame(()=>{inkFrame=null;alignToolsInk();});}
  screen.actions.addEventListener('load',scheduleToolsInk,true);
  if(window.MutationObserver)new window.MutationObserver(scheduleToolsInk).observe(app,{attributes:true,attributeFilter:['data-offline']});
  if(window.ResizeObserver){let width;new window.ResizeObserver(entries=>{const next=entries[0]?.contentRect.width;if(next!==width){width=next;scheduleToolsInk();}}).observe(app);}
  document.fonts?.ready?.then(scheduleToolsInk);document.fonts?.addEventListener?.('loadingdone',scheduleToolsInk);
  // The legacy home controller owns its original NodeList. Keep that detached node intact.
  const oldProfile=app.querySelector('.bottom-bar [data-nav="profile"]'),tools=oldProfile.cloneNode(true);tools.dataset.nav='tools';tools.setAttribute('aria-label','Инструменты');tools.querySelector('.nav-mark').replaceChildren(navIcon('tools'));tools.lastElementChild.textContent='Инструменты';oldProfile.replaceWith(tools);
  function configure(info,isRoot,auth=false,pageRoute='requests'){info.offline.hidden=app.dataset.offline!=='true';info.helpButton.hidden=getSettings().hints===false;info.notifications.hidden=!isRoot||auth;info.settings.hidden=auth||pageRoute==='settings';info.sections.hidden=auth||pageRoute!=='settings';if(info.backButton)info.backButton.hidden=isRoot;}
  function apply(route,auth=false){configure(main,true,false,'requests');configure(request,false,false,'request');configure(screen,roots.includes(route),auth,route);main.heading.textContent='Заявки';app.querySelectorAll('.bottom-bar [data-nav]').forEach(n=>{if(n.dataset.nav===route)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});paintIcons();scheduleToolsInk();}
  function group(title,items,kind){const host=el('section','v-tools-group'),list=el('div','v-tools-grid');host.append(el('h3','v-tools-heading',title));for(const key of items){const n=el('button','v-tools-tile cursor-interaction');n.type='button';n.setAttribute('aria-label',names[key]);n.dataset[kind==='tools'?'toolsDestination':'sectionDestination']=key;n.append(navIcon(key),el('span','v-tools-name',names[key]));if(kind==='tools'){const chevron=navIcon('chevron-right');chevron.classList.add('v-tools-chevron');n.append(chevron);}n.addEventListener('click',()=>navigate(key));list.append(n);}host.append(list);return host;}
  function toolsView(){const content=el('div','v-stack v-tools-tasks');content.append(group('Оборудование',['equipment','nepton'],'tools'),group('Справочные данные',['guide','arshin'],'tools'),group('Сопровождение работы',['tags','storage','documents'],'tools'));return {title:'Инструменты',section:'tools',content,help:'Оборудование: Приборы и НЕПТОН. Справочные данные: Справочник СИ и АРШИН. Сопровождение работы: Бирки, Условия хранения и Документы СМК. Каждая кнопка сразу открывает нужный инструмент; эти функции также доступны из соответствующего шага акта.'};}
  function sectionsView(){const content=el('div','v-stack');content.append(group('Работа',['requests','acts','tools','upload','history','statistics'],'sections'),group('Подготовка',['equipment','tags','storage','documents'],'sections'),group('Во время поверки',['guide','arshin','nepton'],'sections'),group('Личное и связь',['account','settings','notifications','messages','feedback'],'sections'));return {title:'Разделы',section:'tools',content,help:'Каждая кнопка сразу открывает нужный раздел. Группы помогают найти функцию и не добавляют промежуточных переходов.'};}
  return {roots,main,request,screen,apply,toolsView,sectionsView,paintIcons,icon:navIcon};
}
