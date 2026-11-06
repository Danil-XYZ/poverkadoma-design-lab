(() => {
  'use strict';
  // Current design vectors; profile/help retain their artwork with only the outer ring removed.
  // Offline, warning and upload glyphs come from the original Figma frame 591:6361.
  // Sizes below describe the wrapper, not an enlargement of the vector artwork.
  const icons = {
    back: ['back', 24, 0, 0],
    clock: ['b65ac', 16, 1.7833, 1.7833],
    calendar: ['calendar', 16, .8, 0],
    phone: ['phone', 16, 0, 0],
    meter: ['meter', 16, 0, 2],
    person: ['person', 16, 0, 0],
    edit: ['edit', 20, 0, 0],
    chevron: ['b4c6b', 14, 4.7688, 2.4354],
    'arrow-white': ['10c0c', 18, 2.3813, 3.8813],
    arrow: ['f340c', 18, 2.3813, 3.8813],
    bids: ['f11c6', 22, 3.8271, 1.9938],
    'bids-muted': ['bids-muted', 22, 3.8271, 1.9938],
    acts: ['5f0fc', 22, 2.9104, 1.9938],
    'acts-active': ['acts-active', 22, 2.9104, 1.9938],
    'profile-nav': ['profile-nav', 22, 1.15, 1.15],
    'profile-nav-active': ['profile-nav-active', 22, 1.15, 1.15],
    equipment: ['bd2d2', 22, 1.9938, 3.7146],
    guide: ['6e3a1', 22, 1.9938, 2.5508],
    signal: ['4e616', 17, 2.9396, 2.2313],
    wifi: ['256b0', 17, 1.5229, 2.6085],
    battery: ['0ef23', 18, 1.6125, 4.6125],
    offline: ['offline', 24, 0, 3],
    warning: ['warning', 18, 0, 0],
    upload: ['upload', 18, 0, 0],
    call: ['call', 24, 0, 0],
    help: ['help-open', 24, 2.15, 2.15],
    bell: ['291e1', 24, 4.15, 2.15],
    profile: ['profile-open', 24, 2.15, 2.15],
    search: ['046ee', 24, 3.15, 3.15],
    funnel: ['067dc', 24, 3.15, 4.15],
    'search-white': ['3f90b', 24, 3.15, 3.15, true],
    'search-muted': ['9b5fb', 24, 3.15, 3.15, true],
    close: ['e33be', 24, 5.15, 5.15, true]
  };
  // Synthetic fixtures, anchored to the viewer's local day. No server data or live deadline timer.
  // In-work remains an externally toggled specimen from a linked act, not a new queue state.
  const verifierId = 'demo-verifier';
  const demoToday = new Date();
  demoToday.setHours(12, 0, 0, 0);
  function dayKey(offset = 0) {
    const date = new Date(demoToday);
    date.setDate(date.getDate() + offset);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
  const displayDate = value => value.split('-').reverse().join('.');
  const compactWork = value => (value || '').replace(/^Поверка (воды|газа) · (.+)$/u, '$2 $1');
  // Synthetic client names belong only to these prototype fixtures.
  const demoClientNames = {
    '000394': 'Анна Сергеевна Смирнова', '000398': 'Сергей Александрович Петров', '000393': 'Ирина Викторовна Орлова',
    '000397': 'Николай Петрович Соколов', '000400': 'Виктория Андреевна Кузнецова', '000401': 'Алексей Михайлович Волков',
    '000402': 'Ольга Николаевна Васильева', '000403': 'Дмитрий Сергеевич Новиков', '000404': 'Татьяна Владимировна Фёдорова',
    '000405': 'Михаил Алексеевич Попов', '000396': 'Галина Ивановна Козлова', '000406': 'Владимир Павлович Зайцев',
    '000395': 'Елена Александровна Морозова', '000407': 'Андрей Викторович Лебедев', '000408': 'Мария Дмитриевна Павлова',
    '000409': 'Валентина Петровна Семёнова', '000410': 'Павел Николаевич Егоров', '000411': 'Людмила Михайловна Белова',
    '000412': 'Игорь Владимирович Макаров', '000413': 'Наталья Игоревна Иванова',
    '000414': 'Юрий Александрович Титов'
  };
  const demoRequestNumbers = {'000394':'МСР-12341','000393':'МСР-12342','000400':'МСР-12343','000395':'МСР-12344','000407':'МСР-12345','000413':'МСР-12346','000414':'МСР-12347'};
  function fixture(item) {
    return { city: 'Тольятти', created: displayDate(dayKey(-1)), phoneLabel: 'Телефон', clientName: demoClientNames[item.id] || '', number:demoRequestNumbers[item.id], assignedTo: verifierId, ...item,
      ...(item.visitDate ? { visit: displayDate(item.visitDate) + (item.visitTime ? ', ' + item.visitTime : '') } : {}) };
  }
  const requests = [
    fixture({ id: '000394', created: displayDate(dayKey()), address: 'Комсомольская, 15, кв. 24', phone: '+7 (901) 123-45-67', work: 'Поверка воды · 2 счётчика', state: 'Назначена', kind: 'appointed', action: 'Согласовать', agreementDue: displayDate(dayKey()) + ', 09:56', agreementTime: '09:56', agreementMinutesLeft: 15, indicator: 'warning', syncState: 'error', syncLabel: 'Ошибка', syncDescription: 'Не удалось отправить изменения. Они сохранены на устройстве.' }),
    fixture({ id: '000398', created: displayDate(dayKey()), address: 'Молодёжный бульвар, 8, кв. 56', phone: '+7 (900) 000-00-02', work: 'Поверка воды · 1 счётчик', state: 'Назначена', kind: 'appointed', action: 'Согласовать', agreementDue: displayDate(dayKey()) + ', 10:21', agreementTime: '10:21', agreementMinutesLeft: 40 }),
    fixture({ id: '000393', address: 'Строителей, 18, кв. 24', phone: '+7 (900) 000-00-03', work: 'Поверка воды · 2 счётчика', visitDate: dayKey(), visitTime: '10:00 - 11:00', state: 'Согласована', kind: 'agreed', action: 'Создать акт' }),
    fixture({ id: '000397', address: 'Лесная, 7, кв. 12', work: 'Поверка воды · 1 счётчик', visitDate: dayKey(), visitTime: '11:30 - 12:30', state: 'В работе', kind: 'in-work', action: 'Продолжить акт', linkedActExample: true }),
    fixture({ id: '000400', address: 'Юбилейная, 31, кв. 8', phone: '+7 (900) 000-00-04', work: 'Поверка газа · 1 счётчик', visitDate: dayKey(), visitTime: '13:00 - 14:00', state: 'Согласована', kind: 'agreed', action: 'Создать акт', indicator: 'upload', syncState: 'queued', syncLabel: 'В очереди', syncDescription: 'Изменения сохранены на устройстве и ожидают отправки.' }),
    fixture({ id: '000401', address: 'Ленина, 42, кв. 91', phone: '+7 (900) 000-00-05', work: 'Поверка воды · 2 счётчика', visitDate: dayKey(), visitTime: '15:00 - 16:00', state: 'Согласована', kind: 'agreed', action: 'Создать акт' }),
    fixture({ id: '000402', address: 'Победы, 16, кв. 35', phone: '+7 (900) 000-00-06', work: 'Поверка воды · 1 счётчик', visitDate: dayKey(1), visitTime: '09:00 - 10:00', state: 'Согласована', kind: 'agreed', action: 'Создать акт' }),
    fixture({ id: '000403', address: 'Гагарина, 5, кв. 62', phone: '+7 (900) 000-00-07', work: 'Поверка воды · 3 счётчика', visitDate: dayKey(1), visitTime: '13:00 - 14:00', state: 'Согласована', kind: 'agreed', action: 'Создать акт' }),
    fixture({ id: '000404', address: 'Свердлова, 27, кв. 11', phone: '+7 (900) 000-00-08', work: 'Поверка газа · 1 счётчик', visitDate: dayKey(2), visitTime: '10:00 - 11:00', state: 'Согласована', kind: 'agreed', action: 'Создать акт' }),
    fixture({ id: '000405', address: 'Цветной бульвар, 9, кв. 47', phone: '+7 (900) 000-00-09', work: 'Поверка воды · 2 счётчика', visitDate: dayKey(3), visitTime: '11:00 - 12:00', state: 'Согласована', kind: 'agreed', action: 'Создать акт' }),
    fixture({ id: '000396', address: 'Комсомольская, 23, кв. 17', work: 'Поверка воды · 2 счётчика', canceled: displayDate(dayKey()) + ', 08:30', state: 'Отменена', kind: 'canceled', action: 'Вернуть в работу' }),
    fixture({ id: '000406', address: 'Дзержинского, 12, кв. 6', work: 'Поверка воды · 1 счётчик', canceled: displayDate(dayKey(-1)) + ', 17:00', state: 'Отменена', kind: 'canceled', action: 'Вернуть в работу' }),
    fixture({ id: '000395', created: displayDate(dayKey()), assignedTo: null, address: 'Спортивная, 4, кв. 28', phone: '+7 (901) 123-45-67', work: 'Поверка воды · 2 счётчика', requestedDate: dayKey(), requestedTime: '14:00 - 15:00', state: 'Новая', kind: 'new', action: 'Принять заявку', agreementDue: displayDate(dayKey()) + ', 10:21', agreementTime: '10:21', agreementMinutesLeft: 40 }),
    fixture({ id: '000407', created: displayDate(dayKey()), agreementDue: displayDate(dayKey()) + ', 09:51', agreementTime: '09:51', agreementMinutesLeft: 10, assignedTo: null, address: 'Автостроителей, 54, кв. 19', phone: '+7 (900) 000-00-11', work: 'Поверка воды · 1 счётчик', requestedDate: dayKey(), requestedTime: '16:00 - 17:00', state: 'Новая', kind: 'new', action: 'Принять заявку' }),
    fixture({ id: '000408', created: displayDate(dayKey()), agreementDue: displayDate(dayKey()) + ', 10:06', agreementTime: '10:06', agreementMinutesLeft: 25, assignedTo: null, address: 'Фрунзе, 19, кв. 73', phone: '+7 (900) 000-00-12', work: 'Поверка газа · 1 счётчик', requestedDate: dayKey(1), requestedTime: '10:00 - 11:00', state: 'Новая', kind: 'new', action: 'Принять заявку' }),
    fixture({ id: '000409', created: displayDate(dayKey()), agreementDue: displayDate(dayKey()) + ', 09:46', agreementTime: '09:46', agreementMinutesLeft: 5, assignedTo: null, address: 'Революционная, 38, кв. 40', phone: '+7 (900) 000-00-13', work: 'Поверка воды · 2 счётчика', requestedDate: dayKey(1), requestedTime: '15:00 - 16:00', state: 'Новая', kind: 'new', action: 'Принять заявку' }),
    fixture({ id: '000410', created: displayDate(dayKey()), agreementDue: displayDate(dayKey()) + ', 10:36', agreementTime: '10:36', agreementMinutesLeft: 55, assignedTo: null, address: 'Ворошилова, 10, кв. 52', phone: '+7 (900) 000-00-14', work: 'Поверка воды · 3 счётчика', requestedDate: dayKey(2), requestedTime: '09:00 - 10:00', state: 'Новая', kind: 'new', action: 'Принять заявку' }),
    fixture({ id: '000411', created: displayDate(dayKey()), agreementDue: displayDate(dayKey()) + ', 09:56', agreementTime: '09:56', agreementMinutesLeft: 15, assignedTo: null, address: '40 лет Победы, 3, кв. 15', phone: '+7 (900) 000-00-15', work: 'Поверка воды · 2 счётчика', requestedDate: dayKey(3), requestedTime: '14:00 - 15:00', state: 'Новая', kind: 'new', action: 'Принять заявку' }),
    fixture({ id: '000412', assignedTo: null, address: 'Баныкина, 14, кв. 9', work: 'Поверка воды · 1 счётчик', state: 'Новая', kind: 'new', action: 'Принять заявку' }),
    fixture({ id: '000413', created: displayDate(dayKey()), assignedTo: null, address: 'Карла Маркса, 22, кв. 16', phone: '+7 (900) 000-00-16', work: 'Поверка воды · 1 счётчик', requestedDate: dayKey(4), requestedTime: '11:00 - 12:00', state: 'Новая', kind: 'new', action: 'Принять заявку', agreementDue: displayDate(dayKey()) + ', 09:31', agreementTime: '09:31', agreementMinutesLeft: -10 }),
    fixture({ id: '000414', created: displayDate(dayKey()), address: 'Мира, 64, кв. 32', phone: '+7 (900) 000-00-17', work: 'Поверка воды · 2 счётчика', state: 'Назначена', kind: 'appointed', action: 'Согласовать', agreementDue: displayDate(dayKey()) + ', 09:06', agreementTime: '09:06', agreementMinutesLeft: -35 })
  ];
  const app = document.getElementById('app');
  const list = document.getElementById('requests');
  const toggle = document.getElementById('search-toggle');
  const field = document.getElementById('search-field');
  const input = document.getElementById('search-input');
  const close = document.getElementById('search-close');
  const empty = document.getElementById('empty-state');
  const resultStatus = document.getElementById('result-status');
  const filterToggle = document.getElementById('filter-toggle');
  const filterOverlay = document.getElementById('request-filters');
  const filterForm = document.getElementById('filter-form');
  const filterClose = document.getElementById('filter-close');
  const filterScope = document.getElementById('filter-scope');
  const filterPeriod = document.getElementById('filter-period');
  const filterRange = document.getElementById('filter-range');
  const filterFrom = document.getElementById('filter-from');
  const filterTo = document.getElementById('filter-to');
  const filterError = document.getElementById('filter-error');
  const filterSummary = document.getElementById('filter-summary');
  const controls = document.getElementById('prototype-controls');
  const networkButtons = controls.querySelectorAll('[data-network]');
  const cityScenarioButtons = controls.querySelectorAll('[data-city-scenario]');
  const cornerButtons = controls.querySelectorAll('[data-corners]');
  const bottomCornerButtons = controls.querySelectorAll('[data-bottom-corners]');
  const blueFillButtons = controls.querySelectorAll('[data-blue-fill]');
  const offlineIndicator = document.getElementById('offline-indicator');
  const connectionStatus = document.getElementById('connection-status');
  const cardData = document.getElementById('card-data');
  const cardText = document.getElementById('card-text');
  const shadowsToggle = document.getElementById('shadows-toggle');
  const bordersToggle = document.getElementById('borders-toggle');
  const linkedBidToggle = document.getElementById('linked-bid-toggle');
  const shadowDepth = document.getElementById('shadow-depth');
  const shadowDepthValue = document.getElementById('shadow-depth-value');
  const requestScreen = document.getElementById('request-screen');
  const requestScreenTitle = document.getElementById('request-screen-title');
  const requestScreenCreated = document.getElementById('request-screen-created');
  const requestBack = document.getElementById('request-back');
  const homeHeader = app.querySelector('.topbar');
  const homeList = app.querySelector('.requests-viewport');
  const homeTitle = homeHeader.querySelector('h1');
  const actsScreen = document.getElementById('acts-screen');
  const profileScreen = document.getElementById('profile-screen');
  const destinationScreen = document.getElementById('destination-screen');
  const destinationTitle = document.getElementById('destination-title');
  const destinationBack = document.getElementById('destination-back');
  const navigationStatus = document.getElementById('navigation-status');
  const navButtons = app.querySelectorAll('[data-nav]');
  const bottomBar = app.querySelector('.bottom-bar');
  const sectionLabels = { requests: 'Заявки', acts: 'Акты', profile: 'Профиль' };
  const navArtwork = { requests: ['bids-muted', 'bids'], acts: ['acts', 'acts-active'], profile: ['profile-nav', 'profile-nav-active'] };
  const destinationLabels = {
    'new-act': 'Новый акт', upload: 'Выгрузить все акты', history: 'История', statistics: 'Статистика',
    equipment: 'Приборы', tags: 'Идентификационные бирки', storage: 'Условия хранения',
    nepton: 'Подключение к НЕПТОН', guide: 'Справочник — реестр СИ', arshin: 'Поиск в АРШИН',
    documents: 'Документы', account: 'Личный кабинет', settings: 'Настройки', messages: 'Сообщения', feedback: 'Обратная связь'
  };
  let activeSection = 'requests';
  let selectedDestination = '';
  let selectedRequestId = '';
  let listScope = 'mine';
  let dateFilter = 'all';
  let dateFrom = '';
  let dateTo = '';
  let requestFilters = {statuses:[], city:'', service:'', sync:''};
  // Demo fallback from Android DefaultBidType (id=1). Other services require the partner's server catalog.
  const requestServices = ['Поверка ИПУ'];
  const statusLabels = {new:'Новая',appointed:'Назначена',agreed:'Согласована','in-work':'В работе',completed:'Выполнена',canceled:'Отменена'};
  const filterCity = document.getElementById('filter-city');
  const filterService = document.getElementById('filter-service');
  const filterSync = document.getElementById('filter-sync');
  const filterResult = document.getElementById('filter-result');
  const filterApply = document.getElementById('filter-apply');
  const statusOptions = document.getElementById('filter-status-options');
  const periodOptions = document.getElementById('filter-period-options');
  function cleanRequestFilters(value = {}) {
    return {statuses:[...new Set(Array.isArray(value?.statuses) ? value.statuses.filter(key => Object.hasOwn(statusLabels,key)) : [])],city:typeof value?.city === 'string' ? value.city.slice(0,200) : '',service:requestServices.includes(value?.service) ? value.service : '',sync:['error','queued'].includes(value?.sync) ? value.sync : ''};
  }
  function draftRequestFilters() {
    return {statuses:[...statusOptions.querySelectorAll('[aria-pressed="true"]')].map(n=>n.dataset.status),city:filterCity.value,service:filterService.value,sync:filterSync.value};
  }
  function refreshFilterDraft() {
    filterRange.hidden = filterPeriod.value !== 'range';
    periodOptions.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.period===filterPeriod.value)));
    const count = selectRequests(getRequestItems(),filterScope.value,filterPeriod.value,filterFrom.value,filterTo.value,draftRequestFilters()).length;
    filterApply.textContent = 'Показать · ' + count;
    filterResult.textContent = count ? 'Найдено заявок: ' + count + (input.value.trim() ? ' · с учётом поиска' : '') : 'Нет совпадений. Измените условия' + (input.value.trim() ? ' или поисковый запрос.' : '.');
  }
  for (const [value,label] of Object.entries(statusLabels)) {
    const button=document.createElement('button');button.type='button';button.className='filter-option';button.textContent=label;button.dataset.status=value;button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));refreshFilterDraft();});statusOptions.append(button);
  }
  for (const option of filterPeriod.querySelectorAll('option')) {
    const button=document.createElement('button');button.type='button';button.className='filter-option';button.textContent=option.textContent;button.dataset.period=option.value;
    button.addEventListener('click',()=>{filterPeriod.value=option.value;filterError.hidden=true;refreshFilterDraft();});periodOptions.append(button);
  }
  filterForm.addEventListener('change',refreshFilterDraft);
  document.getElementById('filter-reset').addEventListener('click',()=>{
    if(filterScope.value==='all')filterScope.value='mine';
    filterPeriod.value='all';filterFrom.value='';filterTo.value='';filterCity.value='';filterService.value='';filterSync.value='';
    statusOptions.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed','false'));
    for(const control of [filterScope,filterCity,filterService,filterSync,filterFrom,filterTo])control.dispatchEvent(new window.Event('change',{bubbles:true}));
    filterError.hidden=true;refreshFilterDraft();
  });
  let renderedRequestModels = new Map();
  const requestDetail = createRequestDetail({app, screen:requestScreen, icon, services:requestServices, onClose:()=>showRequests(), onChange:()=>renderRequests()});
  const requestSample = document.getElementById('request-sample');
  const requestSampleOpen = document.getElementById('request-sample-open');
  requestSampleOpen.addEventListener('click',()=>openRequest(requestSample.value));
  requestSample.addEventListener('change',()=>openRequest(requestSample.value));
  app.dataset.screen = 'requests';

  function normalizeDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
    const date = new Date(value + 'T12:00:00');
    if (!Number.isFinite(date.getTime())) return '';
    const normalized = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    return normalized === value ? value : '';
  }
  function setListFilters(scope = 'mine', period = 'all', from = '', to = '', extra = requestFilters) {
    requestFilters = cleanRequestFilters(extra);
    listScope = ['mine', 'available', 'all'].includes(scope) ? scope : 'mine';
    dateFilter = ['all', 'today', 'tomorrow', 'range', 'undated'].includes(period) ? period : 'all';
    dateFrom = normalizeDay(from);
    dateTo = normalizeDay(to);
    if (dateFilter === 'range' && (!dateFrom && !dateTo || dateFrom && dateTo && dateFrom > dateTo)) {
      dateFilter = 'all'; dateFrom = ''; dateTo = '';
    }
    app.dataset.listScope = listScope;
    app.dataset.dateFilter = dateFilter;
    app.querySelectorAll('[data-scope]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scope === listScope)));
    const active = listScope === 'all' || dateFilter !== 'all' || requestFilters.statuses.length > 0 || Boolean(requestFilters.city || requestFilters.service || requestFilters.sync);
    filterToggle.dataset.active = String(active);
    filterToggle.querySelector('.filter-dot').hidden = !active;
    filterToggle.setAttribute('aria-label', active ? 'Фильтр, есть применённые условия' : 'Фильтр');
    filterSummary.replaceChildren();
    function chip(label, remove) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'filter-chip';
      button.textContent = label + ' ×';
      button.setAttribute('aria-label', 'Убрать фильтр: ' + label);
      button.addEventListener('click', remove);
      filterSummary.append(button);
    }
    if (listScope === 'all') chip('Все заявки', () => setListFilters('mine', dateFilter, dateFrom, dateTo));
    if (dateFilter !== 'all') {
      const label = dateFilter === 'today' ? 'Сегодня' : dateFilter === 'tomorrow' ? 'Завтра' : dateFilter === 'undated' ? 'Без даты'
        : (dateFrom ? 'С ' + displayDate(dateFrom) : '') + (dateTo ? ' по ' + displayDate(dateTo) : '');
      chip(label.trim(), () => setListFilters(listScope));
    }
    for (const status of requestFilters.statuses) chip(statusLabels[status],()=>setListFilters(listScope,dateFilter,dateFrom,dateTo,{...requestFilters,statuses:requestFilters.statuses.filter(v=>v!==status)}));
    if(requestFilters.city) chip(requestFilters.city,()=>setListFilters(listScope,dateFilter,dateFrom,dateTo,{...requestFilters,city:''}));
    if(requestFilters.service) chip(requestFilters.service,()=>setListFilters(listScope,dateFilter,dateFrom,dateTo,{...requestFilters,service:''}));
    if(requestFilters.sync) chip({error:'Ошибка отправки',queued:'Отправляются'}[requestFilters.sync],()=>setListFilters(listScope,dateFilter,dateFrom,dateTo,{...requestFilters,sync:''}));
    if(filterSummary.children.length) chip('Сбросить всё',()=>setListFilters(listScope==='all'?'mine':listScope,'all','','',{}));
    filterSummary.hidden = !filterSummary.children.length;
    renderRequests();
  }
  function setFiltersOpen(open, focus = true) {
    filterOverlay.hidden = !open;
    filterToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      filterScope.value = listScope; filterPeriod.value = dateFilter;
      filterFrom.value = dateFrom; filterTo.value = dateTo;
      filterCity.replaceChildren();
      for(const city of ['',...new Set([...getRequestItems().map(item=>item.city),requestFilters.city].filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'))) {const option=document.createElement('option');option.value=city;option.textContent=city||'Все населённые пункты';filterCity.append(option);}
      filterService.replaceChildren();
      for(const service of ['',...requestServices]) {const option=document.createElement('option');option.value=service;option.textContent=service||'Все услуги';filterService.append(option);}
      filterCity.value=requestFilters.city;filterService.value=requestFilters.service;filterSync.value=requestFilters.sync;
      statusOptions.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(requestFilters.statuses.includes(n.dataset.status))));
      filterRange.hidden = dateFilter !== 'range'; filterError.hidden = true;
      refreshFilterDraft();
      if (focus) filterClose.focus?.({preventScroll:true});
    } else if (focus) filterToggle.focus?.({preventScroll:true});
  }
  filterToggle.addEventListener('click', () => setFiltersOpen(true));
  filterClose.addEventListener('click', () => setFiltersOpen(false));
  filterOverlay.addEventListener('click', event => { if (event.target === filterOverlay) setFiltersOpen(false); });
  filterPeriod.addEventListener('change', () => { filterRange.hidden = filterPeriod.value !== 'range'; filterError.hidden = true; });
  function applyRequestFilters(event) {
    event.preventDefault();
    if (filterPeriod.value === 'range' && !filterFrom.value && !filterTo.value) {
      filterError.textContent = 'Укажите хотя бы одну дату.';
      filterError.hidden = false; filterFrom.focus?.(); return;
    }
    if (filterPeriod.value === 'range' && filterFrom.value && filterTo.value && filterFrom.value > filterTo.value) {
      filterError.textContent = 'Дата «С» должна быть не позже даты «По».';
      filterError.hidden = false; filterFrom.focus?.(); return;
    }
    setListFilters(filterScope.value, filterPeriod.value, filterFrom.value, filterTo.value, draftRequestFilters());
    homeList.scrollTop = 0;
    setFiltersOpen(false);
  }
  filterApply.addEventListener('click', applyRequestFilters);
  filterForm.addEventListener('submit', applyRequestFilters);
  filterOverlay.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); setFiltersOpen(false); }
    if (event.key === 'Tab') {
      const elements = [...filterForm.querySelectorAll('button, input, select')].filter(item => !item.disabled && !item.closest('[hidden]'));
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus?.(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus?.(); }
    }
  });

  function openRequest(id, focus = true) {
    const item = renderedRequestModels.get(id) || requestDetail.getSample(id) || requests.find(item=>item.id===id);
    if (!item) return;
    showSection('requests');
    selectedRequestId = id;
    requestDetail.show(item);
    if (item.sample) requestSample.value = id;
    homeHeader.hidden = true;
    homeList.hidden = true;
    requestScreen.hidden = false;
    app.dataset.screen = 'request';
    bottomBar.hidden = true;
    if (focus) requestBack.focus?.({ preventScroll: true });
  }
  function showRequests(focus = true) {
    const previousId = selectedRequestId;
    showSection('requests');
    if (focus) [...list.querySelectorAll('.request')].find(item => item.dataset.requestId === previousId)?.querySelector('.request-entry')?.focus?.({ preventScroll: true });
  }
  requestBack.addEventListener('click', () => showRequests());
  function showSection(section = 'requests', announce = false) {
    requestDetail.closeDialog();
    activeSection = ['requests', 'acts', 'profile'].includes(section) ? section : 'requests';
    selectedRequestId = '';
    selectedDestination = '';
    app.dataset.section = activeSection;
    app.dataset.screen = activeSection;
    bottomBar.hidden = false;
    app.dataset.destination = '';
    requestScreen.hidden = true;
    destinationScreen.hidden = true;
    homeHeader.hidden = false;
    homeList.hidden = activeSection !== 'requests';
    actsScreen.hidden = activeSection !== 'acts';
    profileScreen.hidden = activeSection !== 'profile';
    homeTitle.textContent = sectionLabels[activeSection];
    navButtons.forEach(button => {
      const current = button.dataset.nav === activeSection;
      if (current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
      button.querySelector('.nav-mark').replaceChildren(icon(navArtwork[button.dataset.nav][current ? 1 : 0]));
    });
    if (announce) navigationStatus.textContent = 'Раздел «' + sectionLabels[activeSection] + '»';
  }
  function openDestination(key, announce = false) {
    if (typeof destinationLabels[key] !== 'string' || !['acts', 'profile'].includes(activeSection)) return;
    const sourceScreen = activeSection === 'acts' ? actsScreen : profileScreen;
    if (![...sourceScreen.querySelectorAll('[data-destination]')].some(button => button.dataset.destination === key)) return;
    selectedDestination = key;
    app.dataset.screen = 'destination';
    bottomBar.hidden = true;
    app.dataset.destination = key;
    homeList.hidden = true;
    actsScreen.hidden = true;
    profileScreen.hidden = true;
    requestScreen.hidden = true;
    destinationScreen.hidden = false;
    destinationTitle.textContent = destinationLabels[key];
    destinationBack.textContent = activeSection === 'profile' ? 'Назад к профилю' : 'Назад к актам';
    if (announce) {
      navigationStatus.textContent = destinationLabels[key];
      destinationBack.focus?.({preventScroll:true});
    }
  }
  navButtons.forEach(button => button.addEventListener('click', () => showSection(button.dataset.nav, true)));
  app.querySelectorAll('[data-destination]').forEach(button => button.addEventListener('click', () => openDestination(button.dataset.destination, true)));
  destinationBack.addEventListener('click', () => {
    const previous = selectedDestination;
    showSection(activeSection, true);
    const sourceScreen = activeSection === 'acts' ? actsScreen : profileScreen;
    [...sourceScreen.querySelectorAll('[data-destination]')].find(button => button.dataset.destination === previous)?.focus?.({preventScroll:true});
  });

  function setCardChecks(data = 'normal', text = 'normal') {
    cardData.value = data === 'long' ? 'long' : 'normal';
    cardText.value = text === 'large' ? 'large' : 'normal';
    app.dataset.cardData = cardData.value;
    app.dataset.cardText = cardText.value;
    renderRequests();
  }
  cardData.addEventListener('change', () => setCardChecks(cardData.value, cardText.value));
  cardText.addEventListener('change', () => setCardChecks(cardData.value, cardText.value));
  app.dataset.cardData = 'normal';
  app.dataset.cardText = 'normal';

  function setCityScenario(value = 'single') {
    const scenario = value === 'mixed' ? 'mixed' : 'single';
    app.dataset.cityScenario = scenario;
    cityScenarioButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cityScenario === scenario)));
    renderRequests();
  }
  cityScenarioButtons.forEach(button => button.addEventListener('click', () => setCityScenario(button.dataset.cityScenario)));
  app.dataset.cityScenario = 'single';

  function setLinkedBidExample(show = true) {
    linkedBidToggle.checked = show !== false;
    app.dataset.linkedBidExample = String(linkedBidToggle.checked);
    renderRequests();
    if (selectedRequestId && !requestDetail.getSample(selectedRequestId) && ![...list.querySelectorAll('.request')].some(card => card.dataset.requestId === selectedRequestId)) {
      showRequests(false);
    }
  }
  linkedBidToggle.addEventListener('change', () => setLinkedBidExample(linkedBidToggle.checked));
  linkedBidToggle.checked = true;
  app.dataset.linkedBidExample = 'true';

  function setNetwork(online, announce = false) {
    app.dataset.offline = String(!online);
    offlineIndicator.hidden = online;
    app.querySelectorAll('.detail-offline').forEach(indicator=>{indicator.hidden=online;});
    networkButtons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.network === 'online') === online)));
    if (announce) connectionStatus.textContent = online ? 'Есть интернет' : 'Нет интернета';
  }
  networkButtons.forEach(button => button.addEventListener('click', () => setNetwork(button.dataset.network === 'online', true)));
  setNetwork(true);

  function setCorners(rounded) {
    app.dataset.topbarCorners = rounded ? 'rounded' : 'square';
    cornerButtons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.corners === 'rounded') === rounded)));
  }
  cornerButtons.forEach(button => button.addEventListener('click', () => setCorners(button.dataset.corners === 'rounded')));
  setCorners(true);

  function setBottomCorners(rounded) {
    app.dataset.bottomBarCorners = rounded ? 'rounded' : 'square';
    bottomCornerButtons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.bottomCorners === 'rounded') === rounded)));
  }
  bottomCornerButtons.forEach(button => button.addEventListener('click', () => setBottomCorners(button.dataset.bottomCorners === 'rounded')));
  setBottomCorners(true);

  function setBlueFill(value = 'gradient') {
    const mode = value === 'solid' ? 'solid' : 'gradient';
    app.dataset.blueFill = mode;
    blueFillButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.blueFill === mode)));
  }
  blueFillButtons.forEach(button => button.addEventListener('click', () => setBlueFill(button.dataset.blueFill)));
  setBlueFill();

  function setSurfaceAppearance(shadows = true, borders = true, depth = 50) {
    const parsed = Number(depth);
    const level = Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : 50;
    shadowsToggle.checked = shadows !== false;
    bordersToggle.checked = borders !== false;
    shadowDepth.value = String(level);
    shadowDepth.disabled = !shadowsToggle.checked;
    shadowDepth.setAttribute('aria-valuetext', level + ' процентов');
    shadowDepthValue.textContent = level + '%';
    app.dataset.shadows = String(shadowsToggle.checked);
    app.dataset.borders = String(bordersToggle.checked);
    app.dataset.shadowDepth = String(level);
    app.style.setProperty('--decorative-line', bordersToggle.checked ? 'var(--line)' : 'transparent');
    const scale = shadowsToggle.checked ? level / 50 : 0;
    const round = value => Math.round(value * 1000) / 1000;
    const shadow = (offset, blur, opacity) => `0 ${round(offset * scale)}px ${round(blur * scale)}px rgba(24, 24, 24, ${round(opacity * scale)})`;
    app.style.setProperty('--shadow-topbar', shadow(6, 18, .18));
    app.style.setProperty('--shadow-card', shadow(4, 14, .14) + ', ' + shadow(1, 3, .06));
    app.style.setProperty('--shadow-controls', shadow(3, 10, .12));
    app.style.setProperty('--shadow-raised-control', shadow(4, 10, .20) + ', ' + shadow(1, 3, .10));
    app.style.setProperty('--shadow-bottom', shadow(-6, 18, .15));
  }
  shadowsToggle.addEventListener('change', () => setSurfaceAppearance(shadowsToggle.checked, bordersToggle.checked, shadowDepth.value));
  bordersToggle.addEventListener('change', () => setSurfaceAppearance(shadowsToggle.checked, bordersToggle.checked, shadowDepth.value));
  shadowDepth.addEventListener('input', () => setSurfaceAppearance(shadowsToggle.checked, bordersToggle.checked, shadowDepth.value));
  setSurfaceAppearance();

  function icon(kind) {
    const [file, size, x, y, expanded] = icons[kind];
    const slot = document.createElement('span');
    slot.className = 'icon';
    slot.dataset.iconKind = kind;
    slot.setAttribute('aria-hidden', 'true');
    slot.style.width = size + 'px';
    slot.style.height = size + 'px';
    const img = document.createElement('img');
    img.src = `poverkadoma-home-${expanded ? 'expanded' : 'asset'}-${file}.svg`;
    img.alt = '';
    img.draggable = false;
    img.style.left = x + 'px';
    img.style.top = y + 'px';
    slot.append(img);
    return slot;
  }
  app.querySelectorAll('[data-icon]').forEach(slot => slot.replaceWith(icon(slot.dataset.icon)));

  function getRequestItems() {
    // Explicit demo geography, not a guess based on the currently visible/search results.
    const geographyRequests = app.dataset.cityScenario === 'mixed'
      ? requests.map((item, index) => ({ ...item, city: ['Тольятти', 'Самара', 'Жигулёвск'][index % 3] })) : requests;
    const savedDrafts=requestDetail.getDrafts();
    const workingRequests=geographyRequests.map(item=>{
      const saved=savedDrafts[item.id];if(!saved)return item;
      const next={...item,...saved};
      next.baseQuantity=item.quantity||item.work?.match(/(\d+) счётчик/)?.[1]||'';
      next.baseService=item.service||requestServices[0];
      if(saved.visitDate)next.visitDate=/^\d{2}\.\d{2}\.\d{4}$/.test(saved.visitDate)?saved.visitDate.split('.').reverse().join('-'):saved.visitDate;
      if(saved.kind)next.action={new:'Принять заявку',appointed:'Согласовать',agreed:'Создать акт','in-work':'Продолжить акт',completed:'Результат',canceled:'Посмотреть'}[saved.kind];
      if(saved.quantity)next.work=(item.work||'').replace(/\d+ счётчик[а-я]*/u,saved.quantity+' '+(saved.quantity==='1'?'счётчик':Number(saved.quantity)<5?'счётчика':'счётчиков'));
      return next;
    });
    const data = app.dataset.cardData === 'long' ? workingRequests.map((item, index) => ({
      ...item,
      id: `2026-${item.id}-000128`,
      ...(item.number ? {number:item.number+'-000128'} : {}),
      clientName: item.clientName ? 'Александра Константиновна Константинопольская' : '',
      city: app.dataset.cityScenario === 'mixed'
        ? ['Санкт-Петербург', 'Всеволожск', 'Гатчина'][requests.findIndex(request => request.id === item.id) % 3] : 'Санкт-Петербург',
      address: 'проспект Большой Сампсониевский, дом 126, корпус 2, квартира 108',
      ...(item.phone ? { phone: '+7 (901) 123-45-67, доб. 128', phoneDial: '+79011234567;ext=128' } : {}),
      ...(index === 1 ? { syncDescription: 'Изменения заявки сохранены на устройстве. Сервер не подтвердил получение. Проверьте подключение и уточните состояние заявки перед повторной отправкой.' } : {})
    })) : workingRequests;
    return data;
  }
  function selectRequests(items, scope=listScope, period=dateFilter, from=dateFrom, to=dateTo, extra=requestFilters) {
    const query = input.value.toLocaleLowerCase('ru').trim();
    const data = items.filter(item => {
      if (item.linkedActExample && !linkedBidToggle.checked) return false;
      if (scope === 'mine' && item.assignedTo !== verifierId) return false;
      if (scope === 'available' && (item.assignedTo != null || item.kind !== 'new')) return false;
      if (extra.statuses.length && !extra.statuses.includes(item.kind)) return false;
      if (extra.city && item.city !== extra.city) return false;
      const service = item.service || requestServices[0];
      if (extra.service && service !== extra.service) return false;
      if (extra.sync && item.syncState !== extra.sync) return false;
      const rawDate = item.visitDate || item.requestedDate || '';
      const date = /^\d{2}\.\d{2}\.\d{4}$/.test(rawDate) ? rawDate.split('.').reverse().join('-') : rawDate;
      if (period === 'today') return date === dayKey();
      if (period === 'tomorrow') return date === dayKey(1);
      if (period === 'undated') return !date;
      if (period === 'range') return Boolean(date) && (!from || date >= from) && (!to || date <= to);
      return true;
    });
    const normalized = value => value.toLocaleLowerCase('ru').replace(/[^\p{L}\p{N}]/gu, '');
    const normalizedQuery = normalized(query);
    return data.filter(item => `${item.address} ${item.city} ${item.clientName || ''} ${item.phone || ''} ${item.work || ''} ${compactWork(item.work)} ${item.number || ''} ${item.id}`.toLocaleLowerCase('ru').includes(query)
      || (query.includes(' ') && query.split(/\s+/).every(part => (item.clientName || '').toLocaleLowerCase('ru').includes(part)))
      || (normalizedQuery.length > 0 && normalized(`${item.phone || ''} ${item.number || ''} ${item.id}`).includes(normalizedQuery)));
  }
  function renderRequests() {
    renderedRequestModels = new Map();
    const query = input.value.toLocaleLowerCase('ru').trim();
    const matching = selectRequests(getRequestItems());
    const groups = new Map();
    matching.forEach(item => {
      const key = listScope === 'available' ? 'available'
        : item.kind === 'canceled' ? 'canceled'
        : ['new', 'appointed'].includes(item.kind) ? 'agreement'
        : item.visitDate || 'undated';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    const rank = key => key === 'canceled' ? 3 : key === 'agreement' ? 0 : key === 'undated' ? 2 : 1;
    const dayTitle = key => {
      if (key === 'agreement') return 'Нужно согласовать';
      if (key === 'canceled') return 'Отменённые';
      if (key === 'undated') return 'Без даты визита';
      const date = new Date(key + 'T12:00:00');
      const label = date.toLocaleDateString('ru-RU', {day:'numeric', month:'long', ...(date.getFullYear() !== demoToday.getFullYear() ? {year:'numeric'} : {})});
      const relative = key === dayKey() ? 'Сегодня, ' : key === dayKey(1) ? 'Завтра, ' : '';
      return relative + label;
    };
    const byAgreementDeadline = (a, b) => {
      const left = Number.isFinite(a.agreementMinutesLeft) ? a.agreementMinutesLeft : Infinity;
      const right = Number.isFinite(b.agreementMinutesLeft) ? b.agreementMinutesLeft : Infinity;
      return (left < right ? -1 : left > right ? 1 : 0) || a.id.localeCompare(b.id);
    };
    list.replaceChildren(...[...groups].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b)).map(([key, items]) => {
      const section = document.createElement('section');
      section.className = key === 'available' ? 'request-flat-group' : 'request-day-group'; section.dataset.day = key;
      const header = document.createElement('div'); header.className = 'request-day-heading';
      const title = document.createElement('h2'); title.id = 'request-day-' + key;
      if (key !== 'available') {
        title.textContent = dayTitle(key);
        section.setAttribute('aria-labelledby', title.id);
      } else section.setAttribute('aria-label', 'Свободные заявки по сроку согласования');
      const count = document.createElement('span'); count.className = 'request-day-count';
      const n = items.length;
      count.textContent = n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'заявка' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'заявки' : 'заявок');
      header.append(title, count);
      const cards = document.createElement('div'); cards.className = 'request-day-cards';
      cards.append(...items.sort(key === 'available' || key === 'agreement' ? byAgreementDeadline
        : (a, b) => (a.visitTime || '').localeCompare(b.visitTime || '')).map(item => {
      const card = document.createElement('article');
      const displayNumber = item.number || item.id;
      renderedRequestModels.set(item.id, {...item, ...(item.linkedActExample&&!Object.prototype.hasOwnProperty.call(item,'linkedAct') ? {linkedAct:'23-2020-00001'} : {})});
      card.className = 'request';
      card.dataset.requestId = item.id;
      card.dataset.assignedTo = item.assignedTo || '';
      card.dataset.linkedActExample = String(Boolean(item.linkedActExample));
      card.dataset.created = item.created;
      card.setAttribute('aria-label', `Заявка ${displayNumber}`);
      card.dataset.state = item.kind;
      const head = document.createElement('div');
      head.className = 'request-head';
      const top = document.createElement('div');
      top.className = 'request-heading';
      const number = document.createElement('div');
      number.className = 'request-number';
      const numberLabel = document.createElement('span');
      numberLabel.className = 'request-id';
      numberLabel.textContent = displayNumber;
      number.append(numberLabel);
      let sync;
      if (item.indicator && item.syncState) {
        sync = document.createElement('span');
        sync.className = 'request-sync ' + item.syncState;
        sync.append(icon(item.indicator), document.createTextNode(item.syncLabel));
        sync.setAttribute('role', 'status');
        sync.setAttribute('aria-label', item.syncDescription || item.syncLabel);
        top.classList.add('has-sync');
      }
      const state = document.createElement('div');
      state.className = 'request-state' + (item.state === 'Согласована' ? ' agreed' : '');
      const dot = document.createElement('span');
      dot.className = 'status-dot';
      dot.setAttribute('aria-hidden', 'true');
      state.append(dot, document.createTextNode(item.state));
      top.append(number, ...(sync ? [sync] : []), state, icon('chevron'));
      head.append(top);
      const details = document.createElement('div');
      details.className = 'request-facts';
      const address = document.createElement('p');
      address.className = 'request-address';
      address.setAttribute('aria-label', 'Адрес: ' + item.city + ', ' + item.address);
      const city = document.createElement('p');
      city.className = 'request-city';
      city.textContent = item.city || 'Населённый пункт не указан';
      city.setAttribute('aria-label', 'Населённый пункт: ' + city.textContent);
      address.append(document.createTextNode(item.address));
      details.append(city, address);
      if (item.work) {
        const work = document.createElement('p');
        work.className = 'request-work';
        const description = document.createElement('span');
        description.textContent = compactWork(item.work);
        work.append(icon('meter'), description);
        details.append(work);
      }
      if (item.kind !== 'new' && item.clientName) {
        const client = document.createElement('p');
        client.className = 'request-client';
        client.setAttribute('aria-label', 'Клиент: ' + item.clientName);
        const clientLabel = document.createElement('span');
        clientLabel.className = 'visually-hidden';
        clientLabel.textContent = 'Клиент: ';
        const name = document.createElement('span');
        name.textContent = item.clientName;
        client.append(clientLabel, icon('person'), name);
        details.append(client);
      }
      if (item.kind !== 'new' && item.phone) {
        const phone = document.createElement('p');
        phone.className = 'request-phone';
        phone.setAttribute('aria-label', item.phoneLabel + ': ' + item.phone);
        const phoneLabel = document.createElement('span');
        phoneLabel.className = 'visually-hidden';
        phoneLabel.textContent = item.phoneLabel + ': ';
        const number = document.createElement('span');
        number.textContent = item.phone;
        phone.append(phoneLabel, icon('phone'), number);
        details.append(phone);
      }
      if (item.visit || item.canceled || item.requestedDate) {
        const date = document.createElement('p');
        date.className = 'request-date';
        const canceledParts = item.canceled ? item.canceled.split(', ') : [];
        const visitParts = item.visit ? item.visit.split(', ') : [];
        const dateValue = item.canceled ? canceledParts[0]
          : item.visit ? visitParts[0] : displayDate(item.requestedDate);
        const timeValue = (item.canceled ? canceledParts[1] : item.visit ? item.visitTime || visitParts[1] : item.requestedTime) || '';
        const shownTime = timeValue.replace(' - ', '–');
        const context = item.canceled ? 'Отмена' : item.visit ? 'Визит' : 'Желаемый визит';
        date.setAttribute('aria-label', context + ': ' + dateValue + (shownTime ? ', ' + shownTime : ''));
        const accessibleContext = document.createElement('span');
        accessibleContext.className = 'visually-hidden';
        accessibleContext.textContent = context + ': ';
        date.append(accessibleContext);
        if (item.canceled) {
          const contextLabel = document.createElement('span');
          contextLabel.className = 'request-date-label';
          contextLabel.setAttribute('aria-hidden', 'true');
          contextLabel.textContent = 'Отмена';
          date.append(contextLabel, document.createTextNode(' '));
        }
        const calendar = document.createElement('span');
        calendar.className = 'request-date-part';
        const dateText = document.createElement('time');
        dateText.dateTime = dateValue.split('.').reverse().join('-');
        dateText.textContent = dateValue;
        calendar.append(icon('calendar'), dateText);
        date.append(calendar);
        if (shownTime) {
          const time = document.createElement('span');
          time.className = 'request-date-part';
          time.append(icon('clock'), document.createTextNode(shownTime));
          date.append(document.createTextNode(' '), time);
        }
        details.append(date);
      }
      const actions = document.createElement('div');
      actions.className = 'request-actions';
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'request-action primary';
      action.setAttribute('aria-label', `${item.action}, заявка ${displayNumber}`);
      const label = document.createElement('span');
      label.className = 'action-label';
      label.textContent = item.action;
      action.append(label);
      if (['new', 'appointed'].includes(item.kind) && Number.isFinite(item.agreementMinutesLeft)) {
        const minutes = item.agreementMinutesLeft;
        const urgency = minutes < 0 ? 'overdue' : minutes <= 5 ? 'critical' : minutes <= 15 ? 'warning' : 'calm';
        action.classList.add('agreement-action');
        action.dataset.urgency = urgency;
        const remaining = document.createElement('span');
        remaining.className = 'action-deadline';
        remaining.textContent = `${minutes < 0 ? '−' + Math.abs(minutes) : minutes} мин`;
        const description = minutes < 0 ? `Согласование просрочено на ${Math.abs(minutes)} мин`
          : minutes === 0 ? 'Срок согласования истёк' : `На согласование осталось ${minutes} мин`;
        const deadlineDescription = description + (item.agreementDue ? `. Срок согласования: ${item.agreementDue}` : '');
        remaining.setAttribute('aria-hidden', 'true');
        action.setAttribute('aria-label', `${item.action}, заявка ${displayNumber}. ${deadlineDescription}`);
        action.append(remaining);
      }
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'request-entry';
      open.setAttribute('aria-label', `Открыть заявку ${displayNumber}: ${item.city}, ${item.address}`);
      open.addEventListener('click', () => openRequest(item.id));
      actions.append(action);
      if (item.kind !== 'new' && item.phone) {
        const dial = item.phoneDial || item.phone.replace(/[^+\d]/g, '');
        if (/^\+?\d{7,15}(?:;ext=\d{1,6})?$/.test(dial)) {
          const call = document.createElement('a');
          call.className = 'request-action request-call';
          call.href = 'tel:' + dial;
          call.setAttribute('aria-label', `Позвонить по номеру ${item.phone}, заявка ${displayNumber}`);
          call.append(icon('call'));
          actions.append(call);
        }
      }
      card.append(open, head, details);
      card.append(actions);
      return card;
      }));
      if (key !== 'available') section.append(header);
      section.append(cards);
      return section;
    }));
    empty.hidden = matching.length !== 0;
    empty.textContent = query ? 'Заявки не найдены' : listScope === 'available' ? 'Свободных заявок по этим условиям нет' : 'Заявок по этим условиям нет';
    resultStatus.textContent = `Найдено заявок: ${matching.length}`;
    app.verifierTimerDemo?.refresh?.();
  }

  function setSearch(open, focus = true) {
    field.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.replaceChildren(icon(open ? 'search-white' : 'search'));
    if (open && focus) input.focus({ preventScroll: true });
    if (!open) {
      input.value = '';
      renderRequests();
      if (focus) toggle.focus({ preventScroll: true });
    }
  }
  toggle.addEventListener('click', () => setSearch(field.hidden));
  close.addEventListener('click', () => setSearch(false));
  input.addEventListener('input', renderRequests);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') setSearch(false);
  });
  app.querySelectorAll('[data-scope]').forEach(button => button.addEventListener('click', () => {
    setListFilters(button.dataset.scope, dateFilter, dateFrom, dateTo);
    homeList.scrollTop = 0;
  }));
  showSection();
  setListFilters();
  renderRequests();
})();
