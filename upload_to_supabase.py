# ==============================================================================
# Script to upload all oil images to Supabase Storage bucket 'products'
# Run: python upload_to_supabase.py [OPTIONAL_SERVICE_ROLE_KEY]
# ==============================================================================

import os, sys, urllib.request, mimetypes

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://kqaexwzelmdjyrimqvhu.supabase.co")
SUPABASE_KEY = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "sb_publishable_rm-HO9wbB89_nhRgPW3eMQ_Vsv6GiJ9")

images_dir = os.path.join(os.path.dirname(__file__), "images", "oil-products")

def upload_images():
    print(f"Connecting to Supabase: {SUPABASE_URL}")
    print(f"Checking folder: {images_dir}")

    if not os.path.exists(images_dir):
        print(f"Error: Folder not found: {images_dir}")
        return

    files = [f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))]
    print(f"Found {len(files)} files to upload.")

    success_count = 0
    fail_count = 0

    for filename in files:
        filepath = os.path.join(images_dir, filename)
        mime_type, _ = mimetypes.guess_type(filepath)
        content_type = mime_type or "image/jpeg"

        with open(filepath, "rb") as f:
            file_bytes = f.read()

        # URL encode filename if needed for non-ascii
        from urllib.parse import quote
        safe_filename = quote(filename)
        url = f"{SUPABASE_URL}/storage/v1/object/products/{safe_filename}"

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": content_type,
            "x-upsert": "true"
        }

        req = urllib.request.Request(url, data=file_bytes, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                print(f"✅ Uploaded: {filename}")
                success_count += 1
        except Exception as e:
            msg = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
            print(f"❌ Failed: {filename} -> {msg}")
            fail_count += 1

    print("\n" + "=" * 40)
    print(f"Finished: {success_count} uploaded successfully, {fail_count} failed.")
    if fail_count > 0:
        print("💡 Note: If you received 'Bucket not found' or 'Unauthorized', please run 'supabase_update.sql' in your Supabase SQL Editor first, or provide your Service Role Key.")

if __name__ == "__main__":
    upload_images()
