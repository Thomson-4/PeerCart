import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { PhoneMockup } from "../components/PhoneMockup";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 3 — 18 s = 540 frames (unchanged)

// Simulates a typing cursor in a field
const TypedField: React.FC<{
  label: string;
  value: string;
  startFrame: number;
  icon?: string;
  active?: boolean;
}> = ({ label, value, startFrame, icon = "✉", active = false }) => {
  const frame = useCurrentFrame();
  const charsVisible = Math.max(
    0,
    Math.floor(interpolate(frame, [startFrame, startFrame + value.length * 3], [0, value.length], {
      extrapolateRight: "clamp",
    }))
  );
  const showCursor = active && frame > startFrame && charsVisible < value.length;

  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ color: C.textSec, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, margin: "0 0 6px" }}>{label}</p>
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: active ? `1px solid ${C.accent}` : "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: active ? `0 0 0 3px rgba(124,58,237,0.15)` : "none",
        }}
      >
        <span style={{ fontSize: 13, color: C.textSec }}>{icon}</span>
        <span style={{ fontSize: 13, color: C.text, flex: 1 }}>
          {value.slice(0, charsVisible)}
          {showCursor && <span style={{ opacity: frame % 30 < 15 ? 1 : 0 }}>|</span>}
        </span>
      </div>
    </div>
  );
};

// OTP digit boxes
const OtpBox: React.FC<{ digits: string; startFrame: number }> = ({ digits, startFrame }) => {
  const frame = useCurrentFrame();
  const progress = spring({ frame: frame - startFrame, fps: 30, config: { damping: 14, stiffness: 120 } });
  const sc = interpolate(progress, [0, 1], [0.6, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" }}>
      {digits.split("").map((d, i) => {
        const digitProgress = spring({
          frame: frame - (startFrame + i * 5),
          fps: 30,
          config: { damping: 14 },
        });
        const dOpacity = interpolate(digitProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              width: 34,
              height: 44,
              borderRadius: 8,
              background: "rgba(124,58,237,0.15)",
              border: "1.5px solid rgba(124,58,237,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 900,
              color: "#a78bfa",
              opacity: dOpacity,
              transform: `scale(${interpolate(digitProgress, [0, 1], [0.7, 1], { extrapolateRight: "clamp" })})`,
            }}
          >
            {d}
          </div>
        );
      })}
    </div>
  );
};

