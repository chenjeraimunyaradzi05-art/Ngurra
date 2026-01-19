# Accessibility Guidelines

This document outlines accessibility standards and best practices for Ngurra Pathways, ensuring the platform is usable by everyone.

## Table of Contents

- [Standards Compliance](#standards-compliance)
- [General Principles](#general-principles)
- [Component Guidelines](#component-guidelines)
- [Testing Procedures](#testing-procedures)
- [Common Patterns](#common-patterns)
- [Resources](#resources)

## Standards Compliance

Ngurra Pathways follows these accessibility standards:

- **WCAG 2.1 Level AA** - Primary compliance target
- **Section 508** - US federal accessibility requirements
- **EN 301 549** - European accessibility standard
- **WAI-ARIA 1.2** - Accessible Rich Internet Applications

## General Principles

### POUR Principles

1. **Perceivable** - Users must be able to perceive the information
2. **Operable** - Users must be able to operate the interface
3. **Understandable** - Information and operation must be understandable
4. **Robust** - Content must be robust enough for various assistive technologies

### Key Requirements

- All non-text content has text alternatives
- Color is not the only means of conveying information
- Keyboard accessible (all functionality without a mouse)
- Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Resize text up to 200% without loss of functionality
- Clear focus indicators
- Logical tab order

## Component Guidelines

### Buttons

```tsx
// ✅ Good - Accessible button
<Button
  onClick={handleClick}
  aria-label="Submit application for Software Developer position"
>
  Apply Now
</Button>

// ❌ Bad - Missing accessible name
<Button onClick={handleClick}>
  <Icon name="arrow-right" />
</Button>
```

**Requirements:**
- Clear, descriptive text or `aria-label`
- Visible focus state
- Minimum 44x44px touch target on mobile
- Disabled state visually distinct and announced

### Forms

```tsx
// ✅ Good - Accessible form field
<div>
  <label htmlFor="email">
    Email Address <span aria-hidden="true">*</span>
    <span className="sr-only">(required)</span>
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error email-hint"
    aria-invalid={hasError}
  />
  <p id="email-hint" className="hint">
    We'll never share your email
  </p>
  {hasError && (
    <p id="email-error" className="error" role="alert">
      Please enter a valid email address
    </p>
  )}
</div>
```

**Requirements:**
- Labels programmatically associated with inputs
- Required fields indicated
- Error messages linked with `aria-describedby`
- Error state announced with `aria-invalid`

### Modals

```tsx
// ✅ Good - Accessible modal
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Application</h2>
  <p id="modal-description">
    Are you sure you want to submit your application?
  </p>
  <Button onClick={handleClose}>Cancel</Button>
  <Button onClick={handleConfirm}>Confirm</Button>
</Modal>
```

**Requirements:**
- Focus trapped within modal
- Escape key closes modal
- Focus returned to trigger on close
- Proper ARIA attributes
- Screen reader announcement on open

### Navigation

```tsx
// ✅ Good - Accessible navigation
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a 
        href="/jobs" 
        role="menuitem"
        aria-current={isCurrentPage ? 'page' : undefined}
      >
        Jobs
      </a>
    </li>
    {/* More menu items */}
  </ul>
</nav>

// Skip link at top of page
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

**Requirements:**
- Skip links for keyboard users
- Current page indicated with `aria-current`
- Landmark roles used appropriately
- Mobile menu keyboard accessible

### Tables

```tsx
// ✅ Good - Accessible data table
<table>
  <caption>Job Applications - March 2024</caption>
  <thead>
    <tr>
      <th scope="col">Position</th>
      <th scope="col">Company</th>
      <th scope="col">Status</th>
      <th scope="col">Date Applied</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Software Developer</td>
      <td>Tech Corp</td>
      <td>
        <span className="status pending">
          Pending
          <span className="sr-only"> review</span>
        </span>
      </td>
      <td>March 15, 2024</td>
    </tr>
  </tbody>
</table>
```

**Requirements:**
- Descriptive captions
- Header cells with proper scope
- Don't use tables for layout
- Complex tables have `headers` attribute

### Images

```tsx
// ✅ Good - Decorative image
<img src="decoration.svg" alt="" aria-hidden="true" />

// ✅ Good - Informative image
<img 
  src="job-location-map.png" 
  alt="Map showing office location at 123 Sydney Street"
/>

// ✅ Good - Complex image with extended description
<figure>
  <img 
    src="career-progression.svg" 
    alt="Career progression chart"
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description">
    Chart showing typical career progression from Junior to Senior roles,
    with an average of 3-5 years between each level.
  </figcaption>
</figure>
```

**Requirements:**
- All images have alt text (empty for decorative)
- Alt text describes the function, not just appearance
- Complex images have extended descriptions
- Icons with `aria-hidden` if decorative

## Testing Procedures

### Automated Testing

Run automated accessibility tests:

```bash
# Run axe-core tests
pnpm test:a11y

# Run Playwright accessibility tests
pnpm test:e2e --grep "accessibility"
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Can navigate entire page with Tab key
- [ ] Tab order is logical (left to right, top to bottom)
- [ ] All interactive elements are focusable
- [ ] Focus indicator is clearly visible
- [ ] Can operate all controls with Enter/Space
- [ ] Can close modals/menus with Escape
- [ ] Can navigate dropdowns with Arrow keys

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with VoiceOver (macOS)
- [ ] Page title is announced on load
- [ ] All content is read in logical order
- [ ] Form labels are announced with inputs
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced

#### Visual Testing
- [ ] Text is readable at 200% zoom
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Information not conveyed by color alone
- [ ] Content reflows at narrow widths
- [ ] Focus indicators visible
- [ ] Error states are clear

#### Mobile Accessibility
- [ ] Touch targets are at least 44x44px
- [ ] Content is reachable with one hand
- [ ] Text is readable without zooming
- [ ] Swipe gestures have alternatives

### Tools

- **axe DevTools** - Browser extension for quick audits
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Built into Chrome DevTools
- **Color Contrast Analyzer** - Check color ratios
- **NVDA** - Free Windows screen reader
- **VoiceOver** - Built into macOS

## Common Patterns

### Loading States

```tsx
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <div role="status">
      <span className="sr-only">Loading jobs...</span>
      <Spinner aria-hidden="true" />
    </div>
  ) : (
    <JobsList jobs={jobs} />
  )}
</div>
```

### Toast Notifications

```tsx
<div 
  role="alert" 
  aria-live="assertive"
  aria-atomic="true"
>
  {message}
</div>
```

### Search Results

```tsx
<div aria-live="polite">
  <p className="sr-only">
    {count} jobs found for "{query}"
  </p>
  <JobsList jobs={results} />
</div>
```

### Pagination

```tsx
<nav aria-label="Pagination">
  <ul>
    <li>
      <a 
        href="/jobs?page=1" 
        aria-label="Go to page 1"
        aria-current={currentPage === 1 ? 'page' : undefined}
      >
        1
      </a>
    </li>
    {/* More pages */}
  </ul>
</nav>
```

## Resources

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Training

- [Web Accessibility Initiative (WAI) Tutorials](https://www.w3.org/WAI/tutorials/)
- [Deque University](https://dequeuniversity.com/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Reporting Issues

Found an accessibility issue? Please report it:

1. **GitHub Issues**: Tag with `accessibility` label
2. **Email**: a11y@ngurra-pathways.com
3. **Include**: 
   - URL of the page
   - Browser and assistive technology used
   - Steps to reproduce
   - Expected vs actual behavior
