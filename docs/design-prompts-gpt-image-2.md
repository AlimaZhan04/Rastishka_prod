# РАСтишка — промпты для GPT Image 2 (дизайн-макеты сайта)

Коррекционный детский сад для особенных детей (РАС, ЗПРР, ЗРР, СДВГ, синдром Дауна).
Промпты на английском, UI-надписи — на русском в кавычках. Для каждой страницы есть версия **Desktop** и **Mobile**.

---

## Как пользоваться (важно прочитать)

**Соотношения сторон в GPT Image 2:**
- **Desktop** → `1536×1024` (landscape 3:2). Показывает «первый экран» / hero. Для всей страницы целиком генерируйте по секциям или возьмите portrait с рамкой браузера.
- **Mobile** → `1024×1536` (portrait 2:3). Экран телефона.

**Про текст (критично):** GPT Image 2 неточно рендерит длинный кириллический текст — он может «поплыть». Рекомендации:
1. Главные надписи (логотип, заголовки, кнопки) оставляйте в промпте — их модель тянет лучше всего.
2. Мелкий текст (абзацы, описания) считайте «рыбой» — финальные тексты вставляйте уже в Figma/редакторе поверх макета.
3. Если текст сильно искажается — добавьте в конец промпта: `keep all Russian text crisp, legible and correctly spelled` и перегенерируйте 2–3 раза.

**Итерации:** генерируйте 3–4 варианта на промпт, выбирайте лучший по композиции, дорабатывайте текст в редакторе.

---

## 🎨 STYLE CORE (фирменный стиль — встроен в каждый промпт)

> Warm, caring, modern web UI for a children's correctional/developmental kindergarten. Soft pastel palette: deep wine-burgundy **#7E2A3D** (primary — logo & headings), blush pink **#F2C4CB** and pale rose **#F8E3E6** (accents, soft background blobs, little hearts), sage-olive green **#838B72** (secondary accents, leaf shapes), warm cream background **#F7F1EA**, clean white cards **#FFFFFF** with very soft diffuse shadows and large rounded corners (radius 20–28px). Friendly rounded geometric sans-serif for headings, clean humanist sans-serif for body text. Hand-drawn brand motifs used sparingly: the logo = a small sprout growing in a little pot with a tiny heart; thin outline hearts; organic blob shapes; simple line icons (brain, speech bubble, ear, sound wave). Pill-shaped buttons — primary CTA solid burgundy with white text, secondary white/blush with burgundy text. Generous whitespace, airy, gentle, trustworthy, professional yet homey. **NOT** clinical, **NOT** cold-corporate, **NOT** garish or overly childish.

---

# 1. Главная страница (Home)

### 🖥 Desktop
```
UI design mockup of a website landing page (above-the-fold hero + sections), clean Figma-style presentation, 3:2 landscape, web-design quality.

Brand: a warm, caring developmental kindergarten for special-needs children called "РАСтишка". Brand style: soft pastel palette — deep wine-burgundy #7E2A3D (primary, headings & logo), blush pink #F2C4CB and pale rose #F8E3E6 (accents, soft background blobs, hearts), sage-olive green #838B72 (leaves), warm cream background #F7F1EA, white cards with very soft shadows and large rounded corners. Friendly rounded sans-serif headings, clean humanist body text. Hand-drawn motifs used sparingly: a sprout in a little pot with a heart (the logo), thin outline hearts, organic blob shapes. Airy, gentle, trustworthy, professional yet homey. NOT clinical, NOT cold-corporate.

Layout, top to bottom:
- Sticky header on cream: left — logo "РАСтишка" in burgundy rounded script with a little sprout-in-a-pot-with-heart icon; center-right — small round social icons (Instagram, Facebook, Threads) and a phone number "+996 502 114 888"; far right — a solid burgundy pill button "Записаться" (slightly glowing, the primary call to action).
- Hero: large burgundy headline "Детский сад для особенных детей", supporting line in warm grey "Комплексное психолого-педагогическое сопровождение на протяжении всего дня". A soft burgundy CTA pill "Записаться". On the right, a warm bright lifestyle photo of a happy 5–6 year old child in a cozy sensory-friendly room, framed inside an organic blob / rounded shape, with small pink hearts and a sage leaf decoration around it.
- "Для кого мы" section: short caring paragraph, plus a row of 4 soft pill-cards each with a small line icon and label: "РАС", "ЗПРР и ЗРР", "СДВГ", "Синдром Дауна".
- "Варианты посещения" section: 4 white rounded cards in a row, each with an icon and title + time: "Группа полного дня" 8:00–19:00, "Группа утро" 8:00–13:00, "Группа обед" 14:00–19:00, "Индивидуальный график".
- Soft pastel blobs and a few tiny outline hearts scattered subtly in the background corners.

Keep all Russian text crisp, legible and correctly spelled. High-end, calm, trustworthy web design.
```

