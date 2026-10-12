export const footerLinks = {
  Products: [{ label: "All products", href: "/products" },{ label: "Writing", href: "/writing" }, { label: "Production", href: "/production" }, { label: "Market", href: "/market" }, { label: "Technology", href: "/technology" }, { label: "Pricing", href: "/pricing" }],
  Resources: [{ label: "All resources", href: "/resources" }, { label: "Solutions", href: "/solutions" }, { label: "Design Kit", href: "/design-kit" },{ label: "Blog", href: "/blog" }, { label: "Templates", href: "/templates" }, { label: "About", href: "/about" }, { label: "FAQ", href: "/faq" }],
  Connect: [{ label: "Enterprise", href: "/enterprise" }, { label: "Contact Sales", href: "/contact-sales" },{ label: "Contact", href: "/contact" }, { label: "Get access", href: "/get-access" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }],
} as const;
export type FooterLinkCategory = keyof typeof footerLinks;
export type FooterLink = (typeof footerLinks)[FooterLinkCategory][number];
