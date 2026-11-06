/* Internal-verifier prototype. Local demo transitions only; no backend or live regulatory clock. */
function createRequestDetail(options) {
  'use strict';
  const {app,screen,icon,onClose,onChange,services=['Поверка ИПУ']}=options;
  const find=id=>screen.querySelector('#'+id);
  const content=find('request-detail-content'),history=find('request-history-content');
  const actions=find('request-detail-actions'),secondary=find('request-secondary-actions');
  const title=find('request-screen-title'),status=find('request-detail-status');
  const created=find('request-screen-created'),draftStatus=find('request-draft-status');
  const actionHint=find('request-action-hint'),editorContent=find('request-editor-content'),editorSave=find('request-editor-save');
  const overlay=find('request-action-overlay'),dialogClose=find('request-action-close');
  const information=find('request-information'),viewport=find('request-detail-scroll'),deadlineCard=find('request-deadline'),footer=screen.querySelector('.detail-action-bar');
  const editableKeys={address:255,visitDate:10,visitTime:25,quantity:1,clientName:50,note:255,comment:255,service:80};
  const common={id:'000395',number:'МСР-12341',city:'Тольятти',address:'Ворошилова 10 - 34',quantity:'3',amount:'2400 ₽',service:'Поверка ИПУ',clientName:'Иванов Иван Иванович',phone:'+7 (901) 123-45-67',note:'В пятницу, в любое время',comment:'',created:'25.10.2024',mapSource:'original',sample:true,visitDate:'22.12.2020',visitTime:'13:00 - 14:00'};
  const samples={
    'sample-new':{...common,kind:'new',state:'Новая',visitDate:'',visitTime:'',agreementMinutesLeft:43,receivedTime:'9:59',agreementDue:'10:59'},
    'sample-appointed':{...common,kind:'appointed',state:'Назначена',agreementMinutesLeft:15,receivedTime:'9:59',agreementDue:'10:59'},
    'sample-agreed':{...common,kind:'agreed',state:'Согласована',agreementHistory:'Заявка согласована без превышения срока'},
    'sample-in-work':{...common,kind:'in-work',state:'В работе',linkedAct:'23-2020-00001'},
    'sample-completed':{...common,kind:'completed',state:'Выполнена',resultQuantity:'2',completedDate:'27.10.2024'},
    'sample-canceled':{...common,kind:'canceled',state:'Отменена',cancellationDate:'30.03.2026 21:00',cancellationRemaining:'00:59:59',canRestore:true,cancellationReason:'Заказчик передумал'},
    'sample-final':{...common,kind:'canceled',state:'Отменена',cancellationDate:'29.03.2026 21:00',cancellationRemaining:'00:00:00',canRestore:false,cancellationReason:'Заказчик передумал'}
  };
  const colors={new:'#d96262',appointed:'#ffb21c',agreed:'#1b9dd9','in-work':'#1b9dd9',completed:'#43be83',canceled:'#181818'};
  const localKeys={kind:20,state:30,assignedTo:60,agreementHistory:160,cancellationReason:255,cancellationDate:30,cancellationRemaining:20,previousKind:20,linkedAct:50,actId:50,resultQuantity:1,completedDate:10,actComment:255,baseQuantity:1,baseService:80};
  const states={new:'Новая',appointed:'Назначена',agreed:'Согласована','in-work':'В работе',completed:'Выполнена',canceled:'Отменена'};
  let current=null,drafts={},returnFocus=null,primary=null,mapPreview=null,editorKey='',confirmAction=null,mapProvider='',actHandler=null,pickerHook=null,notesVisible={note:false,comment:false};
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
  const dateText=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?value.split('-').reverse().join('.'):value||'';
  const validDate=value=>{const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value||'');if(!m)return false;const d=new Date(+m[3],+m[2]-1,+m[1]);return d.getFullYear()===+m[3]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[1];};
  const validTime=value=>{const m=/^([01]\d|2[0-3]):([0-5]\d)\s*[-–]\s*([01]\d|2[0-3]):([0-5]\d)$/.exec(value||'');return Boolean(m&&(+m[1]*60 + +m[2]) < (+m[3]*60 + +m[4]));};
  const urgency=n=>n<0?'overdue':n<=5?'critical':n<=15?'warning':'calm';
  const hasDeadline=()=>['new','appointed'].includes(current?.kind)&&Number.isFinite(current.agreementMinutesLeft);
  const canEdit=()=>['new','appointed','agreed'].includes(current?.kind);
  // Compatibility: retired speculative sample opens the supported verification scenario.
  function getSample(id){const sampleId=id==='sample-replacement'?'sample-agreed':id;return Object.prototype.hasOwnProperty.call(samples,sampleId)?{...samples[sampleId],detailKey:id}:null;}
  function readItem(item){const v={...item,detailKey:item.detailKey||item.id,quantity:item.quantity||item.work?.match(/(\d+) счётчик/)?.[1]||'',service:item.service||services[0],visitDate:dateText(item.visitDate||item.requestedDate),visitTime:item.visitTime||item.requestedTime||'',amount:item.amount||'',note:item.note||'',comment:item.comment||'',baseAddress:item.address||'',baseQuantity:item.baseQuantity||item.quantity||item.work?.match(/(\d+) счётчик/)?.[1]||'',baseService:item.baseService||item.service||services[0],...drafts[item.detailKey||item.id]};v.pricePending=v.quantity!==v.baseQuantity||v.service!==v.baseService;return v;}
  function button(label,callback,kind='secondary'){const b=el('button','request-action detail-'+kind,label);b.type='button';b.addEventListener('click',callback);return b;}
  function dialog(heading,description,trigger){editorKey='';confirmAction=null;overlay.dataset.mode='default';editorContent.hidden=true;editorSave.hidden=true;editorSave.className='request-action primary';find('request-action-description').hidden=false;find('request-action-title').textContent=heading;find('request-action-description').textContent=description;dialogClose.textContent='Понятно';dialogClose.className='request-action primary';returnFocus=trigger||document.activeElement;overlay.hidden=false;dialogClose.focus?.({preventScroll:true});}
  function hideDialog(){const wasOpen=!overlay.hidden,key=editorKey;overlay.hidden=true;editorKey='';confirmAction=null;if(wasOpen){const target=returnFocus?.isConnected?returnFocus:content.querySelector('[data-field="'+key+'"]')||mapPreview||primary;target?.focus?.({preventScroll:true});}}
  function confirm(heading,description,label,callback,{danger=false}={}){dialog(heading,description);confirmAction=callback;editorSave.hidden=false;editorSave.textContent=label;editorSave.classList.toggle('detail-cancel',danger);dialogClose.textContent='Отмена';dialogClose.className='request-action detail-secondary';editorSave.focus?.({preventScroll:true});}
  function localUpdate(patch){const id=current.detailKey;drafts[id]={...(drafts[id]||{}),...patch,localDemo:true};drafts=Object.fromEntries(Object.entries(drafts).slice(-8));Object.assign(current,patch,{localDemo:true});refresh();onChange?.();}
  function refresh(){const number=current.number||current.id;title.textContent=number;title.setAttribute('aria-label','Заявка '+number);const badge=el('span','detail-status-badge');badge.append(el('span','status-dot'),document.createTextNode(current.state));status.replaceChildren(badge);status.style.setProperty('--detail-status-color',colors[current.kind]||'#616264');status.setAttribute('aria-label','Статус: '+current.state+'. Показать пояснение');renderContent();renderActions();app.verifierTimerDemo?.refresh?.();}
  dialogClose.addEventListener('click',hideDialog);
  overlay.addEventListener('click',event=>{if(event.target===overlay)hideDialog();});
  overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();hideDialog();}if(event.key==='Tab'){const nodes=[...overlay.querySelectorAll('button,input,select,textarea')].filter(n=>!n.disabled&&!n.closest('[hidden]'));const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus?.();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus?.();}}});
  function statusHelp(){if(!current)return;dialog(current.state,{
    new:'Заявка ещё не назначена поверителю. Принятие заявки и согласование визита — два отдельных шага.',
    appointed:'Свяжитесь с клиентом, уточните адрес, дату и время. После договорённости согласуйте заявку.',
    agreed:'Визит согласован. Для поверки создают акт; для другой услуги подтверждают выполнение.',
    'in-work':'Работа продолжается в связанном акте. Заявка и акт сохраняют отдельные номера.',
    completed:'Работы выполнены. В заявке доступны заказанное и фактически поверенное количество.',
    canceled:current.canRestore===true?'До окончания указанного срока заявку можно вернуть в работу.':current.canRestore===false?'Срок возврата в работу истёк.':'Срок и возможность возврата не получены. Требуется проверить актуальные данные.'
  }[current.kind]||'Статус получен из данных заявки.');}
  status.addEventListener('click',statusHelp);find('request-help').addEventListener('click',statusHelp);
  function requiredStep(){
    if(!current||!['new','appointed','agreed'].includes(current.kind))return null;
    if(!current.address.trim())return {key:'address',label:'Указать адрес',message:'Для продолжения нужен адрес.'};
    if(!/^[1-9]$/.test(current.quantity))return {key:'quantity',label:'Указать количество',message:'Укажите количество счётчиков от 1 до 9.'};
    if(current.kind!=='new'){
      const dateMissing=!validDate(current.visitDate),timeMissing=!validTime(current.visitTime);
      if(dateMissing&&timeMissing)return {key:'visitDate',label:'Указать дату и время',sequence:true};
      if(dateMissing)return {key:'visitDate',label:'Указать дату'};
      if(timeMissing)return {key:'visitTime',label:'Указать время'};
    }
    return null;
  }
  function actionLabel(){if(!current)return '';return {new:'Принять заявку',appointed:'Согласовать',agreed:'Создать акт','in-work':current.linkedAct?'Продолжить акт':'Создать акт',completed:'',canceled:current.canRestore===true?'Вернуть в работу':''}[current.kind]||'';}
  function updateFooter(){
    if(!current||!primary)return;
    const step=requiredStep(),label=step?.label||actionLabel();primary.replaceChildren(el('span','action-label',label));primary.className='request-action primary';primary.removeAttribute('data-urgency');
    primary.setAttribute('aria-label',label+', заявка '+(current.number||current.id));
    let hint='';
    if(current.kind==='canceled'&&current.canRestore!==true)hint=current.canRestore===false?'Срок возврата в работу истёк':'Возможность возврата ещё не подтверждена';
    actionHint.textContent=hint;actionHint.hidden=!hint;draftStatus.textContent=current.localDemo?'Изменено в макете':'';draftStatus.hidden=!current.localDemo;
  }
  function remember(key,value){
    if(!current||!canEdit()||!Object.prototype.hasOwnProperty.call(editableKeys,key))return;
    value=String(value).slice(0,editableKeys[key]);const id=current.detailKey,entry={...(drafts[id]||{}),[key]:value};delete drafts[id];drafts[id]=entry;drafts=Object.fromEntries(Object.entries(drafts).slice(-8));current[key]=value;
    if(key==='quantity'||key==='service'){entry.baseQuantity=current.baseQuantity;entry.baseService=current.baseService;current.pricePending=current.quantity!==current.baseQuantity||current.service!==current.baseService;}
    content.querySelector('[data-field="'+key+'"] .detail-field-error')?.remove();content.querySelector('#detail-'+key)?.removeAttribute('aria-invalid');
    if(key==='address'){
      mapPreview?.querySelector('.detail-map-image')?.remove();mapPreview?.setAttribute('aria-label','Открыть карту: '+current.city+', '+current.address);
    }
    if(key==='quantity'||key==='service')updatePriceNote();updateFooter();onChange?.();
  }
  function updatePriceNote(){const note=content.querySelector('#detail-price-note'),amount=content.querySelector('#detail-amount');if(note){note.hidden=!current.pricePending;note.textContent='Стоимость уточняется после изменения количества или вида работ.';}if(amount){amount.textContent=current.pricePending?'Уточняется':current.amount;amount.closest('[data-field="amount"]').setAttribute('aria-label','Стоимость заявки: '+(current.pricePending?'Уточняется':current.amount||'Не указана'));}}
  function affordance(key){const symbol=icon(['visitDate','visitTime','service','quantity'].includes(key)?'chevron':'edit');symbol.classList.add('detail-affordance');return symbol;}
  function field(label,value,key,{editable=false,glyph,visibleLabel=false,unit,placeholder=''}={}){
    const active=editable&&canEdit(),group=el('div','detail-field-group'),caption=el('span','detail-label',label),wrap=el(active?'button':'div','detail-field');caption.id='detail-caption-'+key;group.append(caption,wrap);wrap.dataset.field=key;
    if(active){wrap.type='button';wrap.setAttribute('aria-haspopup','dialog');wrap.addEventListener('click',()=>openEditor(key));}
    wrap.setAttribute('aria-label',(active?'Изменить ':'')+label+': '+(value||'Не указано'));
    const line=el('span','detail-value-row');if(glyph)line.append(icon(glyph));
    const val=el('span','detail-value',value||'');val.id='detail-'+key;line.append(val);if(!value&&placeholder)line.append(el('span','detail-placeholder',placeholder));if(unit)line.append(el('span','detail-unit',unit));if(active)line.append(affordance(key));wrap.append(line);return group;
  }
  function pair(a,b){const row=el('div','detail-pair');row.append(a,b);return row;}
  function openVisitEditor(key){
    dialog('Дата и время визита','',content.querySelector('[data-field="'+key+'"]')||primary);overlay.dataset.mode='visit';find('request-action-description').hidden=true;editorContent.hidden=false;editorContent.replaceChildren();editorKey='visit';editorSave.hidden=false;editorSave.textContent='Готово';dialogClose.textContent='Отмена';dialogClose.className='request-action detail-secondary';
    const dateLabel=el('label','detail-visit-control'),date=el('input');date.id='request-visit-date';date.type='date';date.value=validDate(current.visitDate)?current.visitDate.split('.').reverse().join('-'):'';dateLabel.append(el('span','detail-label','Дата визита'),date);
    const timeLabel=el('label','detail-visit-control'),time=el('select');time.id='request-visit-time';time.setAttribute('aria-label','Время визита');
    const values=['',current.visitTime,...Array.from({length:14},(_,i)=>String(i+8).padStart(2,'0')+':00 - '+String(i+9).padStart(2,'0')+':00')];
    for(const value of [...new Set(values)]){const option=el('option','',value?value.replace(' - ','–'):'Выбрать время');option.value=value;if(value===current.visitTime)option.setAttribute('selected','');time.append(option);}timeLabel.append(el('span','detail-label','Время визита'),time);editorContent.append(dateLabel,timeLabel);
    if(pickerHook){pickerHook(editorContent);editorContent.querySelector('[data-picker-for="'+(key==='visitTime'?time.id:date.id)+'"]')?.focus?.({preventScroll:true});}else{const target=key==='visitTime'?time:date;target.focus?.({preventScroll:true});}
  }
  function openEditor(key){
    if(!canEdit()||!Object.prototype.hasOwnProperty.call(editableKeys,key))return;
    if(key==='visitDate'||key==='visitTime'){openVisitEditor(key);return;}
    editorKey=key;confirmAction=null;overlay.dataset.mode='default';editorSave.className='request-action primary';returnFocus=content.querySelector('[data-field="'+key+'"]')||primary;
    find('request-action-title').textContent={address:'Адрес',clientName:'Владелец СИ',quantity:'Количество ИПУ',service:'Вид работ',visitDate:'Дата визита',visitTime:'Время визита'}[key]||'Данные заявки';
    find('request-action-description').hidden=true;editorContent.hidden=false;editorContent.replaceChildren();editorSave.hidden=false;editorSave.textContent='Сохранить';dialogClose.textContent='Отмена';dialogClose.className='request-action detail-secondary';
    {
      const input=el(key==='address'?'textarea':key==='service'?'select':'input');input.id='request-editor-value';input.setAttribute('aria-label',find('request-action-title').textContent);
      if(key==='service'){for(const value of services){const option=el('option','',value);option.value=value;if(value===current.service)option.setAttribute('selected','');input.append(option);}}
      else{input.type='text';input.value=current[key]||'';input.maxLength=editableKeys[key];if(key==='quantity')input.inputMode='numeric';if(key==='address')input.rows=3;}
      if(key==='address')editorContent.append(el('p','detail-editor-city',current.city));editorContent.append(input);
    }
    overlay.hidden=false;pickerHook?.(editorContent);const focus=editorContent.querySelector('button,input:not([hidden]),textarea');focus?.focus?.({preventScroll:true});
  }
  editorSave.addEventListener('click',()=>{
    if(confirmAction){confirmAction();return;}
    if(editorKey==='visit'){
      const date=editorContent.querySelector('#request-visit-date'),time=editorContent.querySelector('#request-visit-time');const dateValue=dateText(date.value),timeValue=time.value;
      editorContent.querySelectorAll('.detail-field-error').forEach(n=>n.remove());date.removeAttribute('aria-invalid');time.removeAttribute('aria-invalid');
      const invalid=!validDate(dateValue)?date:!validTime(timeValue)?time:null;if(invalid){const error=el('p','detail-field-error',invalid===date?'Выберите дату визита.':'Выберите время визита.');error.setAttribute('role','alert');invalid.setAttribute('aria-invalid','true');invalid.parentElement.append(error);invalid.focus?.();return;}
      remember('visitDate',dateValue);remember('visitTime',timeValue);renderContent();updateFooter();hideDialog();return;
    }
    if(!editorKey)return;const key=editorKey,input=editorContent.querySelector('#request-editor-value'),value=input.value;
    let error='';if(key==='quantity'&&!/^[1-9]$/.test(value))error='Укажите количество от 1 до 9.';if(key==='address'&&!value.trim())error='Укажите адрес.';
    editorContent.querySelector('.detail-field-error')?.remove();if(error){const message=el('p','detail-field-error',error);message.setAttribute('role','alert');editorContent.append(message);return;}
    remember(key,value);renderContent();updateFooter();hideDialog();content.querySelector('[data-field="'+key+'"]')?.focus?.({preventScroll:true});
  });
  function renderContent(){
    const v=current;content.replaceChildren();history.replaceChildren();mapPreview=null;
    deadlineCard.replaceChildren();deadlineCard.hidden=!hasDeadline();
    if(hasDeadline()){const m=v.agreementMinutesLeft;deadlineCard.dataset.urgency=urgency(m);deadlineCard.append(icon('clock'),el('span','',m<0?'Согласование просрочено на '+Math.abs(m)+' мин':m===0?'Время на согласование истекло':'На согласование осталось '+m+' мин'));}
    if(v.syncState){const notice=el('div','detail-notice');notice.dataset.sync=v.syncState;notice.append(el('strong','',v.syncState==='error'?'Изменения не отправлены':'Ожидает отправки'),el('p','',v.syncDescription||'Подтверждение сервера ещё не получено.'));content.append(notice);}
    if(v.kind==='canceled')content.append(field('Причина отмены',v.cancellationReason||'','cancellationReason',{visibleLabel:true}),field('Отменена',v.cancellationDate||v.canceled||'','cancellationDate',{visibleLabel:true}),field('До окончательной отмены',v.cancellationRemaining||'Неизвестно','cancellationRemaining',{visibleLabel:true}));
    const addressGroup=el('div','detail-field-group');addressGroup.append(el('span','detail-label','Адрес'));const address=el(canEdit()?'button':'div','detail-field detail-full-address');address.dataset.field='address';
    if(canEdit()){address.type='button';address.setAttribute('aria-haspopup','dialog');address.addEventListener('click',()=>openEditor('address'));}
    address.setAttribute('aria-label','Адрес: '+v.city+', '+v.address);
    const city=el('span','detail-locality',v.city||'Населённый пункт не указан'),street=el('span','detail-address-text',v.address);city.id='detail-city';city.setAttribute('aria-label','Населённый пункт: '+city.textContent);street.id='detail-address';address.append(city,street);if(canEdit())address.append(affordance('address'));addressGroup.append(address);content.append(addressGroup);
    const mapGroup=el('div','detail-map-group');mapPreview=el(mapProvider?'a':'button','detail-map-preview');if(!mapProvider){mapPreview.type='button';mapPreview.addEventListener('click',openMap);}else{mapPreview.href=mapUrl(mapProvider);mapPreview.target='_blank';mapPreview.rel='noopener noreferrer';}mapPreview.id='request-map';mapPreview.dataset.detailRoute='true';mapPreview.setAttribute('aria-label','Построить маршрут: '+v.city+', '+v.address);
    if(v.mapSource==='original'&&v.address===v.baseAddress){const img=el('img','detail-map-image');img.src='poverkadoma-home-asset-request-map.png';img.alt='Карта из исходного макета заявки, район улицы Ворошилова';mapPreview.append(img);}else mapPreview.append(el('span','detail-map-unavailable','Карта недоступна'));
    mapPreview.append(el('span','detail-map-link','Построить маршрут'));mapGroup.append(mapPreview);if(mapProvider){const change=button('Карты',openMap);change.classList.add('detail-map-change');change.setAttribute('aria-label','Сменить приложение карт');mapGroup.append(change);}content.append(mapGroup);
    content.append(field('Владелец СИ',v.clientName,'clientName',{editable:true,glyph:'person'}));
    const phone=field('Контактный телефон',v.phone||'','phone'),phoneRow=el('div','detail-phone-row'),dial=v.phoneDial||v.phone?.replace(/[^+\d]/g,'')||'';phoneRow.append(phone);
    if(/^\+?\d{7,15}(?:;ext=\d{1,6})?$/.test(dial)){const call=el('a','request-call');call.href='tel:'+dial;call.setAttribute('aria-label','Позвонить по номеру '+v.phone);call.append(icon('call'));phoneRow.append(call);}else phoneRow.classList.add('detail-phone-unavailable');content.append(phoneRow);
    const date=field('Дата визита',v.visitDate,'visitDate',{editable:true,glyph:'calendar',placeholder:'Выбрать'}),time=field('Время визита',v.visitTime,'visitTime',{editable:true,glyph:'clock',placeholder:'Выбрать'});
    const visit=pair(date,time);visit.dataset.detailBlock='visit';content.append(visit,field('Вид работ',v.service,'service',{editable:['appointed','agreed'].includes(v.kind)}));
    const work=pair(field('Количество счётчиков',v.quantity,'quantity',{editable:true,glyph:'meter',unit:'ИПУ'}),field('Стоимость заявки',v.amount,'amount'));work.dataset.detailBlock='work';content.append(work);
    const priceNote=el('p','detail-field-note');priceNote.id='detail-price-note';content.append(priceNote);updatePriceNote();
    if(v.kind==='completed')content.append(field('Количество поверенных счётчиков',v.resultQuantity||'','resultQuantity',{visibleLabel:true}));
    for(const key of ['note',...(v.kind==='new'?[]:['comment'])]){
      const label=key==='note'?'примечание':'комментарий поверителя',shown=notesVisible[key],toggle=button((shown?'Скрыть ':v[key]?'Показать ':'Добавить ')+label,()=>{notesVisible[key]=!notesVisible[key];renderContent();if(notesVisible[key])content.querySelector('#detail-'+key)?.focus?.({preventScroll:true});});toggle.dataset.noteToggle=key;toggle.setAttribute('aria-expanded',String(shown));
      if(v[key]&&!shown){const group=el('div','detail-field-group');group.append(el('span','detail-label',key==='note'?'Примечание':'Комментарий поверителя'));toggle.className='detail-field detail-note-preview';toggle.setAttribute('aria-label',(key==='note'?'Примечание: ':'Комментарий поверителя: ')+v[key]+'. Показать полностью');toggle.replaceChildren(el('span','detail-note-preview-text',v[key]),icon('chevron'));group.append(toggle);content.append(group);}else content.append(toggle);
      if(shown){const group=el('div','detail-field-group'),box=el('div','detail-field detail-note-field');group.append(el('span','detail-label',key==='note'?'Примечание':'Комментарий поверителя'),box);box.dataset.field=key;const input=el('textarea');input.id='detail-'+key;input.rows=3;input.maxLength=editableKeys[key];input.value=v[key]||'';input.textContent=v[key]||'';input.setAttribute('aria-label',key==='note'?'Примечание к заявке':'Комментарий поверителя');input.placeholder=key==='note'?'Примечание к заявке':'Комментарий поверителя';input.readOnly=!canEdit();input.addEventListener('input',()=>remember(key,input.value));box.append(input);content.append(group);}
    }
    if(v.linkedAct){const act=button('Акт '+v.linkedAct,openAct);act.dataset.detailAct=v.linkedAct;content.append(act);}
    if(v.agreementHistory)history.append(field('Согласование',v.agreementHistory,'agreementHistory',{visibleLabel:true}));
    if(v.createdUserName)history.append(field('Агент',v.createdUserName,'createdUserName',{visibleLabel:true}));
    if(v.kind==='completed'&&v.completedDate)history.append(field('Дата выполнения',v.completedDate,'completedDate',{visibleLabel:true}));
    if(hasDeadline()){
      const bounds=[v.receivedTime?'Получена '+v.receivedTime:'',v.agreementDue?'Срок '+v.agreementDue:''].filter(Boolean).join(' · ');if(bounds)history.append(el('p','detail-created',bounds));
    }
    if(v.kind==='canceled'&&v.canRestore!==true)content.append(el('p','detail-field-note',v.canRestore===false?'Срок возврата в работу истёк':'Возможность возврата ещё не подтверждена'));
  }
  function mapUrl(provider){const address=encodeURIComponent([current.city,current.address].filter(Boolean).join(', '));return provider==='google'?'https://www.google.com/maps/dir/?api=1&destination='+address:'https://yandex.ru/maps/?text='+address;}
  function openMap(){
    const address=[current.city,current.address].filter(Boolean).join(', ');dialog('Маршрут',address,mapPreview);editorContent.hidden=false;editorContent.replaceChildren();
    for(const [provider,label] of [['yandex','Яндекс Карты'],['google','Google Карты']]){const link=el('a','request-action detail-secondary',label);link.href=mapUrl(provider);link.target='_blank';link.rel='noopener noreferrer';link.dataset.mapProvider=provider;link.addEventListener('click',()=>{mapProvider=provider;renderContent();hideDialog();});editorContent.append(link);}
  }
  function cancelRequest(){
    if(app.dataset.offline==='true'){dialog('Нет подключения к интернету','Для подтверждения отмены требуется соединение. Локальные правки сохранены.');return;}
    confirm('Отменить заявку?','Выберите причину отмены. Изменение сохранится только в макете.','Отменить заявку',()=>{
      const reason=editorContent.querySelector('select').value,other=editorContent.querySelector('textarea').value.trim();
      if(reason==='Другая причина'&&!other){editorContent.querySelector('textarea').setAttribute('aria-invalid','true');editorContent.querySelector('textarea').focus?.();return;}
      if(app.dataset.offline==='true'){dialog('Нет подключения к интернету','Отмена не подтверждена. Локальные правки сохранены.');return;}const previousKind=current.kind;hideDialog();localUpdate({kind:'canceled',state:states.canceled,previousKind,cancellationReason:reason==='Другая причина'?other:reason,cancellationDate:new Date().toLocaleString('ru-RU'),cancellationRemaining:'Срок уточняется',canRestore:true});
    },{danger:true});
    editorContent.hidden=false;editorContent.replaceChildren();const select=el('select');select.id='request-cancel-reason';select.setAttribute('aria-label','Причина отмены');for(const reason of ['Заказчик передумал','Не удалось связаться','Другая причина']){const option=el('option','',reason);option.value=reason;select.append(option);}const note=el('textarea');note.id='request-cancel-note';note.setAttribute('aria-label','Другая причина');note.placeholder='Другая причина';note.maxLength=255;note.rows=3;note.hidden=true;select.addEventListener('change',()=>{note.hidden=select.value!=='Другая причина';});editorContent.append(select,note);pickerHook?.(editorContent);
  }
  function openAct(){
    if(actHandler){actHandler({...current});return;}
    const number=current.linkedAct||'Д-'+(current.number||current.id),existing=Boolean(current.linkedAct);
    confirm('Акт '+number,'Черновик в макете. Полный редактор поверки будет отдельным экраном.',existing?'Сохранить черновик':'Создать черновик',()=>{const value=editorContent.querySelector('textarea').value;hideDialog();localUpdate({linkedAct:number,kind:'in-work',state:states['in-work'],actComment:value.slice(0,255)});});
    if(existing)dialogClose.textContent='Назад к заявке';editorContent.hidden=false;editorContent.replaceChildren();editorContent.append(el('p','detail-created',current.city+', '+current.address),el('p','detail-created',current.quantity+' ИПУ'));const note=el('textarea');note.id='request-act-comment';note.setAttribute('aria-label','Комментарий к акту');note.placeholder='Комментарий к акту';note.value=current.actComment||'';note.rows=3;note.maxLength=255;editorContent.append(note);
  }
  function changeAct(){
    confirm('Изменить привязку','Номер связанного акта в макете. Очистите поле, чтобы снять привязку.','Сохранить',()=>{const value=editorContent.querySelector('input').value.trim();if(value&&!/^[\p{L}\d-]{1,50}$/u.test(value)){editorContent.querySelector('input').setAttribute('aria-invalid','true');return;}hideDialog();localUpdate({linkedAct:value,kind:value?'in-work':'agreed',state:value?states['in-work']:states.agreed});});
    editorContent.hidden=false;editorContent.replaceChildren();const input=el('input');input.id='request-act-number';input.value=current.linkedAct||'';input.maxLength=50;input.setAttribute('aria-label','Номер акта');editorContent.append(input);
  }
  function mainAction(){
    const step=requiredStep();if(step){openEditor(step.key);return;}
    const label=actionLabel();if(!label)return;
    if(label==='Продолжить акт'||label==='Создать акт'){openAct();return;}
    if(app.dataset.offline==='true'){dialog('Нет подключения к интернету','Черновик остаётся в макете. Для подтверждения изменения статуса приложению нужно соединение с сервером.',primary);return;}
    confirm(label,current.city+', '+current.address+'\n'+(current.visitDate||'Дата не указана')+' · '+(current.visitTime||'Время не указано')+'\n\nИзменение сохранится только в макете.',label,()=>{
      if(app.dataset.offline==='true'){dialog('Нет подключения к интернету','Изменение статуса не подтверждено. Локальные правки сохранены.');return;}
      hideDialog();
      if(current.kind==='new')localUpdate({kind:'appointed',state:states.appointed,assignedTo:'demo-verifier'});
      else if(current.kind==='appointed')localUpdate({kind:'agreed',state:states.agreed,agreementHistory:'Заявка согласована в макете'});
      else if(current.kind==='canceled'){const kind=['appointed','agreed','in-work'].includes(current.previousKind)?current.previousKind:'appointed';localUpdate({kind,state:states[kind]});}
      else if(current.kind==='agreed')localUpdate({kind:'completed',state:states.completed,resultQuantity:current.quantity,completedDate:new Date().toLocaleDateString('ru-RU')});
    });
  }
  function renderActions(){
    actions.replaceChildren();secondary.replaceChildren();primary=button('',mainAction);footer.hidden=!actionLabel();if(actionLabel())actions.append(primary);
    if(['appointed','agreed'].includes(current.kind)){const cancel=button('Отменить заявку',cancelRequest);cancel.classList.add('detail-cancel');secondary.append(cancel);}
    if(current.kind==='in-work'&&current.linkedAct)secondary.append(button('Изменить привязку',changeAct));
    if(current.kind==='canceled'&&current.canRestore!==true){const restore=button('Вернуть в работу',()=>{});restore.disabled=true;secondary.append(restore);}
    secondary.hidden=!secondary.children.length;updateFooter();
  }
  function show(item){
    current=readItem(item);notesVisible={note:false,comment:false};editorKey='';confirmAction=null;overlay.hidden=true;information.open=false;
    created.textContent=current.created||'Не указана';created.dateTime=current.created?.split('.').reverse().join('-')||'';refresh();viewport.scrollTop=0;
  }
  function restoreDrafts(value){drafts={};if(!value||typeof value!=='object'||Array.isArray(value))return;for(const[id,entry]of Object.entries(value).slice(-8)){if(!/^(?:sample-[a-z-]+|[\d-]{1,40})$/.test(id)||!entry||typeof entry!=='object')continue;const clean={};for(const[key,limit]of Object.entries({...editableKeys,...localKeys}))if(typeof entry[key]==='string')clean[key]=entry[key].slice(0,limit);for(const key of ['service','baseService'])if(clean[key]&&!services.includes(clean[key]))delete clean[key];if(clean.kind&&!Object.prototype.hasOwnProperty.call(states,clean.kind)){delete clean.kind;delete clean.state;}else if(clean.kind)clean.state=states[clean.kind];if(entry.localDemo===true)clean.localDemo=true;if(typeof entry.canRestore==='boolean')clean.canRestore=entry.canRestore;if(Object.keys(clean).length)drafts[id]=clean;}}
  function restorePreferences(value){mapProvider=['yandex','google'].includes(value?.mapProvider)?value.mapProvider:'';}
  function syncActs(acts){let changed=false;for(const [key,entry]of Object.entries(drafts)){if(!entry.actId)continue;const act=acts.find(a=>a.id===entry.actId);const patch=!act?{actId:'',linkedAct:'',kind:'agreed',state:states.agreed}:act.status==='sent'?{linkedAct:act.number,kind:'completed',state:states.completed,resultQuantity:String(act.meters?.length||''),completedDate:act.date}:null;if(patch&&Object.entries(patch).some(([k,v])=>entry[k]!==v)){Object.assign(entry,patch);if(current?.detailKey===key)Object.assign(current,patch);changed=true;}}if(changed)onChange?.();}
  function updateItem(item,patch){const v=readItem(item),key=v.detailKey;drafts[key]={...(drafts[key]||{}),...patch,localDemo:true};if(current?.detailKey===key)Object.assign(current,patch,{localDemo:true});onChange?.();}
  return {show,getSample,closeDialog:hideDialog,getDrafts:()=>JSON.parse(JSON.stringify(drafts)),restoreDrafts,getPreferences:()=>({mapProvider}),restorePreferences,triggerPrimary:mainAction,setPickerHook:fn=>{pickerHook=fn;},updateItem,setActHandler:fn=>{actHandler=fn;},applyActLink:(id,number)=>localUpdate({actId:String(id),linkedAct:String(number||id),kind:'in-work',state:states['in-work']}),syncActs};
}
