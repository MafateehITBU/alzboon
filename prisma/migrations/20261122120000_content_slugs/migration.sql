-- AlterTable
ALTER TABLE "blogs" ADD COLUMN "slug" TEXT;
ALTER TABLE "services" ADD COLUMN "slug" TEXT;

-- Backfill existing rows
UPDATE "blogs" SET "slug" = 'blog-' || replace("id"::text, '-', '') WHERE "slug" IS NULL;
UPDATE "services" SET "slug" = 'service-' || replace("id"::text, '-', '') WHERE "slug" IS NULL;

-- Enforce uniqueness
ALTER TABLE "blogs" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "services" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
