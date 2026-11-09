const fs = require('node:fs');
const path = require('node:path');
const base = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(base, 'poverkadoma-problems.json'), 'utf8'));
const labels = {solved: 'Решено в макете', partial: 'Частично решено', check: 'Требует проверки', open: 'Не решено'};
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if (data.items.length !== 43 || data.items.some((x, i) => x.id !== i + 1)) throw Error('Expected all 43 problems in original order');
for (const item of data.items) {
  if (!labels[item.status] || (item.status === 'solved' && !item.image)) throw Error('Missing status or screenshot: ' + item.id);
  if (item.image && !fs.existsSync(path.join(base, item.image))) throw Error('Missing screenshot: ' + item.image);
}
const groups = [...new Set(data.items.map(x => x.group))];
const counts = Object.keys(labels).map(status => `<span class="problem-total ${status}"><strong>${data.items.filter(x => x.status === status).length}</strong> ${labels[status]}</span>`).join('');
const articles = data.items.map(x => `<details class="problem-item" id="problem-${x.id}" data-status="${x.status}" data-group="${esc(x.group)}"${x.id === 1 ? ' open' : ''}>
  <summary><span class="problem-number">${String(x.id).padStart(2,'0')}</span><span class="problem-summary"><span class="problem-group">${esc(x.group)}</span><span class="problem-title">${esc(x.problem)}</span></span><span class="problem-status ${x.status}">${labels[x.status]}</span></summary>
  <div class="problem-body${x.image ? ' has-evidence' : ''}"><div><h2>${x.status === 'solved' ? 'Как решили' : x.status === 'partial' ? 'Что изменили и что осталось' : 'Что ещё предстоит'}</h2><p>${esc(x.solution)}</p><a class="problem-permalink" href="#problems?item=${x.id}">Ссылка на пункт ${x.id}</a></div>${x.image ? `<figure><a href="${esc(x.image)}" target="_blank" rel="noopener" aria-label="Открыть скриншот к пункту ${x.id} в полном размере"><img src="${esc(x.image)}" alt="${esc(x.caption)}" width="390" height="600" loading="lazy"></a><figcaption>${esc(x.caption)}<span>Снимок макета · 09.11.2026 · нажмите для увеличения</span></figcaption></figure>` : ''}</div>
</details>`).join('\n');
const section = `<!-- problems:start -->
    <section id="page-problems" data-page="problems" hidden>
      <div class="page-heading"><div><p class="eyebrow">От наблюдения к решению</p><h1>Проблемы и решения</h1><p class="lead">43 наблюдения об оригинале — что изменили в рабочем макете и что ещё предстоит.</p></div></div>
      <p class="problem-scope">«Решено» означает решение в макете внутреннего поверителя. Это не подтверждение исправления в Android-приложении. Влияние на скорость работы пока не измеряли.</p>
      <div class="problem-totals" aria-label="Статусы всех проблем">${counts}</div>
      <div class="filter-bar problem-filters"><label class="search-field"><span class="sr-only">Поиск по проблемам и решениям</span><input id="problem-search" type="search" placeholder="Номер, проблема или решение"></label><label class="filter-select"><span class="sr-only">Статус проблемы</span><select id="problem-status"><option value="all">Все статусы</option>${Object.entries(labels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="filter-select"><span class="sr-only">Группа проблем</span><select id="problem-group"><option value="all">Все группы</option>${groups.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select></label><button class="button" type="button" id="problem-reset">Сбросить фильтры</button></div>
      <p id="problem-count" class="problem-count" role="status">Показано 43 из 43</p>
      <div id="problem-list">${articles}</div>
      <p id="problem-empty" class="empty-state" hidden>По этим условиям проблем не найдено. Измените запрос или сбросьте фильтры.</p>
    </section>
    <!-- problems:end -->`;
const file = path.join(base, 'poverkadoma-design-site.html');
let html = fs.readFileSync(file, 'utf8');
if (html.includes('<!-- problems:start -->')) html = html.replace(/<!-- problems:start -->[\s\S]*?<!-- problems:end -->/, section);
else html = html.replace('    <section id="page-experiments"', section + '\n    <section id="page-experiments"');
const rows = data.items.map(x => `<tr data-comparison-row data-status="${x.status}" data-group="${esc(x.group)}" data-number="${x.id}">
  <th scope="row"><a href="#problems?item=${x.id}" aria-label="Подробности пункта ${x.id}">${String(x.id).padStart(2,'0')}</a><span class="comparison-group">${esc(x.group)}</span></th>
  <td>${esc(x.problem)}</td>
  <td><p>${esc(x.solution)}</p><a class="comparison-detail" href="#problems?item=${x.id}">Подробнее${x.image ? ' и скриншот' : ''} ↗</a></td>
  <td><span class="problem-status ${x.status}">${labels[x.status]}</span></td>
</tr>`).join('\n');
const comparison = `<!-- comparison:start -->
    <section id="page-comparison" data-page="comparison" hidden>
      <div class="page-heading"><div><p class="eyebrow">Все изменения в одном месте</p><h1>До / после</h1><p class="lead">Сводная таблица по всем 43 пунктам: оригинал, текущее состояние макета и статус решения.</p></div></div>
      <p class="problem-scope">Сравнение относится к макету внутреннего поверителя. Частичные решения, нерешённые вопросы и непроверенные сценарии сохранены в таблице с отдельными статусами.</p>
      <div class="filter-bar problem-filters"><label class="search-field"><span class="sr-only">Поиск в таблице до и после</span><input id="comparison-search" type="search" placeholder="Номер, проблема или изменение"></label><label class="filter-select"><span class="sr-only">Статус в таблице</span><select id="comparison-status"><option value="all">Все статусы</option>${Object.entries(labels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label class="filter-select"><span class="sr-only">Группа в таблице</span><select id="comparison-group"><option value="all">Все группы</option>${groups.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select></label><button class="button" type="button" id="comparison-reset">Сбросить фильтры</button></div>
      <p id="comparison-count" class="problem-count" role="status">Показано 43 из 43</p>
      <p class="comparison-scroll-hint">Прокрутите таблицу вправо, чтобы увидеть все колонки.</p>
      <div class="comparison-scroll" role="region" aria-label="Сводная таблица до и после" tabindex="0">
        <table class="comparison-table"><caption class="sr-only">Все 43 проблемы оригинала и изменения в рабочем макете</caption><colgroup><col class="comparison-topic"><col class="comparison-before"><col class="comparison-after"><col class="comparison-state"></colgroup><thead><tr><th scope="col">№ · Группа</th><th scope="col">До — оригинал</th><th scope="col">После — текущий макет</th><th scope="col">Статус</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <p id="comparison-empty" class="empty-state" hidden>По этим условиям строк не найдено. Измените запрос или сбросьте фильтры.</p>
    </section>
    <!-- comparison:end -->`;
if (html.includes('<!-- comparison:start -->')) html = html.replace(/<!-- comparison:start -->[\s\S]*?<!-- comparison:end -->/, () => comparison);
else html = html.replace('    <section id="page-experiments"', () => comparison + '\n    <section id="page-experiments"');
fs.writeFileSync(file, html);
console.log('Problems: 43 items; all resolved items have local screenshots.');
