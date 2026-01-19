# Netlify Launch Checklist for Ngurra Pathways

## ✅ Build Verification

- [x] Production build succeeds without errors
- [x] 170 routes generated (static + dynamic)
- [x] TypeScript compilation successful
- [x] No critical warnings

## ✅ Configuration Files

- [x] `netlify.toml` - Multi-context deployment configured
- [x] `manifest.json` - PWA manifest complete
- [x] `robots.txt` - Search engine directives in place
- [x] `sitemap.xml` - Dynamic sitemap generation configured
- [x] `.env.example` - Environment variable documentation

## ✅ Static Assets

- [x] `ngurra-logo.png` - Brand logo present
- [x] `ngurra-og-image.png` - OpenGraph image created
- [x] `favicon.ico` - Favicon placeholder (⚠️ replace with real .ico file)
- [x] `manifest.json` - PWA icons configured
- [x] `sw.js` - Service worker present

## ✅ Security Headers (netlify.toml)

- [x] X-Frame-Options: SAMEORIGIN
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy: camera/microphone enabled for self
- [x] CORS configured for API routes

## ✅ Caching Configuration

- [x] `/_next/static/*` - Immutable, 1 year cache
- [x] `/brand/*` - 24h cache with stale-while-revalidate

## ✅ Redirects

- [x] WWW to non-WWW redirect (301)
- [x] Trailing slash normalization
- [x] Health check endpoints

---

## 🔧 REQUIRED: Environment Variables in Netlify UI

### Core Authentication (CRITICAL)

```
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://ngurrapathways.com.au
```

### API Configuration

```
NEXT_PUBLIC_API_URL=https://api.gimbi.com.au
NEXT_PUBLIC_SOCKET_URL=https://api.gimbi.com.au
```

### Database

```
DATABASE_URL=<your-production-database-url>
```

### Cloudinary (Image uploads)

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
```

### Stripe (Payments)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<pk_live_...>
STRIPE_SECRET_KEY=<sk_live_...>
STRIPE_WEBHOOK_SECRET=<whsec_...>
```

### OAuth Providers (optional)

```
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
MICROSOFT_CLIENT_ID=<from Azure AD>
MICROSOFT_CLIENT_SECRET=<from Azure AD>
```

### Email (one of these)

```
# SendGrid
SENDGRID_API_KEY=<your-api-key>
SENDGRID_FROM=noreply@ngurrapathways.com.au

# OR AWS SES
AWS_SES_REGION=ap-southeast-2
AWS_SES_ACCESS_KEY_ID=<your-key>
AWS_SES_SECRET_ACCESS_KEY=<your-secret>
```

### LiveKit (Video/Audio Rooms)

```
NEXT_PUBLIC_LIVEKIT_URL=<your-livekit-url>
LIVEKIT_API_KEY=<your-api-key>
LIVEKIT_SECRET_KEY=<your-secret-key>
```

### Analytics (optional)

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📋 Pre-Launch Tasks

### Domain Configuration

1. [ ] Add custom domain `ngurrapathways.com.au` in Netlify
2. [ ] Configure DNS records (CNAME or A records)
3. [ ] Enable HTTPS (automatic with Netlify)
4. [ ] Verify SSL certificate is active

### API Backend

1. [ ] Ensure `api.gimbi.com.au` backend is deployed and accessible
2. [ ] Verify database is migrated and seeded
3. [ ] Test API health endpoint: `https://api.gimbi.com.au/health`

### Third-Party Services

1. [ ] Stripe webhook configured for production URL
2. [ ] OAuth redirect URIs updated for production domain
3. [ ] Cloudinary signed uploads configured (if using)
4. [ ] SendGrid/SES sender domain verified

### Testing

1. [ ] Test authentication flow (signin/signup)
2. [ ] Test job search and listing
3. [ ] Test mentorship features
4. [ ] Test payment flow (Stripe)
5. [ ] Test video rooms (LiveKit)
6. [ ] Test mobile responsiveness

---

## 🚨 Known Issues / Action Items

### 1. Replace Favicon

The current `favicon.ico` is a placeholder. Create a proper 16x16 and 32x32 .ico file:

```bash
# Using ImageMagick
convert ngurra-logo.png -resize 32x32 favicon-32.png
convert ngurra-logo.png -resize 16x16 favicon-16.png
convert favicon-16.png favicon-32.png favicon.ico
```

### 2. OG Image

The `ngurra-og-image.png` is currently a copy of the logo. For better social sharing, create a proper 1200x630 OG image with:

- Brand logo
- Tagline text
- Visual design that represents the platform

### 3. Google Verification

Update `layout.tsx` line 78:

```tsx
verification: {
  google: 'your-actual-google-verification-code',
```

### 4. Rate Limiting

The middleware uses in-memory rate limiting which doesn't persist across serverless functions. Consider:

- Upstash Redis for distributed rate limiting
- Netlify Edge Functions with KV store

### 5. CSP Nonce

CSP nonce is generated in middleware. Verify it works correctly with:

- Inline scripts
- Third-party analytics
- Stripe.js

---

## 📊 Deployment Contexts

| Context    | Branch      | URL                           | API                      |
| ---------- | ----------- | ----------------------------- | ------------------------ |
| Production | main/master | ngurrapathways.com.au         | api.gimbi.com.au         |
| Staging    | staging     | staging.ngurrapathways.com.au | api-staging.gimbi.com.au |
| Preview    | PR branches | deploy-preview-\*.netlify.app | api-staging.gimbi.com.au |
| Branch     | feature/\*  | branch-\*.netlify.app         | api-staging.gimbi.com.au |

---

## 🎯 Quick Deploy Steps

1. **Push to GitHub** (if not already)

   ```bash
   git add .
   git commit -m "Prepare for Netlify launch"
   git push origin main
   ```

2. **Connect Netlify**
   - Import project from Git
   - Select repository
   - Build settings auto-detected from `netlify.toml`

3. **Set Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all required variables from list above

4. **Configure Domain**
   - Domain Management > Add custom domain
   - Follow DNS configuration instructions

5. **Deploy**
   - Trigger deploy from Deploys tab
   - Monitor build logs

6. **Verify**
   - Check deployment URL
   - Run through testing checklist
   - Monitor error logs

---

## 📞 Support Resources

- Netlify Docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js/overview/
- Netlify Status: https://www.netlifystatus.com
