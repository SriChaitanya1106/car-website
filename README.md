# NOCTIS — Electric Brand Scrollytelling Experience

A premium, minimal, single-page scrollytelling website for **NOCTIS**, a fictional luxury electric vehicle brand. 

> *Mood: A city in total blackout at night where the car's light is the only light in the world. Quiet, expensive, and precise.*

---

## ⚡ Tech Stack & Principles

- **Zero Frameworks & Libraries:** Pure HTML5, CSS3, and vanilla JavaScript (no React, GSAP, Lenis, Vite, Tailwind, or npm dependencies).
- **Canvas-Driven Scrollytelling:** Image sequences rendered exclusively on high-performance `<canvas>` elements scaled by `devicePixelRatio` (capped at 2), never swapping `<img>` tags or using `<video>`.
- **Responsive Sequences:** Automatic switching between desktop 1600px (quality 78) and mobile 960px (quality 72) WebP sequences.
- **Strict Aesthetic System:**
  - Flat solid tones (`#07080A`, `#121418`, `#EDEAE4`, `#CFE3FF`, `#E1251B`) and 1px hairlines.
  - Zero gradients, zero glassmorphism/blur, and zero drop shadows.
  - Variable Google Fonts: **Archivo** (expanded width axis), **Inter**, and **JetBrains Mono**.

---

## 🏎️ Key Features

1. **Section 1 — Hero Scrollytelling (600vh):**
   - 600-frame joined continuous sequence rendered on canvas.
   - Text chapters revealed line by line in empty sky.
   - Left-edge telemetry HUD (Velocity `000`–`118 KM/H`, Distance `0.0`–`4.2 KM`, and Index counter).
   - Progressive blackout fade in the final 5% of scroll.

2. **Section 2 — Statement (100vh):**
   - Scroll-driven word-by-word opacity reveal (`0.15` to `1.0`).

3. **Section 3 — Structural Dismantle (350vh):**
   - 200-frame exploded view sequence.
   - Interactive 1px hairline callout indicators for Body monocoque, Battery pack, Axial-flux drive motors, and Single-line light bar.

4. **Section 4 — Model Lineup Accordion (100vh):**
   - Five models: **GT-E**, **S**, **X**, **R**, and **ONE**.
   - Hover / focus-activated horizontal accordion (switches to vertical cards on mobile).
   - Debounced hover, ARIA states, keyboard arrow navigation, and flat color swatches.

5. **Section 5 — Reserve & Footer (100vh):**
   - Minimalist allocation reservation with xenon outline button, active tick, and brand directory.

6. **Global Sensory Details:**
   - **Custom Headlight Cursor:** Xenon dot & hairline ring following with lerp `0.18`, morphing into an illuminated light bar with contextual labels (`VIEW`, `RESERVE`, `OPEN`, `CONFIGURE`).
   - **Film Grain:** Monochromatic offscreen noise shifted randomly ~8 times per second.
   - **Preloader:** Centered mono counter and expanding xenon hairline.
   - **Accessibility:** Full `prefers-reduced-motion` static fallbacks and keyboard navigation.

---

## 🚀 Running Locally

Serve from any static web server:

```powershell
# Python
python -m http.server 8080

# Or Node.js
npx serve .
```

Then visit `http://localhost:8080`.

---

## 📁 Repository Structure

```
├── assets/
│   ├── cars/               # Lineup WebP studio images (GT-E, S, X, R, ONE)
│   └── frames/
│       ├── hero/           # Desktop hero sequence (600 frames, 1600px)
│       ├── hero-mobile/    # Mobile hero sequence (600 frames, 960px)
│       ├── dismantle/      # Desktop dismantle sequence (200 frames, 1600px)
│       └── dismantle-mobile/# Mobile dismantle sequence (200 frames, 960px)
├── config.js               # Centralized layout, timing, coordinates & frame counts
├── index.html              # Semantic structure
├── styles.css              # Custom properties & design system
├── main.js                 # Scrollytelling engine, frame loader & interactions
└── convert_frames.py       # High-throughput batch frame processor
```
