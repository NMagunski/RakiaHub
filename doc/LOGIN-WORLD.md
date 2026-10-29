# Login World — преработка на входа

Промените са ограничени до login страницата, нейния LoginScenery компонент, отделен CSS module и новите активи. Discover, „Наздравици“, auth логиката и production базата не са променяни в тази задача. Не е правен deploy.

## Композиция и ефекти

Login вече не наследява ограничението от 1100 px на общия main. Един непрекъснат пейзаж покрива цялата страница; няма второ готово изображение, multiply слоеве или правоъгълни изрезки. Бутилката със сливи, клонът и дневникът са нови RGBA PNG активи с реална прозрачност. Заглавието и формата са HTML, неподвижни след първоначалната opacity поява. Почти плътният тематичен хартиен панел има 98.5% opacity.

Мъглата е отделен CSS градиентен слой с бавен transform/opacity дрейф; двата клона се поклащат независимо. Паралаксът е ограничен до ±5 px хоризонтално / ±3 px вертикално и обновява CSS променливи чрез requestAnimationFrame. Няма анимиране на основния пейзаж. Без fine pointer/hover паралакс няма; reduced motion изключва CSS анимациите, преходите и паралакса и нулира координатите. Декоративният контейнер се изрязва самостоятелно с overflow:clip; съдържанието на main остава свободно за вертикално превъртане.

Amber използва топла хартия и кехлибарен бутон; Atlas — светла хартия, горско зелено и по-видими картографски линии. Структурата и качеството на активите са общи.

## Реални проверки

- Chrome, точни CSS viewport размери: **390×844, 768×1024, 1440×900, 1920×1080**, двете теми. Осем screenshots при DPR 2, с проверени PNG размери. Не са мокъпи.
- Проверени визуално пълно покритие, липса на правоъгълни шевове и празни странични ленти, спокойна централна зона и четим панел.
- Допълнителен viewport 390×420: вертикално превъртане до полето за парола, бутона и регистрацията; клавиатурен Tab достига бутона; Enter влиза успешно и отвежда към /discover. Декоративното пространство отдолу е увеличено, за да няма застъпване при нисък екран.
- Изолиран тестов профил: невалиден вход → грешка; показване/скриване на парола; забравена парола → „Провери имейла си“; успешен вход → /discover. Реални production потребители/пароли и имейл доставки не са използвани.
- GIF: 24 действителни CUA screenshots за ~13.4 секунди с движение на показалеца и смяна Atlas → Amber. Изрязана е само браузърната лента; движението не е синтетично добавено.
- Проверка на паралакса в записа: след движение на показалеца областта на бутилката има 7 168 променени пиксела, а областта на формата — 0.
- Reduced motion е включено през Chrome Rendering. Сравнение на две content области при еднакъв viewport и тема, през 1.6 секунди: нормално движение **27 266 променени пиксела**, reduced motion **0**. Изключени са DevTools и браузърните ленти от сравнението.
- `node tests/login-artwork.mjs`: трите отделени актива са RGBA; напълно прозрачни пиксели: бутилка 47.0%, клон 68.2%, дневник 35.9%. Максималният alpha по външния ръб е 1/255 — няма видима непрозрачна рамка.
- `npx tsc --noEmit`, `npm run lint`, `npm run build`: успешни. Lint запазва предишното предупреждение за request.current в passport/page.tsx, извън обхвата на тази задача.

## Ограничения

Размерите са проверени в Chrome device emulation, а ниският viewport симулира намалената видима височина при клавиатура. Няма проверка на физически iPhone/Android или Safari. GIF е кратък запис с ограничена честота на кадрите, а не performance benchmark; деликатният паралакс се вижда по-добре в самата страница. Първоначалната поява е реализирана в страницата; GIF започва от вече зареден екран.

## Нови активи и prompts

Генерирани с вградения image_gen инструмент, без CLI/API key. Подбраните активи са копирани в workspace и визуално проверени. Не представят истинска марка или конкретен каталожен продукт.

### world

Файл: `public/images/login/world.png`.

Use case: illustration-story. A single continuous panoramic Balkan landscape for a fullscreen website, 16:9 wide. Refined graphite engraving, colored pencils and subtle watercolor on warm light ivory paper. Composition intentionally FRAMES a completely calm very pale central vertical zone occupying middle 42% across entire height, almost blank ivory mist there for a real HTML login form. Detailed mountain ridges, stone village and distant bridge confined to leftmost and rightmost quarters, low hills along bottom, soft mist merging into central paper. Edges continue naturally beyond canvas, no border, no frame, no rectangular paper sheet. Restrained sage green and warm ochre terrain, muted blue distant mountains. No foreground objects, NO bottle, NO diary, NO fruit, NO lettering, NO UI, no text. Top middle also calm. High quality editorial illustration, spacious cohesive natural scene.

### bottle

Файл: `public/images/login/bottle.png`.

Use case: illustration-story. SINGLE isolated decorative still life asset, genuinely TRANSPARENT background with alpha, no paper rectangle, no background or scenery. Refined colored pencil, graphite linework and subtle watercolor: an elegant squat glass bottle filled with amber plum rakija, wooden cork, blank ivory label with tiny hand drawn mountain only, a few deep indigo blue plums and one cut plum, plum leaves clustered at its base. Entire bottle and all fruit fully within frame. Eye level slightly looking down at stone tabletop level, realistic coherent perspective, gentle small contact shadow immediately under object with translucent edges. Tall 3:4 composition. No text, logos, borders, backdrop, paper sheet, UI, real branding. Crisp authentic pencil texture, warm cream highlights and forest leaves.

### branch

Файл: `public/images/login/branch.png`.

Use case: illustration-story. A single naturally curving plum tree branch with dark olive green leaves, 3 indigo blue plums and a few delicate white blossoms, rendered in exquisite graphite and colored pencil botanical illustration. Genuinely transparent alpha background, isolated cutout, NO paper backdrop, NO square background, no border. Complete branch inside canvas, diagonal graceful branch from lower left to upper right, sparse airy composition with fine stems and natural leaf spacing. Warm cream and muted forest green, harmonious with botanical travel journal drawings. No text or other objects.

### journal

Файл: `public/images/login/journal.png`.

Use case: illustration-story. SINGLE isolated open travel journal / rakija passport, leather cover, cream paper, fine botanical pencil sketches and map contour lines on its open pages, NO legible words, NO UI. Three-quarter perspective seen slightly from above, resting flat on a surface, pages fan gently, spine toward viewer lower left. Genuinely transparent alpha background, no rectangular opaque background or paper sheet beyond book itself, no surrounding scenery. Refined graphite and colored pencils with delicate watercolor and soft natural contact shadow immediately under book. Harmonious warm ivory and dark forest green details, matching an illustrated bottle still life, natural realistic scale. Landscape 3:2 canvas, entire book inside canvas.


[Галерия и запис](../outputs/verification/login-world.html)

