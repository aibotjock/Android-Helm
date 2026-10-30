---
title: Security flags, integrity and deceptive behaviour
sources: [security-flags, anti-tamper, play-integrity, deceptive-behavior]
last_reviewed: 2026-10-30
verified: security-flags checked against source text; the rest summary only
---

- FLAG_SECURE: apps on Play must respect it. Do not create or facilitate workarounds that bypass the flag settings in other apps.
- REQUIRE_SECURE_ENV: a separate signal to other apps about secure environments; read the source before using.
- Anti-tamper and Play Integrity: optional protection; read the source before adding it (summary only in this repository).
- Deceptive behaviour: no UI that imitates system dialogs, no misleading store claims, no hidden functions.
