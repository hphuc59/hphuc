/* =========================================================================
   Trang chủ (trang-chu/<số trang>.html): tìm kiếm, bộ lọc, phân trang, thẻ phim.
   Dữ liệu phim lấy từ assets/data.js (poster là tham số cuối của dòng phim).
   ========================================================================= */

const P=+document.body.dataset.page||1;
const url=n=>n+'.html';
const F={type:'',genre:new Set(),country:new Set(),year:new Set()};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();

function match(m,skip){
  const q=norm($('q').value.trim());
  if(q&&!norm([m.title,m.note,m.country,m.year,(m.genres||[]).join(' ')].join(' ')).includes(q))return false;
  if(skip!=='type'&&F.type&&m.type!==F.type)return false;
  if(skip!=='genre'&&F.genre.size&&!(m.genres||[]).some(g=>F.genre.has(g)))return false;
  if(skip!=='country'&&F.country.size&&!F.country.has(m.country))return false;
  if(skip!=='year'&&F.year.size&&!F.year.has(String(m.year)))return false;
  return true;
}
function counts(key){
  const c={};
  MOVIES.filter(m=>match(m,key)).forEach(m=>{
    (key==='genre'?(m.genres||[]):[m[key]]).forEach(x=>{if(x!==''&&x!=null)c[x]=(c[x]||0)+1});
  });
  return c;
}
function multi(el,key,allLabel,sortFn){
  const c=counts(key),S=F[key];
  const keys=[...new Set([...Object.keys(c),...S])].sort(sortFn);
  $(el).innerHTML='<button class="nav one'+(S.size?'':' on')+'" data-k="'+key+'" data-v=""><span>'+allLabel+'</span><small>'+MOVIES.filter(m=>match(m,key)).length+'</small></button>'+
   keys.map(v=>'<button class="nav'+(S.has(String(v))?' on':'')+'" data-k="'+key+'" data-v="'+esc(v)+'"><i class="box">'+(S.has(String(v))?'✓':'')+'</i><span>'+esc(v)+'</span><small>'+(c[v]||0)+'</small></button>').join('');
}
function render(){
  const tc=counts('type');
  $('g-type').innerHTML=[['','Tất cả',MOVIES.filter(m=>match(m,'type')).length],['Movie','Movie',tc.Movie||0],['TV Series','TV Series',tc['TV Series']||0]]
   .map(([v,l,n])=>'<button class="nav one'+(F.type===v?' on':'')+'" data-k="type" data-v="'+v+'"><span>'+l+'</span><small>'+n+'</small></button>').join('');
  multi('g-genre','genre','Tất cả thể loại',(a,b)=>a.localeCompare(b,'vi'));
  multi('g-country','country','Tất cả quốc gia',(a,b)=>a.localeCompare(b,'vi'));
  multi('g-year','year','Tất cả năm',(a,b)=>b-a);
  pager(Math.max(1,Math.ceil(MOVIES.filter(m=>match(m)).length/PER)));
  save();
  $('clear').hidden=!(F.type||F.genre.size||F.country.size||F.year.size);
  const list=MOVIES.filter(m=>match(m)),N=Math.max(1,Math.ceil(list.length/PER));
  if(P>N){location.replace(url(N)+location.hash);return}
  $('info').textContent=list.length+' / '+MOVIES.length+' phim'+(N>1?' · Trang '+P+'/'+N:'');
  $('grid').innerHTML=list.length?list.slice((P-1)*PER,P*PER).map(card).join(''):'<div class="empty">Không có phim nào khớp bộ lọc.</div>';
}
function hs(extra){const u=new URLSearchParams();if($('q').value)u.set('q',$('q').value);if(F.type)u.set('type',F.type);
  ['genre','country','year'].forEach(k=>F[k].size&&u.set(k,[...F[k]].join('|')));if(extra)u.set(extra,1);return u.toString()?'#'+u:''}
function pager(N){
  if(N<2){$('pager').innerHTML='';return}
  const pg=[...new Set([1,N,P-1,P,P+1].filter(x=>x>=1&&x<=N))].sort((a,b)=>a-b),h=hs();
  const nb=(n,t,l,off)=>off?'<span class="dis" aria-label="'+l+'">'+t+'</span>':'<a href="'+url(n)+h+'" aria-label="'+l+'">'+t+'</a>';
  let o=nb(P-1,'‹','Trang trước',P<2),last=0;
  pg.forEach(x=>{if(x-last>1)o+='<i>…</i>';o+='<a href="'+url(x)+h+'"'+(x===P?' class="on" aria-current="page"':'')+'>'+x+'</a>';last=x});
  $('pager').innerHTML=o+nb(P+1,'›','Trang sau',P>=N);
}
function save(){try{history.replaceState(null,'',location.pathname+location.search+hs())}catch(e){}
  try{sessionStorage.setItem('phim.list',location.href)}catch(e){}}
function load(){try{const u=new URLSearchParams(location.hash.slice(1));$('q').value=u.get('q')||'';F.type=u.get('type')||'';
  ['genre','country','year'].forEach(k=>(u.get(k)||'').split('|').filter(Boolean).forEach(v=>F[k].add(v)));
  document.querySelectorAll('.grp').forEach(g=>{const k=g.querySelector('[data-k]')?.dataset.k;if(k&&(k==='type'?F.type:F[k]?.size))g.classList.remove('shut')});
  if(u.get('s')){$('q').focus();const l=$('q').value.length;$('q').setSelectionRange(l,l)}}catch(e){}}
function card(m){
  const d=getW(m.id),k=Math.min(Math.max(0,getL(m.id)),m.eps.length-1),h='../phim/'+m.id+(m.eps.length<2?'':'/tap-'+(k+1))+'/xem-phim.html';
  return '<div class="card"><a class="poster" href="'+h+'" aria-label="'+esc(m.title)+'"><span class="tag">'+esc(m.type)+'</span>'+
   esc((m.title||'?').trim().charAt(0).toUpperCase())+
   (m.poster?'<img src="'+esc(m.poster)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'</a>'+
   '<div class="meta"><h4>'+esc(m.title)+'</h4><p>'+[m.year,m.country].filter(Boolean).map(esc).join(' · ')+'</p>'+
   '<p>'+esc((m.genres||[]).join(', '))+'</p>'+(m.note?'<p>'+esc(m.note)+'</p>':'')+
   (d.length?'<p class="seen">Đã xem '+d.length+'/'+m.eps.length+'</p>':'')+'</div></div>';
}
const go=extra=>P===1?render():location.href=url(1)+hs(extra);
document.addEventListener('click',e=>{
  const g=e.target.closest('.gt');
  if(g){const o=g.closest('.grp').classList.toggle('shut');g.setAttribute('aria-expanded',!o);return}
  const n=e.target.closest('.nav');if(!n)return;
  const k=n.dataset.k,v=n.dataset.v;
  if(k==='type')F.type=F.type===v?'':v;
  else if(v==='')F[k].clear();
  else F[k].has(v)?F[k].delete(v):F[k].add(v);
  go();
});
$('clear').onclick=()=>{F.type='';F.genre.clear();F.country.clear();F.year.clear();go()};
$('q').addEventListener('input',()=>go('s'));
const mob=()=>matchMedia('(max-width:760px)').matches, app=document.querySelector('.app');
$('menu').onclick=()=>mob()?$('side').classList.toggle('open'):app.classList.toggle('collapsed');
$('close').onclick=()=>mob()?$('side').classList.remove('open'):app.classList.add('collapsed');
document.querySelector('main').addEventListener('click',e=>{if(!e.target.closest('#menu'))$('side').classList.remove('open')});
load();render();
