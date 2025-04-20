# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Lost & Found Portal to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Prepare your application

Run the pre-deployment script to ensure your application is ready for Vercel:

```bash
node scripts/pre-deploy.js
```

### 2. Set up Environment Variables

The following environment variables need to be configured in your Vercel project:

```
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=https://your-production-url.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret

# Email (Choose one of these email services)
# For Nodemailer
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Lost & Found <your_email@gmail.com>

# For Resend (alternative)
RESEND_API_KEY=your_resend_api_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next
5. Add the environment variables listed above
6. Click "Deploy"

### 4. Verify Deployment

After deployment completes:

1. Visit your deployment URL
2. Test key functionality:
   - User authentication
   - Creating lost/found reports
   - Image uploads
   - Admin functionality

### 5. Set up a Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Domains"
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS settings

## Troubleshooting

If you encounter issues with your deployment:

1. Check Vercel logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure MongoDB connection is working
4. Check image uploads to Cloudinary

For persistent issues, review the application logs in the Vercel dashboard or contact support.
