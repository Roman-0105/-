'use strict';

// ══════════════════════════════════════════════════════════
//  МЕЖДУНАРОДНЫЕ СТАНДАРТЫ КАЧЕСТВА ВОДЫ
// ══════════════════════════════════════════════════════════
const STANDARDS = {
  WHO: {
    name: 'ВОЗ 2022',
    color: '#1976D2',
    limits: {
      pH_lab:    { min: 6.5, max: 8.5 },
      TDS:       600,
      TH:        500,
      'NO3-':    50,
      'NO2-':    3.0,
      SO4:       250,
      'Cl-':     250,
      'HCO3-':   null,
      Fe_total:  0.3,
      Mn:        0.4,
      'F-':      1.5,
      'NH4+':    1.5,
      Cu:        2.0,
      Ni:        0.07,
      turbidity: 1.0,
      smell:     null,
      taste:     null,
    }
  },
  EU: {
    name: 'ЕС 2020/2184',
    color: '#388E3C',
    limits: {
      pH_lab:    { min: 6.5, max: 9.5 },
      'NO3-':    50,
      'NO2-':    0.5,
      SO4:       250,
      'Cl-':     250,
      Fe_total:  0.2,
      Mn:        0.05,
      'F-':      1.5,
      'NH4+':    0.5,
      Cu:        2.0,
      Ni:        0.02,
      turbidity: 1.0,
    }
  },
  KZ: {
    name: 'СанПиН Казахстан',
    color: '#C00000',
    limits: {
      pH_lab:    { min: 6.0, max: 9.0 },
      TDS:       1000,
      TH:        7.0,
      'NO3-':    45,
      'NO2-':    3.0,
      SO4:       500,
      'Cl-':     350,
      Fe_total:  0.3,
      Mn:        0.1,
      'F-':      1.5,
      'NH4+':    0.5,
      Cu:        1.0,
      Ni:        0.02,
      turbidity: 2.6,
      smell:     2,
      taste:     2,
      color:     20,
      OilProd:   0.1,
    }
  }
};

function stdLimit(std, formula) {
  const l = STANDARDS[std]?.limits[formula];
  if (!l) return null;
  if (typeof l === 'object') return l.max ?? null;
  return l;
}

function isViolation(std, formula, value) {
  if (value === null || value === undefined) return false;
  const l = STANDARDS[std]?.limits[formula];
  if (!l) return false;
  if (typeof l === 'object') {
    return (l.min != null && value < l.min) || (l.max != null && value > l.max);
  }
  return value > l;
}

// ══════════════════════════════════════════════════════════
//  ИНИЦИАЛИЗАЦИЯ ВКЛАДКИ АНАЛИЗ
// ══════════════════════════════════════════════════════════
async function initAnalysisTab() {
  if (G.analysisBuilt) return;
  G.analysisBuilt = true;

  document.getElementById('analysis-compliance').innerHTML = '<div class="loading"></div>';

  const { data, error } = await sb.from('v_measurements_full')
    .select('lab_number, point_name, point_type, formula, numeric_value, raw_value, is_less_than, sampling_date, protocol, series')
    .order('lab_number');

  if (error || !data) {
    document.getElementById('analysis-compliance').innerHTML = '<div class="empty">Ошибка загрузки данных</div>';
    return;
  }

  G.analysisData = data.filter(r => !r.is_less_than && r.numeric_value !== null);

  renderComplianceCards(G.analysisData);
  renderRadarChart(G.analysisData);
  renderMultiStdCharts(G.analysisData);
  await renderTrendChart();
}

