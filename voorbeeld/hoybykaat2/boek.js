/* Boekingen op de website van Hoy by Kaat */
(function(){
var H=window.HOY;if(!H)return;
var PIJL='<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var MAAND=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function vandaag(){var d=new Date();d.setHours(0,0,0,0);return d;}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function toekomst(s){return new Date(s.datum+'T23:59:00')>=vandaag();}
function sesVan(act){return H.sessies().filter(function(s){return s.act===act&&toekomst(s);});}
function eerstVolgend(a){
 if(a.type==='afspraak'){var d=vandaag();d.setDate(d.getDate()+1);return {txt:a.id==='trouw'?'Kies zelf je moment':'Elke dag op afspraak',vrij:null};}
 var l=sesVan(a.id).filter(function(s){return H.vrij(s)>0;});
 if(!l.length)return {txt:'Volzet',vrij:0};
 return {txt:H.datumKort(l[0].datum)+(l[0].tot?' tot '+H.datumKort(l[0].tot):''),vrij:H.vrij(l[0]),s:l[0]};
}
function uur(u){var p=u.split(':');return +p[0]+'u'+(p[1]!=='00'?p[1]:'');}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function prijsTxt(a){if(!a.prijs)return 'Gratis';return (a.vanaf?'vanaf ':'')+H.euro(a.prijs)+' '+(a.kind?'per kind':'pp');}

/* ---------- tegels en eerstvolgende data ---------- */
function tegels(){
 var t=document.getElementById('tegels');if(!t)return;
 t.innerHTML=H.act.map(function(a){var v=eerstVolgend(a),sub;
  if(v.vrij===null)sub=esc(v.txt);
  else if(v.vrij===0)sub='Volzet, nieuwe data volgen';
  else sub=cap(H.datumKort(v.s.datum))+(v.s.tot?' tot '+H.datumKort(v.s.tot):', '+uur(v.s.uur))+' · <em>'+(v.vrij<=3?'nog '+v.vrij+(v.vrij===1?' plekje':' plekjes'):v.vrij+' plekjes vrij')+'</em>';
  return '<button type="button" class="akt" data-boek="'+a.id+'" style="--k:'+a.kleur+';--kz:'+a.zacht+'"><img src="'+a.foto+'" alt="" loading="lazy"><span class="ak-t"><b>'+esc(a.naam)+'</b><small>'+sub+'</small><small class="ak-pm">'+prijsTxt(a)+'</small></span><span class="ak-p">'+prijsTxt(a)+'</span><span class="ak-k">'+(a.trouw?'Plan':'Boek')+'</span></button>';
 }).join('');
}
tegels();

/* ---------- 3D-kanteling op shopkaarten ---------- */
if(matchMedia('(hover:hover)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.querySelectorAll('.prod').forEach(function(k){
  k.addEventListener('mousemove',function(e){var r=k.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;k.style.transform='perspective(900px) rotateY('+(x*7)+'deg) rotateX('+(-y*7)+'deg) translateY(-6px)';});
  k.addEventListener('mouseleave',function(){k.style.transform='';});
 });
}

/* ---------- lade ---------- */
var lade=document.getElementById('lade'),inEl=document.getElementById('ladeIn'),voet=document.getElementById('ladeVoet'),stappen=document.querySelectorAll('#stappen span');
var st={};
function open(act,ses){
 st={stap:act?2:1,act:act||null,ses:ses||null,datum:null,dagdeel:null,aantal:null,g:{brief:true},maand:null};
 if(ses){var s=H.sessie(ses);if(s)st.datum=s.datum;}
 lade.classList.add('open');lade.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';
 if(window.__lenis)window.__lenis.stop();
 var m=document.getElementById('mobiel');if(m&&m.classList.contains('open')){m.classList.remove('open');m.setAttribute('aria-hidden','true');}
 teken();
}
function sluit(){lade.classList.remove('open');lade.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';if(window.__lenis)window.__lenis.start();}
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-boek]');
 if(t){e.preventDefault();e.stopPropagation();open(t.getAttribute('data-boek')||null,t.getAttribute('data-ses'));return;}
 if(e.target.closest('[data-sluit]'))sluit();
},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lade.classList.contains('open'))sluit();});

