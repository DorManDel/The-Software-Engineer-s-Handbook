import {initialTerminalState,executeCommand,promptFor,terminalChallenges,challengeProgress} from './terminal-engine.mjs';
import {mountAlgorithmArcade} from './algorithm-arcade.mjs';

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

function el(tag, className, txt) {
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(txt!==undefined)element.textContent=txt;
  return element;
}

const pages=new Set(['home','curriculum','terminal','pointers','arcade','sources']);
function navigate(page){
  const active=pages.has(page)?page:'home';
  $$('.view').forEach(x=>x.classList.toggle('active',x.id===`view-${active}`));
  $$('.nav-link').forEach(x=>{
    const isActive=x.dataset.nav===active;
    x.classList.toggle('active',isActive);
    if(isActive)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');
  });
  if(location.hash!==`#${active}`)history.replaceState(null,'',`#${active}`);
  window.scrollTo({top:0,behavior:'instant'});
}

$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.goto)));
$$('[data-nav]').forEach(b=>b.addEventListener('click',(e)=>{e.preventDefault();navigate(b.dataset.nav)}));
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
navigate(location.hash.slice(1));

async function loadJson(path){
  const r=await fetch(path,{cache:'no-cache'});
  if(!r.ok)throw new Error(`Unable to load ${path}: ${r.status}`);
  return r.json();
}

let curriculum=[];
let year='all';
function renderCurriculum(){
  const input=$('#course-search').value.trim().toLowerCase();
  const filtered=curriculum.filter(c=>(year==='all'||String(c.year)===year) && (!input||[c.title_he,c.title_en_translation,c.domain,c.course_code].join(' ').toLowerCase().includes(input)));
  const container=$('#curriculum-list');container.replaceChildren();
  $('#curriculum-count').textContent=`${filtered.length} schedule entries shown · ${curriculum.length} total`; 
  if(!filtered.length){container.append(el('p','empty-state','No matching curriculum entries.'));return;}
  const grouped=new Map();
  filtered.forEach(entry=>{const k=`Year ${entry.year} · Semester ${entry.semester}`;if(!grouped.has(k))grouped.set(k,[]);grouped.get(k).push(entry)});
  for(const [key,entries] of grouped){
    const group=el('section','semester-group');
    group.append(el('h2','semester-heading',key));
    const list=el('div','schedule-grid');
    for(const e of entries){
      const card=el('article','course-card glass');
      const top=el('div','course-title-row');
      top.append(el('strong','',e.title_en_translation||e.title_he));
      top.append(el('span','course-domain',e.entry_type==='elective'?'Elective':e.entry_type==='preparatory'?'Preparatory':e.domain||'Course'));
      card.append(top);
      card.append(el('div','hebrew',e.title_he));
      const meta=el('div','course-meta',e.course_code?`Course ${e.course_code} · Official schedule`:'Official schedule · Code not listed');
      card.append(meta);list.append(card);
    }
    group.append(list);container.append(group);
  }
}
$$('[data-year]').forEach(b=>b.addEventListener('click',()=>{year=b.dataset.year;$$('[data-year]').forEach(x=>x.classList.toggle('selected',x===b));renderCurriculum()}));
$('#course-search').addEventListener('input',renderCurriculum);
loadJson('./data/public/official_curriculum.json').then(d=>{curriculum=d.entries||[];$('#course-stat').textContent=`${curriculum.length} schedule entries`;renderCurriculum()}).catch(e=>{$('#curriculum-count').textContent=`Curriculum data unavailable: ${e.message}`});
loadJson('./data/public/public_sources.json').then(d=>{
  const list=d.sources||[];$('#sources-count').textContent=`${list.length} public references in registry`;
  const grid=$('#source-grid');grid.replaceChildren();
  list.forEach(s=>{
    const card=el('article','source-card glass');
    const kind=el('span','eyebrow',s.kind.replaceAll('_',' '));card.append(kind);
    card.append(el('h2','',s.title));
    card.append(el('p','muted small',s.notes||'Metadata-only public source reference.'));
    const bottom=el('div','source-bottom');
    bottom.append(el('span','source-state',s.verification.replaceAll('_',' ')));
    const link=el('a','','Open source ↗');link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';bottom.append(link);
    card.append(bottom);grid.append(card);
  });
}).catch(e=>{$('#sources-count').textContent=`Public sources unavailable: ${e.message}`});

