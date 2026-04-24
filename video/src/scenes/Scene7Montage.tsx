import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 7 — 12 s = 360 frames

const features = [
  { icon: "🛒", label: "Buy",        sub: "Browse campus listings",      color: C.accent,   delay: 0 },
  { icon: "📸", label: "Sell",       sub: "Live photo, instant post",    color: "#4f46e5",  delay: 8 },
  { icon: "🔄", label: "Rent",       sub: "Rent anything on campus",     color: C.lime,     delay: 16 },
  { icon: "💬", label: "Chat",       sub: "In-app messaging",            color: "#0ea5e9",  delay: 24 },
  { icon: "🔒", label: "Escrow",     sub: "Safe payment hold",           color: C.green,    delay: 32 },
  { icon: "🛡️", label: "Trust",      sub: "Verified campus users",       color: C.amber,    delay: 40 },
];

const FeatureCard: React.FC<{
  icon: string;
  label: string;
  sub: string;
  color: string;
  delay: number;
}> = ({ icon, label, sub, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, stiffness: 120 },
    durationInFrames: 40,
  });

  const scale = interpolate(progress, [0, 1], [0.5, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
  const ty = interpolate(progress, [0, 1], [40, 0], { extrapolateRight: "clamp" });

  const glowPulse = 1 + Math.sin(((frame + delay * 10) / 60) * Math.PI) * 0.15;

  return (
    <div
      style={{
        width: 220,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}30`,
        borderRadius: 20,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        transform: `scale(${scale}) translateY(${ty}px)`,
        opacity,
        boxShadow: `0 0 ${30 * glowPulse}px ${color}18, 0 20px 40px rgba(0,0,0,0.3)`,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `${color}18`,
          border: `1.5px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          boxShadow: `0 0 20px ${color}25`,
        }}
      >
        {icon}
      </div>
      <p style={{ color: C.text, fontWeight: 900, fontSize: 18, margin: 0, letterSpacing: "-0.02em" }}>{label}</p>
      <p style={{ color: C.textSec, fontSize: 11, margin: 0, textAlign: "center", lineHeight: 1.4 }}>{sub}</p>
    </div>
  );
};

export const Scene7Montage: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 60px",
        gap: 40,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <Orb x={400} y={-200} size={800} color="rgba(124,58,237,0.3)" opacity={0.15} />
      <Orb x={1000} y={600} size={600} color="rgba(79,70,229,0.3)" opacity={0.12} />

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <p style={{ color: C.textSec, fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
          Everything your campus needs
        </p>
        <p
          style={{
            fontSize: 46,
            fontWeight: 900,
            margin: "8px 0 0",
            letterSpacing: "-0.03em",
            background: C.gradientText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          One App. Infinite Possibilities.
        </p>
      </div>

      {/* Feature grid — 2 rows of 3 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 820 }}>
        {features.map((f) => (
          <FeatureCard key={f.label} {...f} />
        ))}
      </div>

      <LogoWatermark />
    </AbsoluteFill>
  );
};
