---
title: Security flags, integrity and deceptive behaviour
sources: [security-flags, anti-tamper, play-integrity, deceptive-behavior]
last_reviewed: 2026-10-30
verified: checked against source text (FLAG_SECURE, anti-tamper, Play Integrity, deceptive behaviour)
---

- FLAG_SECURE: apps on Play must respect it. Do not create or facilitate workarounds that bypass the flag settings in other apps.
- REQUIRE_SECURE_ENV: a separate signal to other apps about secure environments; read the source before using.
- Anti-tamper: the customized features are available only to select Play partners. Automatic protection is switched on in Play Console.
- Play Integrity API: lets an app check that requests come from an unmodified app binary installed by Google Play, on a genuine Android device, to reduce abuse.
- Deceptive behaviour: do not impersonate other apps, brands or government entities; do not show ads that mimic system notifications or warnings.
- Changes to device settings need the user's knowledge and consent, and the user must be able to reverse them.
- Do not mislead Play reviewers about the app's purpose or functions.
