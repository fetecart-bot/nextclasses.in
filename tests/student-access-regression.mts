import assert from 'node:assert/strict';
import login from '../api/student-login.ts';
import { passwordHash } from '../api/_supabase.ts';
process.env.SUPABASE_URL='https://database.example';
process.env.SUPABASE_SECRET_KEY='test';
process.env.CREDENTIAL_SECRET='test-secret';
let active=true;
let calls:string[]=[];
globalThis.fetch=async (input:any) => {
 const url=String(input); calls.push(url);
 if(url.includes('/students?')) return new Response(JSON.stringify([{id:'student-test',active,password_hash:passwordHash('correct'),username:'nc_Mixed',email:'test@example.com'}]));
 if(url.includes('/enrollments?')) return new Response(JSON.stringify([{course_id:'course-public-speaking-articulation',course_title:'Public Speaking'}]));
 throw new Error('Unexpected payment fallback');
};
async function attempt(password:string) {
 let status=0,body:any;
 const res:any={status(code:number){status=code;return this},json(data:any){body=data;return this}};
 calls=[];await login({method:'POST',body:{identifier:'nc_mixed',password}},res);return {status,body};
}
const valid=await attempt('correct');assert.equal(valid.status,200);assert.equal(valid.body.account.courseId,'course-public-speaking-articulation');assert.match(calls[0],/username.ilike/);
assert.equal((await attempt('wrong')).status,401);assert.equal(calls.length,1);
active=false;assert.equal((await attempt('correct')).status,401);assert.equal(calls.length,1);
console.log('PASS: corrected course, mixed-case username, invalid password, disabled account');
