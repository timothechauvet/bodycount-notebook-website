# Agent Guidelines for My Body Count Tracker

This document defines core conventions, constraints, and git workflows for AI coding agents operating on this repository.

---

## 📌 Commit & Push Workflow

Whenever finishing work or reaching a milestone, **ALWAYS** commit and push following this exact convention:

### Commit Message Template
```
:gitmoji: Name of edit
```

### Gitmoji Reference Examples
- `:sparkles: Add new feature or section`
- `:lipstick: Polish styling, layout, or animations`
- `:bug: Fix visual bug or behavioral glitch`
- `:memo: Update documentation or guidelines`
- `:zap: Improve loading speed and performance`
- `:art: Improve code structure or formatting`
- `:recycle: Refactor code without changing behavior`
- `:rocket: Deploy updates or GitHub Actions configuration`

### Execution Command
```bash
git add <files>
git commit -m ":gitmoji: Name of edit"
git push origin main
```

---

## 🎨 Core Product & Design Constraints

1. **Borsok Font Apostrophe Rule**:
   - The Borsok font (`borsok/boorsok.ttf`) has broken/distorted glyph rendering for single quotes / apostrophes (`'`).
   - **STRICT RULE**: NEVER use single quotes or apostrophes (`'`) in any Borsok font element, title, or section heading (e.g., use `"WHY REGULAR NOTEBOOKS FAIL"` instead of `"DOESN'T"`).

2. **Proportional 120-Page 3D Mockup**:
   - The book is 120 pages (60 leaves of 6×9″ paper), measuring ~0.28″ thick.
   - In CSS 3D space, depth must be ~12px (`translateZ(6px)` / `translateZ(-6px)`), NOT an overly thick 30–40px book.
   - Auto-spins 360° continuously on mobile and desktop without manual toggle clutter.

3. **Abstract & Confidential Interior Spread**:
   - The interior spread showcase must remain abstract/confidential.
   - Do NOT display mock filled-in personal diary stories (e.g. names, dates, private anecdotes).
   - Display the authentic pre-printed blueprint slots:
     - `Hookup ID`
     - `Date` & `[ / / ]`
     - `@`
     - `Occupation`
     - `Gender`
     - `Age range`
     - `Location`
     - `Met in`
     - Queer roles checklist: `Top`, `Vers`, `Bottom`, `Side`, `In the closet`, `Weirdo`
     - `Body type` & `Vibe`
     - `Toys, gear, kinks`
     - `Substances`
     - `Protection`, `STIs, tests`
     - `Meet counter`
     - `Never again`
     - `Love-o-meter` (1–4 Flame rating scale)
     - `Corner scratch` perforated tab

4. **Zero-Framework Performance**:
   - Sub-500ms initial paint target.
   - Zero client-side hydration frameworks (no React, Vue, Svelte).
   - Pure semantic HTML5, vanilla CSS, and vanilla JS (< 4KB).

5. **Tracking & Outbound Conversion**:
   - All Amazon CTA links must include:
     - `target="_blank"`
     - `rel="noopener noreferrer"`
     - `data-track-amazon="true"`
   - `main.js` handles Meta Pixel `InitiateCheckout` tracking and forwards URL query/UTM parameters.

---

## 🐾 Petdex Desktop Attention Protocol

Whenever finishing a task, reaching a milestone, or requiring user feedback:
```bash
source ~/.zsh_scripts/petdex.sh && pet_attention "<Summary or Prompt>"
```
