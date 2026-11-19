"use server";

import { redirect } from "next/navigation";
import { ApiError, authApi } from "@/lib/api";
import { startSession } from "@/lib/session";

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  let failure: string | null = null;

  try {
    const session = await authApi.adminLogin(email, password);
    await startSession(session.accessToken);
  } catch (error) {
    failure = error instanceof ApiError ? error.code : "UNAVAILABLE";
  }

  redirect(failure ? `/admin/giris?xeta=${failure}` : "/admin");
}
