// Canvas compartido: servidor sin dependencias. Uso: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const PORT=+process.env.PORT||3000,DATA=path.join(__dirname,'data.json');
const MAX_ITEMS=5000,MAX_BODY=400*1024;
let items=[];try{items=JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(e){}
let timer=null;
const save=()=>{clearTimeout(timer);timer=setTimeout(()=>fs.writeFile(DATA,JSON.stringify(items),()=>{}),1000)};
const clients=new Set();
const send=(ev,d)=>{const m=`event: ${ev}\ndata: ${JSON.stringify(d)}\n\n`;for(const r of clients)r.write(m)};
setInterval(()=>{for(const r of clients)r.write(': ping\n\n')},25000);
// El administrador es quien abre la página desde este mismo PC (localhost)
// Con ADMIN_KEY (modo alojado en internet) el admin es quien manda la clave; sin ella, quien abre desde localhost
const ADMIN_KEY=process.env.ADMIN_KEY||'';
const isAdmin=req=>ADMIN_KEY?(req.headers['x-admin-key']||new URL(req.url,'http://x').searchParams.get('key'))===ADMIN_KEY:['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
const lan=()=>{const o=[];for(const l of Object.values(os.networkInterfaces()))for(const i of l||[])if(i.family==='IPv4'&&!i.internal)o.push(`http://${i.address}:${PORT}`);return o};
const hits=new Map();setInterval(()=>hits.clear(),1000);
const limited=req=>{const k=(ADMIN_KEY&&(req.headers['x-forwarded-for']||'').split(',')[0].trim())||req.socket.remoteAddress,n=(hits.get(k)||0)+1;hits.set(k,n);return n>40};
function body(req){return new Promise((ok,no)=>{let n=0;const c=[];req.on('data',d=>{n+=d.length;if(n>MAX_BODY){no(new Error('big'));req.destroy()}else c.push(d)});req.on('end',()=>{try{ok(JSON.parse(Buffer.concat(c).toString()||'{}'))}catch(e){no(e)}});req.on('error',no)})}
function clean(b){
 const it={id:String(b.id||'').replace(/[^\w-]/g,'').slice(0,40)||Math.random().toString(36).slice(2),type:b.type==='img'?'img':'stroke',name:String(b.name||'?').slice(0,24),uid:String(b.uid||'').slice(0,40),t:Date.now()};
 if(it.type==='img'){
  if(typeof b.src!=='string'||!b.src.startsWith('data:image/jpeg;base64,'))return null;
  Object.assign(it,{src:b.src,x:+b.x||0,y:+b.y||0,w:Math.min(+b.w||300,1200),h:Math.min(+b.h||300,1200)});
 }else{
  if(!Array.isArray(b.pts)||!b.pts.length)return null;
  it.pts=b.pts.slice(0,3000).map(p=>[+p[0]||0,+p[1]||0]);
  it.color=/^#[0-9a-f]{6}$/i.test(b.color)?b.color:'#000000';it.size=Math.min(Math.max(+b.size||6,1),60);
 }
 return it;
}
http.createServer(async(req,res)=>{
 const u=req.url.split('?')[0];
 try{
  if(req.method==='GET'&&u==='/events'){
   res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});
   const a=isAdmin(req);res.write(`event: init\ndata: ${JSON.stringify({items,admin:a,urls:a&&!ADMIN_KEY?lan():[],hosted:!!ADMIN_KEY})}\n\n`);
   clients.add(res);req.on('close',()=>clients.delete(res));return;
  }
  if(req.method==='GET'&&(u==='/'||u==='/index.html')){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(__dirname,'public','index.html')));
  }
  if(req.method==='POST'&&u.startsWith('/api/')){
   if(limited(req)){res.writeHead(429);return res.end()}
   const b=await body(req),op=u.slice(5);
   if(op==='add'){
    if(items.length>=MAX_ITEMS){res.writeHead(507);return res.end()}
    const it=clean(b);if(!it){res.writeHead(400);return res.end()}
    if(!items.some(i=>i.id===it.id)){items.push(it);send('add',it);save()}
   }else if(op==='del'){
    const i=items.findIndex(x=>x.id===b.id);
    if(i>=0&&(isAdmin(req)||(b.uid&&items[i].uid===b.uid))){items.splice(i,1);send('del',{id:b.id});save()}
   }else if(op==='clear'&&isAdmin(req)){items=[];send('clear',{});save()}
   res.writeHead(204);return res.end();
  }
  res.writeHead(404);res.end();
 }catch(e){try{res.writeHead(400);res.end()}catch(_){}}
}).listen(PORT,'0.0.0.0',()=>{
 console.log('\nCanvas compartido listo.\n');
 console.log('  En este PC (administrador):  http://localhost:'+PORT);
 for(const a of lan())console.log('  Para los celulares (mismo Wi-Fi): '+a);
 console.log('\nAbre la dirección localhost en tu navegador y usa el botón QR.\n');
});
