---
description: Safely regenerate Prisma client by stopping dev server first
---

1. Stop the dev server to release file locks
   // turbo
2. npx kill-port 3000

3. Regenerate Prisma Client
   // turbo
4. npx prisma generate

5. Push schema changes to DB
   // turbo
6. npx prisma db push

7. Restart dev server
   // turbo
8. npm run dev
