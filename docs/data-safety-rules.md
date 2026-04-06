# Antigravity Data Safety Directive

This document defines the mandatory safety rules for all data management operations within this production environment. All agents (AI or human) must adhere to these rules strictly to prevent data loss.

## 📜 Core Principles
1. **Never Delete**: No user data (emails, transactions, history) is to be deleted or overwritten.
2. **Safe Updates Only**: Updates must preserve all existing historical data.
3. **Pre-flight Backups**: Every critical operation must be preceded by a data snapshot or backup.
4. **Validation First**: Always verify user existence and record integrity before modification.

## 🚫 Prohibited Actions
- `DELETE` OR `prisma.user.deleteMany()`
- `TRUNCATE` OR `DROP TABLE`
- Database `FLUSH` OR `RESET` commands.
- Overwriting unique identifiers (Email, Member ID).

## ✅ Required Responses
- **For Updates**: "User updated safely. Existing data preserved."
- **For Creation**: "New user created safely."
- **For Blocked Actions**: "Destructive actions are disabled. Operation blocked."

## 🛠️ Enforcement
- All destructive scripts in the `scripts/` directory have been removed.
- Use `node scripts/safe-backup-sync.js` before any migration or logic change.
