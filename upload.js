'use strict';

let parsedProtocol = null;
let excelProtocol = null;

const ANTHROPIC_PROXY    = 'https://anthropic-proxy.romanyukin01.workers.dev/';
const API_KEY_STORAGE    = 'rg_anthropic_api_key';
const GEMINI_KEY_STORAGE = 'rg_gemini_api_key';
// Each entry: [model, api_version, auth_method]
// auth: 'key' = ?key=..., 'header' = x-goog-api-key header
const GEMINI_MODELS = [
  ['gemini-2.5-flash',          'v1beta', 'key'   ],
  ['gemini-2.5-flash',          'v1beta', 'header'],
  ['gemini-2.5-flash-preview-05-20', 'v1beta', 'key'   ],
  ['gemini-2.5-flash-preview-05-20', 'v1beta', 'header'],
  ['gemini-1.5-flash-latest',   'v1beta', 'key'   ],
  ['gemini-1.5-flash-latest',   'v1beta', 'header'],
  ['gemini-1.5-flash-002',      'v1beta', 'key'   ],
  ['gemini-1.5-flash-002',      'v1beta', 'header'],
  ['gemini-1.5-flash-001',      'v1beta', 'key'   ],
  ['gemini-1.5-flash-001',      'v1beta', 'header'],
  ['gemini-2.0-flash-lite',     'v1beta', 'key'   ],
  ['gemini-2.0-flash-lite',     'v1beta', 'header'],
  ['gemini-2.0-flash',          'v1beta', 'key'   ],
  ['gemini-2.0-flash',          'v1beta', 'header'],
  ['gemini-1.5-flash',          'v1',     'key'   ],
  ['gemini-1.5-flash',          'v1',     'header'],
];
const GEMINI_HOST = 'https://generativelanguage.googleapis.com';

let currentProvider = 'gemini';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatExcelDate(val) {
  if (val == null || val === '') return null;
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  if (typeof val === 'string') {
    const m = val.match(/(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    const m2 = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m2) return val.slice(0, 10);
  }
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

function setupDropZone(zoneId, inputId, onFile) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  });
  input.addEventListener('change', () => { if (input.files[0]) onFile(input.files[0]); });
}

function buildPrompt() {
  const formulaList = [
    'smell', 'taste', 'color', 'turbidity', 'clarity',
    'pH_lab', 'pH_field', 'density',
    'TDS', 'TH', 'alkalinity', 'dry_residue',
    'NO3-', 'NO2-', 'SO4', 'Cl-', 'HCO3-', 'CO3', 'F-', 'PO4', 'Br',
    'Na+', 'K+', 'Ca2+', 'Mg2+', 'NH4+', 'NH3_NH4',
    'Fe_total', 'Fe2+', 'Fe3+', 'Mn', 'Cu', 'Ni', 'Al', 'Ba', 'Be',
    'B', 'Cd', 'As', 'Hg', 'Pb', 'Se', 'Sr', 'Cr', 'Zn',
    'Si', 'Mo', 'CN-', 'OilProd', 'APAV', 'phenols', 'COD', 'BOD5'
  ].join(', ');

  return `Ты — парсер химических протоколов анализа воды. Извлеки все данные из предоставленного PDF-документа и верни ТОЛЬКО валидный JSON без каких-либо пояснений, без markdown-обёртки.\n\nСтруктура JSON:\n{\n  "protocol_number": "334/4",\n  "series": "334",\n  "sampling_date_from": "2024-06-10",\n  "sampling_date_to": "2024-06-12",\n  "issued_at": "2024-06-20",\n  "samples": [\n    {\n      "lab_number": 726,\n      "client_number": 1,\n      "point_name": "До фильтра",\n      "point_type": "фильтр",\n      "sampling_date": "2024-06-10",\n      "measurements": [\n        { "formula": "pH_lab", "raw_value": "7.7", "numeric_value": 7.7, "is_less_than": false },\n        { "formula": "TDS", "raw_value": "<0.01", "numeric_value": 0.01, "is_less_than": true }\n      ]\n    }\n  ]\n}\n\nПравила:\n- Все даты в формате YYYY-MM-DD\n- lab_number и client_number — числа\n- Для значения "<0.01": numeric_value=0.01, is_less_than=true\n- raw_value — строка как в документе\n- Используй только коды формул: ${formulaList}\n- series — часть номера протокола до "/", верни ТОЛЬКО JSON`;
}

