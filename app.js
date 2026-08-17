
const KEY="gps_mvp_v01";
const state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  role:null, page:"home",
  athletes:[
    {id:"a1",name:"Adit Pratama",gender:"Boys",category:"U5",completion:86,streak:12},
    {id:"a2",name:"Bima Putra",gender:"Boys",category:"U5",completion:72,streak:6},
    {id:"a3",name:"Caca Kirana",gender:"Girls",category:"U5",completion:91,streak:18},
    {id:"a4",name:"Dafa Arya",gender:"Boys",category:"U6",completion:66,streak:3}
  ],
  exercises:[
    {id:"e1",name:"Sprint 10 m",category:"Speed",target:"10 repetitions",duration:"15 minutes",instruction:"Sprint 10 meter dengan fokus akselerasi."},
    {id:"e2",name:"Sprint 20 m",category:"Speed",target:"10 repetitions",duration:"20 minutes",instruction:"Sprint 20 meter dengan fokus pada akselerasi 5 meter pertama."},
    {id:"e3",name:"Start Position Drill",category:"Technique",target:"15 repetitions",duration:"15 minutes",instruction:"Latihan posisi start dan dorongan awal."},
    {id:"e4",name:"Roller 10 Minutes",category:"Endurance",target:"10 minutes",duration:"10 minutes",instruction:"Roller dengan cadence stabil."}
  ],
  homework:[
    {id:"h1",exerciseId:"e2",athletes:["a1","a2","a3"],date:"2026-08-16",deadline:"20:00",status:{a1:"Submitted",a2:"Waiting Review",a3:"Completed"}}
  ],
  submissions:[
    {id:"s1",homeworkId:"h1",athleteId:"a1",note:"Sprint 10 kali, sudah lebih baik dari kemarin.",score:4,status:"Waiting Review",fileName:"contoh-video.mp4",fileType:"video/mp4"}
  ],
  metrics:[
    {id:"m1",name:"Sprint 20 m",category:"Speed",unit:"Seconds",direction:"lower"}
  ],
  records:[
    {athleteId:"a1",metricId:"m1",date:"2026-07-19",value:5.42},
    {athleteId:"a1",metricId:"m1",date:"2026-08-01",value:5.31},
    {athleteId:"a1",metricId:"m1",date:"2026-08-16",value:5.18},
    {athleteId:"a2",metricId:"m1",date:"2026-08-16",value:5.31}
  ]
};
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function uid(p){return p+Math.random().toString(36).slice(2,9)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(msg){const el=document.createElement("div");el.className="toast";el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),1800)}
function athlete(id){return state.athletes.find(a=>a.id===id)}
function exercise(id){return state.exercises.find(e=>e.id===id)}
function metric(id){return state.metrics.find(m=>m.id===id)}
function formatDate(d){return new Date(d+"T00:00:00").toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}

function header(){
 return `<div class="topbar"><div class="brand"><img src="logo.png"><div><div class="brand-title">GPS — GTWENTY PUSH STRIVE</div><div class="brand-sub">TRAIN • RIDE • PROGRESS</div></div></div><div class="role-pill">${state.role==="coach"?"🧑‍🏫 Coach":"👨‍👩‍👧 Parent"} · <button style="background:none;border:0;color:#fff" onclick="logout()">Keluar</button></div></div>`
}
function nav(){
 const items=state.role==="coach"?[
  ["home","🏠","Home"],["homework","📋","Homework"],["training","⚡","Training"],["performance","📈","Performance"],["athletes","👥","Athletes"]
 ]:[["parent","🏠","Home"],["homework","📋","Homework"],["performance","📈","Progress"]];
 return `<div class="nav"><div class="nav-inner">${items.map(x=>`<button class="${state.page===x[0]?'active':''}" onclick="go('${x[0]}')"><span class="ico">${x[1]}</span>${x[2]}</button>`).join("")}</div></div>`
}
function go(p){state.page=p;save();render()}

