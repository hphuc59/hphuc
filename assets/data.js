.read()
old="const MOVIES=[]; /* được nạp từ kho/1.js, kho/2.js, ... */\n"
assert old in d
new='''const MOVIES=[];
/* Nạp danh sách phim từ kho/1.js ... kho/KHO.js (tự chèn vào mọi trang, không cần sửa từng trang html) */
const KHO=1; /* số file trong thư mục kho/ — thêm kho/2.js thì đổi thành 2 (chạy node tao-trang.js sẽ tự cập nhật) */
MOVIES.push=function(...a){a.forEach(m=>{if(!this.some(x=>x.id===m.id))Array.prototype.push.call(this,m)});return this.length}; /* nạp trùng cũng không bị lặp phim */
if(typeof document!=='undefined'&&document.currentScript)for(let i=1;i<=KHO;i++)document.write('<script src="'+new URL('../kho/'+i+'.js',document.currentScript.src).href+'"><\\/script>');
'''
d=d.replace(old,new)
d=d.replace("   Xong chạy: node tao-trang.js  (tạo trang chủ, trang từng tập và file link còn thiếu) */","   Xong chạy: node tao-trang.js  (tạo trang chủ, trang từng tập, file link còn thiếu và tự cập nhật số KHO bên dưới) */")
open('assets/data.js','w',encoding='utf-8').write(d)

t=open('phim/mau.html',encoding='utf-8').read()
t=t.replace('{{KHO}}\n','')
open('phim/mau.html','w',encoding='utf-8').write(t)

g=open('tao-trang.js',encoding='utf-8').read()
# bỏ chèn thẻ kho tĩnh trong trang tập
g=g.replace("tpl.split('{{KHO}}').join(khoFiles.map(f=>`<script src=\"{{UP}}kho/${f}\"></script>`).join('\\n')).split('{{UP}}')","tpl.split('{{UP}}')")
assert '{{KHO}}' not in g
# bỏ chèn thẻ kho tĩnh trang chủ
g=g.replace("tcTpl=tcTpl.replace(dataTag,dataTag+'\\n'+khoFiles.map(f=>`<script src=\"../kho/${f}\"></script>`).join('\\n'));\n","")
assert 'kho/${f}' not in g
# gỡ override push để bắt trùng + kiểm tra file liên tục + đồng bộ KHO
g=g.replace("const counts=[];for(const f of files){","delete MOVIES.push;const counts=[];for(const f of files){")
g=g.replace("const code=fs.readFileSync(path.join(__dirname,'assets/data.js'),'utf8');","khoFiles.forEach((f,i)=>{if(parseInt(f)!==i+1){console.error('Các file trong kho/ phải đánh số liên tục 1.js, 2.js, 3.js... (đang thiếu '+(i+1)+'.js)');process.exit(1)}});\nconst dataPath=path.join(__dirname,'assets/data.js'),code=fs.readFileSync(dataPath,'utf8');",1)
g=g.replace("if(loi)process.exit(1);\n","if(loi)process.exit(1);\nconst code2=code.replace(/const KHO=\\d+;/,'const KHO='+khoFiles.length+';'); /* tự cập nhật số file kho trong data.js */\nif(code2!==code)fs.writeFileSync(dataPath,code2);\n",1)
open('tao-trang.js','w',encoding='utf-8').write(g)
EOF
node --check tao-trang.js && cat assets/data.js assets/app.js > /tmp/h.js && node --check /tmp/h.js && echo SYNTAX_OK
# mô phỏng trình duyệt: trang CŨ chỉ có data.js (không thẻ kho) + kho tải 2 lần
node -e "
const fs=require('fs'),vm=require('vm');
const w=[];global.document={currentScript:{src:'https://hphuc59.vercel.app/assets/data.js'},write(s){w.push(s)}};
global.localStorage={getItem(){return null},setItem(){}};
vm.runInThisContext(fs.readFileSync('assets/data.js','utf8').replace(/^const /gm,'var '));
console.log(w);
for(let i=0;i<2;i++)vm.runInThisContext(fs.readFileSync('kho/1.js','utf8'));
console.log(MOVIES.length,MOVIES[0].id)"
# chạy lại trình tạo
node tao-trang.js && grep -c "kho/" trang-chu/1.html phim/hoi-chung-tuoi-thanh-xuan-phan-1/tap-1/xem-phim.html; grep -n "const KHO" assets/data.js | cut -c1-60
