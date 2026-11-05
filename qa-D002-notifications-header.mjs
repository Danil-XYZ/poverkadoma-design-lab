import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseHTML} from './poverkadoma-qa-dom.mjs';

const fragment=fs.readFileSync(new URL('./poverkadoma-verifier-app-preview.html',import.meta.url),'utf8');
const code=fragment.match(/<script>\s*([\s\S]*?)\s*<\/script>/)[1];
const {window,document,Event}=parseHTML('<html><body>'+fragment+'</body></html>');
Object.defineProperty(Object.getPrototypeOf(document.createElement('select')),'value',{configurable:true,get(){return this.querySelector('option[selected]')?.getAttribute('value')??this.querySelector('option')?.getAttribute('value')??'';},set(value){this.querySelectorAll('option').forEach(n=>n.toggleAttribute('selected',n.getAttribute('value')===String(value)));}});
const frames=new Map();let frameId=0;
window.openai={setWidgetState:()=>Promise.resolve()};window.setTimeout=()=>1;window.clearTimeout=()=>{};
window.matchMedia=()=>({matches:true});window.requestAnimationFrame=fn=>{frames.set(++frameId,fn);return frameId;};window.cancelAnimationFrame=id=>frames.delete(id);
new vm.Script(code).runInNewContext({window,document,console,Date,setTimeout:()=>1,clearTimeout:()=>{},URL,Blob});
const app=document.querySelector('.phone'),core=app.verifierApp,header=app.querySelector('.v-topbar');
const toolbar=header.querySelector('.detail-toolbar'),title=toolbar.querySelector('.app-screen-title'),actions=toolbar.querySelector('.toolbar-actions'),back=toolbar.querySelector('.app-back-button');
const rect=(left,width,top=0,height=48)=>({left,right:left+width,top,bottom:top+height,width,height});
let viewport=390,scale=1,wrap=false;
const visible=()=>[...actions.children].filter(n=>!n.hidden&&!(n.classList.contains('network-slot')&&app.dataset.offline!=='true'));
const size=()=>app.dataset.offline==='true'?44:48;
const geometry=()=>{const count=visible().length,gap=app.dataset.offline==='true'?0:8,content=viewport-32,titleWidth=164*scale,backWidth=size()-12,actionWidth=count*size()+(count-1)*gap,free=Math.max(0,content-backWidth-titleWidth-actionWidth-16);return {titleLeft:16+backWidth+8+free/2,titleWidth,actionWidth,content};};
toolbar.getBoundingClientRect=()=>rect(16,geometry().content);
title.getBoundingClientRect=()=>rect(geometry().titleLeft,geometry().titleWidth,8,32*scale);
back.getBoundingClientRect=()=>rect(4,size());
window.getComputedStyle=()=>({font:'600 24px Segoe UI',strokeWidth:'1.7'});
const create=document.createElement.bind(document);
document.createElement=tag=>{const n=create(tag);if(tag==='canvas')n.getContext=()=>({measureText:()=>({actualBoundingBoxRight:geometry().titleWidth})});return n;};
const settings=actions.querySelector('.v-settings-button .icon'),svg=create('svg');svg.viewBox={baseVal:{x:0,width:24}};svg.getBBox=()=>({x:3,width:18});settings.replaceChildren(svg);
for(const control of actions.children){
  control.getBoundingClientRect=()=>rect(viewport-16-geometry().actionWidth+visible().indexOf(control)*(size()+(app.dataset.offline==='true'?0:8)),size(),wrap?64:0);
  const glyph=control.querySelector('.icon'),img=glyph?.querySelector('img');
  if(img)img.getBoundingClientRect=()=>{const r=control.getBoundingClientRect(),help=glyph.dataset.iconKind==='help',w=help?19.7:24;return rect(r.left+r.width/2-w/2,w,12,20);};
}
svg.getBoundingClientRect=()=>{const r=settings.parentElement.getBoundingClientRect();return rect(r.left+r.width/2-8,16,16,16);};
const draw=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(0));};
const tap=n=>{assert.ok(n&&!n.closest('[hidden]'));n.dispatchEvent(new Event('click',{bubbles:true}));};
let checked=0;
for(viewport of [390,430])for(const offline of [false,true])for(const hints of [false,true]){
  app.dataset.offline=String(offline);core.api.setSettings({hints});core.navigate('notifications');draw();
  assert.ok(size()-12+geometry().titleWidth+geometry().actionWidth+16<=geometry().content,'Normal heading and all controls must fit on one flex line');
  assert.equal(toolbar.dataset.inkLayout,'true');assert.equal(title.textContent,'Уведомления');assert.equal(back.hidden,false);
  assert.equal(actions.querySelector('.v-notifications-button').hidden,true,'Nested page must not duplicate Notifications');
  const nodes=visible(),positions=nodes.map(n=>parseFloat(n.style.getPropertyValue('--tools-button-left'))+16);
  assert.ok(positions[0]>=geometry().titleLeft+geometry().titleWidth+4);
  positions.forEach((left,i)=>{assert.ok(left+size()<=viewport-16+.01);if(i)assert.ok(left>=positions[i-1]+size()-.01,'Touch targets overlap');});
  let edge=geometry().titleLeft+geometry().titleWidth;const gaps=[];
  nodes.forEach((control,i)=>{const glyph=control.querySelector('.icon'),img=glyph.querySelector('img'),r=(img||svg).getBoundingClientRect();let left,width;
    if(img){const help=glyph.dataset.iconKind==='help';left=r.left+(help?r.width*6/19.7:0);width=r.width*(help?7.7/19.7:1);}else{left=r.left+(3-.85)*r.width/24;width=19.7*r.width/24;}
    left+=positions[i]-control.getBoundingClientRect().left+parseFloat(control.style.getPropertyValue('--tools-icon-shift'));
    gaps.push(left-edge);edge=left+width;
  });
  assert.ok(gaps.every(g=>Math.abs(g-gaps[0])<.01),'Visible title/action gaps differ');checked++;
}
// The heading is never truncated or shrunk; insufficient room uses the wrapping flex fallback.
for(const state of [{viewport:320,scale:1,wrap:true},{viewport:390,scale:2,wrap:true}]){
  ({viewport,scale,wrap}=state);app.dataset.offline='true';core.api.setSettings({hints:true});core.navigate('notifications');draw();
  assert.equal(toolbar.hasAttribute('data-ink-layout'),false);
  for(const control of actions.children)assert.equal(control.style.getPropertyValue('--tools-button-left')||'','');checked++;
}
viewport=390;scale=1;wrap=false;app.dataset.offline='false';core.navigate('tools');core.navigate('notifications');draw();
tap(actions.querySelector('.v-route-help'));assert.equal(document.querySelector('#verifier-modal').hidden,false);core.api.closeModal();
tap(actions.querySelector('.v-settings-button'));assert.equal(core.getRoute().route,'settings');draw();assert.equal(toolbar.hasAttribute('data-ink-layout'),false);
core.navigate('tools');core.navigate('notifications');tap(back);assert.equal(core.getRoute().route,'tools');checked++;
const css=fs.readFileSync(new URL('./poverkadoma-verifier-app.css',import.meta.url),'utf8');
assert.match(css,/\.phone:is\(\[data-v-route="tools"\],\[data-v-route="notifications"\]\)\[data-offline="false"\][^{]*\.network-slot\s*\{\s*display: none/);
assert.match(css,/\.phone:is\(\[data-v-route="tools"\],\[data-v-route="notifications"\]\)[^{]*\.app-screen-title\s*\{[^}]*flex: 0 0 auto/);checked++;
console.log(`D002: ${checked} simulated geometry, fallback, CSS and navigation cases passed. Browser visual verification remains unavailable.`);
