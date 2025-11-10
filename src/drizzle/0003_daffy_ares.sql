CREATE TYPE "public"."User_Role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "Role" "User_Role" DEFAULT 'user' NOT NULL;