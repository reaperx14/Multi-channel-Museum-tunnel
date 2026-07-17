# Chronos Tunnel: Immersive Time Travel Gallery Installation
An interactive, auto-looping, first-person 3D/2D projection experience designed for natural history museums to engage children (ages 8-12) and parents in the story of Earth's history. Inspired by *teamLab Planets Tokyo*.

---

## 🎨 Experience Features
1. **Infinite 3D Tunnel Flight:** Real-time first-person camera movement flying forward inside a looping cylindrical WebGL tunnel structure.
2. **Descriptive, Synchronized Events:** Fully animated procedural canvas sequences that map exactly to the chronological narrations:
   - **Space (13.8B Years Ago):** Blinding Big Bang light burst, expanding galaxy spiral arms, and warping stars.
   - **Molten Earth (4.6B Years Ago):** Active volcanic peaks erupting lava columns, falling meteorites, and magma veins.
   - **Ocean (3.8B Years Ago):** Rising water level, pulsing bioluminescent jellyfish, and cells undergoing active **mitosis division (spawning)**.
   - **Dinosaurs (150M Years Ago):** Walking Brachiosaurus neck sways and tree leaf feeding cycles, plus pterosaurs swooping overhead.
   - **Meteor Strike (66M Years Ago):** Terrified fleeing dinosaurs, asteroid descent, shockwave rings blowing away elements, and ground ash darkening.
   - **Ice Age (2M Years Ago):** Growing frost crystal frames, waving Northern Lights (auroras), and parent/baby mammoths marching in a blizzard.
   - **Humans (300k Years Ago):** Campfire sparks being hand-sparked by rubbing sticks, and primitive cave paintings drawing themselves stroke-by-stroke.
   - **Modern Reef (Present):** Detailed sea turtles swimming, colorful fish flocking, and sunbeams dancing.
3. **Resilient Dual-Renderer Fallback:** 
   - Uses Three.js WebGL for high-performance 3D cylinder projection.
   - Automatically drops down to native 2D Canvas rendering if GPU/WebGL is disabled or slow, drawing all same animations.
4. **Cinematic Subtitle System:** Minimalistic glassmorphic film-style subtitles at the bottom telling the story of Earth.
5. **No External Dependencies:** Three.js is saved locally to ensure the experience is 100% self-contained and works offline.

---

## 📁 File Structure
- `index.html` - Minimal canvas container and subtitle UI overlay.
- `styles.css` - Custom viewport, darkness cylinder vignettes, and movie subtitle layout.
- `app.js` - Main animation loop, preloader, Three.js 3D renderer, particle system, and 2D/3D physics.
- `three.min.js` - Localized Three.js r128 build for offline stability.
- `img/` - 8 photorealistic background visuals for each era.

---

## 🚀 How to Run Locally
Start a local web server inside the directory:

### Python 3
```bash
python -m http.server 8000
```
Then visit **http://localhost:8000** in your browser.

### Node / npm
```bash
npm install -g serve
serve -p 8000
```
Then visit **http://localhost:8000**.
