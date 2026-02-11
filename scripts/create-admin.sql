-- Production Admin User Creation Script
-- Execute this SQL against your production PostgreSQL database

-- PART 1: Clean up existing admin user (if any)
DELETE FROM "User" WHERE email = 'admin@letsearnify.com';

-- PART 2: Insert admin user with confirmed credentials
-- Email: admin@letsearnify.com
-- Password: Admin@123
-- Bcrypt Hash (10 rounds): $2b$10$6IvlUkKxtcfRUW2ohT863eadZLYXGQkMPT3IInbtnWF6JVbmZ8.l.

INSERT INTO "User" (
  id,
  "memberId",
  email,
  name,
  password,
  role,
  tier,
  "tierStatus",
  "isActiveMember",
  "emailVerified",
  "referralCode",
  "arnBalance",
  "activeMembers",
  "totalDeposit",
  "totalIncome",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '0000001',
  'admin@letsearnify.com',
  'System Administrator',
  '$2b$10$6IvlUkKxtcfRUW2ohT863eadZLYXGQkMPT3IInbtnWF6JVbmZ8.l.',
  'ADMIN',
  'EMERALD',
  'CURRENT',
  true,
  NOW(),
  'ADMIN001',
  0,
  0,
  0,
  0,
  NOW(),
  NOW()
);

-- PART 3: Verify insertion
SELECT 
  id,
  email,
  name,
  role,
  tier,
  "isActiveMember",
  "emailVerified" IS NOT NULL as "emailVerified"
FROM "User"
WHERE email = 'admin@letsearnify.com';

-- Expected output:
-- email: admin@letsearnify.com
-- role: ADMIN
-- tier: EMERALD
-- isActiveMember: true
-- emailVerified: true
