type MediaPlaceholderProps = {
  label: string;
  variant?: "page" | "frames" | "sound";
  wide?: boolean;
  number?: string;
};

export function MediaPlaceholder({ label, variant = "frames", wide = false, number = "01" }: MediaPlaceholderProps) {
  return (
    <figure className={`visual-media visual-media--${variant}${wide ? " visual-media--wide" : ""}`} data-visual-media data-visual-reveal aria-label={`${label} — image placeholder`}>
      <div className="visual-media-art" data-media-art aria-hidden="true">
        <div className="visual-media-glow" />
        {variant === "page" ? <div className="placeholder-paper"><span>INT. YOUR NEXT SCENE — DAY</span><div className="paper-lines"><i /><i /><i /></div><div className="paper-dialogue"><b>YOUR CHARACTER</b><i /><i /></div><div className="paper-lines"><i /><i /></div><span className="paper-page-number">1.</span></div>
          : variant === "sound" ? <div className="placeholder-wave">{[18,32,54,26,72,94,45,67,100,58,34,79,48,94,62,38,86,100,57,29,64,84,44,20,38,57,30].map((height,index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
          : <div className="placeholder-frames"><div /><div /><div /></div>}
      </div>
      <div className="visual-media-top" aria-hidden="true"><span>SFX / {number}</span><span>＋</span></div>
      <figcaption><span>{label}</span><span>Image placeholder</span></figcaption>
    </figure>
  );
}
