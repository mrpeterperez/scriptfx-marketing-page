import Link from "next/link";
import { productAreas } from "@/lib/site/config";
export function ProductJourney() {
  return <section className="product-journey" aria-labelledby="journey-title"><p className="site-eyebrow">One story. Every chapter.</p><h2 id="journey-title">Writing. Production. Market.</h2><p className="site-description">Start on the page. Follow the story further.</p><div className="journey-grid">{productAreas.map(area => <Link className="journey-card" href={`/${area.slug}`} key={area.slug}><div className="journey-meta"><span>{area.number}</span><span>{area.status}</span></div><h3>{area.title}</h3><p>{area.description}</p><span className="journey-link">Explore {area.title}</span></Link>)}</div></section>;
}
