export const footerLinks = {
  Product: [
    { label: "Technology", href: "/technology" },
    { label: "Pricing", href: "/pricing" },
    { label: "Beta", href: "/get-access" },
  ],
  Company: [
    { label: "Journal", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  Connect: [
    { label: "X", href: "https://x.com/scriptfx" },
    { label: "LinkedIn", href: "https://linkedin.com/company/scriptfx" },
    { label: "Discord", href: "https://discord.gg/scriptfx" },
  ],
} as const;

export type FooterLinkCategory = keyof typeof footerLinks;
export type FooterLink = (typeof footerLinks)[FooterLinkCategory][number];
