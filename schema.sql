-- ============================================================
--  ХИМИЧЕСКАЯ БАЗА ДАННЫХ — ТОО «RG Gold» / EcoExpert
--  Схема PostgreSQL (совместима с Supabase)
-- ============================================================

-- ─── Расширения ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Справочники ────────────────────────────────────────────

-- Заказчики
CREATE TABLE clients (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    bin         TEXT,
    contact     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Лаборатории
CREATE TABLE laboratories (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    accreditation   TEXT,              -- номер аттестата
    accred_valid_to DATE,
    city            TEXT,
    address         TEXT
);

-- Категории показателей
CREATE TABLE parameter_categories (
    id      SERIAL PRIMARY KEY,
    code    TEXT UNIQUE NOT NULL,  -- 'organoleptic','physico_chem','cation','anion','metal','other'
    name_ru TEXT NOT NULL
);

-- Справочник показателей (параметров)
CREATE TABLE parameters (
    id          SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES parameter_categories(id),
    name_ru     TEXT NOT NULL,
    formula     TEXT,              -- химическая формула / обозначение
    unit        TEXT NOT NULL,     -- единица измерения
    norm_doc    TEXT,              -- нормативный документ (ГОСТ/СТ РК)
    description TEXT
);

-- Справочник точек отбора
CREATE TABLE sampling_points (
    id          SERIAL PRIMARY KEY,
    code        TEXT UNIQUE NOT NULL,   -- уникальный код точки
    name        TEXT NOT NULL,
    type        TEXT,   -- 'скважина','зумпф','фильтр','водокачка','водонаброс'
    location    TEXT,   -- населённый пункт / объект
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    description TEXT
);

-- ─── Протоколы и пробы ──────────────────────────────────────

-- Протоколы испытаний
CREATE TABLE protocols (
    id              SERIAL PRIMARY KEY,
    number          TEXT UNIQUE NOT NULL,   -- например '334/4'
    series          TEXT,                   -- '334' или '354'
    lab_id          INTEGER REFERENCES laboratories(id),
    client_id       INTEGER REFERENCES clients(id),
    registration_no TEXT,                   -- рег. номер заказа (№334, №354)
    sampling_date_from DATE,
    sampling_date_to   DATE,
    receipt_date       DATE,
    test_date_from     DATE,
    test_date_to       DATE,
    total_samples      INTEGER,
    test_type          TEXT DEFAULT 'Гигиенические',
    conditions         TEXT,               -- температура, влажность
    analysis_methods   TEXT,
    issued_at          DATE,
    total_pages        INTEGER,
    notes              TEXT
);

-- Пробы (образцы)
CREATE TABLE samples (
    id              SERIAL PRIMARY KEY,
    lab_number      INTEGER UNIQUE NOT NULL,  -- лабораторный номер
    client_number   INTEGER,                  -- № пробы заказчика
    protocol_id     INTEGER REFERENCES protocols(id),
    point_id        INTEGER REFERENCES sampling_points(id),
    sample_type     TEXT DEFAULT 'Вода',
    sampling_date   DATE,
    notes           TEXT
);

-- ─── Результаты измерений ────────────────────────────────────

CREATE TABLE measurements (
    id              SERIAL PRIMARY KEY,
    sample_id       INTEGER NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
    parameter_id    INTEGER NOT NULL REFERENCES parameters(id),
    raw_value       TEXT NOT NULL,          -- исходное значение из протокола (напр. '<0,010')
    numeric_value   DOUBLE PRECISION,       -- числовое значение (NULL если '<')
    is_less_than    BOOLEAN DEFAULT FALSE,  -- TRUE если значение вида '<X'
    norm_doc        TEXT,                   -- НД на определение (из протокола)
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (sample_id, parameter_id)
);

-- ─── Нормативы (ПДК) ─────────────────────────────────────────

CREATE TABLE norms (
    id              SERIAL PRIMARY KEY,
    parameter_id    INTEGER NOT NULL REFERENCES parameters(id),
    norm_type       TEXT NOT NULL,     -- 'питьевая', 'хозяйственная', 'рыбохозяйственная'
    limit_value     DOUBLE PRECISION,
    limit_type      TEXT DEFAULT '≤',  -- '≤', '≥', '='
    unit            TEXT,
    norm_doc        TEXT,
    notes           TEXT
);

-- ─── Вспомогательные представления ──────────────────────────

-- Полный разворот результатов
CREATE OR REPLACE VIEW v_measurements_full AS
SELECT
    p.number                        AS protocol,
    p.series,
    p.issued_at                     AS protocol_date,
    s.lab_number,
    s.client_number,
    sp.code                         AS point_code,
    sp.name                         AS point_name,
    sp.type                         AS point_type,
    sp.location,
    s.sampling_date,
    pc.name_ru                      AS category,
    pr.name_ru                      AS parameter,
    pr.formula,
    pr.unit,
    m.raw_value,
    m.numeric_value,
    m.is_less_than,
    m.norm_doc
FROM measurements m
JOIN samples s       ON s.id = m.sample_id
JOIN protocols p     ON p.id = s.protocol_id
JOIN sampling_points sp ON sp.id = s.point_id
JOIN parameters pr   ON pr.id = m.parameter_id
JOIN parameter_categories pc ON pc.id = pr.category_id;

-- Сводная таблица по pH, минерализации, жёсткости
CREATE OR REPLACE VIEW v_summary AS
SELECT
    s.lab_number,
    sp.name                 AS point_name,
    sp.type                 AS point_type,
    sp.location,
    p.number                AS protocol,
    MAX(CASE WHEN pr.formula = 'pH_lab'    THEN m.numeric_value END) AS ph_lab,
    MAX(CASE WHEN pr.formula = 'pH_field'  THEN m.numeric_value END) AS ph_field,
    MAX(CASE WHEN pr.formula = 'TDS'       THEN m.numeric_value END) AS mineralization_mg_l,
    MAX(CASE WHEN pr.formula = 'TH'        THEN m.numeric_value END) AS hardness_meq_l,
    MAX(CASE WHEN pr.formula = 'Cl-'       THEN m.numeric_value END) AS chlorides_mg_l,
    MAX(CASE WHEN pr.formula = 'SO4'       THEN m.numeric_value END) AS sulfates_mg_l,
    MAX(CASE WHEN pr.formula = 'Fe_total'  THEN m.numeric_value END) AS fe_total_mg_l,
    MAX(CASE WHEN pr.formula = 'NO3-'      THEN m.numeric_value END) AS nitrates_mg_l,
    MAX(CASE WHEN pr.formula = 'Na+'       THEN m.numeric_value END) AS sodium_mg_l
FROM measurements m
JOIN samples s       ON s.id = m.sample_id
JOIN protocols p     ON p.id = s.protocol_id
JOIN sampling_points sp ON sp.id = s.point_id
JOIN parameters pr   ON pr.id = m.parameter_id
GROUP BY s.lab_number, sp.name, sp.type, sp.location, p.number;

-- ─── Индексы ─────────────────────────────────────────────────

CREATE INDEX idx_measurements_sample   ON measurements(sample_id);
CREATE INDEX idx_measurements_param    ON measurements(parameter_id);
CREATE INDEX idx_samples_protocol      ON samples(protocol_id);
CREATE INDEX idx_samples_point         ON samples(point_id);
CREATE INDEX idx_measurements_numeric  ON measurements(numeric_value);
