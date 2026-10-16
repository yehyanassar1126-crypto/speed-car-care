-- ============================================================
-- Speed Car Care - تحديث قاعدة البيانات - المنتجات الجديدة
-- تاريخ: 2026-10-16
-- ============================================================
-- ⚠️ ملاحظة: شغل الكود ده في Supabase SQL Editor
-- ============================================================

-- إضافة أعمدة جديدة لو مش موجودة
ALTER TABLE oil_products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE oil_products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '';
ALTER TABLE oil_products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'oil';

-- ============================================================
-- تحديث الماركات للمنتجات الحالية (1-76)
-- ============================================================

-- شيل (Shell) - IDs 1-5
UPDATE oil_products SET brand = 'شيل', category = 'oil', image_url = 'images/oil-products/645635_main.jpg' WHERE id = 1;
UPDATE oil_products SET brand = 'شيل', category = 'oil', image_url = 'images/oil-products/IMG_bc38b4cf-0798-4b3b-bb4c-5246a4f9293b.jpg' WHERE id = 2;
UPDATE oil_products SET brand = 'شيل', category = 'oil', image_url = 'images/oil-products/IMG_0a5cad68-7e2c-4a5d-aa81-428106a4040c.jpg' WHERE id = 3;
UPDATE oil_products SET brand = 'شيل', category = 'oil', image_url = 'images/oil-products/IMG_e42110ca-4c79-4868-ada0-f5b5807222a2.jpg' WHERE id = 4;
UPDATE oil_products SET brand = 'شيل', category = 'oil', image_url = 'images/oil-products/IMG_28f72945-30db-4fbb-9ba8-95d17ad43a81.jpg' WHERE id = 5;

-- موبيل (Mobil) - IDs 6-15, 37-40
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_2587c9b9-c8db-4129-add3-cf6a3ad41b80.jpg' WHERE id = 6;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/f132798293151208163058-1.webp' WHERE id = 7;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/1.jpg' WHERE id = 8;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_0df919b9-ac34-4a02-b5d5-2b00ac3373b5.jpg' WHERE id = 9;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_4f4a49cd-a0a9-4a6c-b9ce-81248e356f90.jpg' WHERE id = 10;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_4291826e-8b07-498d-9f39-a5611f27e4bd.png' WHERE id = 11;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_3c630c34-6328-4ae3-893c-4cbdf8774c46.jpg' WHERE id = 12;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_ec2e467d-5616-46fd-874e-8bffdcff6d84.jpg' WHERE id = 13;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_5c9c4fe9-8367-4709-9ce0-2d4d6fc6cc84.jpg' WHERE id = 14;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235751_0832_92098066.jpg' WHERE id = 15;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_354a3a7a-a045-433a-87c0-23364f26032e.jpg' WHERE id = 37;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_4b81f047-0119-4444-893a-5c7c9a5760cd.jpg' WHERE id = 38;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_16979631-2a7f-4875-b6ec-06e195ea353c.jpg' WHERE id = 39;
UPDATE oil_products SET brand = 'موبيل', category = 'oil', image_url = 'images/oil-products/IMG_ecca3ac3-5984-4ed1-9cf4-addf8ad0a45a.jpg' WHERE id = 40;

-- توتال (Total) - IDs 16-22, 41-42
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235732_0600_92098097.jpg' WHERE id = 16;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235732_0600_92098097.jpg' WHERE id = 17;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235732_0372_92098097.jpg' WHERE id = 18;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235731_0738_92098106.jpg' WHERE id = 19;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235731_0738_92098106.jpg' WHERE id = 20;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235731_0788_92098106.jpg' WHERE id = 21;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/file_00000000f44481f48628af296bbd9bb4.png' WHERE id = 22;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_b3ea1bbc-1a9c-40ae-97b2-75168f712fac.jpg' WHERE id = 41;
UPDATE oil_products SET brand = 'توتال', category = 'oil', image_url = 'images/oil-products/IMG_b3ea1bbc-1a9c-40ae-97b2-75168f712fac.jpg' WHERE id = 42;

-- مانول (Mannol) - IDs 23-27
UPDATE oil_products SET brand = 'مانول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235800_0525_92098048.jpg' WHERE id = 23;
UPDATE oil_products SET brand = 'مانول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235800_0525_92098048.jpg' WHERE id = 24;
UPDATE oil_products SET brand = 'مانول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235800_0298_92098048.jpg' WHERE id = 25;
UPDATE oil_products SET brand = 'مانول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235800_0298_92098048.jpg' WHERE id = 26;
UPDATE oil_products SET brand = 'مانول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235800_0298_92098048.jpg' WHERE id = 27;

-- كاسترول (Castrol) - IDs 28-30
UPDATE oil_products SET brand = 'كاسترول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235740_0822_92098075.jpg' WHERE id = 28;
UPDATE oil_products SET brand = 'كاسترول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235741_0252_92098087.jpg' WHERE id = 29;
UPDATE oil_products SET brand = 'كاسترول', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235741_0068_92098087.jpg' WHERE id = 30;

-- التعاون (CPC/Misr) - IDs 31-36
UPDATE oil_products SET brand = 'التعاون', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235752_0221.jpg' WHERE id = 31;
UPDATE oil_products SET brand = 'التعاون', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235732_0606_92098097.jpg' WHERE id = 32;
UPDATE oil_products SET brand = 'التعاون', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235751_0720_92098066.jpg' WHERE id = 33;
UPDATE oil_products SET brand = 'التعاون', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235732_0610_92098097.jpg' WHERE id = 34;
UPDATE oil_products SET brand = 'التعاون', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235731_0824_92098106.jpg' WHERE id = 35;
UPDATE oil_products SET brand = 'التعاون', category = 'oil', image_url = 'images/oil-products/IMG_20261015_235732_0387_92098097.jpg' WHERE id = 36;

