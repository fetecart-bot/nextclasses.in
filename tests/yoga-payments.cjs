// Isolated handler tests: no real credentials, database, emails or charges.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const constants={YOGA_AMOUNT:50000,YOGA_CURRENCY:'USD',YOGA_COURSE_ID:'course-international-yoga',YOGA_TITLE:'International Yoga with Kavery P P',YOGA_VERSION:'yoga-month-v1'};
const sid='10000000-0000-4000-8000-000000000001';let dbCalls=[],providerCalls=[],activated=0,studentExists=false,expired=false,invalidPassword=false,providerPayment={},providerOrder={},resources=[{id:'note',kind:'notes',url:'https://example.invalid/notes',title:'Notes'}];
const student={id:sid,name:'Test',email:'learner@example.invalid',password_hash:'hash',active:true};
const db=async(path,init)=>{dbCalls.push({path,init});if(path.startsWith('students?'))return studentExists?[student]:[];if(path.startsWith('yoga_memberships?'))return path.includes('limit=0')?[]:[{student_id:sid,access_until:expired?'2000-01-01':'2099-01-01'}];if(path.startsWith('yoga_resources?'))return resources;return []};
const providerFetch=async(url,init)=>{providerCalls.push({url,init});let data;if(url.endsWith('/orders')){const body=JSON.parse(init.body);data={id:'order_test',...body}}else data=url.includes('/payments/')?providerPayment:providerOrder;return {ok:true,json:async()=>data}};
function load(path,stubs){const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const c={exports:{},Buffer,URL,Date,AbortSignal,process:{env:{RAZORPAY_KEY_ID:'test-key',RAZORPAY_KEY_SECRET:'test-secret',ADMIN_API_KEY:'admin-test'}},fetch:providerFetch,require:n=>{if(n in stubs)return stubs[n];if(n.includes('yogaProgramme'))return constants;return require(n)}};vm.runInNewContext(code,c);return c.exports}
const handler=load('api/_yogaPayment.ts',{'./_supabase.js':{supabaseRequest:db,passwordHash:p=>invalidPassword?'wrong':'hash'},'./_yogaBilling.js':{activateVerifiedYogaPayment:async()=>{activated++;return {access:{studentId:sid,accessUntil:'2099-01-01'},student,account:{password:'new-secret',email:student.email}}}},'./_enrollmentEmail.js':{sendEnrollmentEmail:async()=>true}}).default;
async function run(body,headers={}){let code,data;await handler({method:'POST',body,headers},{setHeader(){},status(n){code=n;return this},json(d){data=d}});return {code,data}}
const base={action:'create-yoga-order',mode:'new',name:'Test Learner',email:'learner@example.invalid',phone:'+12025550123',acceptedTerms:true,amount:1,currency:'INR'};
(async()=>{
 let result=await run({...base,acceptedTerms:false});assert.equal(result.code,400);
 result=await run(base);assert.equal(result.code,200);assert.equal(result.data.amount,50000);assert.equal(result.data.currency,'USD');let order=JSON.parse(providerCalls.at(-1).init.body);assert.equal(order.amount,50000);assert.equal(order.currency,'USD');assert.equal(order.notes.mode,'new');
 studentExists=true;result=await run(base);assert.equal(result.code,409);
 result=await run({action:'create-yoga-order',mode:'renew',identifier:'test',password:'password',acceptedTerms:true});assert.equal(result.code,200);order=JSON.parse(providerCalls.at(-1).init.body);assert.equal(order.notes.studentId,sid);
 invalidPassword=true;const before=providerCalls.length;result=await run({action:'create-yoga-order',mode:'renew',identifier:'test',password:'wrong',acceptedTerms:true});assert.equal(result.code,503);assert.equal(providerCalls.length,before);invalidPassword=false;
 result=await run({action:'verify-yoga-payment',paymentId:'pay_test',orderId:'order_test',signature:'0'.repeat(64)});assert.equal(result.code,401);assert.equal(activated,0);
 const sig=crypto.createHmac('sha256','test-secret').update('order_test|pay_test').digest('hex');const verify={action:'verify-yoga-payment',paymentId:'pay_test',orderId:'order_test',signature:sig};
 providerPayment={id:'pay_test',order_id:'order_test',amount:50000,currency:'USD',status:'captured'};providerOrder={id:'order_test',amount:50000,currency:'USD',status:'paid',notes:{checkoutVersion:constants.YOGA_VERSION,courseId:constants.YOGA_COURSE_ID,mode:'new'}};
 for(const change of [{currency:'INR'},{amount:500},{status:'authorized'},{order_id:'order_other'}]){const saved=providerPayment;providerPayment={...providerPayment,...change};result=await run(verify);assert.equal(result.code,409);assert.equal(activated,0);providerPayment=saved;}
 providerOrder.currency='INR';result=await run(verify);assert.equal(result.code,409);providerOrder.currency='USD';
 result=await run(verify);assert.equal(result.code,200);assert.equal(activated,1);
 result=await run({action:'yoga-access',identifier:'test',password:'password'});assert.equal(result.code,200);assert.equal(result.data.active,true);assert.equal(result.data.resources.length,1);
 expired=true;dbCalls=[];result=await run({action:'yoga-access',identifier:'test',password:'password'});assert.equal(result.data.active,false);assert.equal(result.data.resources.length,0);assert.equal(dbCalls.some(c=>c.path.startsWith('yoga_resources?')),false);
 result=await run({action:'yoga-admin-resources'});assert.equal(result.code,401);
 result=await run({action:'yoga-admin-save-resource',kind:'video',title:'Unsafe',url:'javascript:alert(1)'},{'x-admin-key':'admin-test'});assert.equal(result.code,400);
 const billing=load('api/_yogaBilling.ts',{'./_supabase.js':{passwordHash:()=> 'hash',supabaseRequest:async(path,init)=>{if(path==='rpc/activate_yoga_month'){const b=JSON.parse(init.body);assert.equal(b.p_amount,50000);assert.equal(b.p_currency,'USD');return {studentId:sid,accessUntil:'2099-01-01'}}return [student]}}});
 const p={...providerPayment,notes:{...providerOrder.notes,studentName:'Test',studentEmail:'learner@example.invalid',studentPhone:'+12025550123'}};
 await assert.rejects(()=>billing.activateVerifiedYogaPayment({...p,currency:'INR'}));await assert.rejects(()=>billing.activateVerifiedYogaPayment({...p,amount:500}));await billing.activateVerifiedYogaPayment(p);
 console.log('PASS: USD500 server price, new/existing accounts, signature/capture/order/currency checks, access expiry, admin permissions and unsafe-link rejection. No live network used.');
})().catch(e=>{console.error(e);process.exitCode=1});
