const fs=require('node:fs');
const path=require('node:path');
const base=__dirname;
require('./poverkadoma-home-preview-build.js');
const oldId='pd-home-current-preview',id='pd-verifier-app-preview',prefix='#'+id;
let fragment=fs.readFileSync(path.join(base,'poverkadoma-home-preview.html'),'utf8').replaceAll(oldId,id);
let runtime=fragment.match(/<script>\s*([\s\S]*?)\s*<\/script>/)[1];
runtime=runtime.replace('const persist = () => window.openai','const persist = () => app.verifierApp ? app.verifierApp.persist() : window.openai');
runtime=runtime.replace('const restore = state => {','const restore = state => {\n    if(app.verifierApp){app.verifierApp.restore(state);return;}');
// The full application restores once, after all modules exist. Keep pristine view defaults available.
runtime=runtime.replace('  restore(window.openai?.widgetState);','');
const bridge=`
  app.verifierBridge={icon,showSection,showRequests,openRequest,requestDetail,
    getRequests:()=>{const all=new Map(requests.map(item=>[item.id,{...item,...(requestDetail.getDrafts()[item.id]||{})}]));for(const [key,item]of renderedRequestModels)all.set(key,item);return [...all.values()];},
    getBaseState:()=>({modelContent:{section:activeSection,searchOpen:!field.hidden,offline:app.dataset.offline==='true',roundedTopbar:app.dataset.topbarCorners!=='square',roundedBottomBar:app.dataset.bottomBarCorners!=='square',blueFill:app.dataset.blueFill,cardData:app.dataset.cardData,cardText:app.dataset.cardText,cityScenario:app.dataset.cityScenario,linkedBidExample:linkedBidToggle.checked,listScope,dateFilter,shadows:shadowsToggle.checked,borders:bordersToggle.checked,shadowDepth:Number(shadowDepth.value)},privateContent:{query:input.value.slice(0,200),dateFrom,dateTo,requestFilters,selectedRequestId,requestDrafts:requestDetail.getDrafts(),requestPreferences:requestDetail.getPreferences()}}),
    restoreBaseState:state=>{const saved=state?.privateContent||{},model=state?.modelContent||{};requestDetail.restoreDrafts(saved.requestDrafts);requestDetail.restorePreferences(saved.requestPreferences);setNetwork(!model.offline);setCorners(model.roundedTopbar!==false);setBottomCorners(model.roundedBottomBar!==false);setBlueFill(model.blueFill);setSurfaceAppearance(model.shadows!==false,model.borders!==false,model.shadowDepth??50);setCardChecks(model.cardData,model.cardText);setCityScenario(model.cityScenario);setLinkedBidExample(model.linkedBidExample!==false);setSearch(Boolean(model.searchOpen)||Boolean(saved.query),false);input.value=String(saved.query||'').slice(0,200);setListFilters(model.listScope,model.dateFilter,saved.dateFrom,saved.dateTo,saved.requestFilters||{});setFiltersOpen(false,false);renderRequests();}
  };
`;
const marker="  window.addEventListener('openai:set_globals', event => restore(event.detail?.globals?.widgetState));";
if(!runtime.includes(marker))throw Error('Missing bridge injection point');
runtime=runtime.replace(marker,marker+bridge);
for(const file of ['poverkadoma-verifier-acts.js','poverkadoma-verifier-tools.js','poverkadoma-verifier-access.js','poverkadoma-verifier-state.js','poverkadoma-verifier-pickers.js','poverkadoma-verifier-navigation.js','poverkadoma-verifier-timer-preview.js','poverkadoma-verifier-app.js'])runtime+='\n'+fs.readFileSync(path.join(base,file),'utf8');
runtime=runtime.replace("'poverkadoma-meter-demo.jpg'",JSON.stringify('data:image/jpeg;base64,'+fs.readFileSync(path.join(base,'poverkadoma-meter-demo.jpg')).toString('base64')));
runtime+=`\n{const root=document.getElementById('${id}');const app=root.querySelector('.phone');app.verifierTimerDemo=createVerifierTimerPreview({root,app});app.verifierApp=createVerifierApp({root,app,bridge:app.verifierBridge});}`;
new Function(runtime);
function scope(source){let output='',cursor=0;while(cursor<source.length){const start=source.indexOf('{',cursor);if(start<0){output+=source.slice(cursor);break;}const selector=source.slice(cursor,start).trim();let end=start+1,depth=1;while(depth&&end<source.length){if(source[end]==='{')depth++;if(source[end]==='}')depth--;end++;}const body=source.slice(start+1,end-1);output+=selector.startsWith('@')?selector+'{'+scope(body)+'}\n':selector.split(',').map(s=>prefix+' '+s.trim()).join(',')+'{'+body+'}\n';cursor=end;}return output;}
fragment=fragment.replace(/<script>[\s\S]*?<\/script>/,()=>'<script>\n'+runtime+'\n</script>');
fragment=fragment.replace('</style>',scope(fs.readFileSync(path.join(base,'poverkadoma-verifier-app.css'),'utf8'))+scope(fs.readFileSync(path.join(base,'poverkadoma-verifier-timer-preview.css'),'utf8'))+scope(fs.readFileSync(path.join(base,'poverkadoma-verifier-labels.css'),'utf8'))+'</style>');
if(Buffer.byteLength(fragment)>1200000)throw Error('Full preview exceeds1.2MB');
fs.writeFileSync(path.join(base,'poverkadoma-verifier-app-preview.html'),fragment);
console.log(JSON.stringify({output:'poverkadoma-verifier-app-preview.html',bytes:Buffer.byteLength(fragment),syntax:'passed'}));
