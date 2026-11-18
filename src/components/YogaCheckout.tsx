import { useState, type FormEvent } from 'react';
import PasswordField from './PasswordField';
import { useAuth } from '../context/AuthContext';
import { YOGA_AMOUNT, YOGA_CURRENCY } from '../data/yogaProgramme';
const RECEIPT_KEY='nextclasses_yoga_pending_receipt';
type Receipt={razorpay_payment_id:string;razorpay_order_id:string;razorpay_signature:string};
export default function YogaCheckout({onClose}:{onClose?:()=>void}) {
 const {user}=useAuth();
 const [existing,setExisting]=useState(Boolean(user));
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState('');
 const [identifier,setIdentifier]=useState(user?.username||user?.email||''),[password,setPassword]=useState('');
 const [accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const [receipt,setReceipt]=useState<Receipt|null>(()=>{try{return JSON.parse(localStorage.getItem(RECEIPT_KEY)||'null')}catch{return null}});
 const [confirmed,setConfirmed]=useState<any>(null),[showPassword,setShowPassword]=useState(false);
 async function request(body:any) {
  const response=await fetch('/api/razorpay-payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Payment confirmation unavailable.');return data;
 }
 async function verify(value:Receipt) {
  setReceipt(value);try{localStorage.setItem(RECEIPT_KEY,JSON.stringify(value))}catch{}
  setBusy(true);setMessage('Confirming your payment…');
  try {
   const data=await request({action:'verify-yoga-payment',paymentId:value.razorpay_payment_id,orderId:value.razorpay_order_id,signature:value.razorpay_signature});
   setConfirmed(data);setMessage('Yoga membership confirmed.');setPassword('');setReceipt(null);try{localStorage.removeItem(RECEIPT_KEY)}catch{}
  }catch(error){setMessage(`${error instanceof Error?error.message:'Confirmation pending.'} Payment reference: ${value.razorpay_payment_id}. Do not pay again.`)}finally{setBusy(false)}
 }
 async function pay(event:FormEvent) {
  event.preventDefault();if(busy||receipt||!accepted)return;setBusy(true);setMessage('');
  try {
   const Gateway=(window as any).Razorpay;if(!Gateway)throw new Error('Secure checkout is loading. Please retry shortly.');
   const order=await request({action:'create-yoga-order',mode:existing?'renew':'new',name,email,phone,identifier,password,acceptedTerms:accepted});
   if(order.amount!==YOGA_AMOUNT||order.currency!==YOGA_CURRENCY)throw new Error('Price or currency mismatch. Refresh before paying.');
   const checkout=new Gateway({key:order.keyId,order_id:order.orderId,amount:YOGA_AMOUNT,currency:YOGA_CURRENCY,name:'NextClasses',description:'Yoga: 8 live English classes, videos and notes — one month',image:'/nextclasses-logo-512.png',prefill:existing?{}:{name,email,contact:phone},theme:{color:'#f97316'},modal:{ondismiss:()=>setBusy(false)},handler:verify});
   checkout.on('payment.failed',()=>{setBusy(false);setMessage('Payment was not completed. Check your bank status before trying again.');});checkout.open();
  }catch(error){setBusy(false);setMessage(error instanceof Error?error.message:'Payment unavailable.');}
 }
 return <section aria-label="Yoga enrolment and monthly renewal" className="mt-8 rounded-2xl border border-orange-400/50 bg-neutral-900 p-5 sm:p-7">
  <div className="flex justify-between gap-4"><h3 className="text-xl font-bold text-white">Yoga enrolment · US$500 for one month</h3>{onClose&&<button type="button" disabled={busy} onClick={onClose} className="text-neutral-300 underline">Close</button>}</div>
  <p className="mt-3 text-neutral-300 text-sm">Eight live classes in English with Kavery P P, plus videos and notes. Please agree your timetable and class format with our team before paying. This is a single payment, with optional manual renewal and no automatic charges. Your bank may apply currency conversion or overseas card fees.</p>
  {confirmed?<div role="status" className="mt-5 space-y-3 text-white"><p>Access until {new Date(confirmed.accessUntil).toLocaleDateString('en-GB',{year:'numeric',month:'long',day:'numeric'})}.</p><p className="text-sm">Payment reference: {confirmed.paymentId}</p>{confirmed.account?<><p>Username: <strong>{confirmed.account.username}</strong></p><p>Password: <strong>{showPassword?confirmed.account.password:'••••••••••••'}</strong> <button type="button" onClick={()=>setShowPassword(!showPassword)} className="text-cyan-300 underline">{showPassword?'Hide':'Show'}</button></p><p className="text-sm">Keep these details private. {confirmed.emailSent?'Your login email has also been sent.':'Save these details now; the login email has not been confirmed. Password recovery is available on the sign-in page.'}</p></>:<p>Sign in with your existing NextClasses credentials.</p>}<a href="/student-app?programme=yoga" className="inline-block rounded-xl px-5 py-3 bg-orange-500 text-black font-bold">Open yoga portal</a></div>:
  receipt?<div className="mt-5"><p className="text-orange-200">An existing payment needs confirmation. Verify it before making another payment.</p><button type="button" disabled={busy} onClick={()=>verify(receipt)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-black font-bold">{busy?'Checking…':'Verify existing yoga payment'}</button></div>:
  <form onSubmit={pay} className="mt-5 grid gap-4 max-w-xl">
   <label className="flex gap-3 items-center text-white"><input type="checkbox" checked={existing} onChange={e=>setExisting(e.target.checked)} disabled={busy}/>I already have a NextClasses account (enrol or renew)</label>
   {existing?<><label className="grid gap-2 text-white">Username or account email<input required autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} disabled={busy} className="bg-neutral-950 border border-neutral-600 rounded-xl p-3"/></label><PasswordField label="Existing password" value={password} onChange={setPassword} autoComplete="current-password"/></>:<>
    <label className="grid gap-2 text-white">Your full name<input required maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} disabled={busy} className="bg-neutral-950 border border-neutral-600 rounded-xl p-3"/></label>
    <label className="grid gap-2 text-white">Email for your login<input required type="email" autoComplete="email" maxLength={200} value={email} onChange={e=>setEmail(e.target.value)} disabled={busy} className="bg-neutral-950 border border-neutral-600 rounded-xl p-3"/></label>
    <label className="grid gap-2 text-white">Phone including country code<input required type="tel" autoComplete="tel" placeholder="+1… or +44…" pattern="\+[1-9][0-9]{6,14}" value={phone} onChange={e=>setPhone(e.target.value)} disabled={busy} className="bg-neutral-950 border border-neutral-600 rounded-xl p-3"/></label></>}
   <label className="flex items-start gap-3 text-sm text-neutral-300"><input required type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} disabled={busy} className="mt-1"/><span>I am 18 or older. I have confirmed the class schedule with NextClasses and understand this payment covers one month with eight live classes, videos and notes. Renewal is manual. I have reviewed the <a href="/#terms-and-conditions" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300">terms</a> and <a href="/#refund-policy" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300">refund policy</a>.</span></label>
   <button disabled={busy||!accepted} className="rounded-xl bg-orange-500 text-black font-bold px-5 py-4 disabled:opacity-50">{busy?'Opening secure checkout…':'Pay US$500 via Razorpay'}</button>
  </form>}
  {message&&<p role="status" className="mt-4 text-orange-200 text-sm">{message}</p>}
  <p className="text-xs text-neutral-400 mt-4">Need help? Email support@nextclasses.in or call Tara +91 80 6426 2009. Never share your password or card details with support.</p>
 </section>;
}
