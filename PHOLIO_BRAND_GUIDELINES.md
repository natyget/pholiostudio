# Pholio Brand Guidelines

**Version 1.0** | Last Updated: January 2025

---

## 1. Brand Identity

### Mission
Pholio is a premium platform connecting talent with agencies through AI-curated portfolios. We embody **high-end, dynamic digital workspaces with zero compromises**.

### Brand Personality
- **Cinematic & Dynamic**: Engaging, fluid interfaces inspired by our Landing Page Hero and Studio+ components.
- **High-Polish SaaS**: We embrace premium, modern tech aesthetics—including glassmorphism, cursor-tracking spotlights, and physics-based animations.
- **Editorial meets Tech**: We fuse editorial typography (serifs, elegant tracking) with cutting-edge, interactive digital experiences.
- **Confident**: Bold, highly responsive, and alive.

### The Pholio Standard
> **CRITICAL DIRECTIVE:** The motion, component design, and overall aesthetic of the **Landing Page**, specifically the **Studio+ website component** and the **Agency Perspective component**, represent the undisputed baseline for what Pholio pages should look like. Any previous guidelines requesting "static, calm, non-bouncy" interfaces are officially overridden by this directive.

---

## 2. Color Palette

### Primary Colors

**Primary Gold**
- Hex: `#C9A55A`
- RGB: `rgb(201, 165, 90)`
- Usage: Primary actions, highlights, progress indicators, brand accents
- Hover: `#b08d45` (darker shade)

**Text Colors**

- **Dark Text**: `#0f172a`
  - Usage: Headings, primary body text, important labels
  
- **Slate Text**: `#64748b`
  - Usage: Secondary text, descriptions, hints, placeholders

- **Light Text**: `#94a3b8`
  - Usage: Tertiary text, disabled states, subtle labels

### Background Colors

- **Primary Background**: `#faf9f7`
- **Secondary Background**: `#f5f4f2`
- **Card Background**: `#ffffff`
- **Gradient**: `linear-gradient(135deg, #faf9f7 0%, #f5f4f2 100%)`

### Border Colors

- **Light Border**: `#e2e8f0`
- **Hover Border**: `#cbd5e1`
- **Card Border**: `rgba(255, 255, 255, 0.5)`

### Semantic Colors

**Success**
- Background: `#f0fdf4`
- Border: `#22c55e`
- Text: `#15803d`

**Error**
- Background: `#fef2f2`
- Border: `#fee2e2`
- Text: `#ef4444`

**Warning**
- Background: `#fffbeb`
- Border: `#fde047`
- Text: `#a16207`

---

## 3. Typography

### Font Family

