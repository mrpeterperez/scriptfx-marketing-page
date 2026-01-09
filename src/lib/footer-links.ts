export const footerLinks = {
  Product: [
    { label: "Technology", href: "/technology" },
    { label: "Pricing", href: "/pricing" },
    { label: "Features", href: "/features" },
    { label: "Beta", href: "/get-access" },
  ],
  Company: [
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "About", href: "/about" },
  ],
  Social: [
    { label: "X/Twitter", href: "https://twitter.com/scriptfx" },
    { label: "LinkedIn", href: "https://linkedin.com/company/scriptfx" },
  ],
} as const;

export type FooterLinkCategory = keyof typeof footerLinks;
export type FooterLink = (typeof footerLinks)[FooterLinkCategory][number];
