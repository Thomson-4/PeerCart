import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 7 — 12 s = 360 frames  (Stats showcase)

const stats = [
  {
    value: 40,
    suffix: "+",
    label: "REST API Endpoints",
    sub: "Auth · Listings · Escrow · Chat · Notifications",
    color: C.accent,
    icon: "⚡",
    delay: 15,
  },
  {
    value: 14,
    suffix: "",
    label: "Pages & Features",
    sub: "Feed · Profile · Chat · Admin · Ambassador",
    color: "#4f46e5",
    icon: "📱",
    delay: 40,
  },
  {
    value: 3,
    suffix: "-Tier",
    label: "Trust System",
    sub: "OTP verified · Escrow eligible · Seller rating",
    color: C.green,
    icon: "🛡️",
    delay: 65,
  },
  {
    value: 100,
    suffix: "%",
    label: "Escrow Protected",
    sub: "Razorpay holds funds until delivery confirmed",
    color: C.amber,
    icon: "🔒",
    delay: 90,
  },
];

const StatCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  sub: string;
  color: string;
  icon: string;
  delay: number;
}> = ({ value, suffix, label, sub, color, icon, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, stiffness: 100 },
    durationInFrames: 45,
  });

  const scale = interpolate(progress, [0, 1], [0.55, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });
  const ty = interpolate(progress, [0, 1], [50, 0], { extrapolateRight: "clamp" });

  // Animated count-up
  const countFrame = Math.max(0, frame - delay - 5);
  const countProgress = interpolate(countFrame, [0, 55], [0, 1], { extrapolateRight: "clamp" });
  const eased = countProgress < 0.5
    ? 2 * countProgress * countProgress
    : 1 - Math.pow(-2 * countProgress + 2, 2) / 2;
  const displayValue = Math.round(eased * value);

  const localFrame = Math.max(0, frame - delay);
  const glowPulse = 0.8 + Math.sin((localFrame / 50) * Math.PI) * 0.2;

  return (
    <div
      style={{
        width: 310,
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${color}30`,
        borderRadius: 28,
        padding: "32px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: `scale(${scale}) translateY(${ty}px)`,
        opacity,
        boxShadow: `0 0 ${50 * glowPulse}px ${color}18, 0 24px 48px rgba(0,0,0,0.45)`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `${color}16`,
          border: `1.5px solid ${color}35`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          boxShadow: `0 0 24px ${color}28`,
          marginBottom: 4,
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          background: `linear-gradient(135deg, ${color}, ${color}bb)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {displayValue}{suffix}
      </p>

      <p style={{ color: C.text, fontWeight: 800, fontSize: 17, margin: 0, textAlign: "center" }}>
        {label}
      </p>

      <p
        style={{
          color: C.textSec,
          fontSize: 12,
          margin: 0,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 260,
        }}
      >
        {sub}
      </p>
    </div>
  );
};

export const Scene7Montage: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const techStack = ["React 19", "Node.js", "MongoDB Atlas", "Razorpay Escrow", "Cloudinary", "JWT Auth"];

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 60px",
        gap: 36,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <Orb x={400} y={-200} size={800} color="rgba(124,58,237,0.3)" opacity={0.14} />
      <Orb x={1100} y={600} size={600} color="rgba(34,197,94,0.3)" opacity={0.1} />

      {/* Heading */}
      <FadeIn delay={5} translateY={20} style={{ textAlign: "center" }}>
        <p
          style={{
            color: C.textSec,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            margin: "0 0 8px",
          }}
        >
          Built with precision · Engineered to scale
        </p>
        <p
          style={{
            fontSize: 44,
            fontWeight: 900,
            margin: 0,
            letterSpacing: "-0.03em",
            background: C.gradientText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          The Numbers Behind PeerCart
        </p>
      </FadeIn>

      {/* 2 × 2 stat grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", maxWidth: 800 }}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Tech stack pills */}
      <FadeIn delay={135} translateY={14}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {techStack.map((tech, i) => {
            const techOpacity = interpolate(frame, [135 + i * 8, 155 + i * 8], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            return (
              <div
                key={tech}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: C.textSec,
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: techOpacity,
                }}
              >
                {tech}
              </div>
            );
          })}
        </div>
      </FadeIn>

      <LogoWatermark />
    </AbsoluteFill>
  );
};
