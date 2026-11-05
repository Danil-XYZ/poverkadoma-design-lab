const fs = require('node:fs');
const path = require('node:path');
const base = __dirname;
const id = 'pd-home-current-preview';
const root = '#' + id;
const html = fs.readFileSync(path.join(base, 'poverkadoma-home.html'), 'utf8');
const css = fs.readFileSync(path.join(base, 'poverkadoma-home.css'), 'utf8') + '\n' + fs.readFileSync(path.join(base, 'poverkadoma-request-detail.css'), 'utf8');
const js = fs.readFileSync(path.join(base, 'poverkadoma-home.js'), 'utf8') + '\n' + fs.readFileSync(path.join(base, 'poverkadoma-request-workflow.js'), 'utf8');
function scopedStyles(source) {
  let output = '', cursor = 0;
  while (cursor < source.length) {
    const opening = source.indexOf('{', cursor);
    if (opening < 0) { output += source.slice(cursor); break; }
    const prefix = source.slice(cursor, opening);
    let closing = opening + 1, depth = 1;
    while (closing < source.length && depth) {
      if (source[closing] === '{') depth++;
      if (source[closing] === '}') depth--;
      closing++;
    }
    const content = source.slice(opening + 1, closing - 1);
    const comments = prefix.match(/(?:\s*\/\*[\s\S]*?\*\/\s*)*/)?.[0] || '';
    const selector = prefix.slice(comments.length).trim();
    if (selector.startsWith('@')) output += comments + selector + '{' + scopedStyles(content) + '}\n';
    else {
      const selectors = selector.split(',').map(s => {
        s = s.trim();
        return s === ':root' || s === 'body' ? root : root + ' ' + s;
      });
      output += comments + selectors.join(', ') + '{' + content.replace(/cursor:\s*pointer\s*;/g, '') + '}\n';
    }
    cursor = closing;
  }
  return output;
}
const data = {};
for (const file of fs.readdirSync(base).filter(name => /^poverkadoma-home-(asset|expanded)-.*\.(svg|png)$/.test(name))) {
  const bytes = fs.readFileSync(path.join(base, file));
  if (!bytes.length) throw new Error('Empty asset ' + file);
  data[file] = 'data:' + (file.endsWith('.png') ? 'image/png' : 'image/svg+xml') + ';base64,' + bytes.toString('base64');
}
let markup = html.match(/<body>([\s\S]*?)<\/body>/)[1];
markup = markup.replace(/ title="[^"]*"/g, '').replace(/<button class="/g, '<button class="cursor-interaction ');
let runtime = js.replace("const app = document.getElementById('app');", `const root = document.getElementById('${id}');\n  const app = root.querySelector('.phone');`)
  .replace(/document\.getElementById\('([^']+)'\)/g, (all, key) => key === id ? all : `root.querySelector('#${key}')`)
  .replace('img.src = `poverkadoma-home-${expanded ? \'expanded\' : \'asset\'}-${file}.svg`;', 'img.src = assetData[`poverkadoma-home-${expanded ? \'expanded\' : \'asset\'}-${file}.svg`];')
  .replace('dot.src = `poverkadoma-home-asset-${item.dot}.svg`;', 'dot.src = assetData[`poverkadoma-home-asset-${item.dot}.svg`];');
runtime = runtime.replace("'use strict';", "'use strict';\n  const assetData = " + JSON.stringify(data) + ';')
  .replace("'poverkadoma-home-asset-request-map.png'", JSON.stringify(data['poverkadoma-home-asset-request-map.png']));
