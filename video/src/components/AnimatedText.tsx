import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface AnimatedTextProps {
  children: string;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  duration = 25,
  style,
  direction = "up",
  distance = 30,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, duration * 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY =
    direction === "up"
      ? interpolate(localFrame, [0, duration], [distance, 0], { extrapolateRight: "clamp" })
      : direction === "down"
      ? interpolate(localFrame, [0, duration], [-distance, 0], { extrapolateRight: "clamp" })
      : 0;

  const translateX =
    direction === "left"
      ? interpolate(localFrame, [0, duration], [distance, 0], { extrapolateRight: "clamp" })
      : direction === "right"
      ? interpolate(localFrame, [0, duration], [-distance, 0], { extrapolateRight: "clamp" })
      : 0;

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

interface FadeInDivProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
  translateY?: number;
  translateX?: number;
}

export const FadeIn: React.FC<FadeInDivProps> = ({
  children,
  delay = 0,
  duration = 25,
  style,
  translateY: ty = 24,
  translateX: tx = 0,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, duration], [ty, 0], {
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(localFrame, [0, duration], [tx, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
