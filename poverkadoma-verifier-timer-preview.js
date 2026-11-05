/* Presentation-only clock. Never writes request models, deadlines or drafts. */
function createVerifierTimerPreview({root,app}) {
  const controls=root.querySelector('#prototype-controls');
  const make=(tag,cls='',text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const state={style:'wave',playing:!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,manualMinutes:30};
  let elapsed=0,lastStamp=null,frameId=null,disposed=false;
  const cycle=42000,descent=40000;
  const fields=make('section','prototype-timer-preview');fields.setAttribute('aria-label','Демонстрация индикатора срока');
  const styleRow=make('div','prototype-control-row'),styleLabel=make('label','','Остаток времени'),styleSelect=make('select');styleSelect.id='request-timer-style';styleLabel.htmlFor=styleSelect.id;
  for(const [value,label]of [['wave','Мягкая волна'],['window','Окошко'],['plain-tab','Вкладка без дорожки'],['seal','Метка времени'],['meeting','Встречные формы']]){const option=make('option','',label);option.value=value;styleSelect.append(option);}styleRow.append(styleLabel,styleSelect);
  const timeline=make('div','prototype-timer-timeline'),rangeLabel=make('label','','Демонстрация срока'),range=make('input'),output=make('output');range.id='request-timer-minutes';range.type='range';range.min='-10';range.max='30';range.step='1';range.value='30';rangeLabel.htmlFor=range.id;output.id='request-timer-minutes-value';output.setAttribute('for',range.id);timeline.append(rangeLabel,output,range);
  const actions=make('div','prototype-timer-actions'),play=make('button','cursor-interaction'),restart=make('button','cursor-interaction','Сначала');play.id='request-timer-play';restart.id='request-timer-restart';play.type=restart.type='button';actions.append(play,restart);
  const note=make('p','prototype-timer-note','Общий цикл: 30 → −10 мин за 40 с, затем повтор. Карточки и экран заявки синхронизированы.');
  fields.append(styleRow,timeline,actions,note);controls.prepend(fields);
  const wavePoints=['7px 0','100% 0','100% 100%'];
  // One broad bend instead of the earlier two narrow,steep waves.
  for(let i=96;i>=0;i--){const y=i/96;wavePoints.push((6+3*Math.sin(y*Math.PI*2)).toFixed(3)+'px '+(y*100).toFixed(3)+'%');}
  app.style.setProperty('--request-timer-wave','polygon('+wavePoints.join(',')+')');
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function minutes(){return state.playing?30-clamp(elapsed%cycle,0,descent)/1000:state.manualMinutes;}
  function color(m){const remaining=Math.max(0,Math.ceil(m-1e-8));return remaining>15?[0,132,193]:remaining>5?[255,178,28]:[217,97,97];}
  function paint(){
    const m=minutes(),display=(Math.ceil(m-1e-8)||0),rgb=color(m),description=display<0?'Просрочено на '+Math.abs(display)+' мин':display===0?'Срок истёк':'Осталось '+display+' мин';app.dataset.requestTimerStyle=state.style;app.style.setProperty('--request-timer-color','rgb('+rgb.join(',')+')');app.style.setProperty('--request-timer-opacity',display>15?'0':'1');app.style.setProperty('--request-timer-ink','#ffffff');
    styleSelect.value=state.style;range.value=String(display);range.setAttribute('aria-valuetext',description);output.textContent=description;play.textContent=state.playing?'Пауза':'Запустить';play.setAttribute('aria-pressed',String(state.playing));play.setAttribute('aria-label',state.playing?'Приостановить демонстрацию срока':'Запустить цикл от 30 до минус 10 минут');
    for(const button of app.querySelectorAll('#requests .request-action.agreement-action')){
      let panel=button.querySelector('.request-timer-panel');
      if(!panel){const old=button.querySelector('.action-deadline');button.dataset.timerSourceLabel=button.getAttribute('aria-label')||'';old?.remove();panel=make('span','request-timer-panel');panel.setAttribute('aria-hidden','true');panel.append(make('span','request-timer-caption'),make('span','request-timer-value'));button.append(panel);button.classList.add('has-timer-preview');}
      const caption=display<0?'Просрочено':display===0?'Срок':'Осталось',value=display===0?'истёк':Math.abs(display)+' мин';const c=panel.querySelector('.request-timer-caption'),v=panel.querySelector('.request-timer-value');if(c.textContent!==caption)c.textContent=caption;if(v.textContent!==value)v.textContent=value;
      button.dataset.timerPreviewMinutes=String(display);const source=(button.dataset.timerSourceLabel||'').split('. ')[0];button.setAttribute('aria-label',source+'. Демонстрация: '+description.toLocaleLowerCase('ru')+'.');
    }
    const deadline=app.querySelector('#request-deadline');if(deadline&&!deadline.hidden){const text=display<0?'Согласование просрочено на '+Math.abs(display)+' мин':display===0?'Время на согласование истекло':'На согласование осталось '+display+' мин',value=deadline.querySelector('span:not(.icon)');if(value&&value.textContent!==text)value.textContent=text;deadline.dataset.timerPreviewMinutes=String(display);deadline.dataset.urgency=display<0?'overdue':display<=5?'critical':display<=15?'warning':'calm';}
  }
  const now=()=>window.performance?.now?.()??Date.now();
  function cancel(){if(frameId==null)return;if(window.cancelAnimationFrame)window.cancelAnimationFrame(frameId);else window.clearTimeout?.(frameId);frameId=null;}
  function schedule(){if(disposed||!state.playing||frameId!=null||document.hidden)return;if(window.requestAnimationFrame)frameId=window.requestAnimationFrame(frame);else frameId=window.setTimeout?.(()=>frame(now()),40);}
  function frame(stamp){frameId=null;if(disposed||!state.playing)return;const visible=!document.hidden;if(lastStamp!==null&&visible)elapsed=(elapsed+Math.max(0,Math.min(250,stamp-lastStamp)))%cycle;lastStamp=stamp;if(visible)paint();schedule();}
  function persist(){app.verifierApp?.persist?.();}
  function refresh(){paint();schedule();}
  function getState(){return {version:2,style:state.style,playing:state.playing,manualMinutes:state.manualMinutes,elapsed};}
  function restore(saved){cancel();const current=saved?.version===2;state.style=['wave','window','plain-tab','seal','meeting'].includes(saved?.style)?saved.style:'wave';state.playing=current&&typeof saved.playing==='boolean'?saved.playing:!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;state.manualMinutes=current&&Number.isFinite(saved.manualMinutes)?clamp(saved.manualMinutes,-10,30):30;elapsed=current&&Number.isFinite(saved.elapsed)?clamp(saved.elapsed,0,cycle-1):0;lastStamp=null;refresh();}
  styleSelect.addEventListener('change',()=>{state.style=['wave','window','plain-tab','seal','meeting'].includes(styleSelect.value)?styleSelect.value:'wave';paint();persist();});
  play.addEventListener('click',()=>{if(state.playing){state.manualMinutes=minutes();state.playing=false;cancel();}else{elapsed=(30-clamp(state.manualMinutes,-10,30))*1000;state.playing=true;lastStamp=now();schedule();}paint();persist();});
  restart.addEventListener('click',()=>{elapsed=0;state.manualMinutes=30;state.playing=true;lastStamp=now();paint();schedule();persist();});
  range.addEventListener('input',()=>{state.playing=false;state.manualMinutes=clamp(Number(range.value)||0,-10,30);cancel();paint();persist();});
  document.addEventListener('visibilitychange',()=>{lastStamp=null;if(document.hidden)cancel();else schedule();});
  refresh();
  return {refresh,getState,restore,dispose:()=>{disposed=true;cancel();fields.remove();},getDisplayMinutes:()=>(Math.ceil(minutes()-1e-8)||0),getVisualColor:()=>color(minutes())};
}
