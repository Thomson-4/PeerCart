import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
// Fix Chrome spawn error on Node 25 / sandboxed environments
Config.setChromiumOpenGlRenderer("angle");
Config.setChromiumHeadlessMode("new");
