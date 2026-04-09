# MewoBase: Magical Background Effects System

## 1. Overview
The new `MagicalBackground` component introduces a high-performance, immersive background animation system tailored for the Harry Potter theme. It provides ambient particle effects, mouse tracking halos, click ripples, and breathing gradients.

## 2. Implementation Principles

### 2.1 CSS Ambient Gradients
- **Grid Layer**: Uses `linear-gradient` to create a faint, static technological grid that grounds the magical elements in a structured space.
- **Breathing Halos**: Two massive, off-center radial gradients (`radial-gradient`) use CSS `@keyframes pulse` to slowly breathe and shift opacities, creating an ambient lighting environment.
- **Mouse Tracking**: A `div` element tracks mouse movement (`mousemove`) and updates its `transform: translate(x, y)`. This is highly performant because `transform` uses GPU acceleration via `will-change-transform`.

### 2.2 HTML5 Canvas Effects
To maintain 60 FPS while handling dozens of independent animated objects, the system utilizes the `HTML5 <canvas>` API rather than spawning multiple DOM nodes.
- **Floating Particles**: Simulates magical dust. Particles spawn, float upwards, wobble (`Math.sin`), and fade out. The maximum number of particles is automatically reduced on smaller screens to save battery.
- **Click Ripples**: When the user clicks, an expanding circle is drawn on the canvas, simulating water ripples or shockwaves.

## 3. Configuration & Parameters

The animations automatically inherit the current house theme's colors (`--primary` and `--secondary`).

### Performance Parameters (Tuning)
- `maxParticles`: Set to `60` on desktop and `30` on mobile.
- `animationDuration`: Ambient halos are set to `8s` and `12s` to ensure a slow, unobtrusive breathing effect.

## 4. Performance Optimization (CPU < 15%)
- **RequestAnimationFrame (rAF)**: The canvas loop runs on `requestAnimationFrame`, ensuring the browser synchronizes the animation with screen repaints and pauses execution when the tab is inactive.
- **Mix Blend Mode**: `mix-blend-screen` is used extensively. It offloads blending calculations to the GPU.
- **No React State in Animation Loop**: The canvas animation loop relies on `useRef` to store particle coordinates and velocities. This prevents expensive React re-renders from triggering every frame.

## 5. User Control & Accessibility
The `ThemeProvider` state has been extended with an `effectsEnabled` boolean. 
Users can toggle "Ambient Magic" from the **Settings** page.
When disabled, the `MagicalBackground` component unmounts the canvas and heavy CSS animations, falling back to a static, elegant dark background, saving battery life and catering to users who prefer zero motion.