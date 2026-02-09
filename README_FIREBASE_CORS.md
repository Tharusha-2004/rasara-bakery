# Fixing Firebase CORS and Network Errors

## 1. CORS Error (Firebase Storage)
The explicit CORS error (`Access to XMLHttpRequest ... blocked by CORS policy`) indicates that your Firebase Storage bucket is not configured to allow requests from your local development environment (`http://localhost:3000`).

I have created a `cors.json` file in the project root. You need to apply this configuration to your Firebase Storage bucket.

**Option A: Using gsutil (Google Cloud SDK)**
If you have `gsutil` installed and authenticated:
```bash
gsutil cors set cors.json gs://rasarabakery-a7847.firebasestorage.app
```

**Option B: Google Cloud Console**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project `rasarabakery-a7847`.
3. Activate Cloud Shell (top right terminal icon).
4. Create the cors.json file in the cloud shell:
   ```bash
   echo '[{"origin": ["*"],"method": ["GET", "HEAD", "PUT", "POST", "DELETE"],"responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],"maxAgeSeconds": 3600}]' > cors.json
   ```
5. Run the gsutil command:
   ```bash
   gsutil cors set cors.json gs://rasarabakery-a7847.firebasestorage.app
   ```

## 2. ERR_BLOCKED_BY_CLIENT (Firestore/Storage)
The `ERR_BLOCKED_BY_CLIENT` error usually means a browser extension (like AdBlock, uBlock Origin, Privacy Badger, or Brave Shields) is checking the network requests and blocking them because they look like tracking/analytics calls.

**Solution:**
1. Disable your ad-blocker for `localhost:3000`.
2. If using Brave browser, turn off "Shields" for this site.
3. Check if any other privacy extensions are active.
