import assert from 'node:assert/strict';
import handler from '../api/daily-materials.ts';
process.env.ADMIN_API_KEY='test-admin';process.env.SUPABASE_URL='https://db.example';process.env.SUPABASE_SECRET_KEY='test';
let status='draft',changed=false,writes=0;
globalThis.fetch=async(input:any,init:any={})=>{
 const url=String(input);
 if(init.method==='PATCH'){writes++;assert.ok(url.includes('status=eq.draft'));const row=JSON.parse(init.body);assert.equal(row.status,'draft');assert.equal(row.reviewed_at,undefined);assert.equal(row.published_at,undefined);return new Response(JSON.stringify(changed?[]:[{id:'one'}]));}
 return new Response(JSON.stringify([{id:'one',status}]));
};
async function run(key='test-admin'){let code=0,body:any;const res:any={setHeader(){},status(c:number){code=c;return this},json(d:any){body=d;return this}};await handler({method:'PATCH',headers:{'x-admin-key':key},body:{id:'one',status:'draft',title:'Edited title',lesson:['Reviewed notes'],practice:['Question'],answers:['Answer']}},res);return{code,body};}
assert.equal((await run('wrong')).code,401);assert.equal(writes,0);
assert.equal((await run()).code,200);assert.equal(writes,1);
status='published';assert.equal((await run()).code,409);assert.equal(writes,1);
status='approved';assert.equal((await run()).code,409);assert.equal(writes,1);
status='draft';changed=true;assert.equal((await run()).code,409);
console.log('PASS: authorized draft save never publishes, emails, marks reviewed or overwrites reviewed lessons; concurrent status change protected');
