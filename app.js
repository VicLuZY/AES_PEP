const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

const STORE_KEY = 'aes_pep_studio_v2';
const THEME_KEY = 'aes_pep_theme_v2';

const laneTemplates = [
  { lane: 'Sprint planning', title: 'Define MVP scope', note: 'Project manager + scrum master prioritize outcomes.' },
  { lane: 'Design review', title: 'Validate user journeys', note: 'UX/UI consultant pressure-tests clarity.' },
  { lane: 'Engineering', title: 'Build increment', note: 'Expert developer implements agreed solution.' },
  { lane: 'QA gate', title: 'Acceptance check', note: 'PMP consultant validates process compliance.' }
];

const agents = [
  'Project manager (user voice)',
  'Scrum master',
  'PMP consultant',
  'Expert software developer',
  'UX/UI consultant',
  'QA / delivery consultant'
];

function laneRow(data = {}) {
  const row = document.createElement('article');
  row.className = 'lane-item';
  row.innerHTML = `
    <input type="checkbox" class="laneDone" ${data.done ? 'checked' : ''} aria-label="Complete task" />
    <div>
      <input class="lane" type="text" placeholder="Lane" value="${data.lane || ''}" />
      <input class="title" type="text" placeholder="Task title" value="${data.title || ''}" />
      <p><textarea class="note" placeholder="Iteration feedback / rationale">${data.note || ''}</textarea></p>
    </div>
    <button class="remove" title="remove">×</button>
  `;
  return row;
}

function milestoneRow(data = {}) {
  const row = document.createElement('div');
  row.className = 'milestone';
  row.innerHTML = `
    <input class="msName" type="text" placeholder="Milestone" value="${data.name || ''}" />
    <input class="msDate" type="date" value="${data.date || ''}" />
    <label><input class="msDone" type="checkbox" ${data.done ? 'checked' : ''} /> done</label>
    <button class="remove">×</button>
  `;
  return row;
}

function agentCard(name, data = {}) {
  const card = document.createElement('section');
  card.className = 'agent-card';
  card.innerHTML = `
    <div class="agent-head">
      <h4>${name}</h4>
      <label class="approved"><input class="agentApproved" type="checkbox" ${data.approved ? 'checked' : ''}> satisfied</label>
    </div>
    <select class="agentMood">
      <option ${data.mood === 'Need rework' ? 'selected' : ''}>Need rework</option>
      <option ${data.mood === 'Close to ready' ? 'selected' : ''}>Close to ready</option>
      <option ${data.mood === 'Approved for release' ? 'selected' : ''}>Approved for release</option>
    </select>
    <textarea class="agentFeedback" placeholder="Feedback from this role...">${data.feedback || ''}</textarea>
  `;
  return card;
}

function seed() {
  const lanes = $('#lanes');
  lanes.innerHTML = '';
  laneTemplates.forEach(item => lanes.appendChild(laneRow(item)));

  const milestones = $('#milestones');
  milestones.innerHTML = '';
  ['Discovery complete', 'Prototype sign-off', 'UAT accepted', 'Go-live ready']
    .forEach(name => milestones.appendChild(milestoneRow({ name })));

  const board = $('#agentBoard');
  board.innerHTML = '';
  agents.forEach(agent => board.appendChild(agentCard(agent)));
}

function snapshot() {
  return {
    projectName: $('#projectName').value,
    sponsor: $('#sponsor').value,
    manager: $('#manager').value,
    mission: $('#mission').value,
    targetDate: $('#targetDate').value,
    risks: $('#risks').value,
    mitigation: $('#mitigation').value,
    decisionLog: $('#decisionLog').value,
    lanes: $$('.lane-item').map(item => ({
      done: $('.laneDone', item).checked,
      lane: $('.lane', item).value,
      title: $('.title', item).value,
      note: $('.note', item).value
    })),
    milestones: $$('.milestone').map(item => ({
      name: $('.msName', item).value,
      date: $('.msDate', item).value,
      done: $('.msDone', item).checked
    })),
    agents: $$('.agent-card').map(item => ({
      approved: $('.agentApproved', item).checked,
      mood: $('.agentMood', item).value,
      feedback: $('.agentFeedback', item).value
    })),
    autoSave: $('#autoSave').checked
  };
}

