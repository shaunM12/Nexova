"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEMO_CREDENTIALS,
  LOGIN_PATH,
  SESSION_COOKIE,
  SESSION_COOKIE_PATH,
  SESSION_MAX_AGE_SECONDS,
  SESSION_VALUE,
} from "./constants";
import { safeNext } from "./redirect";

export interface LoginState {
  error: string | null;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
    return { error: "Email or password is incorrect. Use the demo credentials shown below." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: SESSION_COOKIE_PATH,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: SESSION_COOKIE_PATH });
  redirect(LOGIN_PATH);
}