-- باكم وباور - IDs 43-45
UPDATE oil_products SET brand = 'باكم وباور', category = 'oil', image_url = 'images/oil-products/bendix_brake_fluid_small.jpg' WHERE id = 43;
UPDATE oil_products SET brand = 'باكم وباور', category = 'oil', image_url = 'images/oil-products/pictures_png_MN8207-1_bdx_front_1200-350x350.png' WHERE id = 44;
UPDATE oil_products SET brand = 'باكم وباور', category = 'oil', image_url = 'images/oil-products/bendix_brake_fluid_big.jpg' WHERE id = 45;

-- فلاتر - IDs 46-76
UPDATE oil_products SET brand = 'فلاتر', category = 'filter', image_url = 'images/oil-products/oil_filter_generic.jpg' WHERE id IN (46,47,48,63,64,65,66,67,68,69,71,72,73,74,75,76);
UPDATE oil_products SET brand = 'فلاتر', category = 'filter', image_url = 'images/oil-products/air_filter_generic.jpg' WHERE id IN (49,50,51,52,53,54,55,56,57,58,59,60,61,62,70);

-- ============================================================
-- إضافة المنتجات الجديدة (IDs 77-92)
-- ============================================================

-- شيل إضافي (Shell HX5 Plus + Rimula)
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(77, 'شيل هيليكس HX5 بلس ٤لتر', 520, 15, 7000, 'شيل', 'oil', 'images/oil-products/IMG_5b40dc31-4a0f-4ca3-8df4-257381fe3ee1.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(78, 'شيل ريمولا R4 X ١٥-٤٠ ٦لتر ديزل', 650, 10, 10000, 'شيل', 'oil', 'images/oil-products/IMG_20261015_235731_0945_92098106.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(79, 'شيل ريمولا R1 SAE-50 ٥لتر ديزل', 550, 10, 8000, 'شيل', 'oil', 'images/oil-products/IMG_20261015_235732_0274_92098097.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- هافولين (Havoline / Caltex)
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(80, 'هافولين ٢٠-٥٠ ٤لتر', 350, 15, 5000, 'هافولين', 'oil', 'images/oil-products/IMG_20261015_235740_0758_92098075.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- ليكوي مولي (Liqui Moly)
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(81, 'ليكوي مولي موليجين ٥-٤٠ ١لتر', 280, 20, 10000, 'ليكوي مولي', 'oil', 'images/oil-products/IMG_3d523d53-1249-4aee-9dc1-aa3590ae7f8d.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- موتول (Motul)
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(82, 'موتول 8100 باور ٥-٥٠ ٥لتر', 1200, 8, 15000, 'موتول', 'oil', 'images/oil-products/IMG_20261015_235741_0287_92098087.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(83, 'موتول 8100 اكس باور ١٠-٦٠ ٥لتر', 1400, 5, 15000, 'موتول', 'oil', 'images/oil-products/IMG_20261015_235741_0459_92098087.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(84, 'موتول 8100 اكس سيس جين٢ ٥-٤٠ ٥لتر', 1100, 10, 12000, 'موتول', 'oil', 'images/oil-products/IMG_20261015_235741_0045_92098087.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(85, 'موتول 7100 للموتوسيكل ١٠-٤٠ ١لتر', 350, 15, 3000, 'موتول', 'oil', 'images/oil-products/IMG_20261015_235740_0901_92098075.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- آيسين (Aisin)
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(86, 'آيسين للموتوسيكل ٢٠-٥٠ ١لتر', 120, 20, 2000, 'آيسين', 'oil', 'images/oil-products/IMG_93ec4f77-72e9-4460-91f7-f4a4c3238d7b.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- موبيل دلفاك (Mobil Delvac) - إضافي
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(87, 'موبيل دلفاك MX ٢٠-٥٠ ٥لتر', 480, 12, 8000, 'موبيل', 'oil', 'images/oil-products/delvac-mx-5l.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(88, 'موبيل دلفاك ليجند ١٣٥٠ ٥لتر', 520, 10, 10000, 'موبيل', 'oil', 'images/oil-products/IMG_45048d2f-2020-4a97-a328-af89e39490c6.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(89, 'موبيل X3 مونوجريد SAE50 ٥لتر', 400, 10, 5000, 'موبيل', 'oil', 'images/oil-products/IMG_20261015_235741_0377_92098087.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- هانز (Hanz ATF)
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(90, 'هانز ATF سوبر فلويد ١لتر', 100, 25, 0, 'هانز', 'oil', 'images/oil-products/IMG_926e0409-08f8-4a63-a49e-df2100be8c1b.jpg')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- مانول ديكسرون (Mannol Dexron)
INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(91, 'مانول ديكسرون II ١لتر', 120, 15, 0, 'مانول', 'oil', 'images/oil-products/IMG_44be9a5e-9af2-4162-b7ca-10786ccc4950.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

INSERT INTO oil_products (id, name, price, stock, max_kilometers, brand, category, image_url) VALUES
(92, 'مانول ديكسرون VI ١لتر', 150, 15, 0, 'مانول', 'oil', 'images/oil-products/pictures_png_MN8207-1_bdx_front_1200-350x350.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, brand = EXCLUDED.brand, image_url = EXCLUDED.image_url;

-- ============================================================
-- ✅ خلاص! شغل الكود ده في Supabase SQL Editor
-- المنتجات الجديدة: 77-92 (16 منتج)
-- الماركات الجديدة: هافولين، ليكوي مولي، موتول، آيسين، هانز
-- ============================================================
