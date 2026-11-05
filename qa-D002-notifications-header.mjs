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
const draw=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(0));};
const tap=n=>{assert.ok(n&&!n.closest('[hidden]'));n.dispatchEvent(new Event('click',{bubbles:true}));};
core.navigate('tools');
core.navigate('notifications');
for(const hints of [true,false])for(const offline of [false,true,false]){
  app.dataset.offline=String(offline);
  core.api.setSettings({hints});
  draw();
  assert.equal(title.textContent,'Уведомления');
  assert.equal(back.hidden,false);
  assert.equal(actions.querySelector('.detail-offline').hidden,!offline);
  assert.equal(actions.querySelector('.v-route-help').hidden,!hints);
  assert.equal(actions.querySelector('.v-notifications-button').hidden,true);
  assert.equal(actions.querySelector('.v-settings-button').hidden,false);
  assert.equal(toolbar.hasAttribute('data-ink-layout'),false);
}
core.api.setSettings({hints:true});
tap(actions.querySelector('.v-route-help'));
assert.equal(document.querySelector('#verifier-modal').hidden,false);
core.api.closeModal();
tap(actions.querySelector('.v-settings-button'));
assert.equal(core.getRoute().route,'settings');
core.navigate('tools');
core.navigate('notifications');
tap(back);
assert.equal(core.getRoute().route,'tools');

// Validate the compiled selectors rather than assuming source rules survive scoping.
const css=[...fragment.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(m=>m[1].split(',').map(selector=>({selector:selector.trim(),body:m[2]})));
const scoped='#pd-verifier-app-preview .phone[data-v-route="notifications"]';
const rule=(state,element)=>rules.filter(r=>r.selector===scoped+state+' .v-topbar '+element).map(r=>r.body).join(' ');
assert.match(rule('','.detail-toolbar'),/justify-content: flex-start/);
assert.match(rule('','.app-back-button'),/width: 48px; flex: 0 0 48px/);
assert.match(rule('','.app-screen-title'),/max-width: calc\(100% - 44px\)/);
assert.match(rule('','.toolbar-actions'),/gap: 8px; margin-left: auto/);
assert.match(rule('[data-offline="false"]','.network-slot'),/display: none/);
assert.match(rule('[data-offline="true"]','.detail-toolbar'),/--tools-action-width: 44px/);
assert.match(rule('[data-offline="true"]','.toolbar-actions'),/gap: 0/);
assert.ok(!rules.some(r=>r.selector.includes(scoped)&&r.selector.includes('data-ink-layout')));
console.log('Notifications: network, hints, navigation and compiled toolbar rules passed.');
