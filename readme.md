# Kumar Music – Frontend Environment Variables Guide (Vite)

## Overview

This document explains all **frontend environment variables** used in the Kumar Music web application built with **Vite**.

These variables control:
- Google authentication
- API connectivity
- Public asset access
- SEO metadata
- Social media previews

**Audience**
- Client
- Frontend Developer
- DevOps Engineer
- SEO Manager

**Important**
All variables prefixed with `VITE_` are **publicly exposed** to the browser by design.  
Never store secrets here.

---

## 1. Google OAuth (Frontend)

### VITE_GOOGLE_CLIENT_ID

**Purpose**  
Used by the frontend to initiate Google OAuth login.

This value is safe to expose and **required for Google Sign-In UI**.

**Provided by**  
Google Cloud Console

---

### How to Get Google Client ID

1. Go to https://console.cloud.google.com
2. Select or create a project
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth Client ID**
5. Application type: **Web**
6. Add authorized JavaScript origins:
   - `https://kumarmusic.com`
   - `http://localhost:5173` (for development)
7. Create and copy **Client ID**

**Example**
```env
VITE_GOOGLE_CLIENT_ID=xyzzz
````

---

## 2. API Communication

### VITE_API_BASE_URL

**Purpose**
Defines the base URL for all backend API requests from the frontend.

The frontend builds API calls like:

```
${VITE_API_BASE_URL}/auth/login
${VITE_API_BASE_URL}/tracks
```

**Provided by**
Developer / DevOps

---

### Environment Usage

**Development**

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

**Production**

```env
VITE_API_BASE_URL=https://api.kumarmusic.com/api
```

**Rules**

* Must always end with `/api`
* Must match backend deployment
* Must support CORS from frontend domain

---

## 3. Public Asset Base URL (AWS S3 / CDN)

### VITE_S3_PUBLIC_BASE_URL

**Purpose**
Base URL for accessing publicly available assets such as:

* Audio previews
* Cover images
* Artwork
* Static media

Frontend constructs URLs dynamically:

```
${VITE_S3_PUBLIC_BASE_URL}/covers/song.jpg
${VITE_S3_PUBLIC_BASE_URL}/audio/preview.mp3
```

**Provided by**
DevOps / AWS / CDN setup

---

### Example Sources

* AWS S3 public bucket
* CloudFront distribution
* Any CDN

**Example**

```env
VITE_S3_PUBLIC_BASE_URL=https://cdn.kumarmusic.com
```

**Important**

* This must be publicly accessible
* No authentication is used here
* Do not use private S3 URLs

---

## 4. SEO Configuration (Frontend Controlled)

These variables control **search engine visibility** and **social media previews**.

They are injected into:

* `<title>`
* `<meta name="description">`
* Open Graph tags
* Canonical URLs

---

### VITE_SEO_TITLE

**Purpose**
Primary title used across the website and search engines.

**SEO Impact**

* Appears in Google search results
* Appears in browser tab title
* Strong ranking signal

**Example**

```env
VITE_SEO_TITLE="Kumar Music — Premium DJ Remixes, Bollywood EDM & 320Kbps Downloads"
```

---

### VITE_SEO_DESCRIPTION

**Purpose**
Meta description for search engines and social platforms.

**SEO Impact**

* Influences click-through rate
* Displayed in Google search snippets

**Example**

```env
VITE_SEO_DESCRIPTION="Professional DJ remixes, Bollywood EDM, and exclusive original productions by Kumar. Stream or download high-quality 320 Kbps audio instantly."
```

---

### VITE_SITE_URL

**Purpose**
Defines the canonical website URL.

Used for:

* SEO canonical tags
* Open Graph URLs
* Sitemap generation
* Social sharing consistency

**Example**

```env
VITE_SITE_URL="https://kumarmusic.com"
```

**Rules**

* Must be HTTPS in production
* Must not end with `/`

---

### VITE_OG_IMAGE_URL

**Purpose**
Image used when links are shared on:

* WhatsApp
* Instagram
* Facebook
* Twitter
* LinkedIn

**Technical Requirements**

* Recommended size: `1200x630`
* Format: PNG or JPG
* Must be publicly accessible

**Example**

```env
VITE_OG_IMAGE_URL="https://kumarmusic.com/og-image.png"
```

---

## 5. Sample `.env` File (Vite Frontend)

```env
VITE_GOOGLE_CLIENT_ID=xyzzz
VITE_S3_PUBLIC_BASE_URL=xyzzz
VITE_API_BASE_URL=http://localhost:4000/api

VITE_SEO_TITLE="Kumar Music — Premium DJ Remixes, Bollywood EDM & 320Kbps Downloads"
VITE_SEO_DESCRIPTION="Professional DJ remixes, Bollywood EDM, and exclusive original productions by Kumar. Stream or download high-quality 320 Kbps audio instantly."
VITE_SITE_URL="https://kumarmusic.com"
VITE_OG_IMAGE_URL="https://kumarmusic.com/og-image.png"
```

---
