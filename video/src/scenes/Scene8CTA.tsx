import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { LogoMark } from "../components/Logo";
import { Orb } from "../components/Orb";

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 40, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowSize = 320 + Math.sin((frame / 42) * Math.PI) * 45;

  // Logo spring
  const logoScale = spring({ frame, fps, config: { damping: 11, stiffness: 90 }, durationInFrames: 50 });

  // Orbiting particles
  const particleCount = 14;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #12081e 0%, #0a0a0a 65%)`,
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
          background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, rgba(34,197,94,0.06) 40%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Orbiting dots */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2 + frame * 0.009;
        const radius = 400 + Math.sin(frame * 0.018 + i * 0.8) * 22;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const dotOpacity = 0.15 + Math.sin(frame * 0.045 + i * 0.6) * 0.12;
        const isGreen = i % 3 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: i % 4 === 0 ? 6 : 3,
              height: i % 4 === 0 ? 6 : 3,
              borderRadius: "50%",
              background: isGreen ? C.green : C.accent,
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity: dotOpacity,
              boxShadow: isGreen ? `0 0 8px ${C.green}` : `0 0 6px ${C.accent}`,
            }}
          />
        );
      })}

      <Orb x={-150} y={600} size={500} color="rgba(163,230,53,0.3)" opacity={0.1} />
      <Orb x={1600} y={-100} size={500} color="rgba(124,58,237,0.4)" opacity={0.14} />

      {/* Content */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>

        {/* Logo */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "center", transform: `scale(${logoScale})` }}>
          <LogoMark size={200} glow />
        </div>

        {/* Main tagline */}
        <FadeIn delay={30} translateY={28}>
          <h2
            style={{
              fontSize: 62,
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              margin: "0 0 10px",
              color: C.text,
            }}
          >
            Your campus.{" "}
            <span
              style={{
                background: C.gradientText,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your marketplace.
            </span>
          </h2>
        </FadeIn>

        {/* Sub-tagline */}
        <FadeIn delay={52} translateY={18}>
          <p style={{ fontSize: 22, color: C.textSec, fontWeight: 500, margin: "0 0 28px", letterSpacing: "0.01em" }}>
            Buy · Sell · Rent — safely, inside REVA University
          </p>
        </FadeIn>

        {/* Live URL pill */}
        <FadeIn delay={72} translateY={18}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.35)",
              borderRadius: 999,
              padding: "12px 32px",
              marginBottom: 22,
              boxShadow: "0 0 32px rgba(124,58,237,0.18)",
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: C.green,
                boxShadow: `0 0 12px ${C.green}`,
                opacity: frame % 20 < 10 ? 1 : 0.6,
              }}
            />
            <span style={{ color: "#a78bfa", fontSize: 22, fontWeight: 700, letterSpacing: "0.015em" }}>
              peer-cart-theta.vercel.app
            </span>
          </div>
        </FadeIn>

        {/* Attribution */}
        <FadeIn delay={95} translateY={14}>
          <p style={{ color: `${C.textSec}88`, fontSize: 15, margin: "0 0 26px", letterSpacing: "0.04em" }}>
            Built by students · For REVA University · 2024
          </p>
        </FadeIn>

        {/* CTA action pills */}
        <FadeIn delay={118} translateY={14}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { text: "🛒 Buy on campus", primary: true },
              { text: "📸 Sell in 30 seconds", primary: false },
              { text: "🔒 Zero-risk escrow", primary: false },
              { text: "🛡️ Verified users only", primary: false },
            ].map(({ text, primary }, i) => {
              const pillDelay = 118 + i * 10;
              const pillOpacity = interpolate(frame, [pillDelay, pillDelay + 18], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              const pillTy = interpolate(frame, [pillDelay, pillDelay + 18], [10, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              return (
                <div
                  key={text}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 999,
                    background: primary ? C.gradientBg : "rgba(255,255,255,0.045)",
                    border: primary ? "none" : "1px solid rgba(255,255,255,0.1)",
                    color: C.white,
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: primary ? "0 0 24px rgba(124,58,237,0.4)" : "none",
                    opacity: pillOpacity,
                    transform: `translateY(${pillTy}px)`,
                  }}
                >
                  {text}
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
};
