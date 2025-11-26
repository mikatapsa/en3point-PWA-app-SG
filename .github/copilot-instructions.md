# en3point PWA (Singapore) – AI Agent Instructions

## Project Overview
**Purpose**: Mobile-first Progressive Web App for elderly care platform (Singapore market). Offline-capable static PWA deployed to AWS S3 + CloudFront.

**Tech Stack**: Vanilla HTML/CSS/JS (no framework), Service Worker API, component-based architecture  
**Deployment**: `s3://en3point-app-sg/PWA-app` via CloudFront distribution `E1H1IRXWA8X8DS`

---

## Architecture & Key Patterns

### Component-Based Structure (DRY Principle)
- **Never duplicate header/nav HTML** – components are fetched and injected at runtime
- **Two placeholders required on every page**:
  ```html
  <div id="header-placeholder"></div>
  <div id="bottom-nav-placeholder"></div>
  ```
- **Load sequence** (critical): `load-components.js` fetches HTML → inserts into DOM → calls `initializeNavigation()` from `app.js`

### Navigation System
- **Data attributes drive routing**:
  - Nav items: `<button class="nav-item" data-nav="home">` (in `components/bottom-nav.html`)
  - Shortcut cards: `<button class="shortcut-card" data-section="journal">` (in page content)
- **Current implementation**: `app.js` lines 11-30 handles clicks via `window.location.href` or displays "coming soon" message
- **Active state**: `.is-active` class added to current nav item

### Service Worker Strategy (Development Mode)
- **Current**: `service-worker.js` uses network-first with no caching (for active development)
- **Production approach** (not yet implemented): Cache-first for shell assets, network-first for dynamic content
- **Version management**: When implementing caching, use `CACHE_NAME="en3point-v1"` pattern and increment on shell changes

---

## Critical Layout Constraints

### 1. Fixed Header & Bottom Nav (Never Scroll)
- **Positioning**: `position: fixed` with `max-width: 480px` and `margin: 0 auto`
- **Z-index**: Both at `z-index: 100` to stay above content
- **Purpose**: Fixed chrome for consistent mobile-app experience

### 2. Safe Area Insets (Notch Devices)
```css
/* Header */
padding-top: calc(0.5rem + env(safe-area-inset-top));

/* Bottom Nav */
padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));

/* Main Content */
margin-top: calc(52px + env(safe-area-inset-top));
margin-bottom: calc(60px + env(safe-area-inset-bottom));
```
**Why**: Prevents content/controls from being clipped by iPhone notch or home indicator

### 3. Bounded Width Pattern
```css
.app-root {
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
}
```
**Purpose**: Consistent mobile-first layout; prevents wide-screen layout issues

### 4. Scrolling Container
- **Only `<main class="app-main">` scrolls** (`overflow-y: auto; -webkit-overflow-scrolling: touch`)
- **Header/nav never scroll** – fixed to viewport edges
- **Body**: `overflow: hidden` to prevent document-level scroll

---

## File Structure & Responsibilities

```
en3point-PWA-app-SG/
├── PWA-app/
│   ├── index.html               # Home page (greeting, mood, talk, grid, status)
│   ├── manifest.json            # PWA manifest (name, icons, theme)
│   ├── service-worker.js        # Dev mode SW (no caching)
│   ├── components/
│   │   ├── header.html          # Logo image + centered title + user button
│   │   └── bottom-nav.html      # 4-item nav: Home/Meetings/Journal/Profile
│   ├── css/
│   │   └── style.css            # Global styles (layout, nav, cards, talk)
│   ├── data/
│   │   ├── shortcuts.json       # Static shortcuts list (help, doctor, weather, news)
│   │   └── user.json            # Static user mock (for greeting)
│   ├── js/
│   │   ├── app.js               # Navigation logic + SW registration
│   │   ├── load-components.js   # Fetch/inject components, call initializeNavigation()
│   │   └── home.js              # Home page: load shortcuts, greeting, mood/talk handlers
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── scripts/
  └── uploadsafe.sh            # Deploy to S3 + invalidate CloudFront
```

---

## Page Scaffold Template (Mandatory)

---

## Page Scaffold Template (Mandatory)

**Every new page must follow this structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>[Page Title] – en3point</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover" />
  <meta name="theme-color" content="#0d47a1" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/[page].css" />
  <!-- Scripts MUST be in head, NOT at end of body -->
  <script src="/js/app.js"></script>
  <script src="/js/load-components.js"></script>
</head>
<body>
  <div class="app-root">
    <!-- Component placeholders - NEVER put actual HTML here -->
    <div id="header-placeholder"></div>
    
    <main class="[page-class]" aria-label="[Descriptive label]">
      <!-- Page-specific content here -->
    </main>
    
    <div id="bottom-nav-placeholder"></div>
  </div>
  
  <!-- Optional page-specific JS loaded last -->
  <script src="/js/[page].js"></script>
