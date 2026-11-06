import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./poverkadoma-verifier-navigation.js',import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(source,context);
const plan=context.planToolsHeaderInk;
let checked=0;
function verify(title,right,end,widths,target){
  const result=plan(title,right,end,widths,widths.map(()=>target));assert.ok(result);
  let last=title,previousTarget=title;
  for(const item of result.items){
    assert.ok(Math.abs(item.left-last-result.gap)<.001,'Visible ink gaps differ');
    assert.ok(item.target>=previousTarget,'Touch targets overlap');
    assert.ok(item.target<=item.left+.01&&item.target+target>=item.left+item.width-.01,'Artwork leaves its touch target');
    assert.ok(item.target+target<=right,'Touch target leaves the toolbar');
    last=item.left+item.width;previousTarget=item.target+target;
  }
  assert.ok(Math.abs(last-end)<.001,'Right artwork anchor moved');checked++;return result;
}
// 390px phone, 16px gutters; narrow question mark versus cloud, bell and gear.
const online=verify(171,374,357,[7.7,15.7,13.15],48);
const offline=verify(171,374,358.575,[24,7.7,15.7,13.15],44);
assert.ok(offline.gap<online.gap,'Offline must uniformly compress gaps');
verify(171,374,357,[15.7,13.15],48); // Hints disabled, online.
verify(171,374,358.575,[24,15.7,13.15],44); // Hints disabled, offline.
verify(171,414,398.575,[24,7.7,15.7,13.15],44); // Wider viewport.
const notification = plan(196.15,328,310.575,[24,7.7,13.15],[0,44,48]);
assert.ok(notification, 'A passive indicator may use the padding beside the help glyph at 360px');
assert.ok(notification.items[1].target+44<=280,'Help must not overlap the anchored Settings button');
checked++;
for(const [title,right,end,widths,target] of [[0,0,0,[0],48],[NaN,374,357,[24],48],[171,344,328,[24,7.7,15.7,13.15],44],[327,374,358.575,[24,7.7,15.7,13.15],44]]){
  assert.equal(plan(title,right,end,widths,widths.map(()=>target)),null,'Unavailable / insufficient geometry must use the flex fallback');checked++;
}
console.log(`D001: ${checked} geometric planner cases passed. This does not constitute browser visual verification.`);
