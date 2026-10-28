import {useId, useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';
export default function PasswordField({label,value,onChange,autoComplete='new-password',minLength}:{label:string;value:string;onChange:(value:string)=>void;autoComplete?:string;minLength?:number}) {
 const id=useId();const [visible,setVisible]=useState(false);
 return <div><label htmlFor={id} className="block">{label}</label><div className="relative mt-2"><input id={id} type={visible?'text':'password'} autoComplete={autoComplete} required minLength={minLength} maxLength={128} value={value} onChange={e=>onChange(e.target.value)} className="block w-full p-3 pr-12 rounded-xl bg-neutral-950 border border-neutral-600"/><button type="button" aria-label={`${visible?'Hide':'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={()=>setVisible(v=>!v)} className="absolute right-1 top-1/2 -translate-y-1/2 p-3 text-neutral-300 hover:text-white">{visible?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}</button></div></div>;
}