function minAantal(){var a=H.actVan(st.act);if(!a)return 1;if(a.id==='ws'&&st.datum){var d=new Date(st.datum+'T12:00:00').getDay();return (d===0||d===6)?4:2;}return 1;}
function maxAantal(){var a=H.actVan(st.act);if(a.type==='sessies'&&st.ses){return Math.max(1,H.vrij(H.sessie(st.ses)));}return a.max||16;}
function totaal(){var a=H.actVan(st.act);if(!a)return '';if(!a.prijs)return 'Gratis';var n=st.aantal||minAantal();return (a.vanaf?'vanaf ':'')+H.euro(a.prijs*n);}

function teken(){
 stappen.forEach(function(s,i){s.className=i+1<st.stap?'gedaan':(i+1===st.stap?'aan':'');});
 inEl.scrollTop=0;
 if(st.stap===1)stap1();else if(st.stap===2)stap2();else if(st.stap===3)stap3();else stap4();
}
function voetZet(terug,knop,ok,tot){
 voet.style.display='';
 voet.innerHTML=(terug?'<button type="button" class="terug" id="vTerug">Terug</button>':'')+'<div class="tot">'+(tot||'')+'</div><button type="button" class="btn groen" id="vVerder"'+(ok?'':' disabled')+'>'+knop+' '+PIJL+'</button>';
 var b=document.getElementById('vTerug');if(b)b.onclick=function(){st.stap--;if(st.stap===1&&!st.act)st.stap=1;teken();};
}

function stap1(){
 inEl.innerHTML='<div class="stap"><h3>Wat wil je boeken?</h3><p class="uitleg">Kies een activiteit. In de volgende stap kies je je datum.</p><div class="keuze-lijst">'+
 H.act.map(function(a){return '<button type="button" class="kz" data-a="'+a.id+'"><img src="'+a.foto+'" alt=""><span><b>'+esc(a.naam)+'</b><small>'+esc(a.sub)+'</small></span><span class="kp" style="background:'+a.zacht+';color:'+a.kleur+'">'+prijsTxt(a)+'</span></button>';}).join('')+'</div></div>';
 inEl.querySelectorAll('.kz').forEach(function(b){b.onclick=function(){if(st.act!==b.dataset.a){st.ses=null;st.datum=null;st.dagdeel=null;st.aantal=null;}st.act=b.dataset.a;st.stap=2;teken();};});
 voet.style.display='none';
}

