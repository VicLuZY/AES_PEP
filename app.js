// UTIL
const $ = (q,ctx=document)=>ctx.querySelector(q);
const $$ = (q,ctx=document)=>Array.from(ctx.querySelectorAll(q));
const storeKey='aes_pep_v1';
const themeKey='aes_pep_theme';

// SCOPE pills
const scopeItems=[
  'Design development','Construction documentation','Contract administration',
  'Commissioning support','Utility coordination','Cost estimate Class D',
  'Solar or BESS feasibility','EV infrastructure and EVEMS','Fire alarm and life safety',
  'Lighting and controls','Power distribution and single line','Specifications',
  'Site reviews and reports','As-built review and record drawings'
];
const scopeList = $('#scopeList');
scopeItems.forEach((name,i)=>{
  const id='sc'+i;
  const pill=document.createElement('label');
  pill.className='pill';
  pill.innerHTML=`<input type="checkbox" id="${id}"><span>${name}</span>`;
  scopeList.appendChild(pill);
});

// QA QC list - Enhanced for PROCESS principles
const qaItems=[
  'Technical peer review complete with comments resolved',
  'Code and standard compliance verified for all deliverables',
  'Coordination across disciplines verified (architecture, civil, structural)',
  'PM sign-off complete with scope and budget alignment',
  'RFI response issued within agreed turnaround window',
  'Submittal review completed within target window',
  'Client communication documented and stored in project log',
  'Change management process followed with approvals',
  'AES standards and templates used consistently',
  'Lessons learned captured during and after delivery',
  'Knowledge transfer completed with the team',
  'Process improvements identified and assigned to owners'
];
const qaList=$('#qaList');
qaItems.forEach((text,i)=>{
  const div=document.createElement('div');
  div.className='step';
  div.innerHTML=`<input type="checkbox" id="qa${i}">
    <div><h4>${text}</h4><p class="muted">Check when complete.</p></div>`;
  qaList.appendChild(div);
});

// Milestones
const timeline=$('#timeline');
function addMilestone(v={name:'', date:'', deliverable:'', done:false}){
  const row=document.createElement('div');
  row.className='milestone';
  row.innerHTML = `
    <input type="text" placeholder="Milestone" value="${v.name||''}" />
    <input type="date" value="${v.date||''}" />
    <input type="text" placeholder="Deliverable" value="${v.deliverable||''}" />
    <input type="checkbox" ${v.done?'checked':''} aria-label="Complete">
    <button class="del" title="Remove">×</button>
  `;
  timeline.appendChild(row);
  updateMsBar();
}
$('#addM').addEventListener('click',()=>addMilestone());

timeline.addEventListener('click',(e)=>{
  if(e.target.classList.contains('del')){
    e.target.parentElement.remove(); updateMsBar();
  }
});
timeline.addEventListener('change',updateMsBar);

function updateMsBar(){
  const rows = $$('.milestone', timeline);
  const total = rows.length || 1;
  const done = rows.filter(r=>r.querySelector('input[type="checkbox"]').checked).length;
  const pct = Math.round(done*100/total);
  $('#msBar').style.width = pct + '%';
  $('#msBar').title = pct + '% complete';
  updateCompletion();
}

// KPI sliders
function bindKPI(id,max=100){
  const rng = $('#'+id);
  const val = $('#'+id+'_val');
  const bar = $('#'+id+'_bar');
  const updater = ()=>{
    const v = Number(rng.value);
    val.textContent = v;
    bar.style.width = (max===10 ? v*10 : v) + '%';
  };
  rng.addEventListener('input', updater);
  updater();
}
bindKPI('kpi_time');
bindKPI('kpi_ts');
bindKPI('kpi_rw');
bindKPI('kpi_cs',10);

