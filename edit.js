'use strict';

// ══════════════════════════════════════════════════════════
//  УПРАВЛЕНИЕ ПРОТОКОЛАМИ — список и удаление
// ══════════════════════════════════════════════════════════
let _protocols = [];

async function loadProtocolsPanel() {
  const container = document.getElementById('protocols-list');
  if (!container) return;
  container.innerHTML = '<div class="loading"></div>';

  const { data, error } = await sb.from('protocols')
    .select('id, number, series, sampling_date_from, sampling_date_to')
    .order('sampling_date_from', { ascending: false });

  if (error || !data) {
    container.innerHTML = '<div class="empty">Ошибка загрузки</div>';
    return;
  }
  _protocols = data;

  const { data: samps } = await sb.from('samples').select('protocol_id');
  const countMap = {};
  (samps || []).forEach(s => { countMap[s.protocol_id] = (countMap[s.protocol_id] || 0) + 1; });

  if (!data.length) {
    container.innerHTML = '<div class="empty">Нет протоколов</div>';
    return;
  }

  container.innerHTML = data.map(p => {
    const df = p.sampling_date_from ? new Date(p.sampling_date_from).toLocaleDateString('ru-RU') : '—';
    const dt = p.sampling_date_to   ? ' – ' + new Date(p.sampling_date_to).toLocaleDateString('ru-RU') : '';
    return `<div class="protocol-item" id="proto-item-${p.id}">
      <div class="protocol-info">
        <strong>№ ${p.number}</strong>
        <span class="proto-dates">${df}${dt}</span>
        <span class="badge-type">${countMap[p.id] || 0} проб</span>
      </div>
      <div class="protocol-actions">
        <button class="btn btn-sm btn-outline" onclick="editProtocolMeta(${p.id})">✏️ Изменить</button>
        <button class="btn btn-sm" style="background:#C00000;color:#fff;border-color:#C00000"
          onclick="confirmDeleteProtocol(${p.id}, '${p.number}')">🗑️ Удалить</button>
      </div>
    </div>`;
  }).join('');
}

function toggleProtocolsPanel() {
  const panel = document.getElementById('protocols-panel');
  const icon  = document.getElementById('protocols-toggle-icon');
  if (!panel) return;
  const opening = panel.style.display === 'none' || !panel.style.display;
  panel.style.display = opening ? 'block' : 'none';
  if (icon) icon.textContent = opening ? '▼' : '▶';
  if (opening) loadProtocolsPanel();
}

function editProtocolMeta(id) {
  const p = _protocols.find(x => x.id === id);
  if (!p) return;
  showModal(
    `Редактировать протокол № ${p.number}`,
    `<div class="form-grid">
      <div class="form-group"><label>Номер протокола</label>
        <input id="epm-number" class="form-inp" value="${p.number || ''}"></div>
      <div class="form-group"><label>Серия</label>
        <input id="epm-series" class="form-inp" value="${p.series || ''}"></div>
      <div class="form-group"><label>Дата отбора (от)</label>
        <input id="epm-from" type="date" class="form-inp" value="${p.sampling_date_from || ''}"></div>
      <div class="form-group"><label>Дата отбора (до)</label>
        <input id="epm-to" type="date" class="form-inp" value="${p.sampling_date_to || ''}"></div>
    </div>`,
    async () => {
      const number = document.getElementById('epm-number')?.value?.trim();
      if (!number) { toast('Номер обязателен', 'err'); return false; }
      const { error } = await sb.from('protocols').update({
        number,
        series: document.getElementById('epm-series')?.value?.trim() || null,
        sampling_date_from: document.getElementById('epm-from')?.value || null,
        sampling_date_to:   document.getElementById('epm-to')?.value || null,
      }).eq('id', id);
      if (error) { toast('Ошибка: ' + error.message, 'err'); return false; }
      toast('✅ Протокол обновлён', 'ok');
      G.samplesLoaded = false;
      await loadProtocolsPanel();
      return true;
    }
  );
}

function confirmDeleteProtocol(id, number) {
  showModal(
    `Удалить протокол № ${number}?`,
    `<p style="color:#C00000;font-weight:600">⚠️ Это действие необратимо!</p>
     <p>Будут удалены все пробы и все измерения этого протокола.</p>`,
    async () => {
      const { data: samps } = await sb.from('samples').select('id').eq('protocol_id', id);
      const ids = (samps || []).map(s => s.id);
      if (ids.length) {
        const { error: me } = await sb.from('measurements').delete().in('sample_id', ids);
        if (me) { toast('Ошибка: ' + me.message, 'err'); return false; }
        const { error: se } = await sb.from('samples').delete().in('id', ids);
        if (se) { toast('Ошибка: ' + se.message, 'err'); return false; }
      }
      const { error } = await sb.from('protocols').delete().eq('id', id);
      if (error) { toast('Ошибка: ' + error.message, 'err'); return false; }
      toast('✅ Протокол удалён', 'ok');
      G.samplesLoaded = false;
      document.getElementById(`proto-item-${id}`)?.remove();
      return true;
    },
    'Удалить',
    'btn-danger-fill'
  );
}

