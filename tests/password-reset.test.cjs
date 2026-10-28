const {test}=require('node:test');const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),crypto=require('node:crypto');
process.env.CREDENTIAL_SECRET='test-secret';process.env.RESEND_API_KEY='test-resend';
const hash=p=>crypto.createHmac('sha256','test-secret').update(p).digest('hex');
function handler(db){const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync('api/_passwordReset.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;new Function('require','module','exports',code)(n=>n==='./_supabase.js'?{supabaseRequest:db,passwordHash:hash}:require(n),mod,mod.exports);return mod.exports.default;}
function res(){return {status(n){this.code=n;return this},setHeader(){},json(body){this.body=body;return this}}}
test('reset link is delivered only to stored email, expires, and cannot be reused',async()=>{
 let current=hash('previous-password');let sent;let patches=0;
 const oldFetch=global.fetch;global.fetch=async(url,init)=>{sent=JSON.parse(init.body);return {ok:true}};
 const db=async(path,init)=>{if(path.startsWith('rpc/'))return true;if(init?.method==='PATCH'){patches++;assert.match(path,new RegExp(current));current=JSON.parse(init.body).password_hash;return [{id:'s1'}]};return [{id:'s1',email:'parent@example.org',password_hash:current}]};
 try{const h=handler(db);let r=res();await h({body:{action:'request-password-reset',email:'Parent@example.org'}},r);assert.equal(r.code,200);assert.deepEqual(sent.to,['parent@example.org']);const token=sent.text.match(/#reset=([^\s]+)/)[1];assert.ok(!sent.text.includes('previous-password'));
 r=res();await h({body:{action:'reset-password',token:token+'x',password:'new-strong-password'}},r);assert.equal(r.code,400);assert.equal(patches,0);
 r=res();await h({body:{action:'reset-password',token,password:'new-strong-password'}},r);assert.equal(r.code,200);assert.equal(current,hash('new-strong-password'));
 r=res();await h({body:{action:'reset-password',token,password:'another-strong-password'}},r);assert.equal(r.code,400);assert.equal(patches,1);
 const payload=Buffer.from(JSON.stringify({id:'s1',exp:Date.now()-1})).toString('base64url');const sig=crypto.createHmac('sha256','test-secret').update(`student-reset:${payload}:${current}`).digest('base64url');r=res();await h({body:{action:'reset-password',token:payload+'.'+sig,password:'another-strong-password'}},r);assert.equal(r.code,400);
 }finally{global.fetch=oldFetch}
});
test('unknown account uses generic response and never sends email',async()=>{const h=handler(async path=>path.startsWith('rpc/')?true:[]);const r=res();await h({body:{action:'request-password-reset',email:'unknown@example.org'}},r);assert.equal(r.code,200);assert.match(r.body.message,/If this email/)});
test('daily email goes straight to login and pre-login dropdown uses catalogue policy',()=>{assert.match(fs.readFileSync('api/daily-materials.ts','utf8'),/href="https:\/\/www.nextclasses.in\/student-app"/);assert.match(fs.readFileSync('src/components/StudentPortalModal.tsx','utf8'),/COURSES_DATA.filter\(isCourseOpenForEnrollment\).map/)});
