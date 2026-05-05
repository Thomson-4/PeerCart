import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 1 — 12 s = 360 frames
const DURATION = 360;

const ProblemLine: React.FC<{
  text: string;
  startFrame: number;
  fontSize?: number;
  muted?: boolean;
  gradient?: boolean;
}> = ({ text, startFrame, fontSize = 66, muted = false, gradient = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 130 },
    durationInFrames: 35,
  });

  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  const ty = interpolate(progress, [0, 1], [32, 0], { extrapolateRight: "clamp" });

  return (
    <p
      style={{
        margin: "0 0 18px",
        fontSize,
        fontWeight: 900,
        lineHeight: 1.15,
        letterSpacing: "-0.03em",
        opacity,
        transform: `translateY(${ty}px)`,
        color: muted ? C.textSec : gradient ? "transparent" : C.text,
        background: gradient ? C.gradientText : undefined,
        WebkitBackgroundClip: gradient ? "text" : undefined,
        WebkitTextFillColor: gradient ? "transparent" : undefined,
      }}
    >
      {text}
    </p>
  );
};

const UntilNow: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 10, stiffness: 70 },
    durationInFrames: 55,
  });

  const scale = interpolate(progress, [0, 1], [0.35, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
  const localFrame = Math.max(0, frame - startFrame);
  const glowPulse = 0.5 + Math.sin((localFrame / 35) * Math.PI) * 0.25;

  return (
    <div style={{ transform: `scale(${scale})`, opacity, display: "inline-block", marginTop: 12 }}>
      <p
        style={{
          margin: 0,
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          background: "linear-gradient(135deg, #22c55e 0%, #34d399 50%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 0 ${50 * glowPulse}px rgba(34,197,94,0.55)) drop-shadow(0 0 ${20 * glowPulse}px rgba(124,58,237,0.4))`,
        }}
      >
        Until now.
      </p>
    </div>
  );
};

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [DURATION - 40, DURATION], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const showUntilNow = frame > 215;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 35% 45%, #0f0b1e 0%, ${C.bg} 65%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 120px",
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      <Orb x={-200} y={-120} size={700} color="rgba(124,58,237,0.5)" opacity={0.2} />
      <Orb x={1500} y={600} size={600} color="rgba(245,158,11,0.35)" opacity={0.1} />

      {/* Amber "problem" badge */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.28)",
          borderRadius: 999,
          padding: "8px 22px",
          opacity: interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.amber,
            opacity: frame % 18 < 9 ? 1 : 0.5,
          }}
        />
        <span style={{ color: C.amber, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          The Problem Every Campus Student Faces
        </span>
      </div>

      <div style={{ textAlign: "center", maxWidth: 1100, position: "relative", zIndex: 2 }}>
        <ProblemLine text="Students have things they don't need." startFrame={30} fontSize={62} />
        <ProblemLine text="Classmates need exactly those things." startFrame={80} fontSize={62} />
        <ProblemLine
          text="But there was no safe way to connect."
          startFrame={140}
          fontSize={54}
          muted
        />

        {showUntilNow && <UntilNow startFrame={220} />}
      </div>

      <LogoWatermark />
    </AbsoluteFill>
  );
};
