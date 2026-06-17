/* ============================================================
   ХИМИЧЕСКИЙ АНАЛИЗ ВОДЫ — RG Gold
   Главный модуль приложения
   ============================================================ */

// ── Supabase ──────────────────────────────────────────────
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── ПДК питьевой воды (запасные значения) ─────────────────
const PDK = {
  smell: 2, taste: 2, color: 20, turbidity: 2.6,
  TDS: 1000, TH: 7.0, 'NO3-': 45, 'NO2-': 3.0,
  SO4: 500, 'Cl-': 350, Fe_total: 0.3, Mn: 0.1,
  'F-': 1.5, 'NH4+': 0.5, Cu: 1.0, OilProd: 0.1, Ni: 0.02
};

// ── Глобальный кэш ────────────────────────────────────────
let G = { summary: [], measurements: [], params: [], points: [], pdkNorms: {}, charts: {} };

// ── Tabs ──────────────────────────────────────────────────
document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    panel.classList.add('active');
    if (btn.dataset.tab === 'comparison' && !G.chartsBuilt) buildCharts();
    if (btn.dataset.tab === 'exceedances' && !G.exceedBuilt) buildExceedances();
    if (btn.dataset.tab === 'entry' && !G.entryBuilt) buildEntryForm();
    if (btn.dataset.tab === 'upload'   && !G.uploadBuilt)   initUploadTab();
    if (btn.dataset.tab === 'analysis' && !G.analysisBuilt) initAnalysisTab();
  });
});

// ── Toast ──────────────────────────────────────────────────
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg; el.className = 'show ' + type;
  setTimeout(() => el.className = '', 3000);
}

// ── Helpers ───────────────────────────────────────────────
function fmt(v, decimals = 2) {
  if (v === null || v === undefined || v === '') return '—';
  const n = parseFloat(v);
  return isNaN(n) ? v : n.toLocaleString('ru-RU', { maximumFractionDigits: decimals });
}
function pdkClass(formula, value) {
  const limit = G.pdkNorms[formula] ?? PDK[formula];
  if (!limit || value === null || value === undefined) return '';
  const ratio = value / limit;
  if (ratio > 10) return 'cell-danger2';
  if (ratio > 3)  return 'cell-danger';
  if (ratio > 1)  return 'cell-warn';
  return 'cell-ok';
}
function pdkRatio(formula, value) {
  const limit = G.pdkNorms[formula] ?? PDK[formula];
  if (!limit || !value) return null;
  return value / limit;
}
function typeBadge(type) {
  return `<span class="badge-type">${type ?? ''}</span>`;
}

// ── Load norms from DB ────────────────────────────────────
async function loadNorms() {
  const { data } = await sb.from('norms')
    .select('parameter_id, limit_value, parameters(formula)')
    .eq('norm_type', 'питьевая').eq('limit_type', '≤');
  if (data) data.forEach(r => { if (r.parameters?.formula) G.pdkNorms[r.parameters.formula] = r.limit_value; });
}

// ══════════════════════════════════════════════════════════
//  ДАШБОРД
// ══════════════════════════════════════════════════════════
async function loadDashboard() {
  const statusEl = document.getElementById('connection-status');
  try {
    // Все запросы параллельно — вместо 4 последовательных
    const [normsRes, summaryRes, paramsRes, measRes] = await Promise.all([
      sb.from('norms').select('parameter_id, limit_value, parameters(formula)').eq('norm_type','питьевая').eq('limit_type','≤'),
      sb.from('v_summary').select('*').order('lab_number'),
      sb.from('parameters').select('id', { count: 'exact', head: true }),
      sb.from('v_measurements_full').select('formula,numeric_value,is_less_than')
    ]);

    if (summaryRes.error) throw summaryRes.error;

    // Нормы
    (normsRes.data || []).forEach(r => { if (r.parameters?.formula) G.pdkNorms[r.parameters.formula] = r.limit_value; });

    // Сводка
    G.summary = summaryRes.data || [];
    statusEl.textContent = '✅ Supabase подключён';
    statusEl.className = 'ok';

    // KPI
    document.getElementById('kpi-samples').textContent   = G.summary.length;
    document.getElementById('kpi-protocols').textContent = [...new Set(G.summary.map(r => r.protocol))].length;
    document.getElementById('kpi-params').textContent    = paramsRes.count ?? 49;

    // Кэшируем измерения для вкладки превышений
    G.allMeasurements = measRes.data || [];
    let exceed = 0;
    G.allMeasurements.forEach(r => {
      if (r.is_less_than) return;
      const limit = G.pdkNorms[r.formula] ?? PDK[r.formula];
      if (limit && r.numeric_value > limit) exceed++;
    });
    document.getElementById('kpi-exceed').textContent = exceed;
    G.exceedCount = exceed;

    renderSummaryTable();
    renderSeriesChart();

  } catch (e) {
    statusEl.textContent = '❌ Нет соединения';
    statusEl.className = 'err';
    console.error(e);
    loadDemoData();
  }
}

