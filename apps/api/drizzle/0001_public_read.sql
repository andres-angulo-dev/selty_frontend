CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"category_id" text NOT NULL,
	"is_remote_capable" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"member_since" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_profile_id" uuid NOT NULL,
	"blur_key" text NOT NULL,
	"key_400" text NOT NULL,
	"key_1080" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_size_check" CHECK ("media"."width" > 0 and "media"."height" > 0)
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"display_name_length" integer GENERATED ALWAYS AS (char_length(display_name)) STORED NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"description" text NOT NULL,
	"description_length" integer GENERATED ALWAYS AS (char_length(description)) STORED NOT NULL,
	"services" text[] DEFAULT '{}'::text[] NOT NULL,
	"commune_code" text NOT NULL,
	"location_type" text NOT NULL,
	"avatar_media_id" uuid,
	"cover_media_id" uuid,
	"starting_price" integer,
	"phone" text,
	"show_phone" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_profiles_profile_id_unique" UNIQUE("profile_id"),
	CONSTRAINT "professional_profiles_status_check" CHECK ("professional_profiles"."status" in ('pending', 'validated', 'refused')),
	CONSTRAINT "professional_profiles_location_type_check" CHECK ("professional_profiles"."location_type" in ('fixed', 'mobile', 'both')),
	CONSTRAINT "professional_profiles_starting_price_check" CHECK ("professional_profiles"."starting_price" is null or "professional_profiles"."starting_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "professional_trades" (
	"professional_id" uuid NOT NULL,
	"trade_id" text NOT NULL,
	"position" smallint NOT NULL,
	CONSTRAINT "professional_trades_professional_id_trade_id_pk" PRIMARY KEY("professional_id","trade_id"),
	CONSTRAINT "professional_trades_professional_id_position_unique" UNIQUE("professional_id","position"),
	CONSTRAINT "professional_trades_position_check" CHECK ("professional_trades"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "professional_zones" (
	"id" text NOT NULL,
	"professional_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"commune_code" text,
	"radius_km" integer,
	"department_code" text,
	"region_code" text,
	CONSTRAINT "professional_zones_professional_id_id_pk" PRIMARY KEY("professional_id","id"),
	CONSTRAINT "professional_zones_kind_check" CHECK ("professional_zones"."kind" in ('city', 'department', 'region', 'country')),
	CONSTRAINT "professional_zones_columns_check" CHECK (("professional_zones"."kind" = 'city' and "professional_zones"."commune_code" is not null and "professional_zones"."radius_km" is not null and "professional_zones"."department_code" is null and "professional_zones"."region_code" is null)
            or ("professional_zones"."kind" = 'department' and "professional_zones"."department_code" is not null and "professional_zones"."commune_code" is null and "professional_zones"."radius_km" is null and "professional_zones"."region_code" is null)
            or ("professional_zones"."kind" = 'region' and "professional_zones"."region_code" is not null and "professional_zones"."commune_code" is null and "professional_zones"."radius_km" is null and "professional_zones"."department_code" is null)
            or ("professional_zones"."kind" = 'country' and "professional_zones"."commune_code" is null and "professional_zones"."radius_km" is null and "professional_zones"."department_code" is null and "professional_zones"."region_code" is null)),
	CONSTRAINT "professional_zones_radius_check" CHECK ("professional_zones"."radius_km" is null or "professional_zones"."radius_km" >= 0)
);
--> statement-breakpoint
CREATE TABLE "annonce_media" (
	"annonce_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	CONSTRAINT "annonce_media_annonce_id_position_pk" PRIMARY KEY("annonce_id","position"),
	CONSTRAINT "annonce_media_annonce_id_media_id_unique" UNIQUE("annonce_id","media_id"),
	CONSTRAINT "annonce_media_position_check" CHECK ("annonce_media"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "annonces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid NOT NULL,
	"trade_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"description_length" integer GENERATED ALWAYS AS (char_length(description)) STORED NOT NULL,
	"commune_code" text NOT NULL,
	"price_type" text NOT NULL,
	"price" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "annonces_price_type_check" CHECK ("annonces"."price_type" in ('fixed', 'quote', 'free')),
	CONSTRAINT "annonces_price_check" CHECK (("annonces"."price_type" = 'fixed') = ("annonces"."price" is not null)),
	CONSTRAINT "annonces_price_positive_check" CHECK ("annonces"."price" is null or "annonces"."price" >= 0),
	CONSTRAINT "annonces_title_length_check" CHECK (char_length("annonces"."title") between 5 and 80),
	CONSTRAINT "annonces_description_length_check" CHECK (char_length("annonces"."description") between 20 and 1000)
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_id" uuid NOT NULL,
	"trade_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"description_length" integer GENERATED ALWAYS AS (char_length(description)) STORED NOT NULL,
	"discount" text,
	"conditions" text[] DEFAULT '{}'::text[] NOT NULL,
	"media_id" uuid,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "offers_conditions_check" CHECK ("offers"."conditions" <@ array['free_quote', 'fast_response', 'no_commitment', 'first_session_free']::text[]),
	CONSTRAINT "offers_conditions_count_check" CHECK (cardinality("offers"."conditions") <= 3),
	CONSTRAINT "offers_title_length_check" CHECK (char_length("offers"."title") between 5 and 60),
	CONSTRAINT "offers_description_length_check" CHECK (char_length("offers"."description") between 20 and 1000),
	CONSTRAINT "offers_discount_length_check" CHECK ("offers"."discount" is null or char_length("offers"."discount") <= 30),
	CONSTRAINT "offers_dates_check" CHECK ("offers"."starts_at" is null or "offers"."expires_at" is null or "offers"."starts_at" <= "offers"."expires_at")
);
--> statement-breakpoint
CREATE TABLE "request_media" (
	"request_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	CONSTRAINT "request_media_request_id_position_pk" PRIMARY KEY("request_id","position"),
	CONSTRAINT "request_media_request_id_media_id_unique" UNIQUE("request_id","media_id"),
	CONSTRAINT "request_media_position_check" CHECK ("request_media"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"trade_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"description_length" integer GENERATED ALWAYS AS (char_length(description)) STORED NOT NULL,
	"urgency" text NOT NULL,
	"commune_code" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "requests_urgency_check" CHECK ("requests"."urgency" in ('urgent', 'this_week', 'this_month', 'flexible')),
	CONSTRAINT "requests_status_check" CHECK ("requests"."status" in ('open', 'fulfilled')),
	CONSTRAINT "requests_expires_at_check" CHECK ("requests"."expires_at" > "requests"."created_at")
);
--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_owner_profile_id_profiles_id_fk" FOREIGN KEY ("owner_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_commune_code_communes_code_fk" FOREIGN KEY ("commune_code") REFERENCES "public"."communes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_avatar_media_id_media_id_fk" FOREIGN KEY ("avatar_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_trades" ADD CONSTRAINT "professional_trades_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_trades" ADD CONSTRAINT "professional_trades_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_zones" ADD CONSTRAINT "professional_zones_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_zones" ADD CONSTRAINT "professional_zones_commune_code_communes_code_fk" FOREIGN KEY ("commune_code") REFERENCES "public"."communes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonce_media" ADD CONSTRAINT "annonce_media_annonce_id_annonces_id_fk" FOREIGN KEY ("annonce_id") REFERENCES "public"."annonces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonce_media" ADD CONSTRAINT "annonce_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_commune_code_communes_code_fk" FOREIGN KEY ("commune_code") REFERENCES "public"."communes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_professional_trade_fk" FOREIGN KEY ("professional_id","trade_id") REFERENCES "public"."professional_trades"("professional_id","trade_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_professional_id_professional_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_professional_trade_fk" FOREIGN KEY ("professional_id","trade_id") REFERENCES "public"."professional_trades"("professional_id","trade_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_media" ADD CONSTRAINT "request_media_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_media" ADD CONSTRAINT "request_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_commune_code_communes_code_fk" FOREIGN KEY ("commune_code") REFERENCES "public"."communes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trades_category_id_idx" ON "trades" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "media_owner_profile_id_idx" ON "media" USING btree ("owner_profile_id");--> statement-breakpoint
CREATE INDEX "professional_profiles_commune_code_idx" ON "professional_profiles" USING btree ("commune_code");--> statement-breakpoint
CREATE INDEX "professional_profiles_avatar_media_id_idx" ON "professional_profiles" USING btree ("avatar_media_id") WHERE "professional_profiles"."avatar_media_id" is not null;--> statement-breakpoint
CREATE INDEX "professional_profiles_cover_media_id_idx" ON "professional_profiles" USING btree ("cover_media_id") WHERE "professional_profiles"."cover_media_id" is not null;--> statement-breakpoint
CREATE INDEX "professional_trades_trade_id_idx" ON "professional_trades" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "professional_zones_department_code_idx" ON "professional_zones" USING btree ("department_code");--> statement-breakpoint
CREATE INDEX "professional_zones_region_code_idx" ON "professional_zones" USING btree ("region_code");--> statement-breakpoint
CREATE INDEX "professional_zones_commune_code_idx" ON "professional_zones" USING btree ("commune_code");--> statement-breakpoint
CREATE INDEX "annonce_media_media_id_idx" ON "annonce_media" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "annonces_feed_idx" ON "annonces" USING btree ("created_at" DESC NULLS FIRST,"id" DESC NULLS FIRST) WHERE "annonces"."is_active";--> statement-breakpoint
CREATE INDEX "annonces_commune_feed_idx" ON "annonces" USING btree ("commune_code","created_at" DESC NULLS FIRST,"id" DESC NULLS FIRST) WHERE "annonces"."is_active";--> statement-breakpoint
CREATE INDEX "annonces_professional_id_idx" ON "annonces" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "annonces_trade_id_idx" ON "annonces" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "offers_feed_idx" ON "offers" USING btree ("created_at" DESC NULLS FIRST,"id" DESC NULLS FIRST) WHERE "offers"."is_active";--> statement-breakpoint
CREATE INDEX "offers_professional_feed_idx" ON "offers" USING btree ("professional_id","created_at" DESC NULLS FIRST,"id" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "offers_trade_id_idx" ON "offers" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "offers_media_id_idx" ON "offers" USING btree ("media_id") WHERE "offers"."media_id" is not null;--> statement-breakpoint
CREATE INDEX "request_media_media_id_idx" ON "request_media" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "requests_feed_idx" ON "requests" USING btree ("created_at" DESC NULLS FIRST,"id" DESC NULLS FIRST) WHERE "requests"."status" = 'open';--> statement-breakpoint
CREATE INDEX "requests_commune_feed_idx" ON "requests" USING btree ("commune_code","created_at" DESC NULLS FIRST,"id" DESC NULLS FIRST) WHERE "requests"."status" = 'open';--> statement-breakpoint
CREATE INDEX "requests_author_id_idx" ON "requests" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "requests_trade_id_idx" ON "requests" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "communes_center_geog_gist_idx" ON "communes" USING gist (("center"::geography));