function cleanJson(text) {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
}

async function callAnthropicApi(base64, apiKey) {
  const response = await fetch(ANTHROPIC_PROXY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 32000,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: buildPrompt() }
        ]
      }]
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();
  return cleanJson(data.content?.[0]?.text || '');
}

async function callGeminiApi(base64, apiKey) {
  const body = JSON.stringify({
    contents: [{
      parts: [
        { inline_data: { mime_type: 'application/pdf', data: base64 } },
        { text: buildPrompt() }
      ]
    }],
    generationConfig: { maxOutputTokens: 32000, temperature: 0 }
  });

  let lastError = '';
  for (const [model, ver, auth] of GEMINI_MODELS) {
    const label = `${model} (${ver}, ${auth})`;
    console.log(`Gemini: пробую ${label}...`);
    const btn = document.getElementById('btn-parse-pdf');
    if (btn) btn.textContent = `⏳ ${model}...`;

    const url = auth === 'key'
      ? `${GEMINI_HOST}/${ver}/models/${model}:generateContent?key=${apiKey}`
      : `${GEMINI_HOST}/${ver}/models/${model}:generateContent`;
    const headers = { 'Content-Type': 'application/json' };
    if (auth === 'header') headers['x-goog-api-key'] = apiKey;

    // 90-second timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });
    } catch (fetchErr) {
      clearTimeout(timer);
      if (fetchErr.name === 'AbortError') { lastError = `Таймаут (${model})`; continue; }
      throw fetchErr;
    }
    clearTimeout(timer);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      lastError = err.error?.message || `HTTP ${response.status}`;
      console.warn(`Gemini ${label}: ${lastError}`);
      if (response.status === 404 || response.status === 429 || response.status === 503 ||
          response.status === 401 || response.status === 403 ||
          lastError.includes('not found') || lastError.includes('not supported') ||
          lastError.includes('quota') || lastError.includes('limit: 0') ||
          lastError.includes('credentials') || lastError.includes('permission') ||
          lastError.includes('high demand') || lastError.includes('overloaded')) {
        if (response.status === 503) await new Promise(r => setTimeout(r, 3000));
        continue;
      }
    }

    const data = await response.json();
    console.log(`Gemini ${model} ответ:`, JSON.stringify(data).slice(0, 300));

    // Check finish reason
    const candidate = data.candidates?.[0];
    const finishReason = candidate?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      lastError = `Модель остановилась: ${finishReason}`;
      console.warn(`Gemini ${label}: ${lastError}`);
      if (finishReason === 'MAX_TOKENS') {
        // partial response — try to use it anyway
        const partial = candidate?.content?.parts?.[0]?.text || '';
        if (partial.length > 100) { console.log('Используем частичный ответ'); return cleanJson(partial); }
      }
      continue;
    }

    const text = candidate?.content?.parts?.[0]?.text || '';
    if (!text) { lastError = 'Пустой ответ от модели'; continue; }
    console.log(`Gemini: успех с ${label}, текст: ${text.slice(0, 100)}...`);
    return cleanJson(text);
  }
  throw new Error('Gemini не смог обработать PDF. ' + lastError);
}

