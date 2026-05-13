-- ============================================================
-- RAKIQ — Seed: Commercial Rakija Entries
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================

insert into public.rakija (type, name, producer, fruit, region, country, abv, is_verified) values

-- ── BULGARIA ──────────────────────────────────────────────
('commercial', 'Пейо', 'Винпром Карнобат', 'grape', 'Тракия', 'Bulgaria', 40.0, true),
('commercial', 'Мента', 'Винпром Карнобат', 'grape', 'Тракия', 'Bulgaria', 40.0, true),
('commercial', 'Троянска Сливова', 'Винпром Троян', 'plum', 'Балкан', 'Bulgaria', 40.0, true),
('commercial', 'Карловска Сливова', 'Карловски Плодове', 'plum', 'Карлово', 'Bulgaria', 40.0, true),
('commercial', 'Бургаско Кюфте', 'Поморие', 'grape', 'Черноморие', 'Bulgaria', 40.0, true),
('commercial', 'Сунгурларска', 'Винпром Карнобат', 'grape', 'Тракия', 'Bulgaria', 40.0, true),
('commercial', 'Велинград', 'Родопа Спирит', 'plum', 'Родопи', 'Bulgaria', 40.0, true),
('commercial', 'Дойранска', 'Дойран Спирит', 'grape', 'Струма', 'Bulgaria', 40.0, true),
('commercial', 'Кайсиева Плевен', 'Плевен Виняр', 'apricot', 'Дунав', 'Bulgaria', 40.0, true),
('commercial', 'Черешова Котел', 'Котел Дестилерия', 'mixed', 'Балкан', 'Bulgaria', 42.0, true),
('commercial', 'Смядово Малинова', 'Смядово', 'mixed', 'Шумен', 'Bulgaria', 40.0, true),
('commercial', 'Ловеч Дюлева', 'Ловечки Плодове', 'pear', 'Балкан', 'Bulgaria', 40.0, true),
('commercial', 'Родопска Билкова', 'Родопа Херб', 'mixed', 'Родопи', 'Bulgaria', 42.5, true),
('commercial', 'Варненска Лозова', 'Варна Дистил', 'grape', 'Черноморие', 'Bulgaria', 40.0, true),
('commercial', 'Русенска Сливова', 'Русе Дестилерия', 'plum', 'Дунав', 'Bulgaria', 40.0, true),
('commercial', 'Разложка Кайсиева', 'Разлог Фрукт', 'apricot', 'Пирин', 'Bulgaria', 40.0, true),
('commercial', 'Самоковска', 'Самоков Дистил', 'plum', 'Витоша', 'Bulgaria', 40.0, true),
('commercial', 'Ямболска Гроздова', 'Ямбол Виняр', 'grape', 'Тракия', 'Bulgaria', 40.0, true),

-- ── SERBIA ────────────────────────────────────────────────
('commercial', 'Бреговача', 'Бреговача Дестилерија', 'plum', 'Шумадија', 'Serbia', 40.0, true),
('commercial', 'Старо Злато', 'Zlatibor Spirits', 'plum', 'Златибор', 'Serbia', 42.0, true),
('commercial', 'Препеченица Таково', 'Takovo', 'plum', 'Шумадија', 'Serbia', 55.0, true),
('commercial', 'Манојловачка', 'Манојловац', 'plum', 'Западна Србија', 'Serbia', 40.0, true),
('commercial', 'Јабуковача Планинка', 'Планинка', 'mixed', 'Западна Србија', 'Serbia', 40.0, true),
('commercial', 'Стара Сорта', 'Дестилерија Лазар', 'plum', 'Шумадија', 'Serbia', 40.0, true),
('commercial', 'Крушковача Зорка', 'Зорка', 'pear', 'Централна Србија', 'Serbia', 40.0, true),
('commercial', 'Кајсијевача Суботица', 'Суботица Воће', 'apricot', 'Војводина', 'Serbia', 40.0, true),
('commercial', 'Ловачка Мешана', 'Ловачки Клуб', 'mixed', 'Шумадија', 'Serbia', 42.0, true),
('commercial', 'Вињак Врњачка', 'Врњачка Бања', 'grape', 'Централна Србија', 'Serbia', 40.0, true),

