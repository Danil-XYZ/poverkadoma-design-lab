/* Product-owned selectors. Native date/select popups never enter the application UI. */
function createVerifierPickers(api) {
  const {el,modal,closeModal,button}=api;
  const synced=new WeakMap();
  const dateValue=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const parse=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;const date=new Date(value+'T12:00:00');return Number.isFinite(date.getTime())&&dateValue(date)===value?date:null;};
  const print=value=>value?value.split('-').reverse().join('.'):'Выбрать дату';
  function commit(input,value){input.value=value;const E=input.ownerDocument.defaultView.Event;input.dispatchEvent(new E('input',{bubbles:true}));input.dispatchEvent(new E('change',{bubbles:true}));}
  function calendar(input,label){
    const selected=parse(input.value),now=new Date(),body=el('div','v-calendar');let month=selected||new Date(now.getFullYear(),now.getMonth(),1),yearMode=false;
    function paint(){const focusKey=body.contains(document.activeElement)?document.activeElement?.dataset.calendarControl:null;body.replaceChildren();const head=el('div','v-calendar-heading'),previous=button('‹',()=>{month=new Date(month.getFullYear(),month.getMonth()-(yearMode?12:1),1);paint();}),next=button('›',()=>{month=new Date(month.getFullYear(),month.getMonth()+(yearMode?12:1),1);paint();}),title=button(yearMode?String(month.getFullYear()):month.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}),()=>{yearMode=!yearMode;paint();});previous.dataset.calendarControl='previous';title.dataset.calendarControl='title';next.dataset.calendarControl='next';const restoreFocus=()=>{if(focusKey)([...head.children].find(n=>n.dataset.calendarControl===focusKey)||title).focus?.({preventScroll:true});};previous.setAttribute('aria-label',yearMode?'Предыдущий год':'Предыдущий месяц');next.setAttribute('aria-label',yearMode?'Следующий год':'Следующий месяц');head.append(previous,title,next);body.append(head);
      if(yearMode){const months=el('div','v-calendar-months');for(let i=0;i<12;i++){const name=new Date(month.getFullYear(),i,1).toLocaleDateString('ru-RU',{month:'short'});months.append(button(name,()=>{month=new Date(month.getFullYear(),i,1);yearMode=false;paint();body.querySelector('[data-calendar-control="title"]')?.focus?.({preventScroll:true});}));}body.append(months);restoreFocus();return;}
      const week=el('div','v-calendar-week');for(const d of ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'])week.append(el('span','',d));body.append(week);const grid=el('div','v-calendar-grid'),first=new Date(month.getFullYear(),month.getMonth(),1),start=(first.getDay()+6)%7,days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();for(let i=0;i<start;i++){const blank=el('span','v-calendar-blank');blank.setAttribute('aria-hidden','true');grid.append(blank);}for(let day=1;day<=days;day++){const d=new Date(month.getFullYear(),month.getMonth(),day),key=dateValue(d),n=button(String(day),()=>{closeModal();commit(input,key);});n.dataset.calendarDate=key;n.setAttribute('aria-label',d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}));n.setAttribute('aria-pressed',String(key===input.value));if(key===dateValue(now))n.dataset.today='true';n.disabled=Boolean(input.min&&key<input.min||input.max&&key>input.max);grid.append(n);}body.append(grid);
      restoreFocus();
    }
    const actions=[{label:'Сегодня',kind:'secondary',onClick:()=>{const value=dateValue(new Date());if(input.min&&value<input.min||input.max&&value>input.max)return;closeModal();commit(input,value);}}];if(!input.required)actions.push({label:'Очистить дату',kind:'text',onClick:()=>{closeModal();commit(input,'');}});actions.push({label:'Отмена',kind:'text',onClick:closeModal});
    paint();modal({title:label||'Дата',body,help:'Выберите день. Название месяца открывает выбор месяца; стрелки переключают месяцы или годы.',actions});
  }
  function options(input,label){const body=el('div','v-picker'),values=[...input.querySelectorAll('option')].map(o=>({value:o.value,label:o.textContent,disabled:o.disabled})),list=el('div',/время|интервал/i.test(label||'')?'v-time-grid':'v-picker-options');list.setAttribute('role','listbox');list.setAttribute('aria-label',label||'Выбор');
    function paint(query=''){list.replaceChildren();for(const value of values.filter(v=>v.label.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')))){const n=button('',()=>{closeModal();commit(input,value.value);});n.className='v-picker-option';n.setAttribute('role','option');n.setAttribute('aria-selected',String(input.value===value.value));n.disabled=value.disabled;n.dataset.pickerValue=value.value;n.append(el('span','',value.label),el('span','v-picker-check',input.value===value.value?'✓':''));list.append(n);}if(!list.children.length)list.append(el('p','v-muted','Ничего не найдено'));}
    if(values.length>8&&!/время|интервал/i.test(label||'')){const search=el('input','v-picker-search');search.type='search';search.placeholder='Найти';search.setAttribute('aria-label','Поиск варианта');search.addEventListener('input',()=>paint(search.value));body.append(search);}paint();body.append(list);modal({title:label||'Выберите вариант',body,help:'Нажмите нужный вариант. Выбранное значение отмечено галочкой.',actions:[{label:'Отмена',kind:'text',onClick:closeModal}]});
  }
  function enhance(host){
    if(!host)return;
    for(const input of host.querySelectorAll('select,input[type="date"]')){
      if(input.id==='filter-period')continue;
      if(input.dataset.customPicker==='true'){synced.get(input)?.();continue;}
      input.dataset.customPicker='true';
      const isDate=input.type==='date',label=input.getAttribute('aria-label')||input.closest('label')?.querySelector('.v-label,.detail-label,span')?.textContent||'Выберите значение';
      const trigger=button('',()=>{if(input.disabled||input.readOnly)return;isDate?calendar(input,label):options(input,label);});
      trigger.className='v-select-control';trigger.type='button';trigger.dataset.pickerFor=input.id;trigger.setAttribute('aria-haspopup','dialog');input.hidden=true;input.before(trigger);
      function sync(){
        trigger.replaceChildren();
        const value=isDate?print(input.value):[...input.querySelectorAll('option')].find(o=>o.value===input.value)?.textContent||input.value||'Выбрать';
        const arrow=el('span','v-select-chevron'),glyph=el('i');arrow.setAttribute('aria-hidden','true');glyph.dataset.lucide='chevron-down';glyph.setAttribute('aria-hidden','true');arrow.append(glyph);trigger.append(el('span','v-select-value',value),arrow);trigger.disabled=Boolean(input.disabled||input.readOnly);trigger.setAttribute('aria-label',label+': '+value);
        for(const key of ['aria-invalid','aria-describedby']){const value=input.getAttribute(key);if(value!=null)trigger.setAttribute(key,value);else trigger.removeAttribute(key);}globalThis.lucide?.createIcons?.({attrs:{width:20,height:20,'stroke-width':1.7}});
      }
      synced.set(input,sync);input.focus=opts=>trigger.focus(opts);input.addEventListener('input',sync);input.addEventListener('change',sync);
      const Observer=input.ownerDocument.defaultView.MutationObserver;if(Observer)new Observer(sync).observe(input,{attributes:true,attributeFilter:['disabled','readonly','aria-invalid','aria-describedby']});sync();
    }
  }
  return {enhance,calendar,options};
}
