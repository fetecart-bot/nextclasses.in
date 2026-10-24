export function trialIsExpired(student: {account_kind?:string;access_expires_at?:string|null}, now=Date.now()) {
 if (!['trial','monthly'].includes(student.account_kind || '')) return false;
 const expiry=Date.parse(student.access_expires_at || '');
 return !Number.isFinite(expiry) || expiry<=now;
}
