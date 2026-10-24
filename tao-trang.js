/* Dùng: node tao-trang.js   (chạy lại mỗi khi thêm/sửa phim trong thư mục kho/)
   - Đọc phim từ kho/1.js, kho/2.js, ... (mỗi file tối đa 50 phim, vượt là báo lỗi)
   - Tạo các trang chủ trang-chu/1.html, 2.html, ... theo số phim
   - Tạo mỗi tập phim thành một trang html: phim/<mã phim>/tap-<số tập>/xem-phim.html
     (phim chỉ có 1 tập thì là phim/<mã phim>/xem-phim.html)
   - Tạo file link nhúng còn thiếu: link/<mã phim>.js  (file đã có thì KHÔNG bị ghi đè) */
const fs=require('fs'),path=require('path');
const GIOI_HAN=50; /* số phim tối đa mỗi file trong kho/ */
const khoDir=path.join(__dirname,'kho');fs.mkdirSync(khoDir,{recursive:true});
const khoFiles=fs.readdirSync(khoDir).filter(f=>/^\d+\.js$/.test(f)).sort((a,b)=>parseInt(a)-parseInt(b));
if(!khoFiles.length){console.error('Chưa có file nào trong thư mục kho/ (hãy tạo kho/1.js).');process.exit(1)}
const code=fs.readFileSync(path.join(__dirname,'assets/data.js'),'utf8');
const vm=require('vm'),khoSrc=khoFiles.map(f=>fs.readFileSync(path.join(khoDir,f),'utf8'));
let loiCuPhap=false; /* báo lỗi cú pháp dễ hiểu: file nào, dòng mấy */
khoFiles.forEach((f,i)=>{try{new vm.Script(khoSrc[i],{filename:'kho/'+f})}catch(e){
  const mm=/:(\d+)/.exec(e.stack||''),n=mm?+mm[1]:0,l=(khoSrc[i].split('\n')[n-1]||'').trim();
  console.error(`\nLỖI trong kho/${f}${n?' (dòng '+n+')':''}: ${e.message}`+(l?`\n   ${l.length>110?l.slice(0,110)+'...':l}`:'')+
    '\n   Gợi ý: mỗi dòng M(...) phải kết thúc bằng dấu phẩy (,) — thiếu dấu phẩy ở cuối dòng này hoặc dòng trước nó là lỗi hay gặp nhất. Tên phim có dấu nháy \' (vd Isn\'t) thì phải bao bằng dấu nháy kép "...". Nhiều tên gốc: ["Tên 1","Tên 2"].');loiCuPhap=true}});
if(loiCuPhap)process.exit(1);
let R;
try{R=new Function('localStorage','files',code+'\nconst counts=[];for(const f of files){const b=MOVIES.length;eval(f);counts.push(MOVIES.length-b)}\nreturn{MOVIES,counts,PER}')(
  {getItem(){return null},setItem(){}},khoSrc)}catch(e){console.error('LỖI khi đọc thư mục kho/: '+e.message);process.exit(1)}
const MOVIES=R.MOVIES;
let loi=false;
khoFiles.forEach((f,i)=>{if(R.counts[i]>GIOI_HAN){console.error(`kho/${f} có ${R.counts[i]} phim, vượt giới hạn ${GIOI_HAN}. Hãy chuyển bớt sang file kho mới.`);loi=true}});
const seen=new Set();MOVIES.forEach(m=>{if(seen.has(m.id)){console.error('Trùng mã phim (tên phim giống nhau): '+m.id);loi=true}seen.add(m.id)});
if(loi)process.exit(1);
const tpl=fs.readFileSync(path.join(__dirname,'phim/mau.html'),'utf8');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
fs.mkdirSync(path.join(__dirname,'link'),{recursive:true});
let pages=0,links=0;
for(const m of MOVIES){
  const dir=path.join(__dirname,'phim',m.id);fs.mkdirSync(dir,{recursive:true});
  /* dọn kiểu cũ (phim/<mã>/<số>.html) */
  for(const f of fs.readdirSync(dir))if(/^\d+\.html$/.test(f))fs.unlinkSync(path.join(dir,f));
  if(m.eps.length<2)fs.rmSync(path.join(dir,'tap-1'),{recursive:true,force:true}); /* dọn tap-1 cũ của phim 1 tập */
  m.eps.forEach((e,i)=>{
    const t=m.title+(m.eps.length>1?' - '+e.name:'')+' - Phim';
    const one=m.eps.length<2; /* phim 1 tập: phim/<mã>/xem-phim.html, không có thư mục tap-1 */
    const d2=one?dir:path.join(dir,'tap-'+(i+1));fs.mkdirSync(d2,{recursive:true});
    fs.writeFileSync(path.join(d2,'xem-phim.html'),tpl.split('{{KHO}}').join(khoFiles.map(f=>`<script src="{{UP}}kho/${f}"></script>`).join('\n')).split('{{UP}}').join(one?'../../':'../../../').split('{{TITLE}}').join(esc(t)).split('{{ID}}').join(esc(m.id)).split('{{EP}}').join(i+1));pages++;
  });
  const f=path.join(__dirname,'link',m.id+'.js');
  if(!fs.existsSync(f)){
    fs.writeFileSync(f,`/* Link nhúng của: ${m.title.replace(/\*\//g,'')}
   Mỗi dòng là một tập, theo thứ tự. Dán link nhúng giữa hai dấu nháy:
   - YouTube: https://www.youtube.com/embed/MÃ_VIDEO
   - hoặc link file .mp4 / .webm
   Để '' nếu chưa có link. Muốn đặt tên tập riêng: {name:'Tập 1 - Mở đầu',url:'...'}
   NHIỀU SERVER cho một tập: dùng dấu [ ] , mỗi server một link, vd:
     ['https://link-server-1', 'https://link-server-2'],
     [{name:'Vietsub',url:'https://...'}, {name:'Thuyết minh',url:'https://...'}],
     {name:'Tập 1 - Mở đầu', servers:['https://...','https://...']}, */
LINKS['${m.id}']=[
${m.eps.map((e,i)=>`  '', // ${e.name}`).join('\n')}
];
`);links++;
  }
}
/* trang chủ: trang-chu/1.html, 2.html, ... (mẫu lấy từ trang-chu/1.html) */
const tcDir=path.join(__dirname,'trang-chu'),dataTag='<script src="../assets/data.js"></script>';
let tcTpl=fs.readFileSync(path.join(tcDir,'1.html'),'utf8').replace(/<script src="\.\.\/kho\/[^"]*"><\/script>\n?/g,'');
if(!tcTpl.includes(dataTag)){console.error('trang-chu/1.html thiếu dòng '+dataTag);process.exit(1)}
tcTpl=tcTpl.replace(dataTag,dataTag+'\n'+khoFiles.map(f=>`<script src="../kho/${f}"></script>`).join('\n'));
const nTrang=Math.max(1,Math.ceil(MOVIES.length/R.PER));
for(let n=1;n<=nTrang;n++)fs.writeFileSync(path.join(tcDir,n+'.html'),tcTpl.replace(/data-page="\d+"/,`data-page="${n}"`).replace(/<title>Phim - Trang \d+<\/title>/,`<title>Phim - Trang ${n}</title>`));
console.log(`Đã tạo ${pages} trang tập cho ${MOVIES.length} phim, ${links} file link mới trong thư mục link/, ${nTrang} trang chủ (trang-chu/).`);
