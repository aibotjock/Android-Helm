# Google Play dated obligations

Generated 2026-10-30. Dates come from the sources listed in each row. "Approximate" means the source gives a month, not a day.

| Date | Status | Obligation | Source | Note |
|---|---|---|---|---|
| 2023-11-13 | passed | Personal developer accounts created after this date must run a closed test with at least 12 testers opted in for 14 days before applying for production | closed-testing | Ongoing requirement. Accounts created before this date are not covered. |
| 2026-08-31 | passed | New apps and app updates must target Android 16 (API level 36) or higher | target-api | Our app targets API 37 (checked 2026-10-30). |
| 2026-09-30 | passed | All Play packages must be registered for Android developer verification; unregistered apps are removed from Play | developer-verification-packages | Passed. New packages need the developer identity verified and the signing key certificate registered before the first upload. |
| 2026-10-29 | passed | Policy update effective: Local Network Permission and Manage Contacts Permission restrictions; developers have at least 30 days to comply | policy-announcements | Our app declares neither permission (checked 2026-10-30). |
| 2026-11-01 | within 60 days | Extension date for requests to update target API level, as stated on the target API page | target-api | Only relevant to apps still on an older target. Ours is not. |
| 2026-11-28 (approx.) | within 60 days | End of the minimum 30-day compliance window for the 2026-10-29 update (calculated) | policy-announcements | Calculated as 30 days after 2026-10-29; the page says "at least 30 days". |
| 2027-01-27 | upcoming | Changes take effect for location, SMS and call log, foreground-service (geofencing) and contacts permission policies | permissions-sensitive | Our app declares only internet and biometric permissions (checked 2026-10-30). |
| 2027-02-01 (approx.) | upcoming | Bad-behavior and optimization thresholds begin (page says "from February 2027") | technical-quality | The day is not stated; 1 February is a planning placeholder. |
| 2027-04-01 (approx.) | upcoming | Apps must support zero-tap sign-in restore credentials (page says "from April 2027") | technical-quality | The day is not stated; 1 April is a planning placeholder. |
| 2027-04-14 | upcoming | AppFunctions API requirements take effect | permissions-sensitive |  |
| 2027-08-25 | upcoming | Manage Contacts permission restrictions take effect | permissions-sensitive |  |
