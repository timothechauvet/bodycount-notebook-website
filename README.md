# My Body Count Tracker — High-Converting Static Landing Page

> A mobile-first static landing page for **My Body Count Tracker** (`ASIN: B0GWC43WN4`) on Amazon. Designed for high-conversion paid traffic (Meta Ads, TikTok, Google Ads) with sub-500ms initial paint performance, native Meta Pixel integration, interactive 3D hardcover mockup, and automated GitHub Actions deployment.

---

## 🚀 Key Highlights & What Was Updated

1. **Working 3D Hardcover Mockup**:
   - Built with pure GPU-accelerated CSS 3D solid geometry (Spine, Layered Page Edges, Front Cover with gold foil embossing, and Back Cover with barcode).
   - **Interactive 360° Drag & Spin**: Click & drag with a mouse or swipe on mobile viewports to inspect the book in 3D.
   - **Interactive "Peek Inside" Toggle**: The front cover rotates open at -155° revealing the authentic interior encounter spread!
   - **360° Auto-Spin & Reset Controls**: Quick toolbar buttons to auto-rotate or snap back to the hero angle.

2. **Streamlined, High-Converting Copy with Lucide Icons**:
   - Installed **Lucide Icons** (`https://unpkg.com/lucide@latest`) for clean, modern, scannable visual cues across all cards, badges, and features.
   - Eliminated text clutter while keeping the essential conversion hooks:
     - **Hero**: Hook headline, 4.9/5 star badge, and primary Amazon CTA.
     - **The Core Problem**: 2-sentence contrast between chaotic phone notes apps and intentional physical logging, paired with a visual comparison table.
     - **The 5 Interior Tools**: Name & Vibe logging, Love-o-Meter (1–4 flames), Repeat Tally, Safety Checklist, and Tear-Off Corner.
     - **3 Use Cases**: Private & Offline, Dating App Cleanser, Legendary Gag Gift.
     - **Discreet Packaging Guarantee**: Directly addresses privacy concerns.
     - **FAQ**: Native accessible accordion.
     - **Sticky Mobile Bottom Bar**: Appears automatically via `IntersectionObserver` when scrolling past the hero.

3. **Automated GitHub Actions for GitHub Pages**:
   - Ready-to-use `.github/workflows/deploy.yml` workflow that automatically builds and deploys to GitHub Pages whenever you push to `main`.

---

## 📦 Automated GitHub Pages Deployment

We've pre-configured `.github/workflows/deploy.yml`. To activate automatic deployments:

1. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: launch body count tracker landing page with 3D mockup and actions"
   git branch -M main
   git remote add origin https://github.com/<your-username>/bodycount-notebook-website.git
   git push -u origin main
   ```

2. **Configure GitHub Repository Settings**:
   - Go to your repo on GitHub: **Settings** &rarr; **Pages**.
   - Under **Build and deployment**:
     - Select **Source**: `GitHub Actions`.
   - On every `git push origin main`, the GitHub Actions workflow will automatically deploy your live site!

---

## 💻 How to Run Locally

You can run the site locally using any standard static server:

### Option 1: Python 3
```bash
cd /path/to/bodycount-notebook-website
python3 -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000).

### Option 2: Node.js / npx serve
```bash
npx serve .
```

---

## 📊 Conversion Tracking Setup

1. **Meta Pixel**:
   - In `index.html` (line 45), replace `YOUR_PIXEL_ID` with your Meta Pixel ID.
   - When users click any Amazon CTA, `main.js` automatically fires:
     ```javascript
     fbq('track', 'InitiateCheckout', {
       content_name: 'Body Count Tracker',
       currency: 'USD',
       value: 16.99
     });
     ```
2. **UTM Parameter Preservation**:
   - Any query parameters on the landing page (`utm_source`, `utm_medium`, `tag`, etc.) are automatically appended to the Amazon outbound link.
