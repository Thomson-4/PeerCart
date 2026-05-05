import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { LogoMark } from "../components/Logo";
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

  const ringRotation = frame * 0.55;
  const glowPulse = 1 + Math.sin((frame / 38) * Math.PI) * 0.3;

  // Logo pops in with spring
  const markScale = spring({ frame, fps, config: { damping: 10, stiffness: 90 }, durationInFrames: 50 });

  // "Introducing" label fades before logo
  const introOpacity = interpolate(frame, [5, 22], [0, 1], { extrapolateRight: "clamp" });
  const introTy = interpolate(frame, [5, 22], [12, 0], { extrapolateRight: "clamp" });

  const pills = [
    { label: "🎓 College-Only", color: "rgba(124,58,237,0.55)" },
    { label: "🔐 OTP-Verified", color: "rgba(79,70,229,0.55)" },
    { label: "🔒 Escrow-Safe", color: "rgba(34,197,94,0.55)" },
    { label: "💬 Real-time Chat", color: "rgba(14,165,233,0.55)" },
    { label: "🛡️ 3-Level Trust", color: "rgba(245,158,11,0.55)" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, #12091f 0%, ${C.bg} 70%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 0,
        opacity,
        overflow: "hidden",
      }}
    >
      {/* Giant pulsing glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(34,197,94,${0.07 * glowPulse}) 0%, rgba(124,58,237,${0.14 * glowPulse}) 40%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Outer rotating ring — green dots */}
      <div
        style={{
          position: "absolute",
          width: 660,
          height: 660,
          borderRadius: "50%",
          border: "1px solid rgba(34,197,94,0.1)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${ringRotation}deg)`,
        }}
      >
        {[0, 60, 120, 180, 240, 300].map((angle) => (
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
              transform: `rotate(${angle}deg) translateX(327px) translateY(-3.5px)`,
              opacity: 0.7,
              boxShadow: "0 0 8px rgba(34,197,94,0.8)",
            }}
          />
        ))}
      </div>

      {/* Inner dashed ring */}
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          border: "1px dashed rgba(124,58,237,0.2)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${-ringRotation * 0.6}deg)`,
        }}
      />

      {/* Purple accent dots on inner ring */}
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${-ringRotation * 0.6}deg)`,
        }}
      >
        {[0, 90, 180, 270].map((angle) => (
          <div
            key={angle}
            style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: C.accent,
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateX(237px) translateY(-2.5px)`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <Orb x={1500} y={-80} size={500} color="rgba(124,58,237,0.5)" opacity={0.18} />
      <Orb x={-100} y={700} size={400} color="rgba(34,197,94,0.4)" opacity={0.14} />

      {/* "Introducing" eyebrow label */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          marginBottom: 20,
          opacity: introOpacity,
          transform: `translateY(${introTy}px)`,
        }}
      >
        <span
          style={{
            color: C.textSec,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Introducing
        </span>
      </div>

      {/* Big logo */}
      <div style={{ position: "relative", zIndex: 2, transform: `scale(${markScale})`, marginBottom: 4 }}>
        <LogoMark size={270} glow />
      </div>

      {/* REVA-specific tagline */}
      <FadeIn delay={42} translateY={14} style={{ position: "relative", zIndex: 2, marginTop: 18 }}>
        <p
          style={{
            fontSize: 22,
            color: C.textSec,
            fontWeight: 500,
            letterSpacing: "0.03em",
            textAlign: "center",
            margin: 0,
          }}
        >
          REVA University's First Verified Campus Marketplace
        </p>
      </FadeIn>

      {/* Feature pills — 5 across */}
      <FadeIn delay={70} translateY={16} style={{ position: "relative", zIndex: 2, marginTop: 34 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
          {pills.map(({ label, color }, i) => {
            const pillDelay = 70 + i * 12;
            const pillProgress = interpolate(
              frame,
              [pillDelay, pillDelay + 18],
              [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            return (
              <div
                key={label}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: `${color.replace("0.55", "0.12")}`,
                  border: `1px solid ${color}`,
                  color: "#e2e8f0",
                  fontSize: 16,
                  fontWeight: 600,
                  opacity: pillProgress,
                  transform: `translateY(${interpolate(pillProgress, [0, 1], [12, 0])}px)`,
                  boxShadow: `0 0 16px ${color.replace("0.55", "0.2")}`,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </FadeIn>

      {/* Bottom descriptor */}
      <FadeIn delay={130} translateY={12} style={{ position: "relative", zIndex: 2, marginTop: 24 }}>
        <p
          style={{
            fontSize: 15,
            color: `${C.textSec}99`,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textAlign: "center",
            margin: 0,
          }}
        >
          Buy · Sell · Rent · All on campus
        </p>
      </FadeIn>
    </AbsoluteFill>
  );
};
