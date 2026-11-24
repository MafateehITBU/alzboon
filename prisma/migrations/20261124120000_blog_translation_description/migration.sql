-- Additive only: existing blog rows and translations stay intact.
ALTER TABLE "blog_translations" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
