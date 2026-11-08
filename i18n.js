/* Exact phrase translations. Text nodes preserve their markup and event listeners. */
window.BedroomI18n = (() => {
  const phrases = new Map([
    ['Спокойствие. — ваша спальня, по-новому', 'Serenity. — your bedroom, reimagined'],
    ['К содержимому', 'Skip to content'], ['спокойствие', 'serenity'],
    ['ЛИЧНЫЙ ИНТЕРЬЕРНЫЙ ПРОЕКТ', 'YOUR PERSONAL INTERIOR PROJECT'],
    ['Идея', 'Concept'], ['Планировка', 'Layout'], ['Материалы', 'Materials'], ['Покупки', 'Shopping'],
    ['Сохранить PDF', 'Save PDF'], ['HOTEL AT HOME · ВЕЛИКОБРИТАНИЯ', 'HOTEL AT HOME · UNITED KINGDOM'],
    ['Место,', 'A place'], ['где можно', 'to simply'], ['выдохнуть.', 'exhale.'],
    ['Ваша спальня — с ощущением хорошего отеля.', 'Your bedroom, with the feeling of a lovely hotel.'],
    ['С учётом вашей комнаты. С вниманием к мелочам.', 'Made for your room. With care in every detail.'],
    ['Заглянуть внутрь', 'Step inside'], ['м²', 'm²'], ['м', 'm'],
    ['необычной формы', 'of unusual shape'], ['высота потолка', 'ceiling height'], ['варианта планировки', 'layout options'],
    ['Кровать уже есть — проектируем вокруг неё', 'The bed is already yours — we design around it'],
    ['Посмотреть ваш исходный план', 'View your original floor plan'], ['КОНЦЕПЦИЯ / ПЕРВЫЙ ВЗГЛЯД', 'CONCEPT / FIRST LOOK'],
    ['01 / ЗАМЫСЕЛ', '01 / THE IDEA'], ['Не больше вещей.', 'Fewer things.'], ['Больше ощущения дома.', 'More feeling at home.'],
    ['Нестандартная форма — повод найти красивое решение. Оставляем воздух у окон, используем нишу для хранения и собираем интерьер вокруг вашей кровати.', 'An unusual shape deserves a thoughtful solution. We keep the windows clear, use the niche for storage and build the room around your bed.'],
    ['ОТПРАВНАЯ ТОЧКА · УЖЕ КУПЛЕНА', 'OUR STARTING POINT · ALREADY OWNED'],
    ['Ваша кровать, главный герой.', 'Your bed takes centre stage.'], ['Мягкое изголовье, встроенные полочки и свет.', 'A soft headboard, integrated shelves and lights.'],
    ['Тактильно, а не вычурно', 'Comfort you can feel'],
    ['Матовые стены, дерево и многослойный текстиль создают ощущение отеля без лишнего декора.', 'Matt walls, wood and layered textiles bring hotel comfort without extra clutter.'],
    ['Ниша работает на вас', 'Make the niche work'],
    ['Шкаф-купе в узкой части комнаты. Раздвижные двери не требуют места для распахивания перед креслом или столиком.', 'A sliding wardrobe in the narrow part of the room. Its doors need no swing space in front of a chair or vanity.'],
    ['Уют включается светом', 'Comfort starts with light'],
    ['Дневной свет двух окон, мягкий общий свет и отдельное освещение для чтения у кровати.', 'Daylight from two windows, soft general lighting and dedicated reading lights at the bed.'],
    ['02 / ПРОСТРАНСТВО', '02 / THE SPACE'], ['Всё встаёт', 'Everything'], ['на свои места.', 'finds its place.'],
    ['Попробуйте четыре сценария жизни в одной комнате.', 'Try four ways to live in one room.'], ['Вид сверху покажет расстановку понятнее всего.', 'The floor plan makes the arrangement clearest.'],
    ['Свериться с исходным планом', 'Compare with the original plan'], ['ВАША КОМНАТА', 'YOUR ROOM'], ['Объём', '3D view'], ['Вид сверху', 'Floor plan'],
    ['Объёмная схема · запуск 3D…', 'Room model · starting 3D…'], ['РАКУРС', 'VIEW'], ['Общий', 'Overview'], ['От двери', 'Entrance'], ['У окон', 'Windows'], ['Сверху', 'Top'],
    ['Кровать', 'Bed'], ['Хранение', 'Storage'], ['Окна', 'Windows'], ['Дверь', 'Door'],
    ['Как вам удобнее?', 'What feels right for you?'], ['Четыре идеи вокруг вашей кровати.', 'Four ideas around your bed.'],
    ['Тихий отель', 'Quiet hotel'], ['Симметрия и свободное пространство', 'Symmetry and open space'],
    ['Место для себя', 'A place for yourself'], ['Компактный стол у второго окна', 'A compact desk at the second window'],
    ['Медленное утро', 'Slow mornings'], ['Кресло и уголок для чтения', 'An armchair and reading corner'],
    ['Личный ритуал', 'Your daily ritual'], ['Туалетный столик и мягкая банкетка', 'A vanity and upholstered bench'],
    ['Та же спокойная основа плюс небольшой стол 73 × 50 см у второго окна. Высоту подоконника нужно проверить до покупки.', 'The same calm foundation with a 73 × 50 cm desk at the second window. Check the sill height before buying.'],
    ['Кресло у второго окна и отдельный торшер для чтения. Кресло в модели условное, его точный размер ещё можно подобрать.', 'An armchair at the second window with a separate reading lamp. The chair is illustrative; its exact size is still to be chosen.'],
    ['Столик 75 × 40 см у второго окна, пуф под ним. Банкетка Argos 95 × 38 см, H45 см — чуть ниже матраса. Перед ней около 66 см; открывание двери проверить по месту.', 'A 75 × 40 cm vanity at the second window, with the stool tucked underneath. The Argos bench is 95 × 38 cm, H45 cm, a little below the mattress. About 66 cm remains in front; check the actual door swing.'],
     ['Время для уюта', 'Time for comfort'], ['День', 'Day'], ['Вечер', 'Evening'],
    ['Тёплый лён', 'Warm linen'], ['Мягкий шалфей', 'Soft sage'], ['Глубокий тауп', 'Deep taupe'],
    ['ЭСКИЗ, НЕ РАБОЧИЙ ЧЕРТЁЖ', 'CONCEPT, NOT A CONSTRUCTION DRAWING'],
    ['Форма и окна перенесены с вашего плана. Матрас в модели условно 160 × 200 см, изголовье — 270 см: точные размеры кровати ещё нужны. Дуга двери показывает только один из возможных вариантов открывания.', 'The shape and windows follow your plan. The model assumes a 160 × 200 cm mattress and a 270 cm headboard; actual bed dimensions are still needed. The door arc shows one possible swing only.'],
    ['Скачать вид сверху', 'Download floor plan'],
    ['Для переключения планировок и объёмной модели включите JavaScript. Исходный план можно открыть в папке image.', 'Enable JavaScript to switch layouts and use the 3D model. The original plan is in the image folder.'],
    ['03 / ОЩУЩЕНИЯ', '03 / THE FEEL'], ['Цвет, к которому', 'Colour you want'], ['хочется прикоснуться.', 'to reach out and touch.'],
    ['Молочный · натуральный дуб · олива', 'Cream · natural oak · olive'], ['Серо-зелёный · светлый дуб · сливочный', 'Sage green · light oak · cream'], ['Грибной · тёмное дерево · песочный', 'Mushroom · dark wood · sand'],
    ['Матовая краска на стенах, дерево под ногами, плотные шторы от потолка и мягкий ковёр у кровати. Цветовые сочетания концептуальные — оттенок краски выбирается по образцу в комнате.', 'Matt paint, wood underfoot, full-length curtains and a soft rug beside the bed. These are concept palettes; choose paint from a physical sample in the room.'],
    ['Посмотреть выбранную палитру в комнате', 'See this palette in the room'], ['ТРИ СЛОЯ СВЕТА', 'THREE LAYERS OF LIGHT'],
    ['Уют не должен', 'Comfort should'], ['заканчиваться', 'continue'], ['на закате.', 'after sunset.'], ['Естественный', 'Natural'],
    ['Два окна остаются открытыми для света. Шторы смягчают его и собирают стену в единое целое.', 'Two windows welcome daylight. Curtains soften it and bring the wall together.'],
    ['Мягкий общий', 'Soft general light'],
    ['Плафон Cossington направлен вверх: свет отражается от потолка. Высота 25 см подходит для низкого потолка; ориентир для лампочек — тёплый свет 2700 K.', 'The Cossington bowl faces upwards, reflecting light off the ceiling. Its 25 cm drop suits a low ceiling; choose warm 2700 K bulbs.'],
    ['Личный вечерний', 'Personal evening light'], ['Встроенные светильники кровати для чтения; отдельный торшер — для кресла.', 'Integrated bed lights for reading; a separate floor lamp for the armchair.'],
    ['04 / ОТ ИДЕИ К ПОКУПКЕ', '04 / FROM IDEA TO HOME'], ['Красиво.', 'Beautiful.'], ['И можно найти в UK.', 'And available in the UK.'],
    ['Всё', 'All'], ['Мебель', 'Furniture'], ['Текстиль', 'Textiles'], ['Свет', 'Lighting'], ['Отделка', 'Finishes'],
    ['Цены проверены 6 ноября 2026 года по страницам магазинов и могут измениться. Наличие и доставка зависят от адреса. Шкаф 100 см в нише 105 см требует проверки плинтусов и места для сборки.', 'Prices checked on retailer pages on 6 November 2026 and may change. Stock and delivery depend on the address. Check skirting boards and assembly clearance for a 100 cm wardrobe in a 105 cm niche.'],
    ['Ещё сравнить:', 'Also compare:'], ['Шторы Sundour Eclipse · Argos ↗', 'Sundour Eclipse curtains · Argos ↗'], ['Кресла · Wayfair UK ↗', 'Armchairs · Wayfair UK ↗'],
    ['Эти альтернативы не включены в сумму.', 'These alternatives are not included in the total.'],
    ['ВАШ СПИСОК', 'YOUR LIST'], ['Подтверждённая часть стоимости.', 'Priced subtotal.'],
    ['Без доставки, сборки, лампочек, крючков, подложки, столика D и ремонта.', 'Excludes delivery, assembly, bulbs, hooks, underlay, the layout D vanity and renovation.'],
    ['Скачать список CSV', 'Download shopping CSV'], ['Откроется в Excel или Numbers', 'Open in Excel or Numbers'],
    ['05 / ПОСЛЕДНИЕ ШТРИХИ', '05 / THE FINAL DETAILS'], ['Хороший проект', 'A good project'], ['начинается с деталей.', 'starts with the details.'],
    ['Прежде чем выбирать окончательную расстановку, дополним то, чего пока нет в исходных материалах.', 'Before choosing the final arrangement, let’s fill in what is missing from the original information.'],
    ['Точные размеры кровати и широкого изголовья', 'Exact dimensions of the bed and wide headboard'],
    ['Направление открывания двери и высота подоконников', 'Door swing direction and window sill heights'],
    ['Радиаторы, розетки и выключатели', 'Radiators, sockets and switches'], ['Ширина верха и нижнего выступа — контрольный обмер', 'Top width and lower step — confirm measurements'],
    ['Оставим место для ваших идей.', 'Leave room for your ideas.'], ['Что хочется добавить или изменить?', 'What would you like to add or change?'],
    ['Выбор и заметки сохраняются только в этом браузере.', 'Your choices and notes stay in this browser only.'],
    ['Сохранить проект в PDF', 'Save project as PDF'], ['Откроется окно печати. В нём выберите «Сохранить как PDF».', 'The print dialog will open. Choose “Save as PDF”.'],
    ['Меньше суеты. Больше вашего.', 'Less rush. More you.'], ['Вернуться наверх ↑', 'Back to top ↑'], ['Исходный план', 'Original plan'],
    ['Личный проект спальни: четыре планировки, интерактивная объёмная модель, вид сверху, материалы и подборка мебели в Великобритании.', 'A personal bedroom project: four layouts, an interactive room model, floor plans, materials and UK shopping sources.'],
    ['Спокойствие — в начало', 'Serenity — back to top'], ['Открыть меню', 'Open menu'], ['Закрыть меню', 'Close menu'], ['Основная навигация', 'Main navigation'], ['Параметры комнаты', 'Room details'],
    ['Рассмотреть фотографию вашей кровати', 'Enlarge your bed photograph'], ['Ваша серая кровать с подъёмным основанием и широким изголовьем', 'Your grey ottoman bed with its wide headboard'],
    ['Отображение комнаты', 'Room display'], ['Интерактивная объёмная модель спальни', 'Interactive bedroom model'], ['Масштаб объёмной модели', 'Model zoom'],
    ['Отдалить модель', 'Zoom out'], ['Текущий масштаб', 'Current zoom'], ['Приблизить модель', 'Zoom in'], ['Вернуть исходный ракурс', 'Reset camera'],
    ['Ракурс объёмной модели', 'Model camera angle'], ['Настройки планировки', 'Layout settings'], ['Освещение модели', 'Model lighting'], ['Палитра модели', 'Model palette'], ['Выбор палитры спальни', 'Choose a bedroom palette'],
    ['Фильтр покупок', 'Filter shopping list'], ['Например: хочу больше закрытого хранения и светлее стены…', 'For example: more concealed storage and lighter walls…'], ['Закрыть изображение', 'Close image'],
    ['Язык страницы', 'Page language'], ['Русский', 'Russian'], ['Объёмная схема спальни. Поворот — перетаскиванием или стрелками. Масштаб — плюс и минус. Доступен отдельный вид сверху.', 'Bedroom model. Drag or use arrow keys to rotate. Plus and minus to zoom. A separate floor plan is available.'],
    ['Сохранено в этом браузере. Заметки никуда не отправляются.', 'Saved in this browser. Your notes are not sent anywhere.'],
    ['Браузер не сохранил изменения. Их можно сохранить в PDF.', 'The browser could not save your changes. You can save a PDF instead.'],
    ['Хранилище браузера недоступно. Проект можно сохранить в PDF.', 'Browser storage is unavailable. You can save the project as a PDF.'],
    ['Вид сверху · размеры в сантиметрах', 'Floor plan · dimensions in centimetres'],
    ['Потяните влево / вправо · стрелки и + / − на клавиатуре', 'Drag to rotate · arrow keys and + / − to zoom'],
    ['Показан план: браузер не запустил 3D', 'Floor plan shown: 3D is unavailable in this browser'], ['3D приостановлен браузером · план доступен', '3D paused by the browser · floor plan available'],
    ['Сначала отметьте товары для списка.', 'Select some products first.'], ['Список покупок подготовлен для скачивания.', 'Your shopping list is ready to download.'],
    ['Вид сверху подготовлен как PNG.', 'Your floor plan is ready as a PNG.'], ['План подготовлен в формате SVG.', 'Your floor plan is ready as an SVG.'],
    ['Ваш исходный план', 'Your original floor plan'], ['Предоставленный план комнаты со всеми исходными размерами', 'Your original room sketch with all supplied dimensions'],
    ['Исходное изображение сохранено без изменений. Верхняя ширина и нижний выступ требуют уточнения, как указано на самом плане.', 'The original image is unchanged. Confirm the top width and lower step, as indicated on the sketch itself.'],
    ['Кровать, которая уже есть', 'The bed you already own'], ['Предоставленная фотография серой кровати с подъёмным основанием', 'Your original photograph of the grey ottoman bed'],
    ['Фото из ваших исходных материалов. Точные габариты кровати и изголовья пока не указаны.', 'A photo from your original files. Exact bed and headboard dimensions have not yet been supplied.'],
    ['стол 73 × 50', 'desk 73 × 50'], ['кресло · условно', 'chair · illustrative'], ['банкетка 95 × 38', 'bench 95 × 38'],
    ['столик 75 × 40', 'vanity 75 × 40'], ['свободное пространство', 'open space'], ['ШКАФ-КУПЕ', 'SLIDING'], ['окно 1', 'window 1'], ['окно 2', 'window 2'],
    ['D: банкетка H45 см · столик H75 см · пунктиром пуф под столом', 'D: bench H45 cm · vanity H75 cm · dashed: stool under table'],
    ['Размеры в см. *Кровать условно: точные габариты нужно уточнить.', 'Dimensions in cm. *Bed assumed: confirm actual dimensions.'],
    ['Туалетный столик 75 на 40 см и банкетка 95 на 38 см', 'Vanity 75 by 40 cm and bench 95 by 38 cm']
  ]);
  [
    ['Камень и дуб', 'Stone and oak'], ['Капучино', 'Cappuccino'], ['Изумруд и латунь', 'Emerald and brass'],
    ['Тёплый камень · медовый дуб · лён', 'Warm stone · honey oak · linen'],
    ['Сливочный · капучино · мягкий тауп', 'Cream · cappuccino · soft taupe'],
    ['Глубокий зелёный · светлый текстиль · латунь', 'Deep green · light textiles · brass'],
    ['Шесть палитр, включая три по вашим фотографиям. В A, B, C и D сохраняется одна и та же купленная серая кровать — меняется её окружение.', 'Six palettes, including three from your photographs. The same already owned grey bed stays in A, B, C and D; its surroundings change.'],
    ['Куда выходят окна?', 'Which way do the windows face?'], ['Направление окон', 'Window direction'],
    ['Неизвестно', 'Unknown'], ['Север', 'North'], ['Юг', 'South'], ['Северный свет', 'North light'], ['Южный свет', 'South light'],
    ['Направление пока неизвестно', 'Direction unknown'], ['Купленная серая кровать', 'Your already owned grey bed'],
    ['Условное сравнение света, без расчёта положения солнца. На реальный свет влияют сезон, время суток и соседние здания.', 'An illustrative light comparison, without calculating the sun’s position. Season, time of day and nearby buildings affect real daylight.'],
    ['Где искать', 'Where to find'], ['отделку и детали.', 'finishes and details.'],
    ['Британские магазины и готовые материалы.', 'UK retailers and ready-made materials.'],
    ['Количество и стоимость ремонта пока не рассчитаны.', 'Renovation quantities and costs have not yet been calculated.'],
    ['01 / СТЕНЫ И ПОТОЛОК', '01 / WALLS AND CEILING'], ['02 / ФАКТУРА', '02 / TEXTURE'], ['03 / ИЗВЕСТКОВАЯ ОТДЕЛКА', '03 / LIME FINISH'],
    ['04 / ЛЕПНИНА', '04 / COVING'], ['05 / ОБОИ', '05 / WALLPAPER'], ['06 / ЭЛЕКТРИКА', '06 / ELECTRICAL'],
    ['Краски Dulux Trade, Crown, Albany и другие марки. Для потолка — матовая краска для стен и потолков; оттенок стен выбираем по физическому образцу.', 'Dulux Trade, Crown, Albany and other paint brands. Choose a matt wall and ceiling paint for the ceiling, and a physical sample for wall colours.'],
    ['Краски для стен и потолков ↗', 'Wall and ceiling paints ↗'],
    ['Декоративная штукатурка, включая известковую Marmorino. Покупной материал готовой линейки; грунт и способ нанесения зависят от основания.', 'Decorative plaster, including lime-based Marmorino. An established product range; primer and application depend on the existing surface.'],
    ['Декоративная штукатурка ↗', 'Decorative plaster ↗'],
    ['Limewash — известковая краска с живой неоднородной фактурой. Это отдельный декоративный вариант; для обычного белого потолка предлагаем матовую краску.', 'Limewash is a lime-based paint with a softly varied finish. It is a separate decorative option; we suggest matt paint for a simple white ceiling.'],
    ['Известковая краска ↗', 'Limewash paint ↗'],
    ['Готовые карнизы и потолочные профили coving: гипсовые и облегчённые варианты. Для потолка 242 см начнём с небольшого спокойного профиля.', 'Ready-made plaster and lightweight coving profiles. For a 242 cm ceiling, start with a small, simple profile.'],
    ['Карнизы и потолочные профили ↗', 'Cornices and coving ↗'],
    ['Обои и образцы для сравнения при разном свете. Рисунок, число рулонов и клей выбираем после уточнения стен и раппорта.', 'Wallpaper and samples to compare in different light. Choose the pattern, roll quantities and adhesive once wall sizes and pattern repeats are known.'],
    ['Обои ↗', 'Wallpaper ↗'],
    ['Пример британской двойной розетки 13A с выключателями. Розетки, подрозетники, выключатели и кабель подбирает электрик под существующую проводку.', 'An example of a UK 13A double switched socket. An electrician selects sockets, back boxes, switches and cable to suit the existing wiring.'],
    ['Розетка MK Logic Plus ↗', 'MK Logic Plus socket ↗'],
    ].forEach(([ru, en]) => phrases.set(ru, en));
  [
    ['Цвета комнаты', 'Room colours'], ['Цвета выбранной палитры в HEX', 'Selected palette HEX colours'],
    ['Готовые предметы из британских магазинов: размеры, ссылки и стоимость. Отметьте нужное и выберите Cream или Latte — две пары штор на два окна.', 'Ready-made pieces from UK retailers, with sizes, links and prices. Select what you need and choose Cream or Latte: two curtain pairs for two windows.'],
    ['Кровать по центру короткой стены. Шкаф-купе 100 × 55 см в нижней нише. Ковёр сдвинут к изголовью; у изножья остаётся деревянный пол.', 'The bed is centred on the short wall. A 100 × 55 cm sliding wardrobe fits in the lower niche. The rug is pulled towards the headboard, leaving wood at the foot of the bed.'],
    ['Стены', 'Walls'], ['Дерево', 'Wood'], ['Шторы', 'Curtains'],
    ['Потолочный свет', 'Ceiling light'], ['Направление потолочного плафона', 'Ceiling shade direction'],
    ['Плафон вверх', 'Upward shade'], ['Плафон вниз', 'Downward shade'],
    ['Посмотреть с четырёх сторон', 'View from four sides'], ['Комната с четырёх сторон', 'Four views of the room'],
    ['Закрыть галерею', 'Close gallery'],
    ['← Предыдущий вид', '← Previous view'], ['Следующий вид →', 'Next view →']
  ].forEach(([ru,en]) => phrases.set(ru,en));
  [
    ['Входная дверь','Entrance door'], ['Показывать дверь','Show door'], ['Открыть дверь','Open door'], ['Закрыть дверь','Close door'],
    ['Дверь закрыта','Door closed'], ['Дверь открыта внутрь','Door open inward'], ['Дверь скрыта','Door hidden'],
    ['ВАША КОМНАТА / ИСХОДНЫЙ ПЛАН','YOUR ROOM / ORIGINAL FLOOR PLAN'], ['Размеры и форма помещения','Room dimensions and shape'],
    ['Рассмотреть исходный план комнаты','View the original room plan'], ['Ваш исходный план комнаты с размерами','Your original dimensioned room plan']
  ].forEach(([ru,en]) => phrases.set(ru,en));
  phrases.set('Перед покупкой', 'Before you buy');
  [
    ['Что показывает модель?', 'What does the model show?'],
    ['Интерактивная модель и план сверху показывают условную расстановку по предоставленной схеме. Это первая концепция, которую можно корректировать после уточнения размеров; не готовая строительная документация.', 'The interactive model and floor plan show an illustrative layout based on your supplied plan. This initial concept can be adjusted once measurements are confirmed; it is not construction documentation.']
  ].forEach(([ru,en]) => phrases.set(ru,en));
  let language = 'ru';
  const originals = new WeakMap();
  function text(value) {
    if (language === 'ru') return value;
    const trimmed = value.trim();
    let result = phrases.get(trimmed);
    if (!result && /^СЦЕНАРИЙ [A-D]$/.test(trimmed)) result = trimmed.replace('СЦЕНАРИЙ', 'LAYOUT');
    if (!result && /^Вид сверху — /.test(trimmed)) result = 'Floor plan — ' + text(trimmed.slice(13));
    if (!result && /^СПОКОЙСТВИЕ\. \/ ВАРИАНТ /.test(trimmed)) result = trimmed.replace('СПОКОЙСТВИЕ. / ВАРИАНТ', 'SERENITY. / LAYOUT').replace(/ТИХИЙ ОТЕЛЬ|МЕСТО ДЛЯ СЕБЯ|МЕДЛЕННОЕ УТРО|ЛИЧНЫЙ РИТУАЛ/g, v => ({'ТИХИЙ ОТЕЛЬ':'QUIET HOTEL','МЕСТО ДЛЯ СЕБЯ':'A PLACE FOR YOURSELF','МЕДЛЕННОЕ УТРО':'SLOW MORNINGS','ЛИЧНЫЙ РИТУАЛ':'YOUR DAILY RITUAL'})[v]);
    if (!result && /^[≈\d–., ×]+ см$/.test(trimmed)) result = trimmed.replace(' см', ' cm');
    if (!result && trimmed === 'дверь 88 см') result = 'door 88 cm';
    if (!result && trimmed.startsWith('Нестандартная комната шириной около 312 см')) result = 'Irregular room, about 312 cm wide and 473 cm long. Two windows on the right; door on the left. Bed at the top wall; sliding wardrobe in the lower niche. Check all measurements against the actual room.';
    return result ? value.replace(trimmed, result) : value;
  }
  function apply(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest('script,style,noscript,textarea,#project-notes,#print-notes,[data-user-content]')) continue;
      let record = originals.get(node);
      if (!record || node.nodeValue !== record.last) record = { ru: node.nodeValue };
      node.nodeValue = language === 'en' ? text(record.ru) : record.ru;
      record.last = node.nodeValue; originals.set(node, record);
    }
    const nodes = [...root.querySelectorAll('[aria-label],[alt],[placeholder],meta[name="description"]')];
    if (root.nodeType === 1) nodes.unshift(root);
    nodes.forEach(node => ['aria-label', 'alt', 'placeholder', ...(node.matches('meta') ? ['content'] : [])].forEach(attribute => {
      if (!node.hasAttribute(attribute)) return;
      const key = 'original' + attribute.replaceAll('-', '');
      const last = key + 'last';
      const value = node.getAttribute(attribute);
      if (!(key in node.dataset) || value !== node.dataset[last]) node.dataset[key] = value;
      const next = language === 'en' ? text(node.dataset[key]) : node.dataset[key];
      node.setAttribute(attribute, next); node.dataset[last] = next;
    }));
  }
  return { text, apply, setLanguage(value) { language = value === 'en' ? 'en' : 'ru'; }, get language() { return language; }, local(pair) { return pair[language === 'en' ? 1 : 0]; } };
})();