### 📱 Mobile
```
UI design mockup of a mobile website screen (phone frame), clean Figma-style presentation, 2:3 portrait, web-design quality.

Brand: warm developmental kindergarten for special-needs children "РАСтишка". Style: pastel palette — deep wine-burgundy #7E2A3D (headings/logo), blush pink #F2C4CB & pale rose #F8E3E6 (accents, soft blobs, hearts), sage-olive green #838B72 (leaves), warm cream background #F7F1EA, white cards with soft shadows and large rounded corners. Friendly rounded sans-serif headings. Hand-drawn motifs sparingly: sprout-in-a-pot-with-heart logo, thin outline hearts, organic blobs. Gentle, trustworthy, homey, NOT clinical.

Layout, stacked vertically:
- Top bar: logo "РАСтишка" in burgundy rounded script with little sprout icon (left), a hamburger menu icon (right).
- Hero: warm photo of a happy special-needs child in a cozy room inside an organic rounded shape with small pink hearts; below it burgundy headline "Детский сад для особенных детей" and a warm grey subline; a full-width solid burgundy pill button "Записаться".
- A horizontally scrollable row hint of 4 soft pill chips: "РАС", "ЗПРР", "СДВГ", "Синдром Дауна".
- "Варианты посещения": stacked white rounded cards with icons: "Группа полного дня 8:00–19:00", "Группа утро 8:00–13:00", "Группа обед 14:00–19:00", "Индивидуальный график".
- Subtle pastel blobs in background corners.

Keep all Russian text crisp and correctly spelled. Calm, trustworthy mobile web design.
```

---

# 2. Анкета записи «Записаться» (всплывающее окно)

> Многошаговая анкета (7 шагов): форма посещения → развитие речи → поведение → туалетные навыки → приём пищи → где занимались → контакты. Кнопки «Далее»/«Назад»/«Отправить».

### 🖥 Desktop
```
UI design mockup of a centered modal dialog (multi-step questionnaire) floating over a dimmed, blurred landing page, clean Figma-style, 3:2 landscape.

Brand "РАСтишка" — warm kindergarten for special-needs children. Style: pastel palette — wine-burgundy #7E2A3D (primary), blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream #F7F1EA, white card with soft shadow and large rounded corners (radius 28px). Friendly rounded sans-serif, gentle and trustworthy, NOT clinical.

The modal:
- White rounded card, centered, with a small close "×" top-right and a little sprout-with-heart logo top-left.
- A slim step-progress bar near the top showing step 1 of 7, in burgundy with blush track.
- Title (burgundy): "Выберите подходящую для Вас форму посещения".
- Four selectable option rows as soft rounded pills (radio-style), the first one selected/highlighted in blush with a burgundy check: "Группа полного дня 8:00–19:00", "Группа утро 8:00–13:00", "Группа обед 14:00–19:00", "Индивидуальный график".
- Bottom row: a ghost/secondary pill button "Назад" (white, burgundy text) on the left and a solid burgundy pill button "Далее" on the right.
- A couple of tiny pink outline hearts as subtle decoration in a corner.
- Background: the home page softly blurred and darkened behind the modal.

Keep all Russian text crisp, legible and correctly spelled. Calm, friendly, accessible form design.
```

### 📱 Mobile
```
UI design mockup of a mobile bottom-sheet / full-screen multi-step form, clean Figma-style, 2:3 portrait.

Brand "РАСтишка" — warm kindergarten for special-needs children. Style: pastel palette — wine-burgundy #7E2A3D, blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream #F7F1EA, white surface, large rounded corners, soft shadows. Friendly rounded sans-serif, gentle, trustworthy, NOT clinical.

The screen:
- Top: little sprout-with-heart logo and a close "×".
- Slim burgundy step-progress bar (step 1 of 7) on a blush track.
- Title (burgundy): "Выберите форму посещения".
- Four full-width selectable rounded option cards (radio-style), first one selected in blush with a burgundy check: "Группа полного дня 8:00–19:00", "Группа утро 8:00–13:00", "Группа обед 14:00–19:00", "Индивидуальный график".
- Sticky bottom: full-width solid burgundy pill button "Далее", and a small text link "Назад" above it.
- Subtle pink outline heart decoration.

Keep all Russian text crisp and correctly spelled. Calm, accessible mobile form.
```

