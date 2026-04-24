import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { Logo, LogoMark } from "../components/Logo";
import { Orb } from "../components/Orb";

// Scene 2 — 10 s = 300 frames
const DURATION = 300;

export const Scene2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [DURATION - 35, DURATION], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const ringRotation = frame * 0.5;
  const glowPulse = 1 + Math.sin((frame / 40) * Math.PI) * 0.3;

  // Large mark pops in with spring
  const markScale = spring({ frame, fps, config: { damping: 11, stiffness: 100 }, durationInFrames: 45 });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #110d1a 0%, ${C.bg} 70%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
        opacity,
        overflow: "hidden",
      }}
    >
      {/* Giant glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(34,197,94,${0.06 * glowPulse}) 0%, rgba(124,58,237,${0.12 * glowPulse}) 40%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Rotating rings */}
      <div
        style={{
          position: "absolute",
          width: 640,
          height: 640,
          borderRadius: "50%",
          border: "1px solid rgba(34,197,94,0.12)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${ringRotation}deg)`,
        }}
      >
        {[0, 72, 144, 216, 288].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22c55e",
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateX(317px) translateY(-3.5px)`,
              opacity: 0.65,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          border: "1px dashed rgba(124,58,237,0.18)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${-ringRotation * 0.65}deg)`,
        }}
      />

      <Orb x={1500} y={-80} size={500} color="rgba(124,58,237,0.5)" opacity={0.2} />
      <Orb x={-100} y={700} size={400} color="rgba(34,197,94,0.4)" opacity={0.15} pulseSpeed={120} />

      {/* ── BIG logo (PNG includes icon + PeerCart wordmark) ── */}
      <div style={{ position: "relative", zIndex: 2, transform: `scale(${markScale})`, marginBottom: 8 }}>
        <LogoMark size={260} glow />
      </div>

      {/* Tagline */}
      <FadeIn delay={40} translateY={16} style={{ position: "relative", zIndex: 2, marginTop: 20, paddingBottom: 30 }}>
        <p
          style={{
            fontSize: 30,
            color: C.textSec,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Buy · Sell · Rent · On Campus
        </p>
      </FadeIn>

      {/* Feature pills */}
      <FadeIn delay={65} translateY={16} style={{ position: "relative", zIndex: 2, marginTop: 36 }}>
        <div style={{ display: "flex", gap: 14 }}>
          {["College-only", "Verified Users", "Secure Payments", "Real-time Chat"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};
