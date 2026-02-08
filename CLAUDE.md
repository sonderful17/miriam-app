# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build locally

## Architecture

Miriam is a menstrual cycle tracking and guidance app. It's a single-page React app (React 19) built with Vite and styled with Tailwind CSS v4 (via `@tailwindcss/vite` plugin). The font is Lexend (loaded via Google Fonts in `index.html`).

**The entire app lives in one file: `src/MiriamApp.jsx` (~2100 lines).** This single component (`CycleApp`) contains all state, logic, data, and UI views. There is no routing library, backend, or external API — navigation is handled via `currentView` state (`'today'`, `'cycle'`, `'log'`, `'learn'`, `'me'`, `'about'`).

### Data & State

- All user data is persisted in `localStorage` under the key `cycleAppData`
- State shape: `{ profile, dailyLogs, periodHistory, personalPatterns }`
- No authentication or server — privacy-first, everything stays on-device

### Key Concepts

- **Cycle phases**: Menstrual, Follicular, Ovulatory, Early Luteal, Late Luteal — calculated from last period start date and average cycle length
- **Phase calculation** (`calculatePhase`): Computes current cycle day and maps it to a phase with associated color gradient
- **Guidance system** (`getGuidance`): Returns phase-specific advice (training, nutrition, energy, fasting) that adjusts based on daily log inputs (low sleep, high stress, low energy, poor mood)
- **Phase guides** (`phaseGuides`): Detailed educational content for each phase shown in the Learn tab

### Views (all inline components in MiriamApp.jsx)

- **Onboarding**: Multi-step flow (Welcome → Period Start → Period End → Cycle Length) — shown when no `userData` exists
- **TodayView**: Dashboard showing current phase, cycle day, and personalized guidance
- **CycleView**: Visual cycle overview
- **LogView**: Daily logging form (sleep, mood, energy, stress, workout, fasting, notes)
- **LearnView / PhaseGuideView**: Educational content about each cycle phase
- **MeView**: Profile editing, logging streak, data export/import, reset
- **AboutView**: Project information

### Entry Point

`main.jsx` → `App.jsx` → `MiriamApp.jsx` (the `CycleApp` component)

## Style Conventions

- Tailwind utility classes used extensively inline (no separate component CSS needed)
- Color palette: indigo/purple gradients for primary UI, orange for CTAs and ovulatory phase
- All views use `fontFamily: 'Lexend, sans-serif'` inline style
- Mobile-first design with fixed bottom navigation bar (`BottomNav`)
- ESLint configured to ignore unused vars matching `^[A-Z_]` pattern
