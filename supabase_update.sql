-- ==============================================================================
-- SPEED CAR CARE - SUPABASE DATABASE & STORAGE UPDATE
-- رابط المشروع: https://supabase.com/dashboard/project/kqaexwzelmdjyrimqvhu/editor/62298?schema=public
-- ==============================================================================

-- 1. إضافة الأعمدة الناقصة لجدول الزيوت (oil_products) إن لم تكن موجودة
ALTER TABLE oil_products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE oil_products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE oil_products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'oil';

-- 2. إنشاء باكت التخزين (products) في Supabase Storage للصور إن لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- سياسة السماح للجميع بقراءة الصور من الباكت (Public Read)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Public Access for products bucket'
    ) THEN
        CREATE POLICY "Public Access for products bucket" 
        ON storage.objects FOR SELECT 
        USING (bucket_id = 'products');
    END IF;
END $$;

-- سياسة السماح برفع الصور إلى الباكت
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Allow Upload to products bucket'
    ) THEN
        CREATE POLICY "Allow Upload to products bucket" 
        ON storage.objects FOR INSERT 
        WITH CHECK (bucket_id = 'products');
    END IF;
END $$;

-- ==============================================================================
-- 3. تحديث الماركات والصور لمنتجات شيل (Shell)
-- ==============================================================================
UPDATE oil_products SET 
    brand = 'شيل', 
    image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/645635_main.jpg'
WHERE id = 1;

UPDATE oil_products SET 
    brand = 'شيل', 
    image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_5b40dc31-4a0f-4ca3-8df4-257381fe3ee1.jpg'
WHERE id = 2;

UPDATE oil_products SET 
    brand = 'شيل', 
    image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_0a5cad68-7e2c-4a5d-aa81-428106a4040c.jpg'
WHERE id = 3;

UPDATE oil_products SET 
    brand = 'شيل', 
    image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_e42110ca-4c79-4868-ada0-f5b5807222a2.jpg'
WHERE id = 4;

UPDATE oil_products SET 
    brand = 'شيل', 
    image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_28f72945-30db-4fbb-9ba8-95d17ad43a81.jpg'
WHERE id = 5;

-- ==============================================================================
-- 4. تحديث الماركات والصور لمنتجات موبيل (Mobil)
-- ==============================================================================
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_2587c9b9-c8db-4129-add3-cf6a3ad41b80.jpg' WHERE id = 6;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/f132798293151208163058-1.webp' WHERE id = 7;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/1.jpg' WHERE id = 8;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_0df919b9-ac34-4a02-b5d5-2b00ac3373b5.jpg' WHERE id = 9;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_4f4a49cd-a0a9-4a6c-b9ce-81248e356f90.jpg' WHERE id = 10;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_4291826e-8b07-498d-9f39-a5611f27e4bd.png' WHERE id = 11;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_3c630c34-6328-4ae3-893c-4cbdf8774c46.jpg' WHERE id = 12;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_ec2e467d-5616-46fd-874e-8bffdcff6d84.jpg' WHERE id = 13;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_5c9c4fe9-8367-4709-9ce0-2d4d6fc6cc84.jpg' WHERE id = 14;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_45048d2f-2020-4a97-a328-af89e39490c6.jpg' WHERE id = 15;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_4b81f047-0119-4444-893a-5c7c9a5760cd.jpg' WHERE id = 37;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_4b81f047-0119-4444-893a-5c7c9a5760cd.jpg' WHERE id = 38;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_16979631-2a7f-4875-b6ec-06e195ea353c.jpg' WHERE id = 39;
UPDATE oil_products SET brand = 'موبيل', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_ecca3ac3-5984-4ed1-9cf4-addf8ad0a45a.jpg' WHERE id = 40;

-- ==============================================================================
-- 5. تحديث الماركات والصور لمنتجات توتال (Total)
-- ==============================================================================
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235732_0600_92098097.jpg' WHERE id = 16;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235732_0600_92098097.jpg' WHERE id = 17;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235732_0372_92098097.jpg' WHERE id = 18;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235731_0738_92098106.jpg' WHERE id = 19;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235731_0738_92098106.jpg' WHERE id = 20;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235731_0788_92098106.jpg' WHERE id = 21;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/file_00000000f44481f48628af296bbd9bb4.png' WHERE id = 22;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_4b81f047-0119-4444-893a-5c7c9a5760cd.jpg' WHERE id = 41;
UPDATE oil_products SET brand = 'توتال', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_16979631-2a7f-4875-b6ec-06e195ea353c.jpg' WHERE id = 42;

-- ==============================================================================
-- 6. تحديث الماركات والصور لمنتجات مانول (Mannol)
-- ==============================================================================
UPDATE oil_products SET brand = 'مانول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235800_0525_92098048.jpg' WHERE id = 23;
UPDATE oil_products SET brand = 'مانول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235800_0525_92098048.jpg' WHERE id = 24;
UPDATE oil_products SET brand = 'مانول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235800_0298_92098048.jpg' WHERE id = 25;
UPDATE oil_products SET brand = 'مانول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235800_0298_92098048.jpg' WHERE id = 26;
UPDATE oil_products SET brand = 'مانول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235800_0298_92098048.jpg' WHERE id = 27;

-- ==============================================================================
-- 7. تحديث الماركات والصور لمنتجات كاسترول (Castrol)
-- ==============================================================================
UPDATE oil_products SET brand = 'كاسترول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235740_0822_92098075.jpg' WHERE id = 28;
UPDATE oil_products SET brand = 'كاسترول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235741_0252_92098087.jpg' WHERE id = 29;
UPDATE oil_products SET brand = 'كاسترول', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235741_0068_92098087.jpg' WHERE id = 30;