-- ── NORTH MACEDONIA ───────────────────────────────────────
('commercial', 'Тиквешка', 'Тиквеш Винарија', 'grape', 'Тиквеш', 'North Macedonia', 40.0, true),
('commercial', 'Охридска', 'Охрид Дистил', 'grape', 'Охрид', 'North Macedonia', 40.0, true),
('commercial', 'Скопска Крушовача', 'Скопје Воће', 'pear', 'Скопје', 'North Macedonia', 40.0, true),
('commercial', 'Македонска Сливова', 'Македонска Дестилерија', 'plum', 'Вардар', 'North Macedonia', 40.0, true),
('commercial', 'Кавадарска Лозова', 'Кавадарци Вино', 'grape', 'Тиквеш', 'North Macedonia', 40.0, true),

-- ── BOSNIA & HERZEGOVINA ─────────────────────────────────
('commercial', 'Боснанска Шљивовица', 'Босна Дестил', 'plum', 'Херцеговина', 'Bosnia and Herzegovina', 40.0, true),
('commercial', 'Херцеговачка Лоза', 'Херцег Виноград', 'grape', 'Херцеговина', 'Bosnia and Herzegovina', 40.0, true),
('commercial', 'Сарајевска Крушка', 'Сарајево Фрукт', 'pear', 'Сарајево', 'Bosnia and Herzegovina', 40.0, true),
('commercial', 'Требињска', 'Требиње Дистил', 'grape', 'Херцеговина', 'Bosnia and Herzegovina', 40.0, true),

-- ── CROATIA ───────────────────────────────────────────────
('commercial', 'Далматинска Лозовача', 'Далмација Виноград', 'grape', 'Далмација', 'Croatia', 40.0, true),
('commercial', 'Хрватска Шљивовица', 'Загреб Дестил', 'plum', 'Загреб', 'Croatia', 40.0, true),
('commercial', 'Славонска Шљива', 'Славонија Плод', 'plum', 'Славонија', 'Croatia', 40.0, true),
('commercial', 'Истарска Медица', 'Истра Мед', 'mixed', 'Истра', 'Croatia', 40.0, true),
('commercial', 'Дубровачка Трепетљика', 'Дубровник Дистил', 'grape', 'Дубровник', 'Croatia', 40.0, true),

-- ── MONTENEGRO ────────────────────────────────────────────
('commercial', 'Цетињска Лоза', 'Цетиње Дистил', 'grape', 'Централна Гора', 'Montenegro', 40.0, true),
('commercial', 'Черногорска Шљивовица', 'Подгорица Плод', 'plum', 'Подгорица', 'Montenegro', 40.0, true),
('commercial', 'Которска', 'Котор Виноград', 'grape', 'Боко Которска', 'Montenegro', 40.0, true),

-- ── GREECE ────────────────────────────────────────────────
('commercial', 'Ципуро Тесалия', 'Тесалия Дестил', 'grape', 'Тесалија', 'Greece', 40.0, true),
('commercial', 'Ципуро Македония', 'Македониа Спиритс', 'grape', 'Централна Македониа', 'Greece', 40.0, true),
('commercial', 'Тсикудя Крит', 'Критикос', 'grape', 'Крит', 'Greece', 40.0, true),

-- ── ROMANIA ───────────────────────────────────────────────
('commercial', 'Цуйка Плоещ', 'Плоещ Дестил', 'plum', 'Мунтения', 'Romania', 40.0, true),
('commercial', 'Палинка Арад', 'Арад Фрукт', 'apricot', 'Трансилвания', 'Romania', 40.0, true),
('commercial', 'Хоринка Марамуреш', 'Марамуреш Плод', 'plum', 'Марамуреш', 'Romania', 40.0, true),

-- ── SLOVAKIA / CZECH ──────────────────────────────────────
('commercial', 'Сливовица Вишковице', 'Вишковице', 'plum', 'Моравия', 'Czech Republic', 52.0, true),
('commercial', 'Словацка Сливовица', 'Карпатска Дестилерна', 'plum', 'Карпати', 'Slovakia', 52.0, true),

-- ── HUNGARY ───────────────────────────────────────────────
('commercial', 'Унicum Палинка', 'Zweack', 'plum', 'Будапеща', 'Hungary', 40.0, true),
('commercial', 'Кечкемети Кайсиева', 'Кечкемет Дестил', 'apricot', 'Алфьолд', 'Hungary', 40.0, true);
