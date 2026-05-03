import { Composition } from "remotion";
import { PeerCartVideo } from "./Video";

// 2 minutes @ 30fps = 3600 frames
const FPS = 30;
const DURATION_SECONDS = 120;

export const RemotionRoot = () => {
  return (
    <Composition
      id="PeerCart"
      component={PeerCartVideo}
      durationInFrames={DURATION_SECONDS * FPS}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