// ══════════════════════════════════════════════════════════
//  РЕДАКТИРОВАНИЕ ИЗМЕРЕНИЙ В ДЕТАЛИ ПРОБЫ
// ══════════════════════════════════════════════════════════
function renderDetailView(inner, labNum, data) {
  inner.innerHTML = `
    <div class="detail-toolbar">
      <button class="btn btn-sm btn-outline" onclick="enterEditMode(${labNum})">✏️ Редактировать</button>
    </div>
    <div class="detail-params">
      ${data.map(r => {
        const ratio = pdkRatio(r.formula, r.numeric_value);
        const cls   = ratio && ratio > 1 ? 'exceed' : '';
        const val   = r.is_less_than ? `&lt;${(r.raw_value || '').replace('<', '')}` : (r.raw_value ?? '—');
        return `<div class="detail-param ${cls}">
          <span class="pname">${r.parameter} <span class="unit-tag">${r.unit}</span></span>
          <span class="pval">${val}${ratio && ratio > 1 ? ` ⚠ ×${ratio.toFixed(1)}` : ''}</span>
        </div>`;
      }).join('')}
    </div>`;
}

async function enterEditMode(labNum) {
  const inner = document.getElementById('detail-inner-' + labNum);
  if (!inner) return;
  inner.innerHTML = '<div class="loading"></div>';

  const { data } = await sb.from('v_measurements_full')
    .select('parameter, unit, raw_value, numeric_value, formula, is_less_than, parameter_id')
    .eq('lab_number', labNum).order('category');

  if (!data) { inner.innerHTML = '<div class="empty">Ошибка загрузки</div>'; return; }

  inner.innerHTML = `
    <div class="detail-toolbar">
      <button class="btn btn-sm btn-primary" onclick="saveEditMode(${labNum})">💾 Сохранить изменения</button>
      <button class="btn btn-sm btn-outline" onclick="cancelEditMode(${labNum})">✕ Отмена</button>
    </div>
    <div class="edit-params-grid">
      ${data.map(r => {
        const val   = r.is_less_than ? `<${r.numeric_value ?? ''}` : (r.raw_value ?? '');
        const ratio = pdkRatio(r.formula, r.numeric_value);
        const cls   = ratio && ratio > 1 ? 'exceed' : '';
        return `<div class="edit-param-row ${cls}">
          <label class="edit-param-label">${r.parameter}<span class="unit-tag">${r.unit}</span></label>
          <input type="text" class="edit-param-input"
            data-formula="${r.formula}" data-param-id="${r.parameter_id}"
            value="${val}" placeholder="—">
        </div>`;
      }).join('')}
    </div>`;
  inner.dataset.editing = 'true';
}

async function cancelEditMode(labNum) {
  const inner = document.getElementById('detail-inner-' + labNum);
  if (!inner) return;
  inner.innerHTML = '<div class="loading"></div>';
  const { data } = await sb.from('v_measurements_full')
    .select('parameter, unit, raw_value, numeric_value, formula, is_less_than, parameter_id')
    .eq('lab_number', labNum).order('category');
  if (data) renderDetailView(inner, labNum, data);
}

async function saveEditMode(labNum) {
  const inner = document.getElementById('detail-inner-' + labNum);
  if (!inner) return;

  const { data: sample } = await sb.from('samples').select('id').eq('lab_number', labNum).maybeSingle();
  if (!sample) { toast('Проба не найдена', 'err'); return; }

  const inputs  = inner.querySelectorAll('.edit-param-input');
  const updates = [];
  for (const inp of inputs) {
    const raw     = inp.value.trim();
    const paramId = parseInt(inp.dataset.paramId);
    if (!paramId) continue;
    const isEmpty = !raw || raw === '—';
    const isLess  = raw.startsWith('<');
    const numStr  = raw.replace('<', '').replace(',', '.');
    const numVal  = isEmpty ? null : (parseFloat(numStr) || null);
    updates.push({ sample_id: sample.id, parameter_id: paramId,
      raw_value: isEmpty ? null : raw, numeric_value: numVal, is_less_than: isLess });
  }

  if (!updates.length) { toast('Нет данных для сохранения', 'err'); return; }

  const { error } = await sb.from('measurements')
    .upsert(updates, { onConflict: 'sample_id,parameter_id' });

  if (error) { toast('Ошибка: ' + error.message, 'err'); return; }

  toast('✅ Измерения сохранены', 'ok');
  G.samplesLoaded = false;
  inner.dataset.editing = 'false';
  inner.innerHTML = '<div class="loading"></div>';
  const { data } = await sb.from('v_measurements_full')
    .select('parameter, unit, raw_value, numeric_value, formula, is_less_than, parameter_id')
    .eq('lab_number', labNum).order('category');
  if (data) renderDetailView(inner, labNum, data);
}

// ══════════════════════════════════════════════════════════
//  МОДАЛЬНОЕ ОКНО
// ══════════════════════════════════════════════════════════
let _modalCb = null;

function showModal(title, body, onConfirm, confirmText = 'Сохранить', confirmCls = 'btn-primary') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  const btn = document.getElementById('modal-confirm');
  btn.textContent = confirmText;
  btn.className = 'btn ' + confirmCls;
  _modalCb = onConfirm;
  document.getElementById('app-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('app-modal').style.display = 'none';
  _modalCb = null;
}

async function confirmModal() {
  if (!_modalCb) { closeModal(); return; }
  const ok = await _modalCb();
  if (ok !== false) closeModal();
}

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
document.getElementById('modal-confirm')?.addEventListener('click', confirmModal);
document.getElementById('app-modal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
