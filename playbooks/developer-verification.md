---
title: Developer verification: identity and package registration
sources: [developer-verification-packages, developer-verification-identity, developer-verification-register, app-signing]
last_reviewed: 2026-10-30
verified: checked against source text (deadline and registration steps)
---

**What it is.** Google requires Play developers to verify their identity, and to register each package name with the public certificate of its signing key. The deadline was 30 September 2026. Packages not registered by then are removed from Play.

**What to do for a new app**
1. Confirm the developer identity is verified in Play Console (Developer account, then About). The legal name and address come from the payments profile.
2. Register the package name in the Android developer verification section.
3. For a new package name, add the public key certificate from the app's signing key (SHA-256 fingerprint). For an existing package name, the rules differ; read the source.
4. Keep identity data current. It becomes the app's official developer identity.

**Watch for:** check the registration guidance before changing the signing key, because the key's certificate is what gets registered.
