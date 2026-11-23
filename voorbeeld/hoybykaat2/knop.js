/* Bloemknoppen: elke knop krijgt een bloempje dat openbloeit, en bij een klik vallen er blaadjes */
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var PIJL='M5 12h14M13 6l6 6-6 6';
var BLAD='<path d="M12 12C8.4 10 8 4.4 12 2.4c4 2 3.6 7.6 0 9.6Z"/>';
var BLOEM=(function(){
  var s='<svg viewBox="0 0 24 24" aria-hidden="true"><g class="bb">';
  for(var i=0;i<5;i++) s+='<g class="bl" style="--a:'+(i*72)+'deg;--d:'+(i*40)+'ms">'+BLAD+'</g>';
  return s+'</g><circle class="hz" cx="12" cy="12" r="2.4"/></svg>';
})();

function versier(b){
  if(b.__bk) return; b.__bk=1;
  b.querySelectorAll('svg').forEach(function(s){var p=s.querySelector('path');if(p&&p.getAttribute('d')===PIJL)s.remove();});
  var bg=b.style.background||b.style.backgroundColor;
  if(bg){b.style.setProperty('--kl',bg);b.style.background='';}
  rand(b);
  if(b.classList.contains('zonder')) return;
  var k=document.createElement('span');k.className='bk';k.innerHTML=BLOEM;
  b.insertBefore(k,b.firstChild);
  b.addEventListener('mouseenter',function(){if(!RM)zweef(b);});
}
/* golvende bloemrand rond de knop */
var NS='http://www.w3.org/2000/svg',A=4;
function vorm(w,h,fase){
  var r=h/2,L=Math.max(w-h,0),P=2*L+Math.PI*h,n=Math.max(8,Math.round(P/21)),st=P/360,d='';
  for(var i=0;i<=360;i++){
    var t=i*st,x,y,nx,ny;
    if(t<L){x=r+t;y=0;nx=0;ny=-1;}
    else if(t<L+Math.PI*r){var g=(t-L)/r-Math.PI/2;x=r+L+Math.cos(g)*r;y=r+Math.sin(g)*r;nx=Math.cos(g);ny=Math.sin(g);}
    else if(t<2*L+Math.PI*r){x=r+L-(t-L-Math.PI*r);y=h;nx=0;ny=1;}
    else{var g2=(t-2*L-Math.PI*r)/r+Math.PI/2;x=r+Math.cos(g2)*r;y=r+Math.sin(g2)*r;nx=Math.cos(g2);ny=Math.sin(g2);}
    var o=A*(Math.pow(Math.abs(Math.sin(Math.PI*n*t/P+fase)),.5)-.5);
    d+=(i?'L':'M')+(x+nx*o+A).toFixed(1)+' '+(y+ny*o+A).toFixed(1);
  }
  return d+'Z';
}
function rand(b){
  b.classList.add('rand');
  var sv=document.createElementNS(NS,'svg');sv.setAttribute('class','rnd');sv.setAttribute('aria-hidden','true');
  var pa=document.createElementNS(NS,'path');sv.appendChild(pa);b.insertBefore(sv,b.firstChild);
  var w=0,h=0,fase=0,loopt=false;
  function teken(){if(!w)return;sv.setAttribute('viewBox','0 0 '+(w+2*A)+' '+(h+2*A));pa.setAttribute('d',vorm(w,h,fase));}
  function meet(){w=b.offsetWidth;h=b.offsetHeight;teken();}
  if('ResizeObserver' in window) new ResizeObserver(meet).observe(b); else meet();
  meet();
  if(RM) return;
  /* bij hover golft de rand zacht mee, als blaadjes die bewegen */
  function stap(){fase+=.045;teken();if(loopt)requestAnimationFrame(stap);}
  b.addEventListener('mouseenter',function(){if(!loopt){loopt=true;requestAnimationFrame(stap);}});
  b.addEventListener('mouseleave',function(){loopt=false;});
}
function alles(r){(r||document).querySelectorAll('.btn').forEach(versier);}
alles();
/* op een gsm (geen hover) bloeien de knoppen open zodra ze in beeld komen */
if(!matchMedia('(hover:hover)').matches&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var b=e.target;setTimeout(function(){b.classList.add('open');},250);io.unobserve(b);}});},{threshold:.9});
  var kijk=function(r){(r||document).querySelectorAll('.btn').forEach(function(b){if(!b.__io){b.__io=1;io.observe(b);}});};
  kijk();setInterval(kijk,1500);
}
new MutationObserver(function(m){m.forEach(function(x){x.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.classList&&n.classList.contains('btn'))versier(n);alles(n);});});}).observe(document.body,{childList:true,subtree:true});

var KL=['#F4A6B7','#FBD9DF','#FFC23D','#F26A2E','#C9B6F0','#fff'];
function blaadje(x,y,kleur,maat){
  var e=document.createElement('i');e.className='vlieg';
  e.style.cssText='left:'+x+'px;top:'+y+'px;width:'+maat+'px;height:'+(maat*1.35)+'px;background:'+kleur;
  document.body.appendChild(e);return e;
}
/* een paar blaadjes die bij het hoveren loskomen */
function zweef(b){
  var r=(b.querySelector('.bk')||b).getBoundingClientRect();
  for(var i=0;i<3;i++){(function(i){
    var e=blaadje(r.left+r.width/2,r.top+r.height/2,KL[(Math.random()*4)|0],6+Math.random()*3);
    var dx=(Math.random()-.5)*50,dy=-(26+Math.random()*30),rot=(Math.random()-.5)*260;
    e.animate([{transform:'translate(-50%,-50%) rotate(0) scale(.4)',opacity:0},{opacity:1,offset:.2},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) rotate('+rot+'deg) scale(1)',opacity:0}],{duration:1100+i*180,delay:i*90,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'}).onfinish=function(){e.remove();};
  })(i);}
}
/* bij een klik: een handvol blaadjes */
document.addEventListener('pointerdown',function(ev){
  var b=ev.target.closest&&ev.target.closest('.btn');
  if(!b||RM||b.disabled) return;
  var x=ev.clientX,y=ev.clientY;
  for(var i=0;i<12;i++){
    var e=blaadje(x,y,KL[i%KL.length],7+Math.random()*5);
    var h=(i/12)*Math.PI*2+Math.random()*.5,v=50+Math.random()*60;
    var dx=Math.cos(h)*v,dy=Math.sin(h)*v-20;
    e.animate([{transform:'translate(-50%,-50%) rotate(0) scale(.3)',opacity:1},{transform:'translate(calc(-50% + '+dx*.7+'px),calc(-50% + '+dy*.7+'px)) rotate('+(h*90)+'deg) scale(1)',opacity:1,offset:.45},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+(dy+70)+'px)) rotate('+(h*200)+'deg) scale(.8)',opacity:0}],{duration:1100+Math.random()*500,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}).onfinish=(function(e){return function(){e.remove();};})(e);
  }
},{passive:true});
})();
