-- Russian and English product text; the existing columns keep the Uzbek.
ALTER TABLE "Product" ADD COLUMN "translations" JSONB;
