import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { Logo, LogoMark } from "../components/Logo";
import { Orb } from "../components/Orb";

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  // Final fade to black
  const fadeOut = interpolate(frame, [durationInFrames - 40, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing outer glow
  const glowSize = 300 + Math.sin((frame / 40) * Math.PI) * 40;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #110d1a 0%, #0a0a0a 65%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      {/* Animated background glow */}
      <div
        style={{
          position: "absolute",
          width: glowSize * 2,
          height: glowSize * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Particle-like dots */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + frame * 0.008;
        const radius = 380 + Math.sin(frame * 0.02 + i) * 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const dotOpacity = 0.2 + Math.sin(frame * 0.05 + i * 0.5) * 0.15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: C.accent,
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity: dotOpacity,
            }}
          />
        );
      })}

      <Orb x={-150} y={600} size={500} color="rgba(163,230,53,0.3)" opacity={0.12} />
      <Orb x={1600} y={-100} size={500} color="rgba(124,58,237,0.4)" opacity={0.15} />

      {/* Content */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>

        {/* Logo — full PNG (icon + PeerCart wordmark) */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "center" }}>
          <LogoMark size={180} glow />
        </div>

        {/* Main tagline */}
        <FadeIn delay={30} translateY={30}>
          <h2
            style={{
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: "0 0 14px",
              color: C.text,
              maxWidth: 1400,
            }}
          >
            Because the best marketplace{" "}
            <br />
            you'll ever have…{" "}
            <span
              style={{
                background: C.gradientText,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              is right outside your door.
            </span>
          </h2>
        </FadeIn>

        {/* URL */}
        <FadeIn delay={60} translateY={20}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: 999,
              padding: "10px 28px",
              marginBottom: 20,
              boxShadow: "0 0 30px rgba(124,58,237,0.15)",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
            <span style={{ color: "#a78bfa", fontSize: 20, fontWeight: 700, letterSpacing: "0.02em" }}>
              peer-cart-umber.vercel.app
            </span>
          </div>
        </FadeIn>

        {/* Sub-line */}
        <FadeIn delay={90} translateY={16}>
          <p style={{ color: C.textSec, fontSize: 16, margin: "0 0 24px", letterSpacing: "0.01em" }}>
            REVA University Campus Marketplace · Free to join · No strangers
          </p>
        </FadeIn>

        {/* CTA pills */}
        <FadeIn delay={115} translateY={16}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {["Buy on campus", "Sell in 30 seconds", "Rent anything", "Zero risk escrow"].map((text, i) => (
              <div
                key={text}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  background: i === 0 ? C.gradientBg : "rgba(255,255,255,0.04)",
                  border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: C.white,
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: i === 0 ? "0 0 20px rgba(124,58,237,0.35)" : "none",
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
