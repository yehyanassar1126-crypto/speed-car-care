// ==============================================================================
// Script to upload all oil images to Supabase Storage bucket 'products'
// Run: node upload_to_supabase.js [OPTIONAL_SERVICE_ROLE_KEY]
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kqaexwzelmdjyrimqvhu.supabase.co';
const SUPABASE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_rm-HO9wbB89_nhRgPW3eMQ_Vsv6GiJ9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const imagesDir = path.join(__dirname, 'images', 'oil-products');

async function uploadImages() {
    console.log(`Connecting to Supabase: ${SUPABASE_URL}`);
    console.log(`Checking folder: ${imagesDir}`);

    if (!fs.existsSync(imagesDir)) {
        console.error(`Folder not found: ${imagesDir}`);
        return;
    }

    const files = fs.readdirSync(imagesDir);
    console.log(`Found ${files.length} files to upload.`);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const filePath = path.join(imagesDir, file);
        if (!fs.statSync(filePath).isFile()) continue;

        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();
        let contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.webp') contentType = 'image/webp';

        const { data, error } = await supabase.storage
            .from('products')
            .upload(file, fileBuffer, {
                contentType: contentType,
                upsert: true
            });

        if (error) {
            console.error(`❌ Failed: ${file} -> ${error.message}`);
            failCount++;
        } else {
            console.log(`✅ Uploaded: ${file}`);
            successCount++;
        }
    }

    console.log(`\n========================================`);
    console.log(`Finished: ${successCount} uploaded successfully, ${failCount} failed.`);
    if (failCount > 0) {
        console.log(`💡 Note: If you received "AccessDenied" or "Unauthorized", please execute 'supabase_update.sql' in Supabase SQL editor first, or provide your Service Role Key.`);
    }
}

uploadImages();
