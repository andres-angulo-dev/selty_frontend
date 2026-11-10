-- PostGIS must exist before a geometry column. Locally it was enabled by the
-- postgres administrator (the sialty role may not create it); IF NOT EXISTS makes
-- this line a no-op there, and creates it on a fresh database (CI).
-- SRID 4326 (GPS coordinates) written by hand: drizzle-kit 0.31 drops the srid option.
CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint
CREATE TABLE "communes" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"department_code" text NOT NULL,
	"region_code" text NOT NULL,
	"surface_ha" double precision,
	"center" geometry(Point, 4326) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "communes_department_code_idx" ON "communes" USING btree ("department_code");--> statement-breakpoint
CREATE INDEX "communes_region_code_idx" ON "communes" USING btree ("region_code");--> statement-breakpoint
CREATE INDEX "communes_center_gist_idx" ON "communes" USING gist ("center");