---
title: Release gate: checks before every upload and submission
sources: [dev-policy, policy-deadlines, target-api, developer-verification-packages, closed-testing, data-safety, account-deletion, subscriptions, store-listing, app-signing, security-flags, permissions-sensitive, technical-quality]
last_reviewed: 2026-10-30
verified: checked against source text (main items)
---

Run this list before every upload, not just the first. Each item links to a playbook; the playbook cites the source.

## Account and identity
- [ ] Developer identity verified in Play Console (see developer-verification).
- [ ] Each package name is registered, and the signing key certificate is added (see developer-verification).
- [ ] Account type (personal or organization) is known. New personal accounts need the closed-test gate (see closed-testing).

## Build
- [ ] Target API level is at or above the current minimum for new apps and updates (see target-api).
- [ ] Permissions declared in the manifest match what the app uses. Restricted permissions have a declaration or an alternative (see permissions).
- [ ] Upload an Android App Bundle (.aab) with Play App Signing enabled. Confirm the current upload requirement in Play Console (see app-signing).
- [ ] Sensitive screens set FLAG_SECURE where the app promises screenshot blocking, and nothing bypasses it (see security-and-integrity).

## Policy and disclosure
- [ ] Data safety form complete, including account-deletion questions and third-party SDK data (see data-safety-and-privacy).
- [ ] Privacy policy link is live and matches the app.
- [ ] If accounts can be created in the app, deletion is available in-app and on the web (see account-deletion).
- [ ] Subscriptions: terms, price, billing cycle and cancellation are stated in the app (see subscriptions-and-billing).
- [ ] Store listing text and images make no price or promotional claims and no store-performance claims (see store-listing).
- [ ] Ads, if any: disclosed, clearly attributed, dismissible (see ads).
- [ ] AI-generated content declared where asked (see ai-generated-content).

## Quality
- [ ] Pre-launch report and pre-review checks read before rollout (see technical-quality).
- [ ] Vitals (bad-behavior and optimization measures) are inside the thresholds on the technical-quality page, with the 2027 thresholds in view.

## Deadlines
- [ ] Each dated obligation in generated/DEADLINES.md within 60 days has an owner and a date.
