-- ============================================================
--  АНАЛИТИЧЕСКИЕ ЗАПРОСЫ — химическая БД
-- ============================================================

-- ─── 1. СВОДНАЯ ТАБЛИЦА ключевых показателей по всем пробам ──
SELECT
    s.lab_number                            AS "Лаб. №",
    sp.name                                 AS "Точка отбора",
    sp.type                                 AS "Тип",
    sp.location                             AS "Объект",
    p.number                                AS "Протокол",
    MAX(CASE WHEN pr.formula='pH_lab'    THEN m.raw_value END) AS "pH (лаб)",
    MAX(CASE WHEN pr.formula='TDS'       THEN m.raw_value END) AS "Минерализация, мг/дм³",
    MAX(CASE WHEN pr.formula='TH'        THEN m.raw_value END) AS "Жёсткость, мг-экв/дм³",
    MAX(CASE WHEN pr.formula='Cl-'       THEN m.raw_value END) AS "Хлориды, мг/дм³",
    MAX(CASE WHEN pr.formula='SO4'       THEN m.raw_value END) AS "Сульфаты, мг/дм³",
    MAX(CASE WHEN pr.formula='Fe_total'  THEN m.raw_value END) AS "Fe общ., мг/дм³",
    MAX(CASE WHEN pr.formula='NO3-'      THEN m.raw_value END) AS "Нитраты, мг/дм³",
    MAX(CASE WHEN pr.formula='NO2-'      THEN m.raw_value END) AS "Нитриты, мг/дм³",
    MAX(CASE WHEN pr.formula='NH4+'      THEN m.raw_value END) AS "Аммоний, мг/дм³",
    MAX(CASE WHEN pr.formula='F-'        THEN m.raw_value END) AS "Фториды, мг/дм³",
    MAX(CASE WHEN pr.formula='Mn'        THEN m.raw_value END) AS "Mn, мг/дм³",
    MAX(CASE WHEN pr.formula='OilProd'   THEN m.raw_value END) AS "Нефтепродукты"
FROM measurements m
JOIN samples s       ON s.id = m.sample_id
JOIN protocols p     ON p.id = s.protocol_id
JOIN sampling_points sp ON sp.id = s.point_id
JOIN parameters pr   ON pr.id = m.parameter_id
GROUP BY s.lab_number, sp.name, sp.type, sp.location, p.number
ORDER BY s.lab_number;


-- ─── 2. ПРЕВЫШЕНИЯ ПДК для питьевой воды ──────────────────────
SELECT
    s.lab_number                AS "Лаб. №",
    sp.name                     AS "Точка отбора",
    pr.name_ru                  AS "Показатель",
    pr.unit                     AS "Ед.",
    m.raw_value                 AS "Факт",
    n.limit_value               AS "ПДК",
    n.limit_type                AS "Тип ПДК",
    ROUND((m.numeric_value / n.limit_value)::numeric, 2) AS "Кратность превышения"
FROM measurements m
JOIN samples s          ON s.id = m.sample_id
JOIN sampling_points sp ON sp.id = s.point_id
JOIN parameters pr      ON pr.id = m.parameter_id
JOIN norms n            ON n.parameter_id = m.parameter_id AND n.norm_type = 'питьевая'
WHERE
    m.is_less_than = FALSE
    AND m.numeric_value IS NOT NULL
    AND n.limit_type = '≤'
    AND m.numeric_value > n.limit_value
ORDER BY (m.numeric_value / n.limit_value) DESC;


-- ─── 3. СРАВНЕНИЕ ДО/ПОСЛЕ ФИЛЬТРА (лаб. 726 vs 727) ────────
SELECT
    pr.name_ru          AS "Показатель",
    pr.unit             AS "Ед.",
    MAX(CASE WHEN s.lab_number = 726 THEN m.raw_value END) AS "До фильтра",
    MAX(CASE WHEN s.lab_number = 727 THEN m.raw_value END) AS "После фильтра",
    CASE
        WHEN MAX(CASE WHEN s.lab_number = 726 THEN m.numeric_value END) > 0
        AND  MAX(CASE WHEN s.lab_number = 727 THEN m.numeric_value END) IS NOT NULL
        THEN ROUND(
            (MAX(CASE WHEN s.lab_number=727 THEN m.numeric_value END)
           - MAX(CASE WHEN s.lab_number=726 THEN m.numeric_value END))
          / MAX(CASE WHEN s.lab_number=726 THEN m.numeric_value END) * 100
        , 1)
    END AS "Изменение, %"
FROM measurements m
JOIN samples s     ON s.id = m.sample_id
JOIN parameters pr ON pr.id = m.parameter_id
WHERE s.lab_number IN (726, 727)
GROUP BY pr.name_ru, pr.unit, pr.id
ORDER BY pr.id;