// Save and load
function snapshot(){
  return {
    f:{
      name:$('#f_name').value,client:$('#f_client').value,no:$('#f_no').value,
      pm:$('#f_pm').value,type:$('#f_type').value,loc:$('#f_loc').value,summary:$('#f_summary').value,
      budget:$('#f_budget').value,hours:$('#f_hours').value,wbs:$('#f_wbs').value
    },
    scope: $$('#scopeList input').map(x=>x.checked),
    scope_notes: $('#scope_notes').value,
    review_schedule: $('#review_schedule').value,
    stakeholders: $('#stakeholders').value,
    risk_notes: $('#risk_notes').value,
    qa: $$('#qaList input[type="checkbox"]').map(x=>x.checked),
    cadence: $('#cadence').value,
    change: $('#change').value,
    doc_standards: $('#doc_standards').value,
    efficiency_tools: $('#efficiency_tools').value,
    comm_log: $('#comm_log').value,
    actual_hours: $('#actual_hours').value,
    efficiency_rating: $('#efficiency_rating').value,
    optimization_notes: $('#optimization_notes').value,
    ms: $$('.milestone').map(r=>{
      const inputs=$$('input',r);
      return {name:inputs[0].value,date:inputs[1].value,deliverable:inputs[2].value,done:inputs[3].checked};
    }),
    kpi:{
      time:$('#kpi_time').value,ts:$('#kpi_ts').value,rw:$('#kpi_rw').value,cs:$('#kpi_cs').value,
      standards:$('#kpi_standards').value,improvement:$('#kpi_improvement').value,
      knowledge:$('#kpi_knowledge').value,team:$('#kpi_team').value
    },
    sustainability_notes: $('#sustainability_notes').value,
    team:{
      fb_pm: $('#fb_pm').value, fb_sm: $('#fb_sm').value, fb_pmp: $('#fb_pmp').value, fb_ux: $('#fb_ux').value, fb_dev: $('#fb_dev').value,
      ok_pm: $('#ok_pm').checked, ok_sm: $('#ok_sm').checked, ok_pmp: $('#ok_pmp').checked, ok_ux: $('#ok_ux').checked, ok_dev: $('#ok_dev').checked
    },
    compact: $('#compactTog').checked
  };
}
function apply(data){
  if(!data) return;
  $('#f_name').value=data?.f?.name||'';
  $('#f_client').value=data?.f?.client||'';
  $('#f_no').value=data?.f?.no||'';
  $('#f_pm').value=data?.f?.pm||'';
  $('#f_type').value=data?.f?.type||'';
  $('#f_loc').value=data?.f?.loc||'';
  $('#f_summary').value=data?.f?.summary||'';
  $('#f_budget').value=data?.f?.budget||'';
  $('#f_hours').value=data?.f?.hours||'';
  $('#f_wbs').value=data?.f?.wbs||'';
  $$('#scopeList input').forEach((x,i)=>x.checked=!!data.scope?.[i]);
  $('#scope_notes').value=data.scope_notes||'';
  $('#review_schedule').value=data.review_schedule||'';
  $('#stakeholders').value=data.stakeholders||'';
  $('#risk_notes').value=data.risk_notes||'';
  $$('#qaList input[type="checkbox"]').forEach((x,i)=>x.checked=!!data.qa?.[i]);
  $('#cadence').value=data.cadence||'';
  $('#change').value=data.change||'';
  $('#doc_standards').value=data.doc_standards||'';
  $('#efficiency_tools').value=data.efficiency_tools||'';
  $('#comm_log').value=data.comm_log||'';
  $('#actual_hours').value=data.actual_hours||'';
  $('#efficiency_rating').value=data.efficiency_rating||'';
  $('#optimization_notes').value=data.optimization_notes||'';
  timeline.innerHTML='';
  (data.ms||[]).forEach(addMilestone);
  if(!(data.ms||[]).length){ ['Internal kickoff','30 percent review','60 percent review','90 percent QA QC','Issued for Tender','Issued for Construction','Substantial completion'].forEach((n)=>addMilestone({name:n, date:'', deliverable:''})); }
  $('#kpi_time').value = data.kpi?.time ?? 70;
  $('#kpi_ts').value = data.kpi?.ts ?? 80;
  $('#kpi_rw').value = data.kpi?.rw ?? 85;
  $('#kpi_cs').value = data.kpi?.cs ?? 8;
  $('#kpi_standards').value = data.kpi?.standards ?? 90;
  $('#kpi_improvement').value = data.kpi?.improvement ?? 75;
  $('#kpi_knowledge').value = data.kpi?.knowledge ?? 80;
  $('#kpi_team').value = data.kpi?.team ?? 8;
  bindKPI('kpi_time'); bindKPI('kpi_ts'); bindKPI('kpi_rw'); bindKPI('kpi_cs',10);
  bindKPI('kpi_standards'); bindKPI('kpi_improvement'); bindKPI('kpi_knowledge'); bindKPI('kpi_team',10);
  $('#sustainability_notes').value=data.sustainability_notes||'';
  $('#fb_pm').value=data.team?.fb_pm||'';
  $('#fb_sm').value=data.team?.fb_sm||'';
  $('#fb_pmp').value=data.team?.fb_pmp||'';
  $('#fb_ux').value=data.team?.fb_ux||'';
  $('#fb_dev').value=data.team?.fb_dev||'';
  $('#ok_pm').checked=!!data.team?.ok_pm;
  $('#ok_sm').checked=!!data.team?.ok_sm;
  $('#ok_pmp').checked=!!data.team?.ok_pmp;
  $('#ok_ux').checked=!!data.team?.ok_ux;
  $('#ok_dev').checked=!!data.team?.ok_dev;
  $('#compactTog').checked = !!data.compact;
  applyCompact();
  updateMsBar();
}
function saveToLocal(){
  localStorage.setItem(storeKey, JSON.stringify(snapshot()));
}
function loadFromLocal(){
  const raw = localStorage.getItem(storeKey);
  if(raw) apply(JSON.parse(raw));
  else apply({});
}
$('#saveBtn').addEventListener('click', ()=>{
  const data = JSON.stringify(snapshot(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aes_pep.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('#loadBtn').addEventListener('click', ()=>$('#fileInput').click());
$('#fileInput').addEventListener('change', (e)=>{
  const file=e.target.files[0]; if(!file) return;
  const fr=new FileReader();
  fr.onload=()=>{ try{ apply(JSON.parse(fr.result)); if($('#autoSave').checked) saveToLocal(); }catch(err){ alert('Could not read file'); } };
  fr.readAsText(file);
});
$('#resetBtn').addEventListener('click', ()=>{ localStorage.removeItem(storeKey); location.reload(); });

// Auto save toggle
$('#autoSave').addEventListener('change', (e)=>{
  if(e.target.checked) saveToLocal();
});
document.addEventListener('input', ()=>{
  if($('#autoSave').checked){
    saveToLocal();
  }
  updateCompletion();
});

// Print
$('#printBtn').addEventListener('click', ()=>window.print());

// Compact print mode
function applyCompact(){
  document.body.classList.toggle('compact', $('#compactTog').checked);
}
$('#compactTog').addEventListener('change', applyCompact);

// Theme handling
function applyTheme(theme){
  const selected = theme || 'default';
  document.documentElement.dataset.theme = selected;
  $('#themeSelect').value = selected;
  localStorage.setItem(themeKey, selected);
}
$('#themeSelect').addEventListener('change', (e)=>applyTheme(e.target.value));

// Completion tracking
const trackedFields = [
  'f_name','f_client','f_no','f_pm','f_type','f_loc','f_budget','f_hours',
  'f_summary','f_wbs','scope_notes','review_schedule','stakeholders','risk_notes',
  'cadence','change','doc_standards','efficiency_tools','comm_log','actual_hours',
  'efficiency_rating','optimization_notes','sustainability_notes',
  'fb_pm','fb_sm','fb_pmp','fb_ux','fb_dev'
];
function isFilled(el){
  if(!el) return false;
  if(el.type === 'checkbox') return el.checked;
  if(el.type === 'number') return el.value !== '';
  return String(el.value || '').trim().length > 0;
}

const sectionRules = {
  plan: ['f_name','f_client','f_pm','f_summary','f_wbs'],
  review: ['scope_notes','review_schedule','stakeholders','risk_notes'],
  schedule: ['actual_hours','efficiency_rating','optimization_notes'],
  execution: ['cadence','change','doc_standards','efficiency_tools','comm_log'],
  sustainability: ['sustainability_notes'],
  team: ['fb_pm','fb_sm','fb_pmp','fb_ux','fb_dev']
};

function updateSectionStatus(id, ratio){
  const el = $('#status-' + id);
  if(!el) return;
  el.classList.remove('started','done');
  if(id === 'readme'){
    el.classList.add('guidance');
    return;
  }
  if(ratio >= 1){
    el.textContent = 'Complete';
    el.classList.add('done');
  } else if(ratio > 0){
    el.textContent = 'In progress';
    el.classList.add('started');
  } else {
    el.textContent = 'Not started';
  }
}

function updateMissingItems(){
  const missing = [];
  if(!isFilled($('#f_name'))) missing.push('Add a project name in Plan with Precision.');
  if(!isFilled($('#f_summary'))) missing.push('Define success criteria and constraints.');
  if(!isFilled($('#risk_notes'))) missing.push('Document top project risks and mitigations.');
  if($$('.milestone').length === 0) missing.push('Add at least one schedule milestone.');
  if(!$$('#qaList input[type="checkbox"]:checked').length) missing.push('Mark at least one readiness/quality checkpoint complete.');
  if(!$('#ok_pm').checked || !$('#ok_sm').checked || !$('#ok_pmp').checked || !$('#ok_ux').checked || !$('#ok_dev').checked) missing.push('Complete all Team Sign-off approvals before release.');

  const list = $('#missingItems');
  if(!list) return;
  list.innerHTML = '';
  if(!missing.length){
    const li = document.createElement('li');
    li.textContent = 'No critical gaps detected. Keep details updated as the project evolves.';
    list.appendChild(li);
    return;
  }
  missing.slice(0,5).forEach(item=>{
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
}

function updateReleaseGate(){
  const checks = [
    ['Project Manager', $('#ok_pm')?.checked],
    ['Scrum Master', $('#ok_sm')?.checked],
    ['PMP Consultant', $('#ok_pmp')?.checked],
    ['UX/UI Consultant', $('#ok_ux')?.checked],
    ['Software Developer', $('#ok_dev')?.checked]
  ];
  const approvedCount = checks.filter(([,ok])=>!!ok).length;
  const gaps = checks.filter(([,ok])=>!ok).map(([name])=>name + ' sign-off pending');
  const status = $('#releaseStatus');
  const list = $('#releaseGaps');
  const count = $('#releaseCount');
  if(status){
    status.textContent = gaps.length ? 'Release readiness: Blocked' : 'Release readiness: Approved';
  }
  if(count){
    count.textContent = `Approvals: ${approvedCount}/5 complete`;
  }
  if(list){
    list.innerHTML = '';
    if(!gaps.length){
      const li=document.createElement('li');
      li.textContent='All role approvals complete. Release gate is clear.';
      list.appendChild(li);
    } else {
      gaps.forEach(g=>{const li=document.createElement('li');li.textContent=g;list.appendChild(li);});
    }
  }
}
function updateCompletion(){
  const fieldEls = trackedFields.map(id=>$('#'+id)).filter(Boolean);
  let total = fieldEls.length;
  let done = fieldEls.filter(isFilled).length;

  const scopeChecks = $$('#scopeList input');
  const qaChecks = $$('#qaList input[type="checkbox"]');
  const milestoneChecks = $$('.milestone input[type="checkbox"]');

  total += scopeChecks.length + qaChecks.length + milestoneChecks.length;
  done += scopeChecks.filter(c=>c.checked).length;
  done += qaChecks.filter(c=>c.checked).length;
  done += milestoneChecks.filter(c=>c.checked).length;

  const checklistTotal = scopeChecks.length + qaChecks.length;
  const checklistDone = scopeChecks.filter(c=>c.checked).length +
    qaChecks.filter(c=>c.checked).length;

  const milestonesTotal = milestoneChecks.length || 1;
  const milestonesDone = milestoneChecks.filter(c=>c.checked).length;

  const overallPct = total ? Math.round((done / total) * 100) : 0;
  const checklistPct = checklistTotal ? Math.round((checklistDone / checklistTotal) * 100) : 0;
  const milestonePct = Math.round((milestonesDone / milestonesTotal) * 100);

  $('#overallPct').textContent = overallPct;
  $('#checklistPct').textContent = checklistPct;
  $('#milestonePct').textContent = milestonePct;
  $('#overallBar').style.width = overallPct + '%';

  Object.entries(sectionRules).forEach(([section, ids])=>{
    const nodes = ids.map(id=>$('#'+id)).filter(Boolean);
    let ratio = nodes.length ? nodes.filter(isFilled).length / nodes.length : 0;
    if(section === 'team'){
      const approvals = [$('#ok_pm'), $('#ok_sm'), $('#ok_pmp'), $('#ok_ux'), $('#ok_dev')].filter(Boolean);
      const approvalRatio = approvals.length ? approvals.filter(x=>x.checked).length / approvals.length : 0;
      ratio = (ratio + approvalRatio) / 2;
    }
    updateSectionStatus(section, ratio);
  });
  updateSectionStatus('readme', 1);
  updateMissingItems();
  updateReleaseGate();
}

// Provide some defaults on first load
loadFromLocal();
applyTheme(localStorage.getItem(themeKey) || 'default');
if(!localStorage.getItem(storeKey)){
  // seed defaults for first view
  apply({});
}
updateCompletion();

// Accessibility improvements for keyboard navigation
$$('button, input, select, textarea').forEach(el=>{ el.addEventListener('keyup', (e)=>{ if(e.key==='Enter' && el.tagName==='BUTTON') el.click(); }); });
