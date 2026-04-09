# MewoBase: Harry Potter Theme System Design Specification

## 1. Overview
The MewoBase project has undergone a complete UI overhaul to introduce a magical **Harry Potter Academy Theme System**. This document outlines the architectural decisions, color palettes, typography, and extension guidelines for the new multi-theme ecosystem.

## 2. Typography
The system uses a combination of classic, magical, and academic fonts to evoke the feeling of reading an ancient spellbook or wandering through Hogwarts.

- **Primary Font (Headings):** `Cinzel` - A classic, elegant serif font inspired by first-century Roman inscriptions. Used for all headers (`h1`-`h6`) and key focal points.
- **Secondary Font (Body Text):** `EB Garamond` - A beautiful, highly legible classical serif font. Used for paragraphs, descriptions, and UI elements.

## 3. House Themes (Color Palettes)
The theme system leverages CSS variables integrated directly with Tailwind CSS. All colors are defined in `HSL` format to support Tailwind's opacity modifiers (e.g., `bg-primary/50`).

### 🦅 Ravenclaw (Default)
Represents wisdom, wit, and learning.
- **Background (`--background`)**: Deep night sky (`222 47% 6%`)
- **Primary (`--primary`)**: Ravenclaw Blue (`217 91% 60%`)
- **Secondary (`--secondary`)**: Bronze/Gold (`45 93% 47%`)

### 🦁 Gryffindor
Represents bravery, daring, and chivalry.
- **Background (`--background`)**: Deep crimson night (`350 40% 6%`)
- **Primary (`--primary`)**: Gryffindor Red (`348 83% 47%`)
- **Secondary (`--secondary`)**: Gold (`45 93% 47%`)

### 🐍 Slytherin
Represents ambition, cunning, and resourcefulness.
- **Background (`--background`)**: Deep dungeon green (`140 40% 6%`)
- **Primary (`--primary`)**: Slytherin Green (`142 71% 35%`)
- **Secondary (`--secondary`)**: Silver (`0 0% 75%`)

### 🦡 Hufflepuff
Represents loyalty, patience, and fair play.
- **Background (`--background`)**: Deep earthy brown/black (`40 40% 6%`)
- **Primary (`--primary`)**: Hufflepuff Yellow (`45 93% 47%`)
- **Secondary (`--secondary`)**: Dark Gray/Black (`0 0% 20%`)

## 4. Implementation Details

### CSS Architecture
All themes are injected at the `:root` level and scoped under specific classes (`.theme-gryffindor`, etc.) in `src/index.css`. 

### Theme Provider Context
The `<ThemeProvider>` (`src/components/theme-provider.tsx`) wraps the entire application. It:
1. Reads the saved theme from `localStorage` (`meowbase-theme`).
2. Applies the corresponding `.theme-*` class to the `<html>` element.
3. Provides a React Context (`useTheme`) for any component to access or change the current theme.

### Magical UI Effects
- **Moving Light Borders**: Cards utilize a `conic-gradient` mask that references the active theme's `--primary` and `--secondary` colors to create a glowing, flowing border on hover.
- **Background Grid & Glow**: The background uses `radial-gradient` and `linear-gradient` tied to `--primary` to generate an ambient magical glow that shifts seamlessly during theme transitions.

## 5. Adding a New Theme
To introduce a new theme (e.g., *Beauxbatons*):
1. **Define the CSS**: Add a new class `.theme-beauxbatons` in `src/index.css` and specify the HSL values.
2. **Update the Type**: Add the theme name to the `Theme` type in `theme-provider.tsx`.
3. **Add to Selector**: Add a new button in the `Settings.tsx` House Selection grid.

## 6. Performance & Responsive Design
- **GPU Acceleration**: Hover animations and 3D tilts use `transform` and `opacity` with `will-change`, ensuring 60fps.
- **Transitions**: The `<body>` and `.glass-panel` components have a `transition-colors duration-500 ease` applied. When a user selects a new house, the entire UI smoothly morphs into the new color scheme without jarring flashes.