**Primary Font**: `Inter`
- Fallbacks: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Font smoothing: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`

### Type Scale

**Headings**

- **H1**: `2rem` (32px) | Weight: `700` | Letter-spacing: `-0.03em`
- **H2**: `1.875rem` (30px) | Weight: `600` | Letter-spacing: `-0.02em`
- **H3**: `1.5rem` (24px) | Weight: `600`
- **H4**: `1.25rem` (20px) | Weight: `600`

**Body Text**

- **Large**: `1.05rem` (16.8px) | Weight: `400` | Line-height: `1.5`
- **Base**: `1rem` (16px) | Weight: `400` | Line-height: `1.6`
- **Small**: `0.9rem` (14.4px) | Weight: `400`
- **Tiny**: `0.75rem` (12px) | Weight: `500` | Uppercase, letter-spacing: `0.08em`

### Font Weights

- **Regular**: `400` - Body text, descriptions
- **Medium**: `500` - Labels, buttons, emphasis
- **Semibold**: `600` - Headings, important labels
- **Bold**: `700` - Hero headings, strong emphasis

### Letter Spacing

- **Tight**: `-0.03em` - Large headings
- **Normal**: `0` - Body text
- **Wide**: `0.05em` - Uppercase labels
- **Extra Wide**: `0.08em` - Small uppercase labels

---

## 4. Spacing System

### Base Unit: `1rem` (16px)

**Spacing Scale**
- `0.25rem` (4px) - Tiny gaps
- `0.5rem` (8px) - Small gaps
- `0.75rem` (12px) - Medium-small gaps
- `1rem` (16px) - Base spacing
- `1.5rem` (24px) - Medium spacing
- `2rem` (32px) - Large spacing
- `2.5rem` (40px) - Extra large spacing
- `3rem` (48px) - Section spacing
- `3.5rem` (56px) - Generous padding

### Component Spacing

- **Form Fields**: `1.75rem` (28px) between fields
- **Section Padding**: `3rem` horizontal, `2rem` vertical
- **Card Padding**: `2.5rem - 3.5rem` depending on context
- **Button Padding**: `0.875rem 1.75rem`

---

## 5. Border Radius

- **Small**: `4px` - Badges, small elements
- **Medium**: `8px` - Inputs, buttons, cards
- **Large**: `12px` - Upload areas, large cards
- **Extra Large**: `16px` - Main containers, hero cards

---

## 6. Shadows

**Card Shadow**
```css
box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
```

**Button Hover Shadow**
```css
box-shadow: 0 4px 12px rgba(201, 165, 90, 0.2);
```

**Focus Ring**
```css
box-shadow: 0 0 0 4px rgba(201, 165, 90, 0.1);
```

**Progress Dot Active**
```css
box-shadow: 0 0 0 4px rgba(201, 165, 90, 0.1);
```

---

## 7. Buttons

### Primary Button

```css
background: #C9A55A;
color: white;
padding: 0.875rem 1.75rem;
border-radius: 8px;
font-weight: 500;
min-width: 140px;
```

**Hover State**
```css
background: #b08d45;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(201, 165, 90, 0.2);
```

### Secondary Button

```css
background: transparent;
color: #64748b;
padding: 0.875rem 1.75rem;
border-radius: 8px;
```

**Hover State**
```css
color: #0f172a;
background: #f1f5f9;
```

### Disabled State

```css
opacity: 0.6;
cursor: not-allowed;
transform: none;
box-shadow: none;
```

---

## 8. Form Elements

### Input Fields

```css
padding: 0.875rem 1rem;
font-size: 1rem; /* Prevents iOS zoom */
border: 1px solid #e2e8f0;
border-radius: 8px;
background: white;
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

**Focus State**
```css
border-color: #C9A55A;
box-shadow: 0 0 0 4px rgba(201, 165, 90, 0.1);
```

**Error State**
```css
border-color: #ef4444;
background-color: #fffafa;
```

**Prediction Highlight**
```css
border-color: #C9A55A;
background-color: rgba(201, 165, 90, 0.05);
```

### Labels

- Font size: `0.9rem`
- Font weight: `500`
- Color: `#0f172a`
- Margin bottom: `0.6rem`

### Optional Field Indicator

```css
color: #94a3b8;
font-weight: 400;
font-size: 0.85rem;
```

---

## 9. Badges & Tags

### Prediction Badge

```css
display: inline-flex;
align-items: center;
padding: 0.15rem 0.5rem;
background: rgba(201, 165, 90, 0.1);
color: #9a7d3a;
font-size: 0.7rem;
font-weight: 600;
border-radius: 4px;
text-transform: uppercase;
letter-spacing: 0.05em;
```

### Studio+ Badge

```css
padding: 0.375rem 0.875rem;
background: rgba(201, 165, 90, 0.15);
color: rgba(201, 165, 90, 0.9);
font-size: 0.75rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
```

---

## 10. Progress Indicators

### Progress Dot

**Default**
```css
width: 30px;
height: 30px;
background: #f1f5f9;
color: #94a3b8;
border-radius: 50%;
border: 2px solid transparent;
```

