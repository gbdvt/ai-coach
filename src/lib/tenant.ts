/** Single-tenant user id until auth returns. Must match rows in `daily_logs` (see schema default). */
export const SINGLE_TENANT_USER_ID =
  process.env.HYBRID_COACH_USER_ID?.trim() ||
  "00000000-0000-0000-0000-000000000001";
