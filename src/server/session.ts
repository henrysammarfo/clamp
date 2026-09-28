import { clearSession, getSession, updateSession } from "@tanstack/react-start/server";
import { requireSessionSecret } from "./env";

export type ClampSessionData = {
  tenantId: string;
  email: string;
  displayName: string;
};

const SESSION_NAME = "clamp_session";

function sessionConfig() {
  return {
    password: requireSessionSecret(),
    name: SESSION_NAME,
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export async function readClampSession(): Promise<ClampSessionData | null> {
  const session = await getSession<ClampSessionData>(sessionConfig());
  const data = session.data;
  if (!data.tenantId || !data.email) return null;
  return {
    tenantId: data.tenantId,
    email: data.email,
    displayName: data.displayName ?? data.email,
  };
}

export async function requireClampSession(): Promise<ClampSessionData> {
  const session = await readClampSession();
  if (!session) {
    throw new Error("Signed in session required. Open Sign in and continue.");
  }
  return session;
}

export async function createClampSession(input: {
  email: string;
  displayName?: string;
}): Promise<ClampSessionData> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid work email.");
  }
  const tenantId = `tenant_${email.replace(/[^a-z0-9]/g, "_")}`;
  const data: ClampSessionData = {
    tenantId,
    email,
    displayName: input.displayName?.trim() || email.split("@")[0] || "operator",
  };
  await updateSession<ClampSessionData>(sessionConfig(), data);
  return data;
}

export async function destroyClampSession(): Promise<void> {
  await clearSession(sessionConfig());
}
