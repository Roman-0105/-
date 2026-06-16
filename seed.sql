-- ============================================================
--  SEED DATA — ТОО «RG Gold» / EcoExpert
--  Данные из протоколов 334/4, 334/5, 334/6, 354/1, 354/5
-- ============================================================

-- ─── Категории показателей ───────────────────────────────────
INSERT INTO parameter_categories (code, name_ru) VALUES
('organoleptic',  'Органолептические'),
('physico_chem',  'Физико-химические'),
('cation',        'Катионы'),
('anion',         'Анионы'),
('metal',         'Металлы и микроэлементы'),
('other',         'Прочие');

-- ─── Лаборатория ─────────────────────────────────────────────
INSERT INTO laboratories (name, accreditation, accred_valid_to, city, address) VALUES
('ТОО «ЭкоЭксперт»', 'KZ.T.10.0716', '2025-08-07', 'Караганды',
 'ул. Лободы, стр. 40');

-- ─── Заказчик ────────────────────────────────────────────────
INSERT INTO clients (name) VALUES ('ТОО «RG Gold»');

-- ─── Справочник показателей ──────────────────────────────────
-- Органолептические
INSERT INTO parameters (category_id, name_ru, formula, unit, norm_doc) VALUES
(1, 'Запах',     'smell',    'балл',          'ГОСТ Р 57164-2016'),
(1, 'Привкус',   'taste',    'балл',          'ГОСТ Р 57164-2016'),
(1, 'Цветность', 'color',    'гр. цветности', 'ГОСТ 31868-2012'),
(1, 'Мутность',  'turbidity','ЕМФ',           'ГОСТ Р 57164-2016'),
(1, 'Прозрачность','transp', 'см',            'СТ РК 3060-2017');

-- Физико-химические
INSERT INTO parameters (category_id, name_ru, formula, unit, norm_doc) VALUES
(2, 'pH в лаборатории',   'pH_lab',   'ед. pH',      'ГОСТ 26449.1-85 п.4'),
(2, 'pH при отборе',      'pH_field', 'ед. pH',      'ГОСТ 26449.1-85 п.4'),
(2, 'Общая минерализация','TDS',      'мг/дм³',      'ГОСТ 26449.1-85 п.3'),
(2, 'Общая жёсткость',    'TH',       'мг-экв/дм³',  'ГОСТ 31954-2012'),
(2, 'Щелочность',         'ALK',      'мг/дм³',      'ГОСТ 26449.1-85 п.6'),
(2, 'Плотность',          'density',  'г/см³',       'ГОСТ 26449.1-85 п.1');

-- Катионы
INSERT INTO parameters (category_id, name_ru, formula, unit, norm_doc) VALUES
(3, 'Натрий',                   'Na+',    'мг/дм³', 'СТ РК 2868-2016'),
(3, 'Калий',                    'K+',     'мг/дм³', 'СТ РК 2868-2016'),
(3, 'Кальций',                  'Ca2+',   'мг/дм³', 'ГОСТ 26449.1-85 п.11'),
(3, 'Магний',                   'Mg2+',   'мг/дм³', 'ГОСТ 26449.1-85 п.12'),
(3, 'Аммоний',                  'NH4+',   'мг/дм³', 'ГОСТ 33045-2014'),
(3, 'Аммиак и ионы аммония',    'NH3_NH4','мг/дм³', 'ГОСТ 33045-2014');

-- Анионы
INSERT INTO parameters (category_id, name_ru, formula, unit, norm_doc) VALUES
(4, 'Карбонаты',      'CO3',   'мг/дм³', 'ГОСТ 26449.1-85 п.7'),
(4, 'Гидрокарбонаты', 'HCO3-', 'мг/дм³', 'ГОСТ 26449.1-85 п.7'),
(4, 'Нитраты',        'NO3-',  'мг/дм³', 'ГОСТ 33045-2014'),
(4, 'Нитриты',        'NO2-',  'мг/дм³', 'ГОСТ 33045-2014'),
(4, 'Сульфаты',       'SO4',   'мг/дм³', 'ГОСТ 31940-2013'),
(4, 'Хлориды',        'Cl-',   'мг/дм³', 'ГОСТ 26449.1-85 п.9'),
(4, 'Фториды',        'F-',    'мг/дм³', 'СТ РК 2727-2015'),
(4, 'Цианиды',        'CN-',   'мг/дм³', 'KZ.07.00.01855-2018'),
(4, 'Фосфаты',        'PO4',   'мг/дм³', 'ГОСТ 18309-2014'),
(4, 'Бромиды',        'Br-',   'мг/дм³', 'ГОСТ 23268.15-78');

-- Металлы и микроэлементы
INSERT INTO parameters (category_id, name_ru, formula, unit, norm_doc) VALUES
(5, 'Железо 2+',     'Fe2+',   'мг/дм³', 'СТ РК ИСО 6332-2008'),
(5, 'Железо 3+',     'Fe3+',   'мг/дм³', 'ГОСТ 23268.11-78'),
(5, 'Железо общее',  'Fe_total','мг/дм³', 'СТ РК ИСО 6332-2008'),
(5, 'Медь',          'Cu',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Марганец',      'Mn',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Никель',        'Ni',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Цинк',          'Zn',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Алюминий',      'Al',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Барий',         'Ba',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Бериллий',      'Be',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Бор',           'B',      'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Кадмий',        'Cd',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Мышьяк',        'As',     'мг/дм³', 'KZ.07.00.01959-2019'),
(5, 'Ртуть',         'Hg',     'мг/дм³', 'KZ.07.00.01959-2019'),
(5, 'Свинец',        'Pb',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Селен',         'Se',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Стронций',      'Sr',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Хром',          'Cr',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Молибден',      'Mo',     'мг/дм³', 'KZ.07.00.01377-2016'),
(5, 'Кремний',       'Si',     'мг/дм³', 'СТ РК 2867-2016');