</body>
</html>
```

### Critical Notes
- **Scripts in `<head>`**: `app.js` and `load-components.js` MUST load before body renders
- **Component placeholders**: Only empty `<div>` with ID – never duplicate component HTML
- **Per-page CSS**: Create `css/[page].css` for page-specific styles (no inline `<style>` tags)
- **Viewport meta**: `viewport-fit=cover` enables safe-area-inset CSS

---

## Component System

### Current Components
1. **`components/header.html`**:
  - Logo image (`/icons/icon-192.png`)
  - App title: "en3point elderly", centered via absolute positioning
  - User profile button (👤 icon)

2. **`components/bottom-nav.html`**:
   - 4 nav items: Home 🏠, Meetings 📅, Journal 🕒, Profile 👤
   - Uses `data-nav` attributes for routing
   - Home has `is-active` class by default

### How Components Load (load-components.js)
```javascript
async function loadComponent(elementId, componentPath) {
  const response = await fetch(componentPath);
  const html = await response.text();
  document.getElementById(elementId).innerHTML = html;
}

// Loads both, then calls initializeNavigation()
loadComponent('header-placeholder', '/components/header.html');
loadComponent('bottom-nav-placeholder', '/components/bottom-nav.html');
```

### Navigation Wiring (app.js)
```javascript
function initializeNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      if (nav === 'home') window.location.href = '/';
      else setDynamicMessage(`${nav} coming soon...`);
    });
  });
  
  // Shortcut cards in index.html
  document.querySelectorAll('.shortcut-card').forEach(card => {
    card.addEventListener('click', () => {
      const section = card.dataset.section;
      // Update status area (keep discussion responses in #dynamic-content)
      const statusEl = document.getElementById('status-content');
      if (statusEl) statusEl.innerHTML = `<p class="status-placeholder">${section} section coming soon...</p>`;
      else setDynamicMessage(`${section} section coming soon...`);
    });
  });
}
```

### Adding a New Component
1. Create `components/[name].html`
2. Add placeholder `<div id="[name]-placeholder"></div>` in page scaffold
3. Update `loadAllComponents()` in `load-components.js`:
   ```javascript
   await loadComponent('[name]-placeholder', '/components/[name].html');
   ```
4. If component needs offline support (production SW), add to `APP_SHELL` array and bump version

---

## Home Page Anatomy

Order and purpose of sections in `index.html`:

```html
<main class="app-main">
  <!-- 1. Greeting -->
  <h1 id="greeting-text">Good morning, User</h1>
  
  <!-- 2. How are you? label -->
  <p class="how-are-you">How are you?</p>

  <!-- 3. Mood icons -->
  <div class="mood-buttons">
    <button class="mood-button" data-mood="sad">😞</button>
    <button class="mood-button" data-mood="neutral">😐</button>
    <button class="mood-button" data-mood="happy">😊</button>
  </div>

  <!-- 4. Mood response (discussion area) -->
  <section id="dynamic-content" class="dynamic-content" aria-live="polite"></section>

  <!-- 5. Talk to me input + 6. Talk response -->
  <section class="talk-section">
    <textarea id="talk-input"></textarea>
    <button id="talk-send">Send</button>
    <div id="talk-response" class="talk-response" aria-live="polite"></div>
  </section>

  <!-- 7. Shortcut grid -->
  <section id="shortcut-grid" class="shortcut-grid"></section>

  <!-- Status (debug/messages) -->
  <section id="status-content" class="status-content"></section>
</main>
```

Behavior bindings (pure frontend mocks):
- `#greeting-text`: Set by `loadGreeting()` using `/data/user.json` with time-of-day.
- Mood buttons: Call `sendMood(mood)` placeholder and write response to `#dynamic-content`.
- Talk to me: `#talk-input` + `#talk-send` → `sendTalkToMe(text)` placeholder; echoes "do you mean: <text>" into `#talk-response`.
- Shortcuts: `loadShortcuts()` loads `/data/shortcuts.json` (name, icon, color, section) and populates `#shortcut-grid`.
- Status messages: `#status-content` updated by `setStatusMessage()` and grid clicks via `app.js` (not `#dynamic-content`).

Layout notes:
- Centered: greeting section, `.dynamic-content`, `.talk-section`, `.talk-response`.
- Grid items: two-column layout; background colors come from `shortcuts.json`.


## Service Worker & PWA

### Current: Development Mode (No Caching)
```javascript
// service-worker.js
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => fetch('/index.html'))
  );
});
```
- **Behavior**: Always fetches from network; fallback to `/index.html` if offline
- **Purpose**: Fast iteration during development (no cache invalidation needed)