function renderSummaryTable() {
  const tbody = document.getElementById('summary-tbody');
  document.getElementById('summary-count').textContent = G.summary.length + ' проб';

  if (!G.summary.length) { tbody.innerHTML = '<tr><td colspan="11" class="empty">Нет данных</td></tr>'; return; }

  tbody.innerHTML = G.summary.map(r => {
    const exceeds = [
      pdkRatio('TDS', r.mineralization_mg_l), pdkRatio('TH', r.hardness_meq_l),
      pdkRatio('Cl-', r.chlorides_mg_l), pdkRatio('SO4', r.sulfates_mg_l),
      pdkRatio('Fe_total', r.fe_total_mg_l), pdkRatio('NO3-', r.nitrates_mg_l)
    ].filter(v => v && v > 1);
    const badge = exceeds.length
      ? `<span class="badge-danger">⚠ ${exceeds.length} превышений</span>`
      : `<span class="badge-ok">✓ В норме</span>`;
    return `<tr>
      <td><b>${r.lab_number}</b></td>
      <td>${r.point_name}</td>
      <td>${typeBadge(r.point_type)}</td>
      <td class="${pdkClass('pH_lab', r.ph_lab)}">${fmt(r.ph_lab, 1)}</td>
      <td class="${pdkClass('TDS', r.mineralization_mg_l)}">${fmt(r.mineralization_mg_l, 0)}</td>
      <td class="${pdkClass('TH', r.hardness_meq_l)}">${fmt(r.hardness_meq_l, 1)}</td>
      <td class="${pdkClass('Cl-', r.chlorides_mg_l)}">${fmt(r.chlorides_mg_l, 0)}</td>
      <td class="${pdkClass('SO4', r.sulfates_mg_l)}">${fmt(r.sulfates_mg_l, 0)}</td>
      <td class="${pdkClass('Fe_total', r.fe_total_mg_l)}">${fmt(r.fe_total_mg_l, 3)}</td>
      <td class="${pdkClass('NO3-', r.nitrates_mg_l)}">${fmt(r.nitrates_mg_l, 1)}</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
}


function renderSeriesChart() {
  const params = ['Минерализация', 'Хлориды', 'Сульфаты', 'Нитраты'];
  const formulas = ['TDS', 'Cl-', 'SO4', 'NO3-'];
  const fields   = ['mineralization_mg_l', 'chlorides_mg_l', 'sulfates_mg_l', 'nitrates_mg_l'];

  const s334 = G.summary.filter(r => r.protocol?.startsWith('334'));
  const s354 = G.summary.filter(r => r.protocol?.startsWith('354'));
  const avg = (arr, field) => {
    const vals = arr.map(r => r[field]).filter(v => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const ctx = document.getElementById('chart-series').getContext('2d');
  if (G.charts.series) G.charts.series.destroy();
  G.charts.series = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: params,
      datasets: [
        { label: 'Серия 334', data: fields.map(f => avg(s334, f)), backgroundColor: 'rgba(46,117,182,.7)', borderColor: '#2E75B6', borderWidth: 1 },
        { label: 'Серия 354', data: fields.map(f => avg(s354, f)), backgroundColor: 'rgba(31,78,121,.7)', borderColor: '#1F4E79', borderWidth: 1 },
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });
}

// ══════════════════════════════════════════════════════════
//  ПРОБЫ
// ══════════════════════════════════════════════════════════
async function loadSamples() {
  if (G.samplesLoaded) return;
  const tbody = document.getElementById('samples-tbody');
  tbody.innerHTML = '<tr><td colspan="10" class="loading"></td></tr>';

  const { data, error } = await sb.from('v_summary').select('*').order('lab_number');

  if (error || !data) { tbody.innerHTML = '<tr><td colspan="10" class="empty">Ошибка загрузки</td></tr>'; return; }

  const byLab = {};
  data.forEach(r => {
    byLab[r.lab_number] = {
      lab_number:    r.lab_number,
      protocol:      r.protocol,
      series:        r.series,
      point_name:    r.point_name,
      point_type:    r.point_type,
      sampling_date: r.sampling_date,
      params: {
        'pH_lab':   { raw: r.ph_lab,              val: r.ph_lab,              lt: false },
        'TDS':      { raw: r.mineralization_mg_l, val: r.mineralization_mg_l, lt: false },
        'TH':       { raw: r.hardness_meq_l,      val: r.hardness_meq_l,      lt: false },
        'Fe_total': { raw: r.fe_total_mg_l,       val: r.fe_total_mg_l,       lt: false },
      }
    };
  });
  G.samplesData = byLab;
  G.samplesLoaded = true;
  renderSamplesTable();
}

function renderSamplesTable() {
  const typeF   = document.getElementById('filter-type').value;
  const seriesF = document.getElementById('filter-series').value;
  const protoF  = document.getElementById('filter-protocol').value;
  const searchF = document.getElementById('filter-search').value.toLowerCase();
  const tbody   = document.getElementById('samples-tbody');

  const rows = Object.values(G.samplesData || {}).filter(r =>
    (!typeF   || r.point_type === typeF) &&
    (!seriesF || r.series === seriesF) &&
    (!protoF  || r.protocol === protoF) &&
    (!searchF || r.point_name?.toLowerCase().includes(searchF))
  );

  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="10" class="empty">Нет данных по фильтру</td></tr>'; return; }

  tbody.innerHTML = rows.map(r => {
    const p = r.params;
    const ph  = p['pH_lab']?.raw ?? '—';
    const tds = p['TDS']?.raw ?? '—';
    const th  = p['TH']?.raw ?? '—';
    const fe  = p['Fe_total']?.raw ?? '—';
    return `<tr>
      <td><button class="expand-btn" data-lab="${r.lab_number}" title="Раскрыть все параметры">▶</button></td>
      <td><b>${r.lab_number}</b></td>
      <td>${r.protocol}</td>
      <td>${r.point_name}</td>
      <td>${typeBadge(r.point_type)}</td>
      <td>${r.sampling_date ? new Date(r.sampling_date).toLocaleDateString('ru-RU') : '—'}</td>
      <td class="${pdkClass('pH_lab', p['pH_lab']?.val)}">${ph}</td>
      <td class="${pdkClass('TDS', p['TDS']?.val)}">${tds}</td>
      <td class="${pdkClass('TH', p['TH']?.val)}">${th}</td>
      <td class="${pdkClass('Fe_total', p['Fe_total']?.val)}">${fe}</td>
    </tr>
    <tr class="detail-row" id="detail-${r.lab_number}" style="display:none">
      <td colspan="10">
        <div class="detail-inner" id="detail-inner-${r.lab_number}"></div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleDetail(btn.dataset.lab, btn));
  });
}

