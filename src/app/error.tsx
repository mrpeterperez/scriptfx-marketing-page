"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="site-page"><p className="site-eyebrow">A brief interruption</p><h1>Let’s try that again.</h1><p>This page couldn’t load. Your work in the application is separate.</p><button className="site-button" onClick={reset}>Try again</button></section>; }
