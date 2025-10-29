CREATE TYPE "public"."Gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"FirstName" varchar(255) NOT NULL,
	"LastName" varchar(255),
	"Email" varchar(255) NOT NULL,
	"Gender" "Gender" NOT NULL,
	"Password" varchar(16) NOT NULL,
	"ProfileImage" varchar
);