> 💡 По аналогии можно сгенерировать финальный шаг анкеты: заголовок «Спасибо за Ваши ответы!», поля «Имя» и «Телефон» (маска +996), кнопка «Отправить».

---

# 3. Наши вакансии (Vacancies)

> Заголовок + текст, карточки вакансий с кнопкой «Откликнуться», разворот карточки с формой отклика (ФИО, телефон, резюме/текст), иконки шеринга.

### 🖥 Desktop
```
UI design mockup of a "Careers / Vacancies" web page, clean Figma-style, 3:2 landscape, web-design quality.

Brand "РАСтишка" — warm kindergarten for special-needs children. Style: pastel palette — wine-burgundy #7E2A3D (headings), blush pink #F2C4CB & pale rose #F8E3E6 (accents/hearts), sage-olive #838B72, cream background #F7F1EA, white cards with soft shadows and large rounded corners. Friendly rounded sans-serif headings, clean body text, sprout-with-heart logo, subtle outline hearts and blobs. Gentle, trustworthy, homey, NOT clinical.

Layout:
- Same sticky header as the site: logo "РАСтишка", social icons, phone, burgundy "Записаться" pill.
- Section title (burgundy): "Наши вакансии", with a warm subtitle line: "Для наших самых прекрасных и особенных деток мы постоянно подбираем и расширяем команду специалистов".
- A responsive grid of 3 white rounded vacancy cards. Each card: a small role icon / pastel circle at top, a burgundy job title (e.g. "Логопед-дефектолог", "Психолог", "АФК-инструктор"), a short grey preview line, and a solid burgundy pill button "Откликнуться".
- On the right or below, one card shown expanded into a detail panel with subheadings "Обязанности", "Требования", "Мы предлагаем", a short application form (fields "ФИО", "Телефон +996", an "Прикрепить резюме" upload chip), a burgundy "Отправить" pill, and a small row of share icons (Instagram, Facebook, Threads).
- Soft pastel blobs and tiny hearts in background corners.

Keep all Russian text crisp, legible and correctly spelled. Warm, professional careers page.
```

### 📱 Mobile
```
UI design mockup of a mobile "Vacancies" screen, clean Figma-style, 2:3 portrait.

Brand "РАСтишка" — warm kindergarten for special-needs children. Style: pastel palette — wine-burgundy #7E2A3D, blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream #F7F1EA, white cards, soft shadows, large rounded corners, rounded sans-serif, sprout-with-heart logo, subtle hearts. Gentle, trustworthy, NOT clinical.

Layout, stacked:
- Top bar: logo "РАСтишка" + hamburger menu.
- Burgundy title "Наши вакансии" and a short warm subtitle "Мы расширяем команду специалистов для особенных деток".
- A vertical stack of white rounded vacancy cards, each with a pastel role icon, burgundy job title (e.g. "Логопед-дефектолог", "Психолог"), a short grey preview line, and a full-width burgundy pill button "Откликнуться".
- The first card shown expanded with subheadings "Обязанности", "Требования", "Мы предлагаем", compact form fields "ФИО" and "Телефон", a burgundy "Отправить" pill, and small share icons (Instagram, Facebook, Threads).
- Subtle pastel blobs.

Keep all Russian text crisp and correctly spelled. Warm, professional mobile careers screen.
```

---

# 4. Новости и объявления (News & Announcements)

> Карточки: картинка, заголовок, дата (авто), текст, иконки шеринга. Ротация на главной по дате.

