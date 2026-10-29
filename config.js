/**
 * NOCTIS - Electric Brand Scrollytelling Configuration
 * All section heights, chapter ranges, frame counts, paths, and callouts
 */

window.CONFIG = {
  // Brand Design Tokens
  tokens: {
    asphalt: '#07080A',
    graphite: '#121418',
    fog: '#8A8F98',
    bone: '#EDEAE4',
    xenon: '#CFE3FF',
    taillight: '#E1251B',
    hairline: 'rgba(237, 234, 228, 0.12)'
  },

  // Preloader settings
  preloader: {
    initialHeroFramesToLoad: 30,
    accentFlashDurationMs: 200,
    fadeDurationMs: 500
  },

  // Film Grain settings
  grain: {
    enabled: true,
    fps: 8,
    opacity: 0.035,
    tileSize: 180
  },

  // Cursor "Headlight" settings
  cursor: {
    lerp: 0.18,
    ringSize: 28,
    dotSize: 6,
    barWidth: 44,
    barHeight: 2,
    clickFlashDurationMs: 120
  },

  // Section 1: Hero
  hero: {
    wrapperHeightVh: 600,
    frameCount: 600,
    desktopPath: (index) => `assets/frames/hero/frame_${String(index).padStart(4, '0')}.webp`,
    mobilePath: (index) => `assets/frames/hero-mobile/frame_${String(index).padStart(4, '0')}.webp`,
    smoothing: 0.15,
    fadeToBlackStart: 0.95,
    
    // Chapters placed in empty dark sky (never over the car at the bottom)
    chapters: [
      {
        id: 'hero-ch1',
        start: 0.00,
        end: 0.14,
        headline: 'NOCTIS',
        subline: 'The city is asleep.',
        hint: 'SCROLL TO WAKE IT',
        alignment: 'sky-center'
      },
      {
        id: 'hero-ch2',
        start: 0.22,
        end: 0.42,
        headline: "It doesn't need\nthe city's light.",
        alignment: 'sky-left'
      },
      {
        id: 'hero-ch3',
        start: 0.50,
        end: 0.70,
        headline: 'It brings\nits own.',
        alignment: 'sky-right'
      },
      {
        id: 'hero-ch4',
        start: 0.80,
        end: 1.00,
        headline: 'GT-E',
        specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
        linkText: 'Discover the GT-E',
        linkHref: '#lineup',
        alignment: 'sky-bottom-left'
      }
    ],

    hud: {
      speedMax: 118,
      distanceMax: 4.2
    }
  },

  // Section 2: Statement (word-by-word reveal)
  statement: {
    label: '02 — ENGINEERING',
    sentence: 'Every part was designed to disappear into one line of light.'
  },

  // Section 3: Dismantle (pinned scrollytelling)
  dismantle: {
    wrapperHeightVh: 350,
    frameCount: 200,
    desktopPath: (index) => `assets/frames/dismantle/frame_${String(index).padStart(4, '0')}.webp`,
    mobilePath: (index) => `assets/frames/dismantle-mobile/frame_${String(index).padStart(4, '0')}.webp`,
    smoothing: 0.15,
    title: 'Look closer.',
    calloutsStartProgress: 0.70,

    // Callouts positioned in clean quadrants around the vehicle (no overlaps)
    callouts: [
      {
        id: 'body',
        start: 0.70,
        end: 1.00,
        title: 'BODY',
        desc: 'Carbon composite monocoque',
        dot: { x: 42, y: 22 },
        label: { x: 52, y: 14, align: 'left' }
      },
      {
        id: 'battery',
        start: 0.77,
        end: 1.00,
        title: 'BATTERY',
        desc: '110 kWh structural pack',
        dot: { x: 33, y: 68 },
        label: { x: 12, y: 78, align: 'left' }
      },
      {
        id: 'drive',
        start: 0.84,
        end: 1.00,
        title: 'DRIVE',
        desc: 'Dual axial-flux motors, 680 kW',
        dot: { x: 58, y: 60 },
        label: { x: 66, y: 80, align: 'right' }
      },
      {
        id: 'light',
        start: 0.91,
        end: 1.00,
        title: 'LIGHT',
        desc: 'Single-line LED signature',
        dot: { x: 82, y: 60 },
        label: { x: 80, y: 38, align: 'right' }
      }
    ]
  },

  // Section 4: Lineup (hover accordion)
  lineup: {
    label: '03 — THE LINEUP',
    title: 'Five ways to drive the night.',
    defaultModel: 'gt-e',
    hoverDebounceMs: 80,
    models: [
      {
        id: 'gt-e',
        num: '01',
        name: 'GT-E',
        tagline: 'The grand tourer.',
        specs: [
          { label: 'RANGE', value: '640 KM' },
          { label: '0–100 KM/H', value: '3.1 S' },
          { label: 'POWER', value: '680 KW' }
        ],
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite luxury electric grand tourer coupe',
        colors: [
          { name: 'Matte Graphite', hex: '#2A2C30' },
          { name: 'Bone White', hex: '#EDEAE4' },
          { name: 'Abyssal Black', hex: '#0B0C0E' },
          { name: 'Obsidian Blue', hex: '#111827' }
        ]
      },
      {
        id: 's',
        num: '02',
        name: 'S',
        tagline: 'Four doors, no compromise.',
        specs: [
          { label: 'RANGE', value: '600 KM' },
          { label: '0–100 KM/H', value: '3.6 S' },
          { label: 'POWER', value: '520 KW' }
        ],
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S four-door luxury sport electric sedan in satin bone white',
        colors: [
          { name: 'Satin Bone', hex: '#EDEAE4' },
          { name: 'Matte Graphite', hex: '#2A2C30' },
          { name: 'Abyssal Black', hex: '#0B0C0E' },
          { name: 'Slate Gray', hex: '#374151' }
        ]
      },
      {
        id: 'x',
        num: '03',
        name: 'X',
        tagline: 'Higher, never heavier.',
        specs: [
          { label: 'RANGE', value: '560 KM' },
          { label: '0–100 KM/H', value: '4.2 S' },
          { label: 'POWER', value: '480 KW' }
        ],
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X luxury electric SUV coupe in deep midnight blue',
        colors: [
          { name: 'Midnight Blue', hex: '#0F1E36' },
          { name: 'Satin Bone', hex: '#EDEAE4' },
          { name: 'Matte Graphite', hex: '#2A2C30' },
          { name: 'Abyssal Black', hex: '#0B0C0E' }
        ]
      },
      {
        id: 'r',
        num: '04',
        name: 'R',
        tagline: 'Built for the track.',
        specs: [
          { label: 'RANGE', value: '420 KM' },
          { label: '0–100 KM/H', value: '2.4 S' },
          { label: 'POWER', value: '900 KW' }
        ],
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R two-seat track coupe with rear wing in satin black with red accents',
        colors: [
          { name: 'Track Satin Black', hex: '#0A0A0A' },
          { name: 'Matte Graphite', hex: '#2A2C30' },
          { name: 'Liquid Silver', hex: '#C4C8D0' },
          { name: 'Crimson Accent', hex: '#E1251B' }
        ]
      },
      {
        id: 'one',
        num: '05',
        name: 'ONE',
        tagline: 'The future, early.',
        specs: [
          { label: 'STATUS', value: 'CONCEPT' },
          { label: '0–100 KM/H', value: '< 2.0 S' },
          { label: 'POWERTRAIN', value: 'QUAD MOTOR' }
        ],
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE flagship concept electric hypercar in liquid silver',
        colors: [
          { name: 'Liquid Silver', hex: '#C4C8D0' },
          { name: 'Obsidian Black', hex: '#0B0C0E' },
          { name: 'Titanium Matte', hex: '#4B5563' },
          { name: 'Bone White', hex: '#EDEAE4' }
        ]
      }
    ]
  },

  // Section 5: Reserve
  reserve: {
    headline: 'Drive the night.',
    body: 'Direct allocation for 2026. Hand-built in limited numbers with silent dual and quad axial-flux powertrains.',
    buttonLabel: 'RESERVE YOUR NOCTIS',
    buttonHref: '#reserve'
  },

  // Footer links & copyright
  footer: {
    brand: 'NOCTIS',
    copyright: '© 2026 NOCTIS. FICTIONAL ELECTRIC VEHICLE BRAND.',
    columns: [
      {
        heading: 'MODELS',
        links: [
          { label: 'GT-E GRAND TOURER', href: '#lineup' },
          { label: 'S SPORT SEDAN', href: '#lineup' },
          { label: 'X COUPE SUV', href: '#lineup' },
          { label: 'R TRACK COUPE', href: '#lineup' },
          { label: 'ONE HYPERCAR', href: '#lineup' }
        ]
      },
      {
        heading: 'ENGINEERING',
        links: [
          { label: 'AXIAL-FLUX MOTORS', href: '#dismantle' },
          { label: 'STRUCTURAL PACK', href: '#dismantle' },
          { label: 'CARBON MONOCOQUE', href: '#dismantle' },
          { label: 'SINGLE-LINE SIGNATURE', href: '#dismantle' }
        ]
      },
      {
        heading: 'ALLOCATION',
        links: [
          { label: 'RESERVE ALLOCATION', href: '#reserve' },
          { label: 'SPECIFICATIONS', href: '#lineup' },
          { label: 'GLOBAL PRESS', href: '#press' },
          { label: 'PRIVACY & LEGAL', href: '#legal' }
        ]
      }
    ]
  }
};
