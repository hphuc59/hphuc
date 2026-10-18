/* Dùng: node tao-trang.js   (chạy lại mỗi khi thêm/sửa phim trong assets/data.js)
   - Tạo mỗi tập phim thành một trang html: phim/<mã phim>/tap-<số tập>/xem-phim.html
   - Tạo file link nhúng còn thiếu: link/<mã phim>.js  (file đã có thì KHÔNG bị ghi đè) */
const fs=require('fs'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'assets/data.js'),'utf8');
const MOVIES=new Function('localStorage',code+'\nreturn MOVIES')({getItem(){return null},setItem(){}});
const tpl=fs.readFileSync(path.join(__dirname,'phim/mau.html'),'utf8');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
fs.mkdirSync(path.join(__dirname,'link'),{recursive:true});
let pages=0,links=0;
for(const m of MOVIES){
  const dir=path.join(__dirname,'phim',m.id);fs.mkdirSync(dir,{recursive:true});
  /* dọn kiểu cũ (phim/<mã>/<số>.html) */
  for(const f of fs.readdirSync(dir))if(/^\d+\.html$/.test(f))fs.unlinkSync(path.join(dir,f));
  m.eps.forEach((e,i)=>{
    const t=m.title+(m.eps.length>1?' - '+e.name:'')+' - Phim';
    const d2=path.join(dir,'tap-'+(i+1));fs.mkdirSync(d2,{recursive:true});
    fs.writeFileSync(path.join(d2,'xem-phim.html'),tpl.split('{{TITLE}}').join(esc(t)).split('{{ID}}').join(esc(m.id)).split('{{EP}}').join(i+1));pages++;
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
console.log(`Đã tạo ${pages} trang tập cho ${MOVIES.length} phim, ${links} file link mới trong thư mục link/.`);
