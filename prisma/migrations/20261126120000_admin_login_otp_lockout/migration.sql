-- Additive: progressive password lockout fields + email OTP challenges for admin login.

ALTER TABLE "admin_users" ADD COLUMN "failed_login_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "admin_users" ADD COLUMN "lockout_level" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "admin_users" ADD COLUMN "locked_until" TIMESTAMP(3);

CREATE TABLE "login_otp_challenges" (
    "id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "challenge_token_hash" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_otp_challenges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "login_otp_challenges_challenge_token_hash_key" ON "login_otp_challenges"("challenge_token_hash");
CREATE INDEX "login_otp_challenges_admin_user_id_created_at_idx" ON "login_otp_challenges"("admin_user_id", "created_at");
CREATE INDEX "login_otp_challenges_expires_at_idx" ON "login_otp_challenges"("expires_at");

ALTER TABLE "login_otp_challenges" ADD CONSTRAINT "login_otp_challenges_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
