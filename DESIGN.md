# Student AI Buddy — Design Brief

## Purpose & Context
Warm, encouraging learning companion that makes studying feel collaborative and celebratory, not solitary or stressful. Designed for mobile-first students across 6–18+ age range seeking supportive AI tuoring.

## Tone & Aesthetic
Playful yet intelligent; encouraging without being patronizing. Vibrant, colorful, approachable. Anti-corporate, anti-generic. Warm accent storytelling paired with calm neutrals. Resembles a supportive friend, not a drill sergeant.

## Color Palette

| Token | Light L C H | Dark L C H | Purpose |
|-------|------------|-----------|---------|
| Primary | 0.64 0.12 257 (Teal) | 0.72 0.14 212 | CTA, chat user messages, active states |
| Secondary | 0.72 0.14 44 (Warm Amber) | 0.68 0.14 44 | AI messages, supportive highlights |
| Accent | 0.65 0.18 212 (Vibrant Cyan) | 0.72 0.15 212 | Progress celebrations, badges, micro-interactions |
| Neutral Background | 0.985 0.001 70 (Off-white) | 0.12 0.01 70 (Deep Charcoal) | Main surface |
| Card | 0.99 0 0 (Pure white) | 0.16 0.01 70 (Elevated dark) | Card containers |
| Muted | 0.92 0.01 70 (Light grey) | 0.28 0.01 70 (Dark grey) | Secondary text, disabled states |
| Destructive | 0.55 0.22 25 (Red) | 0.65 0.19 22 | Error, warning, destructive actions |

## Typography

| Tier | Font | Usage | Weight | Size (body=16px base) |
|------|------|-------|--------|----------------------|
| Display | Bricolage Grotesque | Headlines, section titles | 700 | 2rem / 1.5rem / 1.25rem |
| Body | DM Sans | Paragraphs, UI labels, chat text | 400/500/600 | 1rem / 0.875rem / 0.75rem |
| Mono | Geist Mono | Code snippets, quiz answers, timestamps | 400/600 | 0.875rem |

## Elevation & Depth

| Surface | Treatment | Use Case |
|---------|-----------|----------|
| Background | Flat, solid | Page foundation |
| Card Base | 1px solid border + subtle shadow (md) | Chat history, quiz cards, topic cards |
| Elevated | Larger shadow (lg), lift on hover | Interactive popovers, modals |
| Input/Field | border-input, subtle inset treatment | Text input, select dropdowns |

## Structural Zones

| Zone | Light Bg | Dark Bg | Treatment | Content |
|------|----------|---------|-----------|---------|
| Header/Nav | bg-card / border-b | bg-card / border-b | White card with divider | Logo, user menu, progress indicator |
| Main Content | bg-background | bg-background | Breathing room, generous padding (1.5rem–2rem mobile) | Chat, dashboard, quizzes |
| Sidebar (optional) | bg-card | bg-card | Narrow, toggleable on mobile | Navigation links, session history |
| Footer | bg-muted/20 / border-t | bg-muted/20 / border-t | Subtle, de-emphasized | Hint text, recent topics |

## Spacing & Rhythm
- **Base unit**: 0.25rem (4px)
- **Scales**: 0.5rem, 1rem, 1.5rem, 2rem, 3rem (mobile-first stacking)
- **Density**: Cards use 1.5rem padding; chat bubbles use 1rem padding; spacing between sections is 2rem
- **Gap between items**: 1rem (cards, bubbles, inputs)

## Component Patterns
- **Chat bubbles**: User (primary bg, right-aligned, rounded-full with flat br corner); AI (secondary bg, left-aligned, rounded-full with flat bl corner)
- **Buttons**: Pill-shaped (rounded-lg/xl), generous padding (py-2.5 px-4), full-width on mobile
- **Topic cards**: rounded-xl, bg-card, hover shadow-elevated, transition-smooth
- **Progress bars**: Rounded full, colors cycle through chart palette, animated fill
- **Quiz cards**: rounded-xl border-2, clickable, state: default (border-border), hover (shadow-elevated), selected (border-primary bg-primary/10)
- **Input fields**: rounded-lg, border-input, focus:ring-2 ring-ring

## Motion & Microinteractions
- Transition default: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Chat bubble entry: fade-in + slide-up 0.2s
- Progress bar fill: linear 0.6s on update
- Button hover: opacity-90 + shadow lift
- Celebration pulse: accent color flash on quiz correct answer

## Responsive Breakpoints
- **Mobile**: base (sm: 640px)
- **Tablet**: md: 768px (2-column chat sidebar, wider cards)
- **Desktop**: lg: 1024px (3-column layout possible)
- **Extra-wide**: xl: 1280px (dashboard grid expands)

## Constraints & Anti-patterns
- ✅ Use semantic color tokens exclusively (no hex literals, no arbitrary Tailwind colors)
- ✅ Vary border-radius intentionally (0, 4px for inputs, 12px for cards, 24px+ for pills & bubbles)
- ✅ Dark mode is intentional, not inverted lightness (tuned accent saturation, warm secondary remains consistent)
- ❌ Never use uniform rounded-lg everywhere
- ❌ No generic purple gradients or default blue CTAs
- ❌ No emoji sprinkled throughout (use sparingly, if at all)
- ❌ No animations that distract from learning (motion is celebratory, not gratuitous)

## Signature Detail
Warm accent color (teal + amber) pairing creates an inviting, non-corporate learning space. Chat bubble asymmetrical corners (rounded-full except one corner flat) give the conversation a friendly, hand-drawn feel. Progress bars use the chart palette to celebrate multiple learning pathways, not a single-track rank system.