async function parsePdf() {
  const input = document.getElementById('pdf-file-input');
  const file  = input && input.files[0];
  if (!file) { toast('Выберите PDF файл', 'err'); return; }

  const btn = document.getElementById('btn-parse-pdf');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Анализ PDF...'; }

  try {
    const base64 = await fileToBase64(file);
    let jsonText;

    if (currentProvider === 'gemini') {
      const keyInput = document.getElementById('gemini-api-key');
      const apiKey = (keyInput?.value.trim()) || localStorage.getItem(GEMINI_KEY_STORAGE) || '';
      if (!apiKey) { toast('Введите Google Gemini API ключ', 'err'); return; }
      localStorage.setItem(GEMINI_KEY_STORAGE, apiKey);
      if (keyInput && !keyInput.value.trim()) keyInput.value = apiKey;
      jsonText = await callGeminiApi(base64, apiKey);
    } else {
      const keyInput = document.getElementById('anthropic-api-key');
      const apiKey = (keyInput?.value.trim()) ||
        localStorage.getItem(API_KEY_STORAGE) ||
        (typeof ANTHROPIC_API_KEY !== 'undefined' ? ANTHROPIC_API_KEY : '');
      if (!apiKey) { toast('Введите Anthropic API ключ', 'err'); return; }
      localStorage.setItem(API_KEY_STORAGE, apiKey);
      if (keyInput && !keyInput.value.trim()) keyInput.value = apiKey;
      jsonText = await callAnthropicApi(base64, apiKey);
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (jsonErr) {
      console.error('Ошибка JSON парсинга. Ответ AI:', jsonText?.slice(0, 500));
      throw new Error('AI вернул невалидный JSON. Попробуйте ещё раз или используйте другой провайдер.');
    }
    if (!parsed?.samples?.length) throw new Error('Пробы не найдены в PDF. Возможно, формат документа не распознан.');
    parsedProtocol = parsed;
    renderPdfPreview(parsedProtocol);
    toast(`✅ Извлечено ${parsedProtocol.samples.length} проб`, 'ok');
  } catch (e) {
    toast('Ошибка: ' + e.message, 'err');
    console.error(e);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔍 Извлечь данные'; }
  }
}

function renderPdfPreview(protocol) {
  const container = document.getElementById('pdf-preview');
  if (!container) return;

  const allFormulas = [...new Set(
    protocol.samples.flatMap(s => s.measurements.map(m => m.formula))
  )];

  let html = `<div class="preview-meta">
    <strong>Протокол:</strong> ${protocol.protocol_number} &nbsp;|
    <strong>Серия:</strong> ${protocol.series} &nbsp;|
    <strong>Дата:</strong> ${protocol.sampling_date_from}${protocol.sampling_date_to ? ' – ' + protocol.sampling_date_to : ''} &nbsp;|
    <strong>Проб:</strong> ${protocol.samples.length}
  </div>
  <div class="table-wrap"><table>
    <thead><tr>
      <th>Лаб. №</th><th>№ заказ.</th><th>Точка</th><th>Тип</th><th>Дата</th>
      ${allFormulas.map(f => `<th>${f}</th>`).join('')}
    </tr></thead>
    <tbody>`;

  for (const s of protocol.samples) {
    const map = Object.fromEntries(s.measurements.map(m => [m.formula, m]));
    html += `<tr>
      <td><b>${s.lab_number}</b></td>
      <td>${s.client_number ?? ''}</td>
      <td>${s.point_name ?? ''}</td>
      <td>${s.point_type ?? ''}</td>
      <td>${s.sampling_date ?? ''}</td>
      ${allFormulas.map(f => {
        const m = map[f];
        if (!m) return '<td>—</td>';
        const val = m.is_less_than ? `<${m.numeric_value}` : m.raw_value;
        const limit = (typeof G !== 'undefined' && G.pdkNorms?.[f]) || (typeof PDK !== 'undefined' && PDK[f]);
        return `<td class="${limit && m.numeric_value > limit ? 'cell-warn' : ''}">${val}</td>`;
      }).join('')}
    </tr>`;
  }

  html += '</tbody></table></div>';
  container.innerHTML = html;
  container.style.display = 'block';

  const actions = document.getElementById('pdf-preview-actions');
  if (actions) actions.style.display = 'flex';
}

async function resolveOrCreatePoint(pointName, pointType) {
  if (!G.points) G.points = [];
  const lower = (pointName || '').toLowerCase().trim();
  let point = G.points.find(p =>
    (p.name || '').toLowerCase().trim() === lower ||
    (p.code || '').toLowerCase().trim() === lower
  );
  if (!point) {
    const code = 'PT_' + Date.now().toString(36).toUpperCase();
    const { data, error } = await sb.from('sampling_points')
      .insert({ name: pointName, code, type: pointType || null })
      .select().single();
    if (error) throw new Error('Ошибка создания точки: ' + error.message);
    point = data;
    G.points.push(point);
  }
  return point;
}

async function upsertProtocol(protocol) {
  const { data: existing } = await sb.from('protocols').select('id')
    .eq('number', protocol.protocol_number).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await sb.from('protocols').insert({
    number: protocol.protocol_number,
    series: protocol.series || null,
    sampling_date_from: protocol.sampling_date_from || null,
    sampling_date_to: protocol.sampling_date_to || null,
    issued_at: protocol.issued_at || null,
    client_id: 1,
    lab_id: 1
  }).select('id').single();

  if (error) throw new Error('Ошибка создания протокола: ' + error.message);
  return data.id;
}

async function saveProtocolData(protocol, onProgress) {
  if (!G.params) G.params = [];
  const total = protocol.samples.length;
  let done = 0;

  const protocolId = await upsertProtocol(protocol);
  onProgress?.(5, `Протокол создан, сохраняю пробы (0/${total})...`);

  let savedSamples = 0, savedMeasurements = 0;

  for (const s of protocol.samples) {
    const point = await resolveOrCreatePoint(s.point_name, s.point_type);

    const { data: existing } = await sb.from('samples').select('id')
      .eq('lab_number', s.lab_number).maybeSingle();

    let sampleId;
    if (existing) {
      sampleId = existing.id;
    } else {
      const { data, error } = await sb.from('samples').insert({
        lab_number: s.lab_number,
        client_number: s.client_number ?? null,
        protocol_id: protocolId,
        point_id: point.id,
        sampling_date: s.sampling_date || null,
        sample_type: 'Вода'
      }).select('id').single();
      if (error) throw new Error('Ошибка создания пробы: ' + error.message);
      sampleId = data.id;
      savedSamples++;
    }

    for (const m of s.measurements) {
      const param = G.params.find(p => p.formula === m.formula);
      if (!param) continue;
      const { error } = await sb.from('measurements').upsert({
        sample_id: sampleId,
        parameter_id: param.id,
        raw_value: m.raw_value ?? null,
        numeric_value: m.numeric_value ?? null,
        is_less_than: m.is_less_than ?? false
      }, { onConflict: 'sample_id,parameter_id' });
      if (!error) savedMeasurements++;
    }

    done++;
    const pct = 5 + Math.round((done / total) * 90);
    onProgress?.(pct, `Сохранено проб: ${done}/${total}...`);
  }
  return { savedSamples, savedMeasurements };
}

function setProgress(wrapId, labelId, barId, pct, label) {
  const wrap = document.getElementById(wrapId);
  const bar = document.getElementById(barId);
  const lbl = document.getElementById(labelId);
  if (!wrap) return;
  wrap.style.display = pct === null ? 'none' : 'block';
  if (bar) bar.style.width = (pct ?? 0) + '%';
  if (lbl) lbl.textContent = label || '';
}

async function saveParsedProtocol() {
  if (!parsedProtocol) { toast('Нет данных для сохранения', 'err'); return; }
  const btn = document.getElementById('btn-save-pdf');
  if (btn) btn.disabled = true;
  setProgress('pdf-save-progress', 'pdf-progress-label', 'pdf-progress-bar', 0, 'Создание протокола...');
  try {
    const { savedSamples, savedMeasurements } = await saveProtocolData(
      parsedProtocol,
      (pct, label) => setProgress('pdf-save-progress', 'pdf-progress-label', 'pdf-progress-bar', pct, label)
    );
    setProgress('pdf-save-progress', 'pdf-progress-label', 'pdf-progress-bar', 100, '✅ Готово!');
    setTimeout(() => setProgress('pdf-save-progress', 'pdf-progress-label', 'pdf-progress-bar', null), 1500);
    toast(`✅ Сохранено: ${savedSamples} проб, ${savedMeasurements} измерений`, 'ok');
    G.samplesLoaded = false;
    parsedProtocol = null;
    document.getElementById('pdf-preview').style.display = 'none';
    document.getElementById('pdf-preview-actions').style.display = 'none';
  } catch (e) {
    setProgress('pdf-save-progress', 'pdf-progress-label', 'pdf-progress-bar', null);
    toast('Ошибка сохранения: ' + e.message, 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Сохранить в Supabase'; }
  }
}

async function downloadExcelTemplate() {
  if (!G.points?.length || !G.params?.length) await initUploadTab();
  const wb = XLSX.utils.book_new();

  const instrWs = XLSX.utils.aoa_to_sheet([
    ['Шаблон загрузки данных — ТОО «RG Gold»'], [''],
    ['Инструкция:'],
    ['1. Лист "Протокол" — заполните общие сведения (поля со * обязательны)'],
    ['2. Лист "Пробы" — одна строка = одна проба. Лаб. №, Код точки, Дата — обязательны'],
    ['3. Значения типа "<0.01" вводите со знаком "<" — система распознаёт автоматически'],
    ['4. Загрузите заполненный файл на портал (вкладка «Загрузка → Excel»)'],
  ]);
  XLSX.utils.book_append_sheet(wb, instrWs, 'Инструкция');

  const protoWs = XLSX.utils.aoa_to_sheet([
    ['Поле', 'Значение'],
    ['Номер протокола *', ''], ['Серия *', ''],
    ['Дата отбора (от) *', ''], ['Дата отбора (до)', ''], ['Дата выдачи', ''],
  ]);
  protoWs['!cols'] = [{wch: 30}, {wch: 25}];
  XLSX.utils.book_append_sheet(wb, protoWs, 'Протокол');

  const paramHeaders = G.params.map(p => `${p.formula}\n${p.name_ru || ''}`);
  const headerRow = ['Лаб. № *', '№ заказчика', 'Код точки *', 'Название точки', 'Тип точки', 'Дата отбора *', ...paramHeaders];
  const exampleRow = [
    726, 1,
    G.points[0]?.code || 'PT001',
    G.points[0]?.name || 'Пример точки',
    G.points[0]?.type || 'скважина',
    new Date().toISOString().slice(0, 10),
    ...G.params.map(() => '')
  ];
  const probesWs = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
  probesWs['!cols'] = [{wch:10},{wch:12},{wch:18},{wch:28},{wch:14},{wch:14},...G.params.map(()=>({wch:12}))];
  XLSX.utils.book_append_sheet(wb, probesWs, 'Пробы');

  const pointsWs = XLSX.utils.aoa_to_sheet([
    ['Код', 'Название', 'Тип'],
    ...G.points.map(p => [p.code, p.name, p.type || ''])
  ]);
  pointsWs['!cols'] = [{wch:20},{wch:35},{wch:15}];
  XLSX.utils.book_append_sheet(wb, pointsWs, 'Справочник точек');

  const paramsWs = XLSX.utils.aoa_to_sheet([
    ['Формула', 'Название', 'Ед. изм.', 'ПДК питьевая'],
    ...G.params.map(p => [
      p.formula, p.name_ru || '', p.unit || '',
      (typeof PDK !== 'undefined' && PDK[p.formula] != null) ? PDK[p.formula] : ''
    ])
  ]);
  paramsWs['!cols'] = [{wch:15},{wch:38},{wch:14},{wch:16}];
  XLSX.utils.book_append_sheet(wb, paramsWs, 'Параметры');

  XLSX.writeFile(wb, 'RGGold_Шаблон_Протокол.xlsx');
  toast('✅ Шаблон Excel скачан', 'ok');
}

function parseExcelFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array', cellDates: false });

      const protoSheet = wb.Sheets['Протокол'];
      if (!protoSheet) throw new Error('Лист "Протокол" не найден');
      const protoRows = XLSX.utils.sheet_to_json(protoSheet, { header: 1, defval: '' });
      const protoMap = {};
      for (const row of protoRows) { if (row[0]) protoMap[String(row[0]).trim()] = row[1]; }

      const probesSheet = wb.Sheets['Пробы'];
      if (!probesSheet) throw new Error('Лист "Пробы" не найден');
      const probesRows = XLSX.utils.sheet_to_json(probesSheet, { header: 1, defval: '' });
      if (probesRows.length < 2) throw new Error('Лист "Пробы" пуст');

      const headerRow = probesRows[0].map(h => String(h).trim());
      const paramStartCol = 6;
      const paramFormulas = headerRow.slice(paramStartCol).map(h => h.split('\n')[0].trim());

      const samples = [];
      for (let i = 1; i < probesRows.length; i++) {
        const row = probesRows[i];
        if (!row[0] && !row[2]) continue;
        const measurements = [];
        for (let j = 0; j < paramFormulas.length; j++) {
          const formula = paramFormulas[j];
          if (!formula) continue;
          const raw = String(row[paramStartCol + j] ?? '').trim();
          if (!raw || raw === '—') continue;
          const isLess = raw.startsWith('<');
          const numVal = parseFloat((isLess ? raw.slice(1) : raw).replace(',', '.'));
          measurements.push({ formula, raw_value: raw, numeric_value: isNaN(numVal) ? null : numVal, is_less_than: isLess });
        }
        samples.push({
          lab_number: Number(row[0]) || null,
          client_number: row[1] !== '' ? Number(row[1]) : null,
          point_code: String(row[2] || '').trim(),
          point_name: String(row[3] || '').trim(),
          point_type: String(row[4] || '').trim() || null,
          sampling_date: formatExcelDate(row[5]),
          measurements
        });
      }

      excelProtocol = {
        protocol_number: String(protoMap['Номер протокола *'] || '').trim(),
        series: String(protoMap['Серия *'] || '').trim(),
        sampling_date_from: formatExcelDate(protoMap['Дата отбора (от) *']),
        sampling_date_to: formatExcelDate(protoMap['Дата отбора (до)']) || null,
        issued_at: formatExcelDate(protoMap['Дата выдачи']) || null,
        samples
      };
      renderExcelPreview(excelProtocol, paramFormulas);
      toast(`✅ Excel прочитан: ${samples.length} проб`, 'ok');
    } catch (err) {
      toast('Ошибка чтения: ' + err.message, 'err');
    }
  };
  reader.readAsArrayBuffer(file);
}