function stap2(){
 var a=H.actVan(st.act);
 var h='<div class="stap"><div class="banner"><img src="'+a.foto+'" alt=""><div><b>'+esc(a.naam)+'</b><small>'+esc(a.uitleg)+'</small></div></div>';
 if(a.type==='sessies'){
  var l=sesVan(a.id);
  h+='<span class="lbl">Kies je datum</span><div class="sessies">'+(l.length?l.map(function(s){var v=H.vrij(s),d=new Date(s.datum+'T12:00:00'),pct=Math.round((s.plaatsen-v)/s.plaatsen*100);
   return '<button type="button" class="ses'+(st.ses===s.id?' aan':'')+'" data-s="'+s.id+'"'+(v?'':' disabled')+'><span class="dg" style="background:'+a.zacht+';color:'+a.kleur+'"><b>'+d.getDate()+'</b><small>'+MAAND[d.getMonth()]+'</small></span><span class="sw"><b>'+cap(H.datumLang(s.datum))+(s.tot?' tot '+H.datumKort(s.tot):'')+'</b><small>'+(s.tot?(a.id==='kamp'?'9u tot 16u':'10u tot 16u'):'Om '+uur(s.uur))+'</small><span class="balk2"><i style="width:'+pct+'%;background:'+(v<=3?'#E8682A':a.kleur)+'"></i></span></span><span class="nog" style="color:'+(v?(v<=3?'#E8682A':a.kleur):'#9AA39D')+'">'+(v?'nog '+v:'volzet')+'</span></button>';
  }).join(''):'<p class="uitleg">Er staan nog geen nieuwe data gepland. Bel of mail gerust, dan zet ik je op de lijst.</p>')+'</div>';
 }else{
  h+='<span class="lbl">'+(a.trouw?'Wanneer kom je langs?':'Kies je dag')+'</span>'+kalender()+'<span class="lbl">Welk moment van de dag?</span><div class="pills">'+['Voormiddag','Namiddag','Avond'].map(function(p){return '<button type="button" class="pill'+(st.dagdeel===p?' aan':'')+'" data-p="'+p+'">'+p+'</button>';}).join('')+'</div>';
 }
 if(!a.trouw){
  var mn=minAantal(),mx=maxAantal();if(!st.aantal||st.aantal<mn)st.aantal=mn;if(st.aantal>mx)st.aantal=mx;
  h+='<span class="lbl">Met hoeveel kom je?</span><div class="teller"><span>'+(a.kind?'Kinderen':'Personen')+'<small>'+(a.id==='ws'?(st.datum?'Op deze dag vanaf '+mn+' personen':'In de week vanaf 2, in het weekend vanaf 4'):(a.kind?'Per kind '+H.euro(a.prijs):'vanaf '+H.euro(a.prijs)+' per persoon'))+'</small></span><button type="button" id="min"'+(st.aantal<=mn?' disabled':'')+'>−</button><output>'+st.aantal+'</output><button type="button" id="plus"'+(st.aantal>=mx?' disabled':'')+'>+</button></div>';
 }
 h+='</div>';inEl.innerHTML=h;
 inEl.querySelectorAll('.ses').forEach(function(b){b.onclick=function(){st.ses=b.dataset.s;st.datum=H.sessie(st.ses).datum;teken();};});
 inEl.querySelectorAll('.pill').forEach(function(b){b.onclick=function(){st.dagdeel=b.dataset.p;teken();};});
 inEl.querySelectorAll('.kal-grid [data-d]').forEach(function(b){b.onclick=function(){st.datum=b.dataset.d;teken();};});
 var km=inEl.querySelector('[data-m]');inEl.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){st.maand+= +b.dataset.m;teken();};});
 var m=document.getElementById('min'),p=document.getElementById('plus');
 if(m)m.onclick=function(){st.aantal--;teken();};if(p)p.onclick=function(){st.aantal++;teken();};
 var ok=a.type==='sessies'?!!st.ses:(!!st.datum&&!!st.dagdeel);
 voetZet(true,'Verder',ok,a.prijs?'<b>'+totaal()+'</b>'+(a.vanaf?'afhankelijk van de materialen':'alles inbegrepen'):'<b>Gratis</b>vrijblijvend gesprek');
 document.getElementById('vTerug').onclick=function(){st.stap=1;teken();};
 document.getElementById('vVerder').onclick=function(){st.stap=3;teken();};
}
function kalender(){
 var nu=vandaag();if(st.maand===null){var b=st.datum?new Date(st.datum+'T12:00:00'):new Date(nu.getTime()+864e5);st.maand=b.getFullYear()*12+b.getMonth();}
 var j=Math.floor(st.maand/12),m=st.maand%12,eerste=new Date(j,m,1),start=(eerste.getDay()+6)%7,dagen=new Date(j,m+1,0).getDate();
 var min=nu.getFullYear()*12+nu.getMonth();
 var h='<div class="kal"><div class="kal-kop"><button type="button" data-m="-1"'+(st.maand<=min?' disabled':'')+' aria-label="Vorige maand">‹</button><b>'+eerste.toLocaleDateString('nl-BE',{month:'long',year:'numeric'})+'</b><button type="button" data-m="1"'+(st.maand>=min+6?' disabled':'')+' aria-label="Volgende maand">›</button></div><div class="kal-grid">';
 ['ma','di','wo','do','vr','za','zo'].forEach(function(w){h+='<span class="wd">'+w+'</span>';});
 for(var i=0;i<start;i++)h+='<span></span>';
 for(var d=1;d<=dagen;d++){var dt=new Date(j,m,d),k=iso(dt),kan=dt>nu;
  h+='<button type="button"'+(kan?' data-d="'+k+'"':' disabled')+' class="'+(st.datum===k?'aan':'')+(iso(nu)===k?' vandaag':'')+'">'+d+'</button>';}
 return h+'</div></div>';
}

