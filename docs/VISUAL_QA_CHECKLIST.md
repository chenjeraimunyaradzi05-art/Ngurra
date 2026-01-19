# Visual QA Checklist - Ngurra Pathways / Gimbi

## Design System Standards

### Card Component Variants

| Variant       | Use Case                        | Classes                                                                                                                   |
| ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `ngurra`      | Sidebar cards, content cards    | `backdrop-blur-md bg-white/80 border-slate-200 dark:bg-[#0f172a]/72 dark:border-slate-700/30 shadow-sm border rounded-xl` |
| `ngurra-dark` | Dark backgrounds                | `backdrop-blur-md bg-slate-900/90 border-slate-700/50 shadow-sm border rounded-xl`                                        |
| `aura`        | CTA cards, gradient backgrounds | `backdrop-blur-sm border border-white/20 shadow-lg rounded-xl`                                                            |
| `glass`       | Glass morphism effect           | `bg-white/10 backdrop-blur-md border border-white/20 rounded-xl`                                                          |
| `cosmic`      | Deep space theme                | `bg-gradient-to-br from-[#1A0F2E]/90 to-[#2D1B69]/80 border border-[#FFD700]/20 backdrop-blur-sm rounded-xl`              |

### Spacing Standards

| Element        | Padding     | Gap         |
| -------------- | ----------- | ----------- |
| Card content   | `p-4` (md)  | -           |
| Card sections  | -           | `space-y-4` |
| Grid layouts   | -           | `gap-3`     |
| Button padding | `py-2 px-4` | -           |

### Border Radius

- Cards: `rounded-xl` (consistent)
- Buttons: `rounded-lg`
- Avatars: `rounded-full`
- Tags/badges: `rounded-full`
- Inner elements: `rounded-lg`

### Color Palette

- **Primary gradient**: `linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #6366f1 100%)`
- **Light mode bg**: `bg-white/80`, `bg-slate-50`
- **Dark mode bg**: `dark:bg-[#0f172a]/72`, `dark:bg-slate-950`
- **Text (light)**: `text-slate-900`, `text-slate-700`, `text-slate-600`
- **Text (dark)**: `dark:text-white`, `dark:text-[#e2e8f0]`, `dark:text-[#94a3b8]`
- **Accent pink**: `text-pink-600`, `dark:text-[#ec4899]`
- **Accent purple**: `text-purple-600`, `dark:text-[#a855f7]`

---

## QA Checklist

### ✅ Contrast & Readability

- [ ] Text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- [ ] Links distinguishable from body text
- [ ] Focus states visible and clear
- [ ] Placeholder text has sufficient contrast

### ✅ Spacing & Alignment

- [ ] Consistent padding inside cards (p-4)
- [ ] Consistent gaps between cards (gap-3 or space-y-4)
- [ ] Content aligned properly in both LTR layouts
- [ ] No content overflow or truncation issues

### ✅ Responsive Behavior

- [ ] Cards stack on mobile (single column)
- [ ] Sidebars hidden on mobile (`hidden lg:block`)
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll on mobile
- [ ] Text readable without zooming

### ✅ Dark Mode

- [ ] All cards have proper dark mode variants
- [ ] Text colors invert appropriately
- [ ] Borders visible in dark mode
- [ ] Gradients work in both modes
- [ ] No flash of wrong theme on load

### ✅ Interactive States

- [ ] Hover states on all clickable elements
- [ ] Active/pressed states defined
- [ ] Disabled states clearly distinguishable
- [ ] Loading states for async content

### ✅ Component Consistency

- [x] All sidebar cards use `Card variant="ngurra"`
- [x] All cards have `rounded-xl`
- [x] Padding is `p-4` (md) for all content cards
- [ ] Job cards match sidebar card styling
- [x] Hero CTAs have consistent hover effects

---

## Files Audited

| File                                       | Status           | Notes                    |
| ------------------------------------------ | ---------------- | ------------------------ |
| `apps/web/src/app/page.tsx`                | ✅ Refactored    | Uses Card component      |
| `apps/web/src/components/FeaturedJobs.tsx` | ⚠️ Inline styles | Could use Card component |
| `apps/web/src/components/ui/Card.tsx`      | ✅ Updated       | Added ngurra variants    |
| `apps/web/src/app/globals.css`             | ✅ Reviewed      | Theme variables present  |

---

## Remaining Actions

1. **FeaturedJobs.tsx**: Consider refactoring to use Card component wrapper
2. **Mobile testing**: Verify touch targets and responsive behavior
3. **Screen reader testing**: Verify ARIA labels and semantic HTML
4. **Performance**: Check for layout shifts on load

---

## Quick Fixes Applied

### Card Consistency

- Changed all `rounded-2xl` → `rounded-xl` for uniform border radius
- Standardized padding to `p-4` across all cards
- Created `ngurra` variant in Card component for homepage cards
- Removed duplicate `cardBase` variable definitions in favor of shared component

### Hydration Fixes

- Added `suppressHydrationWarning` prop to Card component
- Ensured server/client class names match exactly