runtime = runtime.replace('  renderRequests();\n})();', `  renderRequests();
  const persist = () => window.openai?.setWidgetState?.({
    modelContent: { screen: selectedRequestId ? 'Заявка' : selectedDestination ? destinationLabels[selectedDestination] : sectionLabels[activeSection], section: activeSection, destination: selectedDestination, searchOpen: !field.hidden, offline: app.dataset.offline === 'true', roundedTopbar: app.dataset.topbarCorners !== 'square', roundedBottomBar: app.dataset.bottomBarCorners !== 'square', blueFill: app.dataset.blueFill, cardData: app.dataset.cardData, cardText: app.dataset.cardText, cityScenario: app.dataset.cityScenario, linkedBidExample: linkedBidToggle.checked, listScope, dateFilter, shadows: shadowsToggle.checked, borders: bordersToggle.checked, shadowDepth: Number(shadowDepth.value) },
    privateContent: { query: input.value.slice(0, 200), dateFrom, dateTo, requestFilters, selectedRequestId, requestDrafts:requestDetail.getDrafts(), requestPreferences:requestDetail.getPreferences() }
  }).catch(() => {});
  const restore = state => {
    if (!state) return;
    const saved = state.privateContent || {};
    requestDetail.restoreDrafts(saved.requestDrafts);
    requestDetail.restorePreferences(saved.requestPreferences);
    setNetwork(!state.modelContent?.offline);
    setCorners(state.modelContent?.roundedTopbar !== false);
    setBottomCorners(state.modelContent?.roundedBottomBar !== false);
    setBlueFill(state.modelContent?.blueFill);
    setSurfaceAppearance(state.modelContent?.shadows !== false, state.modelContent?.borders !== false, state.modelContent?.shadowDepth ?? 50);
    showRequests(false);
    setCardChecks(state.modelContent?.cardData, state.modelContent?.cardText);
    setCityScenario(state.modelContent?.cityScenario);
    setLinkedBidExample(state.modelContent?.linkedBidExample !== false);
    const restoredQuery = String(saved.query || '').slice(0, 200);
    setSearch(Boolean(state.modelContent?.searchOpen) || Boolean(restoredQuery.trim()), false);
    input.value = restoredQuery;
    setListFilters(state.modelContent?.listScope, state.modelContent?.dateFilter, saved.dateFrom, saved.dateTo, saved.requestFilters || {});
    setFiltersOpen(false, false);
    renderRequests();
    showSection(state.modelContent?.section);
    if (activeSection === 'requests' && typeof saved.selectedRequestId === 'string' && saved.selectedRequestId.length < 120) openRequest(saved.selectedRequestId, false);
    else if (typeof state.modelContent?.destination === 'string') openDestination(state.modelContent.destination);
  };
  restore(window.openai?.widgetState);
  toggle.addEventListener('click', persist);
  close.addEventListener('click', persist);
  input.addEventListener('input', persist);
  app.querySelectorAll('[data-scope]').forEach(item => item.addEventListener('click', persist));
  filterForm.addEventListener('submit', persist);
  filterApply.addEventListener('click', persist);
  filterSummary.addEventListener('click', persist);
  networkButtons.forEach(item => item.addEventListener('click', persist));
  cityScenarioButtons.forEach(item => item.addEventListener('click', persist));
  cornerButtons.forEach(item => item.addEventListener('click', persist));
  bottomCornerButtons.forEach(item => item.addEventListener('click', persist));
  blueFillButtons.forEach(item => item.addEventListener('click', persist));
  cardData.addEventListener('change', persist);
  cardText.addEventListener('change', persist);
  linkedBidToggle.addEventListener('change', persist);
  shadowsToggle.addEventListener('change', persist);
  bordersToggle.addEventListener('change', persist);
  shadowDepth.addEventListener('input', persist);
  list.addEventListener('click', event => { if (event.target.closest('.request-entry')) persist(); });
  requestBack.addEventListener('click', persist);
  requestScreen.addEventListener('input', persist);
  requestScreen.addEventListener('change', persist);
  requestScreen.addEventListener('click', persist);
  requestSample.addEventListener('change', persist);
  requestSampleOpen.addEventListener('click', persist);
  navButtons.forEach(item => item.addEventListener('click', persist));
  app.querySelectorAll('[data-destination]').forEach(item => item.addEventListener('click', persist));
  destinationBack.addEventListener('click', persist);
  input.addEventListener('keydown', event => { if (event.key === 'Escape') persist(); });
  window.addEventListener('openai:set_globals', event => restore(event.detail?.globals?.widgetState));
})();`);
const overrides = `
${root} { display: grid; place-items: center; width: 100%; padding: 16px 0; min-height: 0; height: auto; background-color: transparent; }
${root} .phone { width: min(390px, 100%); height: 844px !important; min-height: 0; border-radius: 28px; flex: none; }
${root} .prototype-controls { color: var(--foreground, #616264); }
${root} .cursor-interaction { cursor: inherit; }
`;
const previewCss = scopedStyles(css).replace(/url\("(poverkadoma-home-[^"]+)"\)/g, (match, name) => {
  if (!data[name]) throw new Error('Missing preview CSS asset ' + name);
  return `url("${data[name]}")`;
});
const preview = `<div id="${id}" class="viz-dotted-background">${markup}</div>\n<style>\n${previewCss}${overrides}</style>\n<script>\n${runtime}\n</script>\n`;
fs.writeFileSync(path.join(base, 'poverkadoma-home-preview.html'), preview);
const detailPreview = preview.replace('  restore(window.openai?.widgetState);', "  restore(window.openai?.widgetState);\n  if(!window.openai?.widgetState){openRequest('sample-appointed',false);root.querySelector('#request-sample-controls').open=true;}");
fs.writeFileSync(path.join(base, 'poverkadoma-request-preview.html'), detailPreview);
// Parse without executing to catch syntax errors in the self-contained preview.
new Function(runtime);
if (/<(?:html|head|body)(?:\s|>)/i.test(preview)) throw new Error('Preview must be a fragment');
if (preview.includes('https://www.figma.com/api/mcp/asset')) throw new Error('Temporary asset URL in runtime');
console.log(JSON.stringify({assetCount: Object.keys(data).length, bytes: Buffer.byteLength(preview), scriptSyntax: 'passed', output: 'poverkadoma-home-preview.html'}));