function stap3(){
 var a=H.actVan(st.act),g=st.g;
 var h='<div class="stap"><h3>Nog even je gegevens</h3><p class="uitleg">Dan weet ik wie er komt en kan ik je een bevestiging sturen.</p><div class="velden">'+
 '<div class="veld"><label for="gNaam">Voor- en achternaam</label><input id="gNaam" autocomplete="name" value="'+esc(g.naam)+'"></div>'+
 '<div class="duo"><div class="veld"><label for="gMail">E-mail</label><input id="gMail" type="email" autocomplete="email" value="'+esc(g.mail)+'"></div><div class="veld"><label for="gGsm">Gsm</label><input id="gGsm" type="tel" autocomplete="tel" value="'+esc(g.gsm)+'"></div></div>';
 if(a.kind)h+='<div class="veld"><label for="gKind">Naam en leeftijd van '+(st.aantal>1?'de kinderen':'je kind')+'</label><input id="gKind" placeholder="bv. Fien (9)" value="'+esc(g.kinderen)+'"></div>';
 if(a.trouw)h+='<div class="duo"><div class="veld"><label for="gTrouw">Jullie trouwdatum</label><input id="gTrouw" type="date" value="'+esc(g.trouwdatum)+'"></div><div class="veld"><label for="gStijl">Welke bloemen?</label><select id="gStijl"><option'+(g.stijl==='Vers'?' selected':'')+'>Vers</option><option'+(g.stijl==='Droog'?' selected':'')+'>Droog</option><option'+(g.stijl==='Zijde'?' selected':'')+'>Zijde</option><option'+(g.stijl==='Nog geen idee'?' selected':'')+'>Nog geen idee</option></select></div></div>';
 if(a.id==='ws'||a.id==='winter'||a.id==='papier')h+='<div class="veld"><label for="gGel">Gelegenheid (mag leeg)</label><select id="gGel"><option></option>'+['Vrijgezellen','Verjaardag','Teambuilding','Moederdag','Pensioen','Gewoon zo'].map(function(o){return '<option'+(g.gelegenheid===o?' selected':'')+'>'+o+'</option>';}).join('')+'</select></div>';
 h+='<div class="veld"><label for="gOpm">'+(a.kind?'Iets wat ik moet weten?':'Nog iets kwijt?')+'</label><textarea id="gOpm" placeholder="'+(a.trouw?'Locatie, kleuren, ideeën…':'Wensen, kleuren, vragen…')+'">'+esc(g.opm)+'</textarea></div>'+
 '<label class="vink"><input type="checkbox" id="gBrief"'+(g.brief?' checked':'')+'> Ik krijg graag de nieuwsbrief met nieuwe workshops en kampen.</label></div></div>';
 inEl.innerHTML=h;
 function lees(){g.naam=v('gNaam');g.mail=v('gMail');g.gsm=v('gGsm');g.kinderen=v('gKind');g.trouwdatum=v('gTrouw');g.stijl=v('gStijl');g.gelegenheid=v('gGel');g.opm=v('gOpm');var c=document.getElementById('gBrief');g.brief=c&&c.checked;}
 function v(id){var e=document.getElementById(id);return e?e.value.trim():'';}
 function geldig(){return g.naam.length>1&&/\S+@\S+\.\S+/.test(g.mail)&&g.gsm.replace(/\D/g,'').length>=8&&(!a.kind||g.kinderen)&&(!a.trouw||g.trouwdatum);}
 inEl.addEventListener('input',function(){lees();document.getElementById('vVerder').disabled=!geldig();});
 inEl.addEventListener('change',function(){lees();document.getElementById('vVerder').disabled=!geldig();});
 lees();
 voetZet(true,a.trouw?'Vraag het gesprek aan':'Bevestig mijn boeking',geldig(),a.prijs?'<b>'+totaal()+'</b>'+(st.aantal||1)+' '+(a.kind?(st.aantal>1?'kinderen':'kind'):(st.aantal>1?'personen':'persoon')):'<b>Gratis</b>vrijblijvend');
 document.getElementById('vTerug').onclick=function(){lees();st.stap=2;teken();};
 document.getElementById('vVerder').onclick=function(){lees();if(!geldig())return;
  var o={act:a.id,sessie:st.ses||'',datum:st.datum,dagdeel:st.dagdeel||'',aantal:a.trouw?2:st.aantal,naam:g.naam,mail:g.mail,gsm:g.gsm,opm:g.opm,kinderen:g.kinderen,trouwdatum:g.trouwdatum,stijl:g.stijl,gelegenheid:g.gelegenheid,brief:g.brief};
  st.boeking=H.boek(o);st.stap=4;teken();tegels();feest();};
}

