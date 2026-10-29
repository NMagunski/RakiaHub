# RAKIQ — одобрени продуктови илюстрации

На 29.10.2026 потребителят избра цветната моливна серия: обща бутилка,
ботанически детайли, щрих и хартия. Използван е вграденият **image_gen** инструмент,
без външен CLI/API ключ. Това са генерирани илюстрации, не фотографии на реални
търговски продукти. Няма копирани търговски етикети или изображения от магазини.

## Готови файлове

Всички окончателни PNG са в `public/images/editorial/` и са включени през
`ProductArtwork` в каталога, продукта и паспорта. Next Image подава подходящ
размер и оптимизиран формат. Оригиналните PNG се запазват като изходни assets.

| Файл | Употреба |
|---|---|
| `plum-sketch.png` | Слива — избрана от потребителя |
| `grape-sketch.png` | Грозде — избрана от потребителя |
| `apricot-sketch.png` | Кайсия |
| `pear-sketch.png` | Круша |
| `quince-sketch.png` | Дюля |
| `fig-sketch.png` | Смокиня |
| `mixed-sketch.png` | Смесени плодове |
| `neutral-sketch.png` | Друг или неизвестен плод |

Компонентът дава приоритет на реална продуктова снимка само когато има
`image_url`, `image_rights` и `image_source`; атрибуцията е видима, а на
продуктовата страница има връзка към източника. Илюстрациите имат пояснение и
alt текст; имената на действителните продукти се рисуват като HTML.

Предишните фотографски концепции са преместени в `outputs/imagegen/concepts/`
и не се обслужват от приложението. Предишните screenshots с тях са архивни.

## Финален prompt — първите три илюстрации

Референцията за всяка е съответната авторска фотографска концепция на обща
бутилка, създадена в тази сесия. `fruit` е plum, grape или apricot; съответното
описание е purple plums / green grapes and vine leaves / golden apricots.

> Use case: style-transfer. Convert this original RAKIQ concept image into an
> exquisite editorial colored-pencil and graphite botanical sketch on warm ivory
> paper. Keep the centered generic bottle and [fruit description] as the central
> still life, with detailed hand-drawn hatching, organic pencil grain, subtle
> muted transparent watercolor accents in olive and amber. Remove the photographic
> village and mountain background entirely, replace with clean ivory paper with
> only faint botanical pencil lines in the corners. The result must unmistakably
> look like a beautiful handmade pencil sketch, NOT a photograph or photorealistic
> rendering. No commercial label or brand imitation. Bottle label contains only a
> very simple fine-line mountain drawing; remove RAKIQ text, no text anywhere.
> Entire bottle visible with negative space at sides, landscape 3:2 composition.
> Premium restrained book illustration for a rakia tasting journal; actual product
> name will be rendered separately in HTML.

## Финален prompt — разширяване на серията

Референция: избраната `plum-sketch.png`. Използвани са пет отделни image_gen
заявки с общия prompt и предметите в таблицата.

> Use case: style-transfer and precise-object-edit. Reference image is the
> user-approved RAKIQ editorial sketch style. Create a sibling landscape 3:2
> illustration in exactly the same refined colored-pencil, graphite hatching
> and subtle transparent watercolor style on warm textured ivory paper. Keep
> the high-quality hand-drawn generic clear spirit bottle with amber-gold liquid,
> wooden cork, ivory label with a simple mountain line drawing and NO text.
> Replace ALL plums, plum branches and plum corner decorations with [subject].
> Match the reference's composition: entire bottle centered and visible, fruit
> clustered at the base, delicate faint botanical pencil studies in the top
> corners, generous ivory breathing room. Same scale and visual weight,
> restrained amber and olive palette. This must look like an illustrated tasting
> journal plate, not a photograph. No actual commercial packaging, no branding,
> no lettering, no watermark.

| Вариант | Subject |
|---|---|
| pear | ripe green-yellow pears, one sliced to show the pear core, and pear leaves |
| quince | golden quinces with their characteristic irregular rounded shapes, one cut in half, and broad quince leaves |
| fig | purple figs with a cut fig showing its pink-red seed-filled interior, and recognizable lobed fig leaves |
| mixed | a restrained arrangement of purple plums, green grapes, one apricot and one pear with a few leaves |
| neutral | only a few botanical leaves at the base, NO fruit, so the illustration does not claim an unknown ingredient |

Всеки резултат е прегледан визуално преди включване. Общата ботаническа украса
е художествена и не е доказателство за състав или произход.
