import assert from 'node:assert/strict';
import mentor from '../api/course-doubt.ts';
import { passwordHash } from '../api/_supabase.ts';
process.env.SUPABASE_URL='https://database.example';process.env.SUPABASE_SECRET_KEY='test';process.env.CREDENTIAL_SECRET='test';process.env.OPENAI_API_KEY='test';
let speechCalls=0;
globalThis.fetch=async (input:any,init:any) => {
 const url=String(input);
 if(url.includes('/students?')) return new Response(JSON.stringify([{id:'student-test',active:true,password_hash:passwordHash('correct')} ]));
 if(url.includes('/enrollments?')) return new Response(JSON.stringify(url.includes('course-public-speaking-articulation') ? [{course_id:'course-public-speaking-articulation',course_title:'Public Speaking'}] : []));
 if(url.endsWith('/audio/transcriptions')) { speechCalls++;assert.ok(init.body instanceof FormData);assert.equal(init.body.get('model'),'gpt-4o-mini-transcribe');assert.equal((init.body.get('file') as File).name,'question.mp4');return new Response(JSON.stringify({text:'What is articulation?'})); }
 throw new Error('Unexpected upstream request');
};
async function request(body:any) {let status=0,data:any;const res:any={status(c:number){status=c;return this},json(b:any){data=b;return this}};await mentor({method:'POST',body},res);return {status,data};}
assert.equal((await request({question:'test'})).status,401);
const base={identifier:'nc_Mixed',password:'correct',courseId:'course-public-speaking-articulation',action:'transcribe',audioBase64:Buffer.alloc(1000).toString('base64'),mimeType:'audio/mp4',language:'en'};
assert.equal((await request({...base,courseId:'course-aissee-sainik-6'})).status,403);assert.equal(speechCalls,0);
const valid=await request(base);assert.equal(valid.status,200);assert.equal(valid.data.transcript,'What is articulation?');assert.equal(speechCalls,1);
assert.equal((await request({...base,audioBase64:'x'.repeat(1500001)})).status,400);assert.equal(speechCalls,1);
console.log('PASS: anonymous blocked, wrong course blocked, mobile mp4 transcription, oversized recording blocked');

const tts=(await import('../api/voice-receptionist/tts.ts')).default;
let ttsStatus=0;
const ttsResponse:any={status(c:number){ttsStatus=c;return this},json(){return this}};
await tts({method:'GET',query:{text:'test'}},ttsResponse);assert.equal(ttsStatus,405);
await tts({method:'POST',body:{text:'test'}},ttsResponse);assert.equal(ttsStatus,401);
console.log('PASS: natural voice requires signed-in course access; query URL speech disabled');
