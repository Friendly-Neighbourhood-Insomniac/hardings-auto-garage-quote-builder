# Deployment Guide for Netlify

## Current Issues Fixed

### 1. ✅ Netlify Configuration
- Created `netlify.toml` with proper build settings
- Added SPA routing support via redirects
- Configured caching headers for optimal performance

### 2. ✅ Image Loading for PDFs
- Implemented multi-fallback approach for logo fetching
- Added CORS proxy fallbacks
- Improved error handling and logging

### 3. ✅ Service Worker
- Updated to handle dynamic routes properly
- Improved caching strategy for production
- Better error handling

### 4. ✅ Build Configuration
- SPA redirect rules in `public/_redirects`
- Proper asset caching

## Netlify Deployment Steps

### Option 1: Connect GitHub Repository (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and select your repository
   - Netlify will auto-detect the `netlify.toml` settings:
     - Build command: `npx expo export --platform web`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Wait for deployment** (usually 2-5 minutes)

### Option 2: Manual Deployment

1. **Build locally**:
   ```bash
   npx expo export --platform web
   ```

2. **Deploy the dist folder**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder to Netlify

## Post-Deployment Checklist

After deployment, verify:

- ✅ **Home page loads** - Check main quote builder interface
- ✅ **Logo displays** - Verify logo appears in preview
- ✅ **PDF generation works** - Create a test quote and download PDF
- ✅ **Logo appears in PDF** - Open the downloaded PDF and verify logo is visible
- ✅ **WhatsApp sharing works** - Test the WhatsApp share button
- ✅ **Mobile responsiveness** - Test on mobile device
- ✅ **Console logs** - Open browser DevTools and check for errors

## Troubleshooting

### Logo not showing in PDF?
Check the browser console for errors. The app will try 3 methods:
1. Direct fetch from R2
2. CORS proxy (corsproxy.io)
3. Alternative proxy (allorigins.win)

If all fail, the PDF will attempt to use the direct URL (which may not work due to CORS).

### Build fails on Netlify?
- Ensure `netlify.toml` is in the root directory
- Check build logs for specific errors
- Verify all dependencies are in `package.json`

### 404 errors on page refresh?
- Verify `public/_redirects` file exists
- Check that `netlify.toml` redirects are configured

### PDF generation errors?
- Check browser console for detailed error messages
- Verify the logo URL is accessible
- Test locally first: `npx serve dist`

## Environment Configuration

If you need environment variables:

1. In Netlify dashboard: Site settings → Environment variables
2. Add variables with `EXPO_PUBLIC_` prefix
3. Redeploy the site

## Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

## Performance Optimization

The configuration includes:
- Asset caching (1 year)
- Service worker for offline support
- Optimized bundle sizes
- Static file compression

## Support

If issues persist:
1. Check Netlify build logs
2. Review browser console errors
3. Test the build locally before deploying
4. Verify all URLs are accessible (especially the logo URL)
