
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
"fans-installation":["Fans Installation","1 hr","correct-indoor-fan.jpg?v=20260930b"],
"outdoor-focus-lights":["Outdoor Focus Lights","5 hrs","correct-outdoor-lighting.jpg?v=20260930b"],
"led-panel-installations":["LED Panel Installations","2 hrs","commercial-led-work.jpg"],
"ev-charger-hardwire":["EV Charger Installation Hard Wire Beside the Braker Box Panel","1 hr","user-ev-panel.jpg"],
"nema-14-50":["NEMA 14-50 Outlet","1 hr 30 mins","nema-14-50.jpg"],
"tesla-powerwall-3":["Tesla Powerwall 3 Installation","8 hrs","user-powerwall-install.jpg"],
  "troubleshooting":["Troubleshooting & Repairs","1 hr","user-electrician.jpg"],
  "panels":["Electrical Panels","1 hr","user-panel.jpg"],
  "indoor-lighting":["Indoor Lighting","1 hr","user-indoor-fan-light.jpg"],
  "outdoor-lighting":["Outdoor Lighting","1 hr","user-outdoor-lighting.jpg"],
  "outlets-switches":["Outlets & Switches","1 hr","home-outlets-switches.jpg"],
  "circuits-wiring":["Circuits & Wiring","1 hr","commercial-led-work.jpg"]
};
const BOOKING_API='https://script.google.com/macros/s/AKfycbxxb0NbLRzLs6oCfSQT1YH_DqmC69l_8HdKsMXY84OdWBQ69Zv7530hVCVhoCg-xMQu/exec';
const FORMSPREE_BOOKING='https://formspree.io/f/mqpaovda';
const durationMinutes={"electrical-troubleshooting":60,"recessed-lighting":180,"scheduler-installation":60,"fans-installation":60,"outdoor-focus-lights":300,"led-panel-installations":120,"ev-charger-hardwire":60,"nema-14-50":90,"tesla-powerwall-3":480,"troubleshooting":60,"panels":60,"indoor-lighting":60,"outdoor-lighting":60,"outlets-switches":60,"circuits-wiring":60};
const bf=q('#bookingForm'), bsteps=qa('.book-step'), bp=qa('.booking-progress span'); let bs=0;
function showBook(n){bs=Math.max(0,Math.min(4,n));bsteps.forEach((x,i)=>x.classList.toggle('active',i===bs));bp.forEach((x,i)=>x.classList.toggle('active',i<=bs));if(bs===4)renderReview();scrollTo({top:0,behavior:'smooth'})}
qa('.book-next').forEach(b=>b.addEventListener('click',()=>{
  if(bs===0&&!q('#bookService').value)return alert('Choose a service first.');
  if(bs===1&&(!q('#dateField').value||!q('#timeField').value))return alert('Choose an available date and time.');
  if(bs===2){const req=['address1','city','state','zip'];for(const n of req){const el=bf.elements[n];if(!el?.value.trim()){el?.focus();return alert('Please complete the required service address fields.')}}if(!/^\d{5}(-\d{4})?$/.test(bf.elements.zip.value.trim())){bf.elements.zip.focus();return alert('Enter a valid ZIP code.')}}
  if(bs===3){const req=['name','email','phone'];for(const n of req){const el=bf.elements[n];if(!el?.value.trim()){el?.focus();return alert('Please complete your required contact information.')}}if(!bf.elements.email.checkValidity()){bf.elements.email.focus();return alert('Enter a valid email address.')}const digits=bf.elements.phone.value.replace(/\D/g,'');if(digits.length<10){bf.elements.phone.focus();return alert('Enter a valid phone number.')}}
  showBook(bs+1)
}));
qa('.book-back').forEach(b=>b.addEventListener('click',()=>showBook(bs-1)));
const bsel=q('#bookService'); if(bsel){
  const slug=new URLSearchParams(location.search).get('service')||'';
  if(serviceData[slug] && [...bsel.options].some(o=>o.value===slug)){bsel.value=slug;const n=q('#preselectedNotice'),t=q('#preselectedTitle');if(n&&t){t.textContent=serviceData[slug][0];n.hidden=false;}}
  function updateService(){const d=serviceData[bsel.value];q('#selectedService').innerHTML=d?`<b>${d[0]}</b><br>${d[1]} | Quote provided by Ahad`:'';q('#bookingServiceSummary').innerHTML=d?`<h3>${d[0]}</h3><p>${d[1]} | Contact us for quote</p><img src="assets/${d[2]}" alt="">`:'';const n=q('#preselectedNotice'),t=q('#preselectedTitle');if(n&&t&&d)t.textContent=d[0];q('#dateField').value='';q('#timeField').value='';if(q('#liveTimes'))q('#liveTimes').innerHTML='';if(q('#availabilityStatus'))q('#availabilityStatus').textContent='Select a date to check live availability.';}
  bsel.addEventListener('change',updateService);updateService()
}
let view=new Date();view.setDate(1);const today=new Date();today.setHours(0,0,0,0);
function drawCal(){let cal=q('#calendar');if(!cal)return;cal.innerHTML='';q('#monthTitle').textContent=view.toLocaleDateString('en-US',{month:'long',year:'numeric'});let first=new Date(view.getFullYear(),view.getMonth(),1).getDay(),days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();for(let i=0;i<first;i++)cal.append(document.createElement('span'));for(let d=1;d<=days;d++){let dt=new Date(view.getFullYear(),view.getMonth(),d),btn=document.createElement('button');btn.type='button';btn.textContent=d;btn.disabled=dt<today||dt.getDay()===0;btn.title=dt.getDay()===0?'Closed Sunday':'';btn.onclick=()=>{qa('#calendar button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');const ds=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;q('#dateField').value=ds;loadAvailability(ds)};cal.append(btn)}}drawCal();
q('#prevMonth')?.addEventListener('click',()=>{view.setMonth(view.getMonth()-1);drawCal()});q('#nextMonth')?.addEventListener('click',()=>{view.setMonth(view.getMonth()+1);drawCal()});
async function loadAvailability(date){const times=q('#liveTimes'),status=q('#availabilityStatus'),slug=bsel?.value,dur=durationMinutes[slug]||60;q('#timeField').value='';times.innerHTML='';status.textContent='Checking Google Calendar availability…';try{const r=await fetch(`${BOOKING_API}?action=availability&date=${encodeURIComponent(date)}&duration=${dur}`,{redirect:'follow'});if(!r.ok)throw new Error('Availability service returned '+r.status);const data=await r.json();if(!data.success)throw new Error(data.error||'Unable to check availability.');if(!data.availableTimes?.length){status.textContent=data.closed?'Closed Sunday.':'No appointment times are available for this service on this date.';return}status.textContent='Live availability — choose a time:';data.availableTimes.forEach(slot=>{const b=document.createElement('button');b.type='button';b.textContent=slot.label;b.dataset.time=slot.time;b.onclick=()=>{qa('#liveTimes button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');q('#timeField').value=slot.time};times.append(b)})}catch(err){console.error(err);status.textContent='Live availability could not be loaded. Please try again or call (945) 289-8250.'}}
function renderReview(){if(!bf)return;let fd=new FormData(bf),d=serviceData[fd.get('service')],time=q('#liveTimes button.selected')?.textContent||fd.get('preferred-time')||'';q('#reviewBooking').innerHTML=`<b>${d?.[0]||''}</b><span>${fd.get('date')||''} at ${time}</span><span>${fd.get('address1')||''}, ${fd.get('city')||''}, TX ${fd.get('zip')||''}</span><span>${fd.get('name')||''} • ${fd.get('email')||''} • ${fd.get('phone')||''}</span>`}
if(bf)bf.addEventListener('submit',async e=>{e.preventDefault();if(!bf.checkValidity()){bf.reportValidity();return}const submit=bf.querySelector('[type="submit"]');submit.disabled=true;const original=submit.textContent;submit.textContent='Confirming availability…';const fd=new FormData(bf),slug=fd.get('service'),d=serviceData[slug],payload={name:fd.get('name'),email:fd.get('email'),phone:fd.get('phone'),service:d?.[0]||slug,date:fd.get('date'),time:fd.get('preferred-time'),duration:durationMinutes[slug]||60,address:fd.get('address1'),city:fd.get('city'),state:fd.get('state'),zip:fd.get('zip'),notes:fd.get('notes')||''};try{const r=await fetch(BOOKING_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'});const data=await r.json();if(!data.success){alert(data.error||'That appointment is no longer available.');await loadAvailability(payload.date);showBook(1);return}submit.textContent='Booking confirmed — sending notification…';const mail=new FormData();for(const [k,v] of Object.entries(payload))mail.append(k,v);mail.append('_subject','Confirmed Ahad Electrical Booking - '+payload.service);mail.append('calendar_event_id',data.eventId||'');try{await fetch(FORMSPREE_BOOKING,{method:'POST',body:mail,headers:{Accept:'application/json'}})}catch(mailErr){console.warn('Booking created; email notification failed',mailErr)}sessionStorage.setItem('ahadBooking',JSON.stringify(payload));location.href='booking-success.html'}catch(err){console.error(err);alert('We could not complete the live booking. No confirmation has been shown. Please try again or call (945) 289-8250.')}finally{submit.disabled=false;submit.textContent=original}});