function render(){
 if(!state.role)return login();
 const body=state.role==="parent"?renderParent():renderCoach();
 document.getElementById("app").innerHTML=`<div class="shell">${header()}${body}</div>${nav()}`;
}
function renderCoach(){
 if(state.page==="home")return coachHome();
 if(state.page==="homework")return homeworkPage();
 if(state.page==="training")return trainingPage();
 if(state.page==="performance")return performancePage();
 if(state.page==="athletes")return athletesPage();
 return coachHome();
}
function coachHome(){
 const total=state.homework.reduce((n,h)=>n+h.athletes.length,0);
 const submitted=state.homework.reduce((n,h)=>n+Object.values(h.status).filter(s=>["Submitted","Completed"].includes(s)).length,0);
 const waiting=state.homework.reduce((n,h)=>n+Object.values(h.status).filter(s=>s==="Waiting Review").length,0);
 return `<div class="hero"><h1>Hi, Coach! 👋</h1><p>Let's make progress today.</p></div>
 <div class="grid stats">
  <div class="card stat"><div class="num">${submitted}</div><div class="label">Completed / Submitted</div></div>
  <div class="card stat"><div class="num">${waiting}</div><div class="label">Waiting Review</div></div>
  <div class="card stat"><div class="num">${total-submitted}</div><div class="label">Not Completed</div></div>
  <div class="card stat"><div class="num">${state.athletes.length}</div><div class="label">Total Athletes</div></div>
 </div>
 <div class="grid cards">
  <div class="card"><div class="section-head"><h2>Upcoming Homework</h2><button class="btn small" onclick="openHomeworkModal()">+ Create</button></div>
   <div class="list">${state.homework.map(h=>{const ex=exercise(h.exerciseId);return `<div class="list-item row between"><div class="row"><div class="exercise-icon">⚡</div><div><b>${esc(ex?.name)}</b><div class="muted">${h.athletes.length} athletes · deadline ${h.deadline}</div></div></div><button class="btn blue small" onclick="go('homework')">Open</button></div>`}).join("")}</div>
  </div>
  <div class="card"><div class="section-head"><h2>Performance Overview</h2><button class="btn ghost small" onclick="go('performance')">View</button></div>
   ${state.athletes.slice(0,4).map(a=>{const rs=state.records.filter(r=>r.athleteId===a.id);const last=rs.sort((x,y)=>y.date.localeCompare(x.date))[0];return `<div class="list-item row between"><div><b>${esc(a.name)}</b><div class="muted">${a.category} · ${a.gender}</div></div><div style="text-align:right"><b>${last?last.value+" s":"—"}</b><div class="delta">Sprint 20 m</div></div></div>`}).join("")}
  </div>
 </div>`
}
function homeworkPage(){
 return `<div class="section-head"><h2>Homework</h2><button class="btn" onclick="openHomeworkModal()">+ Create Homework</button></div>
 <div class="list">${state.homework.map(h=>{const ex=exercise(h.exerciseId);return `<div class="card"><div class="row between"><div><span class="badge blue-t">${esc(ex?.category)}</span><h3 style="margin:8px 0">${esc(ex?.name)}</h3><div class="muted">${esc(ex?.target)} · ${esc(ex?.duration)}</div></div><div class="badge orange">Deadline ${h.deadline}</div></div><div class="section-head"><span class="muted">Assigned to ${h.athletes.length} athletes</span><button class="btn blue small" onclick="viewSubmissions('${h.id}')">View Submissions</button></div></div>`}).join("")}</div>`
}
function trainingPage(){
 return `<div class="section-head"><h2>Training Library</h2><button class="btn" onclick="openExerciseModal()">+ Add Exercise</button></div>
 <div class="list">${state.exercises.map(e=>`<div class="card list-item row between"><div class="row"><div class="exercise-icon">⚡</div><div><b>${esc(e.name)}</b><div class="muted">${esc(e.category)} · ${esc(e.target)} · ${esc(e.duration)}</div></div></div><button class="btn ghost small" onclick="openExerciseModal('${e.id}')">Edit</button></div>`).join("")}</div>`
}
function performancePage(){
 return `<div class="section-head"><h2>Performance</h2><button class="btn" onclick="openMetricModal()">+ New Metric</button></div>
 <div class="grid cards"><div class="card"><h3 style="margin-top:0">Add Performance Record</h3><button class="btn blue" onclick="openRecordModal()">+ Record Test Result</button></div><div class="card"><h3 style="margin-top:0">Metrics</h3>${state.metrics.map(m=>`<div class="list-item"><b>${esc(m.name)}</b><div class="muted">${esc(m.category)} · ${esc(m.unit)} · ${m.direction==="lower"?"Lower is better":"Higher is better"}</div></div>`).join("")}</div></div>
 ${state.athletes.map(a=>performanceCard(a)).join("")}`
}
function performanceCard(a){
 const m=state.metrics[0]; const rs=state.records.filter(r=>r.athleteId===a.id&&r.metricId===m.id).sort((x,y)=>x.date.localeCompare(y.date));
 if(!rs.length)return `<div class="card" style="margin-top:14px"><div class="row between"><div><b>${esc(a.name)}</b><div class="muted">${a.category} · ${a.gender}</div></div><button class="btn small" onclick="openRecordModal('${a.id}')">+ Record</button></div><div class="empty">Belum ada data ${esc(m.name)}</div></div>`;
 const best=m.direction==="lower"?Math.min(...rs.map(r=>r.value)):Math.max(...rs.map(r=>r.value)); const first=rs[0].value,last=rs[rs.length-1].value; const imp=m.direction==="lower"?((first-last)/first*100):((last-first)/first*100);
 return `<div class="card" style="margin-top:14px"><div class="row between"><div><b>${esc(a.name)}</b><div class="muted">${esc(m.name)} · ${esc(m.unit)}</div></div><button class="btn small" onclick="openRecordModal('${a.id}')">+ Record</button></div>
 <div class="chart-wrap">${makeChart(rs,m)}</div><div class="grid stats" style="margin-top:10px"><div class="card stat"><div class="num">${best}</div><div class="label">Personal Best</div></div><div class="card stat"><div class="num">${last}</div><div class="label">Latest</div></div><div class="card stat"><div class="num">${imp>=0?"+":""}${imp.toFixed(1)}%</div><div class="label">Improvement</div></div><div class="card stat"><div class="num">${rs.length}</div><div class="label">Tests</div></div></div></div>`
}
function makeChart(rs,m){
 const w=800,h=250,p=42, vals=rs.map(r=>r.value), min=Math.min(...vals),max=Math.max(...vals), range=(max-min)||1;
 const pts=rs.map((r,i)=>{const x=p+(i*(w-2*p)/Math.max(1,rs.length-1));const y=h-p-((r.value-min)/range)*(h-2*p);return [x,y,r]});
 const path=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
 return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="${p}" y1="${h-p}" x2="${w-p}" y2="${h-p}" stroke="#273244"/><line x1="${p}" y1="${p}" x2="${p}" y2="${h-p}" stroke="#273244"/><path d="${path}" fill="none" stroke="#ff4545" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(pt=>`<circle cx="${pt[0]}" cy="${pt[1]}" r="7" fill="#ff4545"/><text x="${pt[0]}" y="${pt[1]-13}" text-anchor="middle" fill="#fff" font-size="15">${pt[2].value}</text><text x="${pt[0]}" y="${h-14}" text-anchor="middle" fill="#98a3b5" font-size="12">${pt[2].date.slice(5)}</text>`).join("")}</svg>`
}
function athletesPage(){
 return `<div class="section-head"><h2>Athletes</h2><button class="btn" onclick="openAthleteModal()">+ Add Athlete</button></div>
 <div class="list">${state.athletes.map(a=>`<div class="card list-item row between"><div><b>${esc(a.name)}</b><div class="muted">${esc(a.category)} · ${esc(a.gender)}</div></div><div style="text-align:right"><b>${a.completion}%</b><div class="muted">${a.streak} day streak</div><button class="btn ghost small" onclick="athleteDetail('${a.id}')">View Profile</button></div></div>`).join("")}</div>`
}
function renderParent(){
 const a=state.athletes[0], hw=state.homework[0], ex=exercise(hw.exerciseId), st=hw.status[a.id]||"Not Started";
 return `<div class="hero"><h1>Hi, ${esc(a.name.split(" ")[0])}'s Family! 👋</h1><p>Keep training. Keep improving.</p></div>
 <div class="grid stats"><div class="card stat"><div class="num">${a.completion}%</div><div class="label">Homework Completion</div></div><div class="card stat"><div class="num">🔥 ${a.streak}</div><div class="label">Day Streak</div></div><div class="card stat"><div class="num">${state.records.filter(r=>r.athleteId===a.id).length}</div><div class="label">Performance Tests</div></div><div class="card stat"><div class="num">${st==="Completed"?"✓":"1"}</div><div class="label">Today's Homework</div></div></div>
 <div class="card" style="margin-top:14px"><div class="row between"><div><span class="badge blue-t">${esc(ex.category)}</span><h2 style="margin:8px 0">${esc(ex.name)}</h2><div class="muted">${esc(ex.target)} · ${esc(ex.duration)}</div></div><span class="badge ${st==="Completed"?"green":st==="Waiting Review"?"orange":"red"}">${st}</span></div><p>${esc(ex.instruction)}</p><button class="btn blue" onclick="openSubmissionModal('${hw.id}','${a.id}')">${st==="Completed"?"View Submission":"Start & Upload"}</button></div>
 <div class="section-head"><h2>Latest Feedback</h2></div><div class="card"><b>Coach</b><p class="muted">${state.submissions[0]?.note||"Belum ada feedback."}</p></div>`
}

function modal(inner){const el=document.createElement("div");el.className="modal";el.id="modal";el.innerHTML=`<div class="modal-box">${inner}</div>`;document.body.appendChild(el);el.addEventListener("click",e=>{if(e.target===el)el.remove()})}
function closeModal(){document.getElementById("modal")?.remove()}

function openExerciseModal(id){
 const e=id?exercise(id):{name:"",category:"Speed",target:"",duration:"",instruction:""};
 modal(`<div class="section-head"><h2>${id?"Edit":"Add"} Exercise</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div>
 <form class="form" onsubmit="saveExercise(event,'${id||""}')"><div class="field"><label>Nama latihan</label><input id="exName" required value="${esc(e.name)}"></div><div class="field"><label>Kategori</label><select id="exCat"><option>Speed</option><option>Technique</option><option>Strength</option><option>Endurance</option><option>Custom</option></select></div><div class="field"><label>Target</label><input id="exTarget" placeholder="10 repetitions / 20 meter / 15 menit" value="${esc(e.target)}"></div><div class="field"><label>Durasi</label><input id="exDuration" value="${esc(e.duration)}"></div><div class="field"><label>Instruksi</label><textarea id="exInstruction">${esc(e.instruction)}</textarea></div><button class="btn">Save Exercise</button></form>`)
}
function saveExercise(ev,id){ev.preventDefault();const obj={id:id||uid("e"),name:exName.value,category:exCat.value,target:exTarget.value,duration:exDuration.value,instruction:exInstruction.value};if(id)Object.assign(exercise(id),obj);else state.exercises.push(obj);save();closeModal();render();toast("Exercise tersimpan")}
function openHomeworkModal(){
 modal(`<div class="section-head"><h2>Create Homework</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><form class="form" onsubmit="saveHomework(event)"><div class="field"><label>Exercise</label><select id="hwEx">${state.exercises.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join("")}</select></div><div class="field"><label>Assign to athletes</label><div class="list-item">${state.athletes.map(a=>`<label style="display:block;margin:8px 0"><input type="checkbox" name="hwAth" value="${a.id}" checked> ${esc(a.name)}</label>`).join("")}</div></div><div class="field"><label>Tanggal</label><input id="hwDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>Deadline</label><input id="hwDeadline" type="time" value="20:00"></div><button class="btn">🚀 Send Homework</button></form>`)
}
function saveHomework(ev){ev.preventDefault();const ats=[...document.querySelectorAll('input[name="hwAth"]:checked')].map(x=>x.value);if(!ats.length){toast("Pilih minimal 1 atlet");return}const h={id:uid("h"),exerciseId:hwEx.value,athletes:ats,date:hwDate.value,deadline:hwDeadline.value,status:{}};ats.forEach(a=>h.status[a]="Not Started");state.homework.unshift(h);save();closeModal();render();toast("Homework terkirim")}
function viewSubmissions(hid){
 const h=state.homework.find(x=>x.id===hid);
 modal(`<div class="section-head"><h2>Submissions</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><div class="list">${h.athletes.map(aid=>{const a=athlete(aid),s=state.submissions.find(s=>s.homeworkId===hid&&s.athleteId===aid),st=h.status[aid];return `<div class="list-item row between"><div><b>${esc(a.name)}</b><div class="muted">${s?"Submitted":"Not submitted"}</div></div><span class="badge ${st==="Waiting Review"?"orange":st==="Completed"?"green":"red"}">${st}</span>${s?`<button class="btn blue small" onclick="reviewSubmission('${s.id}')">Review</button>`:""}</div>`}).join("")}</div>`)
}
function openSubmissionModal(hid,aid){
 const h=state.homework.find(x=>x.id===hid), ex=exercise(h.exerciseId), s=state.submissions.find(x=>x.homeworkId===hid&&x.athleteId===aid);
 modal(`<div class="section-head"><h2>${esc(ex.name)}</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><p>${esc(ex.instruction)}</p><div class="field"><label>Foto / Video latihan</label><input id="mediaFile" type="file" accept="image/*,video/*"></div><div class="field"><label>Catatan untuk Coach</label><textarea id="subNote" placeholder="Contoh: latihan dilakukan 10 repetisi">${esc(s?.note||"")}</textarea></div><button class="btn blue" onclick="submitWorkout('${hid}','${aid}')">Submit Workout</button>`)
}
function submitWorkout(hid,aid){
 const f=document.getElementById("mediaFile").files[0],note=document.getElementById("subNote").value;
 const h=state.homework.find(x=>x.id===hid);h.status[aid]="Waiting Review";
 state.submissions.push({id:uid("s"),homeworkId:hid,athleteId:aid,note,score:null,status:"Waiting Review",fileName:f?.name||"",fileType:f?.type||""});
 save();closeModal();render();toast("Workout berhasil disubmit")
}
function reviewSubmission(sid){
 const s=state.submissions.find(x=>x.id===sid),a=athlete(s.athleteId),h=state.homework.find(x=>x.id===s.homeworkId);
 modal(`<div class="section-head"><h2>Review Submission</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><div class="card"><b>${esc(a.name)}</b><div class="muted">${esc(s.fileName||"No media attached")}</div><p>${esc(s.note||"Tidak ada catatan.")}</p></div><div class="field" style="margin-top:12px"><label>Score (1–5)</label><input id="reviewScore" type="number" min="1" max="5" step="1" value="${s.score||5}"></div><div class="field"><label>Feedback</label><textarea id="reviewFeedback">${esc(s.feedback||"Good job! Keep improving.")}</textarea></div><div class="row"><button class="btn lime" onclick="saveReview('${sid}','Approved')">✓ Approve</button><button class="btn" onclick="saveReview('${sid}','Needs Improvement')">↩ Needs Improvement</button></div>`)
}
function saveReview(sid,status){const s=state.submissions.find(x=>x.id===sid);s.status=status;s.score=Number(reviewScore.value);s.feedback=reviewFeedback.value;const h=state.homework.find(x=>x.id===s.homeworkId);h.status[s.athleteId]=status==="Approved"?"Completed":"Needs Improvement";save();closeModal();render();toast("Review tersimpan")}
function openMetricModal(){modal(`<div class="section-head"><h2>New Performance Metric</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><form class="form" onsubmit="saveMetric(event)"><div class="field"><label>Metric name</label><input id="metName" required placeholder="Sprint 20 m"></div><div class="field"><label>Category</label><input id="metCat" value="Speed"></div><div class="field"><label>Unit</label><input id="metUnit" value="Seconds"></div><div class="field"><label>Better result</label><select id="metDir"><option value="lower">Lower is better</option><option value="higher">Higher is better</option></select></div><button class="btn">Save Metric</button></form>`)}
function saveMetric(ev){ev.preventDefault();state.metrics.push({id:uid("m"),name:metName.value,category:metCat.value,unit:metUnit.value,direction:metDir.value});save();closeModal();render();toast("Metric tersimpan")}
function openRecordModal(aid){
 const a=aid?athlete(aid):state.athletes[0];
 modal(`<div class="section-head"><h2>Add Performance Record</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><form class="form" onsubmit="saveRecord(event)"><div class="field"><label>Athlete</label><select id="recAth">${state.athletes.map(x=>`<option value="${x.id}" ${x.id===a.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select></div><div class="field"><label>Metric</label><select id="recMetric">${state.metrics.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join("")}</select></div><div class="field"><label>Date</label><input id="recDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>Result</label><input id="recValue" type="number" step="0.01" required placeholder="5.18"></div><button class="btn">Save Record</button></form>`)
}
function saveRecord(ev){ev.preventDefault();state.records.push({athleteId:recAth.value,metricId:recMetric.value,date:recDate.value,value:Number(recValue.value)});save();closeModal();render();toast("Performance record tersimpan")}
function openAthleteModal(){modal(`<div class="section-head"><h2>Add Athlete</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><form class="form" onsubmit="saveAthlete(event)"><div class="field"><label>Nama</label><input id="atName" required></div><div class="field"><label>Kategori</label><input id="atCat" placeholder="U5"></div><div class="field"><label>Gender</label><select id="atGender"><option>Boys</option><option>Girls</option></select></div><button class="btn">Save Athlete</button></form>`)}
function saveAthlete(ev){ev.preventDefault();state.athletes.push({id:uid("a"),name:atName.value,category:atCat.value,gender:atGender.value,completion:0,streak:0});save();closeModal();render();toast("Atlet ditambahkan")}
function athleteDetail(aid){const a=athlete(aid),rs=state.records.filter(r=>r.athleteId===aid);modal(`<div class="section-head"><h2>${esc(a.name)}</h2><button class="btn ghost small" onclick="closeModal()">Close</button></div><div class="card"><div class="kpi">${a.completion}%</div><div class="muted">Homework completion</div><hr style="border-color:#273244;border-width:1px 0 0;margin:14px 0"><div class="kpi">${a.streak} 🔥</div><div class="muted">Day streak</div></div><div class="section-head"><h3>Performance History</h3></div>${rs.map(r=>`<div class="list-item row between"><span>${formatDate(r.date)}</span><b>${r.value} ${metric(r.metricId)?.unit||""}</b></div>`).join("")||'<div class="empty">Belum ada data.</div>'}`)}


