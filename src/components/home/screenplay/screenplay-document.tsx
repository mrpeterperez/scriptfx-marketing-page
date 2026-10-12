"use client";

import * as React from "react";
import { gsap } from "gsap";
import { Bold, Italic, Underline, Strikethrough, ChevronDown } from "lucide-react";
import { ActOneScript } from "./act-one-script";
import { ActTwoTagline } from "./act-two-tagline";
import { ActThreeVoid } from "./act-three-void";

export function ScreenplayDocument({ timeline, onReady }: { timeline: gsap.core.Timeline | null; onReady: React.Dispatch<React.SetStateAction<boolean>> }) {
  const documentRef = React.useRef<HTMLDivElement>(null);
  const paperRef = React.useRef<HTMLDivElement>(null);
  const leftCurtainRef = React.useRef<HTMLDivElement>(null);
  const rightCurtainRef = React.useRef<HTMLDivElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const pagesRef = React.useRef<(HTMLElement | null)[]>([]);
  const [acts, setActs] = React.useState<gsap.core.Timeline[]>([]);

  React.useLayoutEffect(() => {
    const timelines = Array.from({ length: 3 }, () => gsap.timeline({ paused: true }));
    setActs(timelines);
    return () => timelines.forEach((act) => act.kill());
  }, []);

  React.useLayoutEffect(() => {
    if (!timeline || acts.length !== 3 || !paperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set(paperRef.current, { y: 0 });
      gsap.set(leftCurtainRef.current, { xPercent: -102 });
      gsap.set(rightCurtainRef.current, { xPercent: 102 });
      acts.forEach((act, index) => {
        if (index) {
          timeline.to(paperRef.current, {
            y: () => -index * ((pagesRef.current[0]?.offsetHeight || 0) + 24),
            duration: 3.5,
            ease: "none",
          });
        }
        const start = timeline.duration() - (index ? 0.9 : 0);
        act.paused(false);
        timeline.add(act, start);
        if (index === 0) timeline.addLabel("endingReadable", start + act.labels.endingReadable);
        if (index === 2) {
          for (const label of ["margins", "shift", "rightIn", "shakeStart", "dissolve", "shakeEnd", "reveal", "curtainClose", "curtainsClosed"]) {
            if (label in act.labels) timeline.addLabel(label, start + act.labels[label]);
          }
          timeline.to([leftCurtainRef.current, rightCurtainRef.current], { xPercent: 0, duration: 2.8, ease: "power3.inOut" }, "curtainClose");
          timeline.to(toolbarRef.current, { autoAlpha: 0, duration: 0.5 }, "curtainClose");
        }
      });
    }, documentRef);
    onReady(true);
    return () => ctx.revert();
  }, [timeline, acts, onReady]);

  return <div ref={documentRef} className="screenplay-document absolute inset-0 overflow-hidden">
    <div ref={toolbarRef} className="screenplay-preview-toolbar" aria-label="Screenplay editor preview">
      <span className="screenplay-toolbar-placeholder" aria-hidden="true" />
      <div className="screenplay-preview-formats" aria-hidden="true"><Bold size={16} /><Italic size={16} /><Underline size={16} /><Strikethrough size={16} /><span className="screenplay-toolbar-divider" /><span>Action</span><ChevronDown size={12} /></div>
      <span className="screenplay-toolbar-placeholder screenplay-toolbar-placeholder-status" aria-hidden="true" />
    </div>
    <div ref={paperRef} className="screenplay-preview-pages">
      <section ref={(el) => { pagesRef.current[0] = el; }} className="screenplay-preview-page">
        {acts.length === 3 && <ActOneScript timeline={acts[0]} />}
      </section>
      <section ref={(el) => { pagesRef.current[1] = el; }} className="screenplay-preview-page">
        {acts.length === 3 && <ActTwoTagline timeline={acts[1]} />}
      </section>
      <section ref={(el) => { pagesRef.current[2] = el; }} className="screenplay-preview-page">
        {acts.length === 3 && <ActThreeVoid timeline={acts[2]} renderCurtains={false} />}
      </section>
    </div>
    <div ref={leftCurtainRef} className="screenplay-theater-curtain screenplay-theater-curtain-left" />
    <div ref={rightCurtainRef} className="screenplay-theater-curtain screenplay-theater-curtain-right" />
  </div>;
}