function stap4(){
 var a=H.actVan(st.act),b=st.boeking,s=b.sessie?H.sessie(b.sessie):null;
 var wanneer=cap(H.datumLang(b.datum))+(s&&s.tot?' tot '+H.datumKort(s.tot):'')+(s?(s.tot?'':' om '+uur(s.uur)):' · '+b.dagdeel.toLowerCase());
 inEl.innerHTML='<div class="stap klaar"><div class="vinkje"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3>'+(a.trouw?'Tot binnenkort!':'Joepie, je plekje is van jou')+'</h3><span class="hand">hoy '+esc(b.naam.split(' ')[0])+'!</span>'+
 '<div class="bon-kaart"><div><span>Boeking</span><b>'+b.id+'</b></div><div><span>Wat</span><b>'+esc(a.naam)+'</b></div><div><span>Wanneer</span><b>'+wanneer+'</b></div>'+(a.trouw?'':'<div><span>Aantal</span><b>'+b.aantal+'</b></div>')+'<div><span>Waar</span><b>Familie de Bayostraat 10, Leuven</b></div>'+(a.prijs?'<div><span>Prijs</span><b>'+(a.vanaf?'vanaf ':'')+H.euro(a.prijs*b.aantal)+'</b></div>':'')+'</div>'+
 '<p class="uitleg">Je krijgt een bevestiging op '+esc(b.mail)+'. Vragen? Bel of stuur een bericht naar 0496 96 86 01.</p></div>';
 voet.style.display='';
 voet.innerHTML='<button type="button" class="btn lijn" id="vIcs" style="color:var(--diep)">In mijn agenda</button><div class="tot"></div><button type="button" class="btn groen" data-sluit>Klaar '+PIJL+'</button>';
 document.getElementById('vIcs').onclick=function(){
  var tijd=s&&!s.tot?s.uur.replace(':','')+'00':(b.dagdeel==='Voormiddag'?'100000':b.dagdeel==='Avond'?'190000':'140000');
  var d=b.datum.replace(/-/g,''),eind=s&&s.tot?s.tot.replace(/-/g,''):d;
  var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Hoy by Kaat//NL','BEGIN:VEVENT','UID:'+b.id+'@hoybykaat.be','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART:'+d+'T'+tijd,'DTEND:'+eind+'T'+(s&&s.tot?'160000':String(+tijd.slice(0,2)+2).padStart(2,'0')+tijd.slice(2)),'SUMMARY:'+a.naam+' bij Hoy by Kaat','LOCATION:Familie de Bayostraat 10\\, Leuven','END:VEVENT','END:VCALENDAR'].join('\r\n');
  var u=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));var l=document.createElement('a');l.href=u;l.download='hoy-by-kaat.ics';document.body.appendChild(l);l.click();setTimeout(function(){URL.revokeObjectURL(u);l.remove();},400);
 };
}

/* ---------- bloemblaadjes bij een boeking ---------- */
function feest(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var c=document.getElementById('feest'),x=c.getContext('2d'),r=devicePixelRatio||1,W=innerWidth,Hh=innerHeight;c.width=W*r;c.height=Hh*r;x.setTransform(r,0,0,r,0,0);
 var kl=['#F26A2E','#F4A6B7','#FFC23D','#7FA7E8','#C9B6F0','#0B6B3E','#E8577A'],bl=[],ox=W>640?W-300:W/2,oy=Hh*.32;
 for(var i=0;i<90;i++){var h=Math.random()*Math.PI*2,v=4+Math.random()*9;bl.push({x:ox,y:oy,vx:Math.cos(h)*v,vy:Math.sin(h)*v-6,a:Math.random()*6,va:(Math.random()-.5)*.3,s:5+Math.random()*7,c:kl[i%kl.length],l:1});}
 var t0=performance.now();
 (function f(t){x.clearRect(0,0,W,Hh);var leeft=false;bl.forEach(function(p){p.vy+=.22;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;p.l-=.006;if(p.l>0&&p.y<Hh+20){leeft=true;x.save();x.globalAlpha=Math.max(0,p.l);x.translate(p.x,p.y);x.rotate(p.a);x.beginPath();x.moveTo(0,-p.s);x.bezierCurveTo(p.s*.9,-p.s*.5,p.s*.6,p.s*.8,0,p.s);x.bezierCurveTo(-p.s*.6,p.s*.8,-p.s*.9,-p.s*.5,0,-p.s);x.fillStyle=p.c;x.fill();x.restore();}});
  if(leeft&&t-t0<5000)requestAnimationFrame(f);else x.clearRect(0,0,W,Hh);})(t0);
}
})();
