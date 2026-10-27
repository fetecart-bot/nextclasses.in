import TuitionRenewal from './TuitionRenewal';
import TuitionTrialForm from './TuitionTrialForm';
import { useState, useEffect } from 'react';
import { tuitionMonthlyFee } from '../data/tuitionPricing';

export default function SchoolTuition() {
  const [renewalAvailable,setRenewalAvailable] = useState(false);
  const [showRenewal,setShowRenewal] = useState(false);
  const [trialAvailable,setTrialAvailable] = useState(false);
  const [showTrial,setShowTrial] = useState(false);
  useEffect(()=>{let active=true; fetch('/api/student-login').then(r=>r.json()).then(data=>{if(active){setTrialAvailable(data.available===true);setRenewalAvailable(data.renewalAvailable===true);}}).catch(()=>{}); return ()=>{active=false;};},[]);
  const [grade, setGrade] = useState(5);
  const [subject, setSubject] = useState('All offered subjects');
  const subjects = grade <= 10
    ? ['Mathematics', grade === 5 ? 'Environmental Studies' : 'Science', 'English']
    : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
  const monthlyFee = tuitionMonthlyFee(grade);
  const message = `Hello NextClasses, I would like details of CBSE Class ${grade} ${subject} tuition. I understand the monthly plan is ₹${monthlyFee} for all offered subjects after the 30-day free trial. Please share availability and trial details.`;
  return <section id="school-tuition" className="bg-neutral-950 text-white py-12 border-b border-neutral-800">
    <div className="max-w-6xl mx-auto px-5">
      <p className="text-orange-400 font-semibold">CBSE · Classes 5–12</p>
      <h1 className="text-3xl sm:text-5xl font-bold mt-2">CBSE tuition for Classes 5–12</h1>
      <p className="text-neutral-300 mt-3">Tell us what you need help with. One monthly plan includes all offered subjects for your class. Choose a subject below to tell us where you need help first.</p>
      <a href="tel:+918064262009" className="inline-flex mt-4 items-center rounded-xl border border-orange-500/50 px-4 py-3 text-orange-300 hover:bg-orange-500/10">Call Tara for course enquiries: +91 80 6426 2009</a>
      <div className="grid sm:grid-cols-3 gap-4 mt-6 items-end">
        <label className="grid gap-2">Student's class
          <select value={grade} onChange={event => { setShowTrial(false); setShowRenewal(false); setGrade(Number(event.target.value)); setSubject('All offered subjects'); }} className="bg-neutral-900 border border-neutral-600 rounded-xl p-3">
            {[5,6,7,8,9,10,11,12].map(value => <option key={value} value={value}>Class {value}</option>)}
          </select>
        </label>
        <label className="grid gap-2">Subject
          <select value={subject} onChange={event => setSubject(event.target.value)} className="bg-neutral-900 border border-neutral-600 rounded-xl p-3">
            <option>All offered subjects</option>
            {subjects.map(value => <option key={value}>{value}</option>)}
          </select>
        </label>
        <a href={`https://wa.me/918792134951?text=${encodeURIComponent(message)}`} className="text-center bg-orange-500 text-black font-bold p-3 rounded-xl">Enquire about tuition</a>
      </div>
      <div className="mt-5 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4" aria-live="polite">
        <p className="text-2xl font-bold">₹{monthlyFee}<span className="text-base font-normal"> / month after the 30-day free trial</span></p>
        <p className="text-sm text-neutral-300 mt-2">All offered subjects included · Not a per-subject fee · Optional monthly renewal</p>
      </div>
      {trialAvailable && <button type="button" onClick={()=>setShowTrial(true)} className="mt-5 bg-orange-500 text-black font-bold p-4 rounded-xl">Start your 30-day free trial</button>}
      {renewalAvailable && <button type="button" onClick={()=>setShowRenewal(true)} className="ml-3 mt-5 border border-orange-500 text-orange-300 font-bold p-4 rounded-xl">Renew an existing tuition account</button>}
      {renewalAvailable && showRenewal && <TuitionRenewal grade={grade} onClose={()=>setShowRenewal(false)}/>}
      {trialAvailable && showTrial && <TuitionTrialForm grade={grade} onClose={()=>setShowTrial(false)}/>}
      <p className="text-sm text-neutral-400 mt-4">Enquire about availability and trial access. No payment is taken from this enquiry, and there is no automatic charge.</p>
    </div>
  </section>;
}
