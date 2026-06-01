# Tarot Huyền Bí

Single-file vanilla HTML/CSS/JS app. No build tools, no dependencies, no server.

## File
`index.html` — everything in one file: styles, markup, JS.

## Architecture

**Data** (`CARDS` array, lines 481–658)
- 22 Major Arcana, each: `{id, name, nameVi, numeral, symbol, upright, reversed, colors[3], bg}`
- `SPREAD_CONFIGS` maps spread size (1/3/5) → array of `{label}` for each position

**Rendering** (pure JS DOM manipulation)
- `makeCardBackSVG()` → shared back face SVG
- `makeCardFrontSVG(card)` → unique front SVG using `card.colors` and `card.bg`
- `renderSpread()` → builds card DOM; staggered entrance via `setTimeout(i*180ms)`

**State** (4 module-level vars)
- `currentSpread` — 1 | 3 | 5
- `drawnCards[]` — `{card, reversed, label}` per drawn card
- `flippedCount` — increments on each click-to-flip
- `sessionComplete` — blocks re-draw; reset clears all

**Flow**: spread select → optional question input → drawCards() → renderSpread() → user clicks each card → flipCard() → when all flipped: showReading() → resetAll()

**Reversed cards**: 30% probability per card. Reversed SVG image uses `rotate(180deg)`, reading panel shows `card.reversed` text + red badge.

## Design tokens (CSS vars)
```
--gold: #d4a943   --gold-light: #f0d080   --gold-dark: #8b6914
--purple-deep: #1a0a2e   --purple-mid: #2d1a5e
--star-white: #e8e0ff   --glow: rgba(212,169,67,0.4)
```
Fonts: `Cinzel Decorative` (headers/labels) · `Crimson Text` (body) — Google Fonts CDN.

## Adding cards
Append to `CARDS[]` with all fields. Minor Arcana not implemented; `SPREAD_CONFIGS` can grow independently.

## Adding a spread
Add key to `SPREAD_CONFIGS` and a `.spread-btn` in HTML with matching `data-spread`.

## Animations
- Stars: 120 divs, CSS `twinkle` keyframe, random `--dur` + `animation-delay`
- Card flip: CSS `rotateY(180deg)` + `preserve-3d` + `backface-visibility:hidden`
- Flip glow: `cardReveal` keyframe on `.card.flipped .card-front`
- Particles: 18 Web Animations API calls per flip, auto-removed on finish
- Reading panel: `fadeInUp` keyframe on `.visible`

## Constraints
- No frameworks, no build step — edit `index.html` directly and open in browser
- Card art is SVG-only; no external images
- `innerHTML` used intentionally for SVG injection (trusted internal strings only)