let term=initialTerminalState();
let selectedChallenge='linux-files';
const terminalLog=$('#terminal-output');
function log(text,kind='stdout'){
  const line=el('div',`terminal-line ${kind}`,text);
  terminalLog.append(line);
  terminalLog.scrollTop=terminalLog.scrollHeight;
}
function renderMission(){
  const challenge=terminalChallenges[selectedChallenge];
  $('#mission-heading').textContent=challenge.name;
  $('#mission-description').textContent=challenge.brief;
  $('#mission-hint').textContent=challenge.hint;
  const progress=challengeProgress(term,selectedChallenge);
  $('#mission-counter').textContent=`${progress.filter(x=>x.done).length} / ${progress.length}`;
  const steps=$('#challenge-steps');steps.replaceChildren();
  progress.forEach(p=>{const row=el('div',`challenge-step${p.done?' complete':''}`);row.append(el('span','step-icon',p.done?'✓':'○'));row.append(el('span','',p.label));steps.append(row)});
  const examples=$('#terminal-examples');examples.replaceChildren();
  challenge.examples.forEach(x=>{const button=el('button','chip',x);button.type='button';button.addEventListener('click',()=>{$('#terminal-input').value=x;$('#terminal-input').focus()});examples.append(button)});
}
function renderTerminal(){
  $$('.mode-btn').forEach(b=>b.classList.toggle('selected',b.dataset.mode===term.mode));
  $('#terminal-prompt').textContent=promptFor(term);
  $('#terminal-window-title').textContent=term.mode==='linux'?'ubuntu@simulated-vm':'powershell@simulated-host';
  renderMission();
}
Object.entries(terminalChallenges).forEach(([id,mission])=>{const opt=el('option','',mission.name);opt.value=id;$('#challenge-select').append(opt)});
$('#challenge-select').addEventListener('change',e=>{selectedChallenge=e.target.value;term.mode=terminalChallenges[selectedChallenge].mode;renderTerminal();});
$$('.mode-btn').forEach(btn=>btn.addEventListener('click',()=>{term.mode=btn.dataset.mode;renderTerminal();log(`Switched view to simulated ${term.mode==='linux'?'Ubuntu':'PowerShell'}.`,'hint-line')}));
$('#terminal-reset').addEventListener('click',()=>{term=initialTerminalState();term.mode=terminalChallenges[selectedChallenge].mode;terminalLog.replaceChildren();log('Virtual filesystem reset. No real files were changed.','hint-line');renderTerminal()});
$('#terminal-form').addEventListener('submit',e=>{
  e.preventDefault();const input=$('#terminal-input');const command=input.value.trim();if(!command)return;
  log(`${promptFor(term)} ${command}`,'command-line');
  const result=executeCommand(term,command);
  term=result.state;if(result.clear)terminalLog.replaceChildren();
  if(result.output)log(result.output,result.output.startsWith('Error:')?'error-line':'stdout');
  input.value='';renderTerminal();
});
terminalLog.addEventListener('click',()=>$('#terminal-input').focus());
log('Welcome to Terminal Academy. This is a safe, simulated environment.','hint-line');
log('Type help (Ubuntu) or Get-Help (PowerShell), then complete the mission.','hint-line');
renderTerminal();

function renderPointers(){
  const value=Number($('#value-slider').value), linked=$('#pointer-connected').checked;
  $('#slider-value').textContent=String(value);
  $('#pointer-value').textContent=String(value);
  $('#pointer-address').textContent=linked?'0x1000':'NULL';
  $('#dereference-label').textContent=linked?`*ptr = ${value}`:'cannot dereference';
  $('#pointer-arrow').textContent=linked?'←':'×';
  $('#pointer-arrow').classList.toggle('disconnected',!linked);
  $('#pointer-code').textContent=`#include <stdio.h>\n\nint main(void) {\n    int x = ${value};\n    int *ptr = ${linked?'&x':'NULL'};\n${linked?`    printf("%d\\n", *ptr); // ${value}`:'    // Do not dereference a null pointer.'}\n    return 0;\n}`;
}
$('#value-slider').addEventListener('input',renderPointers);
$('#pointer-connected').addEventListener('change',renderPointers);
$$('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
  const correct=b.dataset.answer==='current';
  $$('.quiz-button').forEach(x=>x.classList.toggle('selected',x===b));
  $('#quiz-feedback').textContent=correct?'Correct. Dereferencing a valid pointer reads the object’s current value.':'Not quite. A pointer stores an address, not a frozen copy of x. Try again.';
  $('#quiz-feedback').className=`small ${correct?'correct-answer':'muted'}`;
}));
renderPointers();
mountAlgorithmArcade();