function renderExcelPreview(protocol, allFormulas) {
  const container = document.getElementById('excel-preview');
  if (!container) return;
  const vis = allFormulas.slice(0, 10);
  const hidden = allFormulas.length - vis.length;
  let html = `<div class="preview-meta">
    <strong>Протокол:</strong> ${protocol.protocol_number || '—'} &nbsp;|
    <strong>Серия:</strong> ${protocol.series || '—'} &nbsp;|
    <strong>Проб:</strong> ${protocol.samples.length} &nbsp;|
    <strong>Показателей:</strong> ${allFormulas.length}
  </div>
  <div class="table-wrap"><table>
    <thead><tr>
      <th>Лаб.№</th><th>Код точки</th><th>Название точки</th><th>Тип</th><th>Дата</th>
      ${vis.map(f => `<th>${f}</th>`).join('')}
      ${hidden > 0 ? `<th>+${hidden} ещё</th>` : ''}
    </tr></thead><tbody>`;
  for (const s of protocol.samples) {
    const map = Object.fromEntries(s.measurements.map(m => [m.formula, m]));
    html += `<tr>
      <td><b>${s.lab_number ?? ''}</b></td>
      <td>${s.point_code ?? ''}</td><td>${s.point_name ?? ''}</td>
      <td>${s.point_type ?? ''}</td><td>${s.sampling_date ?? ''}</td>
      ${vis.map(f => {
        const m = map[f]; if (!m) return '<td>—</td>';
        const val = m.is_less_than ? `<${m.numeric_value}` : m.raw_value;
        const limit = (typeof G !== 'undefined' && G.pdkNorms?.[f]) || (typeof PDK !== 'undefined' && PDK[f]);
        return `<td class="${limit && m.numeric_value > limit ? 'cell-warn' : ''}">${val}</td>`;
      }).join('')}
      ${hidden > 0 ? '<td>…</td>' : ''}
    </tr>`;
  }
  html += '</tbody></table></div>';
  container.innerHTML = html;
  container.style.display = 'block';
  const saveBtn = document.getElementById('btn-save-excel');
  if (saveBtn) saveBtn.style.display = 'inline-flex';
}