export const Scene3Signup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [500, 540], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Step control
  const showOtp = frame > 220;
  const showSuccess = frame > 370;

  const successScale = spring({ frame: frame - 370, fps, config: { damping: 12, stiffness: 100 } });

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
      <Orb x={-200} y={200} size={600} color="rgba(124,58,237,0.4)" opacity={0.18} />

      {/* Left: text */}
      <div style={{ maxWidth: 560 }}>
        <FadeIn delay={15} translateY={20}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: 999,
              padding: "8px 20px",
              marginBottom: 28,
            }}
          >
            <span style={{ fontSize: 18 }}>🎓</span>
            <span style={{ color: "#a78bfa", fontSize: 16, fontWeight: 700 }}>College-Verified Signup</span>
          </div>
        </FadeIn>

        <FadeIn delay={30} translateY={20}>
          <h2 style={{ fontSize: 56, fontWeight: 900, color: C.text, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            Sign up in{" "}
            <span style={{ background: C.gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              10 seconds
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={55} translateY={20}>
          <p style={{ fontSize: 20, color: C.textSec, lineHeight: 1.6, margin: "0 0 28px" }}>
            Your college email is your identity. One OTP — and you're verified, trusted, and trading.
          </p>
        </FadeIn>

        {/* Steps */}
        {[
          { icon: "✉️", text: "Enter your college email", frame: 70 },
          { icon: "📬", text: "Receive OTP instantly", frame: 120 },
          { icon: "🛡️", text: "Verified at Trust Level 1", frame: 170 },
        ].map(({ icon, text, frame: f }) => (
          <FadeIn key={text} delay={f} translateX={-20} translateY={0}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <span style={{ fontSize: 22, color: C.text, fontWeight: 600 }}>{text}</span>
            </div>
          </FadeIn>
        ))}
      </div>

      <LogoWatermark />

      {/* Right: phone mockup */}
      <PhoneMockup slideFrom="right" delay={25} scale={0.9}>
        <div style={{ padding: "16px 20px", height: "100%", overflowY: "hidden" }}>
          {/* App header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.gradientBg }} />
            <span style={{ color: C.text, fontWeight: 800, fontSize: 15 }}>PeerCart</span>
          </div>

          {!showOtp ? (
            <>
              <p style={{ color: C.text, fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>Create Account</p>
              <p style={{ color: C.textSec, fontSize: 11, margin: "0 0 20px" }}>Use your college email</p>

              <TypedField label="Full Name" value="Arjun Sharma" startFrame={30} icon="👤" active={frame < 130} />
              <TypedField label="College Email" value="arjun@reva.edu.in" startFrame={90} icon="✉" active={frame >= 90 && frame < 220} />

              <div
                style={{
                  background: C.gradientBg,
                  borderRadius: 12,
                  padding: "12px 0",
                  textAlign: "center",
                  marginTop: 20,
                  opacity: frame > 200 ? 1 : interpolate(frame, [180, 210], [0.4, 1], { extrapolateRight: "clamp" }),
                  boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                }}
              >
                <span style={{ color: "white", fontWeight: 800, fontSize: 14 }}>Send OTP →</span>
              </div>
            </>
          ) : !showSuccess ? (
            <>
              <p style={{ color: C.text, fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>Check Your Inbox</p>
              <p style={{ color: C.textSec, fontSize: 11, margin: "0 0 8px" }}>OTP sent to arjun@reva.edu.in</p>

              {/* Email notification card */}
              <FadeIn delay={0} translateY={-15}>
                <div
                  style={{
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: C.gradientBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14 }}>📧</span>
                    </div>
                    <div>
                      <p style={{ color: C.text, fontSize: 11, fontWeight: 700, margin: 0 }}>PeerCart Campus</p>
                      <p style={{ color: C.textSec, fontSize: 10, margin: 0 }}>noreply@peercart.in</p>
                    </div>
                    <span style={{ color: C.textSec, fontSize: 10, marginLeft: "auto" }}>now</span>
                  </div>
                  <p style={{ color: "#a78bfa", fontSize: 10, margin: 0 }}>Your OTP: Verify your PeerCart email</p>
                </div>
              </FadeIn>

              <p style={{ color: C.textSec, fontSize: 11, textAlign: "center", margin: "0 0 4px" }}>Enter your OTP</p>
              <OtpBox digits="847291" startFrame={240} />

              <div
                style={{
                  background: C.gradientBg,
                  borderRadius: 12,
                  padding: "12px 0",
                  textAlign: "center",
                  marginTop: 8,
                  opacity: frame > 340 ? 1 : 0.5,
                  boxShadow: frame > 340 ? "0 0 20px rgba(124,58,237,0.4)" : "none",
                }}
              >
                <span style={{ color: "white", fontWeight: 800, fontSize: 14 }}>Verify & Enter 🛡️</span>
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                transform: `scale(${successScale})`,
                gap: 12,
              }}
            >
              <div style={{ fontSize: 60 }}>🎉</div>
              <p style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0, textAlign: "center" }}>Welcome, Arjun!</p>
              <div
                style={{
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.4)",
                  borderRadius: 12,
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>🛡️ Trust Level 1 — Unlocked</span>
              </div>
              <p style={{ color: C.textSec, fontSize: 12, textAlign: "center", margin: "4px 0 0" }}>
                Email verified · Selling enabled
              </p>
            </div>
          )}
        </div>
      </PhoneMockup>
    </AbsoluteFill>
  );
};
