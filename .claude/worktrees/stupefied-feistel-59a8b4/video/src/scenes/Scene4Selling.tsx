import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { PhoneMockup } from "../components/PhoneMockup";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 4 — 16 s = 480 frames

// Animated camera shutter
const CameraView: React.FC<{ shutterAt: number }> = ({ shutterAt }) => {
  const frame = useCurrentFrame();
  const shutterOpacity = interpolate(frame, [shutterAt, shutterAt + 3, shutterAt + 8], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", background: "#1a1a2e", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3" }}>
      {/* Camera "viewfinder" content */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #1e1b4b 0%, #2d1b69 60%, #1a1a2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Guitar outline */}
        <div style={{ fontSize: 64, opacity: 0.7 }}>🎸</div>

        {/* Corner guides */}
        {[["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h]) => (
          <div
            key={`${v}-${h}`}
            style={{
              position: "absolute",
              [v]: 8,
              [h]: 8,
              width: 16,
              height: 16,
              borderTop: v === "top" ? `2px solid ${C.accent}` : "none",
              borderBottom: v === "bottom" ? `2px solid ${C.accent}` : "none",
              borderLeft: h === "left" ? `2px solid ${C.accent}` : "none",
              borderRight: h === "right" ? `2px solid ${C.accent}` : "none",
            }}
          />
        ))}

        {/* LIVE badge */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "#ef4444",
            borderRadius: 6,
            padding: "2px 8px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "white", opacity: frame % 20 < 10 ? 1 : 0.4 }} />
          <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>LIVE</span>
        </div>

        {/* Shutter flash */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "white",
            opacity: shutterOpacity,
          }}
        />
      </div>
    </div>
  );
};

// Listing card that slides into feed
const ListingCard: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 100 } });
  const ty = interpolate(progress, [0, 1], [-30, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 14,
        padding: 12,
        transform: `translateY(${ty}px)`,
        opacity,
        boxShadow: "0 0 20px rgba(124,58,237,0.12)",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ width: 60, height: 60, borderRadius: 10, background: "linear-gradient(135deg, #1e1b4b, #2d1b69)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🎸</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>Acoustic Guitar</p>
          <p style={{ color: C.textSec, fontSize: 10, margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Barely used · Great condition</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: C.accent, fontWeight: 900, fontSize: 16 }}>₹2,500</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.12)", borderRadius: 6, padding: "2px 7px", border: "1px solid rgba(34,197,94,0.3)" }}>
              <span style={{ color: C.green, fontSize: 9, fontWeight: 700 }}>🛡️ L1</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, background: "rgba(124,58,237,0.1)", borderRadius: 8, padding: "6px 0", textAlign: "center" }}>
        <span style={{ color: "#a78bfa", fontSize: 10, fontWeight: 700 }}>🎯 Just listed · Campus feed</span>
      </div>
    </div>
  );
};

export const Scene4Selling: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [440, 480], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const showListing = frame > 180;

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 80px",
        gap: 80,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: "hidden",
      }}
    >
      <Orb x={1600} y={100} size={600} color="rgba(124,58,237,0.4)" opacity={0.18} />
      <Orb x={-100} y={800} size={500} color="rgba(163,230,53,0.3)" opacity={0.12} />

      {/* Left: phone */}
      <PhoneMockup slideFrom="left" delay={10} scale={0.9}>
        <div style={{ padding: "12px 16px", height: "100%" }}>
          <p style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: "0 0 12px" }}>📸 List an Item</p>

          {/* Camera section */}
          <CameraView shutterAt={130} />

          {/* After shutter: form fields appear */}
          {frame > 140 && (
            <>
              <FadeIn delay={140} translateY={10}>
                <div style={{ marginTop: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                    <span style={{ color: C.text, fontSize: 12 }}>Acoustic Guitar</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px" }}>
                      <span style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>₹ 2,500</span>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px" }}>
                      <span style={{ color: C.textSec, fontSize: 11 }}>Electronics</span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {frame > 175 && (
                <FadeIn delay={175} translateY={8}>
                  <div
                    style={{
                      background: C.gradientBg,
                      borderRadius: 10,
                      padding: "11px 0",
                      textAlign: "center",
                      boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                    }}
                  >
                    <span style={{ color: "white", fontWeight: 800, fontSize: 13 }}>🚀 Post to Campus Feed</span>
                  </div>
                </FadeIn>
              )}
            </>
          )}
        </div>
      </PhoneMockup>

      <LogoWatermark />

      {/* Right: text + live feed preview */}
      <div style={{ maxWidth: 580 }}>
        <FadeIn delay={20} translateY={20}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(163,230,53,0.08)",
              border: "1px solid rgba(163,230,53,0.25)",
              borderRadius: 999,
              padding: "8px 20px",
              marginBottom: 28,
            }}
          >
            <span style={{ color: C.lime, fontSize: 16, fontWeight: 700 }}>📸 Live Photo · Campus-only</span>
          </div>
        </FadeIn>

        <FadeIn delay={35} translateY={20}>
          <h2 style={{ fontSize: 52, fontWeight: 900, color: C.text, lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            Snap.{" "}
            <span style={{ color: C.accent }}>List.</span>
            {" "}Sell.{" "}
            <span style={{ color: C.lime }}>Rent.</span>
          </h2>
        </FadeIn>

        <FadeIn delay={60} translateY={20}>
          <p style={{ fontSize: 19, color: C.textSec, lineHeight: 1.6, margin: "0 0 24px" }}>
            Take a live photo with your camera — no stock images, no fakes. Your listing goes live on the campus feed instantly.
          </p>
        </FadeIn>

        {/* Live feed preview */}
        {showListing && (
          <FadeIn delay={200} translateY={20}>
            <p style={{ color: C.textSec, fontSize: 14, fontWeight: 600, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Live on campus feed
            </p>
            <ListingCard startFrame={210} />
          </FadeIn>
        )}
      </div>
    </AbsoluteFill>
  );
};
