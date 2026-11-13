// The three ads. Default props come from variants/<ad>.json, so the JSON files are the single source of the approved copy.
import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./brand";
import { ReplyAd, REPLY_FRAMES, replySchema } from "./ads/Reply";
import { TalDoesAd, TAL_DOES_FRAMES, talDoesSchema } from "./ads/TalDoes";
import { SilkBoardAd, SILK_BOARD_FRAMES, silkBoardSchema } from "./ads/SilkBoard";
import reply from "../variants/reply.json";
import talDoes from "../variants/tal-does.json";
import silkBoard from "../variants/silk-board.json";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="R7-Reply" component={ReplyAd} schema={replySchema} defaultProps={replySchema.parse(reply)} durationInFrames={REPLY_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="R7-TalDoes" component={TalDoesAd} schema={talDoesSchema} defaultProps={talDoesSchema.parse(talDoes)} durationInFrames={TAL_DOES_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="R7-SilkBoard" component={SilkBoardAd} schema={silkBoardSchema} defaultProps={silkBoardSchema.parse(silkBoard)} durationInFrames={SILK_BOARD_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
