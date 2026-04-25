import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

interface LogoProps {
  size?: number;
  animate?: boolean;
  glow?: boolean;
  showWordmark?: boolean;
}

/** Full PNG logo — includes icon + "PeerCart" wordmark */
export const Logo: React.FC<LogoProps> = ({
  size = 200,
  animate = true,
  glow = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = animate
    ? spring({ frame, fps, config: { damping: 12, stiffness: 120 }, durationInFrames: 40 })
    : 1;

  return (
    <div
      style={{
        transform: `scale(${sc})`,
        transformOrigin: "center",
        filter: glow
          ? "drop-shadow(0 0 24px rgba(34,197,94,0.5)) drop-shadow(0 0 48px rgba(124,58,237,0.4))"
          : undefined,
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{ height: size, width: "auto", display: "block" }}
      />
    </div>
  );
};

/** Alias — same as Logo since PNG includes the full brand mark */
export const LogoMark: React.FC<{ size?: number; glow?: boolean }> = ({ size = 72, glow = true }) => (
  <div
    style={{
      filter: glow
        ? "drop-shadow(0 0 16px rgba(34,197,94,0.5)) drop-shadow(0 0 32px rgba(124,58,237,0.4))"
        : undefined,
    }}
  >
    <Img
      src={staticFile("logo.png")}
      style={{ height: size, width: "auto", display: "block" }}
    />
  </div>
);

/** Small corner watermark — use in any scene */
export const LogoWatermark: React.FC<{ opacity?: number }> = ({ opacity = 0.7 }) => (
  <div
    style={{
      position: "absolute",
      bottom: 36,
      right: 48,
      opacity,
      pointerEvents: "none",
      filter: "drop-shadow(0 0 8px rgba(34,197,94,0.4))",
    }}
  >
    <Img
      src={staticFile("logo.png")}
      style={{ height: 72, width: "auto", display: "block" }}
    />
  </div>
);
