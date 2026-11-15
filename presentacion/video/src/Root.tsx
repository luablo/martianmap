import { Composition } from "remotion";
import { Marswalk, MarswalkAstronaut, MarswalkAstronautSilent, MarswalkTeamVoice, TOTAL_FRAMES } from "./Video";

// 29.5 s a 30 fps: por debajo del límite de 30 s de Space Apps 2026.
// Marswalk = versión 1 (narrador). MarswalkAstronaut = versión 2 (el astronauta lo cuenta).
export const Root = () => (
  <>
    <Composition id="Marswalk" component={Marswalk} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MarswalkAstronaut" component={MarswalkAstronaut} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MarswalkAstronautSilent" component={MarswalkAstronautSilent} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MarswalkTeamVoice" component={MarswalkTeamVoice} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