**Completed**
```css
background: #C9A55A;
color: white;
```

**Active**
```css
background: white;
color: #C9A55A;
border-color: #C9A55A;
box-shadow: 0 0 0 4px rgba(201, 165, 90, 0.1);
```

### Progress Line

```css
height: 2px;
background: #f1f5f9;
```

**Active/Completed**
```css
background: #C9A55A;
opacity: 0.3;
```

---

## 11. Transitions & Animations

### Standard Transition

```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Smooth Transition

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Fade In

```css
opacity: 0;
transform: translateY(10px);
transition: opacity 0.4s ease, transform 0.4s ease;
```

**Active State**
```css
opacity: 1;
transform: translateY(0);
```

---

## 12. Layout Principles

### Full-Screen Experiences

- No header/footer in onboarding flows
- Centered card layout: `max-width: 680px`
- Generous padding: `3rem` horizontal, `2rem` vertical
- Background gradient for depth

### Card Design

- White background
- Rounded corners: `16px`
- Subtle shadow
- Border: `1px solid rgba(255, 255, 255, 0.5)`
- Padding: `2.5rem - 3.5rem`

### Grid Layouts

**Two-Column Form**
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 1.5rem;
```

**Responsive Breakpoint**: `640px` - switches to single column

---

## 13. Error States

### Error Container

```css
background: #fef2f2;
border: 1px solid #fee2e2;
color: #ef4444;
padding: 1rem;
border-radius: 8px;
font-size: 0.9rem;
```

### Field Error

```css
color: #ef4444;
font-size: 0.8rem;
margin-top: 0.4rem;
font-weight: 500;
```

---

## 14. Loading States

### Loading Indicator

- Opacity: `0.6`
- Pointer events: `none`
- Smooth transition

---

## 15. Responsive Design

### Breakpoints

- **Mobile**: `max-width: 640px`
  - Single column forms
  - Reduced padding: `2rem 1.5rem`
  - Hide progress labels if needed

### Mobile Considerations

- Font size: `1rem` minimum (prevents iOS zoom on input focus)
- Touch targets: Minimum `44px` height
- Generous spacing for thumb navigation

---

## 16. Accessibility

### Color Contrast

- Text on white: Minimum `4.5:1` ratio
- Primary gold on white: `#C9A55A` meets WCAG AA for large text
- Focus indicators: Always visible, `4px` ring

### Focus States

- All interactive elements have visible focus states
- Focus ring: `4px` with `rgba(201, 165, 90, 0.1)`

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Form labels associated with inputs
- ARIA labels for icon-only buttons
- Error messages with `role="alert"`

---

## 17. CSS Variables (Recommended)

