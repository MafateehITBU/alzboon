-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_ADMINS', 'MANAGE_BLOGS', 'MANAGE_SERVICES', 'MANAGE_CONTACT_ENQUIRIES', 'MANAGE_WEBSITE_SETTINGS');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('JORDAN', 'UAE');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'X');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'AR');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "profile_media_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_permissions" (
    "admin_user_id" UUID NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("admin_user_id","permission")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "successful" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "logo_media_id" UUID,
    "contact_email" TEXT NOT NULL,
    "business_hours_en" TEXT NOT NULL,
    "business_hours_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" UUID NOT NULL,
    "website_settings_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "label" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "website_settings_id" TEXT NOT NULL,
    "text_en" TEXT NOT NULL,
    "text_ar" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_locations" (
    "id" UUID NOT NULL,
    "website_settings_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "map_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "website_settings_id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("website_settings_id","platform")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo_media_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "author_name" TEXT NOT NULL,
    "published_on" DATE NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured_media_id" UUID NOT NULL,
    "attachment_media_id" UUID,
    "attachment_display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_translations" (
    "blog_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "document" JSONB NOT NULL,

    CONSTRAINT "blog_translations_pkey" PRIMARY KEY ("blog_id","locale")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "hero_media_id" UUID NOT NULL,
    "practice_area_media_id" UUID NOT NULL,
    "category_label" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_translations" (
    "service_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "hero_title" TEXT NOT NULL,
    "hero_description" TEXT NOT NULL,
    "overview_title" TEXT NOT NULL,
    "overview_description" TEXT NOT NULL,

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("service_id","locale")
);

-- CreateTable
CREATE TABLE "practice_areas" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "practice_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_area_translations" (
    "practice_area_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "practice_area_translations_pkey" PRIMARY KEY ("practice_area_id","locale")
);

-- CreateTable
CREATE TABLE "benefits" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_translations" (
    "benefit_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "benefit_translations_pkey" PRIMARY KEY ("benefit_id","locale")
);

-- CreateTable
CREATE TABLE "contact_enquiries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "service_id" UUID,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "visibility" "MediaVisibility" NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_profile_media_id_idx" ON "admin_users"("profile_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_admin_user_id_idx" ON "sessions"("admin_user_id");

-- CreateIndex
CREATE INDEX "login_attempts_identifier_created_at_idx" ON "login_attempts"("identifier", "created_at");

-- CreateIndex
CREATE INDEX "website_settings_logo_media_id_idx" ON "website_settings"("logo_media_id");

-- CreateIndex
CREATE INDEX "phone_numbers_website_settings_id_idx" ON "phone_numbers"("website_settings_id");

-- CreateIndex
CREATE INDEX "addresses_website_settings_id_idx" ON "addresses"("website_settings_id");

-- CreateIndex
CREATE INDEX "map_locations_website_settings_id_idx" ON "map_locations"("website_settings_id");

-- CreateIndex
CREATE INDEX "partners_logo_media_id_idx" ON "partners"("logo_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blogs_category_id_idx" ON "blogs"("category_id");

-- CreateIndex
CREATE INDEX "blogs_featured_media_id_idx" ON "blogs"("featured_media_id");

-- CreateIndex
CREATE INDEX "blogs_attachment_media_id_idx" ON "blogs"("attachment_media_id");

-- CreateIndex
CREATE INDEX "services_hero_media_id_idx" ON "services"("hero_media_id");

-- CreateIndex
CREATE INDEX "services_practice_area_media_id_idx" ON "services"("practice_area_media_id");

-- CreateIndex
CREATE INDEX "practice_areas_service_id_idx" ON "practice_areas"("service_id");

-- CreateIndex
CREATE INDEX "benefits_service_id_idx" ON "benefits"("service_id");

-- CreateIndex
CREATE INDEX "contact_enquiries_service_id_idx" ON "contact_enquiries"("service_id");

-- CreateIndex
CREATE INDEX "contact_enquiries_status_idx" ON "contact_enquiries"("status");

-- CreateIndex
CREATE INDEX "contact_enquiries_created_at_idx" ON "contact_enquiries"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_key_key" ON "media_assets"("storage_key");

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_profile_media_id_fkey" FOREIGN KEY ("profile_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_settings" ADD CONSTRAINT "website_settings_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_website_settings_id_fkey" FOREIGN KEY ("website_settings_id") REFERENCES "website_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_website_settings_id_fkey" FOREIGN KEY ("website_settings_id") REFERENCES "website_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_locations" ADD CONSTRAINT "map_locations_website_settings_id_fkey" FOREIGN KEY ("website_settings_id") REFERENCES "website_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_website_settings_id_fkey" FOREIGN KEY ("website_settings_id") REFERENCES "website_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_featured_media_id_fkey" FOREIGN KEY ("featured_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_attachment_media_id_fkey" FOREIGN KEY ("attachment_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_translations" ADD CONSTRAINT "blog_translations_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_hero_media_id_fkey" FOREIGN KEY ("hero_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_practice_area_media_id_fkey" FOREIGN KEY ("practice_area_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_areas" ADD CONSTRAINT "practice_areas_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_area_translations" ADD CONSTRAINT "practice_area_translations_practice_area_id_fkey" FOREIGN KEY ("practice_area_id") REFERENCES "practice_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefits" ADD CONSTRAINT "benefits_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_translations" ADD CONSTRAINT "benefit_translations_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "benefits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_enquiries" ADD CONSTRAINT "contact_enquiries_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