-- Прочие
INSERT INTO parameters (category_id, name_ru, formula, unit, norm_doc) VALUES
(6, 'Нефтепродукты', 'OilProd','мг/дм³', 'KZ.07.00.01667-2017'),
(6, 'Сухой остаток', 'DR',     'мг/дм³', 'ГОСТ 26449.1-85 п.3');

-- ─── Точки отбора ────────────────────────────────────────────
INSERT INTO sampling_points (code, name, type, location) VALUES
('SKV_1NKK',       'Скважина 1нкк',              'скважина',    'НКК'),
('SKV_2NKK',       'Скважина 2нкк',              'скважина',    'НКК'),
('SKV_3NKK',       'Скважина 3нкк',              'скважина',    'НКК'),
('FILTER_IN',      'До фильтра',                 'фильтр',      'Основной объект'),
('FILTER_OUT',     'После фильтра',              'фильтр',      'Основной объект'),
('SKV_ULGE_1',     'п. Ульге Алган, Скважина 1', 'скважина',    'п. Ульге Алган'),
('SKV_KARAGAY_1',  'п. Карагай, Скважина 1',     'скважина',    'п. Карагай'),
('PUMP_KARAGAY',   'п. Карагай, Водокачка',      'водокачка',   'п. Карагай'),
('SUMP_GRT_YRG',   'Зумпф ГРТ ЮРГ',             'зумпф',       'ЮРГ'),
('SUMP_OPT_YRG',   'Опытный зумпф ЮРГ',         'зумпф',       'ЮРГ'),
('SUMP_SW_YRG',    'Юго-Западный зумпф ЮРГ',    'зумпф',       'ЮРГ'),
('MB02_YRG',       'МБ-02.ЮРГ',                  'зумпф',       'ЮРГ'),
('WATERFILL_YRG',  'Водонаброс 2 ЮРГ',           'водонаброс',  'ЮРГ'),
('HGN02_YRG',      'НGN-02.ЮРГ',                 'зумпф',       'ЮРГ'),
('SKV_2006',       'Скважина 2006',              'скважина',    'Основной объект'),
('SKV_2023',       'Скважина 2023',              'скважина',    'Основной объект');

-- ─── Протоколы ───────────────────────────────────────────────
INSERT INTO protocols
  (number, series, lab_id, client_id, registration_no,
   sampling_date_from, sampling_date_to, receipt_date,
   test_date_from, test_date_to, total_samples,
   conditions, issued_at, total_pages) VALUES
('334/4','334', 1,1,'№334', '2026-05-20','2026-05-21','2026-05-21',
 '2026-05-21','2026-06-12', 2,
 'T=19-20°C Влажность 52-62%','2026-06-12', 3),
('334/5','334', 1,1,'№334', '2026-05-20','2026-05-21','2026-05-21',
 '2026-05-21','2026-06-12', 3,
 'T=19-20°C Влажность 52-62%','2026-06-12', 3),
('334/6','334', 1,1,'№334', '2026-05-20','2026-05-21','2026-05-21',
 '2026-05-21','2026-06-12', 3,
 'T=19-20°C Влажность 52-62%','2026-06-12', 4),
('354/1','354', 1,1,'№354', '2026-05-22','2026-05-26','2026-05-26',
 '2026-05-26','2026-06-15', 6,
 'T=19-20°C Влажность 52-62%','2026-06-15', 6),
('354/5','354', 1,1,'№354', '2026-05-22','2026-05-26','2026-05-26',
 '2026-05-26','2026-06-15', 2,
 'T=19-20°C Влажность 52-62%','2026-06-15', 3);

-- ─── Пробы ───────────────────────────────────────────────────
INSERT INTO samples (lab_number, client_number, protocol_id, point_id, sample_type, sampling_date) VALUES
-- 334/4
(726, 10, 1, (SELECT id FROM sampling_points WHERE code='FILTER_IN'),  'Вода', '2026-05-20'),
(727, 11, 1, (SELECT id FROM sampling_points WHERE code='FILTER_OUT'), 'Вода', '2026-05-20'),
-- 334/5
(728, 12, 2, (SELECT id FROM sampling_points WHERE code='SKV_1NKK'),   'Вода', '2026-05-20'),
(729, 13, 2, (SELECT id FROM sampling_points WHERE code='SKV_2NKK'),   'Вода', '2026-05-20'),
(730, 14, 2, (SELECT id FROM sampling_points WHERE code='SKV_3NKK'),   'Вода', '2026-05-21'),
-- 334/6
(732, 16, 3, (SELECT id FROM sampling_points WHERE code='SKV_ULGE_1'),   'Вода', '2026-05-20'),
(733, 17, 3, (SELECT id FROM sampling_points WHERE code='SKV_KARAGAY_1'),'Вода', '2026-05-20'),
(734, 18, 3, (SELECT id FROM sampling_points WHERE code='PUMP_KARAGAY'), 'Вода', '2026-05-21'),
-- 354/1
(763, 1,  4, (SELECT id FROM sampling_points WHERE code='SUMP_GRT_YRG'),  'Вода', '2026-05-22'),
(764, 2,  4, (SELECT id FROM sampling_points WHERE code='SUMP_OPT_YRG'),  'Вода', '2026-05-22'),
(765, 3,  4, (SELECT id FROM sampling_points WHERE code='SUMP_SW_YRG'),   'Вода', '2026-05-23'),
(766, 4,  4, (SELECT id FROM sampling_points WHERE code='MB02_YRG'),      'Вода', '2026-05-24'),
(767, 5,  4, (SELECT id FROM sampling_points WHERE code='WATERFILL_YRG'), 'Вода', '2026-05-25'),
(768, 6,  4, (SELECT id FROM sampling_points WHERE code='HGN02_YRG'),     'Вода', '2026-05-26'),
-- 354/5
(783, 21, 5, (SELECT id FROM sampling_points WHERE code='SKV_2006'),  'Вода', '2026-05-22'),
(784, 22, 5, (SELECT id FROM sampling_points WHERE code='SKV_2023'),  'Вода', '2026-05-22');