async function saveExcelData() {
  if (!excelProtocol) { toast('Нет данных для сохранения', 'err'); return; }
  const btn = document.getElementById('btn-save-excel');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Сохранение...'; }
  const protocol = {
    ...excelProtocol,
    samples: excelProtocol.samples.map(s => ({
      ...s,
      point_name: s.point_name || s.point_code
    }))
  };
  try {
    const { savedSamples, savedMeasurements } = await saveProtocolData(protocol);
    toast(`✅ Сохранено: ${savedSamples} проб, ${savedMeasurements} измерений`, 'ok');
    G.samplesLoaded = false;
    excelProtocol = null;
    document.getElementById('excel-preview').style.display = 'none';
    document.getElementById('btn-save-excel').style.display = 'none';
  } catch (e) {
    toast('Ошибка сохранения: ' + e.message, 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Сохранить в Supabase'; }
  }
}

async function initUploadTab() {
  if (G.uploadBuilt) return;
  G.uploadBuilt = true;

  // Restore saved keys
  const savedAnthropic = localStorage.getItem(API_KEY_STORAGE);
  if (savedAnthropic) {
    const k = document.getElementById('anthropic-api-key');
    if (k) k.value = savedAnthropic;
  }
  const savedGemini = localStorage.getItem(GEMINI_KEY_STORAGE);
  if (savedGemini) {
    const k = document.getElementById('gemini-api-key');
    if (k) k.value = savedGemini;
  }

  // Provider tab switching
  document.querySelectorAll('.provider-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.provider-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentProvider = tab.dataset.provider;
      document.getElementById('key-block-gemini').style.display    = currentProvider === 'gemini'    ? '' : 'none';
      document.getElementById('key-block-anthropic').style.display = currentProvider === 'anthropic' ? '' : 'none';
    });
  });

  if (!G.points?.length) {
    const { data } = await sb.from('sampling_points').select('*').order('name');
    G.points = data || [];
  }
  if (!G.params?.length) {
    const { data } = await sb.from('parameters').select('*').order('id');
    G.params = data || [];
  }

  setupDropZone('pdf-drop-zone', 'pdf-file-input', file => {
    const lbl = document.getElementById('pdf-filename');
    if (lbl) lbl.textContent = '📄 ' + file.name;
  });

  setupDropZone('excel-drop-zone', 'excel-file-input', file => {
    const lbl = document.getElementById('excel-filename');
    if (lbl) lbl.textContent = '📊 ' + file.name;
    parseExcelFile(file);
  });

  document.getElementById('excel-file-input')?.addEventListener('change', e => {
    if (e.target.files[0]) {
      const lbl = document.getElementById('excel-filename');
      if (lbl) lbl.textContent = '📊 ' + e.target.files[0].name;
      parseExcelFile(e.target.files[0]);
    }
  });

  document.getElementById('btn-parse-pdf')?.addEventListener('click', parsePdf);
  document.getElementById('btn-save-pdf')?.addEventListener('click', saveParsedProtocol);
  document.getElementById('btn-download-template')?.addEventListener('click', downloadExcelTemplate);
  document.getElementById('btn-save-excel')?.addEventListener('click', saveExcelData);
}
