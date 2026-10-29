import ts from 'typescript';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const output=ts.transpileModule(readFileSync('src/app/api/auth/username/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const exports={};let queries=0,result={data:null,error:null};
const require=name=>{
 if(name==='next/server')return {NextResponse:{json:(body,options)=>Response.json(body,options)}};
 if(name==='@/lib/supabase/admin')return {createAdminClient:()=>({from:table=>{assert.equal(table,'profiles');return {select:columns=>{assert.equal(columns,'id');return {eq:(field,value)=>{assert.equal(field,'username');assert.equal(value,'valid_name');return {maybeSingle:async()=>{queries++;return result;}};}};}};}})};
 throw new Error('Unexpected dependency: '+name);
};
vm.runInNewContext(output,{exports,require});
const request=username=>new Request('http://localhost/api/auth/username',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username})});
for(const invalid of ['ab','a'.repeat(33),'a,b','Тест',null,{},'a%_'])assert.equal((await exports.POST(request(invalid))).status,400);
assert.equal(queries,0);
let response=await exports.POST(request('valid_name'));assert.deepEqual(await response.json(),{available:true});assert.equal(response.headers.get('Cache-Control'),'no-store');
result={data:{id:'private-profile-id'},error:null};response=await exports.POST(request('valid_name'));assert.deepEqual(await response.json(),{available:false});
result={data:null,error:{message:'internal database details'}};response=await exports.POST(request('valid_name'));assert.equal(response.status,503);assert.ok(!(await response.text()).includes('internal database details'));
console.log('PASS: guest username availability validates input, reports collisions, hides profile data and handles DB failure');