### Future: Production Mode (Not Yet Implemented)
When ready for production caching:
1. Define shell assets:
   ```javascript
   const CACHE_NAME = 'en3point-v1';
   const APP_SHELL = [
     '/',
     '/index.html',
     '/css/style.css',
     '/js/app.js',
     '/js/load-components.js',
     '/components/header.html',
     '/components/bottom-nav.html',
     '/manifest.json',
     '/icons/icon-192.png',
     '/icons/icon-512.png'
   ];
   ```
2. Pre-cache on install:
   ```javascript
   self.addEventListener('install', event => {
     event.waitUntil(
       caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
     );
     self.skipWaiting();
   });
   ```
3. Implement cache-first for shell, network-first for dynamic assets
4. **Bump `CACHE_NAME` to `v2`, `v3`, etc. after shell changes**

### PWA Manifest (`manifest.json`)
```json
{
  "name": "en3point SG",
  "short_name": "en3point",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0d47a1",
  "background_color": "#ffffff",
  "icons": [ ... ]
}
```
- **`display: standalone`**: Hides browser chrome when installed
- **Icons**: Requires 192x192 and 512x512 PNG icons

---

## Styling Guidelines

### Global CSS (`css/style.css`)
- **Reset**: `box-sizing: border-box` on all elements
- **Body**: `overflow: hidden` to prevent document scroll
- **Color scheme**: Blue (`#0d47a1`) primary, gray (`#6b7280`) inactive, light gray bg (`#f3f4f6`)

### Page-Specific CSS
- **Naming**: `css/[page].css` (e.g., `css/journal.css`)
- **No inline styles**: Keep all CSS in external files
- **Specificity**: Use class names like `.journal-entry`, `.meetings-list`

### Common Patterns
```css
/* Shortcut cards (grid on home) */
.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.shortcut-card {
  border-radius: 16px;
  padding: 0.75rem;
  background: #e3f2fd; /* Light blue */
}

/* Dynamic content area */
.dynamic-content {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

/* Status area (below grid) */
.status-content {
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #eef2ff;
  border: 1px dashed #c7d2fe;
  border-radius: 8px;
}

/* Talk to me section */
.talk-section { display:flex; flex-direction:column; gap:0.5rem; }
.talk-input   { min-height:96px; padding:0.75rem; }
.talk-send    { align-self:center; }
```

---

## Deployment to AWS

### Upload Script (`scripts/uploadsafe.sh`)
```bash
#!/bin/bash
BUCKET="en3point-app-sg"
TARGET="PWA-app"
DISTRIBUTIONID="E1H1IRXWA8X8DS"

# Optional: Create timestamped backup
# aws s3 sync s3://$BUCKET/$TARGET s3://$BUCKET/$BACKUP

# Sync local to S3 (--delete removes old files)
aws s3 sync ./PWA-app s3://$BUCKET/$TARGET --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTIONID \
  --paths "/*"
```

### Deployment Checklist
1. **Test locally**: Run `python3 -m http.server 8080` in `PWA-app/` and test in browser
2. **Check service worker**: If using production SW, bump `CACHE_NAME` if shell changed
3. **Run upload script**: `cd scripts && ./uploadsafe.sh`
4. **Wait for CloudFront**: Cache invalidation takes ~5 minutes
5. **Test live**: Visit CloudFront URL and test offline mode (DevTools → Network → Offline)

---

## Current State & Known Issues

### Implemented ✅
- Fixed header + bottom nav with safe-area insets
- Component-based architecture (header, nav)
- Home page structure: Greeting → "How are you?" → Mood icons → Mood response (`#dynamic-content`) → Talk to me → Grid → Status (`#status-content`)
- Dynamic shortcuts loaded from `/data/shortcuts.json` (Help, Doctor, Weather, News)
- Greeting loaded from `/data/user.json` with time-of-day message
- Grid clicks update status (not mood response)
- Development-mode service worker
- PWA manifest for installability
- Responsive 480px max-width layout

### Not Yet Implemented ❌
- **Actual pages**: Meetings, Journal, Profile pages don't exist yet
- **Backend integration**: No API calls (all content is placeholder)
- **Production caching**: Service worker has no offline shell caching
- **User authentication**: Profile button non-functional
- **Talk backend**: `sendMood` / `sendTalkToMe` are placeholders

### Known Issues 🐛
<!-- none specific to header title at the moment -->
- **Emoji icons**: Using Unicode emojis instead of icon font/SVGs (accessibility issue)
- **No error boundaries**: Failed component loads fail silently
- **Missing page-specific CSS**: Adding new pages without CSS causes layout breaks

---

## Development Workflow

