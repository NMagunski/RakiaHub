import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
const origins=JSON.parse(readFileSync(new URL('../src/lib/origin-registry.json',import.meta.url),'utf8'));
const uid='00000000-0000-4000-8000-000000000001',pid='10000000-0000-4000-8000-000000000001';
const user={id:uid,aud:'authenticated',role:'authenticated',email:'qa@example.test',email_confirmed_at:'2026-01-01T00:00:00Z',created_at:'2026-01-01T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{username:'qa'}};
const profile={id:uid,username:'qa',display_name:'Тестов профил',avatar_url:null,is_admin:true,theme:'amber',created_at:'2026-01-01T00:00:00Z'};
const product={id:pid,name:'Тестова сливова · QA',producer:'Демонстрационни данни',fruit:'plum',type:'commercial',country:'Bulgaria',region:'Троян',country_id:'BG',region_id:'geonames:726320',origin_verified:true,global_rating:8.5,rating_count:2,is_verified:false,abv:40,description:'Тестов запис само за локална визуална проверка. Не е реален каталожен продукт.',created_at:'2026-01-01T00:00:00Z',updated_at:'2026-01-01T00:00:00Z',image_url:null,image_rights:null};
const catalog=[product,...[['grape','гроздова'],['apricot','кайсиева'],['pear','крушова'],['quince','дюлева'],['fig','смокинова']].map(([fruit,label],index)=>({...product,id:`10000000-0000-4000-8000-${String(index+2).padStart(12,'0')}`,name:`Тестова ${label} · QA`,fruit,region:null,region_id:null,origin_verified:false,global_rating:null,rating_count:0}))];
const rating={id:'30000000-0000-4000-8000-000000000001',user_id:uid,rakija_id:pid,score:8.5,tasted_at:'2026-10-01T19:00:00Z',created_at:'2026-10-01T19:00:00Z',notes:'Плодова, мека, с дълъг завършек.',venue_name:'София · тест',is_private:false,aroma_tags:['plum'],taste_tags:['smooth'],finish_tags:['long'],color_tags:['amber'],aroma_note:null,taste_note:null,finish_note:null,rakija:product,profiles:profile};
const friendId='00000000-0000-4000-8000-000000000002';
const friend={...profile,id:friendId,username:'qa_friend',is_admin:false};
const social=[{...rating,id:'30000000-0000-4000-8000-000000000002',user_id:friendId,profiles:friend},{...rating,id:'30000000-0000-4000-8000-000000000003',user_id:friendId,profiles:friend,rakija:catalog[1],rakija_id:catalog[1].id,score:7.8,notes:null,venue_name:null,aroma_tags:[],taste_tags:[],finish_tags:[],color_tags:[]}];
const journal=[rating];
const reactions=[];
let scenario='normal';
const initialWishlist={id:"40000000-0000-4000-8000-000000000001",rakija_id:pid,user_id:uid,rakija:product,created_at:rating.created_at};
const wishlist=[initialWishlist];
const jwt=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:uid,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+86400})).toString('base64url'),'local-test-signature'].join('.');
const server=http.createServer(async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS');res.setHeader('Content-Type','application/json');if(req.method==='OPTIONS'){res.end();return;}let raw='';for await(const c of req)raw+=c;const body=raw?JSON.parse(raw):{};const url=new URL(req.url,'http://localhost');let data=[];
if(url.pathname==='/__scenario'){scenario=body.scenario||'normal';data={ok:true};}
else if(url.pathname==='/__reset'){journal.splice(0,journal.length,rating);wishlist.splice(0,wishlist.length,initialWishlist);profile.theme='amber';scenario='normal';reactions.splice(0);data={ok:true};}
else if(url.pathname.includes('/auth/v1/recover'))data={};
else if(url.pathname.includes('/auth/v1/token')&&body.password==='wrong-password'){res.statusCode=400;data={error:'invalid_grant',error_description:'Invalid login credentials',msg:'Invalid login credentials'};}
else if(url.pathname.includes('/auth/v1/token'))data={access_token:jwt,refresh_token:'local-test-refresh',token_type:'bearer',expires_in:86400,expires_at:Math.floor(Date.now()/1000)+86400,user};
else if(url.pathname.includes('/auth/v1/user'))data=user;
else if(url.pathname.includes('/rpc/search_catalog'))data=catalog.filter(p=>(!body.fruit_filter||p.fruit===body.fruit_filter)&&(!body.country_filter||p.country_id===body.country_filter)&&(!body.region_filter||p.region_id===body.region_filter)&&(!body.tried_only||journal.some(t=>t.rakija_id===p.id))&&(!body.q||p.name.toLowerCase().includes(body.q.toLowerCase())||p.producer.toLowerCase().includes(body.q.toLowerCase())));
else if(url.pathname.includes('/rpc/save_tasting')){const p=body.p||{};const previous=journal.find(r=>r.request_id===p.request_id&&p.request_id);if(previous)data=previous.id;else{const previous=journal.filter(r=>r.rakija_id===p.rakija_id).at(-1);const entry={...rating,...p,notes:p.notes??null,venue_name:p.venue_name??null,is_private:p.is_private??previous?.is_private??true,id:randomUUID(),tasted_at:p.tasted_at||new Date().toISOString(),created_at:new Date().toISOString()};journal.push(entry);wishlist.splice(0,wishlist.length);data=entry.id;}}
else if(url.pathname.includes('/rpc/public_profile'))data={profile,ratings:[{...rating,...product,rakija_id:pid}]};
else if(url.pathname.includes('/profiles'))data=url.searchParams.get('select')==='theme'?{theme:profile.theme}:profile;
else if(url.pathname.includes('/ratings')){
 if(scenario==='error'){res.statusCode=500;res.end(JSON.stringify({message:'Local fixture failure'}));return;}
 data=scenario==='empty'?[]:[...journal,...social];
 if(req.method==='DELETE'){const id=(url.searchParams.get('id')||'').replace('eq.','');const index=journal.findIndex(r=>r.id===id);if(index>=0)journal.splice(index,1);data=[];}
 for(const field of ['id','user_id','rakija_id']){const filter=url.searchParams.get(field);if(filter?.startsWith('eq.'))data=data.filter(row=>row[field]===filter.slice(3));if(filter?.startsWith('neq.'))data=data.filter(row=>row[field]!==filter.slice(4));}
 const order=url.searchParams.get('order');if(order){const keys=order.split(',').map(term=>term.split('.'));data.sort((a,b)=>{for(const [key,direction] of keys){const comparison=String(a[key]??'').localeCompare(String(b[key]??''));if(comparison)return direction==='desc'?-comparison:comparison;}return 0;});}
 const limit=url.searchParams.get('limit');if(limit)data=data.slice(0,Number(limit));
}
else if(url.pathname.includes('/reactions')){if(scenario==='reaction-error'){res.statusCode=500;data={message:'Local fixture failure'};}else{if(req.method==='POST')reactions.push({...body,profiles:profile});if(req.method==='DELETE'){const i=reactions.findIndex(r=>r.rating_id===(url.searchParams.get('rating_id')||'').replace('eq.',''));if(i>=0)reactions.splice(i,1);}data=reactions;}}
else if(url.pathname.includes('/rakija'))data=catalog.find(p=>p.id===(url.searchParams.get('id')||'').replace('eq.',''))||product;
else if(url.pathname.includes('/countries'))data=[{id:'BG',name:'България'},{id:'RS',name:'Сърбия'},{id:'MK',name:'Северна Македония'}];
else if(url.pathname.includes('/origin_regions'))data=origins.map(r=>({...r,source_url:'https://www.geonames.org/'+r.id.split(':')[1]+'/',attribution:'GeoNames, CC BY 4.0'}));
else if(url.pathname.includes('/wishlists'))data=wishlist;
if(req.method==='PATCH'&&url.pathname.includes('/profiles')&&body.theme)profile.theme=body.theme;
if(req.headers.accept?.includes('application/vnd.pgrst.object+json')&&Array.isArray(data))data=data[0]||null;
res.setHeader('Content-Range','0-0/1');res.end(JSON.stringify(data));});
const port=Number(process.env.FIXTURE_PORT||54321);
server.listen(port,'127.0.0.1',()=>console.log('Local Supabase fixture server:',port));
