import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
const origins=JSON.parse(readFileSync(new URL('../src/lib/origin-registry.json',import.meta.url),'utf8'));
const uid='00000000-0000-4000-8000-000000000001',pid='10000000-0000-4000-8000-000000000001';
const user={id:uid,aud:'authenticated',role:'authenticated',email:'qa@example.test',email_confirmed_at:'2026-01-01T00:00:00Z',created_at:'2026-01-01T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{username:'qa'}};
const profile={id:uid,username:'qa',display_name:'Тестов профил',avatar_url:null,is_admin:true,theme:'amber',created_at:'2026-01-01T00:00:00Z'};
const product={id:pid,name:'Тестова сливова · QA',producer:'Демонстрационни данни',fruit:'plum',type:'commercial',country:'Bulgaria',region:'Троян',country_id:'BG',region_id:'geonames:726320',origin_verified:true,global_rating:8.5,rating_count:2,is_verified:false,abv:40,description:'Тестов запис само за локална визуална проверка. Не е реален каталожен продукт.',created_at:'2026-01-01T00:00:00Z',updated_at:'2026-01-01T00:00:00Z',image_url:null,image_rights:null};
const rating={id:'30000000-0000-4000-8000-000000000001',user_id:uid,rakija_id:pid,score:8.5,tasted_at:'2026-10-01T19:00:00Z',created_at:'2026-10-01T19:00:00Z',notes:'Плодова, мека, с дълъг завършек.',venue_name:'София · тест',is_private:false,aroma_tags:['plum'],taste_tags:['smooth'],finish_tags:['long'],color_tags:['amber'],aroma_note:null,taste_note:null,finish_note:null,rakija:product,profiles:profile};
const journal=[rating];
const jwt=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:uid,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+86400})).toString('base64url'),'local-test-signature'].join('.');
const server=http.createServer(async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE,OPTIONS');res.setHeader('Content-Type','application/json');if(req.method==='OPTIONS'){res.end();return;}let raw='';for await(const c of req)raw+=c;const body=raw?JSON.parse(raw):{};const url=new URL(req.url,'http://localhost');let data=[];
if(url.pathname==='/__reset'){journal.splice(0,journal.length,rating);profile.theme='amber';data={ok:true};}
else if(url.pathname.includes('/auth/v1/token'))data={access_token:jwt,refresh_token:'local-test-refresh',token_type:'bearer',expires_in:86400,expires_at:Math.floor(Date.now()/1000)+86400,user};
else if(url.pathname.includes('/auth/v1/user'))data=user;
else if(url.pathname.includes('/rpc/search_catalog'))data=[product];
else if(url.pathname.includes('/rpc/save_tasting')){const p=body.p||{};const previous=journal.find(r=>r.request_id===p.request_id&&p.request_id);if(previous)data=previous.id;else{const entry={...rating,...p,id:randomUUID(),tasted_at:p.tasted_at||new Date().toISOString(),created_at:new Date().toISOString()};journal.push(entry);data=entry.id;}}
else if(url.pathname.includes('/rpc/public_profile'))data={profile,ratings:[{...rating,...product,rakija_id:pid}]};
else if(url.pathname.includes('/profiles'))data=url.searchParams.get('select')==='theme'?{theme:profile.theme}:profile;
else if(url.pathname.includes('/ratings'))data=journal;
else if(url.pathname.includes('/rakija'))data=product;
else if(url.pathname.includes('/countries'))data=[{id:'BG',name:'България'},{id:'RS',name:'Сърбия'},{id:'MK',name:'Северна Македония'}];
else if(url.pathname.includes('/origin_regions'))data=origins.map(r=>({...r,source_url:'https://www.geonames.org/'+r.id.split(':')[1]+'/',attribution:'GeoNames, CC BY 4.0'}));
else if(url.pathname.includes('/wishlists'))data=[{id:'40000000-0000-4000-8000-000000000001',rakija_id:pid,user_id:uid,rakija:product,created_at:rating.created_at}];
if(req.method==='PATCH'&&url.pathname.includes('/profiles')&&body.theme)profile.theme=body.theme;
if(req.headers.accept?.includes('application/vnd.pgrst.object+json')&&Array.isArray(data))data=data[0]||null;
res.setHeader('Content-Range','0-0/1');res.end(JSON.stringify(data));});
server.listen(54321,'127.0.0.1',()=>console.log('Local Supabase fixture server: 54321'));
