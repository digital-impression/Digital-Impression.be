/* Gedeelde gegevens voor de website en het dashboard van Hoy by Kaat.
   In deze voorbeeldversie worden nieuwe boekingen op het toestel bewaard. */
(function(){
var A=[
 {id:'ws',naam:'Bloemenworkshop',kort:'Workshop',sub:'Droog-, zijden of verse bloemen, op een moment dat jou past',prijs:55,eenheid:'per persoon',vanaf:true,foto:'img/b_ws.webp',type:'afspraak',kleur:'#D08E00',zacht:'#FFF1CC',max:16,
  uitleg:'Elke dag op afspraak. In de week vanaf 2 personen, in het weekend vanaf 4.'},
 {id:'winter',naam:'Winterkransen maken',kort:'Winterkrans',sub:'Met vers groen, droogbloemen of kunstbloemen',prijs:70,eenheid:'per persoon',vanaf:false,foto:'img/b_winter.webp',type:'sessies',kleur:'#0B6B3E',zacht:'#DCEFE2',
  uitleg:'Seizoensworkshop van drie uur. Lichtjesslinger, materiaal, drankje en versnapering inbegrepen. Je gaat naar huis met je eigen krans.'},
 {id:'papier',naam:'Papieren- en parelbloemen',kort:'Papier & parels',sub:'Bloemen die nooit verwelken',prijs:55,eenheid:'per persoon',vanaf:false,foto:'img/b_papier.webp',type:'sessies',kleur:'#E8577A',zacht:'#FCE1E8',
  uitleg:'Workshop van drie uur, vanaf 12 jaar. Je leert bloemen maken van crêpepapier en pareltjes. Drankje en versnapering inbegrepen.'},
 {id:'kamp',naam:'Kinderkamp',kort:'Kinderkamp',sub:'Voor kinderen van 8 tot 14 jaar',prijs:165,eenheid:'per kind, 3 dagen',vanaf:false,foto:'img/b_kamp.webp',type:'sessies',kleur:'#4F7FD9',zacht:'#DFE9FB',kind:true,
  uitleg:'Van 9 tot 16 uur. Materiaal en begeleiding inbegrepen. Lunch, drinkbus en tussendoortje zelf meebrengen.'},
 {id:'jeugd',naam:'Jeugdkamp 12+',kort:'Jeugdkamp',sub:'Papier- en parelbloemen voor jongeren vanaf 12 jaar',prijs:165,eenheid:'per jongere, 3 dagen',vanaf:false,foto:'img/s_parel.webp',type:'sessies',kleur:'#8A63D2',zacht:'#ECE4FA',kind:true,
  uitleg:'Van 10 tot 16 uur, maximaal 10 jongeren.'},
 {id:'trouw',naam:'Kennismaking huwelijk',kort:'Huwelijk',sub:'Een vrijblijvend gesprek over jullie trouwbloemen',prijs:0,eenheid:'gratis',vanaf:false,foto:'img/b_trouw.webp',type:'afspraak',kleur:'#C2456B',zacht:'#FBE3EA',trouw:true,
  uitleg:'We bespreken jullie stijl, kleuren en wensen. Verse bloemen vanaf € 700, droog- en zijden bloemen vanaf € 300.'}
];
var S=[
 {id:'w1',act:'winter',datum:'2026-11-28',uur:'14:00',plaatsen:10},
 {id:'w2',act:'winter',datum:'2026-11-29',uur:'10:00',plaatsen:10},
 {id:'w3',act:'winter',datum:'2026-12-05',uur:'14:00',plaatsen:10},
 {id:'w4',act:'winter',datum:'2026-12-06',uur:'10:00',plaatsen:10},
 {id:'p1',act:'papier',datum:'2027-01-10',uur:'14:00',plaatsen:8},
 {id:'p2',act:'papier',datum:'2027-01-24',uur:'14:00',plaatsen:8},
 {id:'p3',act:'papier',datum:'2027-02-07',uur:'10:00',plaatsen:8},
 {id:'k1',act:'kamp',datum:'2026-12-21',tot:'2026-12-23',uur:'09:00',plaatsen:16},
 {id:'j1',act:'jeugd',datum:'2026-12-28',tot:'2026-12-30',uur:'10:00',plaatsen:10}
];
function b(id,act,sessie,datum,dagdeel,aantal,naam,mail,gsm,status,op,extra){return Object.assign({id:id,act:act,sessie:sessie,datum:datum,dagdeel:dagdeel,aantal:aantal,naam:naam,mail:mail,gsm:gsm,status:status,op:op,opm:''},extra||{});}
var SEED=[
 b('H-1041','winter','w1','2026-11-28','',4,'Lotte Vermeulen','lotte.vermeulen@voorbeeld.be','0471 23 45 67','betaald','2026-11-09T10:12:00'),
 b('H-1042','winter','w1','2026-11-28','',3,'Sofie Janssens','sofie.j@voorbeeld.be','0485 11 22 33','bevestigd','2026-11-11T20:40:00'),
 b('H-1043','winter','w2','2026-11-29','',2,'Ellen Claes','ellen.claes@voorbeeld.be','0499 87 65 43','betaald','2026-11-12T08:05:00'),
 b('H-1044','ws','','2026-11-29','Namiddag',6,'Hanne Peeters','hanne.peeters@voorbeeld.be','0476 55 44 33','bevestigd','2026-11-14T13:22:00',{opm:'Vrijgezellen van Marie, graag een glaasje bubbels.',gelegenheid:'Vrijgezellen'}),
 b('H-1045','kamp','k1','2026-12-21','',1,'Joke Willems','joke.willems@voorbeeld.be','0472 98 76 54','betaald','2026-11-15T19:01:00',{kinderen:'Fien (9)'}),
 b('H-1046','kamp','k1','2026-12-21','',2,'Bart Maes','bart.maes@voorbeeld.be','0486 12 12 12','betaald','2026-11-16T07:48:00',{kinderen:'Lina (11), Mats (8)'}),
 b('H-1047','winter','w3','2026-12-05','',5,'Team Kinesist Heverlee','info@voorbeeld.be','016 12 34 56','bevestigd','2026-11-17T11:30:00',{gelegenheid:'Teambuilding'}),
 b('H-1048','trouw','','2026-12-04','Avond',2,'Nina en Robbe','nina.robbe@voorbeeld.be','0494 33 22 11','nieuw','2026-11-18T21:15:00',{trouwdatum:'2027-06-12',stijl:'Vers, kleurrijk',opm:'Trouwen in de Abdij van Park.'}),
 b('H-1049','kamp','k1','2026-12-21','',1,'An Wouters','an.wouters@voorbeeld.be','0478 45 45 45','bevestigd','2026-11-19T09:10:00',{kinderen:'Lou (12)'}),
 b('H-1050','jeugd','j1','2026-12-28','',2,'Kristof Jacobs','k.jacobs@voorbeeld.be','0473 67 67 67','betaald','2026-11-19T17:44:00',{kinderen:'Noor (13), Jade (13)'}),
 b('H-1051','winter','w4','2026-12-06','',2,'Marijke De Smet','marijke.ds@voorbeeld.be','0487 21 21 21','nieuw','2026-11-21T14:02:00'),
 b('H-1052','papier','p1','2027-01-10','',3,'Femke Goossens','femke.g@voorbeeld.be','0495 10 20 30','bevestigd','2026-11-21T22:31:00'),
 b('H-1053','ws','','2026-12-12','Avond',4,'Laura Hermans','laura.hermans@voorbeeld.be','0479 80 90 10','nieuw','2026-11-22T10:55:00',{gelegenheid:'Verjaardag',opm:'Kan het met droogbloemen?'}),
 b('H-1054','winter','w2','2026-11-29','',4,'Eva Michiels','eva.michiels@voorbeeld.be','0474 44 55 66','nieuw','2026-11-23T08:20:00'),
 b('H-1055','kamp','k1','2026-12-21','',1,'Tom Dubois','tom.dubois@voorbeeld.be','0489 66 77 88','nieuw','2026-11-23T11:47:00',{kinderen:'Elise (10)'})
];
var KB='hoy-demo-boekingen',KS='hoy-demo-sessies',KST='hoy-demo-status';
function lees(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v||d;}catch(e){return d;}}
function schrijf(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
var H={
 act:A,
 sessies:function(){return S.concat(lees(KS,[])).sort(function(a,b){return (a.datum+a.uur).localeCompare(b.datum+b.uur);});},
 boekingen:function(){var st=lees(KST,{});return SEED.concat(lees(KB,[])).map(function(x){var y=Object.assign({},x);if(st[x.id])y.status=st[x.id];return y;});},
 actVan:function(id){for(var i=0;i<A.length;i++)if(A[i].id===id)return A[i];},
 sessie:function(id){var s=H.sessies();for(var i=0;i<s.length;i++)if(s[i].id===id)return s[i];},
 bezet:function(sid){return H.boekingen().filter(function(x){return x.sessie===sid&&x.status!=='geannuleerd';}).reduce(function(t,x){return t+(+x.aantal||0);},0);},
 vrij:function(s){return Math.max(0,s.plaatsen-H.bezet(s.id));},
 boek:function(o){var l=lees(KB,[]);var n=1056+H.boekingen().length-SEED.length;o.id='H-'+n;o.op=new Date().toISOString();o.status='nieuw';l.push(o);schrijf(KB,l);return o;},
 zetStatus:function(id,s){var st=lees(KST,{});st[id]=s;schrijf(KST,st);},
 nieuweSessie:function(o){var l=lees(KS,[]);o.id='x'+Date.now().toString(36);l.push(o);schrijf(KS,l);return o;},
 wisSessie:function(id){schrijf(KS,lees(KS,[]).filter(function(s){return s.id!==id;}));},
 eigenSessie:function(id){return lees(KS,[]).some(function(s){return s.id===id;});},
 reset:function(){[KB,KS,KST].forEach(function(k){try{localStorage.removeItem(k);}catch(e){}});},
 bedrag:function(x){var a=H.actVan(x.act);return a?a.prijs*(+x.aantal||0):0;},
 datumLang:function(d){var t=new Date(d+'T12:00:00');return t.toLocaleDateString('nl-BE',{weekday:'long',day:'numeric',month:'long'});},
 datumKort:function(d){var t=new Date(d+'T12:00:00');return t.toLocaleDateString('nl-BE',{weekday:'short',day:'numeric',month:'short'});},
 euro:function(n){return '€ '+(Math.round(n*100)/100).toLocaleString('nl-BE',{minimumFractionDigits:n%1?2:0});}
};
window.HOY=H;
})();
