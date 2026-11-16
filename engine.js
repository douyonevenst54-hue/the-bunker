/* THE BUNKER — shared room engine.
   Each room page defines window.ROOM = { n, emoji, ui:{en,ht}, items, stages, check, sources }
   then loads this file. Add #review to the URL to see every answer (for expert review). */
(function(){
const R=window.ROOM;
let L='en';
try{const s=localStorage.getItem('bunkerLang');if(s)L=s}catch(e){}

const COMMON={
 en:{start:"Start mission",next:"Next",use:"Use",skip:"Not needed",avoid:"Avoid",right:"Correct",wrong:"Not quite",of:"of",
  results:"Bunker readiness",readyHigh:"Room ready",readyMid:"Almost ready",readyLow:"Needs more training",
  checklist:"Your real-life checklist",checkSub:"Take this lesson home. Check off what you already have.",
  copy:"Copy checklist",copied:"Copied ✓",again:"Play again",sources:"Facts checked against:",
  s1:"Stage 1 · Identify",s1t:"Use it, skip it, or avoid it?",review:"Expert review: all answers",play:"Play the room",
  proto:"Prototype · Room {n} of 12 · For education, not professional certification. In an emergency, follow your local health officials.<br>Built by Dr. Jhon Evenst Douyon, MD, MPH"},
 ht:{start:"Kòmanse misyon an",next:"Kontinye",use:"Sèvi ak li",skip:"Pa nesesè",avoid:"Evite l",right:"Bon repons",wrong:"Pa tout bon",of:"sou",
  results:"Preparasyon bunker la",readyHigh:"Chanm nan pare",readyMid:"Prèske pare",readyLow:"Bezwen plis fòmasyon",
  checklist:"Lis pou lavi reyèl ou",checkSub:"Pote leson sa a lakay ou. Tcheke sa ou genyen deja.",
  copy:"Kopye lis la",copied:"Kopye ✓",again:"Jwe ankò",sources:"Enfòmasyon yo verifye ak:",
  s1:"Etap 1 · Idantifye",s1t:"Sèvi ak li, kite l, oswa evite l?",review:"Revizyon ekspè: tout repons yo",play:"Jwe chanm nan",
  proto:"Pwototip · Chanm {n} sou 12 · Pou edikasyon, se pa yon sètifika pwofesyonèl. Nan ijans, swiv sa otorite sante lokal yo di.<br>Kreye pa Dr. Jhon Evenst Douyon, MD, MPH"}
};
const t=k=>{const v=(R.ui[L]&&R.ui[L][k]!==undefined)?R.ui[L][k]:COMMON[L][k];return typeof v==='string'?v.replace('{n}',R.n):v};

const app=document.getElementById('app');
const ORDER=["intro","sort",...R.stages.map(s=>s.key),"results"];
const fresh=()=>({screen:"intro",i:0,picked:null,sc:Object.fromEntries([["sort",0],...R.stages.map(s=>[s.key,0])])});
let st=fresh();

function setLang(l){L=l;try{localStorage.setItem('bunkerLang',l)}catch(e){}
 document.documentElement.lang=l==='ht'?'ht':'en';
 document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.l===l));render()}
document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>setLang(b.dataset.l));
window.addEventListener('hashchange',render);

function prog(){const el=document.getElementById('prog');
 if(location.hash==='#review'){el.innerHTML='';return}
 const n=ORDER.indexOf(st.screen);
 el.innerHTML=ORDER.slice(1).map((s,k)=>`<div class="${k+1<n?'done':k+1===n?'now':''}"></div>`).join('')}

function render(){prog();
 if(location.hash==='#review')return review();
 const s=st.screen;
 if(s==="intro")return intro();
 if(s==="sort")return sort();
 if(s==="results")return results();
 return quiz(R.stages.find(x=>x.key===s));}

function intro(){app.innerHTML=`<div class="card">
  <div class="stage">${t('room')}</div><div class="hero">${R.emoji}</div>
  <h1>${t('title')}</h1><p>${t('intro1')}</p><p>${t('intro2')}</p>
  <button class="btn" id="go">${t('start')}</button></div>
  <p class="note">${t('proto')}</p>`;
 document.getElementById('go').onclick=()=>{st.screen="sort";st.i=0;st.picked=null;render()}}

function fbHTML(ok,x){return `<div class="fb ${ok?'':'no'}"><strong>${ok?'✅ '+t('right'):'❌ '+t('wrong')}</strong><p>${x}</p></div>`}
const BINS=()=>[["u","✅",t('use')],["s","➖",t('skip')],["a","⚠️",t('avoid')]];

function sort(){const it=R.items[st.i],d=it[L],p=st.picked;
 app.innerHTML=`<div class="card"><div class="stage">${t('s1')}</div><h2>${t('s1t')}</h2>
  <div class="count">${st.i+1} ${t('of')} ${R.items.length}</div>
  <div class="item"><div class="em">${it.e}</div><div class="nm">${d[0]}</div></div>
  <div class="bins">${BINS().map(([k,ic,lb])=>`<button class="bin ${p?(k===it.b?'right':k===p?'wrong':''):''}" data-k="${k}" ${p?'disabled':''}><b>${ic}</b>${lb}</button>`).join('')}</div>
  ${p?fbHTML(p===it.b,d[1])+`<button class="btn" id="nx">${t('next')}</button>`:''}</div>`;
 if(!p)app.querySelectorAll('.bin').forEach(b=>b.onclick=()=>{st.picked=b.dataset.k;if(st.picked===it.b)st.sc.sort++;render()});
 else document.getElementById('nx').onclick=()=>{st.picked=null;if(++st.i>=R.items.length){st.screen=R.stages[0].key;st.i=0}render();window.scrollTo(0,0)}}