async function toggleDetail(labNum, btn) {
  const row = document.getElementById('detail-' + labNum);
  const inner = document.getElementById('detail-inner-' + labNum);
  const isOpen = row.style.display !== 'none';
  row.style.display = isOpen ? 'none' : '';
  btn.classList.toggle('open', !isOpen);
  if (!isOpen && inner && !inner.innerHTML) {
    inner.innerHTML = '<div class="loading"></div>';
    const { data } = await sb.from('v_measurements_full')
      .select('parameter, unit, raw_value, numeric_value, formula, is_less_than')
      .eq('lab_number', labNum).order('category');
    if (data) renderDetailView(inner, labNum, data);
  }
}

['filter-type','filter-series','filter-protocol','filter-search'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => { if (G.samplesLoaded) renderSamplesTable(); });
});

// ══════════════════════════════════════════════════════════
//  ПРЕВЫШЕНИЯ ПДК
// ══════════════════════════════════════════════════════════
async function buildExceedances() {
  G.exceedBuilt = true;
  const tbody = document.getElementById('exceed-tbody');
  tbody.innerHTML = '<tr><td colspan="8" class="loading"></td></tr>';

  // Используем кэш если есть, иначе загружаем
  let data;
  if (G.exceedData) {
    data = G.exceedData;
  } else {
    const res = await sb.from('v_measurements_full')
      .select('lab_number,point_name,point_type,parameter,formula,unit,raw_value,numeric_value,is_less_than')
      .eq('is_less_than', false);
    if (res.error || !res.data) { tbody.innerHTML = '<tr><td colspan="8" class="empty">Ошибка загрузки</td></tr>'; return; }
    data = res.data;
    G.exceedData = data;
  }

  const exceedances = data
    .map(r => {
      const limit = G.pdkNorms[r.formula] ?? PDK[r.formula];
      if (!limit || !r.numeric_value || r.numeric_value <= limit) return null;
      return { ...r, limit, ratio: r.numeric_value / limit };
    })
    .filter(Boolean)
    .sort((a, b) => b.ratio - a.ratio);

  document.getElementById('exceed-count-badge').textContent = exceedances.length + ' нарушений';

  const crit = exceedances.filter(r => r.ratio > 10).length;
  const high = exceedances.filter(r => r.ratio > 3 && r.ratio <= 10).length;
  const med  = exceedances.filter(r => r.ratio > 1 && r.ratio <= 3).length;
  document.getElementById('severity-bar').innerHTML = `
    <div class="severity-item crit">🔴 Критично (>10×): ${crit}</div>
    <div class="severity-item high">🟠 Высокое (3–10×): ${high}</div>
    <div class="severity-item med">🟡 Умеренное (1–3×): ${med}</div>`;

  tbody.innerHTML = exceedances.map(r => {
    let cls = 'cell-warn', badge = `<span class="badge-warn">×${r.ratio.toFixed(1)}</span>`;
    if (r.ratio > 10) { cls = 'cell-danger2'; badge = `<span class="badge-danger">×${r.ratio.toFixed(1)} КРИТИЧНО</span>`; }
    else if (r.ratio > 3) { cls = 'cell-danger'; badge = `<span class="badge-danger">×${r.ratio.toFixed(1)}</span>`; }
    return `<tr>
      <td><b>${r.point_name}</b></td>
      <td>${typeBadge(r.point_type)}</td>
      <td>${r.lab_number}</td>
      <td>${r.parameter}</td>
      <td class="${cls}"><b>${r.raw_value}</b> ${r.unit}</td>
      <td>${r.limit} ${r.unit}</td>
      <td>${badge}</td>
      <td>${r.ratio > 10 ? '🔴 Критично' : r.ratio > 3 ? '🟠 Высокое' : '🟡 Умеренное'}</td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════
//  СРАВНЕНИЕ — ГРАФИКИ
// ══════════════════════════════════════════════════════════
let currentSeries = '';

document.querySelectorAll('.series-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.series-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSeries = btn.dataset.series;
    if (G.chartsBuilt) renderAllCharts();
  });
});

async function buildCharts() {
  G.chartsBuilt = true;
  const { data } = await sb.from('v_summary').select('*').order('lab_number');
  G.summaryAll = data || G.summary;
  renderAllCharts();
  renderFilterChart();
}

function getFilteredSummary() {
  if (!currentSeries) return G.summaryAll;
  return (G.summaryAll || []).filter(r => r.protocol?.startsWith(currentSeries));
}

function makeBarChart(canvasId, labels, values, pdk, color) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return;
  if (G.charts[canvasId]) G.charts[canvasId].destroy();
  const bgColors = values.map(v => v > pdk ? 'rgba(192,0,0,.7)' : color);
  G.charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Значение',
        data: values,
        backgroundColor: bgColors,
        borderWidth: 1,
        borderColor: bgColors.map(c => c.replace('.7', '1'))
      }, {
        label: `ПДК = ${pdk}`,
        data: labels.map(() => pdk),
        type: 'line',
        borderColor: '#C00000',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top', labels: { boxWidth: 14 } } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderAllCharts() {
  const data = getFilteredSummary();
  const labels = data.map(r => r.point_name?.substring(0, 16) ?? r.lab_number);
  makeBarChart('ch-tds',  labels, data.map(r => r.mineralization_mg_l ?? 0), 1000, 'rgba(46,117,182,.6)');
  makeBarChart('ch-cl',   labels, data.map(r => r.chlorides_mg_l ?? 0),      350,  'rgba(31,78,121,.6)');
  makeBarChart('ch-fe',   labels, data.map(r => r.fe_total_mg_l ?? 0),       0.3,  'rgba(189,215,238,.9)');
  makeBarChart('ch-th',   labels, data.map(r => r.hardness_meq_l ?? 0),      7.0,  'rgba(55,86,35,.6)');
  makeBarChart('ch-no3',  labels, data.map(r => r.nitrates_mg_l ?? 0),       45,   'rgba(255,140,0,.6)');
  makeBarChart('ch-so4',  labels, data.map(r => r.sulfates_mg_l ?? 0),       500,  'rgba(100,130,170,.6)');
}

async function renderFilterChart() {
  const { data } = await sb.from('v_measurements_full')
    .select('lab_number,parameter,formula,unit,numeric_value')
    .in('lab_number', [726, 727])
    .in('formula', ['TDS','Cl-','SO4','TH','Fe_total']);

  if (!data) return;
  const before = {}, after = {};
  data.forEach(r => {
    if (r.lab_number === 726) before[r.formula] = { val: r.numeric_value, name: r.parameter };
    if (r.lab_number === 727) after[r.formula]  = { val: r.numeric_value, name: r.parameter };
  });

  const keys = ['TDS','Cl-','SO4','TH','Fe_total'];
  const labels = keys.map(k => before[k]?.name ?? k);
  const ctx = document.getElementById('ch-filter')?.getContext('2d');
  if (!ctx) return;
  if (G.charts['ch-filter']) G.charts['ch-filter'].destroy();
  G.charts['ch-filter'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'До фильтра (лаб.726)',   data: keys.map(k => before[k]?.val ?? 0), backgroundColor: 'rgba(192,0,0,.6)' },
        { label: 'После фильтра (лаб.727)', data: keys.map(k => after[k]?.val ?? 0),  backgroundColor: 'rgba(46,117,182,.7)' },
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });
}

// ══════════════════════════════════════════════════════════
//  ВВОД ДАННЫХ
// ══════════════════════════════════════════════════════════
async function buildEntryForm() {
  G.entryBuilt = true;

  const [{ data: points }, { data: params }] = await Promise.all([
    sb.from('sampling_points').select('id,code,name').order('name'),
    sb.from('parameters').select('id,name_ru,formula,unit').order('id')
  ]);
  G.points = points || [];
  G.params = params || [];

  const sel = document.getElementById('entry-point');
  G.points.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = p.name; sel.append(o); });

  const tbody = document.getElementById('entry-params');
  tbody.innerHTML = G.params.map((p, i) => `
    <tr>
      <td style="color:var(--text-soft)">${i+1}</td>
      <td><b>${p.name_ru}</b> <span style="color:var(--text-soft);font-size:11px">${p.formula}</span></td>
      <td style="color:var(--text-soft)">${p.unit}</td>
      <td><input type="text" id="ep-${p.formula}" placeholder=""></td>
    </tr>`).join('');
}

document.getElementById('btn-save-entry')?.addEventListener('click', saveEntry);

async function saveEntry() {
  const labNum = parseInt(document.getElementById('entry-lab').value);
  const pointId = parseInt(document.getElementById('entry-point').value);
  const date = document.getElementById('entry-date').value;
  const protocol = document.getElementById('entry-protocol').value.trim();

  if (!labNum || !pointId || !date || !protocol) { toast('Заполните все обязательные поля', 'err'); return; }

  let { data: proto } = await sb.from('protocols').select('id').eq('number', protocol).single();
  if (!proto) {
    const series = protocol.split('/')[0];
    const { data: newProto } = await sb.from('protocols').insert({ number: protocol, series, client_id: 1, lab_id: 1 }).select('id').single();
    proto = newProto;
  }

  const { data: sample, error: sErr } = await sb.from('samples')
    .insert({ lab_number: labNum, protocol_id: proto?.id, point_id: pointId, sampling_date: date, sample_type: 'Вода' })
    .select('id').single();
  if (sErr) { toast('Ошибка: ' + sErr.message, 'err'); return; }

  const measurements = [];
  for (const p of G.params) {
    const raw = document.getElementById('ep-' + p.formula)?.value?.trim();
    if (!raw) continue;
    const isLess = raw.startsWith('<');
    const numStr = raw.replace('<', '').replace(',', '.');
    const num = parseFloat(numStr);
    measurements.push({ sample_id: sample.id, parameter_id: p.id, raw_value: raw, numeric_value: isNaN(num) ? null : num, is_less_than: isLess });
  }

  if (measurements.length) {
    const { error: mErr } = await sb.from('measurements').insert(measurements);
    if (mErr) { toast('Ошибка сохранения измерений: ' + mErr.message, 'err'); return; }
  }

  toast(`✅ Сохранено: ${measurements.length} показателей для пробы ${labNum}`, 'ok');
  G.samplesLoaded = false;
}

// CSV Upload
document.getElementById('csv-upload')?.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  if (!lines.length) { toast('CSV пустой', 'err'); return; }

  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const idx = h => headers.indexOf(h);

  const rows = lines.slice(1).map(line => {
    const cols = line.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
    return {
      lab_number:    cols[idx('lab_number')]    || cols[idx('лаб. №')],
      formula:       cols[idx('formula')]        || cols[idx('формула показателя')],
      raw_value:     cols[idx('raw_value')]      || cols[idx('значение (текст)')],
      numeric_value: cols[idx('numeric_value')]  || cols[idx('значение (число)')],
      is_less_than:  (cols[idx('is_less_than')]  || cols[idx("признак '<'")]) === 'TRUE',
      norm_doc:      cols[idx('norm_doc')]        || cols[idx('нд')],
    };
  }).filter(r => r.lab_number && r.formula && r.raw_value);

  if (!rows.length) { toast('Не удалось разобрать CSV', 'err'); return; }
  toast(`Загружено ${rows.length} строк, сохраняем...`);

  const { data: params } = await sb.from('parameters').select('id,formula');
  const paramMap = {};
  params?.forEach(p => paramMap[p.formula] = p.id);

  const byLab = {};
  rows.forEach(r => { if (!byLab[r.lab_number]) byLab[r.lab_number] = []; byLab[r.lab_number].push(r); });

  let saved = 0;
  for (const [labNum, rrows] of Object.entries(byLab)) {
    const { data: samp } = await sb.from('samples').select('id').eq('lab_number', labNum).single();
    if (!samp) continue;
    const ms = rrows.map(r => ({
      sample_id: samp.id, parameter_id: paramMap[r.formula],
      raw_value: r.raw_value,
      numeric_value: parseFloat(r.numeric_value?.replace(',', '.')) || null,
      is_less_than: r.is_less_than,
      norm_doc: r.norm_doc
    })).filter(m => m.parameter_id);
    if (ms.length) {
      await sb.from('measurements').upsert(ms, { onConflict: 'sample_id,parameter_id' });
      saved += ms.length;
    }
  }
  toast(`✅ Загружено ${saved} измерений из CSV`, 'ok');
  e.target.value = '';
});

// ══════════════════════════════════════════════════════════
//  DEMO — офлайн данные (если нет Supabase)
// ══════════════════════════════════════════════════════════
function loadDemoData() {
  G.summary = [
    {lab_number:726,point_name:'До фильтра',point_type:'фильтр',protocol:'334/4',ph_lab:7.7,mineralization_mg_l:1911,hardness_meq_l:20,chlorides_mg_l:553,sulfates_mg_l:346,fe_total_mg_l:0.064,nitrates_mg_l:35},
    {lab_number:727,point_name:'После фильтра',point_type:'фильтр',protocol:'334/4',ph_lab:5.3,mineralization_mg_l:2446,hardness_meq_l:0.4,chlorides_mg_l:1316,sulfates_mg_l:null,fe_total_mg_l:0.039,nitrates_mg_l:2.73},
    {lab_number:728,point_name:'Скважина 1нкк',point_type:'скважина',protocol:'334/5',ph_lab:8.1,mineralization_mg_l:728,hardness_meq_l:3,chlorides_mg_l:165,sulfates_mg_l:115,fe_total_mg_l:0.042,nitrates_mg_l:0.49},
    {lab_number:729,point_name:'Скважина 2нкк',point_type:'скважина',protocol:'334/5',ph_lab:8.1,mineralization_mg_l:2812,hardness_meq_l:null,chlorides_mg_l:1460,sulfates_mg_l:1460,fe_total_mg_l:null,nitrates_mg_l:0.57},
    {lab_number:730,point_name:'Скважина 3нкк',point_type:'скважина',protocol:'334/5',ph_lab:8.0,mineralization_mg_l:2445,hardness_meq_l:7.7,chlorides_mg_l:316,sulfates_mg_l:634,fe_total_mg_l:0.008,nitrates_mg_l:0.74},
    {lab_number:732,point_name:'п. Ульге Алган, Скв.1',point_type:'скважина',protocol:'334/6',ph_lab:7.5,mineralization_mg_l:272,hardness_meq_l:1.7,chlorides_mg_l:105,sulfates_mg_l:57.6,fe_total_mg_l:0.03,nitrates_mg_l:1.29},
    {lab_number:733,point_name:'п. Карагай, Скв.1',point_type:'скважина',protocol:'334/6',ph_lab:7.4,mineralization_mg_l:387,hardness_meq_l:0.8,chlorides_mg_l:19.7,sulfates_mg_l:57.6,fe_total_mg_l:0.03,nitrates_mg_l:1.29},
    {lab_number:734,point_name:'п. Карагай, Водокачка',point_type:'водокачка',protocol:'334/6',ph_lab:7.4,mineralization_mg_l:849,hardness_meq_l:3.5,chlorides_mg_l:150,sulfates_mg_l:57.6,fe_total_mg_l:0.014,nitrates_mg_l:6.86},
    {lab_number:763,point_name:'Зумпф ГРТ ЮРГ',point_type:'зумпф',protocol:'354/1',ph_lab:7.7,mineralization_mg_l:2151,hardness_meq_l:13,chlorides_mg_l:408,sulfates_mg_l:325,fe_total_mg_l:0.008,nitrates_mg_l:214},
    {lab_number:764,point_name:'Опытный зумпф ЮРГ',point_type:'зумпф',protocol:'354/1',ph_lab:8.0,mineralization_mg_l:null,hardness_meq_l:10,chlorides_mg_l:428,sulfates_mg_l:269,fe_total_mg_l:0.008,nitrates_mg_l:14.8},
    {lab_number:765,point_name:'Юго-Западный зумпф ЮРГ',point_type:'зумпф',protocol:'354/1',ph_lab:7.8,mineralization_mg_l:2120,hardness_meq_l:44,chlorides_mg_l:317,sulfates_mg_l:346,fe_total_mg_l:0.011,nitrates_mg_l:202},
    {lab_number:766,point_name:'МБ-02.ЮРГ',point_type:'зумпф',protocol:'354/1',ph_lab:7.8,mineralization_mg_l:1706,hardness_meq_l:12,chlorides_mg_l:454,sulfates_mg_l:403,fe_total_mg_l:0.008,nitrates_mg_l:9.96},
    {lab_number:767,point_name:'Водонаброс 2 ЮРГ',point_type:'водонаброс',protocol:'354/1',ph_lab:7.7,mineralization_mg_l:1697,hardness_meq_l:13.5,chlorides_mg_l:195,sulfates_mg_l:325,fe_total_mg_l:null,nitrates_mg_l:13.6},
    {lab_number:768,point_name:'НGN-02.ЮРГ',point_type:'зумпф',protocol:'354/1',ph_lab:7.7,mineralization_mg_l:1480,hardness_meq_l:9.5,chlorides_mg_l:388,sulfates_mg_l:346,fe_total_mg_l:0.003,nitrates_mg_l:16.1},
    {lab_number:783,point_name:'Скважина 2006',point_type:'скважина',protocol:'354/5',ph_lab:8.1,mineralization_mg_l:849,hardness_meq_l:3.2,chlorides_mg_l:250,sulfates_mg_l:null,fe_total_mg_l:5.6,nitrates_mg_l:1.69},
    {lab_number:784,point_name:'Скважина 2023',point_type:'скважина',protocol:'354/5',ph_lab:8.2,mineralization_mg_l:2565,hardness_meq_l:13,chlorides_mg_l:1326,sulfates_mg_l:null,fe_total_mg_l:8.4,nitrates_mg_l:97.6},
  ];
  document.getElementById('kpi-samples').textContent = 16;
  document.getElementById('kpi-protocols').textContent = 5;
  document.getElementById('kpi-params').textContent = 49;
  let exceed = 0;
  G.summary.forEach(r => {
    if (r.mineralization_mg_l > 1000) exceed++;
    if (r.hardness_meq_l > 7) exceed++;
    if (r.chlorides_mg_l > 350) exceed++;
    if (r.sulfates_mg_l > 500) exceed++;
    if (r.fe_total_mg_l > 0.3) exceed++;
    if (r.nitrates_mg_l > 45) exceed++;
  });
  document.getElementById('kpi-exceed').textContent = exceed;
  G.summaryAll = G.summary;
  renderSummaryTable();
  renderSeriesChart();
}

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  document.querySelector('[data-tab="samples"]').addEventListener('click', loadSamples);
});
