import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Reveal } from "./scenes/Scene2Reveal";
import { Scene3Signup } from "./scenes/Scene3Signup";
import { Scene4Selling } from "./scenes/Scene4Selling";
import { Scene5Buying } from "./scenes/Scene5Buying";
import { Scene6Meetup } from "./scenes/Scene6Meetup";
import { Scene7Montage } from "./scenes/Scene7Montage";
import { Scene8CTA } from "./scenes/Scene8CTA";

// Helper: seconds → frames at 30fps
const s = (sec: number) => sec * 30;

// ─── Scene timing (total = 120 s) ─────────────────────────────────────────────
//  Scene 1 — Problem      0  → 12 s   (12 s)  snappy hook
//  Scene 2 — Reveal      12  → 22 s   (10 s)  punchy logo reveal
//  Scene 3 — Signup      22  → 40 s   (18 s)  needs animation time
//  Scene 4 — Selling     40  → 56 s   (16 s)
//  Scene 5 — Buying      56  → 72 s   (16 s)
//  Scene 6 — Meetup      72  → 84 s   (12 s)
//  Scene 7 — Montage     84  → 96 s   (12 s)
//  Scene 8 — CTA         96  → 120 s  (24 s)  logo lingers with impact

export const PeerCartVideo = () => {
  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      <Sequence from={s(0)}   durationInFrames={s(12)}><Scene1Problem /></Sequence>
      <Sequence from={s(12)}  durationInFrames={s(10)}><Scene2Reveal /></Sequence>
      <Sequence from={s(22)}  durationInFrames={s(18)}><Scene3Signup /></Sequence>
      <Sequence from={s(40)}  durationInFrames={s(16)}><Scene4Selling /></Sequence>
      <Sequence from={s(56)}  durationInFrames={s(16)}><Scene5Buying /></Sequence>
      <Sequence from={s(72)}  durationInFrames={s(12)}><Scene6Meetup /></Sequence>
      <Sequence from={s(84)}  durationInFrames={s(12)}><Scene7Montage /></Sequence>
      <Sequence from={s(96)}  durationInFrames={s(24)}><Scene8CTA /></Sequence>
    </AbsoluteFill>
  );
};