function quiz(S){const q=S.qs[st.i],d=q[L],p=st.picked;
 const scene=(S.scene&&st.i===0)?`<div class="scene"><div class="tag">${S.scene[L]}</div></div>`:'';
 app.innerHTML=`<div class="card"><div class="stage">${S.label[L]}</div>${scene}
  <div class="count">${st.i+1} ${t('of')} ${S.qs.length}</div><h2>${d.q}</h2>
  <div class="opts">${d.o.map((o,k)=>`<button class="opt ${p!==null?(k===q.a?'right':k===p?'wrong':''):''}" data-k="${k}" ${p!==null?'disabled':''}>${o}</button>`).join('')}</div>
  ${p!==null?fbHTML(p===q.a,d.x)+`<button class="btn" id="nx">${t('next')}</button>`:''}</div>`;
 if(p===null)app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{st.picked=+b.dataset.k;if(st.picked===q.a)st.sc[S.key]++;render()});
 else document.getElementById('nx').onclick=()=>{st.picked=null;
  if(++st.i>=S.qs.length){const n=ORDER.indexOf(S.key);st.screen=ORDER[n+1];st.i=0}
  render();window.scrollTo(0,0)}}

function srcHTML(){return `<div class="src">${t('sources')}<br>${R.sources.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join('<br>')}</div>`}

function results(){
 const cats=[[t('catSort'),st.sc.sort,R.items.length,R.sortWeight||.3],...R.stages.map(S=>[S.cat[L],st.sc[S.key],S.qs.length,S.w])];
 const total=Math.round(cats.reduce((a,[,s,n,w])=>a+s/n*w*100,0));
 const col=v=>v>=80?'var(--good)':v>=60?'var(--mid)':'var(--bad)';
 const lab=total>=80?t('readyHigh'):total>=60?t('readyMid'):t('readyLow');
 app.innerHTML=`<div class="card"><div class="stage">${t('results')}</div>
  <div class="score"><div class="big" style="color:${col(total)}">${total}<small>/100</small></div>
  <span class="badge" style="background:${col(total)};color:#111">${total>=80?'🏅 ':''}${lab}</span></div>
  ${cats.map(([k,s,n])=>{const v=Math.round(s/n*100);return `<div class="bar"><div class="row"><span>${k}</span><span>${s}/${n}</span></div><div class="track"><div class="fill" style="width:0;background:${col(v)}" data-w="${v}"></div></div></div>`}).join('')}
  </div>
  <div class="card" style="margin-top:14px"><h2>📋 ${t('checklist')}</h2><p>${t('checkSub')}</p>
  <ul class="check">${R.check[L].map(x=>`<li>${x}</li>`).join('')}</ul>
  <button class="btn ghost" id="cp">${t('copy')}</button>
  ${R.next?`<a class="btn" style="text-align:center;text-decoration:none" href="${R.next.href}">${R.next[L]} →</a>`:''}
  <button class="btn ${R.next?'ghost':''}" id="ag">${t('again')}</button>${srcHTML()}</div>
  <p class="note">${t('proto')}</p>`;
 requestAnimationFrame(()=>setTimeout(()=>app.querySelectorAll('.fill').forEach(f=>f.style.width=f.dataset.w+'%'),50));
 document.getElementById('cp').onclick=async e=>{const txt=`THE BUNKER — ${t('checklist')}\n`+R.check[L].map(x=>'☐ '+x).join('\n');
  try{await navigator.clipboard.writeText(txt);e.target.textContent=t('copied')}catch(err){e.target.textContent='—'}};
 document.getElementById('ag').onclick=()=>{st=fresh();render();window.scrollTo(0,0)}}

function review(){
 const bin=k=>Object.fromEntries(BINS().map(([a,ic,lb])=>[a,ic+' '+lb]))[k];
 const qBlock=(d,a)=>`<div class="review-q"><div class="qq">${d.q}</div>${d.o.map((o,k)=>k===a?`<div class="ok">✅ ${o}</div>`:`<div class="bad">✗ ${o}</div>`).join('')}<div class="ex">${d.x}</div></div>`;
 app.innerHTML=`<div class="card"><div class="stage">${t('room')}</div><h2>${t('review')}</h2>
  <div class="review-sec"><div class="stage">${t('s1')}</div>
  ${R.items.map(it=>`<div class="review-q"><div class="qq">${it.e} ${it[L][0]}</div><div class="ok">${bin(it.b)}</div><div class="ex">${it[L][1]}</div></div>`).join('')}</div>
  ${R.stages.map(S=>`<div class="review-sec"><div class="stage">${S.label[L]}</div>${S.scene?`<p>${S.scene[L]}</p>`:''}${S.qs.map(q=>qBlock(q[L],q.a)).join('')}</div>`).join('')}
  <div class="review-sec"><h2>📋 ${t('checklist')}</h2><ul class="check">${R.check[L].map(x=>`<li>${x}</li>`).join('')}</ul></div>
  ${srcHTML()}<a class="navlink" href="#">${t('play')} →</a></div>`;
 window.scrollTo(0,0)}

setLang(L);
})();
