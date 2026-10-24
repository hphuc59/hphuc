const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=document.body.dataset,m=MOVIES.find(x=>x.id===B.id),cur=(+((location.pathname.match(/tap-(\d+)/)||[])[1]||B.ep)||1)-1; /* số tập lấy từ địa chỉ tap-N, không phụ thuộc data-ep */

/* Quay lại danh sách đúng trang và bộ lọc đang xem */
$('back').onclick=e=>{try{const u=sessionStorage.getItem('phim.list');if(u){e.preventDefault();location.href=u}}catch(x){}};

/* Link nhúng của tập: lấy từ link/<mã phim>.js
   - một server: 'link'  hoặc {name,url}
   - nhiều server: ['link1','link2']  hoặc [{name:'Vietsub',url:'..'},{name:'Thuyết minh',url:'..'}]
                   hoặc {name:'Tên tập',servers:[...]} */
function serversOf(i){
  let l=(LINKS[B.id]||[])[i];if(l==null)l=m.eps[i]?.url;
  const a=Array.isArray(l)?l:(l&&l.servers)?l.servers:[l];
  return a.map((s,k)=>typeof s==='string'?{name:'Server '+(k+1),url:s}:{name:(s&&s.name)||'Server '+(k+1),url:(s&&(s.url||''))||''}).filter(s=>s.url);
}
function nameOf(i){const l=(LINKS[B.id]||[])[i];return(l&&l.name)||m.eps[i].name}
function embed(u){
  if(!u||/^\s*javascript:/i.test(u))return'<p>Tập này chưa có link phim.<br>Dán link vào <code>link/'+esc(B.id)+'.js</code>.</p>';
  if(/\.(mp4|webm|ogg)(\?|#|$)/i.test(u))return'<video src="'+esc(u)+'" controls playsinline></video>';
  return'<iframe src="'+esc(u)+'" title="'+esc(m.title)+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="no-referrer"></iframe>';
}
if(!m||!m.eps[cur]){$('nf').hidden=false}
else{
  const n=m.eps.length,d=new Set(getW(m.id));
  d.add(cur);setW(m.id,[...d].sort((a,b)=>a-b)); setL(m.id,cur); /* mở trang tập nào là tập đó được đánh dấu ✓ */
  $('main').hidden=false;
  $('t').textContent=m.title;
  if(m.orig){$('t').insertAdjacentHTML('afterend','<p class="worig">'+esc(m.orig)+'</p>')} /* tên gốc nằm dưới tên Việt hoá */
  $('i').textContent=[m.year,m.country,(m.genres||[]).join(', '),n>1?nameOf(cur):'',m.note].filter(Boolean).join(' · ');
  const sv=serversOf(cur);let pick=0;
  try{pick=Math.min(+sessionStorage.getItem('phim.server')||0,Math.max(0,sv.length-1))}catch(x){}
  const show=k=>{
    $('player').innerHTML=embed(sv[k]?sv[k].url:'');
    [...$('sv').children].forEach((b,j)=>b.classList.toggle('cur',j===k));
    try{sessionStorage.setItem('phim.server',k)}catch(x){}
  };
  if(sv.length>1){
    $('sv').innerHTML=sv.map((x,k)=>'<button type="button" class="ep">'+esc(x.name)+'</button>').join('');
    $('sv').hidden=false;
    $('sv').onclick=e=>{const b=e.target.closest('button');if(b)show([...$('sv').children].indexOf(b))};
  }
  show(pick);
  if(n>1){
    $('eps').innerHTML=m.eps.map((x,i)=>'<a class="ep'+(i===cur?' cur':'')+(d.has(i)?' done':'')+'" href="../tap-'+(i+1)+'/xem-phim.html"'+(i===cur?' aria-current="page"':'')+'>'+esc(nameOf(i))+'</a>').join('');
    if(cur<n-1){$('next').href='../tap-'+(cur+2)+'/xem-phim.html';$('next').hidden=false}
  }else $('acts').hidden=true;
}
