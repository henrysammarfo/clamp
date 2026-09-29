import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClampSession, destroyClampSession, readClampSession } from "@/server/session";

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await readClampSession();
  return { session };
});

export const signInFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      displayName: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await createClampSession(data);
    return { session };
  });

export const signOutFn = createServerFn({ method: "POST" }).handler(async () => {
  await destroyClampSession();
  return { ok: true as const };
});
