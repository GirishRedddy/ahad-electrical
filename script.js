
const q=(s,p=document)=>p.querySelector(s), qa=(s,p=document)=>[...p.querySelectorAll(s)];
const toggle=q('.menu-toggle'), menu=q('.mobile-menu'), close=q('.menu-close');
toggle?.addEventListener('click',()=>menu.classList.add('open')); close?.addEventListener('click',()=>menu.classList.remove('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});qa('.reveal').forEach(e=>io.observe(e));
qa('.finder-app button').forEach(b=>b.addEventListener('click',()=>location.href=b.dataset.target));
const steps=qa('#estimateForm .step'), bars=qa('.progress i'); let step=0;
function show(n){step=Math.max(0,Math.min(steps.length-1,n));steps.forEach((x,i)=>x.classList.toggle('active',i===step));bars.forEach((x,i)=>x.classList.toggle('active',i<=step));scrollTo({top:0,behavior:'smooth'})}
qa('#estimateForm .next').forEach(b=>b.addEventListener('click',()=>{
  const current=steps[step];
  if(!current)return;
  const required=[...current.querySelectorAll('[required]')];
  for(const el of required){
    if(!el.checkValidity()){
      el.reportValidity();
      el.focus();
      return;
    }
  }
  show(step+1);
}));
qa('#estimateForm .back').forEach(b=>b.addEventListener('click',()=>show(step-1)));
q('#estimateForm')?.addEventListener('submit',e=>{
  const form=e.currentTarget;
  if(!form.checkValidity()){
    e.preventDefault();
    const bad=form.querySelector(':invalid');
    const badStep=steps.findIndex(x=>x.contains(bad));
    if(badStep>=0)show(badStep);
    setTimeout(()=>bad?.reportValidity(),50);
  }
});
const params=new URLSearchParams(location.search), sel=q('#serviceSelect'); if(sel&&params.get('service')) sel.value=params.get('service');
q('#areaBtn')?.addEventListener('click',()=>{const v=q('#areaInput').value.trim();q('#areaResult').textContent=v?`Thanks. “${v}” will be checked against Ahad's verified service-area list once that list is connected.`:'Enter a city or ZIP code first.'});

// Service booking workflow.
const serviceData = {
"electrical-troubleshooting":["Electrical Troubleshooting","1 hr","user-electrician.jpg"],
"recessed-lighting":["Installing Recessed Lighting","3 hrs","recessed-lighting.jpg"],
"scheduler-installation":["Scheduler Installation","1 hr","scheduler-installation.jpg"],
"fans-installation":["Fans Installation","1 hr","user-outdoor-lighting.jpg"],
"outdoor-focus-lights":["Outdoor Focus Lights","5 hrs","user-indoor-fan-light.jpg"],
"led-panel-installations":["LED Panel Installations","2 hrs","commercial-led-work.jpg"],
"ev-charger-hardwire":["EV Charger Installation Hard Wire Beside the Braker Box Panel","1 hr","user-ev-panel.jpg"],
"nema-14-50":["NEMA 14-50 Outlet","1 hr 30 mins","nema-14-50.jpg"],
"tesla-powerwall-3":["Tesla Powerwall 3 Installation","8 hrs","user-powerwall-install.jpg"]
};
const bf=q('#bookingForm'), bsteps=qa('.book-step'), bp=qa('.booking-progress span'); let bs=0;
function showBook(n){bs=Math.max(0,Math.min(4,n));bsteps.forEach((x,i)=>x.classList.toggle('active',i===bs));bp.forEach((x,i)=>x.classList.toggle('active',i<=bs)); if(bs===4) renderReview(); scrollTo({top:0,behavior:'smooth'})}
qa('.book-next').forEach(b=>b.addEventListener('click',()=>{
  if(bs===0&&!q('#bookService').value)return alert('Choose a service first.');
  if(bs===1&&(!q('#dateField').value||!q('#timeField').value))return alert('Choose a preferred date and time.');
  if(bs===2){const req=['address1','city','state','zip'];for(const n of req){const el=bf.elements[n];if(!el?.value.trim()){el?.focus();return alert('Please complete the required service address fields.')}}if(!/^\d{5}(-\d{4})?$/.test(bf.elements.zip.value.trim())){bf.elements.zip.focus();return alert('Enter a valid ZIP code.')}}
  if(bs===3){const req=['name','email','phone'];for(const n of req){const el=bf.elements[n];if(!el?.value.trim()){el?.focus();return alert('Please complete your required contact information.')}}if(!bf.elements.email.checkValidity()){bf.elements.email.focus();return alert('Enter a valid email address.')}const digits=bf.elements.phone.value.replace(/\D/g,'');if(digits.length<10){bf.elements.phone.focus();return alert('Enter a valid phone number.')}}
  showBook(bs+1)
}));
qa('.book-back').forEach(b=>b.addEventListener('click',()=>showBook(bs-1)));
const bsel=q('#bookService'); if(bsel){let slug=new URLSearchParams(location.search).get('service');if(serviceData[slug])bsel.value=slug;function updateService(){let d=serviceData[bsel.value];q('#selectedService').innerHTML=d?`<b>${d[0]}</b><br>${d[1]} | Quote provided by Ahad`:'';q('#bookingServiceSummary').innerHTML=d?`<h3>${d[0]}</h3><p>${d[1]} | Contact us for quote</p><img src="assets/${d[2]}" alt="">`:''}bsel.addEventListener('change',updateService);updateService()}
let view=new Date(); view.setDate(1); const today=new Date(); today.setHours(0,0,0,0);
function drawCal(){let cal=q('#calendar');if(!cal)return;cal.innerHTML='';q('#monthTitle').textContent=view.toLocaleDateString('en-US',{month:'long',year:'numeric'});let first=new Date(view.getFullYear(),view.getMonth(),1).getDay(),days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();for(let i=0;i<first;i++)cal.append(document.createElement('span'));for(let d=1;d<=days;d++){let dt=new Date(view.getFullYear(),view.getMonth(),d),btn=document.createElement('button');btn.type='button';btn.textContent=d;btn.disabled=dt<today;btn.onclick=()=>{qa('#calendar button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');q('#dateField').value=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`};cal.append(btn)}}drawCal();
q('#prevMonth')?.addEventListener('click',()=>{view.setMonth(view.getMonth()-1);drawCal()});q('#nextMonth')?.addEventListener('click',()=>{view.setMonth(view.getMonth()+1);drawCal()});qa('.times button').forEach(b=>b.addEventListener('click',()=>{qa('.times button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');q('#timeField').value=b.textContent}));
function renderReview(){if(!bf)return;let fd=new FormData(bf), d=serviceData[fd.get('service')];q('#reviewBooking').innerHTML=`<b>${d?.[0]||''}</b><span>${fd.get('date')||''} at ${fd.get('preferred-time')||''}</span><span>${fd.get('address1')||''}, ${fd.get('city')||''}, TX ${fd.get('zip')||''}</span><span>${fd.get('name')||''} • ${fd.get('email')||''} • ${fd.get('phone')||''}</span>`}
