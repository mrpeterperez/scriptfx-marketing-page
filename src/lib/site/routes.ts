import { products, solutions } from "./catalog";
import { features } from "./features";
export const publicRoutes = ["/products", "/solutions", "/resources", "/resources/guides", "/enterprise", "/contact-sales", ...products.map(item => `/products/${item.slug}`), ...solutions.map(item => `/solutions/${item.slug}`), "/", "/features", "/writing", "/technology", "/about", "/faq", "/contact", "/blog", "/templates", ...features.map(feature => `/features/${feature.slug}`)];