// ── Карточки соответствия стандартам ─────────────────────
function renderComplianceCards(data) {
  const container = document.getElementById('analysis-compliance');
  if (!container) return;

  container.innerHTML = Object.entries(STANDARDS).map(([key, std]) => {
    let violations = 0, total = 0;
    data.forEach(r => {
      const l = std.limits[r.formula];
      if (!l) return;
      total++;
      if (isViolation(key, r.formula, r.numeric_value)) violations++;
    });
    const pct   = total ? Math.round((1 - violations / total) * 100) : 100;
    const color = pct >= 90 ? '#375623' : pct >= 70 ? '#FF8C00' : '#C00000';

    return `<div class="compliance-card">
      <div class="compliance-header" style="background:${std.color}">${std.name}</div>
      <div class="compliance-body">
        <div class="compliance-pct" style="color:${color}">${pct}%</div>
        <div class="compliance-sub">соответствие нормам</div>
        <div class="compliance-detail">${violations} нарушений / ${total} изм.</div>
        <div class="compliance-bar-track">
          <div class="compliance-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Радарный график — профиль качества воды ──────────────
function renderRadarChart(data) {
  const ctx = document.getElementById('analysis-radar')?.getContext('2d');
  if (!ctx) return;

  const params = [
    { f: 'TDS',      name: 'Минерализация' },
    { f: 'TH',       name: 'Жёсткость' },
    { f: 'Cl-',      name: 'Хлориды' },
    { f: 'SO4',      name: 'Сульфаты' },
    { f: 'NO3-',     name: 'Нитраты' },
    { f: 'Fe_total', name: 'Железо' },
    { f: 'Mn',       name: 'Марганец' },
    { f: 'NH4+',     name: 'Аммоний' },
    { f: 'F-',       name: 'Фторид' },
    { f: 'Ni',       name: 'Никель' },
  ];

  function avgPctOfKZ(formula, series) {
    const lim = stdLimit('KZ', formula);
    if (!lim) return 0;
    const vals = data.filter(r => r.formula === formula && (!series || r.series === series));
    if (!vals.length) return 0;
    const avg = vals.reduce((s, r) => s + r.numeric_value, 0) / vals.length;
    return Math.min(Math.round(avg / lim * 100), 300);
  }

  if (G.charts['a-radar']) G.charts['a-radar'].destroy();
  G.charts['a-radar'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: params.map(p => p.name),
      datasets: [
        {
          label: 'Серия 334',
          data: params.map(p => avgPctOfKZ(p.f, '334')),
          backgroundColor: 'rgba(46,117,182,.2)',
          borderColor: '#2E75B6', borderWidth: 2,
          pointBackgroundColor: '#2E75B6'
        },
        {
          label: 'Серия 354',
          data: params.map(p => avgPctOfKZ(p.f, '354')),
          backgroundColor: 'rgba(192,0,0,.15)',
          borderColor: '#C00000', borderWidth: 2,
          pointBackgroundColor: '#C00000'
        },
        {
          label: 'Предел ПДК (100%)',
          data: params.map(() => 100),
          backgroundColor: 'transparent',
          borderColor: '#FF8C00', borderWidth: 1.5,
          borderDash: [6, 4], pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true, max: 200,
          ticks: { stepSize: 50, callback: v => v + '%', font: { size: 10 } },
          pointLabels: { font: { size: 11 } }
        }
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw}% от ПДК КЗ` } }
      }
    }
  });
}

