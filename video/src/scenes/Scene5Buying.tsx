import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../components/colors";
import { FadeIn } from "../components/AnimatedText";
import { PhoneMockup } from "../components/PhoneMockup";
import { Orb } from "../components/Orb";
import { LogoWatermark } from "../components/Logo";

// Scene 5 — 16 s = 480 frames

const PaymentModal: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 90 } });
  const ty = interpolate(progress, [0, 1], [80, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });

  const showSuccess = frame > startFrame + 90;
  const successScale = spring({ frame: frame - (startFrame + 90), fps, config: { damping: 12 } });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#13131f",
        borderRadius: "18px 18px 0 0",
        border: "1px solid rgba(124,58,237,0.25)",
        borderBottom: "none",
        padding: "20px 18px",
        transform: `translateY(${ty}px)`,
        opacity,
        boxShadow: "0 -20px 40px rgba(0,0,0,0.5)",
      }}
    >
      {!showSuccess ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>Complete Purchase</p>
            <div style={{ width: 32, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }} />
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: C.textSec, fontSize: 12 }}>Acoustic Guitar</span>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>₹2,500</span>
          </div>
          <div
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ color: C.green, fontSize: 11, fontWeight: 600 }}>Escrow protected · Released on receipt</span>
          </div>
          {/* Razorpay button */}
          <div style={{ background: "#528FF0", borderRadius: 10, padding: "12px 0", textAlign: "center", boxShadow: "0 0 20px rgba(82,143,240,0.3)" }}>
            <span style={{ color: "white", fontWeight: 800, fontSize: 14 }}>Pay with Razorpay</span>
          </div>
          <p style={{ color: C.textSec, fontSize: 10, textAlign: "center", margin: "8px 0 0" }}>UPI · Cards · Net Banking</p>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "10px 0", transform: `scale(${successScale})` }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
          <p style={{ color: C.green, fontWeight: 900, fontSize: 18, margin: "0 0 4px" }}>Payment Successful</p>
          <p style={{ color: C.textSec, fontSize: 12, margin: 0 }}>₹2,500 held safely in escrow</p>
        </div>
      )}
    </div>
  );
};

const ChatBubble: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 120 } });
  const scale = interpolate(progress, [0, 1], [0.7, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(progress, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "rgba(124,58,237,0.15)",
        border: "1px solid rgba(124,58,237,0.35)",
        borderRadius: 12,
        padding: "8px 12px",
        transform: `scale(${scale})`,
        transformOrigin: "top right",
        opacity,
        maxWidth: 200,
        boxShadow: "0 0 20px rgba(124,58,237,0.2)",
      }}
    >
      <p style={{ color: C.text, fontSize: 10, margin: "0 0 2px", fontWeight: 700 }}>💬 Priya</p>
      <p style={{ color: C.textSec, fontSize: 10, margin: 0 }}>"I'm in Block C, when can we meet?"</p>
    </div>
  );
};

export const Scene5Buying: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [440, 480], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const showPayment = frame > 160;
  const showChat = frame > 320;

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
      <Orb x={1500} y={500} size={700} color="rgba(82,143,240,0.4)" opacity={0.15} />
      <Orb x={-200} y={-100} size={500} color="rgba(124,58,237,0.4)" opacity={0.18} />

      {/* Left: text */}
      <div style={{ maxWidth: 560 }}>
        <FadeIn delay={15} translateY={20}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(82,143,240,0.1)",
              border: "1px solid rgba(82,143,240,0.3)",
              borderRadius: 999,
              padding: "8px 20px",
              marginBottom: 28,
            }}
          >
            <span style={{ color: "#60a5fa", fontSize: 16, fontWeight: 700 }}>🛒 Safe & Secure Buying</span>
          </div>
        </FadeIn>

        <FadeIn delay={30} translateY={20}>
          <h2 style={{ fontSize: 54, fontWeight: 900, color: C.text, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            Browse.{" "}
            <span style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Buy.</span>
            {" "}Meet.
          </h2>
        </FadeIn>

        <FadeIn delay={55} translateY={20}>
          <p style={{ fontSize: 19, color: C.textSec, lineHeight: 1.6, margin: "0 0 24px" }}>
            Browse verified campus listings. Pay securely via escrow — your money is held safe until you confirm receipt. No cash, no risk.
          </p>
        </FadeIn>

        {/* Feature list */}
        {[
          { icon: "🔍", text: "Browse live campus feed", delay: 70 },
          { icon: "💳", text: "Pay via UPI, card, or net banking", delay: 110 },
          { icon: "🔒", text: "Escrow holds payment until delivery", delay: 150 },
          { icon: "💬", text: "Chat with seller, meet on campus", delay: 190 },
        ].map(({ icon, text, delay }) => (
          <FadeIn key={text} delay={delay} translateX={-20} translateY={0} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 18, color: C.text, fontWeight: 500 }}>{text}</span>
            </div>
          </FadeIn>
        ))}
      </div>

      <LogoWatermark />

      {/* Right: phone mockup */}
      <PhoneMockup slideFrom="right" delay={20} scale={0.9}>
        <div style={{ padding: "12px 16px", height: "100%", position: "relative" }}>
          {/* Feed header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: 0 }}>Campus Feed</p>
            <div style={{ background: "rgba(124,58,237,0.2)", borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ color: "#a78bfa", fontSize: 10, fontWeight: 700 }}>REVA Univ</span>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "7px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.textSec, fontSize: 11 }}>🔍</span>
            <span style={{ color: C.textSec, fontSize: 11 }}>Search listings...</span>
          </div>

          {/* Listing cards */}
          {[
            { emoji: "🎸", name: "Acoustic Guitar", price: "₹2,500", level: "L1", active: true },
            { emoji: "📚", name: "Chem Textbook", price: "₹380", level: "L1", active: false },
            { emoji: "🎧", name: "Sony Headphones", price: "₹1,200", level: "L1", active: false },
          ].map(({ emoji, name, price, level, active }, i) => (
            <FadeIn key={name} delay={30 + i * 20} translateY={10}>
              <div
                style={{
                  background: active ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)",
                  border: active ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "9px 10px",
                  marginBottom: 8,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  boxShadow: active ? "0 0 12px rgba(124,58,237,0.12)" : "none",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: 12, margin: "0 0 2px" }}>{name}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: C.accent, fontWeight: 900, fontSize: 14 }}>{price}</span>
                    <span style={{ color: C.green, fontSize: 9, fontWeight: 700, background: "rgba(34,197,94,0.1)", padding: "1px 6px", borderRadius: 4 }}>🛡️ {level}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}

          {/* Payment modal overlay */}
          {showPayment && <PaymentModal startFrame={180} />}

          {/* Chat notification */}
          {showChat && <ChatBubble startFrame={370} />}
        </div>
      </PhoneMockup>
    </AbsoluteFill>
  );
};
