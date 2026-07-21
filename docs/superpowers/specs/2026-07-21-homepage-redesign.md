# Homepage Redesign — Minimal Utility Layout

**Date:** 2026-07-21
**Status:** Implemented

## Problem
Homepage looked low quality — just a sticky header with title + 5 subject images with no visible labels. No immediate context for what the site offers.

## Goal
Simple fast utility (Google homepage style) — get user to content ASAP with minimal friction.

## Changes

### 1. Remove sticky header
- Added `noHeader` prop to `Layout.astro`
- Homepage uses `noHeader={true}`
- No sticky bar, no "9" wordmark taking space

### 2. Centered heading + subheading
- `<h1>` at 22/28px: "Free Class 9 Lectures – Punjab Board"
- `<p>` at 14/15px: "Math, Physics, Chemistry, Urdu & Computer · Complete Course 2025"
- Placed in main content area, centered, staggered animation

### 3. Visible card labels
- SubjectCard now shows subject name over image bottom
- Semi-transparent gradient overlay for readability
- White text, 16/18px semibold, text-shadow

### Files changed
- `src/layouts/Layout.astro` — added `noHeader` prop, conditional header render
- `src/pages/index.astro` — noHeader, heading + subheading block
- `src/components/SubjectCard.astro` — visible label overlay, removed sr-only

### What stayed same
- Subject card images, grid layout, animations
- Footer, PWA banner, meta/SEO tags
- All other pages (subject/chapter/section) unaffected — still have header with back button
