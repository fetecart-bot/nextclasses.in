# Tuition rollout — 24 October 2026

The server-access, trial-access and tuition-monthly migrations are applied to nextclasses-production with owner approval. Trial and monthly database transaction tests passed and rolled back their test records. Application checks: 14 tests passed, TypeScript and production build passed.

Trial registration and monthly renewal remain controlled by NEXTCLASSES_TRIAL_ENABLED and NEXTCLASSES_TUITION_PAYMENTS_ENABLED. Both default off. Enable only after the database checkpoint. Verify a controlled registration using an adult owner address before advertising trials. Real email delivery and an end-to-end live payment have not been tested. Do not charge anyone for a test without approval.

Existing password hashing uses CREDENTIAL_SECRET with RAZORPAY_KEY_SECRET fallback. Production already uses the fallback; do not introduce a different secret or change it without a password migration. Existing paid accounts retain their course assignments and credentials.

Monthly renewal is implemented as a captured, verified one-off Razorpay payment. It extends access by one calendar month, is idempotent by payment/order, and never creates replacement credentials or a recurring mandate. Prices: classes 5–7 ₹200, 8–9 ₹300, 10–12 ₹400.

Trial request responses do not disclose whether an email already has an account. Mail codes expire after 10 minutes with resend/attempt limits and a global 100-email daily budget. Trial/monthly accounts have five question calls, five speech calls and five transcription calls per India day. Provider attempts count even if a provider fails. Downloaded materials cannot be remotely revoked; online services enforce expiry.

Rollback: disable the two feature flags to stop new registration/renewal. Keep additive tables and columns; do not drop student or payment records. Google Play remains on hold.