-- ─── Вспомогательная функция вставки измерений ───────────────
-- Вставка: ins_m(lab_number, formula, raw_value)
CREATE OR REPLACE FUNCTION ins_m(p_lab INT, p_formula TEXT, p_raw TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_sample_id  INT;
    v_param_id   INT;
    v_numeric    DOUBLE PRECISION;
    v_less       BOOLEAN := FALSE;
    v_clean      TEXT;
BEGIN
    SELECT id INTO v_sample_id FROM samples WHERE lab_number = p_lab;
    SELECT id INTO v_param_id  FROM parameters WHERE formula = p_formula;
    IF v_sample_id IS NULL OR v_param_id IS NULL THEN RETURN; END IF;

    v_clean := REPLACE(REPLACE(p_raw, '<', ''), ',', '.');
    IF p_raw LIKE '<%' THEN v_less := TRUE; END IF;

    BEGIN v_numeric := v_clean::DOUBLE PRECISION;
    EXCEPTION WHEN OTHERS THEN v_numeric := NULL; END;

    INSERT INTO measurements (sample_id, parameter_id, raw_value, numeric_value, is_less_than)
    VALUES (v_sample_id, v_param_id, p_raw, v_numeric, v_less)
    ON CONFLICT (sample_id, parameter_id) DO UPDATE
      SET raw_value=EXCLUDED.raw_value, numeric_value=EXCLUDED.numeric_value,
          is_less_than=EXCLUDED.is_less_than;
END;
$$;

-- ─── Измерения — Проба 726 (До фильтра) ──────────────────────
SELECT ins_m(726,'smell','0');        SELECT ins_m(726,'taste','1');
SELECT ins_m(726,'color','11,4');     SELECT ins_m(726,'turbidity','11,7');
SELECT ins_m(726,'transp','30,0');
SELECT ins_m(726,'pH_lab','7,7');     SELECT ins_m(726,'pH_field','7,7');
SELECT ins_m(726,'TDS','1911');       SELECT ins_m(726,'TH','20,0');
SELECT ins_m(726,'Na+','1540');       SELECT ins_m(726,'K+','24,0');
SELECT ins_m(726,'Ca2+','180');       SELECT ins_m(726,'Mg2+','132');
SELECT ins_m(726,'NH4+','0,61');      SELECT ins_m(726,'NH3_NH4','0,47');
SELECT ins_m(726,'CO3','<0,70');      SELECT ins_m(726,'HCO3-','427');
SELECT ins_m(726,'NO3-','35,0');      SELECT ins_m(726,'NO2-','0,044');
SELECT ins_m(726,'SO4','346');        SELECT ins_m(726,'Cl-','553');
SELECT ins_m(726,'Fe2+','0,030');     SELECT ins_m(726,'Fe3+','<0,50');
SELECT ins_m(726,'Fe_total','0,064'); SELECT ins_m(726,'Cu','<0,0010');
SELECT ins_m(726,'OilProd','0,016');  SELECT ins_m(726,'Mn','<0,0010');
SELECT ins_m(726,'DR','2296');        SELECT ins_m(726,'Ni','<0,0010');
SELECT ins_m(726,'ALK','7,00');       SELECT ins_m(726,'F-','0,60');
SELECT ins_m(726,'Si','12,1');        SELECT ins_m(726,'Mo','<0,0010');
SELECT ins_m(726,'density','0,98');   SELECT ins_m(726,'CN-','<0,010');

-- ─── Измерения — Проба 727 (После фильтра) ───────────────────
SELECT ins_m(727,'smell','0');        SELECT ins_m(727,'taste','0');
SELECT ins_m(727,'color','17,4');     SELECT ins_m(727,'turbidity','10,7');
SELECT ins_m(727,'transp','30,0');
SELECT ins_m(727,'pH_lab','5,3');     SELECT ins_m(727,'pH_field','5,3');
SELECT ins_m(727,'TDS','2446');       SELECT ins_m(727,'TH','0,40');
SELECT ins_m(727,'Na+','779');        SELECT ins_m(727,'K+','77,8');
SELECT ins_m(727,'Ca2+','2,00');      SELECT ins_m(727,'Mg2+','3,60');
SELECT ins_m(727,'NH4+','0,75');      SELECT ins_m(727,'NH3_NH4','0,58');
SELECT ins_m(727,'CO3','<0,70');      SELECT ins_m(727,'HCO3-','24,4');
SELECT ins_m(727,'NO3-','2,73');      SELECT ins_m(727,'NO2-','0,013');
SELECT ins_m(727,'SO4','<0,70');      SELECT ins_m(727,'Cl-','1316');
SELECT ins_m(727,'Fe2+','0,030');     SELECT ins_m(727,'Fe3+','<0,50');
SELECT ins_m(727,'Fe_total','0,039'); SELECT ins_m(727,'Cu','<0,0010');
SELECT ins_m(727,'OilProd','0,011');  SELECT ins_m(727,'Mn','<0,0010');
SELECT ins_m(727,'DR','36,0');        SELECT ins_m(727,'Ni','<0,0010');
SELECT ins_m(727,'ALK','0,40');       SELECT ins_m(727,'F-','0,020');
SELECT ins_m(727,'Si','0,50');        SELECT ins_m(727,'Mo','<0,0010');
SELECT ins_m(727,'density','0,98');   SELECT ins_m(727,'CN-','<0,010');

-- ─── Измерения — Проба 728 (Скважина 1нкк) ───────────────────
SELECT ins_m(728,'smell','0');        SELECT ins_m(728,'taste','1');
SELECT ins_m(728,'color','6,34');     SELECT ins_m(728,'turbidity','>40,0');
SELECT ins_m(728,'transp','12,0');
SELECT ins_m(728,'pH_lab','8,1');     SELECT ins_m(728,'pH_field','8,4');
SELECT ins_m(728,'TDS','728');        SELECT ins_m(728,'TH','3,00');
SELECT ins_m(728,'Na+','148');        SELECT ins_m(728,'K+','16,3');
SELECT ins_m(728,'Ca2+','42,0');      SELECT ins_m(728,'Mg2+','22,8');
SELECT ins_m(728,'NH4+','0,12');      SELECT ins_m(728,'NH3_NH4','0,090');
SELECT ins_m(728,'CO3','<0,70');      SELECT ins_m(728,'HCO3-','195');
SELECT ins_m(728,'NO3-','0,49');      SELECT ins_m(728,'NO2-','0,038');
SELECT ins_m(728,'SO4','115');        SELECT ins_m(728,'Cl-','165');
SELECT ins_m(728,'Fe2+','0,033');     SELECT ins_m(728,'Fe3+','6,16');
SELECT ins_m(728,'Fe_total','0,042'); SELECT ins_m(728,'Cu','<0,0010');
SELECT ins_m(728,'OilProd','0,025');  SELECT ins_m(728,'Mn','0,096');
SELECT ins_m(728,'DR','518');         SELECT ins_m(728,'Ni','<0,0010');
SELECT ins_m(728,'ALK','3,60');       SELECT ins_m(728,'F-','1,74');
SELECT ins_m(728,'Si','0,99');        SELECT ins_m(728,'Mo','<0,0010');
SELECT ins_m(728,'density','0,98');   SELECT ins_m(728,'CN-','<0,010');

-- ─── Измерения — Проба 729 (Скважина 2нкк) ───────────────────
SELECT ins_m(729,'smell','1');        SELECT ins_m(729,'taste','1');
SELECT ins_m(729,'color','25,3');     SELECT ins_m(729,'turbidity','>40,0');
SELECT ins_m(729,'transp','12,0');
SELECT ins_m(729,'pH_lab','8,1');     SELECT ins_m(729,'pH_field','8,1');
SELECT ins_m(729,'TDS','2812');       SELECT ins_m(729,'TH','—');
SELECT ins_m(729,'Na+','527');        SELECT ins_m(729,'K+','61,8');
SELECT ins_m(729,'Ca2+','130');       SELECT ins_m(729,'Mg2+','114');
SELECT ins_m(729,'NH4+','0,72');      SELECT ins_m(729,'NH3_NH4','0,56');
SELECT ins_m(729,'CO3','<0,70');      SELECT ins_m(729,'HCO3-','256');
SELECT ins_m(729,'NO3-','0,57');      SELECT ins_m(729,'NO2-','0,037');
SELECT ins_m(729,'SO4','1460');       SELECT ins_m(729,'Cl-','1460');
SELECT ins_m(729,'Fe2+','0,42');      SELECT ins_m(729,'Fe3+','3,92');
SELECT ins_m(729,'Fe_total','<0,010');SELECT ins_m(729,'Cu','<0,0010');
SELECT ins_m(729,'OilProd','0,006'); SELECT ins_m(729,'Mn','0,028');
SELECT ins_m(729,'DR','—');           SELECT ins_m(729,'Ni','<0,0010');
SELECT ins_m(729,'ALK','4,40');       SELECT ins_m(729,'F-','0,69');
SELECT ins_m(729,'Si','0,99');        SELECT ins_m(729,'Mo','<0,0010');
SELECT ins_m(729,'density','0,98');   SELECT ins_m(729,'CN-','<0,010');

-- ─── Измерения — Проба 730 (Скважина 3нкк) ───────────────────
SELECT ins_m(730,'smell','0');        SELECT ins_m(730,'taste','0');
SELECT ins_m(730,'color','35,8');     SELECT ins_m(730,'turbidity','>40,0');
SELECT ins_m(730,'transp','7,00');
SELECT ins_m(730,'pH_lab','8,0');     SELECT ins_m(730,'pH_field','8,1');
SELECT ins_m(730,'TDS','2445');       SELECT ins_m(730,'TH','7,70');
SELECT ins_m(730,'Na+','552');        SELECT ins_m(730,'K+','50,0');
SELECT ins_m(730,'Ca2+','56,0');      SELECT ins_m(730,'Mg2+','58,8');
SELECT ins_m(730,'NH4+','0,25');      SELECT ins_m(730,'NH3_NH4','0,19');
SELECT ins_m(730,'CO3','<0,70');      SELECT ins_m(730,'HCO3-','64');
SELECT ins_m(730,'NO3-','0,74');      SELECT ins_m(730,'NO2-','0,074');
SELECT ins_m(730,'SO4','634');        SELECT ins_m(730,'Cl-','316');
SELECT ins_m(730,'Fe2+','5,04');      SELECT ins_m(730,'Fe3+','3,92') ;
SELECT ins_m(730,'Fe_total','0,008'); SELECT ins_m(730,'Cu','<0,0010');
SELECT ins_m(730,'OilProd','<0,0010');SELECT ins_m(730,'Mn','0,045');
SELECT ins_m(730,'DR','2090');        SELECT ins_m(730,'Ni','<0,0010');
SELECT ins_m(730,'ALK','2,60');       SELECT ins_m(730,'F-','2,6');
SELECT ins_m(730,'Si','3,37');        SELECT ins_m(730,'Mo','<0,0010');
SELECT ins_m(730,'density','0,98');   SELECT ins_m(730,'CN-','<0,010');

-- ─── Измерения — Проба 732 (п. Ульге Алган, Скв.1) ──────────
SELECT ins_m(732,'smell','2');        SELECT ins_m(732,'taste','1');
SELECT ins_m(732,'color','33,5');     SELECT ins_m(732,'turbidity','20,5');
SELECT ins_m(732,'transp','12,0');
SELECT ins_m(732,'pH_lab','7,5');     SELECT ins_m(732,'pH_field','7,9');
SELECT ins_m(732,'TDS','272');        SELECT ins_m(732,'TH','1,70');
SELECT ins_m(732,'Na+','47,0');       SELECT ins_m(732,'K+','0,18');
SELECT ins_m(732,'Ca2+','18');        SELECT ins_m(732,'Mg2+','14,4');
SELECT ins_m(732,'NH4+','0,15');      SELECT ins_m(732,'NH3_NH4','0,12');
SELECT ins_m(732,'CO3','24,0');       SELECT ins_m(732,'HCO3-','97,6');
SELECT ins_m(732,'NO3-','1,29');      SELECT ins_m(732,'NO2-','0,34');
SELECT ins_m(732,'SO4','57,6');       SELECT ins_m(732,'Cl-','105');
SELECT ins_m(732,'Fe2+','0,025');     SELECT ins_m(732,'Fe3+','4,48');
SELECT ins_m(732,'Fe_total','0,030'); SELECT ins_m(732,'Cu','<0,0010');
SELECT ins_m(732,'OilProd','0,016');  SELECT ins_m(732,'Mn','<0,0010');
SELECT ins_m(732,'DR','130');         SELECT ins_m(732,'Ni','0,10');
SELECT ins_m(732,'ALK','1,80');       SELECT ins_m(732,'F-','0,030');
SELECT ins_m(732,'Si','1,12');        SELECT ins_m(732,'Mo','<0,0010');
SELECT ins_m(732,'density','0,98');   SELECT ins_m(732,'CN-','<0,010');
SELECT ins_m(732,'Ba','0,0070');      SELECT ins_m(732,'B','0,098');
SELECT ins_m(732,'Sr','0,16');

-- ─── Измерения — Проба 733 (п. Карагай, Скв.1) ──────────────
SELECT ins_m(733,'smell','1');        SELECT ins_m(733,'taste','1');
SELECT ins_m(733,'color','33,5');     SELECT ins_m(733,'turbidity','20,5');
SELECT ins_m(733,'transp','12,0');
SELECT ins_m(733,'pH_lab','7,4');     SELECT ins_m(733,'pH_field','7,8');
SELECT ins_m(733,'TDS','387');        SELECT ins_m(733,'TH','0,80');
SELECT ins_m(733,'Na+','98,1');       SELECT ins_m(733,'K+','0,18');
SELECT ins_m(733,'Ca2+','8,00');      SELECT ins_m(733,'Mg2+','4,80');
SELECT ins_m(733,'NH4+','4,41');      SELECT ins_m(733,'NH3_NH4','3,40');
SELECT ins_m(733,'CO3','24,0');       SELECT ins_m(733,'HCO3-','97,6');
SELECT ins_m(733,'NO3-','1,29');      SELECT ins_m(733,'NO2-','0,34');
SELECT ins_m(733,'SO4','57,6');       SELECT ins_m(733,'Cl-','19,7');
SELECT ins_m(733,'Fe2+','0,025');     SELECT ins_m(733,'Fe3+','4,48');
SELECT ins_m(733,'Fe_total','0,030'); SELECT ins_m(733,'Cu','<0,0010');
SELECT ins_m(733,'OilProd','0,015');  SELECT ins_m(733,'Mn','<0,0010');
SELECT ins_m(733,'DR','366');         SELECT ins_m(733,'Ni','<0,0010');
SELECT ins_m(733,'ALK','2,00');       SELECT ins_m(733,'F-','0,32');
SELECT ins_m(733,'Si','1,12');        SELECT ins_m(733,'Mo','<0,0010');
SELECT ins_m(733,'density','0,98');   SELECT ins_m(733,'CN-','<0,010');
SELECT ins_m(733,'Ba','0,0070');      SELECT ins_m(733,'B','0,21');
SELECT ins_m(733,'Sr','0,16');

-- ─── Измерения — Проба 734 (п. Карагай, Водокачка) ──────────
SELECT ins_m(734,'smell','0');        SELECT ins_m(734,'taste','0');
SELECT ins_m(734,'color','20,6');     SELECT ins_m(734,'turbidity','10,9');
SELECT ins_m(734,'transp','30,0');
SELECT ins_m(734,'pH_lab','7,4');     SELECT ins_m(734,'pH_field','7,3');
SELECT ins_m(734,'TDS','849');        SELECT ins_m(734,'TH','3,50');
SELECT ins_m(734,'Na+','76,2');       SELECT ins_m(734,'K+','8,34');
SELECT ins_m(734,'Ca2+','114');       SELECT ins_m(734,'Mg2+','33,6');
SELECT ins_m(734,'NH4+','0,071');     SELECT ins_m(734,'NH3_NH4','0,055');
SELECT ins_m(734,'CO3','<0,70');      SELECT ins_m(734,'HCO3-','13,6');
SELECT ins_m(734,'NO3-','6,86');      SELECT ins_m(734,'NO2-','0,11');
SELECT ins_m(734,'SO4','57,6');       SELECT ins_m(734,'Cl-','150');
SELECT ins_m(734,'Fe2+','0,008');     SELECT ins_m(734,'Fe3+','<0,50');
SELECT ins_m(734,'Fe_total','0,014'); SELECT ins_m(734,'Cu','<0,0010');
SELECT ins_m(734,'OilProd','0,015');  SELECT ins_m(734,'Mn','0,011');
SELECT ins_m(734,'DR','728');         SELECT ins_m(734,'Ni','<0,0010');
SELECT ins_m(734,'ALK','7,00');       SELECT ins_m(734,'F-','0,71');
SELECT ins_m(734,'Si','4,23');        SELECT ins_m(734,'Mo','<0,0010');
SELECT ins_m(734,'density','0,98');   SELECT ins_m(734,'CN-','<0,010');
SELECT ins_m(734,'Ba','0,069');       SELECT ins_m(734,'B','0,21');
SELECT ins_m(734,'Sr','1,13');

-- ─── Измерения — Проба 763 (Зумпф ГРТ ЮРГ) ─────────────────
SELECT ins_m(763,'smell','0');        SELECT ins_m(763,'taste','1');
SELECT ins_m(763,'color','23,3');     SELECT ins_m(763,'turbidity','10,4');
SELECT ins_m(763,'transp','30,0');
SELECT ins_m(763,'pH_lab','7,7');     SELECT ins_m(763,'pH_field','7,7');
SELECT ins_m(763,'TDS','2151');       SELECT ins_m(763,'TH','13,0');
SELECT ins_m(763,'Na+','527');        SELECT ins_m(763,'K+','55,1');
SELECT ins_m(763,'Ca2+','120');       SELECT ins_m(763,'Mg2+','55,2');
SELECT ins_m(763,'NH4+','26,2');      SELECT ins_m(763,'NH3_NH4','20,3');
SELECT ins_m(763,'CO3','<0,70');      SELECT ins_m(763,'HCO3-','354');
SELECT ins_m(763,'NO3-','214');       SELECT ins_m(763,'NO2-','23,4');
SELECT ins_m(763,'SO4','325');        SELECT ins_m(763,'Cl-','408');
SELECT ins_m(763,'Fe2+','0,003');     SELECT ins_m(763,'Fe3+','<0,50');
SELECT ins_m(763,'Fe_total','0,008'); SELECT ins_m(763,'Cu','0,021');
SELECT ins_m(763,'OilProd','0,066');  SELECT ins_m(763,'Mn','0,077');
SELECT ins_m(763,'DR','1472');        SELECT ins_m(763,'Ni','<0,0010');
SELECT ins_m(763,'ALK','5,80');       SELECT ins_m(763,'F-','0,72');
SELECT ins_m(763,'Si','9,31');        SELECT ins_m(763,'Mo','<0,0010');
SELECT ins_m(763,'density','0,98');   SELECT ins_m(763,'CN-','<0,010');
SELECT ins_m(763,'Al','0,013');       SELECT ins_m(763,'Ba','0,026');
SELECT ins_m(763,'Sr','1,37');

-- ─── Измерения — Проба 764 (Опытный зумпф ЮРГ) ──────────────
SELECT ins_m(764,'smell','1');        SELECT ins_m(764,'taste','1');
SELECT ins_m(764,'color','6,13');     SELECT ins_m(764,'turbidity','9,11');
SELECT ins_m(764,'transp','30,0');
SELECT ins_m(764,'pH_lab','8,0');     SELECT ins_m(764,'pH_field','8,0');
SELECT ins_m(764,'TDS','—');          SELECT ins_m(764,'TH','10,0');
SELECT ins_m(764,'Na+','264');        SELECT ins_m(764,'K+','28,3');
SELECT ins_m(764,'Ca2+','105');       SELECT ins_m(764,'Mg2+','55,2');
SELECT ins_m(764,'NH4+','0,058');     SELECT ins_m(764,'NH3_NH4','0,045');
SELECT ins_m(764,'CO3','12,0');       SELECT ins_m(764,'HCO3-','256');
SELECT ins_m(764,'NO3-','14,8');      SELECT ins_m(764,'NO2-','0,19');
SELECT ins_m(764,'SO4','269');        SELECT ins_m(764,'Cl-','428');
SELECT ins_m(764,'Fe2+','0,022');     SELECT ins_m(764,'Fe3+','0,061');
SELECT ins_m(764,'Fe_total','0,008'); SELECT ins_m(764,'Cu','<0,0010');
SELECT ins_m(764,'OilProd','0,012');  SELECT ins_m(764,'Mn','<0,0010');
SELECT ins_m(764,'DR','1876');        SELECT ins_m(764,'Ni','<0,0010');
SELECT ins_m(764,'ALK','4,20');       SELECT ins_m(764,'F-','0,76');
SELECT ins_m(764,'Si','13,6');        SELECT ins_m(764,'Mo','<0,0013');
SELECT ins_m(764,'density','0,98');   SELECT ins_m(764,'CN-','<0,010');
SELECT ins_m(764,'Al','0,0053');      SELECT ins_m(764,'Ba','0,029');
SELECT ins_m(764,'Sr','0,33');

-- ─── Измерения — Проба 765 (Юго-Западный зумпф ЮРГ) ─────────
SELECT ins_m(765,'smell','0');        SELECT ins_m(765,'taste','0');
SELECT ins_m(765,'color','7,97');     SELECT ins_m(765,'turbidity','26,3');
SELECT ins_m(765,'transp','26,0');
SELECT ins_m(765,'pH_lab','7,8');     SELECT ins_m(765,'pH_field','7,8');
SELECT ins_m(765,'TDS','2120');       SELECT ins_m(765,'TH','44,0');
SELECT ins_m(765,'Na+','14,5');       SELECT ins_m(765,'K+','57,7');
SELECT ins_m(765,'Ca2+','150');       SELECT ins_m(765,'Mg2+','82,4');
SELECT ins_m(765,'NH4+','23,5');      SELECT ins_m(765,'NH3_NH4','18,2');
SELECT ins_m(765,'CO3','12,0');       SELECT ins_m(765,'HCO3-','317');
SELECT ins_m(765,'NO3-','202');       SELECT ins_m(765,'NO2-','23,2');
SELECT ins_m(765,'SO4','346');        SELECT ins_m(765,'Cl-','317');
SELECT ins_m(765,'Fe2+','0,019');     SELECT ins_m(765,'Fe3+','<0,50');
SELECT ins_m(765,'Fe_total','0,011'); SELECT ins_m(765,'Cu','0,032');
SELECT ins_m(765,'OilProd','0,012');  SELECT ins_m(765,'Mn','0,048');
SELECT ins_m(765,'DR','2040');        SELECT ins_m(765,'Ni','<0,0010');
SELECT ins_m(765,'ALK','5,40');       SELECT ins_m(765,'F-','0,74');
SELECT ins_m(765,'Si','8,67');        SELECT ins_m(765,'Mo','<0,0010');
SELECT ins_m(765,'density','0,98');   SELECT ins_m(765,'CN-','<0,010');
SELECT ins_m(765,'Al','0,013');       SELECT ins_m(765,'Ba','0,029');
SELECT ins_m(765,'Sr','1,53');

-- ─── Измерения — Проба 766 (МБ-02.ЮРГ) ─────────────────────
SELECT ins_m(766,'smell','0');        SELECT ins_m(766,'taste','0');
SELECT ins_m(766,'color','1,23');     SELECT ins_m(766,'turbidity','7,75');
SELECT ins_m(766,'transp','30,0');
SELECT ins_m(766,'pH_lab','7,8');     SELECT ins_m(766,'pH_field','7,8');
SELECT ins_m(766,'TDS','1706');       SELECT ins_m(766,'TH','12,0');
SELECT ins_m(766,'Na+','303');        SELECT ins_m(766,'K+','34,8');
SELECT ins_m(766,'Ca2+','130');       SELECT ins_m(766,'Mg2+','66,0');
SELECT ins_m(766,'NH4+','0,045');     SELECT ins_m(766,'NH3_NH4','0,034');
SELECT ins_m(766,'CO3','<0,70');      SELECT ins_m(766,'HCO3-','305');
SELECT ins_m(766,'NO3-','9,96');      SELECT ins_m(766,'NO2-','0,27');
SELECT ins_m(766,'SO4','403');        SELECT ins_m(766,'Cl-','454');
SELECT ins_m(766,'Fe2+','0,006');     SELECT ins_m(766,'Fe3+','<0,50');
SELECT ins_m(766,'Fe_total','0,008'); SELECT ins_m(766,'Cu','<0,0010');
SELECT ins_m(766,'OilProd','0,008');  SELECT ins_m(766,'Mn','<0,0010');
SELECT ins_m(766,'DR','1672');        SELECT ins_m(766,'Ni','<0,0010');
SELECT ins_m(766,'ALK','5,00');       SELECT ins_m(766,'F-','0,76');
SELECT ins_m(766,'Si','8,51');        SELECT ins_m(766,'Mo','<0,0013');
SELECT ins_m(766,'density','0,98');   SELECT ins_m(766,'CN-','<0,010');
SELECT ins_m(766,'Al','<0,010');      SELECT ins_m(766,'Ba','0,029');
SELECT ins_m(766,'Sr','0,29');

-- ─── Измерения — Проба 767 (Водонаброс 2 ЮРГ) ───────────────
SELECT ins_m(767,'smell','0');        SELECT ins_m(767,'taste','0');
SELECT ins_m(767,'color','17,6');     SELECT ins_m(767,'turbidity','9,11');
SELECT ins_m(767,'transp','—');
SELECT ins_m(767,'pH_lab','7,7');     SELECT ins_m(767,'pH_field','7,7');
SELECT ins_m(767,'TDS','1697');       SELECT ins_m(767,'TH','13,5');
SELECT ins_m(767,'Na+','264');        SELECT ins_m(767,'K+','32,4');
SELECT ins_m(767,'Ca2+','100');       SELECT ins_m(767,'Mg2+','60,4');
SELECT ins_m(767,'NH4+','0,12');      SELECT ins_m(767,'NH3_NH4','0,090');
SELECT ins_m(767,'CO3','<0,70');      SELECT ins_m(767,'HCO3-','13,6');
SELECT ins_m(767,'NO3-','13,6');      SELECT ins_m(767,'NO2-','0,086');
SELECT ins_m(767,'SO4','325');        SELECT ins_m(767,'Cl-','195');
SELECT ins_m(767,'Fe2+','0,006');     SELECT ins_m(767,'Fe3+','<0,50');
SELECT ins_m(767,'Fe_total','—');     SELECT ins_m(767,'Cu','<0,0010');
SELECT ins_m(767,'OilProd','0,005');  SELECT ins_m(767,'Mn','0,010');
SELECT ins_m(767,'DR','1592');        SELECT ins_m(767,'Ni','<0,0010');
SELECT ins_m(767,'ALK','7,60');       SELECT ins_m(767,'F-','0,59');
SELECT ins_m(767,'Si','12,1');        SELECT ins_m(767,'Mo','<0,0010');
SELECT ins_m(767,'density','0,98');   SELECT ins_m(767,'CN-','<0,010');

-- ─── Измерения — Проба 768 (НGN-02.ЮРГ) ────────────────────
SELECT ins_m(768,'smell','0');        SELECT ins_m(768,'taste','0');
SELECT ins_m(768,'color','2,25');     SELECT ins_m(768,'turbidity','8,09');
SELECT ins_m(768,'transp','30,0');
SELECT ins_m(768,'pH_lab','7,7');     SELECT ins_m(768,'pH_field','7,7');
SELECT ins_m(768,'TDS','1480');       SELECT ins_m(768,'TH','9,50');
SELECT ins_m(768,'Na+','283');        SELECT ins_m(768,'K+','116');
SELECT ins_m(768,'Ca2+','110');       SELECT ins_m(768,'Mg2+','48,0');
SELECT ins_m(768,'NH4+','0,058');     SELECT ins_m(768,'NH3_NH4','0,045');
SELECT ins_m(768,'CO3','<0,70');      SELECT ins_m(768,'HCO3-','256');
SELECT ins_m(768,'NO3-','16,1');      SELECT ins_m(768,'NO2-','0,11');
SELECT ins_m(768,'SO4','346');        SELECT ins_m(768,'Cl-','388');
SELECT ins_m(768,'Fe2+','0,006');     SELECT ins_m(768,'Fe3+','<0,50');
SELECT ins_m(768,'Fe_total','0,003'); SELECT ins_m(768,'Cu','<0,0010');
SELECT ins_m(768,'OilProd','<0,0010');SELECT ins_m(768,'Mn','<0,0010');
SELECT ins_m(768,'DR','1414');        SELECT ins_m(768,'Ni','<0,0010');
SELECT ins_m(768,'ALK','4,20');       SELECT ins_m(768,'F-','0,93');
SELECT ins_m(768,'Si','13,1');        SELECT ins_m(768,'Mo','0,049');
SELECT ins_m(768,'density','0,98');   SELECT ins_m(768,'CN-','<0,010');

-- ─── Измерения — Проба 783 (Скважина 2006) ──────────────────
SELECT ins_m(783,'smell','1');        SELECT ins_m(783,'taste','1');
SELECT ins_m(783,'color','4,70');     SELECT ins_m(783,'turbidity','27,2');
SELECT ins_m(783,'transp','18,0');
SELECT ins_m(783,'pH_lab','8,1');     SELECT ins_m(783,'pH_field','8,2');
SELECT ins_m(783,'TDS','849');        SELECT ins_m(783,'TH','3,20');
SELECT ins_m(783,'Na+','187');        SELECT ins_m(783,'K+','19,7');
SELECT ins_m(783,'Ca2+','30,0');      SELECT ins_m(783,'Mg2+','20,4');
SELECT ins_m(783,'NH4+','0,16');      SELECT ins_m(783,'NH3_NH4','0,12');
SELECT ins_m(783,'CO3','36,0');       SELECT ins_m(783,'HCO3-','220');
SELECT ins_m(783,'NO3-','1,69');      SELECT ins_m(783,'NO2-','0,071');
SELECT ins_m(783,'SO4','—');          SELECT ins_m(783,'Cl-','250');
SELECT ins_m(783,'Fe2+','0,008');     SELECT ins_m(783,'Fe3+','0,008');
SELECT ins_m(783,'Fe_total','5,60');  SELECT ins_m(783,'Cu','<0,0010');
SELECT ins_m(783,'OilProd','0,014');  SELECT ins_m(783,'Mn','0,0055');
SELECT ins_m(783,'DR','556');         SELECT ins_m(783,'Ni','<0,0010');
SELECT ins_m(783,'ALK','7,60');       SELECT ins_m(783,'F-','1,29');
SELECT ins_m(783,'Si','12,2');        SELECT ins_m(783,'Mo','<0,0010');
SELECT ins_m(783,'density','0,98');

-- ─── Измерения — Проба 784 (Скважина 2023) ──────────────────
SELECT ins_m(784,'smell','1');        SELECT ins_m(784,'taste','1');
SELECT ins_m(784,'color','19,7');     SELECT ins_m(784,'turbidity','19,7');
SELECT ins_m(784,'transp','16,0');
SELECT ins_m(784,'pH_lab','8,2');     SELECT ins_m(784,'pH_field','8,2');
SELECT ins_m(784,'TDS','2565');       SELECT ins_m(784,'TH','13,0');
SELECT ins_m(784,'Na+','527');        SELECT ins_m(784,'K+','54,7');
SELECT ins_m(784,'Ca2+','80,0');      SELECT ins_m(784,'Mg2+','108');
SELECT ins_m(784,'NH4+','5,78');      SELECT ins_m(784,'NH3_NH4','4,46');
SELECT ins_m(784,'CO3','24,0');       SELECT ins_m(784,'HCO3-','97,6');
SELECT ins_m(784,'NO3-','97,6');      SELECT ins_m(784,'NO2-','3,20');
SELECT ins_m(784,'SO4','—');          SELECT ins_m(784,'Cl-','1326');
SELECT ins_m(784,'Fe2+','0,61');      SELECT ins_m(784,'Fe3+','8,40');
SELECT ins_m(784,'Fe_total','8,40');  SELECT ins_m(784,'Cu','0,017');
SELECT ins_m(784,'OilProd','0,027');  SELECT ins_m(784,'Mn','0,027');
SELECT ins_m(784,'DR','2262');        SELECT ins_m(784,'Ni','<0,0010');
SELECT ins_m(784,'ALK','2,00');       SELECT ins_m(784,'F-','1,00');
SELECT ins_m(784,'Si','<0,50');       SELECT ins_m(784,'Mo','<0,0010');
SELECT ins_m(784,'density','0,98');

-- ─── ПДК для питьевой воды (СТ РК ГОСТ Р 51232) ─────────────
INSERT INTO norms (parameter_id, norm_type, limit_value, limit_type, unit, norm_doc) VALUES
((SELECT id FROM parameters WHERE formula='smell'),    'питьевая', 2,    '≤', 'балл',          'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='taste'),    'питьевая', 2,    '≤', 'балл',          'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='color'),    'питьевая', 20,   '≤', 'гр. цветности', 'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='turbidity'),'питьевая', 2.6,  '≤', 'ЕМФ',           'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='pH_lab'),   'питьевая', 6.0,  '≥', 'ед. pH',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='pH_lab'),   'питьевая', 9.0,  '≤', 'ед. pH',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='TDS'),      'питьевая', 1000, '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='TH'),       'питьевая', 7.0,  '≤', 'мг-экв/дм³',   'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='NO3-'),     'питьевая', 45,   '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='NO2-'),     'питьевая', 3.0,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='SO4'),      'питьевая', 500,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='Cl-'),      'питьевая', 350,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='Fe_total'), 'питьевая', 0.3,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='Mn'),       'питьевая', 0.1,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='F-'),       'питьевая', 1.5,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='NH4+'),     'питьевая', 0.5,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='Cu'),       'питьевая', 1.0,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='Ni'),       'питьевая', 0.02, '≤', 'мг/дм³',        'СанПиН 2.1.4.1074'),
((SELECT id FROM parameters WHERE formula='OilProd'),  'питьевая', 0.1,  '≤', 'мг/дм³',        'СанПиН 2.1.4.1074');

DROP FUNCTION IF EXISTS ins_m(INT, TEXT, TEXT);