### 🖥 Desktop
```
UI design mockup of a "News & Announcements" web page, clean Figma-style, 3:2 landscape, web-design quality.

Brand "РАСтишка" — warm kindergarten for special-needs children. Style: pastel palette — wine-burgundy #7E2A3D (headings), blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream background #F7F1EA, white cards with soft shadows and large rounded corners. Rounded sans-serif headings, sprout-with-heart logo, subtle outline hearts and blobs. Gentle, trustworthy, homey, NOT clinical.

Layout:
- Same sticky site header: logo "РАСтишка", social icons, phone, burgundy "Записаться" pill.
- Burgundy section title "Новости и объявления".
- One large featured news card on top: a warm rounded photo of a kindergarten activity (children doing art / sensory play), a burgundy headline, a small date pill "12 июня 2026", a short text excerpt, and small share icons (Instagram, Facebook, Threads).
- Below, a responsive grid of 3 smaller news cards, each: rounded photo at top, burgundy title, a small grey date, a 2-line excerpt, and a "Читать" link in burgundy.
- Soft pastel blobs and tiny hearts subtly in background corners.

Keep all Russian text crisp, legible and correctly spelled. Warm, clean editorial/news layout.
```

### 📱 Mobile
```
UI design mockup of a mobile "News & Announcements" feed, clean Figma-style, 2:3 portrait.

Brand "РАСтишка" — warm kindergarten for special-needs children. Style: pastel palette — wine-burgundy #7E2A3D, blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream #F7F1EA, white cards, soft shadows, large rounded corners, rounded sans-serif, sprout-with-heart logo, subtle hearts. Gentle, trustworthy, NOT clinical.

Layout, stacked:
- Top bar: logo "РАСтишка" + hamburger menu.
- Burgundy title "Новости и объявления".
- A vertical feed of white rounded news cards, each: a warm rounded photo of a kindergarten activity at top, a small date pill (e.g. "12 июня"), a burgundy headline, a 2-line grey excerpt, and a small row of share icons (Instagram, Facebook, Threads).
- Subtle pastel blobs in background.

Keep all Russian text crisp and correctly spelled. Warm, clean mobile news feed.
```

---

# 5. Фирменные товары (Branded Products)

> Товары с рисунками детей. Вся прибыль — в фонд развития. Карточки: картинка, описание, размер, цвет, цена, количество, сумма, ФИО, телефон, «Отправить», шеринг.

### 🖥 Desktop — каталог
```
UI design mockup of an e-commerce "Branded Products" catalog web page, clean Figma-style, 3:2 landscape, web-design quality.

Brand "РАСтишка" — warm kindergarten for special-needs children; the products feature drawings made BY the children (tote bags, t-shirts, mugs, notebooks printed with colorful childlike crayon/marker drawings). Style: pastel palette — wine-burgundy #7E2A3D (headings), blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream background #F7F1EA, white product cards with soft shadows and large rounded corners. Rounded sans-serif headings, sprout-with-heart logo, subtle hearts and blobs. Warm, heartfelt, trustworthy, NOT clinical.

Layout:
- Same sticky site header: logo "РАСтишка", social icons, phone, burgundy "Записаться" pill.
- Burgundy section title "Фирменные товары" with a warm subtitle: "Уникальность товаров — это рисунки наших детей. Вся прибыль идёт в фонд развития детей".
- A responsive grid of 4 white rounded product cards. Each card: a photo of a product (tote bag / t-shirt / mug) printed with a colorful childlike drawing, a burgundy product name, a short grey line, a price in burgundy (e.g. "500 сом"), and a soft burgundy pill button "Купить".
- A small warm banner ribbon noting the charity purpose, with a tiny heart and sprout icon.
- Soft pastel blobs and tiny hearts in background corners.

Keep all Russian text crisp, legible and correctly spelled. Warm, heartfelt e-commerce design.
```

### 🖥 Desktop — карточка товара + форма заказа
```
UI design mockup of a single product detail page with an order form, clean Figma-style, 3:2 landscape.

Brand "РАСтишка" — warm kindergarten for special-needs children; product features a child's colorful drawing. Style: pastel palette — wine-burgundy #7E2A3D, blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream #F7F1EA, white cards, soft shadows, large rounded corners, rounded sans-serif, subtle hearts. Warm, heartfelt, NOT clinical.

Layout, two columns:
- Left: large rounded photo of the product (e.g. a tote bag) printed with a colorful childlike drawing, plus 3 small thumbnail images below.
- Right: burgundy product title, a description block "кто нарисовал, что означает, состав, размеры"; a size selector as rounded chips "Размер" (S / M / L / OneSize); a color selector "Цвет" as small color dots; a quantity stepper "Количество"; a highlighted total "Сумма покупки: 1000 сом"; compact fields "ФИО" and "Телефон +996"; a solid burgundy pill button "Отправить"; and small share icons (Instagram, Facebook, Threads).
- A subtle line: "Вся прибыль идёт в фонд развития детей" with a tiny heart.

Keep all Russian text crisp, legible and correctly spelled. Warm, trustworthy product page.
```

