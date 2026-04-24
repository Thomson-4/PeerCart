import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 1 — 12 s = 360 frames
const DURATION = 360;

const lines = [
  { text: "You have stuff you don't use.", delay: 12 },
  { text: "Someone 3 floors away needs it.", delay: 60 },
  { text: "But how do you find each other?", delay: 110, accent: true },
];

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [DURATION - 40, DURATION], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
        overflow: "hidden",
      }}
    >
      <Orb x={-200} y={-150} size={700} color="rgba(124,58,237,0.4)" opacity={0.22} delay={10} />
      <Orb x={1400} y={600} size={600} color="rgba(79,70,229,0.4)" opacity={0.18} pulseSpeed={120} delay={30} />

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div style={{ textAlign: "center", maxWidth: 1100, padding: "0 100px", position: "relative", zIndex: 1 }}>
        {lines.map(({ text, delay, accent }) => (
          <FadeIn key={text} delay={delay} duration={28} translateY={24} style={{ marginBottom: 28 }}>
            <p
              style={{
                fontSize: accent ? 70 : 62,
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: accent ? "transparent" : C.text,
                background: accent ? C.gradientText : undefined,
                WebkitBackgroundClip: accent ? "text" : undefined,
                WebkitTextFillColor: accent ? "transparent" : undefined,
                margin: 0,
              }}
            >
              {text}
            </p>
          </FadeIn>
        ))}

        <FadeIn delay={160} duration={24} translateY={12}>
          <p style={{ fontSize: 24, color: C.textSec, fontWeight: 500, marginTop: 20, letterSpacing: "0.02em" }}>
            — The campus marketplace you've been waiting for
          </p>
        </FadeIn>
      </div>

      <LogoWatermark />
    </AbsoluteFill>
  );
};
