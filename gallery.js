window.createLayoutGallery = function createLayoutGallery(options) {
  'use strict';
  const { getScene, getState, i18n } = options;
  const dialog = document.querySelector('#layout-gallery-dialog');
  const main = document.querySelector('#layout-gallery-main');
  const thumbs = document.querySelector('#layout-gallery-thumbs');
  const status = document.querySelector('#layout-gallery-status');
  const previous = document.querySelector('#gallery-prev');
  const next = document.querySelector('#gallery-next');
  const labels = [['Со стороны двери', 'From the door'], ['Изголовье', 'Headboard'], ['Окна и мебель', 'Windows and furniture'], ['Ниша и вход', 'Niche and entrance']];
  const cache = new Map();
  let views = [], index = 0, ticket = 0, trigger;
  const local = pair => i18n.local(pair);

  function select(value) {
    const ready = views.length === labels.length;
    previous.disabled = next.disabled = !ready;
    index = ready ? (value + views.length) % views.length : 0;
    main.style.backgroundImage = ready ? `url("${views[index]}")` : '';
    main.setAttribute('aria-label', ready ? local(labels[index]) : local(['Снимок недоступен', 'Snapshot unavailable']));
    [...thumbs.children].forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
    document.querySelector('#gallery-counter').textContent = ready ? `${index + 1} / ${views.length}` : '';
  }

  function clear(message) {
    views = [];
    thumbs.replaceChildren();
    select(0);
    status.textContent = local(message);
  }

  function draw() {
    const state = getState();
    document.querySelector('#layout-gallery-title').textContent = `${state.letter} — ${state.layoutName}`;
    document.querySelector('#layout-gallery-meta').textContent = state.paletteName;
    thumbs.replaceChildren(...labels.map((label, n) => {
      const button = document.createElement('button');
      button.type = 'button';
      const picture = document.createElement('span');
      picture.className = 'gallery-thumb-picture';
      picture.style.backgroundImage = `url("${views[n]}")`;
      const caption = document.createElement('span');
      caption.textContent = local(label);
      button.append(picture, caption);
      button.addEventListener('click', () => select(n));
      return button;
    }));
    select(index);
  }

  async function refresh() {
    if (!dialog.open) return;
    const current = ++ticket, state = getState(), model = getScene();
    if (!model) {
      clear(['3D-модель недоступна. Посмотрите план комнаты.', 'The 3D model is unavailable. Please use the floor plan.']);
      return;
    }
    const door = model.getDoorState();
    const width = innerWidth < 650 ? 640 : 960;
    const key = [state.layout, state.palette, state.light, state.exposure, state.fixture, door.visible, Math.round(door.angleDegrees), width].join('-');
    main.setAttribute('aria-busy', 'true');
    status.textContent = local(['Подготавливаем четыре вида…', 'Preparing four views…']);
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (current !== ticket || !dialog.open) return;
    try {
      if (!cache.has(key)) {
        cache.set(key, model.captureViews(width));
        if (cache.size > 8) cache.delete(cache.keys().next().value);
      }
      views = cache.get(key);
      draw();
      status.textContent = '';
    } catch {
      clear(['Не удалось подготовить снимки. Попробуйте вращать модель на странице.', 'Could not prepare snapshots. Try rotating the model on the page.']);
    } finally {
      if (current === ticket) main.setAttribute('aria-busy', 'false');
    }
  }

  previous.addEventListener('click', () => select(index - 1));
  next.addEventListener('click', () => select(index + 1));
  document.querySelector('#close-layout-gallery').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      select(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    ticket++;
    main.setAttribute('aria-busy', 'false');
    document.body.classList.toggle('dialog-open', Boolean(document.querySelector('dialog[open]')));
    trigger?.focus({ preventScroll: true });
  });
  return {
    refresh,
    open() {
      trigger = document.activeElement;
      index = 0;
      dialog.showModal();
      document.body.classList.add('dialog-open');
      refresh();
    }
  };
};
