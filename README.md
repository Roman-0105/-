# Химический анализ воды — RG Gold

Аналитический веб-портал для просмотра результатов химического анализа воды.

## Быстрый старт

### 1. Создайте проект в Supabase

1. Зайдите на [supabase.com](https://supabase.com) → **New project**
2. Выберите регион (ближайший), задайте пароль БД
3. Дождитесь создания проекта (~1 мин)

### 2. Создайте таблицы и загрузите данные

В Supabase откройте **SQL Editor** и выполните файлы по порядку:

1. `schema.sql` — создаёт таблицы и представления
2. `seed.sql` — загружает все 16 проб, 49 параметров, нормы ПДК

### 3. Настройте доступ (RLS)

В SQL Editor выполните:

```sql
-- Разрешить чтение всем (анонимный доступ)
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE sampling_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE norms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all" ON samples FOR SELECT USING (true);
CREATE POLICY "read_all" ON measurements FOR SELECT USING (true);
CREATE POLICY "read_all" ON parameters FOR SELECT USING (true);
CREATE POLICY "read_all" ON sampling_points FOR SELECT USING (true);
CREATE POLICY "read_all" ON protocols FOR SELECT USING (true);
CREATE POLICY "read_all" ON norms FOR SELECT USING (true);
```

### 4. Заполните config.js

В Supabase: **Settings → API**. Скопируйте:
- **Project URL** → `SUPABASE_URL`
- **anon public key** → `SUPABASE_ANON_KEY`

```js
// config.js
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 5. Разместите на GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите файлы из папки `app/` в корень репозитория
3. **Settings → Pages → Source: Deploy from a branch → main / root**
4. Сайт будет доступен по адресу: `https://ваш-логин.github.io/имя-репозитория`

## Локальная разработка

```bash
# Вариант 1: Python
python3 -m http.server 8080

# Вариант 2: Node.js
npx live-server

# Вариант 3: VS Code
# Установите расширение "Live Server" и нажмите "Go Live"
```

## Структура файлов

```
app/
├── index.html    # SPA с 5 вкладками
├── style.css     # Стили (тема RG Gold)
├── config.js     # Supabase credentials
└── app.js        # Вся логика, Chart.js, данные

schema.sql        # Схема БД (8 таблиц + 2 представления)
seed.sql          # Все данные из 5 протоколов
analytics.sql     # 8 аналитических запросов
```

## Вкладки портала

| Вкладка | Описание |
|---------|----------|
| 📊 Дашборд | KPI-карточки, сводная таблица, сравнение серий |
| 🧪 Пробы | Реестр всех проб с фильтрами и детализацией |
| ⚠️ Превышения ПДК | Все нарушения норм с кратностью |
| 📈 Сравнение | 6 графиков по ключевым показателям |
| ➕ Ввод данных | Форма ввода + загрузка CSV |

## Демо-режим

Если Supabase не подключён — приложение автоматически загружает демо-данные (все 16 проб из протоколов серий 334 и 354).
