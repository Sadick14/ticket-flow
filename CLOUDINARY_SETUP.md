# 🚀 Cloudinary Setup Guide - 5 Minutes to Production Ready Images!

## Step 1: Create Free Cloudinary Account
1. Go to https://cloudinary.com/users/register_free
2. Sign up with email (free tier: 25GB storage, 25k transformations/month)
3. Verify your email

## Step 2: Get Your Credentials
1. Go to Cloudinary Dashboard
2. Copy these values from the "Product Environment Credentials" section:
   - Cloud Name
   - API Key  
   - API Secret

## Step 3: Add Environment Variables to Railway

In your Railway project dashboard, add these environment variables:

```bash
# Cloudinary (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Other existing variables...
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... etc
```

## Step 4: Deploy and Test
1. Push your code to Railway
2. Railway will automatically redeploy
3. Test image upload - images will now be stored in Cloudinary and load globally!

## ✅ Benefits
- ✅ **Global CDN**: Images load fast worldwide
- ✅ **Automatic Optimization**: WebP conversion, compression
- ✅ **Reliable**: 99.9% uptime SLA
- ✅ **Free Tier**: Perfect for launching
- ✅ **Scalable**: Upgrade as you grow

## 🔧 Local Development
For local development, images still save to `/public/uploads/` folder.
Cloudinary only activates in production automatically.

## 🚨 Important Notes
- Don't commit your API secrets to Git
- Use Railway's environment variables interface
- Test after deployment to ensure images work
