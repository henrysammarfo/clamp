export class SongNotWiredError extends Error {
  readonly code = "SONG_NOT_WIRED" as const;

  constructor(capability: string) {
    super(
      `${capability} is owned by Song and is not wired yet. CLAMP fails closed until Song connects it.`,
    );
    this.name = "SongNotWiredError";
  }
}