-- ─── 4. СТАТИСТИКА ПО КАЖДОМУ ПАРАМЕТРУ ──────────────────────
SELECT
    pc.name_ru              AS "Категория",
    pr.name_ru              AS "Показатель",
    pr.unit                 AS "Ед.",
    COUNT(m.id)             AS "Кол-во проб",
    ROUND(MIN(m.numeric_value)::numeric, 4)  AS "Мин",
    ROUND(MAX(m.numeric_value)::numeric, 4)  AS "Макс",
    ROUND(AVG(m.numeric_value)::numeric, 4)  AS "Среднее",
    ROUND(STDDEV(m.numeric_value)::numeric, 4) AS "СКО"
FROM measurements m
JOIN parameters pr       ON pr.id = m.parameter_id
JOIN parameter_categories pc ON pc.id = pr.category_id
WHERE m.is_less_than = FALSE AND m.numeric_value IS NOT NULL
GROUP BY pc.name_ru, pr.name_ru, pr.unit, pr.id, pc.id
ORDER BY pc.id, pr.id;


-- ─── 5. РЕЙТИНГ ТОЧЕК ПО МИНЕРАЛИЗАЦИИ ───────────────────────
SELECT
    sp.name                 AS "Точка отбора",
    sp.type                 AS "Тип",
    sp.location             AS "Объект",
    m.numeric_value         AS "Минерализация, мг/дм³",
    RANK() OVER (ORDER BY m.numeric_value DESC) AS "Ранг (↑ хуже)"
FROM measurements m
JOIN samples s          ON s.id = m.sample_id
JOIN sampling_points sp ON sp.id = s.point_id
JOIN parameters pr      ON pr.id = m.parameter_id
WHERE pr.formula = 'TDS'
  AND m.is_less_than = FALSE
  AND m.numeric_value IS NOT NULL
ORDER BY m.numeric_value DESC;


-- ─── 6. ТОЧКИ С ПРЕВЫШЕНИЕМ ПО ≥2 ПАРАМЕТРАМ ────────────────
SELECT
    sp.name                     AS "Точка отбора",
    COUNT(DISTINCT pr.id)       AS "Кол-во превышений ПДК"
FROM measurements m
JOIN samples s          ON s.id = m.sample_id
JOIN sampling_points sp ON sp.id = s.point_id
JOIN parameters pr      ON pr.id = m.parameter_id
JOIN norms n            ON n.parameter_id = m.parameter_id
                        AND n.norm_type = 'питьевая'
                        AND n.limit_type = '≤'
WHERE m.is_less_than = FALSE
  AND m.numeric_value > n.limit_value
GROUP BY sp.name
HAVING COUNT(DISTINCT pr.id) >= 2
ORDER BY COUNT(DISTINCT pr.id) DESC;


-- ─── 7. АНАЛИЗ СЕРИЙ 334 vs 354 ──────────────────────────────
SELECT
    p.series                    AS "Серия",
    pr.name_ru                  AS "Показатель",
    pr.unit                     AS "Ед.",
    ROUND(AVG(m.numeric_value)::numeric, 3) AS "Среднее",
    ROUND(MIN(m.numeric_value)::numeric, 3) AS "Мин",
    ROUND(MAX(m.numeric_value)::numeric, 3) AS "Макс",
    COUNT(m.id)                 AS "n"
FROM measurements m
JOIN samples s       ON s.id = m.sample_id
JOIN protocols p     ON p.id = s.protocol_id
JOIN parameters pr   ON pr.id = m.parameter_id
WHERE m.is_less_than = FALSE
  AND m.numeric_value IS NOT NULL
  AND pr.formula IN ('TDS','TH','Cl-','SO4','Fe_total','NO3-','NH4+')
GROUP BY p.series, pr.name_ru, pr.unit, pr.id
ORDER BY pr.id, p.series;


-- ─── 8. ОТЧЁТ — ПОЛНЫЙ РЕЗУЛЬТАТ ОДНОЙ ПРОБЫ ─────────────────
-- Замените 763 на нужный лабораторный номер
SELECT
    pc.name_ru      AS "Категория",
    pr.name_ru      AS "Показатель",
    pr.formula      AS "Формула",
    pr.unit         AS "Ед. изм.",
    m.raw_value     AS "Результат",
    m.norm_doc      AS "НД на определение"
FROM measurements m
JOIN parameters pr       ON pr.id = m.parameter_id
JOIN parameter_categories pc ON pc.id = pr.category_id
JOIN samples s           ON s.id = m.sample_id
WHERE s.lab_number = 763
ORDER BY pc.id, pr.id;