```css
:root {
  --primary-gold: #C9A55A;
  --primary-gold-hover: #b08d45;
  --text-dark: #0f172a;
  --text-slate: #64748b;
  --text-light: #94a3b8;
  --border-light: #e2e8f0;
  --bg-gradient-start: #faf9f7;
  --bg-gradient-end: #f5f4f2;
  --shadow-card: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

---

## 18. Do's and Don'ts

### ✅ Do

- **USE DYNAMIC MOTION**: Implement spring physics, hover scaling (`scale-105`), and interactive cursor effects as seen on the landing page.
- **EMBRACE HIGH-POLISH SAAS TROPES**: Utilize glassmorphism, progress bars, gamification, and floating UI where it adds to a high-end app feel.
- Use generous white space and maintain consistent spacing scale.
- Use subtle depth and glowing shadows (e.g., gold radial blurs).
- Smooth, continuous transitions for state changes.
- Clear hierarchy with typography (mixing Serif display and Sans body).

### ❌ Don't

- **DO NOT MAKE IT STATIC**: Avoid flat, lifeless, non-interactive pages. If it can gracefully react to the user, it should.
- Use internal AI names in UI (no "Scout", "Maverick", "Librarian").
- Use harsh, unpolished solid borders instead of glass/translucency.
- Skip focus or hover states. Every interaction should feel tactile.
- Ignore mobile experience.

---

## 19. Voice & Tone

### Writing Style

- **Clear & Direct**: No jargon, straightforward language
- **Confident**: Professional but approachable
- **Minimal**: Say only what's necessary
- **Helpful**: Guide users without being condescending

---

## 20. Iconography

### Style

- Minimal, line-based icons
- Consistent stroke width: `1.5px`
- 24px default size
- Neutral colors (inherit text color)

### Common Icons

- Upload: Image/photo icon
- Success: Checkmark
- Error: Alert triangle
- Navigation: Chevrons or arrows

---

## 21. Photography

### Style

- Editorial quality
- Clean backgrounds
- Professional lighting
- High resolution (minimum 2000px width)
- Consistent aspect ratios (3:4 for portraits)

### Usage

- Hero images: Full-width, high quality
- Profile photos: Square or 3:4 aspect ratio
- Gallery: Consistent grid layout

---

## 22. Animation Principles

### The Landing Page Standard
The overarching rule for Pholio's motion is: **If it's on the landing page (Studio+, Hero, Agency Perspective), it is the exact motion profile we want everywhere.**

### When to Animate
- **Constantly**: The application should feel alive.
- State changes (hover scaling, focus rings, active states).
- Page transitions and continuous background elements.
- Progress updates andgamified UI elements.

### Animation Style
- **Physics-Based (Springs)**: Use Framer Motion springs (`stiffness: 55, damping: 16` or similar) for bouncy, tactile, organic responses.
- **Interactive**: Tie animations to scroll position (`useScroll`), mouse position (`useMotionValue`), and intersection (`useInView`).
- **Engaging & Extravagant**: Animations should be noticeable, high-polish, and cinematic, moving away from purely "subtle" or invisible transitions.

---

## 23. Component Examples

### Onboarding Card

- Max width: `680px`
- Padding: `3rem 3.5rem`
- Border radius: `16px`
- Shadow: `0 20px 40px -10px rgba(0, 0, 0, 0.08)`

### Form Field Group

- Margin bottom: `1.75rem`
- Label: `0.9rem`, weight `500`
- Input: `1rem` font size, `0.875rem` padding

### Market Fit List

- Background: `#f8f9fa`
- Border radius: `8px`
- Padding: `1rem`
- Margin: `0.75rem` between items

---

## 24. Implementation Notes

### CSS Architecture

- Use CSS variables for consistency
- Mobile-first approach
- Component-based styling
- Minimal global styles

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+

### Performance

- Minimize CSS file size
- Use efficient selectors
- Avoid expensive animations
- Optimize images (WebP format)

---

## 25. Brand Assets

### Logo Usage

- Use logo at appropriate sizes
- Maintain aspect ratio
- Minimum size: `32px` height
- Clear space: `1x` logo height around logo

### Color Usage in Logos

- Primary: Gold (`#C9A55A`) or Dark (`#0f172a`)
- On dark backgrounds: White
- On light backgrounds: Dark or Gold

---

## Quick Reference

### Primary Colors
- Gold: `#C9A55A`
- Dark: `#0f172a`
- Slate: `#64748b`

### Typography
- Font: `Inter`
- Base size: `1rem` (16px)
- Line height: `1.6`

### Spacing
- Base unit: `1rem` (16px)
- Form gap: `1.75rem`
- Section padding: `3rem`

### Border Radius
- Small: `4px`
- Medium: `8px`
- Large: `16px`

### Shadows
- Card: `0 20px 40px -10px rgba(0, 0, 0, 0.08)`
- Button hover: `0 4px 12px rgba(201, 165, 90, 0.2)`

---

**End of Brand Guidelines**

For questions or updates, refer to the design system implementation in `views/onboarding/index.ejs` and `public/styles/global.css`.
