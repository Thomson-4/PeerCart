import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 6 — 12 s = 360 frames

const Avatar: React.FC<{ emoji: string; name: string; side: "left" | "right"; startFrame: number }> = ({
  emoji, name, side, startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 80 } });
  const tx = interpolate(progress, [0, 1], [side === "left" ? -100 : 100, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, transform: `translateX(${tx}px)`, opacity }}>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1e1b4b, #2d1b69)",
          border: "3px solid rgba(124,58,237,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          boxShadow: "0 0 40px rgba(124,58,237,0.25), 0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        {emoji}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: C.text, fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>{name}</p>
        <div style={{ display: "inline-flex", gap: 6, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 999, padding: "3px 10px" }}>
          <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700 }}>🛡️ Trust Level 1</span>
        </div>
      </div>
    </div>
  );
};

const HandshakeArrow: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 12, stiffness: 100 } });
  const scale = interpolate(progress, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${scale})`, opacity }}>
      <div style={{ fontSize: 44 }}>🤝</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ width: 80, height: 1, background: "rgba(124,58,237,0.4)" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />
        <div style={{ width: 80, height: 1, background: "rgba(124,58,237,0.4)" }} />
      </div>
      <p style={{ color: C.textSec, fontSize: 14, margin: 0 }}>Same campus</p>
    </div>
  );
};

const TransactionComplete: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 10, stiffness: 80 } });
  const scale = interpolate(progress, [0, 1], [0.5, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: `translateX(-50%) scale(${scale})`,
        opacity,
        transformOrigin: "center bottom",
        background: "rgba(13,13,26,0.95)",
        border: "1px solid rgba(34,197,94,0.4)",
        borderRadius: 20,
        padding: "20px 40px",
        textAlign: "center",
        boxShadow: "0 0 60px rgba(34,197,94,0.15), 0 30px 60px rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
        minWidth: 500,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <p style={{ color: C.green, fontWeight: 900, fontSize: 22, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Transaction Complete</p>
      <p style={{ color: C.textSec, fontSize: 18, margin: "0 0 20px" }}>Payment released · Both parties rated</p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: C.green, fontWeight: 900, fontSize: 22, margin: "0 0 2px" }}>₹2,500</p>
          <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>Arjun received</p>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#60a5fa", fontWeight: 900, fontSize: 22, margin: "0 0 2px" }}>🎸 Guitar</p>
          <p style={{ color: C.textSec, fontSize: 13, margin: 0 }}>Priya received</p>
        </div>
      </div>
    </div>
  );
};

export const Scene6Meetup: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #0d0d1f 0%, ${C.bg} 70%)`,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        justifyContent: "center",
        flexDirection: "column",
        padding: "40px 60px",
        gap: 0,
        opacity: Math.min(fadeIn, fadeOut),
        position: "relative",
      }}
    >
      <Orb x={-200} y={200} size={800} color="rgba(124,58,237,0.3)" opacity={0.18} />
      <Orb x={1500} y={300} size={600} color="rgba(34,197,94,0.3)" opacity={0.12} />

      {/* Top label */}
      <FadeIn delay={15} translateY={-14} style={{ marginBottom: 40, position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 999,
            padding: "10px 28px",
          }}
        >
          <span style={{ color: C.green, fontSize: 18, fontWeight: 700 }}>🏫 Same campus · Zero hassle</span>
        </div>
      </FadeIn>

      {/* Avatars + handshake */}
      <div style={{ display: "flex", alignItems: "center", gap: 80, position: "relative", zIndex: 2 }}>
        <Avatar emoji="👦" name="Arjun" side="left" startFrame={20} />
        <HandshakeArrow startFrame={60} />
        <Avatar emoji="👩" name="Priya" side="right" startFrame={20} />
      </div>

      {/* Quote */}
      <FadeIn delay={100} translateY={14} style={{ marginTop: 36, position: "relative", zIndex: 2, textAlign: "center" }}>
        <p style={{ fontSize: 26, color: C.text, fontWeight: 700, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
          "Same campus. Same trust.{" "}
          <span style={{ background: C.gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Zero hassle.
          </span>
          "
        </p>
      </FadeIn>

      {/* Transaction complete card */}
      {frame > 190 && <TransactionComplete startFrame={190} />}

      <LogoWatermark />
    </AbsoluteFill>
  );
};