// ── Графики сравнения с тремя стандартами ────────────────
function renderMultiStdCharts(data) {
  const grid = document.getElementById('analysis-std-grid');
  if (!grid) return;

  const params = [
    { f: 'TDS',      name: 'Минерализация',   unit: 'мг/л' },
    { f: 'Cl-',      name: 'Хлориды',          unit: 'мг/л' },
    { f: 'SO4',      name: 'Сульфаты',          unit: 'мг/л' },
    { f: 'NO3-',     name: 'Нитраты',           unit: 'мг/л' },
    { f: 'Fe_total', name: 'Железо общее',      unit: 'мг/л' },
    { f: 'Mn',       name: 'Марганец',          unit: 'мг/л' },
    { f: 'NH4+',     name: 'Аммоний',           unit: 'мг/л' },
    { f: 'Ni',       name: 'Никель',            unit: 'мг/л' },
    { f: 'F-',       name: 'Фторид',            unit: 'мг/л' },
    { f: 'NO2-',     name: 'Нитриты',           unit: 'мг/л' },
  ];

  grid.innerHTML = params.map((p, i) =>
    `<div class="chart-card"><h3>${p.name}, ${p.unit}</h3><canvas id="asc-${i}"></canvas></div>`
  ).join('');

  params.forEach((p, i) => {
    const pData = data.filter(r => r.formula === p.f);
    if (!pData.length) return;

    // Group by point_name → average
    const byPoint = {};
    pData.forEach(r => {
      if (!byPoint[r.point_name]) byPoint[r.point_name] = [];
      byPoint[r.point_name].push(r.numeric_value);
    });
    const labels = Object.keys(byPoint).map(n => n.length > 14 ? n.slice(0, 13) + '…' : n);
    const values = Object.values(byPoint).map(arr => +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3));

    const worstLim = ['WHO', 'EU', 'KZ']
      .map(s => stdLimit(s, p.f)).filter(Boolean).reduce((a, b) => Math.min(a, b), Infinity);

    const datasets = [{
      label: 'Среднее значение',
      data: values,
      backgroundColor: values.map(v => v > worstLim ? 'rgba(192,0,0,.7)' : 'rgba(46,117,182,.7)'),
      borderWidth: 1
    }];

    ['WHO', 'EU', 'KZ'].forEach(s => {
      const lim = stdLimit(s, p.f);
      if (!lim) return;
      datasets.push({
        label: `${STANDARDS[s].name}: ${lim}`,
        data: labels.map(() => lim),
        type: 'line',
        borderColor: STANDARDS[s].color,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      });
    });

    const ctx = document.getElementById(`asc-${i}`)?.getContext('2d');
    if (!ctx) return;
    if (G.charts[`asc-${i}`]) G.charts[`asc-${i}`].destroy();
    G.charts[`asc-${i}`] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true } }
      }
    });
  });
}

// ── Тренд по протоколам ───────────────────────────────────
async function renderTrendChart() {
  const container = document.getElementById('analysis-trend-wrap');
  if (!container) return;

  const { data: protocols } = await sb.from('protocols')
    .select('id, number, sampling_date_from').order('sampling_date_from');

  if (!protocols || protocols.length < 2) {
    container.innerHTML = '<div class="empty">Нужно минимум 2 протокола для анализа тренда</div>';
    return;
  }

  const trendParams = [
    { f: 'TDS',      name: 'Минерализация', color: '#2E75B6' },
    { f: 'Cl-',      name: 'Хлориды',       color: '#375623' },
    { f: 'Fe_total', name: 'Железо',         color: '#C00000' },
    { f: 'NO3-',     name: 'Нитраты',        color: '#FF8C00' },
    { f: 'SO4',      name: 'Сульфаты',       color: '#7B1FA2' },
  ];

  // Collect averages per protocol
  const { data: meas } = await sb.from('v_measurements_full')
    .select('protocol, formula, numeric_value')
    .in('formula', trendParams.map(p => p.f))
    .eq('is_less_than', false);

  if (!meas) return;

  const byProto = {};
  protocols.forEach(p => { byProto[p.number] = {}; trendParams.forEach(t => byProto[p.number][t.f] = []); });
  meas.forEach(r => { if (byProto[r.protocol]?.[r.formula] !== undefined && r.numeric_value !== null) byProto[r.protocol][r.formula].push(r.numeric_value); });

  const labels = protocols.map(p => p.number);
  const avg = arr => arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;

  container.innerHTML = '<canvas id="analysis-trend-chart"></canvas>';
  const ctx = document.getElementById('analysis-trend-chart')?.getContext('2d');
  if (!ctx) return;
  if (G.charts['a-trend']) G.charts['a-trend'].destroy();
  G.charts['a-trend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: trendParams.map(t => ({
        label: t.name,
        data: protocols.map(p => avg(byProto[p.number]?.[t.f] || [])),
        borderColor: t.color,
        backgroundColor: t.color + '22',
        borderWidth: 2,
        pointRadius: 5,
        tension: 0.3,
        spanGaps: true
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Динамика средних значений по протоколам (мг/л)' }
      },
      scales: { y: { beginAtZero: true } }
    }
  });
}
