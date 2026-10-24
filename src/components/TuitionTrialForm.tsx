import { useState, type FormEvent } from 'react';
export default function TuitionTrialForm({grade,onClose}:{grade:number;onClose:()=>void}) {
 const [email,setEmail]=useState(''),[code,setCode]=useState(''),[password,setPassword]=useState('');
 const [confirmed,setConfirmed]=useState(false),[step,setStep]=useState(1),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[complete,setComplete]=useState(false);
 async function submit(event:FormEvent) {
  event.preventDefault();setBusy(true);setMessage('');
  try {
   const response=await fetch('/api/student-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(step===1?{action:'request-code',email,grade,parentConfirmed:confirmed}:{action:'verify-code',email,code,password})});
   const data=await response.json();if(!response.ok)throw new Error(data.error || 'Please try again.');
   if(step===1){setStep(2);setMessage(data.message);}else{setComplete(true);setPassword('');setMessage(`Your trial is ready until ${new Date(data.account.trialExpiresAt).toLocaleDateString('en-IN')}. Sign in with your email and the password you chose.`);}
  }catch(error){setMessage(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}
 }
 return <div className="mt-6 border border-orange-500 rounded-xl p-5 bg-neutral-900" role="region" aria-label="Parent-managed tuition trial">
  <div className="flex justify-between gap-4"><h3 className="text-xl font-bold">Start a 30-day Class {grade} trial</h3><button type="button" disabled={busy} onClick={onClose}>Close</button></div>
  <p className="text-sm text-neutral-300 mt-2">All offered subjects. Five mentor questions, five voice replies and five short voice recordings per day. Limits reset daily in India. No card or automatic payment. Do not share children's personal details with the mentor.</p>
  {!complete&&<form onSubmit={submit} className="grid gap-4 mt-4 max-w-lg">
   <label className="grid gap-1">Parent or guardian email<input type="email" required maxLength={200} value={email} disabled={step===2||busy} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="p-3 rounded bg-neutral-950 border border-neutral-600"/></label>
   {step===1?<label className="flex gap-2 text-sm"><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>I am 18 or older and am the parent or guardian managing this account.</label>:<>
    <label className="grid gap-1">Six-digit email code<input required inputMode="numeric" pattern="[0-9]{6}" value={code} onChange={e=>setCode(e.target.value)} autoComplete="one-time-code" className="p-3 rounded bg-neutral-950 border border-neutral-600"/></label>
    <label className="grid gap-1">Choose a password (12–128 characters)<input required type="password" minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" className="p-3 rounded bg-neutral-950 border border-neutral-600"/></label>
    <button type="button" disabled={busy} onClick={()=>{setStep(1);setCode('');setMessage('');}} className="text-sm underline">Change email or request a new code</button>
   </>}
   <button disabled={busy} className="bg-orange-500 disabled:opacity-50 text-black rounded-xl p-3 font-bold">{busy?'Please wait…':step===1?'Send verification code':'Activate my free trial'}</button>
  </form>}
  <p role="status" className="mt-3 text-sm text-orange-200">{message}</p>
  {complete&&<a className="inline-block mt-4 underline text-orange-300" href="/student-app">Open student sign in</a>}
 </div>;
}
