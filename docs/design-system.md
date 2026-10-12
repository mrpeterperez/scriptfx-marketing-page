# ScriptFX landing design system

The Design Kit at `/design-kit` documents and previews the landing site's visual language. Resources and the footer link to it. Its controls save browser-local overrides; they do not modify source files or publish changes to other visitors.

## Foundations

- Manrope is the default typeface. Satoshi and Outfit are bundled alternatives.
- Ink is `#202020`, paper is `#ffffff`, secondary text is `#666666`, and borders are `#dddddd`.
- Body text starts at 16px. Navigation labels and supporting UI use at least 14px. Screenplay and illustration annotations can be smaller.
- Headings use tight letter spacing, with italics reserved for emphasis.
- Primary actions use text labels, a minimum 48px height, and rounded corners. Decorative CTA arrows are omitted.
- Spacing follows a 4px base, with 80px default section gaps. New content panels use 24px corners.

Defaults and validated settings live in `src/lib/site/design-tokens.ts`. New pages and menus consume these through `src/app/catalog.css`. The existing cinematic homepage retains its scene timing and media layout.

## Editing and persistence

Controls update the Design Kit specimens immediately. **Apply to this browser** stores settings under `scriptfx-design-kit-v1` and applies the matching CSS custom properties throughout the current browser. Other tabs receive storage events. **Reset to defaults** removes the stored override and restores the original values. CSS and JSON exports download the current draft, including unapplied settings.

Typography, ink, and button corners affect the landing hero and shared navigation. Panel corners and section spacing affect the catalog pages, dropdowns, and kit specimens. Existing cinematic layouts retain their geometry. The old floating FontPicker remains in the repository but is no longer mounted, avoiding competing font overrides.

## Navigation

Products, Solutions, and Resources are disclosure buttons. Pointer hover or click opens a full-width, three-column panel. Down chevrons indicate disclosures, and the logo stays centered between the navigation groups. Arrow Down enters the panel; Escape closes it and returns focus to its trigger. Tab follows the native link order. Clicking outside, leaving the header, or selecting a destination closes the panel.

At 1240px and below, the header uses a Radix Sheet with Accordion sections. Escape dismisses the dialog. Links close it before navigating. Header and footer home logos retain their scroll-to-top behavior.

Navigation and page content come from `src/lib/site/catalog.ts`. Product and solution routes share templates but have separate descriptions, workflows, availability labels, and FAQs. Resource pages connect to existing articles and templates. The sales page uses the existing marketing contact form and backend configuration; no separate sales submission service is introduced.

## Components and motion

Reusable scene studies illustrate screenplay, audio, and composition workflows. They are illustrative, not live product screenshots or audio players. New product pages mark unreleased features as in development.

Controls use 160ms transitions; dropdowns use a 180ms entrance. Reduced-motion preferences remove decorative animation. Keyboard focus must remain visible. Custom color combinations require a contrast check before adoption.

## Validation

Run the production build, then the site's route check against the actual preview port using `SITE_TEST_URL`. Verify desktop and mobile menus, keyboard dismissal, deep links, Design Kit persistence, and resetting overrides in the rendered site. Do not submit sales or waitlist forms during UI checks.

## shadcn/ui foundation

The landing site uses the official shadcn/ui New York registry with Radix primitives, configured in `components.json`. Components were installed through shadcn CLI 4.21.4. Their source is owned locally in `src/components/ui`; `cn`, `class-variance-authority`, `radix-ui`, and `tw-animate-css` supply the supporting dependencies.

`src/app/shadcn-theme.css` maps the kit's semantic colors and shape tokens onto ScriptFX's existing design settings. Preserve Manrope, the `#202020` charcoal, centered logo, full-width dropdowns, and GSAP hero treatment when updating components. Top-level navigation stays transparent; dropdown item hover states use ScriptFX charcoal with white text.

The Design Kit uses actual Card, Tabs, Button, Input, Label, Select, Slider, Accordion, Badge, and Separator components. The hero, product CTAs, pricing controls, and contact form consume the same components. Desktop navigation uses Navigation Menu; mobile navigation uses Sheet and Accordion. Radix owns dismissal, keyboard interaction, and focus management. The Slider source adds a `thumbLabel` prop to label each one-thumb control accessibly.

To add a component, run `npx shadcn@latest add <component>`. Review generated changes before overwriting customized component files. Styling belongs in shared semantic tokens and component variants, not duplicated sample markup. The legacy custom CSS remains for unaffected landing sections and can be migrated deliberately without changing cinematic timing.
