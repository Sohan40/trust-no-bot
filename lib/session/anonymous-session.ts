import "server-only";

import { cookies } from "next/headers";

export const anonymousSessionCookieName = "tnb_anonymous_session";

const oneYearInSeconds = 60 * 60 * 24 * 365;

type CookieValue = {
  value: string;
};

type CookieReader = {
  get(name: string): CookieValue | undefined;
};

type CookieWriter = {
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      maxAge: number;
      path: string;
    },
  ): void;
};

export function createAnonymousSessionId(): string {
  return `anon_${crypto.randomUUID()}`;
}

export function readAnonymousSessionId(cookieStore: CookieReader): string | null {
  return cookieStore.get(anonymousSessionCookieName)?.value ?? null;
}

export function writeAnonymousSessionCookie(
  cookieStore: CookieWriter,
  sessionId: string,
): void {
  cookieStore.set(anonymousSessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: oneYearInSeconds,
    path: "/",
  });
}

export async function getOrCreateAnonymousSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingSessionId = readAnonymousSessionId(cookieStore);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = createAnonymousSessionId();
  writeAnonymousSessionCookie(cookieStore, sessionId);

  return sessionId;
}
