# Hardings Auto Garage Quote Builder - PWA Deployment Guide

## Building for Web

To build your app as a static PWA that can be hosted anywhere:

### 1. Export the Web Build

```bash
npx expo export --platform web
```

This will create a `dist` folder with all your static files.

### 2. Test Locally

You can test the build locally using any static server:

```bash
npx serve dist
```

Or with Python:

```bash
cd dist
python -m http.server 8000
```

### 3. Deploy to Hosting Services

#### Netlify
1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder to Netlify
3. Or connect your Git repository and set:
   - Build command: `npx expo export --platform web`
   - Publish directory: `dist`

#### Vercel
1. Sign up at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Run: `vercel --prod`
4. Or connect your Git repository

#### GitHub Pages
1. Push your code to GitHub
2. Go to Settings > Pages
3. Set source to GitHub Actions
4. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx expo export --platform web
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Run: `firebase init hosting`
3. Set public directory to `dist`
4. Run: `firebase deploy`

#### Any Static Host
Upload the contents of the `dist` folder to any static hosting service:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Cloudflare Pages
- Render
- Railway

## PWA Features

Your app is now a Progressive Web App with:

✅ **Installable** - Users can install it on their home screen
✅ **Offline Support** - Service worker caches assets
✅ **Responsive** - Works on all screen sizes
✅ **Fast** - Optimized bundle and caching
✅ **Native Feel** - Standalone display mode

## Custom Domain

After deploying, you can add a custom domain through your hosting provider's dashboard.

## Important Notes

- The WhatsApp sharing feature works on web via `https://wa.me/` links
- PDF generation works on web using expo-print
- All features are web-compatible
- Make sure to test on mobile browsers after deployment

## Environment Variables

If you need environment variables, create a `.env` file and use `EXPO_PUBLIC_` prefix:

```
EXPO_PUBLIC_API_URL=https://your-api.com
```

Access in code: `process.env.EXPO_PUBLIC_API_URL`