-- ==============================================================================
-- 8. تحديث الماركات والصور لمنتجات التعاون (Misr / Al Taawon)
-- ==============================================================================
UPDATE oil_products SET brand = 'التعاون', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235752_0221.jpg' WHERE id = 31;
UPDATE oil_products SET brand = 'التعاون', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235732_0606_92098097.jpg' WHERE id = 32;
UPDATE oil_products SET brand = 'التعاون', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235751_0720_92098066.jpg' WHERE id = 33;
UPDATE oil_products SET brand = 'التعاون', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235732_0610_92098097.jpg' WHERE id = 34;
UPDATE oil_products SET brand = 'التعاون', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235731_0824_92098106.jpg' WHERE id = 35;
UPDATE oil_products SET brand = 'التعاون', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235732_0387_92098097.jpg' WHERE id = 36;

-- ==============================================================================
-- 9. تحديث سوائل الفرامل والباور (باكم / باور)
-- ==============================================================================
UPDATE oil_products SET brand = 'باكم وباور', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_926e0409-08f8-4a63-a49e-df2100be8c1b.jpg' WHERE id = 43;
UPDATE oil_products SET brand = 'باكم وباور', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_44be9a5e-9af2-4162-b7ca-10786ccc4950.png' WHERE id = 44;
UPDATE oil_products SET brand = 'باكم وباور', image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_926e0409-08f8-4a63-a49e-df2100be8c1b.jpg' WHERE id = 45;

-- ==============================================================================
-- 10. تحديث الماركة وقسم الفلاتر بصور الفلاتر الحقيقية (زيت وهواء)
-- ==============================================================================
-- فلاتر الزيت
UPDATE oil_products SET 
    brand = 'فلاتر', 
    category = 'filter',
    image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/oil_filter_generic.jpg'
WHERE id IN (46, 47, 48, 63, 64, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76);

-- فلاتر الهواء
UPDATE oil_products SET 
    brand = 'فلاتر', 
    category = 'filter',
    image_url = 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/air_filter_generic.jpg'
WHERE id IN (49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 70);

-- ==============================================================================
-- 11. إضافة الأنواع والمنتجات الجديدة الموجودة في ملف الصور وغير مضافة سابقاً
-- ==============================================================================
INSERT INTO oil_products (name, price, stock, max_kilometers, brand, category, image_url)
VALUES 
    -- موتول (Motul)
    ('موتول 8100 إكس-سيس جيل2 5W-40 تخليقي 5 لتر', 2400.00, 10, 10000, 'موتول', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235741_0045_92098087.jpg'),
    ('موتول 300V باور 5W-40 سباقات 2 لتر', 1850.00, 10, 10000, 'موتول', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235741_0287_92098087.jpg'),
    ('موتول 8100 إكس-باور 10W-60 تخليقي 5 لتر', 2600.00, 10, 10000, 'موتول', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235741_0459_92098087.jpg'),
    ('موتول 7100 4T 10W-40 دراجات نارية 1 لتر', 450.00, 10, 3000, 'موتول', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235740_0901_92098075.jpg'),

    -- ليكوي مولي (Liqui Moly)
    ('ليكوي مولي سينثويل هاي تيك 5W-40 تخليقي 4 لتر', 2250.00, 10, 10000, 'ليكوي مولي', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_3d523d53-1249-4aee-9dc1-aa3590ae7f8d.jpg'),

    -- هافولين (Havoline)
    ('هافولين كالتكس 20W-50 معدني 4 لتر', 520.00, 10, 3000, 'هافولين', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235740_0758_92098075.jpg'),

    -- آيسين (AISIN)
    ('آيسين 4T 20W-50 دراجات نارية 1 لتر', 220.00, 10, 3000, 'آيسين', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_93ec4f77-72e9-4460-91f7-f4a4c3238d7b.png'),

    -- منتجات شيل الإضافية (Shell Heavy Duty & 1L)
    ('شيل ريمولا R4 X 15W-40 ديزل شاق 20 لتر', 2850.00, 10, 10000, 'شيل', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235731_0945_92098106.jpg'),
    ('شيل ريمولا R1 50 ديزل شاق 20 لتر', 2200.00, 10, 5000, 'شيل', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235732_0274_92098097.jpg'),
    ('شيل هيليكس أحادي 50 1 لتر', 160.00, 15, 3000, 'شيل', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/shell-monograde-1l.jpg'),
    ('شيل هيليكس متعدد 20W-50 1 لتر', 165.00, 15, 3000, 'شيل', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/shell-multigrade-1l.jpg'),

    -- منتجات موبيل الإضافية
    ('موبيل دلفاك مودرن MX 15W-40 ديزل 5 لتر', 750.00, 10, 5000, 'موبيل', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/delvac-mx-5l.jpg'),
    ('موبيل أحادي X3 50 ديزل 4 لتر', 480.00, 10, 3000, 'موبيل', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/IMG_20261015_235741_0377_92098087.jpg'),

    -- مانول إضافي
    ('مانول أوتوماتيك ديكسرون بلس MN8207 1 لتر', 280.00, 10, 40000, 'مانول', 'oil', 'https://kqaexwzelmdjyrimqvhu.supabase.co/storage/v1/object/public/products/pictures_png_MN8207-1_bdx_front_1200-350x350.png')
ON CONFLICT DO NOTHING;

SELECT 'تم تحديث قاعدة بيانات الزيوت والماركات والصور بنجاح!' AS status;
