---
name: zero-intercept-frontend
description: Build UI/UX matching the Zero_Intercept MEDIX hospital intelligence platform. Covers design system, Three.js 3D patterns, component conventions, and the split-panel login page architecture.
---

## Stack

- **React 19 + Vite** (JSX, `npm run dev`)
- **Tailwind CSS v4** (`@import "tailwindcss"` in CSS, `@theme {}` block for tokens — no config file)
- **Three.js raw** (`import * as THREE from 'three'`) — used for 3D decorative scenes in `useEffect`
- **@react-three/fiber + @react-three/drei + @react-three/rapier** — for interactive 3D worlds (DigitalTwin)
- **Framer Motion** — all page/component entry animations
- **lucide-react** — all icons
- **recharts** — all charts
- **react-router-dom v7** — routing, `NavLink`, `useLocation`

---

## Design System

### Color Tokens (`src/index.css` `@theme {}`)

| Token | Hex | Use |
|---|---|---|
| `--color-primary` | `#0F766E` | Buttons, active states |
| `--color-primary-light` | `#14B8A6` | Teal highlights, 3D nodes |
| `--color-accent` | `#10B981` | Emerald 3D nodes, success |
| `--color-sidebar` | `#042F2E` | Dark sidebar/nav background |
| `--color-critical` | `#DC2626` | Alerts, logout hover |
| `--color-warning` | `#D97706` | Warning badges |
| `--color-surface` | `#F0FDFA` | Page background |
| `--color-text-primary` | `#134E4A` | Main body text |

Body gradient: `linear-gradient(135deg, #F0FDFA 0%, #ECFDF5 50%, #F0F9FF 100%)`

### Typography

- **Display (headings):** `'Plus Jakarta Sans', sans-serif`
- **Body:** `'Inter', sans-serif`
- Load both from Google Fonts in `index.html`

### Utility Classes

```css
.medical-glow        /* card shadow: 0 0 20px rgba(20,184,166,0.08) */
.medical-glow-hover  /* hover shadow amplified */
```

---

## Login Page Architecture

Split-panel layout (`min-h-screen flex`):

**Left panel** (`lg:w-[55%]`, dark teal gradient `#042F2E → #0A3D3C → #0F766E`):
- Mesh dot overlay: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)` at `40px 40px`
- `<DNAHelix />` Three.js scene fills `absolute inset-0`
- Floating orbs: `motion.div` with `blur-3xl`, `animate={{ y: [0,-15,0], x: [0,8,0] }}`, `duration: 8, repeat: Infinity`
- Staggered `initial={{ opacity:0, y: -20/20 }} animate={{ opacity:1, y:0 }}` on logo, tagline, stats
- Gradient text: `text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300`

**Right panel** (`flex-1 bg-slate-50`):
- Slide-in: `initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}`
- Inputs: `rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`
- Submit button: `bg-gradient-to-r from-[#0F766E] to-[#14B8A6]` with `shadow-emerald-500/20` glow
- Loading state: 3 bouncing dots (`animate-bounce` with staggered `animationDelay`)
- Error: `motion.p` with `initial={{ opacity:0, y:-5 }}`, `bg-rose-50 text-rose-500`

---

## Three.js Pattern (Imperative, in `useEffect`)

This is how **all** raw Three.js scenes are built in this project:

```jsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MyScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);  // transparent background
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // --- build geometry, materials, groups ---

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ALWAYS clean up
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
```

### DNAHelix Specifics

- Two helical strands (offset by `Math.PI`) of `SphereGeometry` nodes
- Colors: strand A = `#14b8a6` (teal), strand B = `#10b981` (emerald)
- Glow: `THREE.Sprite` with `CanvasTexture` radial gradient + `THREE.AdditiveBlending`
- Connectors: `Line` between strands every 3rd node, opacity 0.25
- Mouse tracking: `mousemove` → normalised `[-1, 1]` → `helixGroup.rotation.y += mouseX * 0.6`
- Vertical bob: `pivotGroup.position.y = Math.sin(time * 2) * 0.3`
- Diagonal tilt: `pivotGroup.rotation.z = Math.PI / 5`

---

## Sidebar / Navigation

- **Bottom floating pill** — `fixed bottom-0`, `rounded-3xl`, `backdropFilter: blur(20px)`
- Background: `linear-gradient(135deg, rgba(4,47,46,0.92) 0%, rgba(10,61,60,0.95) 50%, rgba(13,79,77,0.92) 100%)`
- Active indicator: `motion.div layoutId="nav-pill"` (spring, stiffness 400) + top gradient bar `layoutId="nav-dot"`
- Role-based nav: each item has `roles: ['admin'|'doctor'|'nurse'|'patient']`, filtered from `allNavItems`
- Entry animation: `initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }}`

---

## Component Conventions

- **`KPICard`** — stat cards with icon, value, label, optional trend arrow
- **`TabContainer`** — tab switcher, use for multi-section dashboards
- **`PageHeader`** — consistent `h1` + subtitle per page
- **`LoadingSpinner`** — use while awaiting API data
- **`FloatingAssistant`** — AI chat bubble, present on all dashboard pages
- All API calls go through `src/services/api.js` (axios instance with base URL from `VITE_API_URL`)

---

## Key Patterns

**Framer Motion entry:** Every new page/section uses:
```jsx
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
```

**Glassmorphism card:**
```jsx
className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
```

**Gradient text:**
```jsx
className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300"
```

**Error display:**
```jsx
{error && (
  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
    className="text-rose-500 text-xs bg-rose-50 px-3 py-2 rounded-lg">
    {error}
  </motion.p>
)}
```

---

## Rules

1. Never use arbitrary bg colors — always pull from the `@theme` tokens or the teal/emerald/slate palette
2. Icons only from `lucide-react`
3. Raw Three.js (`import * as THREE`) for decorative scenes; R3F (`@react-three/fiber`) for interactive 3D worlds
4. Always clean up Three.js renderer in the `useEffect` return
5. Every page entry must have a Framer Motion animation
6. Bottom pill nav is the sole navigation — no top navbar, no side drawer
