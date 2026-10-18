/* ============ THÊM / SỬA PHIM: chỉ cần sửa danh sách bên dưới ============
   Mỗi phim là một dòng, cách nhau bằng dấu phẩy:
   {title:'Tên phim', type:'Movie' hoặc 'TV Series', year:2024, country:'Hàn Quốc',
    genres:['Hành động','Tâm lý'], poster:'link ảnh poster', note:'ghi chú'}
   Muốn xóa phim: xóa dòng đó đi. Ở dạng gọn: M('Tên','Movie',2024,'Mỹ','Thể loại 1/Thể loại 2')
   Link nhúng KHÔNG để ở đây: mỗi phim có một file riêng trong thư mục link/ (link/<mã phim>.js).
   Dạng gọn có tham số thứ 6 = số tập.
   Thêm/sửa phim xong chạy: node tao-trang.js  (tạo trang phim/<mã>/tap-<số tập>/xem-phim.html cho từng tập và file link/<mã>.js còn thiếu) */
const M=(t,ty,y,c,g,n)=>({title:t,type:ty,year:y,country:c,genres:g.split('/'),poster:'',note:'Phim mẫu',
  eps:Array.from({length:n||(ty==='Movie'?1:8)},(_,i)=>({name:(n||(ty==='Movie'?1:8))===1?'Full':'Tập '+(i+1)}))});
const MOVIES=[
 M('Hội Chứng Tuổi Thanh Xuân Phần 1','Movie',2019,'Hàn Quốc','Tâm lý/Hình sự',12)
];
const PER=8; /* số phim mỗi trang */
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
MOVIES.forEach(m=>{m.id=m.id||slug(m.title);if(!m.eps)m.eps=[{name:'Full'}]});
/* Đánh dấu tập đã xem: lưu trong trình duyệt (localStorage) */
const WK='phim.watched';
const getW=id=>{try{return JSON.parse(localStorage.getItem(WK)||'{}')[id]||[]}catch(e){return[]}};
const setW=(id,a)=>{try{const o=JSON.parse(localStorage.getItem(WK)||'{}');o[id]=a;localStorage.setItem(WK,JSON.stringify(o))}catch(e){}};
/* Link nhúng từng phim: được nạp từ link/<mã phim>.js */
const LINKS={};
