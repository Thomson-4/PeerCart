import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./colors";

interface PhoneMockupProps {
  children: React.ReactNode;
  slideFrom?: "right" | "left" | "bottom";
  delay?: number;
  scale?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  slideFrom = "right",
  delay = 0,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 80 },
    durationInFrames: 45,
  });

  const translateX =
    slideFrom === "right"
      ? interpolate(progress, [0, 1], [120, 0])
      : slideFrom === "left"
      ? interpolate(progress, [0, 1], [-120, 0])
      : 0;
  const translateY =
    slideFrom === "bottom" ? interpolate(progress, [0, 1], [120, 0]) : 0;
  const opacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  const W = 320 * scale;
  const H = 650 * scale;
  const R = 44 * scale;

  return (
    <div
      style={{
        width: W,
        height: H,
        borderRadius: R,
        background: "#0d0d1a",
        border: `1.5px solid rgba(124,58,237,0.35)`,
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.06),
          0 40px 80px rgba(0,0,0,0.6),
          0 0 60px rgba(124,58,237,0.15),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
        overflow: "hidden",
        position: "relative",
        transform: `translateX(${translateX}px) translateY(${translateY}px)`,
        opacity,
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 14 * scale,
          left: "50%",
          transform: "translateX(-50%)",
          width: 100 * scale,
          height: 28 * scale,
          background: "#0a0a0a",
          borderRadius: 20 * scale,
          zIndex: 10,
        }}
      />
      {/* Status bar */}
      <div
        style={{
          height: 50 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${22 * scale}px`,
          paddingTop: 10 * scale,
        }}
      >
        <span style={{ color: C.text, fontSize: 11 * scale, fontWeight: 700 }}>9:41</span>
        <div style={{ display: "flex", gap: 4 * scale, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2 * scale }}>
            {[3, 4, 5, 6].map((h) => (
              <div key={h} style={{ width: 3 * scale, height: h * scale, background: C.text, borderRadius: 1 }} />
            ))}
          </div>
          <svg width={14 * scale} height={14 * scale} viewBox="0 0 24 24" fill={C.text}>
            <path d="M1 6s4-4 11-4 11 4 11 4M5 10s2.5-2.5 7-2.5S19 10 19 10M8.5 14.5l3.5-3.5 3.5 3.5M12 18v.01" stroke={C.text} strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
          <div style={{ width: 20 * scale, height: 11 * scale, border: `1px solid ${C.text}`, borderRadius: 3 * scale, padding: 1 * scale, display: "flex" }}>
            <div style={{ flex: 1, background: C.text, borderRadius: 2 * scale }} />
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div style={{ flex: 1, overflow: "hidden", height: `calc(100% - ${50 * scale}px)` }}>
        {children}
      </div>
    </div>
  );
};
