CREATE TABLE "product_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"method_id" uuid NOT NULL,
	"traffic_contribution" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_methods_product_id_method_id_unique" UNIQUE("product_id","method_id"),
	CONSTRAINT "product_methods_contribution_check" CHECK ("product_methods"."traffic_contribution" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"creator" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"chariow_url" text DEFAULT '' NOT NULL,
	"traffic_score" integer DEFAULT 0 NOT NULL,
	"sales_estimate" integer DEFAULT 0 NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"spotted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_category_check" CHECK ("products"."category" IN ('ebook', 'formation', 'logiciel', 'template', 'coaching', 'bundle', 'audio', 'video', 'design', 'autre')),
	CONSTRAINT "products_traffic_score_check" CHECK ("products"."traffic_score" BETWEEN 0 AND 100),
	CONSTRAINT "products_rating_check" CHECK ("products"."rating" BETWEEN 0 AND 5)
);
--> statement-breakpoint
CREATE TABLE "sales_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"icon" text DEFAULT 'TrendingUp' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_methods_name_unique" UNIQUE("name"),
	CONSTRAINT "sales_methods_category_check" CHECK ("sales_methods"."category" IN ('paid', 'organic', 'email', 'partnership', 'webinar', 'affiliate', 'social'))
);
--> statement-breakpoint
ALTER TABLE "product_methods" ADD CONSTRAINT "product_methods_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_methods" ADD CONSTRAINT "product_methods_method_id_sales_methods_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."sales_methods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pm_product_id" ON "product_methods" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_pm_method_id" ON "product_methods" USING btree ("method_id");--> statement-breakpoint
CREATE INDEX "idx_products_traffic_score" ON "products" USING btree ("traffic_score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_products_spotted_at" ON "products" USING btree ("spotted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_products_user_id" ON "products" USING btree ("user_id");