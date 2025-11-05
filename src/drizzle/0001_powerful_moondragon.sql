CREATE TABLE "reset_password" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"User_Id" uuid NOT NULL,
	"Otp" varchar(10) NOT NULL,
	"Expires_At" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "Password" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "reset_password" ADD CONSTRAINT "reset_password_User_Id_users_id_fk" FOREIGN KEY ("User_Id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;