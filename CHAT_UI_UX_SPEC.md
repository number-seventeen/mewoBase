# MewoBase: Chat UI/UX Design Specification

## 1. Overview
The Chat component has undergone a comprehensive redesign to align with the Harry Potter Hogwarts theme. This document outlines the visual and interactive changes made to the Chat interface, ensuring a high-quality user experience.

## 2. Visual Design & Layout

### 2.1 Top Navigation Bar (Knowledge Base Selector)
- **Glassmorphism:** The top bar now utilizes a deep, frosted glass effect (`bg-background/60 backdrop-blur-md`) with a subtle `box-shadow` matching the primary theme color.
- **Iconography:** The generic robot/AI icon has been replaced with a glowing magical wand (`Wand2`) set inside a beautifully crafted circular crest (`bg-gradient-to-br from-primary/30 to-secondary/20`).
- **Typography:** The title has been updated to "Magical Assistant" using the `Cinzel` font (`font-bold text-xl`), providing a classic, authoritative magical tone.

### 2.2 Chat Message Area
- **Background & Containment:** The main chat area is now a fully immersive, rounded container (`rounded-2xl`) with an ambient gradient glow emanating from the bottom.
- **Message Bubbles (User):**
  - **Color:** Solid primary color (`bg-primary`) to stand out as the active cast spell.
  - **Shape:** Asymmetric rounded corners (`rounded-tr-sm`) to indicate directionality.
  - **Avatar:** A solid bordered user icon.
- **Message Bubbles (Assistant):**
  - **Color:** Translucent glassmorphism (`bg-background/60 backdrop-blur-md`) with a delicate border (`border-border/30`).
  - **Shape:** Asymmetric rounded corners (`rounded-tl-sm`).
  - **Avatar:** The magical wand icon glowing with the secondary color, floating within a dark, metallic-style ring.

### 2.3 Input Area (The Spell Caster)
- **Container:** The input area is anchored to the bottom with heavy glassmorphism to separate it from scrolling messages.
- **Textarea:** Upgraded from a simple `<input>` to a `<textarea>` allowing multi-line spells (Shift+Enter). It features an inset shadow to look deeply embedded into the UI and a soft, ambient glow that activates `onFocus`.
- **Action Buttons:** 
  - **Attach:** Now perfectly circular, glowing with the secondary theme color, providing excellent hover feedback.
  - **Send ("Cast"):** Enlarged to `h-12` with a rounded-2xl shape. Features a dynamic hover effect that slightly lifts the button (`-translate-y-0.5`) and moves the send arrow (`translate-x-1 -translate-y-1`) as if releasing magic.

## 3. Interaction & Animation

- **Message Entrance:** All new messages and loading states now smoothly slide and fade into view using Tailwind Animate (`animate-in slide-in-from-bottom-2 fade-in duration-300`).
- **Loading State:** The loading indicator simulates a spell being conjured. It features a pulsating background, a bouncing wand, and three floating, glowing orbs (`bg-secondary`) that bounce sequentially.
- **Hover States:** Every interactive element (buttons, dropdowns) has a `transition-all duration-300` applied to ensure color shifts and scaling are buttery smooth.

## 4. Accessibility (WCAG 2.1) & Responsiveness
- **Focus States:** The textarea uses `focus:ring-2 focus:ring-primary/40` to provide clear, high-contrast visual feedback for keyboard navigation without breaking the theme.
- **ARIA Labels:** Buttons like "Attach" and "Cast" are fully equipped with descriptive `aria-label` tags for screen readers.
- **Responsive Sizing:** Elements use Flexbox (`flex-1`, `shrink-0`) and relative sizing to ensure the layout never breaks on smaller viewports.

## 5. Performance
- **CSS Transitions:** All animations rely on CSS properties (`opacity`, `transform`) that are hardware-accelerated, ensuring the UI remains snappy and 60fps even during rapid chat exchanges.