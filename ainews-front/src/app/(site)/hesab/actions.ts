"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, authApi } from "@/lib/api";
import { engagementApi } from "@/lib/engagement";
import { endSession, rememberPendingEmail, startSession } from "@/lib/session";

const errorCode = (error: unknown) => (error instanceof ApiError ? error.code : "UNAVAILABLE");

export async function requestLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  let failure: string | null = null;

  try {
    await authApi.requestLink(email);
    await rememberPendingEmail(email);
  } catch (error) {
    failure = errorCode(error);
  }

  redirect(failure ? `/hesab?xeta=${failure}` : "/hesab/yoxla");
}

export async function completeRegistration(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  let failure: string | null = null;

  try {
    const session = await authApi.register({ token, firstName, lastName });
    await startSession(session.accessToken);
  } catch (error) {
    failure = errorCode(error);
  }

  if (failure === "VALIDATION") redirect(`/hesab/tamamla?token=${encodeURIComponent(token)}&xeta=${failure}`);
  redirect(failure ? `/hesab?xeta=${failure}` : "/hesab?xos-geldin=1");
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function removeSaved(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await engagementApi.unsave(articleId);
  updateTag(`news:${slug}`);
}

export async function clearHistory() {
  await engagementApi.clearHistory();
  refresh();
}
