# Approved website direction — 24 October 2026

Keep new enrolment focused on ChatGPT, Claude, CBSE tuition Classes 5–12, Sainik, Navodaya and RMS. Remove remaining courses from new enrolment, preserving purchased course access and enrolment records. Do not infer course popularity from the site's displayed ratings/counts.

CBSE tuition is monthly; the user has not specified a rupee amount. Do not invent a fee or call any paid product free. Higher-secondary tuition should distinguish selected subjects/streams rather than promise every subject.

Approved introductory offer: 30-day free trial containing sample lessons, quizzes and daily limited mentor use, with no automatic payment. Monthly upgrade is optional. Exact daily allowance remains to be determined from costs. A public offer must wait for functioning server-side trial admission, expiry enforcement and usage limits.

Suggested primary copy once implemented:
Start your 30-day free trial
Explore sample lessons, practise with quizzes and ask your AI mentor questions within your daily allowance. Choose your class or course to begin. No automatic payment. Continue with an optional monthly plan after your trial.

## Code audit findings, not yet proven live failures
- Catalogue currently ranks all AI categories before language/exam courses and limits the initial view to nine cards. This may bury courses that visitors came from exam adverts to find.
- Cached custom courses are merged back into defaults; removal must cover stored catalogues and direct course URLs, as well as server checkout validation.
- Checkout requires name, phone and email before a paid gateway; a free trial needs a separate entry rather than passing zero-price courses through the paid order API.
- Existing API validates a maximum of five courses and rejects zero-price courses. Preserve paid verification; build trial access explicitly.
- Need live journey check and conversion-funnel measurements before attributing zero enrolments to a technical payment failure.

## Delivery status
This document records decisions and audit findings only. Catalogue removal, tuition launch and trial admission are not yet implemented or deployed. Supabase explicit server-role grants have been prepared separately; not yet applied live.


## Final tuition pricing confirmed 24 October 2026
All offered subjects are included, not charged separately. Classes 5–7: ₹200/month. Classes 8–9: ₹300/month. Classes 10–12: ₹400/month. First 30 days free; optional monthly renewal with no automatic charge. This supersedes earlier price bands and pending subject-coverage notes. Trial activation and billing remain unimplemented.
