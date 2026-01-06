"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ActFiveReveal() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const logoContainerRef = React.useRef<HTMLDivElement>(null);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const maskedVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const logoContainer = logoContainerRef.current;
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;
    const maskedVideo = maskedVideoRef.current;

    if (!container || !logoContainer || !videoContainer || !video) return;

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(logoContainer, { scale: 0.4, autoAlpha: 0 });
      gsap.set(videoContainer, { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 0.8,
          onEnter: () => {
            // Start video playback
            if (maskedVideo) {
              maskedVideo.currentTime = 0;
              maskedVideo.play().catch(() => {});
            }
            if (video) {
              video.currentTime = 0;
              video.play().catch(() => {});
            }
          },
          onLeaveBack: () => {
            // Pause videos when scrolling back
            if (maskedVideo) maskedVideo.pause();
            if (video) video.pause();
          },
        },
      });

      // === "Meet" text + masked logo fades in ===
      tl.to(
        logoContainer,
        {
          autoAlpha: 1,
          duration: 1.5,
          ease: "power2.out",
        },
        0
      );

      // === Zoom into the masked letters ===
      tl.to(
        logoContainer,
        {
          scale: 12,
          duration: 8.0,
          ease: "power1.inOut",
        },
        0.5
      );

      // === Full video fades in as we zoom deep ===
      tl.to(
        videoContainer,
        {
          autoAlpha: 1,
          duration: 2.5,
          ease: "power2.inOut",
        },
        4.0
      );

      // === Masked logo fades out - now we're fully inside the video ===
      tl.to(
        logoContainer,
        {
          autoAlpha: 0,
          duration: 2.0,
          ease: "power2.in",
        },
        5.5
      );

      // === Scrub video to scroll ===
      if (maskedVideo) {
        tl.to(
          maskedVideo,
          {
            currentTime: 4,
            duration: 8.0,
            ease: "none",
          },
          0
        );
      }

      tl.to(
        video,
        {
          currentTime: 4,
          duration: 8.0,
          ease: "none",
        },
        0
      );

      // === Hold on full video ===
      tl.to({}, { duration: 2.0 });

    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-screen bg-black"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      {/* Full Video - fades in as we zoom into letters */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 flex items-center justify-center opacity-0"
      >
        <video
          ref={videoRef}
          src="/brand/scriptfxtest.mp4"
          className="h-full w-full object-cover"
          muted
          playsInline
          loop
          preload="auto"
        />
      </div>

      {/* Meet ScriptFX - Video masked inside letters */}
      <div
        ref={logoContainerRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 opacity-0"
      >
        <p className="text-center font-body text-[18px] font-normal tracking-[0.05em] text-white/80 md:text-[22px]">
          Meet
        </p>
        {/* SVG with video clipped inside the letters */}
        <div className="relative h-auto w-full max-w-[648px]">
          <svg
            viewBox="0 0 1298 338"
            className="h-auto w-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              <clipPath id="scriptfx-text-mask">
                <path d="M1272.64 234.386L1297.02 253.541H1193.24L1218.31 232.645L1158.41 149.408L1096.77 232.645L1124.28 253.541H1044.53L1071 232.645L1145.53 131.646L1069.95 27.165L1048.01 9.75146H1150.4L1125.33 30.6477L1181.4 108.312L1239.91 30.6477L1212.39 9.75146H1292.5L1266.03 30.6477L1194.28 126.074L1272.64 234.386Z" />
                <path d="M1050.35 9.75146V27.8616H1050V75.9229L1015.87 27.8616H942.385V130.253H1010.65L1038.16 95.0778V183.19L1010.65 148.363H942.385V230.903L980.694 253.541H872.73L897.806 232.645V30.6477L872.73 9.75146H1050.35Z" />
                <path d="M823.616 257.024C790.182 257.024 770.33 232.645 770.33 203.39V105.526H733.762L811.426 48.7578V83.2366H882.822L872.025 105.526H811.426V188.414C811.426 205.131 815.954 222.545 840.681 222.545C852.87 222.545 864.712 218.366 878.642 207.569L880.384 209.311C871.677 242.396 849.388 257.024 823.616 257.024Z" />
                <path d="M640.983 257.024C631.928 257.024 619.739 255.979 608.246 253.193V314.837L646.207 337.126H542.074L567.15 316.23V125.726L544.86 106.919L608.246 79.0576L603.022 107.964L604.763 109.705C615.559 94.0333 636.456 79.7542 661.879 79.7542C697.751 79.7542 736.409 106.919 736.409 163.339C736.409 225.68 688.696 257.024 640.983 257.024ZM646.207 107.616C632.973 107.616 618.694 112.492 608.246 122.243V212.445C608.246 231.6 625.311 242.397 643.769 242.397C671.631 242.397 692.179 216.625 692.179 172.742C692.179 130.95 674.069 107.616 646.207 107.616Z" />
                <path d="M502.144 50.4993C488.561 50.4993 477.068 39.0063 477.068 25.4238C477.068 11.4929 488.561 0 502.144 0C516.075 0 527.568 11.4929 527.568 25.4238C527.568 39.0063 516.075 50.4993 502.144 50.4993ZM524.433 232.645L549.509 253.541H458.262L483.337 232.645V125.726L461.048 106.919L524.433 79.0575V232.645Z" />
                <path d="M448.496 126.422C427.252 119.457 407.748 122.94 397.3 133.736V230.904L435.61 253.541H331.129L356.204 232.645V125.726L333.915 106.919L397.3 79.0576L389.987 123.288L391.728 123.985C403.917 96.1229 429.69 75.5749 463.472 83.2369L448.496 126.422Z" />
                <path d="M276.498 222.545C290.428 222.545 307.842 218.714 327.693 203.39L329.435 205.131C317.245 243.441 289.732 257.024 261.174 257.024C213.809 257.024 178.285 219.062 178.285 167.518C178.285 107.964 225.998 79.7539 268.139 79.7539C294.956 79.7539 315.504 88.1124 329.435 102.043L301.921 130.253L266.398 94.3813C239.581 95.0778 219.729 117.019 219.729 156.373C219.729 194.683 239.233 222.545 276.498 222.545Z" />
                <path d="M41.096 63.3855C41.096 116.323 165.777 103.088 165.777 187.37C165.777 234.735 126.771 257.024 80.1023 257.024C58.5095 257.024 40.0511 252.496 22.6376 245.531L0 256.676V177.27L37.9615 228.814C50.151 235.083 62.6887 238.566 76.9678 238.566C114.581 238.566 123.984 216.276 123.984 198.863C123.984 136.174 1.04481 151.846 1.04481 73.137C1.04481 32.0411 34.8271 6.26904 84.6298 6.26904C102.392 6.26904 117.716 9.40349 133.388 15.6724L153.239 6.26904V84.9782L111.795 28.5584C104.133 25.7722 96.471 24.3791 87.7642 24.3791C50.4993 24.3791 41.096 49.1064 41.096 63.3855Z" />
              </clipPath>
            </defs>
            {/* Video clipped to text shape */}
            <foreignObject
              x="0"
              y="0"
              width="1298"
              height="338"
              clipPath="url(#scriptfx-text-mask)"
            >
              <video
                ref={maskedVideoRef}
                src="/brand/scriptfxtest.mp4"
                className="h-full w-full object-cover"
                style={{ width: "1298px", height: "338px", objectFit: "cover" }}
                muted
                playsInline
                loop
                preload="auto"
              />
            </foreignObject>
            {/* Subtle outline for depth */}
            <g fill="none" stroke="white" strokeWidth="0.5" opacity="0.3">
              <path d="M1272.64 234.386L1297.02 253.541H1193.24L1218.31 232.645L1158.41 149.408L1096.77 232.645L1124.28 253.541H1044.53L1071 232.645L1145.53 131.646L1069.95 27.165L1048.01 9.75146H1150.4L1125.33 30.6477L1181.4 108.312L1239.91 30.6477L1212.39 9.75146H1292.5L1266.03 30.6477L1194.28 126.074L1272.64 234.386Z" />
              <path d="M1050.35 9.75146V27.8616H1050V75.9229L1015.87 27.8616H942.385V130.253H1010.65L1038.16 95.0778V183.19L1010.65 148.363H942.385V230.903L980.694 253.541H872.73L897.806 232.645V30.6477L872.73 9.75146H1050.35Z" />
              <path d="M823.616 257.024C790.182 257.024 770.33 232.645 770.33 203.39V105.526H733.762L811.426 48.7578V83.2366H882.822L872.025 105.526H811.426V188.414C811.426 205.131 815.954 222.545 840.681 222.545C852.87 222.545 864.712 218.366 878.642 207.569L880.384 209.311C871.677 242.396 849.388 257.024 823.616 257.024Z" />
              <path d="M640.983 257.024C631.928 257.024 619.739 255.979 608.246 253.193V314.837L646.207 337.126H542.074L567.15 316.23V125.726L544.86 106.919L608.246 79.0576L603.022 107.964L604.763 109.705C615.559 94.0333 636.456 79.7542 661.879 79.7542C697.751 79.7542 736.409 106.919 736.409 163.339C736.409 225.68 688.696 257.024 640.983 257.024ZM646.207 107.616C632.973 107.616 618.694 112.492 608.246 122.243V212.445C608.246 231.6 625.311 242.397 643.769 242.397C671.631 242.397 692.179 216.625 692.179 172.742C692.179 130.95 674.069 107.616 646.207 107.616Z" />
              <path d="M502.144 50.4993C488.561 50.4993 477.068 39.0063 477.068 25.4238C477.068 11.4929 488.561 0 502.144 0C516.075 0 527.568 11.4929 527.568 25.4238C527.568 39.0063 516.075 50.4993 502.144 50.4993ZM524.433 232.645L549.509 253.541H458.262L483.337 232.645V125.726L461.048 106.919L524.433 79.0575V232.645Z" />
              <path d="M448.496 126.422C427.252 119.457 407.748 122.94 397.3 133.736V230.904L435.61 253.541H331.129L356.204 232.645V125.726L333.915 106.919L397.3 79.0576L389.987 123.288L391.728 123.985C403.917 96.1229 429.69 75.5749 463.472 83.2369L448.496 126.422Z" />
              <path d="M276.498 222.545C290.428 222.545 307.842 218.714 327.693 203.39L329.435 205.131C317.245 243.441 289.732 257.024 261.174 257.024C213.809 257.024 178.285 219.062 178.285 167.518C178.285 107.964 225.998 79.7539 268.139 79.7539C294.956 79.7539 315.504 88.1124 329.435 102.043L301.921 130.253L266.398 94.3813C239.581 95.0778 219.729 117.019 219.729 156.373C219.729 194.683 239.233 222.545 276.498 222.545Z" />
              <path d="M41.096 63.3855C41.096 116.323 165.777 103.088 165.777 187.37C165.777 234.735 126.771 257.024 80.1023 257.024C58.5095 257.024 40.0511 252.496 22.6376 245.531L0 256.676V177.27L37.9615 228.814C50.151 235.083 62.6887 238.566 76.9678 238.566C114.581 238.566 123.984 216.276 123.984 198.863C123.984 136.174 1.04481 151.846 1.04481 73.137C1.04481 32.0411 34.8271 6.26904 84.6298 6.26904C102.392 6.26904 117.716 9.40349 133.388 15.6724L153.239 6.26904V84.9782L111.795 28.5584C104.133 25.7722 96.471 24.3791 87.7642 24.3791C50.4993 24.3791 41.096 49.1064 41.096 63.3855Z" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
