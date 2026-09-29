import { SongNotWiredError } from "./errors";
import type { ExplainDecisionInput, SongExplainClient } from "./types";

/** Song owns Kiln explain receipts. */
export const songExplainClient: SongExplainClient = {
  async explainDecision(_input: ExplainDecisionInput) {
    throw new SongNotWiredError("Kiln explain");
  },
};
