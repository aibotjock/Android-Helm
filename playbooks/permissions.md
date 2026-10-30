---
title: Permissions and sensitive APIs
sources: [permissions-sensitive, restricted-permissions, declare-permissions, policy-announcements]
last_reviewed: 2026-10-30
verified: checked against source text (dated changes and media permissions)
---

- Restricted permissions (for example media, contacts, location, SMS and call log) are allowed only for core features where the system picker is not enough. Otherwise use the picker.
- Media permissions for apps targeting Android 13 or later: only if the system photo picker is not enough for core features; custom pickers need a declaration.
- Contacts: apps targeting the newest Android versions must use the contact picker unless broad access is needed for the core feature. Dated changes are listed in generated/DEADLINES.md.
- October 2026 update: local network and manage-contacts permissions are restricted. Apps targeting Android 17 or higher need a Play Console declaration to use local network permission.
- Dated changes to location, SMS and call log, foreground services, AppFunctions and manage-contacts are tracked in data/deadlines.json.
- Use the declare-permissions guidance for any permission that needs a Play Console declaration.
