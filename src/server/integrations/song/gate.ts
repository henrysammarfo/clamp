import { SongNotWiredError } from "./errors";
import type { EvaluateGateInput, SongGateClient } from "./types";

/** Song owns the zero inference code gate. Henry must not invent Allow or Block. */
export const songGateClient: SongGateClient = {
  async evaluateGate(_input: EvaluateGateInput) {
    throw new SongNotWiredError("Code gate");
  },
};
