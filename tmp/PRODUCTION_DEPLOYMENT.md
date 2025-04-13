# Production Deployment Instructions

## Pre-deployment Checklist

1. ✅ Cleanup script has been run to remove unnecessary files
2. ✅ Production environment variables have been configured in `.env.production`
3. ☐ Strong passwords and secrets have been set
4. ☐ MongoDB connection string has been verified
5. ☐ Cloudinary credentials have been set
6. ☐ Email configuration has been verified

## Deployment Steps

### 1. Set up environment

- Rename `.env.production` to `.env` on your production server
- Make sure all environment variables are properly set
- Ensure `NODE_ENV=production` is set in your hosting environment

### 2. Install dependencies

```bash
npm install --production
```

### 3. Build the project

```bash
npm run build
```

### 4. Start the server

For Node.js environments:
```bash
npm start
```

For Vercel, Netlify, or similar platforms, follow platform-specific deployment instructions.

## Security Best Practices

- Use HTTPS for all traffic
- Set up proper authentication for admin access
- Regularly update passwords and rotate API keys
- Implement rate limiting for API endpoints
- Enable proper CORS settings
- Keep MongoDB and other services updated

## Monitoring and Maintenance

- Set up application monitoring
- Configure error logging
- Implement regular database backups
- Schedule dependency updates

## Troubleshooting

If you encounter MongoDB connection issues:
1. Verify that the MongoDB URI format is correct
2. Check that the IP address of your server is whitelisted in MongoDB Atlas
3. Ensure the database user has the correct permissions

For other issues, check the application logs.
