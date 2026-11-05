const fs=require('fs'),path=require('path'),vm=require('vm');
const base=__dirname,read=name=>fs.readFileSync(path.join(base,name),'utf8');
const assets=base;
const series=[
 ['concept','Первая общая концепция','Концепции','poverkadoma-concept.html','Первый подход к общей структуре и ролям приложения.',1],
 ['concept-v2','Пересборка главных экранов','Концепции','poverkadoma-concept-v2.html','Уточнение разделов и рабочих сценариев после первого обсуждения.',1],
 ['concept-v3','Проверка сценариев всех ролей','Концепции','poverkadoma-concept-v3.html','Следующая итерация навигации, форм и доступности.',1],
 ['ten-concepts','Десять подходов к приложению','Концепции','poverkadoma-ten-concepts.html','Разные способы организовать работу и выделить следующее действие.',10],
 ['design-directions','Направления дизайна','Концепции','poverkadoma-design-experiments.html','Разные модели навигации и организации объектов.',10],
 ['internal','Первый макет внутреннего поверителя','Концепции','poverkadoma-internal-verifier.html','Фокус на рабочем пути одной роли, тонкой обводке и нижней навигации.',1],
 ['internal-v2','Прямые переходы','Навигация','poverkadoma-internal-verifier-v2.html','Доступ к разделам с сохранением коротких путей.',1],
 ['hypotheses','Пять гипотез удобства','Сценарии','poverkadoma-five-hypotheses-preview.html','Очередь, согласование, вход в задачу, проверка и синхронизация.',5],
 ['presentations','Три представления заявок','Заявки','poverkadoma-three-presentations-preview.html','Список, расписание и доска статусов.',3],
 ['professional','Профессиональные направления','Стиль','poverkadoma-professional-ten-preview.html','Десять вариантов более сдержанной композиции рабочего экрана.',10],
 ['bold-draft','Смелые стили: первый проход','Стиль','poverkadoma-bold-ten-draft-preview.html','Ранние стилистические эксперименты до последующей доработки.',10],
 ['bold','Смелые стили: доработка','Стиль','poverkadoma-bold-ten-preview.html','Переработанные формы карточек, кнопок и поверхностей.',10],
 ['soft','Мягкие поверхности','Стиль','poverkadoma-soft-reference-preview.html','Эксперимент по банковскому референсу с исходной палитрой приложения.',1],
 ['work-list','Рабочая лента заявок','Заявки','poverkadoma-work-list-preview.html','Компактность, разделение задач и спокойная иерархия карточки.',1],
 ['navigation','Десять схем навигации','Навигация','poverkadoma-navigation-ten-preview.html','Группировка заявок, актов, инструментов, настроек и коммуникаций.',10],
 ['bottom-nav','Выделение нижней навигации','Навигация','poverkadoma-bottom-nav-preview.html','Десять способов показать выбранный раздел. Выбрана мягкая капсула.',10,'Выбрана мягкая капсула'],
 ['deadline','Срок согласования','Время','poverkadoma-deadline-preview.html','Первые способы привлечь внимание к оставшемуся времени.',10],
 ['deadline-compact','Компактные убывающие индикаторы','Время','poverkadoma-deadline-compact-preview.html','Поиск читаемого индикатора без увеличения карточки.',10],
 ['deadline-text','Текст внутри шкалы','Время','poverkadoma-deadline-text-preview.html','Полоса со временем и бледным остатком израсходованной части.',1],
 ['button-ring','Круговой таймер в кнопке','Время','poverkadoma-button-timer-preview.html','Пять вариантов объединения действия и кругового индикатора.',5],
 ['button-indicator','Кнопка как индикатор','Время','poverkadoma-button-indicator-preview.html','Десять способов совместить действие и срок.',10],
 ['button-twenty','Двадцать индикаторных кнопок','Время','poverkadoma-action-timer-twenty.html','Разные формы визуализации остатка времени внутри кнопки.',20],
 ['water-twenty','Водяная тема и компактная кнопка','Время','poverkadoma-water-timer-twenty.html','Волна, окошко и другие варианты при прежней высоте действия.',20,'Волна вошла в рабочий макет'],
 ['acts','Экран «Акты»','Акты','poverkadoma-acts-twenty.html','Двадцать вариантов списка с реквизитами каждого счётчика.',20,'Выбраны лейблы рабочей ленты'],
 ['act-card-first','Компоновки карточки акта','Акты','poverkadoma-act-card-layouts-before-composition.html','Первый набор из двадцати композиций шапки и прикреплённых счётчиков.',20],
 ['act-card-current','Группы реквизитов','Акты','poverkadoma-act-card-layouts.html','Пять схем шапки и четыре схемы строк. Выбран вариант «Группы реквизитов».',20,'Выбраны группы реквизитов'],
 ['request-summary','Компактная сводка заявки','Заявки','poverkadoma-request-summary-ten.html','Номер, статус и срок. Выбрана нижняя лента; в рабочем макете она белая, с общей тенью.',10,'Выбрана нижняя лента']
];
const experiments=series.map(([id,title,category,file,description,count,decision],index)=>({id,title,category,file,description,count,decision:decision||'',order:index+1}));
const documents=[
 ['role-context','Роль и её сценарии','Контекст','roles'],
 ['product','Полная картина продукта','Исследование','product-context.html'],
 ['internal-audit','Аудит внутреннего поверителя','Аудит','internal-verifier-ux-audit.json'],
 ['request-analysis','Экран заявки: анализ и улучшения','Анализ экрана','poverkadoma-request-analysis.md'],
 ['critical','Критический обзор экранов','Аудит','poverkadoma-verifier-critical-review.json'],
 ['navigation','Навигация и число переходов','Аудит','poverkadoma-main-navigation-audit.json'],
 ['navigation-original','Аудит доступности разделов','Аудит','poverkadoma-verifier-navigation-audit.json'],
 ['requests','Сверка наполнения заявки','Аудит','poverkadoma-request-detail-audit.json'],
 ['forms','Формы и сценарии: исходное исследование','Исследование','audit_forms_confluence_result.json'],
 ['criteria','Критерии качества дизайна','Критерии','concept-lab-criteria.json'],
 ['ideas','Подтверждённые удачные идеи','Решения','poverkadoma-design-ideas.json'],
 ['rules','Правила дизайна','Решения','poverkadoma-design-rules.json'],
 ['rationale','История обоснований изменений','Обоснования','poverkadoma-design-rationale.json'],
 ['coverage','Покрытие сценариев макетом','Проверка','poverkadoma-verifier-coverage.json'],
 ['qa','Последняя проверка рабочего макета','Проверка','poverkadoma-verifier-qa.json'],
 ['palette','Исходная цветовая палитра','Основа дизайна','poverkadoma-original-palette.html']
].map(([id,title,kind,file])=>({id,title,kind,file}));
const escape=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fields={date:'Дата',role:'Роль',scope:'Область',status:'Статус',goal:'Задача',design:'Что важно в интерфейсе',sources:'Источники',findings:'Наблюдения',priorities:'Приоритеты',assessment:'Оценка',scenarioGroups:'Группы сценариев',preserve:'Что сохранить',unverified:'Что не проверено',unchanged:'Без изменений',reviews:'Обзор экранов',criteria:'Критерии',checks:'Проверки',title:'Название',name:'Название',requirement:'Требование',application:'Применение',user_feedback:'Комментарий пользователя',latest_user_feedback:'Последнее уточнение',idea:'Идея',accepted_ideas:'Подтверждённые идеи',rejected_experiments:'Отклонённые эксперименты',rules:'Правила',standing_constraints:'Постоянные требования',verification:'Проверка',limitations:'Ограничения',basis:'Основание',change:'Изменение',changes:'Изменения',reason:'Обоснование',evidence:'Свидетельства',severity:'Приоритет',screen:'Экран',scenario:'Сценарий',issue:'Проблема',problem:'Проблема',recommendation:'Предложение',expected:'Ожидается',actual:'Наблюдается',next:'Следующий шаг',id:'Идентификатор',before:'До',after:'После',test:'Как проверять',kind:'Тип основания',conclusion:'Вывод',confidence:'Уверенность',phoneStatus:'Проверка на устройстве',evidenceLevels:'Уровни доказательств',proposal:'Предложение',sourcesPolicy:'Политика источников',matched:'Совпадает',differences:'Различия',missing:'Не хватает',actions:'Действия',notes:'Примечания'};
function renderValue(value,depth=0){
 if(value===null||value===undefined)return '<span class="record-key">Не указано</span>';
 if(typeof value==='boolean')return value?'Да':'Нет';
 if(typeof value!=='object'){const text=escape(value);return /^https?:\/\//.test(String(value))?'<a target="_blank" rel="noopener noreferrer" href="'+text+'">'+text+'</a>':text.replace(/\n/g,'<br>');}
 if(Array.isArray(value)){if(!value.length)return '<span class="record-key">Нет записей</span>';if(value.every(v=>typeof v!=='object'||v===null))return '<ul class="record-list">'+value.map(v=>'<li>'+renderValue(v,depth+1)+'</li>').join('')+'</ul>';return value.map((v,i)=>'<details class="record-group"'+(depth<1?' open':'')+'><summary>'+escape(v?.title||v?.name||v?.label||v?.screen||v?.scenario||v?.idea||'Запись '+(i+1))+'</summary><div>'+renderValue(v,depth+1)+'</div></details>').join('');}
 return Object.entries(value).map(([key,v])=>typeof v==='object'&&v!==null?'<details class="record-group"'+(depth<1?' open':'')+'><summary>'+escape(fields[key]||key.replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2'))+'</summary><div>'+renderValue(v,depth+1)+'</div></details>':'<div class="record-pair"><div class="record-key">'+escape(fields[key]||key.replace(/_/g,' '))+'</div><div class="record-value">'+renderValue(v,depth+1)+'</div></div>').join('');
}
function embedAssets(source){
 source=source.replace(/(?:src|href)="([^"#]+\.(?:png|jpg|jpeg|svg|json))"/g,(whole,file)=>{const target=path.resolve(base,file);if(path.dirname(target)!==base||!fs.existsSync(target))return whole;const ext=path.extname(file).slice(1),mime=({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',svg:'image/svg+xml',json:'application/json'})[ext];return whole.replace(file,'data:'+mime+';base64,'+fs.readFileSync(target).toString('base64'))+(ext==='json'?' download="'+file+'"':'');});
 return source.replace(/(['"])([a-zA-Z0-9_-]+\.(?:png|jpg|svg))\1/g,(whole,q,file,offset,text)=>{if(/^\s*:/.test(text.slice(offset+whole.length)))return whole;if(!fs.existsSync(path.join(base,file)))return whole;const mime=file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':'image/jpeg';return q+'data:'+mime+';base64,'+fs.readFileSync(path.join(base,file)).toString('base64')+q;});
}
const raw={},reportHtml={},reportData={};
for(const item of experiments)raw[item.id]=embedAssets(read(item.file));
raw.main=embedAssets(read('poverkadoma-verifier-app-preview.html'));
raw.scenarios=read('poverkadoma-original-epc.html').replace(/<script[^>]*src="[^"]+"[^>]*>\s*<\/script>/g,'');
const marked=require('./poverkadoma-site-marked.js').marked;
for(const doc of documents){if(doc.file==='roles')continue;const source=read(doc.file);if(doc.file.endsWith('.html'))raw['doc-'+doc.id]=embedAssets(source);else if(doc.file.endsWith('.md'))reportHtml[doc.id]=marked.parse(source);else{const value=JSON.parse(source);reportData[doc.id]=value;reportHtml[doc.id]=renderValue(value);}doc.snapshot=doc.file.endsWith('.json')?String(reportData[doc.id]?.updated||reportData[doc.id]?.date||'Исследовательский снимок'):'Сохранённый материал';}
const epc=JSON.parse(read('epc-original-models.json')),product=JSON.parse(read('product-context.json'));
const roleIndexes={'internal-v':[2],'internal-r':[5],'internal-d':[4],'internal-vr':[2,5],'internal-vd':[2,4],'internal-rd':[5,4],'internal-vrd':[2,5,4],'external-vr':[3,5],agent:[6],demo:[1],guest:[0],central:[7],admin:[8]};
const roles=epc.profiles.map(p=>({id:p.id,label:p.label,note:p.note,group:p.group,processes:p.processes,roles:p.roles}));
const roleHtml={};for(const p of roles){const relevant=(roleIndexes[p.id]||[]).map(i=>product.roles[i]);roleHtml[p.id]='<h1>'+escape(p.label)+'</h1><p>'+escape(p.note)+'</p>'+relevant.map(r=>'<h2>'+escape(r.name)+'</h2><p><strong>Задача:</strong> '+escape(r.goal)+'</p><p>'+escape(r.design)+'</p><div class="source-links">'+r.sources.map(id=>'<a target="_blank" rel="noopener noreferrer" href="https://ms-resource.atlassian.net/wiki/spaces/MSR/pages/'+encodeURIComponent(id)+'">Источник '+escape(id)+'</a>').join('')+'</div>').join('')+'<h2>Процессы роли</h2><ul>'+p.processes.map(id=>'<li>'+escape(epc.models.find(m=>m.id===id)?.title||id)+'</li>').join('')+'</ul><h2>Правила и открытые вопросы</h2>'+renderValue({roleRules:epc.roleRules,unresolved:epc.unresolved});}
const script=source=>'<script>'+source.replace(/<\/script/gi,'<\\/script')+'</script>';
let kit=fs.readFileSync(path.join(assets,'poverkadoma-site-visualize.html'),'utf8').replace('<!--__INLINE_VISUALIZATION_FRAGMENT__-->','').replace(/<script[^>]*src="[^"]+"[^>]*>\s*<\/script>/g,'');
const payload={version:1,buildDate:'2026-11-05',title:'Поверка дома — дизайн-лаборатория',experiments,documents,roles,raw,reportHtml,reportData,roleHtml,processes:epc.models.map(m=>({id:m.id,title:m.title})),runtime:{css:fs.readFileSync(path.join(assets,'poverkadoma-site-visualize.css'),'utf8'),kit,icons:read('poverkadoma-site-icons.js'),dagre:read('poverkadoma-site-dagre.js'),floatingCore:read('poverkadoma-site-floating-core.js'),floatingDom:read('poverkadoma-site-floating-dom.js')}};
fs.writeFileSync(path.join(base,'poverkadoma-design-site-data.js'),'window.PD_SITE_DATA='+JSON.stringify(payload)+';\n','utf8');
for(const name of ['poverkadoma-design-site.js'])new vm.Script(read(name));
const manifest={buildDate:payload.buildDate,experiments:experiments.length,variants:experiments.reduce((n,e)=>n+e.count,0),analyses:documents.length,profiles:roles.length,processes:epc.models.length,files:['poverkadoma-design-site.html','poverkadoma-design-site.css','poverkadoma-design-site.js','poverkadoma-design-site-data.js'],bytes:Buffer.byteLength(JSON.stringify(payload)),verification:'Static package; no production services,credentials or raw Confluence exports included.'};
fs.writeFileSync(path.join(base,'poverkadoma-design-site-manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest));
