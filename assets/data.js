/* ============ DỮ LIỆU CHUNG — danh sách phim KHÔNG nằm ở đây ============
   Phim được lưu trong thư mục kho/: kho/1.js, kho/2.js, ... mỗi file TỐI ĐA 50 phim.
   Thêm phim: mở file kho cuối cùng, thêm một dòng trong MOVIES.push( ... ):
     M('Tên','Movie' hoặc 'TV Series',2024,'Mỹ','Thể loại 1/Thể loại 2',số tập,'link poster','Tên gốc'),
   (Tên gốc: tên phim nguyên bản, hiện dưới tên Việt hoá và cũng tìm kiếm được; để '' nếu không có)
   (số tập: bỏ trống thì Movie = 1 tập, TV Series = 8 tập; poster: để '' nếu chưa có)
   Đủ 50 phim thì tạo file mới kho/2.js (nội dung: MOVIES.push( ... );) rồi làm tiếp.
   Link nhúng cũng không để ở đây: mỗi phim có file riêng link/<mã phim>.js
   Xong chạy: node tao-trang.js  (tạo trang chủ, trang từng tập và file link còn thiếu) */
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const M=(t,ty,y,c,g,n,p,o)=>{const k=n||(ty==='Movie'?1:8);
  return{id:slug(t),title:t,orig:o||'',type:ty,year:y,country:c,genres:g.split('/'),poster:p||'',note:'',
  eps:Array.from({length:k},(_,i)=>({name:k===1?'Full':'Tập '+(i+1)}))}};
const MOVIES=[]; /* được nạp từ kho/1.js, kho/2.js, ... */
const PER=8; /* số phim mỗi trang */
/* Đánh dấu tập đã xem: lưu trong trình duyệt (localStorage) */
const WK='phim.watched';
const getW=id=>{try{return JSON.parse(localStorage.getItem(WK)||'{}')[id]||[]}catch(e){return[]}};
const setW=(id,a)=>{try{const o=JSON.parse(localStorage.getItem(WK)||'{}');o[id]=a;localStorage.setItem(WK,JSON.stringify(o))}catch(e){}};
/* Link nhúng từng phim: được nạp từ link/<mã phim>.js */
const LINKS={};
/* Tập đang xem dở của từng phim (bấm lại poster sẽ mở đúng tập này) */
const LK='phim.last';
const getL=id=>{try{return+(JSON.parse(localStorage.getItem(LK)||'{}')[id]||0)}catch(e){return 0}};
const setL=(id,i)=>{try{const o=JSON.parse(localStorage.getItem(LK)||'{}');o[id]=i;localStorage.setItem(LK,JSON.stringify(o))}catch(e){}};
