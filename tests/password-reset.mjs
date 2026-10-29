import assert from 'node:assert/strict';
import { resetPassword } from '../scripts/set-user-password.mjs';

function fixture({answers,users=[{id:'target',email:'owner@example.test'}],updateError=null,lookupError=null}) {
  const calls=[], prompts=[];
  const client={auth:{admin:{
    listUsers:async()=>({data:{users},error:lookupError}),
    updateUserById:async(id,attributes)=>{calls.push({id,attributes});return {error:updateError};},
  }}};
  const prompt=async(message,hidden=false)=>{prompts.push({message,hidden});const value=answers.shift();if(value instanceof Error)throw value;return value;};
  return {client,prompt,calls,prompts};
}
const password='A long test-only password!';
let f=fixture({answers:['OWNER@example.test',password,password]});
await resetPassword(f);assert.deepEqual(f.calls,[{id:'target',attributes:{password}}]);assert.equal(f.prompts[1].hidden,true);assert.equal(f.prompts[2].hidden,true);
for (const options of [
 {answers:['not-an-email']},
 {answers:['missing@example.test']},
 {answers:['owner@example.test','short']},
 {answers:['owner@example.test',password,'different password']},
 {answers:['owner@example.test',new Error('Cancelled')]},
 {answers:['owner@example.test'],lookupError:{message:'internal details'}},
 {answers:['owner@example.test'],users:[{id:'1',email:'owner@example.test'},{id:'2',email:'owner@example.test'}]},
]) {f=fixture(options);await assert.rejects(resetPassword(f));assert.equal(f.calls.length,0);}
f=fixture({answers:['owner@example.test',password,password],updateError:{message:'sensitive internal details'}});
await assert.rejects(resetPassword(f),error=>!error.message.includes('sensitive internal details'));
console.log('PASS: targeted admin password update, hidden prompts, wrong account, cancellation, mismatch and failures');