function apply(data) {
  $('#projectName').value = data.projectName || '';
  $('#sponsor').value = data.sponsor || '';
  $('#manager').value = data.manager || '';
  $('#mission').value = data.mission || '';
  $('#targetDate').value = data.targetDate || '';
  $('#risks').value = data.risks || '';
  $('#mitigation').value = data.mitigation || '';
  $('#decisionLog').value = data.decisionLog || '';
  $('#autoSave').checked = !!data.autoSave;

  const lanes = $('#lanes');
  lanes.innerHTML = '';
  (data.lanes?.length ? data.lanes : laneTemplates).forEach(item => lanes.appendChild(laneRow(item)));

  const milestones = $('#milestones');
  milestones.innerHTML = '';
  (data.milestones?.length ? data.milestones : [{ name: 'Discovery complete' }]).forEach(item => milestones.appendChild(milestoneRow(item)));

  const board = $('#agentBoard');
  board.innerHTML = '';
  if (data.agents?.length) {
    data.agents.forEach((item, idx) => board.appendChild(agentCard(agents[idx] || `Agent ${idx + 1}`, item)));
  } else {
    agents.forEach(agent => board.appendChild(agentCard(agent)));
  }

  updateProgress();
}

function updateProgress() {
  const fields = ['projectName', 'sponsor', 'manager', 'mission', 'targetDate', 'risks', 'mitigation', 'decisionLog'];
  const fieldDone = fields.map(id => $('#' + id)).filter(el => (el.value || '').trim().length > 0).length;
  const laneDone = $$('.laneDone:checked').length;
  const laneTotal = Math.max($$('.laneDone').length, 1);
  const msDone = $$('.msDone:checked').length;
  const msTotal = Math.max($$('.msDone').length, 1);
  const agentDone = $$('.agentApproved:checked').length;
  const agentTotal = Math.max($$('.agentApproved').length, 1);

  const total = fields.length + laneTotal + msTotal + agentTotal;
  const done = fieldDone + laneDone + msDone + agentDone;

  const overall = Math.round(done * 100 / total);
  const agentPct = Math.round(agentDone * 100 / agentTotal);

  $('#overallPct').textContent = `${overall}%`;
  $('#agentPct').textContent = `${agentPct}%`;
  $('#overallBar').style.width = `${overall}%`;
}

function storeLocal() {
  localStorage.setItem(STORE_KEY, JSON.stringify(snapshot()));
}

function applyTheme(theme) {
  const selected = theme || 'aurora';
  document.documentElement.dataset.theme = selected;
  $('#themeSelect').value = selected;
  localStorage.setItem(THEME_KEY, selected);
}

$('#addLaneItem').addEventListener('click', () => {
  $('#lanes').appendChild(laneRow());
  updateProgress();
});
$('#addMilestone').addEventListener('click', () => {
  $('#milestones').appendChild(milestoneRow());
  updateProgress();
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove')) {
    e.target.closest('.lane-item, .milestone')?.remove();
    updateProgress();
    if ($('#autoSave').checked) storeLocal();
  }
});

document.addEventListener('input', () => {
  updateProgress();
  if ($('#autoSave').checked) storeLocal();
});
document.addEventListener('change', () => {
  updateProgress();
  if ($('#autoSave').checked) storeLocal();
});

$('#saveBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aes_pep_studio.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('#loadBtn').addEventListener('click', () => $('#fileInput').click());
$('#fileInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    try { apply(JSON.parse(fr.result)); } catch { alert('Invalid JSON file.'); }
  };
  fr.readAsText(file);
});
$('#printBtn').addEventListener('click', () => window.print());
$('#resetBtn').addEventListener('click', () => {
  localStorage.removeItem(STORE_KEY);
  seed();
  apply({});
});
$('#themeSelect').addEventListener('change', (e) => applyTheme(e.target.value));

seed();
const cached = localStorage.getItem(STORE_KEY);
if (cached) {
  try { apply(JSON.parse(cached)); } catch { apply({}); }
} else {
  apply({});
}
applyTheme(localStorage.getItem(THEME_KEY));
updateProgress();
