import PasswordField from './PasswordField';
import {useState, useEffect, type FormEvent} from 'react';
export default function PasswordRecovery({onModeChange}:{onModeChange?:(active:boolean)=>void} = {}) {
 const [token,setToken]=useState(()=>new URLSearchParams(window.location.hash.slice(1)).get('reset') || '');
 const [open,setOpen]=useState(Boolean(token)),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 useEffect(()=>{onModeChange?.(open);},[open,onModeChange]);
 async function submit(e:FormEvent) {
  e.preventDefault(); if(busy)return;
  if(token && password!==confirm){setMessage('Passwords do not match.');return;}
  setBusy(true);setMessage('');
  try {const r=await fetch('/api/student-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(token?{action:'reset-password',token,password}:{action:'request-password-reset',email})});const data=await r.json();setMessage(data.message || data.error || 'Please try again.');if(r.ok && token){setDone(true);setPassword('');setConfirm('');setToken('');window.history.replaceState(null,'',window.location.pathname+window.location.search);}}
  catch{setMessage('Unable to connect. Please try again.');}finally{setBusy(false);}
 }
 if(!open)return <button type="button" onClick={()=>setOpen(true)} className="mt-4 text-orange-300 underline text-sm">Forgot password?</button>;
 return <section aria-label="Password recovery" className="mt-5 border border-neutral-700 rounded-xl p-4 text-sm"><h2 className="font-bold text-orange-300">{done?'Password updated':token?'Choose a new password':'Forgot password?'}</h2>{!done&&<form onSubmit={submit} className="grid gap-3 mt-3">{token?<><PasswordField label="New password" value={password} onChange={setPassword} minLength={12}/><PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} minLength={12}/><p>Use at least 12 characters. This private link expires after 15 minutes.</p></>:<label>Registered parent/student email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className="block w-full p-3 rounded bg-neutral-950 border border-neutral-600"/></label>}<button disabled={busy} className="p-3 rounded bg-orange-500 text-black font-bold disabled:opacity-50">{busy?'Please wait…':token?'Save new password':'Email reset link'}</button></form>}<p role="status" className="mt-3 text-orange-200">{message}</p><button type="button" disabled={busy} onClick={()=>{setOpen(false);setToken('');window.history.replaceState(null,'',window.location.pathname+window.location.search)}} className="mt-3 underline">Back to sign in</button></section>;
}