### 📱 Mobile
```
UI design mockup of a mobile product catalog + product card, clean Figma-style, 2:3 portrait.

Brand "РАСтишка" — warm kindergarten for special-needs children; products feature children's colorful drawings. Style: pastel palette — wine-burgundy #7E2A3D, blush pink #F2C4CB & pale rose #F8E3E6, sage-olive #838B72, cream #F7F1EA, white cards, soft shadows, large rounded corners, rounded sans-serif, sprout-with-heart logo, subtle hearts. Warm, heartfelt, NOT clinical.

Layout, stacked:
- Top bar: logo "РАСтишка" + hamburger menu.
- Burgundy title "Фирменные товары" and a short subtitle "Рисунки наших детей. Прибыль — в фонд развития".
- A 2-column grid of white rounded product cards: photo of a product (tote/t-shirt/mug) with a colorful childlike drawing, burgundy name, price "500 сом", small burgundy "Купить" pill.
- Below, one expanded product card with size chips "Размер", color dots "Цвет", quantity stepper, total "Сумма покупки", fields "ФИО" and "Телефон", a full-width burgundy "Отправить" pill, and small share icons.
- Subtle pastel blobs.

Keep all Russian text crisp and correctly spelled. Warm, heartfelt mobile shop.
```

---

# 6. (Бонус) Админ-панель (Admin Panel)

> Роли: администратор (всё) и контент-менеджер (новости, вакансии, товары). Дашборд с заявками/заказами и уведомлениями. Обычно только десктоп.

### 🖥 Desktop
```
UI design mockup of a clean admin dashboard (CMS back-office), Figma-style, 3:2 landscape, web-app quality.

Brand "РАСтишка" — kindergarten for special-needs children. Calm, professional, light admin theme inspired by the brand: wine-burgundy #7E2A3D accents and active states, blush pink #F2C4CB highlights, sage-olive #838B72 secondary, soft cream/white #F7F1EA/#FFFFFF surfaces, large rounded corners, soft shadows, rounded sans-serif. Functional but warm, NOT flashy, NOT childish.

Layout:
- Left vertical sidebar (white) with the sprout-with-heart logo at top and a nav menu with line icons: "Заявки", "Заказы", "Новости", "Вакансии", "Товары", "Пользователи" — the "Заявки" item active in burgundy.
- Top bar: page title "Заявки на запись", a search field, and a small user avatar with role label "Администратор".
- Main area: 3 small KPI stat cards ("Новые заявки", "Заказы", "Отклики") with numbers in burgundy; below, a clean data table of incoming requests with columns "Имя", "Телефон", "Форма посещения", "Дата", "Статус" (status as small colored pills), and a small "Открыть" action.
- A subtle notification toast card top-right: "Новая заявка — отправлено в Telegram", with a tiny burgundy bell icon.

Keep all Russian text crisp, legible and correctly spelled. Calm, professional CMS dashboard.
```

---

## ✅ Чек-лист соответствия ТЗ

| Страница | Промпт есть | Ключевые блоки из ТЗ |
|---|---|---|
| Главная | ✅ Desktop + Mobile | Header, hero, «Для кого мы», 4 формы посещения, «Записаться» |
| Анкета записи | ✅ Desktop + Mobile | Многошаговая форма, «Далее/Назад», контакты |
| Наши вакансии | ✅ Desktop + Mobile | Заголовок+текст, карточки, «Откликнуться», форма, шеринг |
| Новости и объявления | ✅ Desktop + Mobile | Картинка, заголовок, дата, текст, шеринг |
| Фирменные товары | ✅ Desktop ×2 + Mobile | Каталог, карточка, размер/цвет/кол-во/сумма, форма, шеринг |
| Админ-панель | ✅ Desktop (бонус) | Роли, заявки/заказы, уведомления в Telegram |

## Советы по доработке
- Для цельного вида сайта генерируйте **hero** отдельно от **секций** и собирайте композицию в Figma.
- Реальные фото детей/занятий из Instagram-исходников можно вставлять вместо сгенерированных в местах, где в промпте указано «warm photo».
- Если нужен единый «дизайн-гайд» одной картинкой — попросите, сделаю промпт для style-guide / UI-kit (палитра, кнопки, типографика, иконки на одном холсте).
