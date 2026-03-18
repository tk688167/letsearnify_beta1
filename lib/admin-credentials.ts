/**
 * ============================================================
 *  ADMIN PORTAL CREDENTIALS — DO NOT MODIFY OR DELETE
 * ============================================================
 *
 *  These credentials are hardcoded here intentionally.
 *  Admin authentication is completely SEPARATE from the
 *  regular user system and does NOT use the database.
 *
 *  To update the admin password:
 *   1. Change ADMIN_PASSWORD below
 *   2. Restart the dev server
 *   That's it — no DB migrations, no seed scripts needed.
 *
 *  ⚠️  Never remove this file or rename these exports.
 *      Seeding scripts and DB updates CANNOT affect this.
 * ============================================================
 */

export const ADMIN_CREDENTIALS = {
  email: "admin@letsearnify.com",
  password: "Admin@Secure2025",
} as const;

/** Synthetic admin user object returned on successful bypass login */
export const ADMIN_USER_OBJECT = {
  id: "super-admin-id",
  email: ADMIN_CREDENTIALS.email,
  name: "Super Admin",
  role: "ADMIN" as const,
  image: null,
  memberId: "000001",
  isActiveMember: true,
  totalDeposit: 5000.0,
  emailVerified: new Date("2024-01-01"),
  referralCode: "SUPER-ADMIN",
  arnBalance: 1000,
  tier: "EMERALD" as const,
  tierStatus: "CURRENT" as const,
};
