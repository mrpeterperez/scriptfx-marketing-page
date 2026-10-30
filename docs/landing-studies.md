# Write chapter studies

The comparison pages retain the current hero, screenplay introduction, Hear, See, and closing sections. The homepage at `/` keeps its existing Write flow.

- `/preview/landing-scroll#write-study` holds the Write heading and original introduction while the typewriter image exits. Scrolling advances through Familiar, Beats, Versions, and Together. The feature controls can also jump to those scroll positions.
- `/preview/landing-tap#write-study` opens on the product. Scrolling advances through all four writing features while the Write heading remains in place. The tabs jump to the corresponding scroll position. After Together, Write slides left and the existing Hear chapter enters from the right at a steady height, then continues its existing sequence. Scrolling back reverses the handoff.
- `/preview/landing-stacks#stack-write` pairs oversized headlines with swipeable product card stacks. Horizontal touch or mouse drags, arrow keys, and previous/next buttons change features within each chapter. Vertical scrolling brings the next chapter over the previous one. Write, Hear, and See each have their own stack, captions, and material finishes.
- `/preview/landing-legacy` restores the feature and closing scroll sequence used in revision `e808b76` on October 22. It reuses the preserved `FeaturesSection` and `FooterSection`, including six numbered features, the workflow message, setup cards, and closing reveal. The modern presentation uses the current Helvetica type, real product previews, and one caption below the right panel. Its original left sequence remains Write, Hear it, Build it, Direct it, Act it, and Watch it. Each chapter has feature tabs above the right preview, with an active gold accent and a caption below. The original feature presentation remains the component default.

Both pages use the existing product preview, version cards, collaboration illustration, and material textures. The screenplay and Beats views share one iframe, preserving the demonstration document. The optional fit setting uses the application's zoom control to fit the page within this smaller frame.

The guided sessions use isolated recovery and window-sync adapters, so comparing previews cannot trigger a live-document conflict notice.

Phone layouts place the four feature controls above the product and the active caption beneath it. Reduced motion and screens under 701 pixels high use a direct, unpinned feature selector. The previews are excluded from search indexing and link to one another for comparison.
