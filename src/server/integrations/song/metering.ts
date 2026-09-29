import { SongNotWiredError } from "./errors";
import type { SongMeteringClient } from "./types";

/** Song owns token and latency metering versus the all AI baseline. */
export const songMeteringClient: SongMeteringClient = {
  async getEfficiencyMetrics(_cases: string[]) {
    throw new SongNotWiredError("Efficiency metering");
  },
};
