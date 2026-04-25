import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface OrbProps {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
  pulseSpeed?: number;
  delay?: number;
}

export const Orb: React.FC<OrbProps> = ({
  x, y, size, color, opacity = 0.3, pulseSpeed = 90, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const pulse = Math.sin((localFrame / pulseSpeed) * Math.PI * 2);
  const scale = 1 + pulse * 0.08;
  const fadeIn = interpolate(localFrame, [0, 30], [0, opacity], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: fadeIn,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        filter: "blur(2px)",
        pointerEvents: "none",
      }}
    />
  );
};
