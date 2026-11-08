(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const storageKey = 'tishe-bedroom-project-v1';
  const palettes = window.bedroomPalettes;
  const layouts = {
    calm: { letter: 'A', name: 'Тихий отель', description: 'Кровать по центру короткой стены. Шкаф-купе 100 × 55 см в нижней нише. Ковёр сдвинут к изголовью; у изножья остаётся деревянный пол.' },
    work: { letter: 'B', name: 'Место для себя', description: 'Та же спокойная основа плюс небольшой стол 73 × 50 см у второго окна. Высоту подоконника нужно проверить до покупки.' },
    read: { letter: 'C', name: 'Медленное утро', description: 'Кресло у второго окна и отдельный торшер для чтения. Кресло в модели условное, его точный размер ещё можно подобрать.' },
    vanity: { letter: 'D', name: 'Личный ритуал', description: 'Столик 75 × 40 см у второго окна, пуф под ним. Банкетка Argos 95 × 38 см, H45 см — чуть ниже матраса. Перед ней около 66 см; открывание двери проверить по месту.' }
  };
  const art = {
    wardrobe: '<rect x="12" y="5" width="30" height="48" rx="1"/><path d="M12 9h30M12 49h30M28 9v40M26 27v8M40 27v8"/><path d="m31 17 7-5m-7 10 7-5"/>',
    rug: '<path d="m6 21 32-10 12 30-32 10Z"/><path d="m10 24 26-8 9 23-26 8ZM6 21l-2-4m6 3-2-4m6 3-2-4m6 3-2-4m6 3-2-4m6 3-2-4m6 3-2-4m6 3-2-4M18 51l2 4m2-5 2 4m2-5 2 4m2-5 2 4m2-5 2 4m2-5 2 4m2-5 2 4m2-5 2 4"/>',
    rail: '<path d="m5 23 35-9 9 5-35 10-9-6Zm9 6v8m-6-12v8m17-7v8m12-11v8m9-10v8"/>',
    brackets: '<path d="M12 10h7v32h28v7H12Zm7 28 21 11M15 17h1m-1 9h1m15 19h1"/>',
    lamp: '<path d="m17 9-6 18h30L35 9H17Zm3 18-9 28m20-28 10 28m-15-28v29M13 50h26"/>',
    ceiling: '<path d="M10 18h34c-2 14-9 19-17 19S12 32 10 18Zm17 19v12m-8 0h16M18 18v-7m18 7v-7"/>',
    bench: '<path d="M5 24h44v17H5Zm0 5h44M10 41v13m34-13v13M21 33h12"/>',
    curtains: '<path d="M5 8h44M8 8v45l17-4V8m4 0v41l17 4V8M13 10v39m6-39v37m15-37v37m6-37v39"/>',
    paint: '<path d="M11 21h32v32H11Zm0 8h32M16 21v-5a11 11 0 0 1 22 0v5M19 36h16m-16 5h16"/>',
    desk: '<path d="M5 22h44v5H5Zm3 5v29m38-29v29M10 31h34v11H10m13-5h7"/>'
  };
  const products = window.bedroomProducts;
  const i18n = window.BedroomI18n;
  const tr = value => i18n.text(value);
  const local = value => i18n.local(value);
  const money = value => '£' + (value / 100).toLocaleString('en-GB', { minimumFractionDigits: value % 100 ? 2 : 0, maximumFractionDigits: 2 });
  let currentFilter = 'all';
  let restored = {};
  let storageAvailable = true;
  try { restored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { storageAvailable = false; }
  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  const state = {
    language: ['en', 'ru'].includes(requestedLanguage) ? requestedLanguage : restored.language === 'en' ? 'en' : 'ru',
    catalogVersion: 3,
    layout: Object.hasOwn(layouts, restored.layout) ? restored.layout : 'calm',
    palette: Object.hasOwn(palettes, restored.palette) ? restored.palette : 'linen',
    light: restored.light === 'evening' ? 'evening' : 'day',
    exposure: ['north', 'south'].includes(restored.exposure) ? restored.exposure : 'unknown',
    fixture: restored.fixture === 'down' ? 'down' : 'up',
    doorVisible: restored.doorVisible !== false,
    doorOpen: restored.doorOpen === true,
    selected: new Set(Array.isArray(restored.selected) ? restored.selected.filter(id => products.some(p => p.id === id)) : ['wardrobe', 'rug', 'rail', 'brackets', 'ceiling', 'bench', 'curtains']),
    notes: typeof restored.notes === 'string' ? restored.notes.slice(0, 4000) : '',
    checked: Array.isArray(restored.checked) ? restored.checked.filter(id => ['bed', 'door', 'utilities', 'niche'].includes(id)) : []
  };
  if (Array.isArray(restored.selected) && !restored.catalogVersion && restored.selected.length) ['ceiling', 'bench', 'curtains'].forEach(id => state.selected.add(id));
  if (restored.catalogVersion !== 3 && state.selected.has('rail')) state.selected.add('brackets');
  i18n.setLanguage(state.language);
  let scene = null;
  let sceneAttempted = false;
  let mode = '3d';
  let toastTimer;
  let noteTimer;
  const stage = $('#room-stage');
  const gallery = window.createLayoutGallery({ getScene: () => scene, getState: () => ({ ...state, letter: layouts[state.layout].letter, layoutName: tr(layouts[state.layout].name), paletteName: tr(palettes[state.palette].name) }), i18n });

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...state, selected: [...state.selected] }));
      storageAvailable = true;
      $('#save-status').textContent = tr('Сохранено в этом браузере. Заметки никуда не отправляются.');
    } catch {
      storageAvailable = false;
      $('#save-status').textContent = tr('Браузер не сохранил изменения. Их можно сохранить в PDF.');
    }
  }

  function toast(message) {
    const node = $('#toast');
    clearTimeout(toastTimer);
    node.textContent = tr(message);
    node.classList.add('is-visible');
    toastTimer = setTimeout(() => node.classList.remove('is-visible'), 3200);
  }

  function updatePalette() {
    $$('[data-palette]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.palette === state.palette)));
    $('#palette-short-name').textContent = tr(palettes[state.palette].name);
    scene?.setPalette(palettes[state.palette]);
    updatePaletteDetails();
    renderPlan();
    gallery.refresh();
  }

  function updateLayout() {
    $$('input[name="layout"]').forEach(input => { input.checked = input.value === state.layout; });
    $('#layout-kicker').textContent = tr(`СЦЕНАРИЙ ${layouts[state.layout].letter}`);
    $('#layout-description').textContent = tr(layouts[state.layout].description);
    scene?.setLayout(state.layout);
    updateSelectionSummary();
    gallery.refresh();
    renderPlan();
  }

  function updatePaletteDetails() {
    const palette = palettes[state.palette];
    const labels = { wall: 'Стены', accent: 'Текстиль', wood: 'Дерево', curtain: 'Шторы' };
    $('#room-hex-list').replaceChildren(...Object.keys(labels).map(key => {
      const item = document.createElement('div');
      const swatch = document.createElement('span'); swatch.className = 'hex-swatch'; swatch.style.backgroundColor = palette[key]; swatch.setAttribute('aria-hidden','true');
      const label = document.createElement('dt'); label.textContent = tr(labels[key]);
      const code = document.createElement('dd'); code.textContent = palette[key].toUpperCase();
      item.append(swatch, label, code); return item;
    }));
    updateSelectionSummary();
  }
  function updateSelectionSummary() {
    const exposure = state.exposure === 'north' ? tr('Северный свет') : state.exposure === 'south' ? tr('Южный свет') : tr('Направление пока неизвестно');
    $('#selection-summary').textContent = [tr(palettes[state.palette].name), exposure, tr('Купленная серая кровать')].join(' · ');
  }
  function updateExposure() {
    $$('[data-exposure]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.exposure === state.exposure)));
    const hint = state.light === 'evening'
      ? ['Вечером сравниваем тёплый искусственный свет. Направление окон сохранено для дневного просмотра.', 'Evening uses warm artificial light. The window direction is saved for the daytime view.']
      : state.exposure === 'north'
        ? ['Север: более прохладный рассеянный свет. Тёплые оттенки можно сравнить с глубоким изумрудом и светлым текстилем.', 'North: cooler, diffuse daylight. Compare warm tones with deep emerald and light textiles.']
        : state.exposure === 'south'
          ? ['Юг: более яркий тёплый свет. Посмотрите, как меняются бежевые и зелёные стены.', 'South: brighter, warmer daylight. Compare how beige and green walls change.']
          : ['Направление окон пока неизвестно. Выберите север или юг, чтобы сравнить ощущение цвета.', 'Window direction is unknown. Select north or south to compare the feel of the colours.'];
    $('#exposure-hint').textContent = local(hint);
    scene?.setExposure(state.exposure);
    updateSelectionSummary();
    gallery.refresh();
  }
  function updateFixture() {
    $$('[data-fixture]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.fixture === state.fixture)));
    scene?.setFixture(state.fixture);
    gallery.refresh();
  }
  function updateLight() {
    $$('[data-light]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.light === state.light)));
    stage.classList.toggle('is-evening', state.light === 'evening');
    scene?.setLight(state.light);
    updateExposure();
  }

  function planSvg() { return window.bedroomPlan(state, palettes, layouts); }
  function renderPlan() { $('#plan-host').innerHTML = planSvg(); }

  function setMode(nextMode) {
    mode = nextMode;
    stage.classList.toggle('is-plan', mode === 'plan');
    $$('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    $$('.camera-bar button').forEach(button => { button.disabled = mode === 'plan' || !scene; });
    $('#reset-camera').disabled = !scene;
    $$('.zoom-tools button').forEach(button => { button.disabled = mode === 'plan' || !scene; });
    $('#stage-hint').textContent = tr(mode === 'plan' ? 'Вид сверху · размеры в сантиметрах' : scene ? 'Потяните влево / вправо · стрелки и + / − на клавиатуре' : sceneAttempted ? 'Показан план: браузер не запустил 3D' : 'Объёмная схема · запуск 3D…');
    scene?.setVisible(mode === '3d');
    renderDoorControls();
  }

  function renderDoorControls() {
    const unavailable = !scene || mode === 'plan';
    $('#door-visible').checked = state.doorVisible;
    $('#door-visible').disabled = unavailable;
    $('#door-toggle').disabled = unavailable || !state.doorVisible;
    $('#door-toggle').setAttribute('aria-pressed', String(state.doorOpen));
    $('#door-toggle').textContent = tr(state.doorOpen ? 'Закрыть дверь' : 'Открыть дверь');
    $('#door-status').textContent = tr(!state.doorVisible ? 'Дверь скрыта' : state.doorOpen ? 'Дверь открыта внутрь' : 'Дверь закрыта');
  }
  $('#door-visible').addEventListener('change', event => { state.doorVisible = event.target.checked; scene?.setDoorVisible(state.doorVisible); renderDoorControls(); persist(); });
  $('#door-toggle').addEventListener('click', () => scene?.setDoorOpen(!state.doorOpen));
  $('#scene-host').addEventListener('room-door-change', () => {
    if (!scene) return;
    const door = scene.getDoorState(); state.doorVisible = door.visible; state.doorOpen = door.open;
    renderDoorControls(); persist(); if (!door.animating) gallery.refresh();
  });

  function startScene() {
    if (sceneAttempted) return;
    sceneAttempted = true;
    try {
      scene = window.createBedroomScene($('#scene-host'), { palette: palettes[state.palette], layout: state.layout, light: state.light, exposure: state.exposure, fixture: state.fixture, doorVisible: state.doorVisible, doorOpen: state.doorOpen });
      i18n.apply($('#scene-host'));
      stage.classList.add('is-ready');
      setMode(mode);
    } catch (error) {
      console.info('The 2D floor plan remains available:', error.message);
      $$('[data-mode="3d"]').forEach(button => { button.disabled = true; });
      setMode('plan');
      $('#stage-hint').textContent = tr('Показан план: браузер не запустил 3D');
    }
  }

  function updateBudget() {
    const selected = products.filter(p => state.selected.has(p.id));
    const total = selected.reduce((sum, p) => sum + (p.price ?? 0) * p.quantity, 0);
    $('#budget-total').textContent = money(total);
    const count = selected.length;
    const unpriced = selected.filter(p => p.price === null).length;
    $('#budget-count').textContent = state.language === 'en'
      ? `${count} selected item${count === 1 ? '' : 's'}${unpriced ? ' · + curtains: price to confirm' : ''}`
      : `${count} ${count === 1 ? 'выбранная позиция' : count >= 2 && count <= 4 ? 'выбранные позиции' : 'выбранных позиций'}${unpriced ? ' · + шторы: цену уточнить' : ''}`;
    $$('.product-row').forEach(row => {
      row.classList.toggle('is-excluded', !state.selected.has(row.dataset.product));
      row.querySelector('input').checked = state.selected.has(row.dataset.product);
    });
  }

  function renderProducts() {
    $('#product-list').innerHTML = products.map(p => `<article class="product-row" data-product="${p.id}" data-category="${p.category}"><input class="product-checkbox" type="checkbox" name="shopping-item" value="${p.id}" aria-label="${state.language === 'en' ? 'Include' : 'Добавить'} ${p.name}" data-product-check="${p.id}" ${state.selected.has(p.id) ? 'checked' : ''}><div class="product-art" aria-hidden="true"><svg viewBox="0 0 54 62">${art[p.id] || art[p.category === 'textile' ? 'curtains' : 'paint']}</svg></div><div class="product-description"><span class="retailer-label">${p.shop}</span><h3>${p.name}</h3><p>${local(p.type)} · ${local(p.size)}</p><small>${local(p.note)}</small>${p.alternative ? `<a class="product-alternative" href="${p.alternative.url}" target="_blank" rel="noopener noreferrer">${local(p.alternative.label)} ↗</a>` : ''}</div><div class="product-price${p.price === null ? ' is-unpriced' : ''}">${p.price === null ? (state.language === 'en' ? 'Confirm price' : 'Уточнить цену') : money(p.price * p.quantity)}<small>${p.price === null ? (state.language === 'en' ? '2 pairs · excluded from subtotal' : '2 пары · сверх итога') : p.quantity > 1 ? `${money(p.price)} × ${p.quantity}` : (state.language === 'en' ? '1 item' : '1 шт.')}</small></div><a class="product-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} — ${state.language === 'en' ? 'open at' : 'открыть в'} ${p.shop}"><svg class="icon" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg></a></article>`).join('');
    $$('.product-row').forEach(row => { row.hidden = currentFilter !== 'all' && row.dataset.category !== currentFilter; });
    updateBudget();
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  $$('[data-palette]').forEach(button => button.addEventListener('click', () => { state.palette = button.dataset.palette; updatePalette(); persist(); }));
  $$('input[name="layout"]').forEach(input => input.addEventListener('change', () => { state.layout = input.value; updateLayout(); persist(); }));
  $$('[data-exposure]').forEach(button => button.addEventListener('click', () => { state.exposure = button.dataset.exposure; updateExposure(); persist(); }));
  $$('[data-fixture]').forEach(button => button.addEventListener('click', () => { state.fixture = button.dataset.fixture; updateFixture(); persist(); }));
  $('#layout-reference').addEventListener('click', () => { startScene(); gallery.open(); });
  $$('[data-light]').forEach(button => button.addEventListener('click', () => { state.light = button.dataset.light; updateLight(); persist(); }));
  $$('[data-mode]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.mode === '3d') { startScene(); if (!scene) return; }
    setMode(button.dataset.mode);
  }));
  $$('[data-camera]').forEach(button => button.addEventListener('click', () => {
    $$('[data-camera]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    scene?.setCamera(button.dataset.camera);
  }));
  $('#reset-camera').addEventListener('click', () => {
    scene?.resetCamera();
    $$('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === 'overview')));
  });
  $('#zoom-in').addEventListener('click', () => scene?.zoomBy(.1));
  $('#zoom-out').addEventListener('click', () => scene?.zoomBy(-.1));
  $('#scene-host').addEventListener('room-zoom-change', event => { $('#zoom-level').value = `${event.detail}%`; });
  $('#scene-host').addEventListener('room-camera-custom', () => { $$('[data-camera]').forEach(button => button.setAttribute('aria-pressed', 'false')); });
  $('#scene-host').addEventListener('room-camera-preset', event => { $$('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === event.detail))); });
  $('#scene-host').addEventListener('room-context-lost', () => {
    scene = null;
    stage.classList.remove('is-ready');
    $('[data-mode="3d"]').disabled = true;
    setMode('plan');
    $('#stage-hint').textContent = tr('3D приостановлен браузером · план доступен');
  });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    currentFilter = button.dataset.filter;
    $$('.product-row').forEach(row => { row.hidden = currentFilter !== 'all' && row.dataset.category !== currentFilter; });
  }));
  $('#product-list').addEventListener('change', event => {
    const id = event.target.dataset.productCheck;
    if (!id) return;
    const product = products.find(item => item.id === id);
    if (event.target.checked) {
      if (product.choiceGroup) products.filter(item => item.choiceGroup === product.choiceGroup).forEach(item => state.selected.delete(item.id));
      state.selected.add(id);
    } else state.selected.delete(id);
    updateBudget(); persist();
  });
  $('#download-list').addEventListener('click', () => {
    const selected = products.filter(p => state.selected.has(p.id));
    if (!selected.length) { toast('Сначала отметьте товары для списка.'); return; }
    const header = state.language === 'en' ? ['Product', 'Retailer', 'Size', 'Quantity', 'Unit price GBP', 'Line total GBP', 'Link', 'Notes'] : ['Товар', 'Магазин', 'Размер', 'Количество', 'Цена за штуку GBP', 'Сумма GBP', 'Ссылка', 'Примечание'];
    const rows = [header, ...selected.map(p => [p.name, p.shop, local(p.size), p.quantity, p.price === null ? '' : (p.price / 100).toFixed(2), p.price === null ? '' : (p.price * p.quantity / 100).toFixed(2), p.url, local(p.note)]), [state.language === 'en' ? 'PRICED SUBTOTAL' : 'ПОДТВЕРЖДЁННАЯ СУММА', '', '', '', '', (selected.reduce((s, p) => s + (p.price ?? 0) * p.quantity, 0) / 100).toFixed(2), '', state.language === 'en' ? 'Checked 06.11.2026; delivery, assembly and other extras excluded' : 'Проверено 06.11.2026; доставка, сборка и другие дополнительные расходы не включены']];
    const csv = '\uFEFF' + rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(';')).join('\r\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `serenity-shopping-list-${state.language}.csv`);
    toast('Список покупок подготовлен для скачивания.');
  });
  $('#download-plan').addEventListener('click', async () => {
    const button = $('#download-plan');
    button.disabled = true;
    const exportLanguage = state.language;
    const exportLetter = layouts[state.layout].letter;
    const exportPalette = state.palette;
    const exportSource = planSvg();
    const url = URL.createObjectURL(new Blob([exportSource], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
      const canvas = document.createElement('canvas');
      canvas.width = 1500; canvas.height = 1680;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f7f5ef'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export failed');
      downloadBlob(blob, `serenity-plan-${exportLetter}-${exportPalette}-${exportLanguage}.png`);
      toast('Вид сверху подготовлен как PNG.');
    } catch {
      downloadBlob(new Blob([exportSource], { type: 'image/svg+xml;charset=utf-8' }), `serenity-plan-${exportLetter}-${exportPalette}-${exportLanguage}.svg`);
      toast('План подготовлен в формате SVG.');
    } finally { URL.revokeObjectURL(url); button.disabled = false; }
  });

  $('#project-notes').value = state.notes;
  $('#project-notes').addEventListener('input', event => {
    state.notes = event.target.value;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(persist, 300);
  });
  $$('[data-check]').forEach(input => {
    input.checked = state.checked.includes(input.dataset.check);
    input.addEventListener('change', () => { state.checked = $$('[data-check]:checked').map(item => item.dataset.check); persist(); });
  });
  $$('[data-print]').forEach(button => button.addEventListener('click', () => {
    $('#print-notes').textContent = state.notes ? `${state.language === 'en' ? 'Project notes' : 'Заметки к проекту'}\n\n${state.notes}` : '';
    window.print();
  }));
  window.addEventListener('beforeprint', () => { $('#print-notes').textContent = state.notes ? `${state.language === 'en' ? 'Project notes' : 'Заметки к проекту'}\n\n${state.notes}` : ''; });
  window.addEventListener('pagehide', () => { clearTimeout(noteTimer); persist(); });

  const menu = $('#site-nav');
  const menuButton = $('.menu-toggle');
  function closeMenu() { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', tr('Открыть меню')); }
  menuButton.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', tr(open ? 'Закрыть меню' : 'Открыть меню'));
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); menuButton.focus(); } });
  matchMedia('(min-width:651px)').addEventListener('change', closeMenu);

  const dialog = $('#reference-dialog');
  const references = {
    plan: { title: 'Ваш исходный план', src: 'image/Bedroom.png', width: 2400, height: 1620, alt: 'Предоставленный план комнаты со всеми исходными размерами', caption: 'Исходное изображение сохранено без изменений. Верхняя ширина и нижний выступ требуют уточнения, как указано на самом плане.' },
    bed: { title: 'Кровать, которая уже есть', src: 'image/alteahotelstyle_kb_alteagrey_grey_view1.jpg', width: 901, height: 572, alt: 'Предоставленная фотография серой кровати с подъёмным основанием', caption: 'Фото из ваших исходных материалов. Точные габариты кровати и изголовья пока не указаны.' },
  };
  let referenceTrigger;
  let currentReference;
  function renderReference() {
    const reference = references[currentReference];
    if (!reference) return;
    $('#reference-title').textContent = tr(reference.title);
    $('#reference-image').width = reference.width;
    $('#reference-image').height = reference.height;
    $('#reference-image').src = reference.src;
    $('#reference-image').alt = tr(reference.alt);
    $('#reference-caption').textContent = tr(reference.caption);
  }
  $$('[data-reference]').forEach(button => button.addEventListener('click', () => {
    referenceTrigger = button;
    const reference = references[button.dataset.reference];
    if (!reference) return;
    currentReference = button.dataset.reference;
    renderReference();
    dialog.showModal(); document.body.classList.add('dialog-open');
  }));
  $('#close-reference').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.toggle('dialog-open', !!document.querySelector('dialog[open]')); referenceTrigger?.focus({ preventScroll: true }); });

  function applyLanguage() {
    i18n.setLanguage(state.language);
    document.documentElement.lang = state.language;
    i18n.apply();
    $$('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === state.language)));
    $('#palette-short-name').textContent = tr(palettes[state.palette].name);
    $('#layout-kicker').textContent = tr(`СЦЕНАРИЙ ${layouts[state.layout].letter}`);
    $('#layout-description').textContent = tr(layouts[state.layout].description);
    updatePaletteDetails(); updateExposure();
    renderProducts(); renderPlan(); renderReference(); gallery.refresh(); setMode(mode);
    $('#save-status').textContent = tr(storageAvailable ? 'Выбор и заметки сохраняются только в этом браузере.' : 'Хранилище браузера недоступно. Проект можно сохранить в PDF.');
    $('#toast').classList.remove('is-visible');
  }
  $$('[data-language]').forEach(button => button.addEventListener('click', () => {
    state.language = button.dataset.language; applyLanguage(); persist();
  }));
  updateLayout(); updatePalette(); updateLight(); updateFixture(); renderProducts(); setMode('3d');
  applyLanguage();
  if (!storageAvailable) $('#save-status').textContent = tr('Хранилище браузера недоступно. Проект можно сохранить в PDF.');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); startScene(); } }, { rootMargin: '200px' });
    observer.observe(stage);
  } else { startScene(); }
  document.documentElement.classList.add('js');
})();