### Adding a New Page (e.g., Journal)
1. **Create directory**: `mkdir PWA-app/journal`
2. **Create HTML**: `PWA-app/journal/index.html` (use scaffold template)
3. **Create CSS**: `PWA-app/css/journal.css`
   ```css
   .journal-page {
     /* Page-specific styles */
   }
   ```
4. **Create JS** (optional): `PWA-app/js/journal.js`
5. **Update navigation**: In `app.js`, change:
   ```javascript
   if (nav === 'journey') window.location.href = '/journal/';
   ```
6. **Test locally**: `cd PWA-app && python3 -m http.server 8080`
7. **Deploy**: `./scripts/uploadsafe.sh`

### Modifying Components
1. **Edit component HTML**: e.g., `components/header.html`
2. **Test**: Refresh browser (no build step needed)
3. **If using production SW**: Bump `CACHE_NAME` and add changed file to `APP_SHELL`
4. **Deploy**: Run upload script

### Local Testing
```bash
cd PWA-app
python3 -m http.server 8080
# Visit http://localhost:8080
# Test offline: DevTools → Application → Service Workers → Update/Unregister → Network Offline
```

### Home Data Edits
- Update shortcuts: edit `PWA-app/data/shortcuts.json` (name, icon, color, section)
- Update greeting name: edit `PWA-app/data/user.json`
- Frontend-only mocks: `sendMood()` and `sendTalkToMe()` in `PWA-app/js/home.js`

---

## Common Pitfalls & Solutions

### ❌ Scripts at Bottom of Body
**Problem**: Components don't load, navigation doesn't work  
**Solution**: Keep `app.js` and `load-components.js` in `<head>`

### ❌ Duplicating Component HTML
**Problem**: When updating header/nav, have to change multiple files  
**Solution**: Only use placeholder divs; components load dynamically

### ❌ Forgetting Safe-Area Insets
**Problem**: Content clipped by iPhone notch  
**Solution**: Always use `calc(... + env(safe-area-inset-*))` for fixed elements

### ❌ Page CSS Returns 404
**Problem**: New page has broken layout  
**Solution**: Create corresponding `css/[page].css` file (even if empty)

### ❌ Stale Cache After Deployment
**Problem**: Users see old version after deploy  
**Solution**: CloudFront invalidation runs automatically in upload script

### ❌ Component Fails to Load
**Problem**: Blank header/nav area  
**Solution**: Check browser console; verify component path is correct; ensure fetch succeeds

---

## Future Enhancements (Roadmap)

### Near-Term
- [ ] Implement Journal page with entry list + add new entry form
- [ ] Meetings page with calendar view
- [ ] Profile page with user info + settings
- [ ] Replace emoji icons with SVG icon set (accessibility)

### Mid-Term
- [ ] Backend API integration (fetch agenda, posts, health data)
- [ ] User authentication (JWT tokens)
- [ ] Production service worker with offline shell caching
- [ ] Push notifications for reminders/messages
- [ ] Dark mode support

### Long-Term
- [ ] Offline-first data sync (IndexedDB)
- [ ] Multi-language support (English, Chinese, Tamil)
- [ ] Voice navigation for accessibility
- [ ] Integration with wearable health devices
- [ ] Family member dashboard (separate app/view)

---

## Accessibility Considerations

### Current Issues
- **Emoji icons**: Screen readers announce emojis poorly
  - **Fix**: Use `aria-hidden="true"` on emoji + add `aria-label` to buttons
- **Dynamic content**: Updates not announced
  - **Fix**: `aria-live="polite"` on `#dynamic-content` (already present)
- **Focus management**: No focus trap in modals
  - **Fix**: Implement focus lock when modals open

### Best Practices (Apply When Adding Features)
- Use semantic HTML (`<main>`, `<nav>`, `<header>`)
- Provide `aria-label` for icon-only buttons
- Ensure 4.5:1 contrast ratio (WCAG AA)
- Keyboard navigation for all interactive elements
- Test with screen reader (VoiceOver on iOS)

---

## Key Takeaways for AI Agents

1. **Never inline component HTML** – always use placeholders + dynamic loading
2. **Scripts must be in `<head>`** – component injection happens before body renders
3. **Safe-area insets are mandatory** – all pages must account for notch devices
4. **480px max-width** – constrain all layouts to this mobile breakpoint
5. **Currently in dev mode** – no offline caching active (network-first only)
6. **Deployment is S3 + CloudFront** – use `uploadsafe.sh` script, not manual uploads
7. **No backend yet** – all data is placeholder; API integration is future work

When adding features, prioritize mobile-first responsive design, accessibility, and offline capability (once production SW is enabled). Always test on real devices or browser DevTools mobile emulation before deploying.


