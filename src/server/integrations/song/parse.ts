import { SongNotWiredError } from "./errors";
import type { ParseRequestInput, SongParseClient } from "./types";

/** Song owns Kiln parse. Henry must not fake model output. */
export const songParseClient: SongParseClient = {
  async parseRequest(_input: ParseRequestInput) {
    throw new SongNotWiredError("Kiln parse");
  },
};
