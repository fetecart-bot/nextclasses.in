import assert from 'node:assert/strict';
import handler, { validateLesson } from '../api/daily-materials-cron.ts';
process.env.ADMIN_API_KEY='test-admin';process.env.OPENAI_API_KEY='test-ai';process.env.SUPABASE_URL='https://database.example';process.env.SUPABASE_SECRET_KEY='test-db';
let aiCalls=0,writes=0,published=false,invalid=false,complete=false,existingDraft=false;
const lesson={title:'Articulation: finish your words',focus:'Clear articulation and intentional pauses',lesson:Array(3).fill('Teach the specific technique, give an actual worked speech example, and explain why each change makes the spoken message easier to understand. '.repeat(3)),practice:['Record a sixty-second speech and listen for unclear endings.','Repeat the same speech with two deliberate pauses.','Ask a listener to repeat the single main point you intended.'],answers:['The listener should identify your main point without a prompt.','Finish final consonants clearly without exaggerated pronunciation.','Pauses should separate ideas, rather than interrupt every word.']};
globalThis.fetch=async(input:any,init:any={})=>{
 const url=String(input);
 if(url.endsWith('/v1/responses')){aiCalls++;const body=JSON.parse(init.body);assert.equal(body.store,false);assert.ok(body.input.includes('Public Speaking'));return new Response(JSON.stringify({output_text:JSON.stringify(invalid?{...lesson,lesson:['Review notes.']}:lesson)}));}
 if(url.includes('/enrollments?'))return new Response(JSON.stringify([{course_id:'course-public-speaking-articulation'}]));
 if(url.includes('select=course_id,status,generated_by'))return new Response(JSON.stringify(published?[{course_id:'course-public-speaking-articulation',status:'published'}]:existingDraft?[{course_id:'course-public-speaking-articulation',status:'draft',generated_by:'legacy'}]:[]));
 if(url.includes('select=title'))return new Response(JSON.stringify(complete?Array.from({length:30},(_,i)=>({title:`Lesson ${i}`,status:'published'})):[{title:'Yesterday’s lesson'}]));
 if(url.includes('select=id,status'))return new Response('[]');
 if(init.method==='POST'||init.method==='PATCH'){writes++;assert.equal(JSON.parse(init.body).status,'draft');return new Response('');}
 throw new Error(`Unexpected request: ${url}`);
};
async function request(key?:string){let code=0,data:any;const res:any={status(c:number){code=c;return this},json(d:any){data=d;return this}};await handler({method:'POST',headers:{'x-admin-key':key}},res);return{code,data};}
assert.equal((await request()).code,401);assert.equal(aiCalls,0);
assert.equal((await request('test-admin')).data.drafts,1);assert.equal(writes,1);
published=true;assert.equal((await request('test-admin')).data.drafts,0);assert.equal(aiCalls,1);assert.equal(writes,1);
published=false;existingDraft=true;assert.equal((await request('test-admin')).data.drafts,0);assert.equal(aiCalls,1);assert.equal(writes,1);existingDraft=false;
complete=true;assert.equal((await request('test-admin')).data.drafts,0);assert.equal(aiCalls,1);
complete=false;invalid=true;assert.equal((await request('test-admin')).code,503);assert.equal(writes,1);
assert.throws(()=>validateLesson({title:'Generic',focus:'Study',lesson:['Review your notes']}));
console.log('PASS: generation requires admin/scheduler authorization, only enrolled courses generated, teacher review retained, published material preserved, incomplete generation never saved');
